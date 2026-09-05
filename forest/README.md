# Quiet Growth

A short vertical reel in the style of the illustrated "whisper" quote clips on
Instagram and Pinterest: five painterly scenes, each with a slow camera move
and a weather layer, one handwritten line per beat, a dark ambient score.
Built with [Revideo](https://re.video/). About 25 seconds, 1080x1920, 30fps.

The illustrations were generated on OpenArt (see `public/art/SOURCES.md`).
Everything else is code: the camera moves, the dust, leaves, stars, fog and
rain are Revideo nodes, the captions are set in Kalam, and the music bed is
synthesised by `scripts/make-music.py`.

## The beats

| Shot | Art | Weather | Lines |
|------|-----|---------|-------|
| 1 | Redwood grove, warm light | drifting dust motes | A falling tree / is heard for miles. |
| 2 | Moonlit forest, white stag | falling golden leaves | A growing tree / is heard by no one. |
| 3 | Figure on a rock under stars | twinkling stars | So grow anyway. |
| 4 | Misty winter forest, a walker | drifting fog | Nobody has to clap for it to count. |
| 5 | Rainforest in the rain | rain streaks | Loud was never the proof. / Deep is. |

The words are original, written for this film rather than copied from the
clips it is modelled on.

## Running it

```bash
npm install
scripts/fetch-art.sh   # pull the five illustrations into public/art
npm start              # Revideo editor at http://localhost:9000
npm run render         # renders, then lays the music under it: quiet-growth.mp4
```

If the artwork has not been fetched, `npm run placeholders` writes procedural
stand-ins with the right names so the film still renders end to end.

`npm run render` is two steps and either can be run alone:

```bash
node scripts/render.mjs --out=silent.mp4 --workers=4
node scripts/add-music.mjs silent.mp4 quiet-growth.mp4
```

The renderer uses Puppeteer's own Chrome and the ffmpeg that Revideo bundles,
so nothing needs to be on the PATH.

## Layout

```
src/
  project.ts              one scene, 1080x1920 at 30fps
  shots.ts                the film as data: art, duration, zoom, drift, weather, captions
  theme.ts                caption style and a seeded PRNG
  components/weather.tsx  motes, leaves, stars, mist, rain
  scenes/forest.tsx       plays the shot list: camera, crossfades, captions, fade to black
scripts/
  render.mjs              Revideo headless render
  add-music.mjs           generate the bed to length and mux it in
  make-music.py           the score: D minor pad, sparse piano, wind, rain
  make-placeholders.py    stand-in art
  fetch-art.sh            download the real art from OpenArt
  ffmpeg-hq.sh            quality wrapper around the bundled ffmpeg
public/art/               the five illustrations (plus SOURCES.md)
```

## Changing the film

Everything editorial is in `src/shots.ts`: swap an image, change a line, move
a caption, pick a different weather layer, or re-time a shot, and re-render.
A new shot is one more entry in the list.
