import {Circle, Line, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
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
import {Chasm, GlowOrb, Kid, Sparkle, Starfield} from '../components/figures';
import {font, glow, palette} from '../theme';

/**
 * Jesus is drawn as a figure of warm light rather than a portrait: a robe, a
 * gentle posture, open hands. No face, so no child sees a stranger's face.
 */
function LightFigure(props: Record<string, unknown>) {
  return (
    <Node {...props}>
      <Circle size={330} fill={palette.gold} opacity={0.14} />
      <Circle size={220} fill={palette.gold} opacity={0.18} />
      {/* open arms */}
      <Line
        points={[[0, 0], [-92, 34]]}
        position={[-52, -20]}
        stroke={palette.cream}
        lineWidth={22}
        lineCap={'round'}
      />
      <Line
        points={[[0, 0], [92, 34]]}
        position={[52, -20]}
        stroke={palette.cream}
        lineWidth={22}
        lineCap={'round'}
      />
      {/* robe */}
      <Rect
        size={[120, 210]}
        y={60}
        radius={[60, 60, 24, 24]}
        fill={palette.cream}
        {...glow(palette.gold, 60)}
      />
      <Circle size={86} y={-72} fill={palette.cream} {...glow(palette.gold, 50)} />
      <Circle size={120} y={-78} fill={palette.gold} opacity={0.35} />
    </Node>
  );
}

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const star = createRef<Node>();
  const trail = createRef<Line>();
  const burst = createRef<Node>();
  const jesus = createRef<Node>();
  const kid = createRef<Node>();
  const warmth = createRef<Node>();
  const name = createRef<Txt>();

  view.add(
    <>
      <Backdrop from={palette.nightDeep} to={palette.night} />
      <Starfield count={110} seed={71} />
      <Backdrop ref={warmth} from={'#33265c'} to={'#a85a3c'} opacity={0} />
      <Chasm />

      <Line
        ref={trail}
        points={[
          [220, -620],
          [60, -200],
          [0, 120],
        ]}
        stroke={palette.gold}
        lineWidth={6}
        lineCap={'round'}
        opacity={0.5}
        end={0}
      />

      <Node ref={star} position={[220, -620]}>
        <Sparkle size={230} color={palette.gold} />
      </Node>

      <Node ref={burst} position={[0, 120]} scale={0} opacity={0}>
        <GlowOrb color={palette.gold} radius={320} intensity={0.45} />
      </Node>

      <Node ref={jesus} position={[0, 0]} opacity={0} scale={0.85}>
        <LightFigure />
      </Node>

      <Node ref={kid} position={[-620, 36]}>
        <Kid scale={1.15} />
      </Node>

      <Txt
        ref={name}
        text={'Jesus'}
        y={318}
        fontFamily={font.display}
        fontWeight={600}
        fontSize={96}
        fill={palette.gold}
        opacity={0}
        {...glow(palette.gold, 40)}
      />

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield* say(caption(), 'So God did the thing nobody expected.', 2.6);
  yield* say(caption(), 'He did not wait for us to climb up to Him.', 2.8);

  // The light comes down.
  yield* all(
    say(caption(), 'He came down to us.', 2.4),
    star().position([0, 120], 2.6, easeOutCubic),
    star().scale(0.6, 2.6),
    trail().end(1, 2.4),
  );

  yield* all(
    star().opacity(0, 0.5),
    trail().opacity(0, 0.8),
    burst().opacity(1, 0.7),
    burst().scale(1, 1.1, easeOutBack),
    warmth().opacity(0.55, 2.2),
  );

  yield loop(Infinity, () =>
    chain(
      burst().scale(1.05, 2, easeInOutSine),
      burst().scale(1, 2, easeInOutSine),
    ),
  );

  yield* all(
    jesus().opacity(1, 1.4),
    jesus().scale(1.25, 1.4, easeOutBack),
    say(caption(), 'God sent His only Son into the world.', 3),
  );

  yield* all(
    name().opacity(1, 1),
    say(caption(), 'His name is Jesus.', 2.4),
  );

  yield* say(caption(), 'He was fully God, and He was fully a person.', 3);

  yield* say(caption(), 'He held children. He fed hungry people.', 2.8);
  yield* say(caption(), 'He healed the sick and calmed a storm with a word.', 3.2);
  yield* say(caption(), 'He showed us exactly what God is like.', 2.8);
  yield* say(caption(), 'Kind. Strong. And never, ever giving up on us.', 3.2);

  yield* waitFor(0.4);
  yield* all(
    kid().opacity(0, 1),
    name().opacity(0, 1),
    warmth().opacity(0, 1),
  );
});
