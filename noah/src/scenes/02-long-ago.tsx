import {Circle, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
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
import {Noah} from '../components/creatures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {Cloud, Confetti, Hill, SkyBackdrop, Sun} from '../components/world';
import {palette} from '../theme';

/** A townsperson: a blob with a mood. */
function Villager({
  color = palette.coral,
  ...rest
}: {color?: string} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Node scale={1.5}>
        <Rect size={[84, 128]} radius={[42, 42, 14, 14]} y={-70} fill={color} />
        <Circle size={78} y={-158} fill={'#f2c391'} />
        <Circle size={12} position={[-17, -166]} fill={palette.ink} />
        <Circle size={12} position={[17, -166]} fill={palette.ink} />
      </Node>
    </Node>
  );
}

export default makeScene2D('long-ago', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const town = createRef<Node>();
  const gloom = createRef<Rect>();
  const noah = createRef<Node>();
  const spot = createRef<Node>();
  const confetti = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Node position={[640, -340]} ref={rays}>
        <Sun />
      </Node>
      <Cloud position={[-560, -300]} scale={0.9} />
      <Cloud position={[120, -400]} scale={0.6} />

      <Hill size={1500} position={[-560, 700]} color={palette.grassDeep} />
      <Hill size={1300} position={[640, 760]} color={palette.grassDeep} />
      <Rect width={2100} height={560} y={580} fill={palette.grass} />

      <Node ref={town}>
        <Villager position={[-760, 300]} color={palette.coral} scale={0} />
        <Villager position={[-490, 300]} color={palette.purple} scale={0} />
        <Villager position={[-220, 300]} color={palette.orange} scale={0} />
        <Villager position={[50, 300]} color={'#4cc9f0'} scale={0} />
        <Villager position={[320, 300]} color={palette.pink} scale={0} />
      </Node>

      {/* Everything cools down under this, and warms back up for Noah. */}
      <Rect ref={gloom} width={1980} height={1140} fill={'#3d4468'} opacity={0} />

      <Node ref={spot} position={[660, 300]} scale={0} opacity={0}>
        <Circle size={1020} fill={palette.sun} opacity={0.22} />
        <Circle size={700} fill={palette.sun} opacity={0.26} />
      </Node>

      <Node ref={noah} position={[660, 300]} scale={0}>
        <Noah scale={1.55} />
      </Node>

      <Node ref={confetti} position={[660, 30]} scale={0} opacity={0}>
        <Confetti count={30} seed={9} spread={520} />
      </Node>

      <PunchWord ref={word} y={-260} fontSize={168} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'longAgo');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 30, linear));

  yield* all(
    sequence(0.12, ...town().children().map(v => v.scale(1, 0.45, easeOutBack))),
    speak('A long, long time ago, the world was full of people.'),
  );

  // Bouncing crowd.
  for (const [i, villager] of town().children().entries()) {
    yield loop(Infinity, () =>
      chain(
        waitFor(i * 0.09),
        villager.position.y(280, 0.4, easeInOutSine),
        villager.position.y(300, 0.4, easeInOutSine),
      ),
    );
  }

  yield* speak('God made every single one of them.');

  yield* all(
    gloom().opacity(0.55, 1.2),
    speak('But they forgot how to be kind.'),
  );
  yield* speak('They were mean, and they would not stop.');
  yield* speak('And it made God very, very sad.');

  yield* speak('But there was one man who still listened.');

  // The lights come back on for Noah.
  yield* all(
    gloom().opacity(0.28, 0.8),
    spot().opacity(1, 0.5),
    spot().scale(1, 0.7, easeOutBack),
    noah().scale(1, 0.6, easeOutBack),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.8, easeOutCubic),
  );
  yield punch(word(), 'NOAH!', 0.9, -6);

  yield loop(Infinity, () =>
    chain(noah().scale(1.05, 0.6, easeInOutSine), noah().scale(1, 0.6, easeInOutSine)),
  );
  yield loop(Infinity, () =>
    chain(spot().scale(1.06, 1.2, easeInOutSine), spot().scale(1, 1.2, easeInOutSine)),
  );
  yield confetti().opacity(0, 1.2);

  yield* speak('Noah loved God, and God loved Noah.');
  yield* untilDone();
});
