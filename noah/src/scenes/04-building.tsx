import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
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
import {Ark} from '../components/ark';
import {Noah} from '../components/creatures';
import {Caption, PunchWord, punch, say} from '../components/narration';
import {Cloud, Confetti, Hill, SkyBackdrop} from '../components/world';
import {palette} from '../theme';

export default makeScene2D('building', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const stage = createRef<Node>();
  const noah = createRef<Node>();
  const ark = createRef<Node>();
  const planks = createRef<Node>();
  const confetti = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Cloud position={[-640, -370]} scale={0.8} />
      <Cloud position={[600, -330]} scale={0.95} />

      <Node ref={stage}>
        <Hill size={1700} position={[-400, 800]} color={palette.grassDeep} />
        <Rect width={2100} height={560} y={600} fill={palette.grass} />

        <Node ref={ark} position={[220, 330]} scale={1.02} opacity={0}>
          <Ark />
        </Node>

        {/* Planks fly in from off screen and land on the pile. */}
        <Node ref={planks}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Rect
              size={[330, 52]}
              radius={26}
              position={[-1700, 40 + i * 74]}
              rotation={-14 + i * 5}
              fill={i % 2 ? palette.wood : palette.woodDeep}
              stroke={palette.woodDark}
              lineWidth={7}
            />
          ))}
        </Node>

        <Node ref={noah} position={[-720, 340]} scale={1.3}>
          <Noah />
        </Node>
      </Node>

      <Node ref={confetti} position={[220, 60]} scale={0} opacity={0}>
        <Confetti count={32} seed={17} spread={560} />
      </Node>

      <PunchWord ref={word} y={-250} fontSize={172} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  yield* fadeTransition(0.5);

  yield* say(caption(), 'So Noah picked up his hammer.', 1.7);

  // Planks slam into place, and the whole picture kicks on each hit.
  yield* all(
    sequence(
      0.2,
      ...planks()
        .children()
        .map((plank, i) =>
          all(
            plank.position.x(-150 + i * 26, 0.42, easeOutBack),
            plank.rotation(-6 + i * 3, 0.42, easeOutBack),
          ),
        ),
    ),
    chain(
      waitFor(0.2),
      ...[0, 1, 2, 3, 4, 5].flatMap(() => [
        stage().position.y(10, 0.05),
        stage().position.y(0, 0.09),
      ]),
    ),
    say(caption(), 'Bang. Tap. Saw. Bang.', 1.6),
  );

  yield* punch(word(), 'BONK!', 0.5, -9);
  yield* punch(word(), 'TAP TAP!', 0.5, 7);

  // The ark itself arrives.
  yield* all(
    planks().opacity(0, 0.5),
    ark().opacity(1, 0.5),
    ark().scale(1.08, 0.6, easeOutBack),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
    say(caption(), 'And slowly, a boat began to grow.', 2.2),
  );
  yield* all(ark().scale(1.02, 0.3), confetti().opacity(0, 1));

  yield loop(Infinity, () =>
    chain(noah().position.y(320, 0.55, easeInOutSine), noah().position.y(340, 0.55, easeInOutSine)),
  );

  yield* say(caption(), 'It took Noah years and years and years.', 2.3);
  yield* say(caption(), 'People walked past and laughed at him.', 2.2);
  yield* say(caption(), '"A boat? Out here? There is no water!"', 2.4);

  yield* punch(word(), 'HE KEPT GOING', 0.9, -4);

  yield* say(caption(), 'But Noah trusted God more than he minded the laughing.', 2.8);
  yield* say(caption(), 'So he kept building. Every single day.', 2.3);
  yield* waitFor(0.3);
});
