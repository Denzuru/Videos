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
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
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

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'building');

  yield* fadeTransition(0.5);
  yield* begin();

  yield* speak('So Noah picked up his hammer.');

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
    speak('Bang. Tap. Saw. Bang.'),
  );

  yield chain(
    punch(word(), 'BONK!', 0.5, -9),
    punch(word(), 'TAP TAP!', 0.5, 7),
  );

  // The ark itself arrives.
  yield* all(
    planks().opacity(0, 0.5),
    ark().opacity(1, 0.5),
    ark().scale(1.08, 0.6, easeOutBack),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
    speak('And slowly, a boat began to grow.'),
  );
  yield* all(ark().scale(1.02, 0.3), confetti().opacity(0, 1));

  yield loop(Infinity, () =>
    chain(noah().position.y(320, 0.55, easeInOutSine), noah().position.y(340, 0.55, easeInOutSine)),
  );

  yield* speak('It took Noah years and years and years.');
  yield* speak('People walked past and laughed at him.');
  yield* speak('"A boat? Out here? There is no water!"');

  yield punch(word(), 'HE KEPT GOING', 0.9, -4);

  yield* speak('But Noah trusted God more than he minded the laughing.');
  yield* speak('So he kept building. Every single day.');
  yield* untilDone();
});
