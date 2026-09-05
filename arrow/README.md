# Pulled Back

A short vertical reel in the style of the hand-drawn motivational clips that do
the rounds on Pinterest and Instagram: a pencil-sketch bow and arrow on paper,
a handwritten line per beat, the string draws back, the arrow flies. Built
with [Revideo](https://re.video/). About 22 seconds, 1080x1920, 30fps.

Everything in it is generated: the bow and arrow are SVG paths, the paper
texture and the music bed are synthesised by two small Python scripts, and the
captions are set in Caveat. There are no downloaded assets.

## The beats

| Time | On screen | What happens |
|------|-----------|--------------|
| 0s | AN ARROW | The bow's line work draws itself onto the page |
| 2.5s | CAN ONLY FLY AS FAR / AS IT IS PULLED BACK. | The string draws back, the limbs bend, the arrow slides with the nock |
| 6.5s | | Full draw, a slight tremble in the string, the camera pushes in on the grip |
| 7.75s | | Release: the string snaps, the bow falls out of frame, speed lines rush past |
| 8.5s | SO IF LIFE / IS DRAGGING YOU / BACKWARDS... | Captions run along the shaft while the arrow climbs |
| 12s | HOLD STEADY. / YOU ARE NOT / FALLING BEHIND. | The whole frame tilts as the arrow arcs |
| 18s | YOU ARE BEING AIMED. | Held, then the page fades |

The words are original, written for this film rather than copied from the
clips it is modelled on.

## Running it

```bash
npm install
npm run paper       # regenerate public/paper.png (only if you change the script)
npm start           # Revideo editor at http://localhost:9000
npm run render      # renders, then lays the music under it: pulled-back.mp4
```

`npm run render` is two steps and either can be run alone:

```bash
node scripts/render.mjs --out=silent.mp4 --workers=4
node scripts/add-music.mjs silent.mp4 pulled-back.mp4 --release=7.75
```

The renderer uses Puppeteer's own Chrome and the ffmpeg that Revideo bundles,
so nothing needs to be on the PATH. `scripts/ffmpeg-hq.sh` wraps that ffmpeg to
raise the x264 quality on the one call that encodes the frames, which keeps the
pencil lines crisp.

## Sound

`scripts/make-music.py` synthesises the bed in numpy: a slow four-chord pad,
a sparse felt-piano figure, a band-swept noise whoosh timed to the release and
a soft thud for the string, then a handful of decaying echoes as reverb.
`add-music.mjs` probes the finished render's length and generates the bed to
match, so the fade-out always lands with the picture. `--release` must agree
with `RELEASE_AT` in `src/scenes/arrow.tsx` if the timings are changed.

## Layout

```
src/
  project.ts              one scene, 1080x1920 at 30fps
  theme.ts                greys, the pencil stroke, the handwriting style, a seeded PRNG
  components/sketch.tsx   Bow (parametric limbs, string, grip), Arrow, flecks, speed lines
  scenes/arrow.tsx        the whole film, top to bottom
scripts/
  render.mjs              Revideo headless render
  add-music.mjs           generate the bed to length and mux it in
  make-music.py           the score
  make-paper.py           the paper texture
  ffmpeg-hq.sh            quality wrapper around the bundled ffmpeg
public/
  paper.png               generated
  music/bed.wav           generated
```

## Changing the words

Every caption is one call in `src/scenes/arrow.tsx`: `top('...', hold)` for
the upright lines over the bow and `flight('...', hold)` for the lines that
run along the arrow. The hold is in seconds, on top of the fade in and out.
The bow's shape at any draw is `limbPath()` in `components/sketch.tsx`, and
`draw` runs from 0 (resting) to 1 (full draw).
