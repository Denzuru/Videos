import {Node, Txt, makeScene2D} from '@revideo/2d';
import {createRef, waitFor} from '@revideo/core';
import {Caption, Label, makeNarrator, show} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The hook. Nothing is explained and nothing is asked for; the first thing the
 * film does is describe the viewer to themselves accurately enough that they
 * stay. The title card rides in the same shot rather than sitting in front of
 * it, because a title card before the hook is a title card nobody sees.
 */
export default makeScene2D('01-weight', function* (view) {
  const plate = createRef<Node>();
  const caption = createRef<Txt>();
  const title = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/01-weight.jpg', {grade: 'cold', scale: 1.06}));
  view.add(<Caption ref={caption} />);
  view.add(
    <Txt
      ref={title}
      y={-620}
      opacity={0}
      fontFamily='"Playfair Display", Georgia, serif'
      fontWeight={700}
      fontSize={126}
      letterSpacing={-2}
      fill={palette.cream}
      shadowColor="rgba(0, 0, 0, 0.8)"
      shadowBlur={30}
    />,
  );

  const narrator = makeNarrator(view, caption(), '01-weight');

  yield view.opacity(0).opacity(1, 1.1);
  yield drift(plate(), 15.5, {zoom: 0.07, pan: [0, -40]});
  yield narrator.begin();

  yield* narrator.speak('You are not tired\nbecause your week was long.');
  yield show(title(), 'COME HOME.', 4.2, 40);
  yield* narrator.speak('You are tired because you are carrying\nsomething you were never built to carry.');
  yield* narrator.speak('Every mistake nobody knows about.');
  yield* narrator.speak('Every night you swore never again,\nand did it again anyway.');

  yield* narrator.untilDone();
  yield* waitFor(0.2);
});
