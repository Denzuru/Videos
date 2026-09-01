import {Gradient, Img, Node, Rect} from '@revideo/2d';
import {Reference, all, createRef, easeInOutSine, easeOutCubic, waitFor} from '@revideo/core';
import {frame, palette} from '../theme';

/**
 * Every shot in the film is one photographic plate under the same three layers:
 * a colour wash that grades it into the part of the story it belongs to, a
 * vignette that pulls the eye to the middle, and a scrim at the bottom that the
 * caption sits on. Without the scrim a white caption disappears the moment the
 * plate is a sunrise.
 *
 * The plates are 1350x2400 against a 1080x1920 frame, a deliberate 25% of slack
 * so the camera can push in and drift without ever showing an edge.
 */

/** How far outside the frame the plate extends, per side, at rest. */
const OVERSCAN = 1.25;

export interface PlateOptions {
  /** 'cold' before the cross, 'warm' after it. */
  grade?: 'cold' | 'warm' | 'none';
  /** Starting scale of the plate; the push-in animates away from it. */
  scale?: number;
  /** Where the plate sits at rest, in frame pixels. */
  offset?: [number, number];
}

export function Plate(
  ref: Reference<Node>,
  src: string,
  {grade = 'cold', scale = 1, offset = [0, 0]}: PlateOptions = {},
) {
  const wash =
    grade === 'warm'
      ? 'rgba(255, 150, 60, 0.16)'
      : grade === 'cold'
        ? 'rgba(20, 60, 120, 0.24)'
        : 'rgba(0, 0, 0, 0)';

  return (
    <Node ref={ref} scale={scale} position={offset}>
      <Img
        src={src}
        width={frame.width * OVERSCAN}
        height={frame.height * OVERSCAN}
      />

      {/* Grade. One flat wash is enough: the plates are already lit for this. */}
      <Rect width={frame.width * OVERSCAN} height={frame.height * OVERSCAN} fill={wash} />

      {/* Vignette. */}
      <Rect
        width={frame.width * OVERSCAN}
        height={frame.height * OVERSCAN}
        fill={
          new Gradient({
            type: 'radial',
            from: [0, 0],
            to: [0, 0],
            fromRadius: 520,
            toRadius: 1500,
            stops: [
              {offset: 0, color: 'rgba(0, 0, 0, 0)'},
              {offset: 0.65, color: 'rgba(0, 0, 0, 0.35)'},
              {offset: 1, color: 'rgba(0, 0, 0, 0.78)'},
            ],
          })
        }
      />

      {/* Caption scrim, bottom third. */}
      <Rect
        width={frame.width * OVERSCAN}
        height={frame.height * OVERSCAN}
        fill={
          new Gradient({
            type: 'linear',
            from: [0, 0],
            to: [0, frame.height * OVERSCAN * 0.5],
            stops: [
              {offset: 0, color: 'rgba(0, 0, 0, 0)'},
              {offset: 0.45, color: 'rgba(0, 0, 0, 0.45)'},
              {offset: 1, color: 'rgba(0, 0, 0, 0.86)'},
            ],
          })
        }
      />
    </Node>
  );
}

/**
 * The slow push-in that runs under a whole scene.
 *
 * Start it on its own thread and let it run for the length of the scene; the
 * movement is small on purpose, just enough that a still photograph never reads
 * as a still photograph.
 */
export function* drift(
  plate: Node,
  seconds: number,
  {zoom = 0.08, pan = [0, 0] as [number, number]} = {},
) {
  const from = plate.scale();
  yield* all(
    plate.scale(from.mul(1 + zoom), seconds, easeInOutSine),
    plate.position(plate.position().add(pan), seconds, easeInOutSine),
  );
}

/** A hard white frame, one beat long: the cut that lands on a hit. */
export function* flash(view: Node, hold = 0.06) {
  const ref = createRef<Rect>();
  view.add(
    <Rect
      ref={ref}
      width={frame.width}
      height={frame.height}
      fill={palette.white}
      opacity={0}
    />,
  );
  yield* ref().opacity(0.9, 0.05);
  yield* waitFor(hold);
  yield* ref().opacity(0, 0.35, easeOutCubic);
  ref().remove();
}
