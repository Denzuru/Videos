import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Slam, makeNarrator} from '../components/narration';
import {Plate, drift, flash} from '../components/plate';
import {palette} from '../theme';

/**
 * The claim the whole thing stands or falls on, made in four short lines and
 * then left alone. The push-in runs straight at the light in the tomb mouth so
 * the shot is still opening up as the words land.
 */
export default makeScene2D('05-alive', function* (view) {
  const plate = createRef<Node>();
  const caption = createRef<Txt>();
  const word = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/06-tomb.jpg', {grade: 'warm', scale: 1.0}));
  view.add(<Caption ref={caption} />);
  view.add(<Slam ref={word} y={-240} width={940} textWrap fontSize={132} lineHeight={144} />);

  const narrator = makeNarrator(view, caption(), '05-alive');

  yield view.opacity(0).opacity(1, 0.5);
  yield flash(view, 0.04);
  yield drift(plate(), 13.5, {zoom: 0.16, pan: [-30, 0]});
  yield narrator.begin();

  yield* narrator.speak('And three days later,\nthe tomb was empty.');
  yield* narrator.speak('Not a metaphor. Not a legend.');
  yield* narrator.speak('A stone rolled back, and a receipt\nwritten in daylight.');
  yield* narrator.speak('PAID IN FULL.\nDEATH LOST.', {node: word(), pop: true});

  yield* narrator.untilDone();
  yield* waitFor(0.3);
});
