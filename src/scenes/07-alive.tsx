import {Circle, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  fadeTransition,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  linear,
  loop,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {GlowOrb, Kid, RayBurst, Sparkle, Starfield} from '../components/figures';
import {font, glow, palette} from '../theme';

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const stone = createRef<Node>();
  const tombLight = createRef<Node>();
  const rays = createRef<Node>();
  const dawn = createRef<Node>();
  const alive = createRef<Txt>();
  const sparkles = createRef<Node>();
  const kid = createRef<Node>();

  view.add(
    <>
      <Backdrop from={palette.nightDeep} to={palette.night} />
      <Starfield count={90} seed={97} tint={palette.muted} />
      <Backdrop ref={dawn} from={'#5b3a76'} to={'#ffc978'} opacity={0} />

      {/* Hillside with the tomb cut into it. */}
      <Circle size={1500} position={[0, 640]} fill={'#2b3358'} />
      <Rect
        size={[300, 380]}
        position={[0, 200]}
        radius={[150, 150, 12, 12]}
        fill={'#0a0d1e'}
      />

      <Node ref={tombLight} position={[0, 200]} scale={0} opacity={0}>
        <GlowOrb color={palette.gold} radius={330} intensity={0.6} />
      </Node>

      <Node ref={rays} position={[0, 200]} scale={0} opacity={0}>
        <RayBurst count={18} color={palette.gold} length={980} />
      </Node>

      <Node ref={stone} position={[0, 210]}>
        <Circle
          size={340}
          fill={'#4a5170'}
          stroke={'#333a55'}
          lineWidth={12}
        />
        <Circle size={54} position={[-70, -50]} fill={'#3f4664'} />
        <Circle size={36} position={[60, 40]} fill={'#3f4664'} />
        <Circle size={28} position={[20, -80]} fill={'#3f4664'} />
      </Node>

      <Node ref={sparkles} opacity={0}>
        <Sparkle position={[-420, -220]} size={54} color={palette.gold} />
        <Sparkle position={[430, -280]} size={40} color={palette.cream} />
        <Sparkle position={[-620, 40]} size={34} color={palette.rose} />
        <Sparkle position={[600, 20]} size={44} color={palette.mint} />
      </Node>

      <Node ref={kid} position={[-720, 232]} opacity={0}>
        <Kid scale={1.05} />
      </Node>

      <Txt
        ref={alive}
        text={'HE IS ALIVE'}
        y={-320}
        fontFamily={font.display}
        fontWeight={600}
        fontSize={118}
        fill={palette.cream}
        opacity={0}
        scale={0.8}
        {...glow(palette.gold, 60)}
      />

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield* say(caption(), 'Jesus died. That part is really true.', 2.8);
  yield* say(caption(), 'His friends laid Him in a tomb in a garden.', 3);
  yield* say(caption(), 'They rolled a huge stone across the door.', 3);
  yield* say(caption(), 'And they cried, for three whole days.', 3);
  yield* say(caption(), 'Then, very early on Sunday morning...', 2.6);

  // The stone rolls.
  yield* all(
    stone().position([560, 250], 1.8, easeOutCubic),
    stone().rotation(420, 1.8, easeOutCubic),
    tombLight().opacity(1, 1.4),
    tombLight().scale(1, 1.6, easeOutBack),
  );

  // Light floods out.
  yield* all(
    rays().opacity(1, 1),
    rays().scale(1, 1.4, easeOutBack),
    dawn().opacity(0.7, 2),
    stone().opacity(0, 1),
    alive().opacity(1, 1.2),
    alive().scale(1, 1.2, easeOutBack),
    sparkles().opacity(1, 1.4),
  );

  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 60, linear));
  yield loop(Infinity, () =>
    chain(
      tombLight().scale(1.08, 1.6, easeInOutSine),
      tombLight().scale(1, 1.6, easeInOutSine),
    ),
  );

  yield* say(caption(), 'The tomb was empty. Jesus was alive!', 3);

  yield* all(
    kid().opacity(1, 1.2),
    say(caption(), 'Not a ghost. Not a story. Really, truly alive.', 3.2),
  );

  yield loop(Infinity, () =>
    chain(
      kid().position.y(214, 0.9, easeInOutSine),
      kid().position.y(232, 0.9, easeInOutSine),
    ),
  );

  yield* say(caption(), 'Death did its very worst. And it lost.', 3);
  yield* say(caption(), 'Jesus won. Forever.', 2.6);

  yield* waitFor(0.5);
  yield* all(
    alive().opacity(0, 1.2),
    rays().opacity(0, 1.2),
    sparkles().opacity(0, 1.2),
    kid().opacity(0, 1.2),
  );
});
