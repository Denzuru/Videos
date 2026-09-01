import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Slam, makeNarrator} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The offer, stated by subtraction: three things it is not, then the two words
 * it is. The plate is the outstretched hand, and the camera creeps towards it
 * for the whole scene, so the picture is making the invitation before the
 * narration gets to it.
 */
export default makeScene2D('06-the-offer', function* (view) {
  const plate = createRef<Node>();
  const caption = createRef<Txt>();
  const word = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/07-reaching.jpg', {grade: 'warm', scale: 1.0}));
  view.add(<Caption ref={caption} />);
  view.add(<Slam ref={word} y={-300} />);

  const narrator = makeNarrator(view, caption(), '06-the-offer');

  yield view.opacity(0).opacity(1, 0.6);
  yield drift(plate(), 17, {zoom: 0.13, pan: [40, 20]});
  yield narrator.begin();

  yield* narrator.speak('So here is the offer,\nand it is scandalous.');
  yield* narrator.speak('Not clean yourself up first.');
  yield* narrator.speak('Not try harder for another year.');
  yield* narrator.speak('JUST COME.', {node: word(), pop: true});
  yield* narrator.speak('Grace is not a prize for the good.\nIt is a rescue for the drowning.');
  yield* narrator.speak('And His hand is already out.');

  yield* narrator.untilDone();
  yield* waitFor(0.3);
});
