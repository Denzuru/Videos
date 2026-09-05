import {Line, Node, Path, Rect} from '@revideo/2d';
import type {SimpleSignal} from '@revideo/core';
import {ink, mulberry, pencil} from '../theme';

/* ------------------------------------------------------------------ Bow --- */

/**
 * The bow lies horizontally with its grip at the origin and its limbs
 * sweeping down and out to the tips, where the string is fixed. `d` is how
 * far it is drawn, 0 (resting) to 1 (full draw): the limbs bend and the tips
 * come inward, and the string's centre travels down with the arrow's nock.
 */
export function limbPath(d: number, side: 1 | -1): string {
  const p = (x: number, y: number) => `${(x * side).toFixed(1)},${y.toFixed(1)}`;
  return (
    `M ${p(46, 0)} ` +
    `C ${p(170, 30 + 25 * d)} ${p(300, 75 + 70 * d)} ${p(400, 88 + 95 * d)} ` +
    `C ${p(440, 92 + 100 * d)} ${p(468, 85 + 95 * d)} ${p(478 - 45 * d, 70 + 90 * d)}`
  );
}

export const tipX = (d: number) => 478 - 45 * d;
export const tipY = (d: number) => 70 + 90 * d;
export const nockY = (d: number) => 70 + 420 * d;

export function Bow({draw, drawn}: {draw: SimpleSignal<number>; drawn: SimpleSignal<number>}) {
  // Outline, wood body, a grain line and a highlight make an outlined pencil
  // shape. Returned as a flat array: Node.add does not flatten nested fragments.
  const limbs = ([1, -1] as const).flatMap(side => [
    <Path data={() => limbPath(draw(), side)} {...pencil} lineWidth={14} stroke={ink.dark} end={drawn} />,
    <Path data={() => limbPath(draw(), side)} lineWidth={8} stroke={ink.wood} lineCap={'round'} end={drawn} />,
    <Path data={() => limbPath(draw(), side)} lineWidth={2} stroke={ink.mid} lineCap={'round'} y={2} opacity={0.8} end={drawn} />,
    <Path data={() => limbPath(draw(), side)} lineWidth={1.5} stroke={ink.highlight} lineCap={'round'} y={-2.5} opacity={0.9} end={drawn} />,
  ]);

  const hatch = [-36, -26, -16, -6, 4, 14, 24, 34].map(x => (
    <Line points={[[x, -19], [x + 3, 19]]} stroke={ink.dark} lineWidth={2.5} lineCap={'round'} opacity={0.85} />
  ));

  return (
    <Node>
      <Line
        points={() => [
          [-tipX(draw()), tipY(draw())],
          [0, nockY(draw())],
          [tipX(draw()), tipY(draw())],
        ]}
        stroke={ink.line}
        lineWidth={2.5}
        lineCap={'round'}
        end={drawn}
      />
      {limbs}
      <Node opacity={drawn}>
        <Rect width={98} height={42} radius={12} fill={ink.wood} stroke={ink.dark} lineWidth={4.5} />
        {hatch}
      </Node>
    </Node>
  );
}

/* ---------------------------------------------------------------- Arrow --- */

export const ARROW_LENGTH = 880;

/** An arrow pointing straight up, nock at the origin, head at y = -ARROW_LENGTH. */
export function Arrow() {
  const L = ARROW_LENGTH;
  const vaneHatch = [0, 1, 2, 3, 4].flatMap(i => [
    <Line points={[[-7, -52 - i * 16], [-30, -84 - i * 16]]} stroke={ink.mid} lineWidth={2} lineCap={'round'} />,
    <Line points={[[7, -52 - i * 16], [30, -84 - i * 16]]} stroke={ink.mid} lineWidth={2} lineCap={'round'} />,
  ]);
  return (
    <Node>
      {/* shaft: dark outline with a lighter core so it reads as a round rod */}
      <Line points={[[0, -8], [0, -(L - 50)]]} {...pencil} lineWidth={9} stroke={ink.dark} />
      <Line points={[[0, -8], [0, -(L - 50)]]} lineWidth={4} stroke={ink.wood} lineCap={'round'} />
      <Line points={[[-1.5, -8], [-1.5, -(L - 50)]]} lineWidth={1.2} stroke={ink.highlight} lineCap={'round'} />
      {/* head */}
      <Path
        data={`M 0,${-L} L -22,${-L + 66} L 0,${-L + 50} L 22,${-L + 66} Z`}
        fill={'#5a5a5a'}
        stroke={ink.dark}
        lineWidth={3.5}
        lineJoin={'round'}
      />
      <Line points={[[0, -L + 6], [0, -L + 50]]} stroke={ink.dark} lineWidth={2} />
      <Line points={[[-6, -L + 30], [-14, -L + 54]]} stroke={'#2a2a2a'} lineWidth={1.5} opacity={0.7} />
      <Line points={[[6, -L + 30], [14, -L + 54]]} stroke={'#2a2a2a'} lineWidth={1.5} opacity={0.7} />
      {/* fletching */}
      <Path data={`M -4,-42 L -36,-82 L -36,-160 L -4,-136 Z`} fill={ink.vane} stroke={ink.line} lineWidth={3.5} lineJoin={'round'} />
      <Path data={`M 4,-42 L 36,-82 L 36,-160 L 4,-136 Z`} fill={ink.vane} stroke={ink.line} lineWidth={3.5} lineJoin={'round'} />
      {vaneHatch}
      {/* nock */}
      <Path data={`M -6,4 L -5,-14 L 0,-6 L 5,-14 L 6,4 Z`} fill={ink.wood} stroke={ink.dark} lineWidth={3} lineJoin={'round'} />
    </Node>
  );
}

/* --------------------------------------------------------------- Flecks --- */

export interface Fleck {
  node: Rect;
  start: [number, number];
  velocity: [number, number];
  period: number;
  phase: number;
  opacity: number;
}

/** Little slivers of graphite dust drifting across the sheet. */
export function makeFlecks(count: number, seed: number): Fleck[] {
  const rnd = mulberry(seed);
  return Array.from({length: count}, () => {
    const node = (
      <Rect
        width={3 + rnd() * 3}
        height={10 + rnd() * 22}
        radius={2}
        fill={ink.mid}
        rotation={rnd() * 180}
        opacity={0}
      />
    ) as Rect;
    const angle = rnd() * Math.PI * 2;
    const speed = 60 + rnd() * 140;
    return {
      node,
      start: [(rnd() - 0.5) * 1150, (rnd() - 0.5) * 2000],
      velocity: [Math.cos(angle) * speed, Math.sin(angle) * speed],
      period: 2.5 + rnd() * 3,
      phase: rnd() * 4,
      opacity: 0.4 + rnd() * 0.4,
    };
  });
}

/* ---------------------------------------------------------- Speed lines --- */

export interface SpeedLine {
  node: Line;
  x: number;
  length: number;
  period: number;
  phase: number;
}

/** Streaks that rush past the arrow once it is in flight. */
export function makeSpeedLines(count: number, seed: number): SpeedLine[] {
  const rnd = mulberry(seed);
  return Array.from({length: count}, () => {
    const length = 90 + rnd() * 420;
    const node = (
      <Line
        points={[[0, 0], [0, length]]}
        stroke={ink.line}
        lineWidth={1.5 + rnd() * 3}
        lineCap={'round'}
        opacity={0.15 + rnd() * 0.4}
        x={(rnd() - 0.5) * 1400}
        y={-2000}
      />
    ) as Line;
    return {node, x: node.x(), length, period: 0.35 + rnd() * 0.55, phase: rnd() * 0.9};
  });
}
