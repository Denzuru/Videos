import {Audio, Txt, TxtProps, View2D} from '@revideo/2d';
import {
  all,
  createRef,
  easeInBack,
  easeInCubic,
  easeOutBack,
  easeOutCubic,
  useThread,
  waitFor,
} from '@revideo/core';
import narration from '../narration.json';
import type {SceneKey} from '../narration-lines';
import {narrationText, palette, punchText} from '../theme';

/** The read-aloud line along the bottom of every scene. */
interface SceneNarration {
  src: string;
  duration: number;
  lines: {id: string; start: number; end: number}[];
}

export function Caption(props: TxtProps) {
  return (
    <Txt {...narrationText} y={412} opacity={0} width={1560} textWrap {...props} />
  );
}

/**
 * Build the narrator for one scene.
 *
 * The whole scene is recorded as one track and played by a single Audio node,
 * because Revideo renders only the first Audio node a scene adds and silently
 * drops the rest. The captions are therefore timed to offsets inside that one
 * recording: `speak` waits until the narrator reaches its line, holds the
 * caption for exactly as long as the line runs, then clears it.
 *
 * Call `begin()` on the scene's own thread once the opening transition is
 * done; that is the moment the recording starts.
 */
export function makeNarrator(view: View2D, caption: Txt, scene: SceneKey) {
  const track = (narration as Record<string, SceneNarration>)[scene];
  if (!track) {
    throw new Error(`No recording for scene "${scene}". Run scripts/build-voiceover.mjs.`);
  }

  // When the recording started, on the scene clock, and which line is next.
  let startedAt = 0;
  let spoken = 0;

  /** How far into the recording the scene currently is. */
  const intoTrack = () => useThread().time() - startedAt;

  function* begin() {
    startedAt = useThread().time();
    view.add(<Audio src={track.src} play volume={1} />);
    yield;
  }

  function* speak(text: string) {
    const line = track.lines[spoken++];
    if (!line) {
      throw new Error(`More speak() calls than recorded lines in "${scene}".`);
    }

    // Wait for the narrator to reach this line. If an animation ran past the
    // pause it was meant to fit in, we are late instead, and the caption holds
    // for correspondingly less, so the next line catches back up rather than
    // the error piling up down the scene.
    const late = Math.max(0, intoTrack() - line.start);
    yield* waitFor(Math.max(0, line.start - intoTrack()));

    caption.text(text);
    caption.y(446);
    caption.scale(0.9);
    yield* all(
      caption.opacity(1, 0.24, easeOutCubic),
      caption.y(412, 0.24, easeOutBack),
      caption.scale(1, 0.24, easeOutBack),
    );

    const length = line.end - line.start;
    yield* waitFor(Math.max(0.3, length - 0.24 - 0.18 - late));
    yield* all(
      caption.opacity(0, 0.18, easeInCubic),
      caption.y(392, 0.18, easeInCubic),
    );
  }

  /** Hold until the recording has finished, so a scene never cuts the voice off. */
  function* untilDone() {
    yield* waitFor(Math.max(0, track.duration - intoTrack()));
  }

  return {begin, speak, untilDone};
}

/**
 * Caption-only version, for a line with no recording. Kept for authoring new
 * lines before the voice for them exists.
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
