# Noah's Big Boat

An animated Noah's ark story for young children, built with
[Revideo](https://re.video/). About three and a half minutes, 1920x1080, 30fps.

Bright, fast and loud on purpose: saturated colour, chunky outlined type,
overshoot on every pop-in, confetti bursts, comic-book word slams and a marching
animal parade. A narrator reads the whole story over a ducked music bed, and
every line is captioned in time with the voice.

## The story

| # | Scene | What happens |
|---|-------|--------------|
| 1 | `01-title` | Title card, sun, bobbing ark |
| 2 | `02-long-ago` | The world forgets how to be kind; one man still listens |
| 3 | `03-build-a-boat` | God's plan, drawn as a blueprint, with size facts |
| 4 | `04-building` | Planks slam in, the ark grows, people laugh, Noah keeps going |
| 5 | `05-two-by-two` | The parade: seven labelled pairs march in and climb the ramp |
| 6 | `06-the-door` | Everyone aboard, and God shuts the door Himself |
| 7 | `07-rain` | Forty days, forty nights, the water rises, the boat floats |
| 8 | `08-the-dove` | The dove goes out twice and comes back with a leaf; land |
| 9 | `09-rainbow` | The promise, six arcs sweeping in, and the closing card |

## Running it

```bash
npm install
npm run voiceover   # cut the recordings into scene tracks (needed once)
npm start           # Revideo editor at http://localhost:9000
npm run render      # narrated film with music, to noahs-big-boat.mp4
```

`npm run render` is two steps: render the film with its narration, then lay the
music under it. Either can be run alone:

```bash
node scripts/render.mjs --workers=4 --out=silent.mp4
node scripts/mix-music.mjs silent.mp4 final.mp4 --switch=115
```

Revideo splits the timeline across several headless Chrome instances and
encodes through WebCodecs, so the whole film renders in about 75 seconds on
four cores.

**The renderer needs Puppeteer's own Chrome, not Playwright's Chromium.** The
Playwright build ships without the H.264 encoder, and the render fails with
"Encoder creation error". `scripts/render.mjs` deliberately leaves
`executablePath` unset so Puppeteer picks its own download.

## Sound

The narration is recorded a scene at a time, not a line at a time. Each
recording is one file in `vo/raw/`, and `npm run voiceover` finds the pauses
between sentences and writes `src/narration.json` - the start and end of every
line inside its scene's track. A scene then plays that one track and holds each
caption for exactly as long as its line runs.

Finding the pauses is not just a loudness threshold. In a line like "Thump.
Flap. Squeak. Roar." the gaps between words are as long as the gaps between
sentences, so every pause is a candidate and a short dynamic program picks the
set that both falls on long pauses and lands where each line is expected to end,
estimated from the text. Sentence breaks count as roughly six characters' worth
of time, which is what makes the staccato lines come out right.

The music is mixed in afterwards rather than played from a scene, and is ducked
under the voice with a sidechain compressor. Two tracks are crossfaded: playful
storybook until the storm, then stormy-to-triumphant for the rest.

**Revideo renders only the first Audio node a scene adds.** Later ones are
dropped without an error. That is why there is one track per scene rather than
one clip per line, and why the music goes on in post.

## Layout

```
src/
  project.ts             scene order and render settings
  theme.ts               palette, rainbow bands, type styles
  components/
    world.tsx            sky, sun, clouds, hills, water, rain, confetti, rainbow
    creatures.tsx        Noah and seven animals, each standing on y = 0
    ark.tsx              the ark, origin at the waterline, door exposed by ref
    narration.tsx        caption line, read-aloud helper, comic word slam
  scenes/                one file per scene, in story order
scripts/render.mjs       render driver
scripts/mix-music.mjs    lays the ducked music bed under a rendered film
scripts/build-voiceover.mjs  cuts recordings into scene tracks + line timings
scripts/ffmpeg-hq.sh     injects encoder quality settings Revideo does not expose
vo/raw/                  the narration recordings, one per scene
public/music/            the two music tracks
public/vo/               scene tracks, rebuilt by npm run voiceover
```

## Why the encoder is overridden

Revideo defaults to a wasm exporter that encodes in the browser through
mp4-wasm at a fixed, low bitrate. On flat cartoon art that leaves ringing
around every hard edge, which reads as a wet-ink halo on the outlined text.
`scripts/render.mjs` switches to the ffmpeg exporter, which streams lossless
PNG frames out to ffmpeg, and `scripts/ffmpeg-hq.sh` wraps ffmpeg to add
`-crf 15 -preset medium -tune animation` to the one call that encodes the
visuals. Revideo exposes no way to set these, hence the wrapper. The render is
slower this way, and worth it.

Two smaller things help the same problem: `lineJoin: 'round'` on stroked text,
so outlines do not grow spikes where a letter turns a corner, and a thinner
outline on the narration type so the counters in letters like a and e stay open.

## Two things that will bite you

**Zero-duration setters are not generators.** `node.position.y(-600)` sets a
value and returns the node; `node.position.y(-600, 0.5)` returns a tween. Only
the second can go inside `chain()`. Passing the first gives
"generator is not a function". Snap-backs belong in a generator body:

```ts
yield loop(Infinity, function* () {
  rain().position.y(-600);
  yield* rain().position.y(600, 0.5, linear);
});
```

**`children()` returns direct children only.** Putting a ref on a wrapper
around a component and then calling `children()` gets you the component's own
root node, not the parts inside it. Put the ref on the component itself.

**Asset paths resolve against `<outDir>/../public`.** Render into a folder one
level inside the project, or every `/vo/...` clip resolves outside it and the
film comes out silent with no error.

## Changing the words

Every spoken line lives in `src/narration-lines.ts`, and a scene says it with
`speak('the same words')`. The words are the lookup key, so editing a caption
without re-recording throws at render time instead of quietly going out of sync
with the voice.

To change what the narrator says: edit the line in `narration-lines.ts` and in
its scene, re-record that scene's `vo/raw/<scene>.mp3`, then run
`npm run voiceover`. Timings follow automatically - nothing else to adjust.

`punch(word(), 'BONK!', ...)` is the big comic-book slam. These are spawned with
a bare `yield` rather than awaited, so they land over the narration instead of
pushing it back.
