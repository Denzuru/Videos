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
import {Brother, Joseph} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Sheaf,
  SkyBackdrop,
  Star,
  Starfield,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 300;

export default makeScene2D('dreams', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const stars = createRef<Node>();
  const sheaves = createRef<Node>();
  const mySheaf = createRef<Node>();
  const sky = createRef<Node>();
  const moon = createRef<Node>();
  const bowStars = createRef<Node>();
  const joseph = createRef<Node>();
  const brothers = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.nightDeep} bottom={palette.night} />
      <Starfield ref={stars} count={110} seed={23} />

      {/* Dream one: the sheaves. */}
      <Node ref={sheaves}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <Node position={[-820 + i * 164, GROUND]} scale={0.8} opacity={0} />
        ))}
      </Node>
      <Node ref={mySheaf} position={[0, GROUND - 70]} scale={0}>
        <Sheaf />
      </Node>

      {/* Dream two: the sun, the moon and eleven stars. */}
      <Node ref={sky} opacity={0}>
        <Node ref={moon} position={[0, -230]}>
          <Star color={palette.sun} size={230} />
        </Node>
        <Node ref={bowStars}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <Node
              position={[-700 + i * 140, -30 + (i % 2) * 70]}
              scale={0}
            >
              <Star color={i % 2 ? palette.cream : palette.pink} size={92} />
            </Node>
          ))}
        </Node>
      </Node>

      <Node ref={joseph} position={[0, GROUND + 40]} scale={1.15} opacity={0}>
        <Joseph coat />
      </Node>

      <Node ref={brothers} opacity={0}>
        {['#c96a4a', '#7aa05c', '#5f7fb8', '#b8863c'].map((robe, i) => (
          <Node position={[-560 + i * 370, GROUND + 40]} scale={0.85}>
            <Brother robe={robe} sad />
          </Node>
        ))}
      </Node>

      <PunchWord ref={word} y={-380} fontSize={160} fill={palette.pink} />
      <Caption ref={caption} />
    </>,
  );

  // The eleven sheaves are built here so each one keeps its own reference.
  for (const [i, slot] of sheaves().children().entries()) {
    slot.add(<Sheaf />);
  }

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'dreams');

  yield* fadeTransition(0.5);
  yield* begin();

  yield loop(Infinity, () =>
    chain(stars().opacity(0.7, 2.2, easeInOutSine), stars().opacity(1, 2.2, easeInOutSine)),
  );

  yield* speak('Then Joseph started having dreams.');

  yield* all(
    mySheaf().scale(1.15, 0.5, easeOutBack),
    sequence(0.05, ...sheaves().children().map(s => all(s.opacity(1, 0.3), s.scale(0.8, 0.4, easeOutBack)))),
    speak('In one, eleven bundles of wheat bowed down to his bundle.'),
  );

  // And they bow.
  yield* all(
    sequence(
      0.05,
      ...sheaves().children().map((s, i) =>
        s.rotation(i < 5 ? 62 : -62, 0.8, easeOutCubic),
      ),
    ),
  );

  // Dream two.
  yield* all(
    sheaves().opacity(0, 0.8),
    mySheaf().opacity(0, 0.8),
    sky().opacity(1, 0.8),
    sequence(0.06, ...bowStars().children().map(s => s.scale(1, 0.45, easeOutBack))),
    speak('In another, the sun and the moon and eleven stars bowed to him.'),
  );

  yield* all(
    sequence(0.05, ...bowStars().children().map(s => s.position.y(s.position.y() + 90, 0.7, easeOutCubic))),
    moon().position.y(-190, 0.7, easeOutCubic),
  );

  yield* all(
    sky().opacity(0, 0.7),
    joseph().opacity(1, 0.6),
    brothers().opacity(1, 0.6),
    speak('And Joseph, who was not very wise yet, told his brothers all about them.'),
  );

  yield punch(word(), 'OOPS.', 0.8, 6);
  yield* speak('You can guess how that went.');
  yield* speak('Now they did not just dislike him. They wanted him gone.');

  yield* untilDone();
});
