import {Layout, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {all, createRef, easeOutCubic, waitFor} from '@revideo/core';
import {Caption, Label, Verse, makeNarrator, show} from '../components/narration';
import {Plate, drift} from '../components/plate';
import {palette} from '../theme';

/**
 * The ask.
 *
 * The prayer is built one line at a time and then left whole on screen, because
 * the point is that somebody can read it out loud while it is up there - a
 * prayer that flashes past one line at a time is a prayer nobody can pray. The
 * film ends on the road rather than on a logo.
 */
export default makeScene2D('08-come-home', function* (view) {
  const freedom = createRef<Node>();
  const horizon = createRef<Node>();
  const dim = createRef<Rect>();
  const prayer = createRef<Layout>();
  const caption = createRef<Txt>();
  const title = createRef<Txt>();
  const handle = createRef<Txt>();

  const said = [createRef<Txt>(), createRef<Txt>(), createRef<Txt>()];

  view.fill(palette.night);
  view.add(Plate(freedom, '/img/08-freedom.jpg', {grade: 'warm', scale: 1.0}));
  view.add(Plate(horizon, '/img/09-horizon.jpg', {grade: 'warm', scale: 1.04}));
  view.add(<Rect ref={dim} width={1080} height={1920} fill="rgba(4, 8, 14, 0.62)" opacity={0} />);

  view.add(
    <Layout ref={prayer} direction="column" gap={34} alignItems="center" y={-120}>
      <Verse ref={said[0]} fontSize={64} lineHeight={88} />
      <Verse ref={said[1]} fontSize={64} lineHeight={88} />
      <Verse ref={said[2]} fontSize={64} lineHeight={88} />
    </Layout>,
  );

  view.add(<Caption ref={caption} />);
  view.add(
    <Txt
      ref={title}
      y={-160}
      opacity={0}
      fontFamily='"Playfair Display", Georgia, serif'
      fontWeight={700}
      fontSize={132}
      letterSpacing={-2}
      fill={palette.cream}
      shadowColor="rgba(0, 0, 0, 0.8)"
      shadowBlur={30}
    />,
  );
  view.add(<Label ref={handle} y={20} fontSize={34} letterSpacing={10} />);

  horizon().opacity(0);

  const narrator = makeNarrator(view, caption(), '08-come-home');

  yield view.opacity(0).opacity(1, 0.6);
  yield drift(freedom(), 14, {zoom: 0.1, pan: [0, 30]});
  yield narrator.begin();

  // The prayer, built line by line over a darkened frame.
  yield dim().opacity(1, 0.8);
  yield* narrator.speak('Jesus, I believe you died for me\nand rose again.', {node: said[0](), keep: true});
  yield* narrator.speak('I am done running.', {node: said[1](), keep: true});
  yield* narrator.speak('Come and be my Lord. Save me.', {node: said[2](), keep: true});

  yield* waitFor(0.4);
  yield* all(
    prayer().opacity(0, 0.6),
    dim().opacity(0, 0.8),
  );

  yield* narrator.speak('That is it.\nThat is the whole thing.');
  yield* narrator.speak('And heaven throws a party\nover one person coming home.');

  // The last line lands on the road out.
  yield horizon().opacity(1, 1.0);
  yield drift(horizon(), 8, {zoom: 0.08});
  yield* narrator.speak('Today, that could be you.');

  yield* narrator.untilDone();

  yield show(title(), 'COME HOME.', 3.6, 40);
  yield* waitFor(0.7);
  yield* show(handle(), 'LUKE 15:7', 2.4, 20);
  yield* view.opacity(0, 1.2, easeOutCubic);
});
