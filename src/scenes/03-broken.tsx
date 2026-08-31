import {Line, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  fadeTransition,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  loop,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {GlowOrb, Heart, Kid, Starfield} from '../components/figures';
import {alpha, palette} from '../theme';

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const heartLeft = createRef<Node>();
  const heartRight = createRef<Node>();
  const crack = createRef<Line>();
  const drain = createRef<Rect>();
  const wall = createRef<Node>();
  const kid = createRef<Node>();
  const light = createRef<Node>();

  view.add(
    <>
      <Backdrop from={palette.night} to={palette.plum} />
      <Starfield count={70} seed={41} tint={palette.muted} />

      {/* The heart is drawn as two halves so it can break apart later. */}
      <Node y={-70}>
        <Node ref={heartLeft}>
          <Heart color={palette.rose} size={300} />
        </Node>
        <Node ref={heartRight} opacity={0}>
          <Heart color={palette.rose} size={300} />
        </Node>
        <Line
          ref={crack}
          points={[
            [-6, -128],
            [26, -50],
            [-24, 4],
            [18, 58],
            [-4, 118],
          ]}
          stroke={palette.nightDeep}
          lineWidth={12}
          lineCap={'round'}
          lineJoin={'round'}
          end={0}
        />
      </Node>

      {/* Everything cools down under this wash. */}
      <Rect
        ref={drain}
        width={1980}
        height={1140}
        fill={alpha(palette.greyDeep, 0.62)}
        opacity={0}
      />

      <Node ref={kid} position={[-520, 240]} opacity={0}>
        <Kid scale={0.9} />
      </Node>

      <Node ref={light} position={[540, 140]} opacity={0}>
        <GlowOrb color={palette.gold} radius={200} intensity={0.45} />
      </Node>

      <Node ref={wall} position={[0, 900]}>
        <Rect
          size={[150, 700]}
          radius={16}
          fill={'#2f3555'}
          stroke={'#20253d'}
          lineWidth={8}
        />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <Rect
            size={[150, 8]}
            y={-292 + i * 116}
            fill={'#20253d'}
          />
        ))}
      </Node>

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield loop(Infinity, () =>
    chain(
      heartLeft().scale(1.05, 1, easeInOutSine),
      heartLeft().scale(1, 1, easeInOutSine),
    ),
  );

  yield* say(caption(), 'God gave us something powerful. A choice.', 2.6);
  yield* say(caption(), 'And we all chose the same thing.', 2.2);
  yield* say(caption(), 'Our own way, instead of His.', 2.4);

  // The break.
  yield* all(
    crack().end(1, 1.4, easeOutCubic),
    drain().opacity(1, 2.2),
    say(caption(), 'We lied. We hurt people. We turned away.', 2.8),
  );

  heartRight().opacity(1);
  yield* all(
    heartLeft().position.x(-70, 1.1, easeOutCubic),
    heartLeft().rotation(-14, 1.1, easeOutCubic),
    heartRight().position.x(70, 1.1, easeOutCubic),
    heartRight().rotation(14, 1.1, easeOutCubic),
    crack().opacity(0, 0.8),
    say(caption(), 'The Bible has a small word for that. Sin.', 2.8),
  );

  yield* all(
    heartLeft().opacity(0, 1),
    heartRight().opacity(0, 1),
    kid().opacity(1, 1.2),
    light().opacity(1, 1.2),
    say(caption(), 'Sin is not just breaking a rule.', 2.4),
  );

  yield loop(Infinity, () =>
    chain(
      light().scale(1.06, 1.6, easeInOutSine),
      light().scale(1, 1.6, easeInOutSine),
    ),
  );

  // The wall rises between the child and the light.
  yield* all(
    wall().position.y(210, 1.6, easeOutCubic),
    say(caption(), 'It breaks the friendship we were made for.', 2.8),
  );

  yield* all(
    kid().position.x(-560, 1.2, easeOutCubic),
    say(caption(), 'It puts a wall between us and God.', 3),
  );

  yield* waitFor(0.4);
  yield* all(
    wall().opacity(0, 1),
    kid().opacity(0, 1),
    light().opacity(0, 1),
  );
});
