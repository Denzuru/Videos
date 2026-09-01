# Noah's Big Boat

An animated Noah's ark story for young children, built with
[Revideo](https://re.video/). About three and a half minutes, 1920x1080, 30fps.

Bright, fast and loud on purpose: saturated colour, chunky outlined type,
overshoot on every pop-in, confetti bursts, comic-book word slams and a marching
animal parade. Every line is on screen so an adult can read it aloud.

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
npm start        # Revideo editor at http://localhost:9000
npm run render   # straight to noahs-big-boat.mp4
```

```bash
node scripts/render.mjs --workers=4 --out=my-video.mp4
```

Revideo splits the timeline across several headless Chrome instances and
encodes through WebCodecs, so the whole film renders in about 75 seconds on
four cores.

**The renderer needs Puppeteer's own Chrome, not Playwright's Chromium.** The
Playwright build ships without the H.264 encoder, and the render fails with
"Encoder creation error". `scripts/render.mjs` deliberately leaves
`executablePath` unset so Puppeteer picks its own download.

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
```

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

## Changing the words

Every line is a `say(caption(), '...', seconds)` call in its scene. The last
argument is reading time on top of the fade in and out. Raise it for younger
children. `punch(word(), 'BONK!', ...)` is the big comic-book slam.
