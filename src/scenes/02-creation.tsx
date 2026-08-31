import {Circle, Line, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Vector2,
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
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {GlowOrb, Heart, Kid, Sparkle, Starfield} from '../components/figures';
import {glow, palette} from '../theme';

/** A rounded hill silhouette. */
function Hill(props: Record<string, unknown>) {
  return <Circle fill={'#2f6b52'} {...props} />;
}

/** A lollipop tree: trunk plus a cluster of leaves. */
function Tree({
  leaf = palette.mint,
  ...rest
}: {leaf?: string} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Rect size={[14, 70]} y={20} radius={7} fill={'#5b4632'} />
      <Circle size={78} y={-30} fill={leaf} />
      <Circle size={54} position={[-30, -8]} fill={leaf} />
      <Circle size={54} position={[30, -8]} fill={leaf} />
    </Node>
  );
}

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const stars = createRef<Node>();
  const dawn = createRef<Rect>();
  const sun = createRef<Node>();
  const land = createRef<Node>();
  const trees = createRef<Node>();
  const kid = createRef<Node>();
  const heart = createRef<Node>();
  const sparkles = createRef<Node>();

  view.add(
    <>
      <Backdrop from={palette.nightDeep} to={palette.night} />
      <Node ref={stars}>
        <Starfield count={120} seed={23} />
      </Node>

      {/* The dawn sky fades in on top of the night sky. */}
      <Backdrop ref={dawn} from={'#3d2f63'} to={'#ff9f5a'} opacity={0} />

      <Node ref={sun} position={[0, 620]} opacity={0}>
        <GlowOrb color={palette.gold} radius={360} intensity={0.5} />
      </Node>

      <Node ref={land} y={1080}>
        <Hill size={1500} position={[-620, 240]} />
        <Hill size={1180} position={[640, 300]} />
        <Rect
          width={2100}
          height={520}
          y={300}
          radius={40}
          fill={'#25573f'}
        />
        <Node ref={trees} y={40}>
          <Tree position={[-620, 0]} scale={0} leaf={'#67c9a0'} />
          <Tree position={[-380, 30]} scale={0} leaf={'#4fb98f'} />
          <Tree position={[430, 20]} scale={0} leaf={'#67c9a0'} />
          <Tree position={[660, -10]} scale={0} leaf={'#3fa87e'} />
        </Node>
      </Node>

      <Node ref={kid} position={[-30, 250]} scale={0}>
        <Kid />
      </Node>

      <Node ref={heart} position={[-30, 78]} scale={0}>
        <Heart color={palette.rose} size={150} />
      </Node>

      <Node ref={sparkles} opacity={0}>
        <Sparkle position={[-300, -180]} size={40} color={palette.gold} />
        <Sparkle position={[300, -230]} size={32} color={palette.cream} />
        <Sparkle position={[180, -60]} size={24} color={palette.rose} />
        <Sparkle position={[-210, -30]} size={28} color={palette.sky} />
      </Node>

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield loop(Infinity, () =>
    chain(
      stars().opacity(0.7, 2.4, easeInOutSine),
      stars().opacity(1, 2.4, easeInOutSine),
    ),
  );

  yield* say(caption(), 'In the very beginning, there was nothing at all.', 2.2);
  yield* say(caption(), 'Then God spoke.', 1.6);

  // Sunrise. Everything warms at once.
  yield* all(
    sun().opacity(1, 1.4),
    sun().position.y(-236, 4.5, easeOutCubic),
    dawn().opacity(0.92, 4.5),
    stars().opacity(0.25, 4.5),
    land().position.y(250, 3.4, easeOutCubic),
    say(caption(), 'And light poured into the dark.', 2.4),
  );

  yield* all(
    sequence(0.22, ...trees().children().map(t => t.scale(1, 0.9, easeOutBack))),
    say(caption(), 'He made mountains, and oceans, and every animal.', 3),
  );

  yield* say(caption(), 'And then God made something special.', 2.2);

  yield* all(
    kid().scale(1, 1.1, easeOutBack),
    sparkles().opacity(1, 1.2),
    say(caption(), 'He made people. He made you.', 2.6),
  );

  yield loop(Infinity, () =>
    chain(
      kid().position.y(238, 1.3, easeInOutSine),
      kid().position.y(250, 1.3, easeInOutSine),
    ),
  );

  yield* all(
    heart().scale(1, 0.9, easeOutBack),
    say(caption(), 'Not by accident. On purpose. Because He wanted you.', 3.2),
  );

  yield loop(Infinity, () =>
    chain(
      heart().scale(1.12, 0.7, easeInOutSine),
      heart().scale(1, 0.7, easeInOutSine),
    ),
  );

  yield* say(caption(), 'And God looked at everything and said: it is very good.', 3.2);

  yield* all(
    kid().opacity(0, 1),
    heart().opacity(0, 1),
    sparkles().opacity(0, 1),
    land().opacity(0, 1),
    sun().opacity(0, 1),
    dawn().opacity(0, 1),
  );
});
