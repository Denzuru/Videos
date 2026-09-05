import {Circle, Gradient, Line, Node, Rect} from '@revideo/2d';
import {all, chain, delay, easeInOutSine, linear, loop, waitFor} from '@revideo/core';
import type {ThreadGenerator} from '@revideo/core';
import {mulberry} from '../theme';
import type {Weather} from '../shots';

const W = 1080;
const H = 1920;

/**
 * Builds the weather layer for a shot: the nodes to add and a generator that
 * animates them forever. Every layer is seeded so renders are repeatable.
 */
export function makeWeather(kind: Weather, seed: number): {node: Node; run: () => ThreadGenerator} {
  const rnd = mulberry(seed);
  const node = <Node /> as Node;
  const tasks: (() => ThreadGenerator)[] = [];

  const add = (child: Node, phase: number, body: () => ThreadGenerator) => {
    node.add(child);
    tasks.push(() => delay(phase, loop(Infinity, body)));
  };

  switch (kind) {
    case 'motes': {
      // Warm dust drifting slowly upward through shafts of light.
      for (let i = 0; i < 70; i++) {
        const c = (
          <Circle size={3 + rnd() * 6} fill={'rgba(255, 226, 170, 0.9)'} opacity={0} shadowBlur={8} shadowColor={'rgba(255, 220, 160, 0.8)'} />
        ) as Circle;
        const x = (rnd() - 0.5) * W * 1.1;
        const y0 = (rnd() - 0.4) * H * 1.1;
        const period = 6 + rnd() * 8;
        const o = 0.25 + rnd() * 0.5;
        add(c, rnd() * period, function* () {
          c.position([x, y0]);
          c.opacity(0);
          yield* all(
            c.position([x + (rnd() - 0.5) * 120, y0 - 260 - rnd() * 200], period, linear),
            chain(c.opacity(o, period * 0.3, easeInOutSine), waitFor(period * 0.4), c.opacity(0, period * 0.3, easeInOutSine)),
          );
        });
      }
      break;
    }
    case 'leaves': {
      // Small golden leaves tumbling down through the dark.
      for (let i = 0; i < 34; i++) {
        const leaf = (
          <Rect width={14 + rnd() * 12} height={7 + rnd() * 6} radius={6} fill={'rgba(214, 170, 60, 0.85)'} opacity={0} />
        ) as Rect;
        const x = (rnd() - 0.5) * W * 1.1;
        const period = 7 + rnd() * 7;
        const sway = 60 + rnd() * 120;
        add(leaf, rnd() * period, function* () {
          leaf.position([x, -H * 0.6]);
          leaf.opacity(0);
          leaf.rotation(rnd() * 360);
          yield* all(
            leaf.position.y(H * 0.6, period, linear),
            leaf.rotation(leaf.rotation() + 540, period, linear),
            loop(Math.ceil(period / 2), () =>
              chain(leaf.position.x(x + sway, 1, easeInOutSine), leaf.position.x(x - sway, 1, easeInOutSine)),
            ),
            chain(leaf.opacity(0.9, 0.8), waitFor(period - 1.6), leaf.opacity(0, 0.8)),
          );
        });
      }
      break;
    }
    case 'stars': {
      // A twinkle layer over the painted sky, only in the top half.
      for (let i = 0; i < 80; i++) {
        const s = (
          <Circle size={2 + rnd() * 4} fill={'rgba(255, 250, 235, 0.95)'} opacity={0} shadowBlur={6} shadowColor={'rgba(255, 250, 235, 0.9)'} />
        ) as Circle;
        s.position([(rnd() - 0.5) * W * 1.1, -H * 0.55 + rnd() * H * 0.45]);
        const period = 1.5 + rnd() * 3;
        const o = 0.3 + rnd() * 0.7;
        add(s, rnd() * period, function* () {
          yield* chain(s.opacity(o, period / 2, easeInOutSine), s.opacity(0.05, period / 2, easeInOutSine));
        });
      }
      break;
    }
    case 'mist': {
      // Broad soft pools of fog drifting sideways: ellipses with a radial
      // gradient that fades to nothing at the rim, so there is no visible edge.
      for (let i = 0; i < 9; i++) {
        const w = 1000 + rnd() * 800;
        const h = 220 + rnd() * 260;
        const fog = new Gradient({
          type: 'radial',
          from: [0, 0],
          to: [0, 0],
          fromRadius: 0,
          toRadius: w / 2,
          stops: [
            {offset: 0, color: 'rgba(190, 210, 205, 0.22)'},
            {offset: 0.55, color: 'rgba(190, 210, 205, 0.1)'},
            {offset: 1, color: 'rgba(190, 210, 205, 0)'},
          ],
        });
        const band = (<Circle size={[w, h]} fill={fog} opacity={0} />) as Circle;
        const y = -H * 0.1 + rnd() * H * 0.55;
        const period = 14 + rnd() * 10;
        const dir = rnd() > 0.5 ? 1 : -1;
        add(band, rnd() * period, function* () {
          band.position([-dir * W * 0.9, y]);
          band.opacity(0);
          yield* all(
            band.position.x(dir * W * 0.9, period, linear),
            chain(band.opacity(1, period * 0.25), waitFor(period * 0.5), band.opacity(0, period * 0.25)),
          );
        });
      }
      break;
    }
    case 'rain': {
      // Thin fast streaks, slightly slanted.
      for (let i = 0; i < 90; i++) {
        const len = 60 + rnd() * 140;
        const drop = (
          <Line points={[[0, 0], [len * 0.08, len]]} stroke={'rgba(210, 230, 225, 0.55)'} lineWidth={1 + rnd() * 1.6} lineCap={'round'} opacity={0.3 + rnd() * 0.5} />
        ) as Line;
        const x = (rnd() - 0.5) * W * 1.2;
        const period = 0.55 + rnd() * 0.5;
        add(drop, rnd() * period, function* () {
          drop.position([x, -H * 0.6 - len]);
          yield* all(drop.position.y(H * 0.6, period, linear), drop.position.x(x - period * 90, period, linear));
        });
      }
      break;
    }
  }

  return {node, run: () => all(...tasks.map(t => t()))};
}
