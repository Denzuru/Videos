import {Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  easeInOutCubic,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  loop,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {Cross, GlowOrb, Kid, Starfield} from '../components/figures';
import {alpha, font, palette} from '../theme';

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const dark = createRef<Rect>();
  const cross = createRef<Node>();
  const kid = createRef<Node>();
  const light = createRef<Node>();
  const wall = createRef<Node>();
  const dawn = createRef<Node>();
  const label = createRef<Txt>();

  view.add(
    <>
      <Backdrop from={palette.night} to={palette.nightDeep} />
      <Starfield count={80} seed={83} tint={palette.muted} />
      <Backdrop ref={dawn} from={'#4a3170'} to={'#ffb36b'} opacity={0} />

      <Rect
        size={[900, 620]}
        position={[-720, 470]}
        radius={[0, 30, 0, 0]}
        fill={'#2b3358'}
        stroke={'#1d2340'}
        lineWidth={8}
      />
      <Rect
        size={[900, 620]}
        position={[720, 470]}
        radius={[30, 0, 0, 0]}
        fill={'#2b3358'}
        stroke={'#1d2340'}
        lineWidth={8}
      />

      <Node ref={light} position={[620, -60]} opacity={0}>
        <GlowOrb color={palette.gold} radius={210} intensity={0.45} />
      </Node>

      <Node ref={wall} position={[0, 60]}>
        <Rect size={[150, 700]} radius={16} fill={'#2f3555'} stroke={'#20253d'} lineWidth={8} />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <Rect size={[150, 8]} y={-292 + i * 116} fill={'#20253d'} />
        ))}
        <Txt
          text={'SIN'}
          rotation={-90}
          fontFamily={font.display}
          fontWeight={600}
          fontSize={54}
          fill={alpha(palette.cream, 0.45)}
        />
      </Node>

      <Node ref={kid} position={[-620, 60]} opacity={0}>
        <Kid scale={0.95} />
      </Node>

      <Node ref={cross} position={[0, -60]} scale={0} opacity={0}>
        <Cross color={palette.parchment} height={420} width={260} thickness={44} />
      </Node>

      {/* The wash that darkens the sky at the moment of the cross. */}
      <Rect
        ref={dark}
        width={1980}
        height={1140}
        fill={'#080b1c'}
        opacity={0}
      />

      <Txt
        ref={label}
        text={'a bridge'}
        y={-260}
        fontFamily={font.display}
        fontWeight={600}
        fontSize={72}
        fill={palette.gold}
        opacity={0}
      />

      <Caption ref={caption} />
    </>,
  );

  yield* say(caption(), 'But not everybody wanted a King like Jesus.', 2.8);

  yield* all(
    cross().opacity(1, 1.2),
    cross().scale(1, 1.2, easeOutBack),
    say(caption(), 'They took Him, and they put Him on a cross.', 3),
  );

  // The sky goes dark.
  yield* all(
    dark().opacity(0.72, 2.2),
    say(caption(), 'The sky went dark in the middle of the day.', 2.8),
  );

  yield* say(caption(), 'It looked like the very worst day there had ever been.', 3.2);
  yield* say(caption(), 'But Jesus was not losing.', 2.4);
  yield* say(caption(), 'He was choosing.', 2.2);

  yield* all(
    dark().opacity(0.35, 1.6),
    say(caption(), 'Every wrong thing we had ever done, He carried.', 3.2),
  );
  yield* say(caption(), 'Yours too. He carried yours.', 2.8);

  // The cross becomes the way across.
  yield* all(
    dark().opacity(0, 2),
    dawn().opacity(0.5, 2.4),
    wall().position.y(760, 1.6, easeInOutCubic),
    wall().opacity(0, 1.6),
    say(caption(), 'And the wall we could never climb came down.', 3),
  );

  yield* all(
    cross().rotation(90, 1.8, easeInOutCubic),
    cross().position([0, 60], 1.8, easeInOutCubic),
    cross().scale(1.55, 1.8, easeInOutCubic),
    light().opacity(1, 1.8),
    kid().opacity(1, 1.4),
  );

  yield* all(
    label().opacity(1, 1),
    say(caption(), 'The cross became the way across.', 3),
  );

  yield loop(Infinity, () =>
    chain(
      light().scale(1.06, 1.8, easeInOutSine),
      light().scale(1, 1.8, easeInOutSine),
    ),
  );

  yield* waitFor(0.6);
  yield* all(
    label().opacity(0, 1),
    kid().opacity(0, 1),
    cross().opacity(0, 1),
    light().opacity(0, 1),
    dawn().opacity(0, 1),
  );
});
