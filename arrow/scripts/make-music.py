"""
Synthesises the music bed for the film: a slow, sparse felt-piano figure over
a soft pad, with a rising whoosh timed to the arrow's release. Written from
scratch in numpy so the film ships with no third-party audio.

    python3 scripts/make-music.py public/music/bed.wav [--release=8.2] [--length=18.5]
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

args = {k.lstrip('-'): v for k, v in (a.split('=') for a in sys.argv[1:] if a.startswith('--'))}
out = next((a for a in sys.argv[1:] if not a.startswith('--')), 'public/music/bed.wav')
SR = 44100
LENGTH = float(args.get('length', 18.5))
RELEASE = float(args.get('release', 8.2))
N = int(SR * LENGTH)
t = np.arange(N) / SR
rng = np.random.default_rng(3)


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def piano(midi, start, dur, vel=1.0):
    """A soft felt-piano tone: a few decaying harmonics, slightly detuned."""
    n = int(SR * dur)
    if n <= 0:
        return
    tt = np.arange(n) / SR
    f = note_hz(midi)
    env = np.exp(-tt * 1.9) * (1 - np.exp(-tt * 400))
    tone = np.zeros(n)
    for k, amp in enumerate([1.0, 0.42, 0.18, 0.08, 0.035], start=1):
        detune = 1 + rng.normal(0, 0.0004)
        tone += amp * np.sin(2 * np.pi * f * k * detune * tt) * np.exp(-tt * 0.7 * k)
    # A little hammer noise on the attack.
    tone += rng.normal(0, 1, n) * np.exp(-tt * 90) * 0.06
    tone *= env * vel * 0.22
    i = int(start * SR)
    j = min(N, i + n)
    mix[i:j] += tone[: j - i]


def pad(midis, start, dur, vel=1.0):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.8) * np.minimum(1, (dur - tt) / 2.2)
    tone = np.zeros(n)
    for m in midis:
        f = note_hz(m)
        for det in (-0.0012, 0.0, 0.0012):
            tone += np.sin(2 * np.pi * f * (1 + det) * tt + rng.uniform(0, 6.28))
        tone += 0.25 * np.sin(2 * np.pi * f * 2 * tt)
    tone *= env * vel * 0.028
    i = int(start * SR)
    j = min(N, i + n)
    mix[i:j] += tone[: j - i]


mix = np.zeros(N)

# Chords: Am  F  C  G  in the low-mid register, one per 4 seconds.
chords = [
    ([57, 60, 64], 0.0),
    ([53, 57, 60], 4.2),
    ([48, 55, 60, 64], 8.4),
    ([55, 59, 62], 12.6),
]
for notes, start in chords:
    pad(notes, start, 5.2)
pad([57, 60, 64, 69], 16.2, LENGTH - 16.2 + 0.5)

# Sparse melody, one note every so often, sitting above the pad.
melody = [
    (69, 0.4, 1.0), (72, 1.4, 0.8), (76, 2.6, 1.0),
    (72, 4.4, 0.9), (69, 5.6, 0.8), (65, 6.6, 0.9),
    (64, 8.6, 1.0), (67, 9.4, 0.9), (72, 10.4, 1.0), (76, 11.6, 0.9),
    (74, 12.8, 0.9), (71, 13.8, 0.8), (67, 14.6, 0.9),
    (69, 16.3, 1.1), (76, 17.0, 0.9),
]
for m, s, v in melody:
    piano(m, s, 4.0, v)
# Low root notes.
for m, s in [(45, 0.0), (41, 4.2), (36, 8.4), (43, 12.6), (45, 16.2)]:
    piano(m, s, 5.0, 0.7)

# Whoosh at the release: band-passed noise whose centre sweeps up, shaped by a
# fast-attack envelope, plus a soft thud for the string.
wn = int(SR * 1.6)
wt = np.arange(wn) / SR
noise = rng.normal(0, 1, wn)
whoosh = np.zeros(wn)
for seg in range(16):
    a, b = int(seg * wn / 16), int((seg + 1) * wn / 16)
    centre = 400 * (1 + 7 * (seg / 16) ** 1.4)
    sos = butter(2, [centre * 0.7, min(centre * 1.4, SR / 2 - 100)], btype='band', fs=SR, output='sos')
    whoosh[a:b] = sosfilt(sos, noise)[a:b]
wenv = np.exp(-((wt - 0.18) ** 2) / 0.012) * 0.5 + np.exp(-wt * 2.4) * (1 - np.exp(-wt * 60)) * 0.8
whoosh *= wenv * 0.42
i = int((RELEASE - 0.12) * SR)
mix[i:i + wn] += whoosh[: N - i]
thud_n = int(SR * 0.4)
tt = np.arange(thud_n) / SR
thud = np.sin(2 * np.pi * 70 * tt * np.exp(-tt * 3)) * np.exp(-tt * 14) * 0.5
i = int(RELEASE * SR)
mix[i:i + thud_n] += thud

# Simple reverb: a handful of decaying, feedback-free echoes.
rev = np.copy(mix)
for delay, gain in [(0.031, 0.35), (0.047, 0.28), (0.071, 0.22), (0.113, 0.16), (0.181, 0.1), (0.263, 0.07)]:
    d = int(delay * SR)
    rev[d:] += mix[:-d] * gain
sos = butter(2, 6500, btype='low', fs=SR, output='sos')
rev = sosfilt(sos, rev)

# Fade in and out, normalise, write stereo with a slight width.
fade_in = np.minimum(1, t / 0.8)
fade_out = np.clip((LENGTH - t) / 1.6, 0, 1)
rev *= fade_in * fade_out
rev /= np.max(np.abs(rev)) + 1e-9
rev *= 0.85
left = rev
right = np.roll(rev, int(0.0007 * SR)) * 0.98 + rev * 0.02
stereo = np.stack([left, right], axis=1)
wavfile.write(out, SR, (stereo * 32767).astype(np.int16))
print('wrote', out, f'{LENGTH}s')
