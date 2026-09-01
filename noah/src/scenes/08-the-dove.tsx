import {Line, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
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
import {Ark} from '../components/ark';
import {Bird, Elephant, Giraffe, Lion, Monkey, Noah} from '../components/creatures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Cloud,
  Confetti,
  Hill,
  SkyBackdrop,
  Sun,
  Water,
  makeSwell,
} from '../components/world';
import {palette} from '../theme';

export default makeScene2D('the-dove', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const storm = createRef<Node>();
  const sun = createRef<Node>();
  const rays = createRef<Node>();
  const ark = createRef<Node>();
  const dove = createRef<Node>();
  const leaf = createRef<Node>();
  const peak = createRef<Node>();
  const confetti = createRef<Node>();
  const crowd = createRef<Node>();
  const swell = makeSwell();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Node ref={storm} opacity={1}>
        <SkyBackdrop top={palette.stormTop} bottom={palette.stormLow} />
      </Node>

      <Node ref={sun} position={[600, -330]} scale={0} opacity={0}>
        <Node ref={rays}>
          <Sun />
        </Node>
      </Node>
      <Cloud position={[-580, -370]} scale={0.85} />

      <Node ref={peak} position={[-680, 1000]}>
        <Hill size={1100} color={palette.grassDeep} />
        <Hill size={640} y={-230} color={palette.grass} />
      </Node>

      <Node ref={ark} position={[140, 170]} scale={1.08}>
        <Ark />
      </Node>

      <Water phase={swell} y={236} color={palette.water} amplitude={26} />
      <Water phase={() => swell() + 1.9} y={292} color={palette.waterDeep} amplitude={20} />

      <Node ref={dove} position={[140, -180]} scale={0} opacity={0}>
        <Bird color={palette.cream} scale={1.7} />
        <Node ref={leaf} opacity={0} position={[140, -128]} scale={1.7} rotation={-20}>
          <Line
            points={[[0, 0], [30, -16], [58, 0], [30, 16]]}
            closed
            fill={palette.grass}
            stroke={palette.grassDeep}
            lineWidth={5}
          />
        </Node>
      </Node>

      {/* Everyone piling back out onto dry land. */}
      <Node ref={crowd}>
        <Node position={[-780, 470]} scale={0}>
          <Noah scale={1.3} />
        </Node>
        <Node position={[-430, 470]} scale={0}>
          <Elephant scale={1.1} />
        </Node>
        <Node position={[-60, 470]} scale={0}>
          <Giraffe scale={0.85} />
        </Node>
        <Node position={[330, 470]} scale={0}>
          <Lion scale={1.1} />
        </Node>
        <Node position={[690, 470]} scale={0}>
          <Monkey scale={1.3} />
        </Node>
      </Node>

      <Node ref={confetti} position={[0, -60]} scale={0} opacity={0}>
        <Confetti count={40} seed={31} spread={720} />
      </Node>

      <PunchWord ref={word} y={-320} fontSize={190} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'theDove');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => swell(swell() + Math.PI * 2, 4.2, linear));
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 30, linear));
  yield loop(Infinity, () =>
    chain(
      all(ark().position.y(150, 1.5, easeInOutSine), ark().rotation(2, 1.5, easeInOutSine)),
      all(ark().position.y(170, 1.5, easeInOutSine), ark().rotation(-2, 1.5, easeInOutSine)),
    ),
  );

  yield* speak('Then, one day, the rain stopped.');

  yield* all(
    storm().opacity(0, 2.2),
    sun().opacity(1, 1.4),
    sun().scale(1, 1.2, easeOutBack),
    speak('The sun came out. But water was still everywhere.'),
  );

  yield* speak('So Noah opened a window and sent out a little dove.');

  // Out, and back with nothing.
  yield* all(
    dove().opacity(1, 0.3),
    dove().scale(1, 0.4, easeOutBack),
  );
  yield* chain(
    all(dove().position([780, -330], 1.5, easeOutCubic), dove().rotation(-8, 1.5)),
    all(dove().position([140, -180], 1.4, easeInOutSine), dove().rotation(0, 1.4)),
  );
  yield* speak('She came back. There was nowhere dry to land.');

  // Out again, and back with an olive leaf.
  yield* chain(
    all(dove().position([-740, -340], 1.5, easeOutCubic), dove().rotation(8, 1.5)),
    waitFor(0.3),
  );
  yield* leaf().opacity(1, 0.3);
  yield* all(
    dove().position([140, -180], 1.5, easeInOutSine),
    dove().rotation(0, 1.5),
    speak('Noah waited. Then he sent her out again.'),
  );

  yield punch(word(), 'A LEAF!', 0.8, -7);
  yield* speak('A tiny green leaf. Which meant something huge.');

  // Land.
  yield* all(
    peak().position.y(500, 2, easeOutCubic),
    speak('Somewhere out there, things were growing again.'),
  );

  yield* all(
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
  );
  yield punch(word(), 'LAND!', 0.9, 5);
  yield confetti().opacity(0, 1.4);

  yield* all(
    sequence(
      0.16,
      ...crowd()
        .children()
        .map(member => member.scale(1, 0.5, easeOutBack)),
    ),
    speak('The door swung open, and everybody spilled out.'),
  );

  for (const [i, member] of crowd().children().entries()) {
    yield loop(Infinity, function* () {
      yield* waitFor(i * 0.11);
      yield* member.position.y(452, 0.45, easeInOutSine);
      yield* member.position.y(470, 0.45, easeInOutSine);
    });
  }

  yield* speak('Elephants. Giraffes. Lions. Every single one.');
  yield* untilDone();
});
