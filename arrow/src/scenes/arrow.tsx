import {Img, Node, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  cancel,
  chain,
  createRef,
  createSignal,
  delay,
  easeInCubic,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  easeOutExpo,
  linear,
  loop,
  waitFor,
} from '@revideo/core';
import {Arrow, Bow, makeFlecks, makeSpeedLines, nockY} from '../components/sketch';
import {handwriting} from '../theme';

const BOW_Y = 250;
const BOW_SCALE = 0.95;
const TOP_CAPTION_Y = -760;
const FLIGHT_NOCK_Y = 440;
const TILT = 34;

/**
 * When the string is released, in seconds from the start. The music bed is
 * generated to match, so keep scripts/make-music.py's --release in step with
 * the timings below (see package.json).
 */
export const RELEASE_AT = 7.75;

export default makeScene2D('arrow', function* (view) {
  const world = createRef<Node>();
  const bowGroup = createRef<Node>();
  const arrowGroup = createRef<Node>();
  const flecksGroup = createRef<Node>();
  const linesGroup = createRef<Node>();
  const topCaption = createRef<Txt>();
  const flightCaption = createRef<Txt>();

  /** 0 = resting, 1 = full draw. Drives the limbs, the string and the arrow together. */
  const draw = createSignal(0);
  /** Draw-on progress for the bow's line work at the start. */
  const drawn = createSignal(0);

  const flecks = makeFlecks(70, 11);
  const speedLines = makeSpeedLines(44, 23);

  view.add(
    <>
      <Img src={'/paper.png'} size={[1080, 1920]} />

      <Node ref={world}>
        <Node ref={flecksGroup}>{flecks.map(f => f.node)}</Node>
        <Node ref={linesGroup} opacity={0}>{speedLines.map(l => l.node)}</Node>

        <Node ref={bowGroup} y={BOW_Y} scale={BOW_SCALE}>
          <Bow draw={draw} drawn={drawn} />
        </Node>

        <Node ref={arrowGroup} y={() => BOW_Y + BOW_SCALE * nockY(draw())} scale={BOW_SCALE} opacity={0}>
          <Arrow />
        </Node>

        <Txt ref={topCaption} {...handwriting} y={TOP_CAPTION_Y} opacity={0} textAlign={'center'} />

        <Node rotation={-90} x={-88} y={70}>
          <Txt ref={flightCaption} {...handwriting} fontSize={62} opacity={0} textAlign={'center'} />
        </Node>
      </Node>
    </>,
  );

  // Dust drifting across the sheet while the bow is being drawn.
  for (const f of flecks) {
    yield delay(
      f.phase,
      loop(Infinity, function* () {
        f.node.position(f.start);
        f.node.opacity(0);
        yield* all(
          f.node.position(
            [f.start[0] + f.velocity[0] * f.period, f.start[1] + f.velocity[1] * f.period],
            f.period,
            linear,
          ),
          f.node.rotation(f.node.rotation() + 110, f.period, linear),
          chain(
            f.node.opacity(f.opacity, f.period * 0.25),
            waitFor(f.period * 0.5),
            f.node.opacity(0, f.period * 0.25),
          ),
        );
      }),
    );
  }

  // Streaks that rush past once the arrow is in flight (hidden until then).
  for (const l of speedLines) {
    yield delay(
      l.phase,
      loop(Infinity, function* () {
        l.node.y(-1150 - l.length);
        yield* l.node.y(1150, l.period, linear);
      }),
    );
  }

  /** Fade a caption in with a small drift, hold it, fade it out. */
  function* caption(node: Txt, text: string, hold: number, axis: 'x' | 'y', rest: number) {
    node.text(text);
    node.opacity(0);
    node.position[axis](rest + 16);
    yield* all(node.opacity(1, 0.35), node.position[axis](rest, 0.45, easeOutCubic));
    yield* waitFor(hold);
    yield* all(node.opacity(0, 0.3), node.position[axis](rest - 8, 0.3, easeInCubic));
  }
  const top = (text: string, hold: number) => caption(topCaption(), text, hold, 'y', TOP_CAPTION_Y);
  const flight = (text: string, hold: number) => caption(flightCaption(), text, hold, 'x', 0);

  // ---- The bow is drawn on the page ---------------------------------------
  yield* all(
    drawn(1, 1.3, easeInOutCubic),
    delay(0.5, arrowGroup().opacity(1, 0.7)),
    delay(0.5, top('AN ARROW', 1.2)),
  );

  // ---- Pulled back ----------------------------------------------------------
  yield* all(
    draw(1, 3.3, easeInOutSine),
    chain(top('CAN ONLY FLY AS FAR', 1.1), waitFor(0.1), top('AS IT IS PULLED BACK.', 1.3)),
  );

  // Hold at full draw with a slight tremble in the string, and push in on the grip.
  const tremble = yield loop(Infinity, () =>
    chain(draw(0.982, 0.08, easeInOutSine), draw(1, 0.08, easeInOutSine)),
  );
  yield* waitFor(0.4);
  yield* all(
    world().scale(1.45, 0.9, easeInOutCubic),
    world().position.y(120 - 1.45 * BOW_Y, 0.9, easeInOutCubic),
  );

  // ---- Release --------------------------------------------------------------
  cancel(tremble);
  const nockNow = arrowGroup().position.y();
  arrowGroup().position.y(nockNow);
  yield* all(
    draw(0, 0.09, easeOutExpo),
    arrowGroup().position.y(FLIGHT_NOCK_Y, 0.3, easeOutCubic),
    world().scale(1, 0.4, easeOutCubic),
    world().position.y(0, 0.4, easeOutCubic),
    bowGroup().position.y(3200, 0.55, easeInCubic),
    flecksGroup().opacity(0, 0.3),
    delay(0.1, linesGroup().opacity(1, 0.35)),
  );

  // ---- In flight ------------------------------------------------------------
  yield* waitFor(0.2);
  yield* flight('SO IF LIFE', 0.6);
  yield* waitFor(0.1);
  yield* flight('IS DRAGGING YOU', 0.65);
  yield* waitFor(0.1);
  yield* all(
    flight('BACKWARDS...', 0.8),
    delay(0.6, world().rotation(TILT, 1.5, easeInOutCubic)),
  );
  yield* waitFor(0.1);
  yield* flight('HOLD STEADY.', 0.8);
  yield* waitFor(0.1);
  yield* flight('YOU ARE NOT', 0.55);
  yield* waitFor(0.05);
  yield* flight('FALLING BEHIND.', 0.65);
  yield* waitFor(0.2);
  yield* flight('YOU ARE BEING AIMED.', 1.8);

  yield* world().opacity(0, 0.7);
  yield* waitFor(0.2);
});
