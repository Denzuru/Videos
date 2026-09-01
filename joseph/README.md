# Joseph and the Amazing Coat

An animated Joseph story for young children, built with
[Revideo](https://re.video/). About four minutes, 1920x1080, 30fps.

Same bright, fast treatment as the Noah film: saturated colour, chunky outlined
type, overshoot on every entrance, confetti and comic-book word slams. A
narrator reads the whole story over a ducked music bed, and every line is
captioned in time with the voice.

## The story

| # | Scene | What happens |
|---|-------|--------------|
| 1 | `01-title` | Title card, Joseph in the coat |
| 2 | `02-favourite` | Eleven brothers, one favourite, and a coat of many colours |
| 3 | `03-dreams` | The sheaves bow, then the sun, moon and eleven stars |
| 4 | `04-the-pit` | The coat is taken, Joseph goes into the well and is sold |
| 5 | `05-potiphar` | He works hard in Egypt, is lied about, and the cell drops |
| 6 | `06-prison` | He keeps helping, reads two dreams, and is forgotten for two years |
| 7 | `07-pharaohs-dream` | Seven fat cows, seven thin ones, and nobody who can explain it |
| 8 | `08-second-in-egypt` | The ring, the throne, and seven years of filling storehouses |
| 9 | `09-the-brothers-come` | They bow without knowing him, exactly like the sheaves |
| 10 | `10-i-am-joseph` | The room clears, he weeps, and he forgives |
| 11 | `11-reunion` | Jacob gets his son back, and the closing card |

The hard parts are told honestly but gently. Joseph is thrown into a well and
sold by his brothers; in Egypt "somebody told a lie about him" and he goes to
prison, which is as far into that episode as a young child needs. The spine of
the film is the line the ending lands on: he was in the well, the prison and on
the throne, and God was with him in all three.

## Running it

```bash
npm install
npm run voiceover   # cut the recordings into scene tracks (needed once)
npm start           # Revideo editor at http://localhost:9000
npm run render      # narrated film with music, to josephs-amazing-coat.mp4
```

`npm run render` is two steps: render the film with its narration, then lay the
music under it. Either can be run alone:

```bash
node scripts/render.mjs --workers=4 --out=silent.mp4
node scripts/mix-music.mjs silent.mp4 final.mp4 --switch=136
```

## Sound

Each scene is recorded as one file in `vo/raw/`, and `npm run voiceover` finds
the pauses between sentences and writes `src/narration.json` - the start and
end of every line inside its scene's track. A scene plays that one track and
holds each caption for exactly as long as its line runs.

Finding the pauses is not a loudness threshold: in a line of short sentences
the gaps between them are as long as the gaps between lines, so every pause is
a candidate and a short dynamic program picks the set that both falls on long
pauses and lands where each line is expected to end, estimated from the text.

**Revideo renders only the first Audio node a scene adds**, silently dropping
the rest. Hence one track per scene rather than one clip per line, and hence
the music being mixed in afterwards, where it can also be ducked under the
voice with a sidechain compressor. Two tracks are crossfaded: warm storytelling
until Joseph is brought before the king, then noble-into-tender for his rise
and the reunion.

## Cast and props

Everyone is the same `Person` component, drawn standing on y = 0 and facing
forward, with the differences as props: a beard, a nemes headdress, the coat.
That keeps eleven brothers cheap to draw and easy to tell apart, since only
their robe colour changes. The coat is stripes clipped to the robe shape with
`source-in` compositing. `Cow` takes a `thin` prop, which is the whole of
Pharaoh's dream.

## Layout

```
src/
  project.ts             scene order and render settings
  theme.ts               palette, coat stripes, type styles
  narration-lines.ts     every spoken line, the source of truth
  narration.json         line timings, written by npm run voiceover
  components/
    world.tsx            sky, sun, dunes, pyramids, palms, Nile, sheaves, sacks
    figures.tsx          Person and everyone built from it, plus cows and camels
    narration.tsx        caption line, the narrator, comic word slam
  scenes/                one file per scene, in story order
scripts/render.mjs       render driver
scripts/mix-music.mjs    lays the ducked music bed under a rendered film
scripts/build-voiceover.mjs  cuts recordings into scene tracks + line timings
scripts/ffmpeg-hq.sh     injects encoder quality settings Revideo does not expose
vo/raw/                  the narration recordings, one per scene
public/music/            the two music tracks
public/vo/               scene tracks, rebuilt by npm run voiceover
```

## Things that will bite you

**Revideo defaults to a wasm encoder** that runs in the browser at a fixed low
bitrate, which leaves ringing around the hard edges of flat cartoon art and
makes outlined text look like wet ink. `scripts/render.mjs` switches to the
ffmpeg exporter and `scripts/ffmpeg-hq.sh` forces `-crf 15 -tune animation`.

**Zero-duration setters are not generators.** `node.position.y(-600)` sets a
value and returns the node; only `node.position.y(-600, 0.5)` can go inside
`chain()`.

**`children()` returns direct children only**, and JSX flattens children just
one level - a nested `map` inside a `map` is dropped silently. Use `flatMap`.

**Asset paths resolve against `<outDir>/../public`**, so the render output
folder has to sit one level inside the project or the film comes out silent.

## Changing the words

Every spoken line lives in `src/narration-lines.ts`, and a scene says it with
`speak('the same words')`. The words are the lookup key, so editing a caption
without re-recording throws at render time instead of going quietly out of sync.

To change a line: edit it in `narration-lines.ts` and in its scene, re-record
that scene's `vo/raw/<scene>.mp3`, then run `npm run voiceover`. Timings follow
automatically.
