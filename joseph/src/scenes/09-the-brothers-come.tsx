import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  fadeTransition,
  loop,
  sequence,
  waitFor,
} from '@revideo/core';
import {Brother, Joseph, Throne} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Hill,
  PalmTree,
  Pyramid,
  Sheaf,
  SkyBackdrop,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 350;

export default makeScene2D('the-brothers-come', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const joseph = createRef<Node>();
  const brothers = createRef<Node>();
  const sheafGhost = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={'#d99a4a'} bottom={'#f5d79a'} />
      <Pyramid position={[720, GROUND]} size={600} color={palette.stone} shade={'#b8a077'} />
      <Hill size={1500} position={[-760, 940]} color={palette.sandDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.sand} />
      <PalmTree position={[980, GROUND]} scale={0.7} />

      <Node position={[520, GROUND]} scale={0.9}>
        <Throne />
      </Node>
      <Node ref={joseph} position={[520, GROUND - 128]} scale={1.2}>
        <Joseph robe={'#f0e2c0'} />
      </Node>

      <Node ref={brothers}>
        {['#c96a4a', '#7aa05c', '#5f7fb8', '#b8863c', '#8a6bb0', '#4f9e8f'].map((robe, i) => (
          <Node position={[-1500 - i * 170, GROUND]} scale={0.92}>
            <Brother robe={robe} />
          </Node>
        ))}
      </Node>

      {/* the first dream, faintly, as they bow */}
      <Node ref={sheafGhost} opacity={0}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <Node position={[-760 + i * 170, GROUND - 40]} scale={0.4}>
            <Sheaf />
          </Node>
        ))}
      </Node>

      <PunchWord ref={word} y={-390} fontSize={150} fill={palette.coral} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'the-brothers-come');

  yield* fadeTransition(0.5);
  yield* begin();

  yield* speak('The hunger reached all the way back home.');

  yield* all(
    sequence(0.16, ...brothers().children().map((b, i) => b.position.x(-780 + i * 170, 3.4, easeOutCubic))),
    speak('So Jacob sent his sons to Egypt to buy food.'),
  );

  // And they bow, exactly like the sheaves.
  yield* all(
    sequence(0.09, ...brothers().children().map(b => b.rotation(-24, 0.7, easeOutCubic))),
    speak('They stood in front of the great ruler and bowed down low.'),
  );

  yield* all(
    sheafGhost().opacity(0.4, 0.8),
    speak('Just like the bundles of wheat, all those years ago.'),
  );
  yield sheafGhost().opacity(0, 1.2);

  yield* speak('They did not recognise him at all.');

  yield punch(word(), 'BUT HE KNEW THEM', 1, 4);
  yield* all(
    joseph().scale(1.28, 0.6, easeOutBack),
    speak('But Joseph knew exactly who they were.'),
  );

  yield* untilDone();
});
