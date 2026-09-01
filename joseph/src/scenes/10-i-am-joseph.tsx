import {Circle, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  fadeTransition,
  loop,
  sequence,
  waitFor,
} from '@revideo/core';
import {Brother, Joseph, Person, Throne} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {Hill, PalmTree, Pyramid, RayBurst, SkyBackdrop} from '../components/world';
import {palette, punchText} from '../theme';

const GROUND = 350;

export default makeScene2D('i-am-joseph', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const joseph = createRef<Node>();
  const throne = createRef<Node>();
  const guards = createRef<Node>();
  const brothers = createRef<Node>();
  const tears = createRef<Node>();
  const glow = createRef<Node>();
  const verse = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={'#c98a4a'} bottom={'#f5cf8a'} />
      <Pyramid position={[760, GROUND]} size={600} color={palette.stone} shade={'#b8a077'} />
      <Hill size={1500} position={[-780, 940]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[1000, GROUND]} scale={0.7} />

      <Node ref={glow} position={[420, -40]} scale={0} opacity={0}>
        <RayBurst count={16} color={palette.sun} length={760} />
      </Node>

      <Node ref={throne} position={[520, GROUND]} scale={0.9}>
        <Throne />
      </Node>

      <Node ref={guards}>
        {[0, 1].map(i => (
          <Node position={[880 - i * 190, GROUND]} scale={0.9}>
            <Person robe={'#8a7f6b'} beard={'short'} />
          </Node>
        ))}
      </Node>

      <Node ref={joseph} position={[520, GROUND - 128]} scale={1.2}>
        <Joseph robe={'#f0e2c0'} />
      </Node>

      <Node ref={tears} opacity={0}>
        <Circle size={26} position={[494, 168]} fill={'#8fd4ff'} stroke={palette.ink} lineWidth={5} />
        <Circle size={22} position={[548, 182]} fill={'#8fd4ff'} stroke={palette.ink} lineWidth={5} />
      </Node>

      <Node ref={brothers}>
        {['#c96a4a', '#7aa05c', '#5f7fb8', '#b8863c', '#8a6bb0', '#4f9e8f'].map((robe, i) => (
          <Node position={[-780 + i * 170, GROUND]} scale={0.92} rotation={-24}>
            <Brother robe={robe} />
          </Node>
        ))}
      </Node>

      <Node ref={verse} opacity={0}>
        <Txt {...punchText} y={-250} fontSize={82} fill={palette.cream} text={'You meant it for evil.'} />
        <Txt {...punchText} y={-140} fontSize={98} fill={palette.sun} text={'God meant it for good.'} />
      </Node>

      <PunchWord ref={word} y={-400} fontSize={160} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'i-am-joseph');

  yield* fadeTransition(0.5);
  yield* begin();

  yield* speak('Joseph tested them, to see if their hearts had changed.');
  yield* speak('And when he saw that they had, he could not hold it in.');

  // Everybody out.
  yield* all(
    sequence(0.15, ...guards().children().map(g => all(g.position.x(1500, 1.4, easeOutCubic), g.opacity(0, 1.4)))),
    tears().opacity(1, 0.8),
    speak('He sent everybody out of the room. And then he cried.'),
  );

  // He comes down off the throne.
  yield* all(
    joseph().position([80, GROUND], 1.4, easeOutCubic),
    tears().opacity(0, 0.6),
    glow().opacity(1, 0.8),
    glow().scale(1, 1.2, easeOutCubic),
    glow().position([80, -60], 1.4, easeOutCubic),
  );
  yield punch(word(), 'I AM JOSEPH', 1.1, -3);
  yield* speak('I am Joseph, he said. I am your brother.');

  yield* all(
    sequence(0.06, ...brothers().children().map(b => all(b.scale(0.84, 0.4, easeOutCubic), b.position.y(GROUND + 18, 0.4)))),
    speak('They were terrified. They thought he would punish them.'),
  );

  // And instead, he lifts them up.
  yield* all(
    sequence(0.07, ...brothers().children().map(b => all(b.rotation(0, 0.7, easeOutBack), b.scale(0.92, 0.7, easeOutBack), b.position.y(GROUND, 0.7)))),
    speak('But Joseph said something nobody expected.'),
  );

  yield* all(
    verse().opacity(1, 0.8),
    speak('You meant it for evil. God meant it for good.'),
  );

  yield* untilDone();
  yield* verse().opacity(0, 0.8);
});
