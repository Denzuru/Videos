import {
  Circle,
  Gradient,
  Line,
  Node,
  NodeProps,
  Path,
  Rect,
} from '@motion-canvas/2d';
import {Color, PossibleColor, Vector2} from '@motion-canvas/core';
import {alpha, glow, palette} from '../theme';

/**
 * A tiny deterministic generator. Star fields and sparkle drifts are built from
 * this so that every render of the video is frame-for-frame identical.
 */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export interface StarfieldProps extends NodeProps {
  count?: number;
  seed?: number;
  area?: [number, number];
  tint?: PossibleColor;
}

/** A scatter of soft stars, sized and dimmed at random. */
export function Starfield({
  count = 90,
  seed = 7,
  area = [2100, 1200],
  tint = palette.cream,
  ...rest
}: StarfieldProps) {
  const random = seeded(seed);
  const stars: Node[] = [];

  for (let i = 0; i < count; i++) {
    const x = (random() - 0.5) * area[0];
    const y = (random() - 0.5) * area[1];
    const size = 1.5 + random() * 4;
    const brightness = 0.25 + random() * 0.6;

    stars.push(
      <Circle
        position={[x, y]}
        size={size * 2}
        fill={new Color(tint).alpha(brightness)}
        {...glow(alpha(tint as string, brightness * 0.8), size * 5)}
      />,
    );
  }

  return <Node {...rest}>{stars}</Node>;
}

export interface KidProps extends NodeProps {
  shirt?: PossibleColor;
  skin?: PossibleColor;
  hair?: PossibleColor;
}

/**
 * The child the story is told to. Deliberately simple: circles and rounded
 * rectangles, so it reads clearly at any size and never looks like a
 * particular real person.
 */
export function Kid({
  shirt = palette.mint,
  skin = '#f7cba4',
  hair = '#4a3728',
  ...rest
}: KidProps) {
  return (
    <Node {...rest}>
      {/* legs */}
      <Line
        points={[Vector2.zero, [0, 46]]}
        position={[-16, 62]}
        stroke={'#4a5478'}
        lineWidth={18}
        lineCap={'round'}
      />
      <Line
        points={[Vector2.zero, [0, 46]]}
        position={[16, 62]}
        stroke={'#4a5478'}
        lineWidth={18}
        lineCap={'round'}
      />
      {/* arms */}
      <Line
        points={[Vector2.zero, [-30, 30]]}
        position={[-32, 6]}
        stroke={skin}
        lineWidth={16}
        lineCap={'round'}
      />
      <Line
        points={[Vector2.zero, [30, 30]]}
        position={[32, 6]}
        stroke={skin}
        lineWidth={16}
        lineCap={'round'}
      />
      {/* body */}
      <Rect size={[74, 84]} radius={30} y={24} fill={shirt} />
      {/* head */}
      <Circle size={82} y={-42} fill={skin} />
      {/* hair */}
      <Circle
        size={86}
        y={-52}
        fill={hair}
        startAngle={180}
        endAngle={360}
        closed
      />
      {/* eyes */}
      <Circle size={9} position={[-15, -44]} fill={'#2a2438'} />
      <Circle size={9} position={[15, -44]} fill={'#2a2438'} />
      {/* smile */}
      <Circle
        size={38}
        y={-40}
        stroke={'#2a2438'}
        lineWidth={5}
        lineCap={'round'}
        startAngle={25}
        endAngle={155}
      />
    </Node>
  );
}

export interface SparkleProps extends NodeProps {
  color?: PossibleColor;
}

/** A four-point twinkle. Used for wonder, and later for glory. */
export function Sparkle({color = palette.gold, ...rest}: SparkleProps) {
  return (
    <Path
      data={'M 0 -50 Q 9 -9 50 0 Q 9 9 0 50 Q -9 9 -50 0 Q -9 -9 0 -50 Z'}
      fill={color}
      {...glow(color as string, 40)}
      {...rest}
    />
  );
}

export interface HeartProps extends NodeProps {
  color?: PossibleColor;
}

export function Heart({color = palette.rose, ...rest}: HeartProps) {
  return (
    <Path
      data={
        'M 0 34 C -44 2 -56 -30 -28 -48 C -11 -58 0 -46 0 -35 ' +
        'C 0 -46 11 -58 28 -48 C 56 -30 44 2 0 34 Z'
      }
      fill={color}
      {...glow(color as string, 45)}
      {...rest}
    />
  );
}

export interface CrossProps extends NodeProps {
  color?: PossibleColor;
  thickness?: number;
  height?: number;
  width?: number;
}

export function Cross({
  color = palette.parchment,
  thickness = 34,
  height = 300,
  width = 190,
  ...rest
}: CrossProps) {
  return (
    <Node {...rest}>
      <Rect
        size={[thickness, height]}
        radius={thickness / 2}
        fill={color}
        {...glow(color as string, 30)}
      />
      <Rect
        size={[width, thickness]}
        radius={thickness / 2}
        y={-height / 6}
        fill={color}
        {...glow(color as string, 30)}
      />
    </Node>
  );
}

/**
 * A radial wash of light. Motion Canvas has no radial gradient primitive that
 * survives scaling well, so this is nested circles with falling opacity.
 */
/**
 * A soft radial wash of light. A real radial gradient rather than stacked
 * discs, so the falloff has no visible banding against a dark sky.
 */
export function GlowOrb({
  color = palette.gold,
  radius = 260,
  core = true,
  intensity = 0.4,
  ...rest
}: NodeProps & {
  color?: PossibleColor;
  radius?: number;
  core?: boolean;
  intensity?: number;
}) {
  const base = new Color(color);
  const halo = (
    <Circle
      size={radius * 2}
      fill={
        new Gradient({
          type: 'radial',
          from: [0, 0],
          to: [0, 0],
          fromRadius: 0,
          toRadius: radius,
          stops: [
            {offset: 0, color: base.alpha(intensity)},
            {offset: 0.35, color: base.alpha(intensity * 0.55)},
            {offset: 0.65, color: base.alpha(intensity * 0.2)},
            {offset: 1, color: base.alpha(0)},
          ],
        })
      }
    />
  );

  const layers: Node[] = [halo];
  if (core) {
    layers.push(
      <Circle
        size={radius * 0.62}
        fill={
          new Gradient({
            type: 'radial',
            from: [0, 0],
            to: [0, 0],
            fromRadius: 0,
            toRadius: radius * 0.31,
            stops: [
              {offset: 0, color: base.alpha(1)},
              {offset: 0.6, color: base.alpha(0.95)},
              {offset: 1, color: base.alpha(0)},
            ],
          })
        }
      />,
    );
  }

  return <Node {...rest}>{layers}</Node>;
}

export interface MoonProps extends NodeProps {
  color?: PossibleColor;
  radius?: number;
}

/**
 * A crescent moon. The bite is punched out with `destination-out` inside a
 * cached node, so whatever is behind the moon (stars, gradient) shows through
 * the curve instead of being covered by a flat disc.
 */
export function Moon({
  color = palette.gold,
  radius = 95,
  ...rest
}: MoonProps) {
  return (
    <Node {...rest}>
      <GlowOrb color={color} radius={radius * 2.6} core={false} intensity={0.32} />
      <Node cache cachePadding={30}>
        <Circle size={radius * 2} fill={color} />
        <Circle
          size={radius * 1.9}
          position={[-radius * 0.62, -radius * 0.32]}
          fill={'#000000'}
          compositeOperation={'destination-out'}
        />
      </Node>
    </Node>
  );
}
