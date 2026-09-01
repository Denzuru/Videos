import {Circle, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInCubic,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  fadeTransition,
  linear,
  loop,
  sequence,
  waitFor,
} from '@revideo/core';
import {Brother, Camel, Coat, Joseph} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {Cloud, Hill, PalmTree, SkyBackdrop, Sun} from '../components/world';
import {font, palette} from '../theme';

const GROUND = 310;

export default makeScene2D('the-pit', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const joseph = createRef<Node>();
  const brothers = createRef<Node>();
  const pit = createRef<Node>();
  const caravan = createRef<Node>();
  const silver = createRef<Node>();
  const coat = createRef<Node>();
  const dim = createRef<Rect>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={'#ffd9a0'} />
      <Node position={[720, -360]} ref={rays}>
        <Sun />
      </Node>
      <Cloud position={[-560, -340]} scale={0.75} color={'#ffeccd'} />
      <Hill size={1700} position={[-620, 900]} color={palette.sandDeep} />
      <Hill size={1400} position={[700, 940]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[-880, GROUND]} scale={0.8} />

      {/* The well. A hole in the ground with a stone lip. */}
      {/* The well reads as an opening in the ground: a stone rim with a dark
          mouth inside it, not a box standing on the sand. */}
      <Node ref={pit} position={[120, GROUND + 24]} opacity={0}>
        <Circle size={[300, 96]} fill={palette.stone} stroke={palette.ink} lineWidth={9} />
        <Circle size={[228, 62]} fill={palette.pit} />
        <Rect size={[228, 300]} y={150} fill={palette.pit} />
        <Circle size={[228, 62]} y={300} fill={palette.pit} />
      </Node>

      <Node ref={joseph} position={[-620, GROUND]} scale={1.15}>
        <Joseph coat />
      </Node>

      <Node ref={brothers}>
        {['#c96a4a', '#7aa05c', '#5f7fb8', '#b8863c'].map((robe, i) => (
          <Node position={[380 + i * 190, GROUND]} scale={0.95}>
            <Brother robe={robe} />
          </Node>
        ))}
      </Node>

      <Node ref={caravan} position={[1500, GROUND]} scale={0.8} opacity={0}>
        <Camel />
        <Camel position={[290, 0]} scale={0.9} />
      </Node>

      <Node ref={silver} opacity={0} position={[-360, -250]}>
        {[0, 1, 2, 3, 4].map(i => (
          <Circle
            size={72}
            position={[-140 + i * 70, (i % 2) * 40]}
            fill={'#dfe3ea'}
            stroke={palette.ink}
            lineWidth={7}
          />
        ))}
        <Txt
          text={'20 pieces of silver'}
          y={140}
          fontFamily={font.display}
          fontWeight={800}
          fontSize={46}
          fill={palette.cream}
          stroke={palette.ink}
          lineWidth={8}
          strokeFirst
          lineJoin={'round'}
        />
      </Node>

      <Node ref={coat} position={[120, -60]} scale={0} rotation={-10}>
        <Coat />
      </Node>

      <Rect ref={dim} width={1980} height={1140} fill={palette.nightDeep} opacity={0} />
      <PunchWord ref={word} y={-330} fontSize={160} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'the-pit');

  yield* fadeTransition(0.5);
  yield* begin();

  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 34, linear));

  yield* all(
    joseph().position.x(-240, 3, easeOutCubic),
    speak('One day their father sent Joseph out to find them.'),
  );
  yield* speak('They saw his colourful coat coming from far away.');

  // They take the coat and he goes into the well.
  yield* all(
    pit().opacity(1, 0.5),
    joseph().position.x(120, 0.8, easeOutCubic),
    speak('They grabbed him, and they threw him into an empty well.'),
  );
  yield* all(
    coat().scale(1, 0.4, easeOutBack),
    coat().position([560, -60], 0.6, easeOutCubic),
    joseph().position.y(GROUND + 380, 0.7, easeInCubic),
    joseph().opacity(0, 0.7),
    dim().opacity(0.3, 0.7),
  );

  yield* all(
    caravan().opacity(1, 0.6),
    caravan().position.x(-260, 5, linear),
    speak('Then some traders came past on their way to Egypt.'),
  );

  yield all(silver().opacity(1, 0.4), silver().scale(1.05, 0.5, easeOutBack));
  yield punch(word(), 'SOLD.', 0.7, -8);
  yield* speak('And his own brothers sold him. For twenty pieces of silver.');

  yield silver().opacity(0, 0.7);
  // The coat leaves with them rather than hanging in the air.
  yield* all(
    coat().position([-1150, 120], 1.8, easeOutCubic),
    coat().rotation(24, 1.8),
    coat().opacity(0, 1.8),
    speak('They took his coat home and told their father a lie.'),
  );

  yield* all(
    dim().opacity(0.55, 1.2),
    caravan().opacity(0, 1),
    speak('Joseph was gone. But God was not.'),
  );

  yield* untilDone();
});
