# The Greatest Story — the gospel, explained to a child

An animated short film built with [Motion Canvas](https://motioncanvas.io/).
About three minutes, 1920x1080, 30fps, no narration audio — every line is on
screen so a parent, teacher or older sibling can read it aloud at the child's
own pace.

## The story

| # | Scene | What it says |
|---|-------|--------------|
| 1 | `01-title` | Title card under a night sky |
| 2 | `02-creation` | God made everything, and He made you on purpose |
| 3 | `03-broken` | We all chose our own way; the Bible calls that sin |
| 4 | `04-the-gap` | Being good enough was never going to close the gap |
| 5 | `05-he-came` | God did not wait for us to climb up. He came down |
| 6 | `06-the-cross` | Jesus was not losing, He was choosing; the cross becomes the bridge |
| 7 | `07-alive` | The stone rolls away, and death loses |
| 8 | `08-come-home` | The invitation, a simple prayer, and John 3:16 |

The writing is deliberately plain: short sentences, no church words left
unexplained, nothing frightening. Jesus is drawn as a figure of warm light
rather than a face, and the child is a few circles and rounded rectangles so
that any child watching can see themselves in it.

## Running it

```bash
npm install
npm run serve     # Motion Canvas editor at http://localhost:9000
npm run render    # headless render straight to gospel-for-a-child.mp4
```

`npm run render` needs `ffmpeg` on the PATH and a Chromium for Playwright. It
starts Vite in-process, drives a headless browser through `render.html`, and
encodes the frames as it goes:

```bash
node scripts/render.mjs --fps=30 --chunk=20 --out=my-video.mp4
node scripts/render.mjs --limit=8 --out=preview.mp4   # first 8 seconds only
```

Frames are rendered in chunks and each chunk is encoded and deleted before the
next one starts, so a three minute 1080p film never needs the whole PNG
sequence on disk at once.

## Layout

```
src/
  project.ts            scene order
  theme.ts              palette, type styles, glow helper
  render.ts             headless render entry point
  components/
    figures.tsx         child, cross, heart, moon, sparkle, starfield, glow
    narration.tsx       caption line, read-aloud helper, gradient backdrop
  scenes/               one file per scene, in story order
scripts/render.mjs      Vite + Playwright + ffmpeg render driver
```

## Changing the words

Every spoken line lives in a `say(caption(), '...', seconds)` call inside its
scene. The last argument is reading time in seconds, on top of the fade in and
out — raise it for younger children, lower it for older ones.
