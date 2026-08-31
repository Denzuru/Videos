import {Node, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  loop,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop} from '../components/narration';
import {Moon, Sparkle, Starfield} from '../components/figures';
import {palette, titleText, verseText} from '../theme';

export default makeScene2D(function* (view) {
  const sky = createRef<Node>();
  const moon = createRef<Node>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const promise = createRef<Txt>();
  const sparkles = createRef<Node>();

  view.add(
    <>
      <Backdrop from={palette.nightDeep} to={palette.dusk} />

      <Node ref={sky} opacity={0}>
        <Starfield count={130} seed={11} />
      </Node>

      <Node ref={moon} position={[-740, -352]} scale={0} opacity={0.95}>
        <Moon color={palette.gold} radius={92} />
      </Node>

      <Node ref={sparkles} opacity={0}>
        <Sparkle position={[820, -250]} size={52} color={palette.gold} />
        <Sparkle position={[-830, 40]} size={32} color={palette.rose} />
        <Sparkle position={[-700, 330]} size={38} color={palette.sky} />
        <Sparkle position={[790, 300]} size={28} color={palette.mint} />
      </Node>

      <Txt
        ref={title}
        {...titleText}
        y={-90}
        fontSize={148}
        opacity={0}
        scale={0.86}
        text={'The Greatest Story'}
      />
      <Txt
        ref={subtitle}
        {...titleText}
        y={30}
        fontSize={70}
        fill={palette.gold}
        opacity={0}
        text={'ever told'}
      />
      <Txt
        ref={promise}
        {...verseText}
        y={210}
        fontSize={46}
        opacity={0}
        text={'a story about how much God loves you'}
      />
    </>,
  );

  // The night wakes up first: stars, then the moon, then the words.
  yield* all(sky().opacity(1, 2.4), moon().scale(1, 1.8, easeOutBack));

  // Stars breathe for the whole scene.
  yield loop(Infinity, () =>
    chain(
      sky().opacity(0.72, 2.6, easeInOutSine),
      sky().opacity(1, 2.6, easeInOutSine),
    ),
  );
  yield loop(Infinity, () => moon().position.y(-334, 3, easeInOutSine).to(-352, 3, easeInOutSine));

  yield* all(
    title().opacity(1, 1.2, easeOutCubic),
    title().scale(1, 1.2, easeOutBack),
  );
  yield* all(
    subtitle().opacity(1, 0.9, easeOutCubic),
    sparkles().opacity(1, 1.2),
  );

  // Sparkles twinkle out of sync with one another.
  for (const [i, sparkle] of sparkles().children().entries()) {
    yield loop(Infinity, () =>
      chain(
        waitFor(i * 0.35),
        sparkle.scale(1.35, 1.1, easeInOutSine),
        sparkle.scale(1, 1.1, easeInOutSine),
      ),
    );
  }

  yield* waitFor(0.6);
  yield* promise().opacity(1, 1.1, easeOutCubic);
  yield* waitFor(2.6);

  yield* all(
    title().opacity(0, 1),
    subtitle().opacity(0, 1),
    promise().opacity(0, 1),
    sparkles().opacity(0, 1),
  );
});
