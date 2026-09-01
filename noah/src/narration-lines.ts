/**
 * Every spoken line in the film, in order, and the single source of truth for
 * both the on-screen caption and the recorded narration.
 *
 * scripts/build-voiceover.mjs cuts the recorded scene tracks into one clip per
 * line using these ids, and writes the measured durations to narration.json.
 * A scene then holds each caption for exactly as long as its clip runs, so the
 * words on screen and the words in the voice never drift apart.
 */
export const narrationLines = {
  longAgo: [
    {id: 'longAgo-00', text: 'A long, long time ago, the world was full of people.'},
    {id: 'longAgo-01', text: 'God made every single one of them.'},
    {id: 'longAgo-02', text: 'But they forgot how to be kind.'},
    {id: 'longAgo-03', text: 'They were mean, and they would not stop.'},
    {id: 'longAgo-04', text: 'And it made God very, very sad.'},
    {id: 'longAgo-05', text: 'But there was one man who still listened.'},
    {id: 'longAgo-06', text: 'Noah loved God, and God loved Noah.'},
  ],
  buildABoat: [
    {id: 'buildABoat-00', text: 'One day, God said something surprising.'},
    {id: 'buildABoat-01', text: 'A big flood was coming, and everyone needed rescuing.'},
    {id: 'buildABoat-02', text: 'So God gave Noah a plan.'},
    {id: 'buildABoat-03', text: 'Not a little rowing boat. An enormous one.'},
    {id: 'buildABoat-04', text: 'Big enough for Noah, his family, and the animals.'},
    {id: 'buildABoat-05', text: 'Every single kind of animal.'},
  ],
  building: [
    {id: 'building-00', text: 'So Noah picked up his hammer.'},
    {id: 'building-01', text: 'Bang. Tap. Saw. Bang.'},
    {id: 'building-02', text: 'And slowly, a boat began to grow.'},
    {id: 'building-03', text: 'It took Noah years and years and years.'},
    {id: 'building-04', text: 'People walked past and laughed at him.'},
    {id: 'building-05', text: '"A boat? Out here? There is no water!"'},
    {id: 'building-06', text: 'But Noah trusted God more than he minded the laughing.'},
    {id: 'building-07', text: 'So he kept building. Every single day.'},
  ],
  twoByTwo: [
    {id: 'twoByTwo-00', text: 'And then, one morning, Noah heard a sound.'},
    {id: 'twoByTwo-01', text: 'Thump. Flap. Squeak. Roar.'},
    {id: 'twoByTwo-02', text: 'They came from everywhere, all by themselves.'},
    {id: 'twoByTwo-03', text: 'Two elephants. Two giraffes. Two lions.'},
    {id: 'twoByTwo-04', text: 'Two of every kind of animal in the world.'},
    {id: 'twoByTwo-05', text: 'They all walked up the ramp and climbed inside.'},
    {id: 'twoByTwo-06', text: 'Nobody was left out. Not a single one.'},
  ],
  theDoor: [
    {id: 'theDoor-00', text: 'Noah went in. His whole family went in.'},
    {id: 'theDoor-01', text: 'Every animal found its place.'},
    {id: 'theDoor-02', text: 'And then something happened that nobody expected.'},
    {id: 'theDoor-03', text: 'God shut the door Himself.'},
    {id: 'theDoor-04', text: 'Nobody had to hold it. They were safe inside.'},
  ],
  rain: [
    {id: 'rain-00', text: 'And then Noah felt it. One drop on his nose.'},
    {id: 'rain-01', text: 'Then two. Then a hundred. Then a million.'},
    {id: 'rain-02', text: 'The water came up, and up, and up.'},
    {id: 'rain-03', text: 'It covered the fields. It covered the hills.'},
    {id: 'rain-04', text: 'But the big boat did exactly what it was built to do.'},
    {id: 'rain-05', text: 'Inside, everyone was warm and dry and safe.'},
    {id: 'rain-06', text: 'God was taking care of them the whole time.'},
  ],
  theDove: [
    {id: 'theDove-00', text: 'Then, one day, the rain stopped.'},
    {id: 'theDove-01', text: 'The sun came out. But water was still everywhere.'},
    {id: 'theDove-02', text: 'So Noah opened a window and sent out a little dove.'},
    {id: 'theDove-03', text: 'She came back. There was nowhere dry to land.'},
    {id: 'theDove-04', text: 'Noah waited. Then he sent her out again.'},
    {id: 'theDove-05', text: 'A tiny green leaf. Which meant something huge.'},
    {id: 'theDove-06', text: 'Somewhere out there, things were growing again.'},
    {id: 'theDove-07', text: 'The door swung open, and everybody spilled out.'},
    {id: 'theDove-08', text: 'Elephants. Giraffes. Lions. Every single one.'},
  ],
  rainbow: [
    {id: 'rainbow-00', text: 'Noah stepped onto dry ground and said thank you.'},
    {id: 'rainbow-01', text: 'And God made him a promise.'},
    {id: 'rainbow-02', text: 'God said: never again a flood like this one.'},
    {id: 'rainbow-03', text: 'And He gave the sky a rainbow to prove it.'},
    {id: 'rainbow-04', text: 'So every time you see one, remember what it means.'},
    {id: 'rainbow-05', text: 'It means God said something, and God meant it.'},
  ],
} as const;

export type SceneKey = keyof typeof narrationLines;

export interface NarrationLine {
  id: string;
  text: string;
}
