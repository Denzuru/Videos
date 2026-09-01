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

/** A rolling hill, green at home and sand-coloured in Egypt. */
export function Hill({
  color = palette.grass,
  ...rest
}: {color?: PossibleColor} & NodeProps) {
  return <Circle fill={color} {...rest} />;
}

export function Pyramid({
  size = 520,
  color = palette.dune,
  shade = palette.duneShade,
  ...rest
}: {size?: number; color?: PossibleColor; shade?: PossibleColor} & NodeProps) {
  const h = size * 0.78;
  return (
    <Node {...rest}>
      <Line
        points={[
          [-size / 2, 0],
          [size / 2, 0],
          [0, -h],
        ]}
        closed
        radius={8}
        fill={color}
        stroke={palette.ink}
        lineWidth={9}
      />
      {/* the lit face */}
      <Line
        points={[
          [0, 0],
          [size / 2, 0],
          [0, -h],
        ]}
        closed
        fill={shade}
      />
    </Node>
  );
}

export function PalmTree({...rest}: NodeProps) {
  const fronds: Node[] = [];
  for (let i = 0; i < 6; i++) {
    const a = -150 + i * 32;
    fronds.push(
      <Line
        points={[
          [0, 0],
          [70, -26],
          [140, 6],
        ]}
        stroke={'#2f9e50'}
        lineWidth={26}
        lineCap={'round'}
        lineJoin={'round'}
        rotation={a}
      />,
    );
  }
  return (
    <Node {...rest}>
      <Line
        points={[
          [0, 0],
          [-14, -110],
          [6, -220],
        ]}
        stroke={'#a8763c'}
        lineWidth={28}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Node position={[6, -220]}>{fronds}</Node>
      <Circle size={26} position={[6, -216]} fill={palette.terracotta} />
    </Node>
  );
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
  color = palette.nile,
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

export function makeSwell(start = 0) {
  return createSignal(start);
}

export interface StarfieldProps extends NodeProps {
  count?: number;
  seed?: number;
  tint?: PossibleColor;
}

/** Night sky for the dream scenes. Cached, since it never changes shape. */
export function Starfield({
  count = 90,
  seed = 7,
  tint = palette.cream,
  ...rest
}: StarfieldProps) {
  const random = seeded(seed);
  const stars: Node[] = [];
  for (let i = 0; i < count; i++) {
    stars.push(
      <Circle
        position={[(random() - 0.5) * 2100, (random() - 0.5) * 1150]}
        size={3 + random() * 8}
        fill={tint}
        opacity={0.35 + random() * 0.6}
      />,
    );
  }
  return (
    <Node cache cachePadding={20} {...rest}>
      {stars}
    </Node>
  );
}

/** A five-pointed star, for the eleven that bow in Joseph's dream. */
export function Star({
  color = palette.sun,
  size = 100,
  ...rest
}: {color?: PossibleColor; size?: number} & NodeProps) {
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 50 : 21;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    points.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return (
    <Node {...rest}>
      <Node scale={size / 100}>
        <Line
          points={points}
          closed
          fill={color}
          stroke={palette.ink}
          lineWidth={8}
          lineJoin={'round'}
          {...glow(color as string, 30)}
        />
      </Node>
    </Node>
  );
}

export interface ConfettiProps extends NodeProps {
  count?: number;
  seed?: number;
  spread?: number;
}

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

export interface RayBurstProps extends NodeProps {
  count?: number;
  color?: PossibleColor;
  length?: number;
}

/** A wheel of tapered light beams, wide at the source and pointed outward. */
export function RayBurst({
  count = 18,
  color = palette.sun,
  length = 900,
  ...rest
}: RayBurstProps) {
  const beams: Node[] = [];
  for (let i = 0; i < count; i++) {
    const long = i % 2 === 0;
    const reach = long ? length : length * 0.6;
    const spread = long ? 46 : 30;
    beams.push(
      <Line
        points={[
          [-spread, 0],
          [spread, 0],
          [0, -reach],
        ]}
        closed
        fill={color}
        opacity={long ? 0.22 : 0.13}
        rotation={(360 / count) * i}
      />,
    );
  }
  return <Node {...rest}>{beams}</Node>;
}

/** A bundle of wheat. Eleven of them bow to Joseph's in the first dream. */
export function Sheaf({...rest}: NodeProps) {
  const stalks: Node[] = [];
  for (let i = 0; i < 7; i++) {
    const lean = -18 + i * 6;
    stalks.push(
      <Node rotation={lean}>
        <Rect size={[13, 190]} radius={7} y={-95} fill={palette.wheat} />
        <Circle size={44} y={-196} fill={palette.wheatDeep} />
        <Circle size={30} y={-214} fill={palette.wheat} />
      </Node>,
    );
  }
  return (
    <Node {...rest}>
      {stalks}
      <Rect size={[120, 32]} radius={16} y={-84} fill={palette.terracotta} />
    </Node>
  );
}

/** A sack of grain, for the storehouse years. */
export function GrainSack({
  color = '#cfa15c',
  ...rest
}: {color?: PossibleColor} & NodeProps) {
  return (
    <Node {...rest}>
      <Rect
        size={[120, 130]}
        radius={[40, 40, 18, 18]}
        y={-66}
        fill={color}
        stroke={palette.ink}
        lineWidth={8}
      />
      <Rect size={[70, 24]} radius={12} y={-128} fill={palette.wheatDeep} />
      <Circle size={22} position={[-24, -70]} fill={palette.wheat} />
      <Circle size={22} position={[8, -56]} fill={palette.wheat} />
      <Circle size={18} position={[30, -78]} fill={palette.wheat} />
    </Node>
  );
}
