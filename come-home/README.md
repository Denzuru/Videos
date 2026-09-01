# Come Home

A vertical short film of the gospel, made for the feed. 1080x1920, 30fps, about
two minutes and twenty seconds, narrated over a ducked music bed with every line
captioned in time with the voice.

It is built with [Revideo](https://re.video/), the same pipeline as the Noah and
Joseph films in this repository, but it is not a cartoon: the picture is ten
photographic plates, graded and pushed in on, and the only drawing on screen is
type.

## The argument

The film is one argument in eight beats, and it is built to survive a thumb.

| # | Scene | What it does |
|---|-------|--------------|
| 1 | `01-weight` | Describes the viewer to themselves before it asks for anything |
| 2 | `02-running` | The noise we use to keep the question quiet, ending on the question |
| 3 | `03-the-gap` | Names sin, and defends it as distance rather than shame |
| 4 | `04-the-cross` | The turn: God did not lower the standard, He paid it |
| 5 | `05-alive` | The empty tomb, as a receipt rather than a metaphor |
| 6 | `06-the-offer` | Grace by subtraction: three things it is not, then "just come" |
| 7 | `07-the-promise` | Romans 10:9, quoted rather than paraphrased |
| 8 | `08-come-home` | A prayer that stays on screen long enough to be prayed |

Two deliberate choices sit under all of it. Nothing is scared into anybody: the
threat material is the honest description of carrying your own record, and no
further. And the prayer in the last scene is built one line at a time and then
held whole, because a prayer that flashes past a line at a time is a prayer
nobody in the world can actually say along with it.

The film is graded cold until the cross and warm from the flash on "He paid it"
onwards, and the music hands over at the same moment. That is the whole visual
thesis, and nothing else in the film is allowed to compete with it.

## Running it

```bash
npm install
npm run voiceover   # cut the recordings into scene tracks (needed once)
npm start           # Revideo editor at http://localhost:9000
npm run render      # narrated film with music, to come-home.mp4
```

`npm run render` is two steps, and either can be run alone:

```bash
node scripts/render.mjs --workers=4 --out=silent.mp4
node scripts/mix-music.mjs silent.mp4 final.mp4 --switch=47
```

`--switch` is where the aching first track hands over to the one that lifts. It
wants to land on the cross: 47 seconds, with a four second crossfade, puts the
lift under "He paid it".

## Where the assets came from

Everything in `public/` and `vo/raw/` was generated, so the film carries no
licensing questions with it.

- **Voice** - vidIQ voiceover, one recording per scene, the "Brian" voice.
  Recording a whole scene at a time is cheaper and keeps the delivery from
  resetting between sentences.
- **Music** - two vidIQ tracks: `weight.wav`, a slow unresolved cello and felt
  piano bed, and `risen.wav`, which builds to a choir and settles into strings.
- **Plates** - ten cinematic stills generated 9:16, upscaled to 1350x2400 with
  lanczos and a light unsharp pass. They are 25% larger than the frame on
  purpose, which is the slack the camera pushes and drifts into.

## Sound

Each scene is recorded as one file in `vo/raw/`, and `npm run voiceover` finds
the pauses between sentences and writes `src/narration.json`: the start and end
of every line inside its scene's track. A scene plays that one track and holds
each caption for exactly as long as its line runs.

Finding the pauses is not a loudness threshold. In a line of short sentences the
gaps between them are as long as the gaps between lines, so every pause is a
candidate and a short dynamic program picks the set that both falls on long
pauses and lands where each line is expected to end, estimated from the text.

**Revideo renders only the first Audio node a scene adds**, silently dropping
the rest. Hence one track per scene rather than one clip per line, and hence the
music being mixed in afterwards, where it can also be ducked under the voice
with a sidechain compressor.

## The look

`components/plate.tsx` is the whole visual language. Every shot is one plate
under three layers: a colour wash that grades it into its half of the story, a
vignette, and a scrim along the bottom that the caption sits on. The scrim is
not decoration - without it a white caption vanishes the moment the plate is a
sunrise.

`drift()` runs the push-in for the length of a scene. The movement is small on
purpose. It only has to be enough that a still photograph stops reading as a
still photograph.

Captions float up; the slams snap in oversized and settle. Both are `speak()` in
`components/narration.tsx`, so a slam is timed to the voice like any other line
rather than guessed at.

## Layout

```
src/
  project.ts             scene order and render settings
  theme.ts               palette and the four type styles
  narration-lines.ts     every spoken line, the source of truth
  narration.json         line timings, written by npm run voiceover
  components/
    plate.tsx            the photographic plate, its grade, drift and flash
    narration.tsx        the narrator, captions, slams, verse and label type
  scenes/                one file per beat, in order
scripts/render.mjs       render driver
scripts/mix-music.mjs    lays the ducked music bed under a rendered film
scripts/build-voiceover.mjs  cuts recordings into scene tracks + line timings
scripts/ffmpeg-hq.sh     injects encoder settings Revideo does not expose
vo/raw/                  the narration recordings, one per scene
public/img/              the ten plates
public/music/            the two music beds
public/vo/               scene tracks, rebuilt by npm run voiceover
```

## Things that will bite you

**Revideo defaults to a wasm encoder** that runs in the browser at a fixed low
bitrate. `scripts/render.mjs` switches to the ffmpeg exporter and
`scripts/ffmpeg-hq.sh` forces `-crf 17 -tune film`, which is the right tune for
photographic plates: it keeps grain and stops the sky gradients banding.

**Asset paths resolve against `<outDir>/../public`**, so the render output
folder has to sit one level inside the project or the film comes out silent.

**Zero-duration setters are not generators.** `node.opacity(0)` sets a value and
returns the node; only `node.opacity(0, 0.5)` can be yielded.

**Captions re-wrap.** The line breaks in a `speak()` call are hints, not law:
`textWrap` with a fixed width will re-flow a long line regardless. Write the
copy short rather than fighting it.

## Changing the words

Every spoken line lives in `src/narration-lines.ts`, and its scene captions the
same words. To change a line: edit it there and in its scene, re-record that
scene's `vo/raw/<scene>.mp3`, then run `npm run voiceover`. Timings follow
automatically.

Splitting one line into two needs no new recording, only a re-run: the splitter
will find the pause that was always in the take. That is how "The Bible has a
word for it." and "Sin." became two lines, so the slam could land on the word
instead of after it.
