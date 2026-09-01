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
import {Joseph, Pharaoh, Throne} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Confetti,
  GrainSack,
  Hill,
  PalmTree,
  Pyramid,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 340;

export default makeScene2D('second-in-egypt', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const pharaoh = createRef<Node>();
  const joseph = createRef<Node>();
  const throne = createRef<Node>();
  const ring = createRef<Node>();
  const store = createRef<Node>();
  const confetti = createRef<Node>();
  const heat = createRef<Rect>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={'#ffdda6'} />
      <Node position={[760, -370]} ref={rays}>
        <Sun />
      </Node>
      <Pyramid position={[-620, GROUND]} size={560} />
      <Pyramid position={[-330, GROUND]} size={380} />
      <Hill size={1400} position={[700, 940]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[920, GROUND]} scale={0.75} />

      <Node ref={throne} position={[240, GROUND]} scale={0.9} opacity={0}>
        <Throne />
      </Node>

      <Node ref={pharaoh} position={[-140, GROUND]} scale={1.1}>
        <Pharaoh />
      </Node>
      <Node ref={joseph} position={[280, GROUND]} scale={1.15}>
        <Joseph />
      </Node>

      <Node ref={ring} position={[70, 60]} scale={0}>
        <Circle size={130} stroke={palette.sun} lineWidth={28} />
        <Circle size={58} fill={palette.lapis} stroke={palette.ink} lineWidth={8} />
      </Node>

      {/* The storehouses fill up over seven good years. */}
      <Node ref={store}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
          <Node
            position={[-900 + (i % 6) * 148, GROUND - Math.floor(i / 6) * 122]}
            scale={0}
          />
        ))}
      </Node>

      <Node ref={confetti} position={[280, 20]} scale={0} opacity={0}>
        <Confetti count={34} seed={19} spread={560} />
      </Node>

      <Rect ref={heat} width={1980} height={1140} fill={'#e07a2a'} opacity={0} />
      <PunchWord ref={word} y={-380} fontSize={150} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  for (const slot of store().children()) slot.add(<GrainSack />);

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'second-in-egypt');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 34, linear));

  yield* speak('Save food in the good years, and Egypt will not starve.');
  yield* speak('The king looked at Joseph and made a decision.');

  yield* all(
    ring().scale(1, 0.5, easeOutBack),
    speak('He put his own ring on Josephs finger.'),
  );

  yield* all(
    ring().opacity(0, 0.6),
    throne().opacity(1, 0.7),
    joseph().position([240, GROUND - 128], 1, easeOutCubic),
    pharaoh().position.x(760, 1, easeOutCubic),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
  );
  yield confetti().opacity(0, 1.2);
  yield punch(word(), 'SECOND IN ALL EGYPT', 1, -3);
  yield* speak('The boy from the well was now the second most powerful man in Egypt.');

  yield* all(
    sequence(0.14, ...store().children().map(s => s.scale(0.78, 0.4, easeOutBack))),
    speak('For seven years Joseph filled the storehouses.'),
  );

  yield* all(
    heat().opacity(0.3, 1.6),
    sequence(0.08, ...store().children().map(s => s.scale(0.5, 1.2, easeOutCubic))),
    speak('And then the hungry years came, exactly as he said.'),
  );

  yield* untilDone();
});
