import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Slam, makeNarrator} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The word the film has been circling. It is named plainly and defended
 * honestly - the point is the distance, not the shame - and the canyon carries
 * the argument so the narration never has to raise its voice.
 */
export default makeScene2D('03-the-gap', function* (view) {
  const plate = createRef<Node>();
  const caption = createRef<Txt>();
  const word = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/03-the-gap.jpg', {grade: 'cold', scale: 1.0}));
  view.add(<Caption ref={caption} />);
  view.add(<Slam ref={word} y={-260} />);

  const narrator = makeNarrator(view, caption(), '03-the-gap');

  yield view.opacity(0).opacity(1, 0.5);
  yield drift(plate(), 19, {zoom: 0.12, pan: [0, 60]});
  yield narrator.begin();

  yield* narrator.speak('The Bible has a word for it.');
  yield* narrator.speak('SIN', {node: word(), pop: true});

  yield* narrator.speak('And it is not God being petty.');
  yield* narrator.speak('It is a canyon.');
  yield* narrator.speak('Every good thing you have ever done,\nstacked to the sky, still does not\nreach the other side.');
  yield* narrator.speak('Nobody has ever climbed out.');
  yield* narrator.speak('Not one person. Ever.');

  yield* narrator.untilDone();
  yield* waitFor(0.2);
});
