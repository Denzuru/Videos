import {Gradient, Rect, Txt, TxtProps} from '@motion-canvas/2d';
import {
  all,
  easeInCubic,
  easeOutCubic,
  waitFor,
} from '@motion-canvas/core';
import {narrationText, palette} from '../theme';

/** The read-aloud line that sits along the bottom of every scene. */
export function Caption(props: TxtProps) {
  return (
    <Txt
      {...narrationText}
      y={382}
      opacity={0}
      width={1500}
      textWrap
      {...props}
    />
  );
}

/**
 * Show one narration line, hold it long enough for a child to read it, then
 * clear it. `hold` is the reading time in seconds, not the total duration.
 */
export function* say(caption: Txt, text: string, hold = 2.6) {
  caption.text(text);
  caption.y(414);
  yield* all(
    caption.opacity(1, 0.5, easeOutCubic),
    caption.y(382, 0.5, easeOutCubic),
  );
  yield* waitFor(hold);
  yield* all(
    caption.opacity(0, 0.4, easeInCubic),
    caption.y(360, 0.4, easeInCubic),
  );
}

/** Speak several lines back to back. */
export function* sayAll(caption: Txt, lines: [string, number?][]) {
  for (const [text, hold] of lines) {
    yield* say(caption, text, hold ?? 2.6);
  }
}

export interface BackdropProps {
  from?: string;
  to?: string;
}

/**
 * Full-bleed vertical gradient. Scenes stack two of these and cross-fade the
 * opacity of the warmer one, which is how the film travels from night to dawn.
 */
export function Backdrop({
  from = palette.nightDeep,
  to = palette.night,
  ...rest
}: BackdropProps & Record<string, unknown>) {
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
            {offset: 0, color: from},
            {offset: 1, color: to},
          ],
        })
      }
      {...rest}
    />
  );
}
