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
import {Joseph, Person} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Cloud,
  GrainSack,
  Hill,
  PalmTree,
  Pyramid,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 330;

export default makeScene2D('potiphar', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const joseph = createRef<Node>();
  const potiphar = createRef<Node>();
  const sacks = createRef<Node>();
  const bars = createRef<Node>();
  const dim = createRef<Rect>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={'#ffdda6'} />
      <Node position={[-700, -350]} ref={rays}>
        <Sun />
      </Node>
      <Cloud position={[520, -360]} scale={0.7} color={'#ffeccd'} />
      <Pyramid position={[560, GROUND]} size={640} />
      <Pyramid position={[860, GROUND]} size={430} />
      <Hill size={1500} position={[-700, 900]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[-900, GROUND]} scale={0.8} />

      <Node ref={potiphar} position={[420, GROUND]} scale={1.05} opacity={0}>
        <Person robe={'#b8863c'} robeTrim={palette.sun} beard={'short'} />
      </Node>

      <Node ref={joseph} position={[-420, GROUND]} scale={1.15}>
        <Joseph />
      </Node>

      <Node ref={sacks}>
        {[0, 1, 2, 3, 4].map(i => (
          <Node position={[-140 + i * 130, GROUND]} scale={0} />
        ))}
      </Node>

      {/* The cell drops in from above at the end: a dark wall first, then the
          bars in front of it, so the prison does not read as a sunny desert
          with poles in it. */}
      <Node ref={bars} position={[0, -1200]}>
        <Rect width={1980} height={1140} fill={'#3b3f5c'} />
        <Rect size={[360, 250]} position={[0, -250]} radius={20} fill={'#8fa8c8'} stroke={palette.ink} lineWidth={9} />
        <Rect width={2100} height={520} y={600} fill={'#31364a'} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <Rect
            size={[34, 1140]}
            radius={17}
            position={[-840 + i * 240, 0]}
            fill={'#5a6070'}
            stroke={palette.ink}
            lineWidth={8}
          />
        ))}
      </Node>

      <Rect ref={dim} width={1980} height={1140} fill={palette.nightDeep} opacity={0} />
      <PunchWord ref={word} y={-330} fontSize={150} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  for (const slot of sacks().children()) {
    slot.add(<GrainSack />);
  }

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'potiphar');

  yield* fadeTransition(0.5);
  yield* begin();

  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 34, linear));

  yield* all(
    potiphar().opacity(1, 0.6),
    speak('In Egypt, Joseph was sold to a man called Potiphar.'),
  );

  yield* all(
    sequence(0.18, ...sacks().children().map(s => s.scale(0.85, 0.45, easeOutBack))),
    speak('Joseph worked hard, and God was with him.'),
  );

  yield loop(Infinity, () =>
    chain(
      joseph().position.y(GROUND - 16, 0.7, easeInOutSine),
      joseph().position.y(GROUND, 0.7, easeInOutSine),
    ),
  );

  yield* all(
    joseph().position.x(-40, 1.4, easeOutCubic),
    speak('Soon he was in charge of the whole house.'),
  );

  yield* speak('But then somebody told a lie about him.');

  // The bars come down.
  yield* all(
    bars().position.y(0, 0.9, easeOutCubic),
    dim().opacity(0.4, 0.9),
    sacks().opacity(0, 0.6),
    potiphar().opacity(0, 0.6),
    speak('And Joseph, who had done nothing wrong, was thrown into prison.'),
  );
  yield punch(word(), 'AGAIN?!', 0.7, -7);

  yield* speak('That is twice now that he lost everything.');
  yield* untilDone();
});
