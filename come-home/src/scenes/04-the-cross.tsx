import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Slam, makeNarrator} from '../components/narration';
import {Plate, drift, flash} from '../components/plate';
import {palette} from '../theme';

/**
 * The turn. Everything before this scene is graded cold; from the flash on
 * "He paid it" the film never goes back. The scarred hand cuts in for one line
 * and leaves - close enough to be personal, brief enough not to be gruesome.
 */
export default makeScene2D('04-the-cross', function* (view) {
  const crosses = createRef<Node>();
  const hand = createRef<Node>();
  const caption = createRef<Txt>();
  const word = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(crosses, '/img/04-the-cross.jpg', {grade: 'cold', scale: 1.0}));
  view.add(Plate(hand, '/img/05-hand.jpg', {grade: 'warm', scale: 1.08}));
  view.add(<Caption ref={caption} />);
  view.add(<Slam ref={word} y={-200} width={960} textWrap fontSize={128} lineHeight={140} />);

  hand().opacity(0);

  const narrator = makeNarrator(view, caption(), '04-the-cross');

  yield view.opacity(0).opacity(1, 0.6);
  yield drift(crosses(), 20, {zoom: 0.14, pan: [0, 40]});
  yield narrator.begin();

  yield* narrator.speak('So God did the last thing\nanybody expected.');

  yield flash(view);
  yield* narrator.speak('He did not lower the standard.\nHe paid it.');

  yield* narrator.speak('Two thousand years ago, the one man\nwho never earned death took yours.');

  // The hand, for one line only.
  yield hand().opacity(1, 0.5);
  yield drift(hand(), 6, {zoom: 0.1});
  yield* narrator.speak('Nails through the hands\nof the God who made hands.');
  yield hand().opacity(0, 0.7);

  yield* narrator.speak('He was not losing.\nHe was choosing.');
  yield* narrator.speak('HE WAS CHOOSING YOU.', {node: word(), pop: true});

  yield* narrator.untilDone();
  yield* waitFor(0.3);
});
