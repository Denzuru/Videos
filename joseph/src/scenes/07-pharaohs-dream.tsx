import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  fadeTransition,
  linear,
  loop,
  sequence,
  waitFor,
} from '@revideo/core';
import {Cow, Joseph, Pharaoh} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Cloud,
  PalmTree,
  SkyBackdrop,
  Water,
  makeSwell,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 350;

export default makeScene2D('pharaohs-dream', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const pharaoh = createRef<Node>();
  const fatCows = createRef<Node>();
  const thinCows = createRef<Node>();
  const joseph = createRef<Node>();
  const dream = createRef<Node>();
  const swell = makeSwell();

  view.add(
    <>
      <SkyBackdrop top={'#3f4a86'} bottom={'#8a7fbd'} />
      <Cloud position={[-620, -370]} scale={0.8} color={'#c9c2e8'} />
      <Cloud position={[560, -330]} scale={0.95} color={'#c9c2e8'} />
      <PalmTree position={[-880, GROUND]} scale={0.8} />
      <PalmTree position={[900, GROUND]} scale={0.7} />

      <Rect width={2100} height={520} y={620} fill={'#c9a86a'} />
      <Water phase={swell} y={392} color={palette.nile} amplitude={22} />
      <Water phase={() => swell() + 1.7} y={440} color={palette.nileDeep} amplitude={17} />

      {/* The dream itself: cows out of the river. */}
      <Node ref={dream}>
        <Node ref={fatCows}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Node position={[1700 + i * 330, GROUND]} scale={1.0} />
          ))}
        </Node>
        <Node ref={thinCows}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Node position={[-1800 - i * 320, GROUND]} scale={1.0} />
          ))}
        </Node>
      </Node>

      <Node ref={pharaoh} position={[-800, GROUND]} scale={1.05}>
        <Pharaoh />
      </Node>

      <Node ref={joseph} position={[1400, GROUND]} scale={1.15}>
        <Joseph />
      </Node>

      <PunchWord ref={word} y={-400} fontSize={150} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  for (const slot of fatCows().children()) slot.add(<Cow />);
  for (const slot of thinCows().children()) slot.add(<Cow thin color={'#d8cdb8'} />);

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'pharaohs-dream');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => swell(swell() + Math.PI * 2, 4, linear));

  yield* speak('Then the king of Egypt had a dream that scared him.');

  yield* all(
    sequence(0.16, ...fatCows().children().map((c, i) => c.position.x(-620 + i * 230, 3.2, easeOutCubic))),
    speak('Seven fat cows came out of the river.'),
  );

  yield* all(
    sequence(0.14, ...thinCows().children().map((c, i) => c.position.x(-640 + i * 230, 3, easeOutCubic))),
    sequence(0.14, ...fatCows().children().map(c => chain(waitFor(1.6), all(c.scale(0, 0.6, easeOutCubic), c.opacity(0, 0.6))))),
    speak('Then seven skinny cows came and ate them up.'),
  );

  yield punch(word(), 'WHAT DOES IT MEAN?', 0.9, -4);
  yield* speak('Nobody in Egypt could tell him what it meant.');
  yield* speak('Then the servant remembered. There is a man in prison.');

  yield* all(
    thinCows().opacity(0, 1),
    joseph().position.x(300, 2.2, easeOutCubic),
    speak('So they washed Joseph and brought him to the king.'),
  );

  yield* speak('Seven good years are coming, said Joseph. Then seven hungry ones.');
  yield* untilDone();
});
