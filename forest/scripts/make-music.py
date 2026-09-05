"""
Synthesises the music bed: a slow, low D-minor pad, a sparse high piano
figure, a breath of wind underneath, and rain that rises through the last
third. Written from scratch in numpy so the film ships with no third-party
audio.

    python3 scripts/make-music.py public/music/bed.wav [--length=24.5]
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

args = {k.lstrip('-'): v for k, v in (a.split('=') for a in sys.argv[1:] if a.startswith('--'))}
out = next((a for a in sys.argv[1:] if not a.startswith('--')), 'public/music/bed.wav')
SR = 44100
LENGTH = float(args.get('length', 24.5))
N = int(SR * LENGTH)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
mix = np.zeros(N)


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def place(tone, start):
    i = int(start * SR)
    j = min(N, i + len(tone))
    if j > i:
        mix[i:j] += tone[: j - i]


def piano(midi, start, dur, vel=1.0):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = note_hz(midi)
    env = np.exp(-tt * 1.4) * (1 - np.exp(-tt * 300))
    tone = np.zeros(n)
    for k, amp in enumerate([1.0, 0.36, 0.14, 0.06], start=1):
        tone += amp * np.sin(2 * np.pi * f * k * (1 + rng.normal(0, 0.0003)) * tt) * np.exp(-tt * 0.6 * k)
    tone += rng.normal(0, 1, n) * np.exp(-tt * 80) * 0.04
    place(tone * env * vel * 0.16, start)


def pad(midis, start, dur, vel=1.0):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / 2.6) * np.minimum(1, (dur - tt) / 3.0)
    tone = np.zeros(n)
    for m in midis:
        f = note_hz(m)
        for det in (-0.0015, 0.0, 0.0015):
            tone += np.sin(2 * np.pi * f * (1 + det) * tt + rng.uniform(0, 6.28))
        tone += 0.18 * np.sin(2 * np.pi * f * 2 * tt)
    # Slow breathing in the pad.
    tone *= 1 + 0.12 * np.sin(2 * np.pi * 0.09 * tt)
    place(tone * env * vel * 0.026, start)


# Dm  Bb  Gm  A(sus)  Dm, one chord roughly per shot.
chords = [([50, 57, 62, 65], 0.0), ([46, 53, 58, 62], 5.4), ([43, 50, 55, 58], 10.4), ([45, 52, 57, 60], 14.6), ([50, 57, 62, 65], 19.0)]
for notes, start in chords:
    pad(notes, start, 6.8)
# Low drone on D under everything.
n = N
tt = t
drone = (np.sin(2 * np.pi * note_hz(38) * tt) + 0.5 * np.sin(2 * np.pi * note_hz(38) * 2.003 * tt)) * 0.05
drone *= np.minimum(1, tt / 3) * np.clip((LENGTH - tt) / 3, 0, 1)
mix += drone

# Sparse high piano, mostly on the chord tones, never busy.
melody = [(74, 1.2, 0.8), (77, 3.4, 0.6), (74, 6.2, 0.7), (70, 8.6, 0.6), (67, 11.0, 0.7), (74, 12.8, 0.5),
          (76, 15.4, 0.7), (72, 17.2, 0.5), (74, 19.6, 0.8), (81, 21.4, 0.5), (77, 22.6, 0.6)]
for m, s, v in melody:
    if s < LENGTH - 1:
        piano(m, s, 5.0, v)

# Wind: brown noise, low-passed, slowly swelling.
brown = np.cumsum(rng.normal(0, 1, N))
brown -= np.convolve(brown, np.ones(4001) / 4001, mode='same')
brown /= np.max(np.abs(brown)) + 1e-9
sos = butter(2, 500, btype='low', fs=SR, output='sos')
wind = sosfilt(sos, brown) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.06 * t + 1.0)) * 0.05
mix += wind

# Rain: high-passed white noise, fading in over the last third.
rain_start = LENGTH * 0.66
sos = butter(3, [1800, 9000], btype='band', fs=SR, output='sos')
rain = sosfilt(sos, rng.normal(0, 1, N))
rain *= np.clip((t - rain_start) / 2.5, 0, 1) * 0.035
mix += rain

# Simple reverb: decaying echoes, then a gentle low-pass.
rev = np.copy(mix)
for delay_s, gain in [(0.029, 0.32), (0.053, 0.26), (0.083, 0.2), (0.127, 0.14), (0.197, 0.09), (0.281, 0.06)]:
    d = int(delay_s * SR)
    rev[d:] += mix[:-d] * gain
sos = butter(2, 7000, btype='low', fs=SR, output='sos')
rev = sosfilt(sos, rev)

rev *= np.minimum(1, t / 1.2) * np.clip((LENGTH - t) / 2.0, 0, 1)
rev /= np.max(np.abs(rev)) + 1e-9
rev *= 0.8
left = rev
right = np.roll(rev, int(0.0008 * SR)) * 0.97 + rev * 0.03
wavfile.write(out, SR, (np.stack([left, right], axis=1) * 32767).astype(np.int16))
print('wrote', out, f'{LENGTH}s')
