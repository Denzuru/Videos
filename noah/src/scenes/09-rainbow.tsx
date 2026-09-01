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
import {Elephant, Giraffe, Lion, Noah} from '../components/creatures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Cloud,
  Confetti,
  Hill,
  Rainbow,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette, punchText} from '../theme';

export default makeScene2D('rainbow', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const bow = createRef<Node>();
  const cast = createRef<Node>();
  const confetti = createRef<Node>();
  const closing = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Node position={[700, -360]} ref={rays}>
        <Sun />
      </Node>
      <Cloud position={[-620, -350]} scale={0.85} />
      <Cloud position={[220, -420]} scale={0.6} />

      {/* The ref goes on the Rainbow itself, so children() are the arcs the
          sweep-in animates rather than a single wrapper node. */}
      <Rainbow ref={bow} radius={700} band={62} position={[0, 380]} scale={1} />

      <Hill size={1700} position={[-500, 830]} color={palette.grassDeep} />
      <Hill size={1400} position={[620, 880]} color={palette.grassDeep} />
      <Rect width={2100} height={520} y={640} fill={palette.grass} />

      <Node ref={cast}>
        <Node position={[-660, 386]} scale={1.45}>
          <Noah />
        </Node>
        <Node position={[-130, 386]} scale={1.2}>
          <Elephant />
        </Node>
        <Node position={[330, 386]} scale={0.92}>
          <Giraffe />
        </Node>
        <Node position={[720, 386]} scale={1.2}>
          <Lion />
        </Node>
      </Node>

      <Node ref={confetti} position={[0, -120]} scale={0} opacity={0}>
        <Confetti count={46} seed={57} spread={820} />
      </Node>

      <Node ref={closing} opacity={0}>
        <Txt {...punchText} y={-120} fontSize={124} fill={palette.cream} text={'God always keeps'} />
        <Txt {...punchText} y={10} fontSize={150} fill={palette.sun} text={'His promises.'} />
      </Node>

      <PunchWord ref={word} y={-330} fontSize={180} fill={palette.pink} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'rainbow');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 30, linear));

  for (const [i, member] of cast().children().entries()) {
    yield loop(Infinity, () =>
      chain(
        waitFor(i * 0.13),
        member.position.y(368, 0.5, easeInOutSine),
        member.position.y(386, 0.5, easeInOutSine),
      ),
    );
  }

  yield* speak('Noah stepped onto dry ground and said thank you.');
  yield* speak('And God made him a promise.');

  // The bow sweeps in, band by band.
  yield* all(
    sequence(
      0.14,
      ...bow()
        .children()
        .map(arc => arc.end(1, 1.5, easeOutCubic)),
    ),
    confetti().opacity(1, 0.4),
    confetti().scale(1, 1.1, easeOutCubic),
  );
  yield confetti().opacity(0, 1.6);

  yield punch(word(), 'A RAINBOW!', 0.9, -5);

  yield loop(Infinity, () =>
    chain(bow().scale(0.985, 1.6, easeInOutSine), bow().scale(1, 1.6, easeInOutSine)),
  );

  yield* speak('God said: never again a flood like this one.');
  yield* speak('And He gave the sky a rainbow to prove it.');
  yield* speak('So every time you see one, remember what it means.');
  yield* speak('It means God said something, and God meant it.');

  // Ending card.
  yield* all(
    bow().opacity(0.45, 1),
    cast().opacity(0.35, 1),
    closing().opacity(1, 1),
  );
  yield* all(
    confetti().opacity(1, 0.4),
    confetti().scale(1.2, 1.4, easeOutCubic),
  );
  yield* waitFor(2.6);
  yield* all(closing().opacity(0, 1.2), confetti().opacity(0, 1.2));
  yield* untilDone();
});
