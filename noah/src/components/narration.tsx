import {Txt, TxtProps} from '@revideo/2d';
import {
  all,
  easeInBack,
  easeInCubic,
  easeOutBack,
  easeOutCubic,
  waitFor,
} from '@revideo/core';
import {narrationText, palette, punchText} from '../theme';

/** The read-aloud line along the bottom of every scene. */
export function Caption(props: TxtProps) {
  return (
    <Txt {...narrationText} y={412} opacity={0} width={1560} textWrap {...props} />
  );
}

/**
 * Show one narration line, hold it, clear it. `hold` is reading time in
 * seconds. The pace here is brisker than a bedtime story on purpose.
 */
export function* say(caption: Txt, text: string, hold = 1.9) {
  caption.text(text);
  caption.y(446);
  caption.scale(0.9);
  yield* all(
    caption.opacity(1, 0.32, easeOutCubic),
    caption.y(412, 0.32, easeOutBack),
    caption.scale(1, 0.32, easeOutBack),
  );
  yield* waitFor(hold);
  yield* all(
    caption.opacity(0, 0.24, easeInCubic),
    caption.y(392, 0.24, easeInCubic),
  );
}

/** A big comic-book word that slams in, wobbles and snaps away. */
export function PunchWord(props: TxtProps) {
  return <Txt {...punchText} fontSize={150} opacity={0} scale={0} {...props} />;
}

export function* punch(word: Txt, text: string, hold = 0.7, tilt = -7) {
  word.text(text);
  word.rotation(tilt);
  yield* all(word.opacity(1, 0.16), word.scale(1.18, 0.22, easeOutBack));
  yield* word.scale(1, 0.12, easeOutCubic);
  yield* waitFor(hold);
  yield* all(word.scale(0, 0.24, easeInBack), word.opacity(0, 0.24));
}

export const captionInk = palette.ink;
