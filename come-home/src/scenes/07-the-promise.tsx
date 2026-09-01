import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {createRef, easeOutCubic, waitFor} from '@revideo/core';
import {Caption, Label, Verse, makeNarrator} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The promise, quoted rather than paraphrased, and set in the serif so it reads
 * as somebody else's words and not the film's. The verse holds on a darkened
 * plate for its whole line: this is the one moment the picture gets out of the
 * way of the text.
 */
export default makeScene2D('07-the-promise', function* (view) {
  const plate = createRef<Node>();
  const dim = createRef<Rect>();
  const caption = createRef<Txt>();
  const verse = createRef<Txt>();
  const reference = createRef<Txt>();

  view.fill(palette.night);
  view.add(Plate(plate, '/img/10-prayer.jpg', {grade: 'warm', scale: 1.02}));
  view.add(<Rect ref={dim} width={1080} height={1920} fill="rgba(4, 8, 14, 0.55)" opacity={0} />);
  view.add(<Verse ref={verse} y={-80} fontSize={68} lineHeight={96} />);
  view.add(<Label ref={reference} y={220} />);
  view.add(<Caption ref={caption} />);

  const narrator = makeNarrator(view, caption(), '07-the-promise');

  yield view.opacity(0).opacity(1, 0.6);
  yield drift(plate(), 19, {zoom: 0.08, pan: [0, -30]});
  yield narrator.begin();

  yield* narrator.speak('Romans 10:9');

  yield dim().opacity(1, 0.7);
  yield reference().text('ROMANS 10:9').opacity(1, 0.8);
  yield* narrator.speak(
    '"If you confess with your mouth\nthat Jesus is Lord, and believe\nin your heart that God raised Him\nfrom the dead, you will be saved."',
    {node: verse()},
  );
  yield dim().opacity(0, 0.6);
  yield reference().opacity(0, 0.4);

  yield* narrator.speak('You can do that right now.');
  yield* narrator.speak('Right where you are sitting.');
  yield* narrator.speak('No church. No clean record.\nNo perfect words.');

  yield* narrator.untilDone();
  yield* waitFor(0.3);
});
