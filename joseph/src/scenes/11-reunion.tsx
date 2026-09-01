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
import {Brother, Jacob, Joseph} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Confetti,
  Hill,
  PalmTree,
  Pyramid,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette, punchText} from '../theme';

const GROUND = 350;

export default makeScene2D('reunion', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const joseph = createRef<Node>();
  const jacob = createRef<Node>();
  const family = createRef<Node>();
  const confetti = createRef<Node>();
  const closing = createRef<Node>();
  const cast = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={'#ffe3ae'} />
      <Node position={[760, -370]} ref={rays}>
        <Sun />
      </Node>
      <Pyramid position={[-680, GROUND]} size={520} />
      <Hill size={1500} position={[760, 940]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[-980, GROUND]} scale={0.75} />

      <Node ref={cast}>
        <Node ref={joseph} position={[-160, GROUND]} scale={1.2}>
          <Joseph robe={'#f0e2c0'} />
        </Node>
        <Node ref={jacob} position={[1400, GROUND]} scale={1.2}>
          <Jacob />
        </Node>
        <Node ref={family}>
          {['#c96a4a', '#7aa05c', '#5f7fb8', '#b8863c'].map((robe, i) => (
            <Node position={[380 + i * 180, GROUND]} scale={0.82} opacity={0}>
              <Brother robe={robe} />
            </Node>
          ))}
        </Node>
      </Node>

      <Node ref={confetti} position={[0, -80]} scale={0} opacity={0}>
        <Confetti count={48} seed={41} spread={840} />
      </Node>

      <Node ref={closing} opacity={0}>
        <Txt {...punchText} y={-160} fontSize={104} fill={palette.cream} text={'God was with him'} />
        <Txt {...punchText} y={-40} fontSize={124} fill={palette.sun} text={'the whole time.'} />
      </Node>

      <PunchWord ref={word} y={-400} fontSize={150} fill={palette.pink} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'reunion');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 30, linear));

  yield punch(word(), 'FORGIVEN', 1, -4);
  yield* speak('He forgave them. Every single one.');

  yield* all(
    sequence(0.12, ...family().children().map(b => all(b.opacity(1, 0.4), b.scale(0.82, 0.5, easeOutBack)))),
    speak('And he brought his whole family to Egypt, where there was food.'),
  );

  // Jacob crosses the frame and they meet.
  yield* all(
    jacob().position.x(60, 2.4, easeOutCubic),
    joseph().position.x(-70, 2.4, easeOutCubic),
    speak('Old Jacob got to hug the son he thought was dead.'),
  );
  yield* all(
    confetti().opacity(1, 0.3),
    confetti().scale(1, 1, easeOutCubic),
    chain(joseph().scale(1.3, 0.35, easeOutBack), joseph().scale(1.2, 0.3)),
    chain(jacob().scale(1.3, 0.35, easeOutBack), jacob().scale(1.2, 0.3)),
  );
  yield confetti().opacity(0, 1.6);

  for (const [i, member] of cast().children().entries()) {
    yield loop(Infinity, () =>
      chain(
        waitFor(i * 0.11),
        member.position.y(member.position.y() - 16, 0.5, easeInOutSine),
        member.position.y(member.position.y() + 16, 0.5, easeInOutSine),
      ),
    );
  }

  yield* speak('God had been with Joseph in the well, and in the prison, and on the throne.');
  yield* speak('He was never once on his own.');

  yield* all(
    cast().opacity(0.35, 1),
    closing().opacity(1, 1),
    speak('And neither are you.'),
  );

  yield* all(confetti().opacity(1, 0.4), confetti().scale(1.2, 1.4, easeOutCubic));
  yield* untilDone();
  yield* waitFor(2);
  yield* all(closing().opacity(0, 1.2), confetti().opacity(0, 1.2), cast().opacity(0, 1.2));
});
