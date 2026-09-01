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
import {Brother, Jacob, Joseph} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {
  Cloud,
  Confetti,
  Hill,
  PalmTree,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette} from '../theme';

const GROUND = 330;

/** The eleven, in eleven different robes so a child can count them. */
const BROTHER_ROBES = [
  '#c96a4a', '#7aa05c', '#c98fb0', '#5f7fb8', '#b8863c', '#8a6bb0',
  '#4f9e8f', '#c25b5b', '#6b8fa8', '#a8935c', '#9c6b4f',
];

export default makeScene2D('favourite', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const rays = createRef<Node>();
  const jacob = createRef<Node>();
  const joseph = createRef<Node>();
  const josephCoat = createRef<Node>();
  const brothers = createRef<Node>();
  const sparkle = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Node position={[700, -350]} ref={rays}>
        <Sun />
      </Node>
      <Cloud position={[-620, -330]} scale={0.85} />
      <Hill size={1700} position={[-500, 900]} color={palette.grassDeep} />
      <Hill size={1400} position={[640, 940]} color={palette.grassDeep} />
      <Rect width={2100} height={560} y={620} fill={palette.grass} />
      <PalmTree position={[880, GROUND]} scale={0.75} />

      <Node ref={jacob} position={[-660, GROUND]} scale={1.15}>
        <Jacob />
      </Node>

      {/* Joseph is drawn twice: without the coat, then with it, so the gift
          lands as a swap rather than a fade. */}
      <Node ref={joseph} position={[-330, GROUND]} scale={1.1}>
        <Joseph />
      </Node>
      <Node ref={josephCoat} position={[-330, GROUND]} scale={1.1} opacity={0}>
        <Joseph coat />
      </Node>

      <Node ref={sparkle} position={[-330, 90]} scale={0} opacity={0}>
        <Confetti count={26} seed={11} spread={340} />
      </Node>

      <Node ref={brothers}>
        {BROTHER_ROBES.map((robe, i) => (
          <Node position={[110 + (i % 6) * 132, GROUND - (i > 5 ? 130 : 0)]} scale={0.62} opacity={0}>
            <Brother robe={robe} />
          </Node>
        ))}
      </Node>

      <PunchWord ref={word} y={-330} fontSize={150} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'favourite');

  yield* fadeTransition(0.5);
  yield* begin();

  yield loop(Infinity, () =>
    chain(
      joseph().position.y(GROUND - 16, 1, easeInOutSine),
      joseph().position.y(GROUND, 1, easeInOutSine),
    ),
  );

  yield* speak('A long time ago there was a boy called Joseph.');

  yield* all(
    sequence(0.07, ...brothers().children().map(b => all(b.opacity(1, 0.3), b.scale(0.62, 0.4, easeOutBack)))),
    speak('He had eleven brothers. That is a lot of brothers.'),
  );

  yield* speak('But Joseph was the favourite son, and everybody knew it.');
  yield* speak('One day his father gave him a present.');

  // The coat.
  yield all(
    josephCoat().opacity(1, 0.4),
    joseph().opacity(0, 0.4),
    sparkle().opacity(1, 0.3),
    sparkle().scale(1, 0.9, easeOutCubic),
    chain(josephCoat().scale(1.25, 0.35, easeOutBack), josephCoat().scale(1.1, 0.3)),
  );
  yield punch(word(), 'EVERY COLOUR!', 0.9, -4);
  yield* speak('A coat with every colour in it.');

  yield sparkle().opacity(0, 1);
  yield loop(Infinity, () =>
    chain(
      josephCoat().position.y(GROUND - 18, 1, easeInOutSine),
      josephCoat().position.y(GROUND, 1, easeInOutSine),
    ),
  );

  yield* speak('Joseph loved that coat. He wore it everywhere.');

  // The brothers stop smiling.
  yield* all(
    sequence(0.06, ...brothers().children().map(b => b.position.y(b.position.y() + 14, 0.5, easeOutCubic))),
    speak('His brothers hated it.'),
  );

  yield* untilDone();
});
