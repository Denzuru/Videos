import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Slam, makeNarrator} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The diagnosis, still without a single religious word: the noise everybody
 * uses to keep the question quiet. It ends on the question itself, held on
 * screen on its own, because that is the hinge the rest of the film turns on.
 */
export default makeScene2D('02-running', function* (view) {
  const plate = createRef<Node>();
  const caption = createRef<Txt>();
  const word = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/02-running.jpg', {grade: 'cold', scale: 1.02}));
  view.add(<Caption ref={caption} />);
  view.add(<Slam ref={word} y={-120} width={940} textWrap fontSize={104} lineHeight={116} />);

  const narrator = makeNarrator(view, caption(), '02-running');

  yield view.opacity(0).opacity(1, 0.5);
  yield drift(plate(), 16.5, {zoom: 0.1, pan: [50, 0]});
  yield narrator.begin();

  yield* narrator.speak('So you keep moving.');
  yield* narrator.speak('Louder music. Longer hours.');
  yield* narrator.speak('Another screen at two in the morning.');
  yield* narrator.speak('Anything, so it stays quiet in there.');
  yield* narrator.speak('But sooner or later everybody\nmeets the same question.');

  yield* narrator.speak('What do I do\nwith what I have done?', {node: word(), pop: true});

  yield* narrator.untilDone();
  yield* waitFor(0.2);
});
