import {Circle, Gradient, Line, Node, NodeProps, Rect} from '@revideo/2d';
import {PossibleColor, createSignal} from '@revideo/core';
import {glow, palette, rainbow} from '../theme';

/** Deterministic randomness, so every render of the film is identical. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function SkyBackdrop({
  top = palette.sky,
  bottom = palette.skyPale,
  ...rest
}: {top?: string; bottom?: string} & Record<string, unknown>) {
  return (
    <Rect
      width={1980}
      height={1140}
      fill={
        new Gradient({
          type: 'linear',
          from: [0, -570],
          to: [0, 570],
          stops: [
            {offset: 0, color: top},
            {offset: 1, color: bottom},
          ],
        })
      }
      {...rest}
    />
  );
}

/** A grinning sun with a wheel of rays behind it. */
export function Sun({...rest}: NodeProps) {
  const rays: Node[] = [];
  for (let i = 0; i < 12; i++) {
    rays.push(
      <Rect
        size={[26, 300]}
        radius={13}
        offset={[0, -1]}
        rotation={(360 / 12) * i}
        fill={palette.sun}
        opacity={0.85}
      />,
    );
  }

  return (
    <Node {...rest}>
      <Node>{rays}</Node>
      <Circle size={230} fill={palette.sun} {...glow(palette.sunDeep, 60)} />
      <Circle size={22} position={[-42, -20]} fill={palette.ink} />
      <Circle size={22} position={[42, -20]} fill={palette.ink} />
      <Circle
        size={110}
        y={-6}
        stroke={palette.ink}
        lineWidth={12}
        lineCap={'round'}
        startAngle={25}
        endAngle={155}
      />
    </Node>
  );
}

/** A fat cartoon cloud: overlapping discs on a rounded base. */
export function Cloud({
  color = palette.white,
  ...rest
}: {color?: PossibleColor} & NodeProps) {
  return (
    <Node {...rest}>
      <Rect size={[230, 76]} radius={38} y={22} fill={color} />
      <Circle size={120} position={[-64, -6]} fill={color} />
      <Circle size={160} position={[6, -22]} fill={color} />
      <Circle size={104} position={[76, 0]} fill={color} />
    </Node>
  );
}

/** A rolling green hill. */
export function Hill({
  color = palette.grass,
  ...rest
}: {color?: PossibleColor} & NodeProps) {
  return <Circle fill={color} {...rest} />;
}

export interface WaterProps extends NodeProps {
  /** Any getter for the crest phase, so scenes can offset one band from another. */
  phase: () => number;
  color?: PossibleColor;
  amplitude?: number;
  wavelength?: number;
  depth?: number;
}

/**
 * One band of water. The crest is a live sine over x driven by `phase`, so
 * tweening that signal rolls the swell across the screen.
 */
export function Water({
  phase,
  color = palette.water,
  amplitude = 26,
  wavelength = 260,
  depth = 700,
  ...rest
}: WaterProps) {
  return (
    <Line
      points={() => {
        const points: [number, number][] = [];
        for (let x = -1060; x <= 1060; x += 40) {
          points.push([x, Math.sin(x / wavelength + phase()) * amplitude]);
        }
        points.push([1060, depth], [-1060, depth]);
        return points;
      }}
      closed
      fill={color}
      {...rest}
    />
  );
}

/** Convenience: a water phase signal plus the tween target for one full roll. */
export function makeSwell(start = 0) {
  return createSignal(start);
}

export interface ConfettiProps extends NodeProps {
  count?: number;
  seed?: number;
  spread?: number;
}

/**
 * A burst of paper. Every piece is laid out along a ring at scale 0; the scene
 * animates the wrapper's scale up to throw them outward.
 */
export function Confetti({
  count = 34,
  seed = 3,
  spread = 620,
  ...rest
}: ConfettiProps) {
  const random = seeded(seed);
  const bits: Node[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (random() - 0.5) * 0.4;
    const reach = spread * (0.55 + random() * 0.45);
    bits.push(
      <Rect
        size={[16 + random() * 18, 10 + random() * 14]}
        radius={4}
        position={[Math.cos(angle) * reach, Math.sin(angle) * reach]}
        rotation={random() * 360}
        fill={rainbow[i % rainbow.length]}
      />,
    );
  }

  return <Node {...rest}>{bits}</Node>;
}

export interface RainProps extends NodeProps {
  count?: number;
  seed?: number;
}

/** A curtain of drops. Scenes slide this down and loop it. */
export function Rain({count = 90, seed = 12, ...rest}: RainProps) {
  const random = seeded(seed);
  const drops: Node[] = [];

  for (let i = 0; i < count; i++) {
    drops.push(
      <Rect
        size={[9, 44 + random() * 50]}
        radius={5}
        position={[(random() - 0.5) * 2100, (random() - 0.5) * 1200]}
        fill={palette.foam}
        opacity={0.45 + random() * 0.45}
      />,
    );
  }

  return <Node {...rest}>{drops}</Node>;
}

export interface RainbowProps extends NodeProps {
  radius?: number;
  band?: number;
}

/**
 * Six arcs. Each band is a stroked circle drawn only across the top half, so
 * the scene can sweep them in by tweening `end` from 0 to 1.
 */
export function Rainbow({radius = 560, band = 54, ...rest}: RainbowProps) {
  const arcs: Node[] = [];
  rainbow.forEach((color, i) => {
    arcs.push(
      <Circle
        size={(radius - i * band) * 2}
        stroke={color}
        lineWidth={band}
        lineCap={'butt'}
        startAngle={180}
        endAngle={360}
        end={0}
      />,
    );
  });
  return <Node {...rest}>{arcs}</Node>;
}
