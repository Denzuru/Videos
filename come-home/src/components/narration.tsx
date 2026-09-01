import {Audio, Txt, TxtProps, View2D} from '@revideo/2d';
import {
  ThreadGenerator,
  all,
  easeInCubic,
  easeOutBack,
  easeOutCubic,
  useThread,
  waitFor,
} from '@revideo/core';
import narration from '../narration.json';
import type {SceneKey} from '../narration-lines';
import {captionText, labelText, slamText, verseText} from '../theme';

interface SpeakOptions {
  /** Caption this line somewhere other than the scene's caption line. */
  node?: Txt;
  /** Snap it in oversized instead of floating it up: for the word slams. */
  pop?: boolean;
  /** Leave it on screen when the line ends, for text that accumulates. */
  keep?: boolean;
}

interface SceneNarration {
  src: string;
  duration: number;
  lines: {id: string; start: number; end: number}[];
}

/** The caption line, low in the frame where a thumb is not covering it. */
export function Caption(props: TxtProps) {
  return <Txt {...captionText} y={560} opacity={0} width={920} textWrap {...props} />;
}

/** The one-word slam that lands in the middle of the frame. */
export function Slam(props: TxtProps) {
  return <Txt {...slamText} opacity={0} scale={1.25} {...props} />;
}

/** Scripture and the prayer. */
export function Verse(props: TxtProps) {
  return <Txt {...verseText} opacity={0} width={880} textWrap {...props} />;
}

export function Label(props: TxtProps) {
  return <Txt {...labelText} opacity={0} {...props} />;
}

/**
 * Build the narrator for one scene.
 *
 * Revideo renders only the first Audio node a scene adds and silently drops the
 * rest, so a scene plays its whole recording from one node and the captions are
 * timed to offsets inside it: `speak` waits until the narrator reaches its line,
 * holds the caption for as long as the line runs, then clears it.
 *
 * Call `begin()` on the scene's own thread the moment the picture is up.
 */
export function makeNarrator(view: View2D, caption: Txt, scene: SceneKey) {
  const track = (narration as Record<string, SceneNarration>)[scene];
  if (!track) {
    throw new Error(`No recording for scene "${scene}". Run npm run voiceover.`);
  }

  let startedAt = 0;
  let spoken = 0;

  const intoTrack = () => useThread().time() - startedAt;

  function* begin() {
    startedAt = useThread().time();
    view.add(<Audio src={track.src} play volume={1} />);
    yield;
  }

  /** Wait until the narrator is about to say the next line, and say nothing. */
  function* cueTo(index: number) {
    const line = track.lines[index];
    if (!line) return;
    yield* waitFor(Math.max(0, line.start - intoTrack()));
  }

  /**
   * Caption the next line in the recording.
   *
   * If an animation has run past the pause the line was meant to fit into, the
   * caption arrives late and holds for correspondingly less, so the next line
   * catches back up instead of the error accumulating down the scene.
   */
  function* speak(
    text: string,
    {node = caption, pop = false, keep = false}: SpeakOptions = {},
  ) {
    const line = track.lines[spoken++];
    if (!line) {
      throw new Error(`More speak() calls than recorded lines in "${scene}".`);
    }

    const late = Math.max(0, intoTrack() - line.start);
    yield* waitFor(Math.max(0, line.start - intoTrack()));

    node.text(text);
    if (pop) {
      node.scale(1.28);
      yield* all(node.opacity(1, 0.12), node.scale(1, 0.26, easeOutBack));
    } else {
      node.y(node.y() + 28);
      yield* all(
        node.opacity(1, 0.22, easeOutCubic),
        node.y(node.y() - 28, 0.28, easeOutBack),
      );
    }

    const length = line.end - line.start;
    const entered = pop ? 0.26 : 0.22;
    yield* waitFor(Math.max(0.25, length - entered - (keep ? 0 : 0.16) - late));

    if (keep) {
      return;
    }
    if (pop) {
      yield* all(node.opacity(0, 0.24, easeInCubic), node.scale(1.06, 0.24));
    } else {
      yield* all(
        node.opacity(0, 0.16, easeInCubic),
        node.y(node.y() - 16, 0.16, easeInCubic),
      );
      node.y(node.y() + 16);
    }
  }

  /** Say a line while something else happens alongside it. */
  function* speakWith(text: string, ...alongside: ThreadGenerator[]) {
    yield* all(speak(text), ...alongside);
  }

  /** How long the line about to be spoken runs, for timing a move to it. */
  const lengthOf = (index: number) => {
    const line = track.lines[index];
    return line ? line.end - line.start : 0;
  };

  /** Hold until the recording is finished, so a cut never clips the voice. */
  function* untilDone() {
    yield* waitFor(Math.max(0, track.duration - intoTrack()));
  }

  return {begin, speak, speakWith, cueTo, lengthOf, untilDone};
}

/** The word slam: snaps in oversized, settles, holds, and lets go. */
export function* slam(word: Txt, text: string, hold = 0.8) {
  word.text(text);
  word.scale(1.3);
  word.opacity(0);
  yield* all(word.opacity(1, 0.12), word.scale(1, 0.26, easeOutBack));
  yield* waitFor(hold);
  yield* all(word.opacity(0, 0.28, easeInCubic), word.scale(1.06, 0.28));
}

/** Fade a line of type up, hold, fade it out. For text with no voice under it. */
export function* show(node: Txt, text: string, hold = 1.6, rise = 30) {
  node.text(text);
  node.y(node.y() + rise);
  yield* all(node.opacity(1, 0.5, easeOutCubic), node.y(node.y() - rise, 0.6, easeOutCubic));
  yield* waitFor(hold);
  yield* node.opacity(0, 0.4, easeInCubic);
}
