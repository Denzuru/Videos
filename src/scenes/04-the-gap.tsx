import {Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  fadeTransition,
  chain,
  createRef,
  easeInCubic,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  loop,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {Chasm, GlowOrb, Kid, Starfield} from '../components/figures';
import {font, palette} from '../theme';

/** One of the "good things I did" blocks the child piles up. */
function TryBlock({label = '', ...rest}: {label?: string} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Rect size={[300, 74]} radius={16} fill={'#4c5580'} stroke={'#38406a'} lineWidth={5} />
      <Txt
        text={label}
        fontFamily={font.body}
        fontWeight={700}
        fontSize={32}
        fill={palette.cream}
      />
    </Node>
  );
}

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const kid = createRef<Node>();
  const light = createRef<Node>();
  const blocks = createRef<Node>();

  view.add(
    <>
      <Backdrop from={palette.night} to={palette.nightDeep} />
      <Starfield count={80} seed={57} tint={palette.muted} />

      <Chasm />

      <Node ref={light} position={[620, -110]}>
        <GlowOrb color={palette.gold} radius={230} intensity={0.45} />
        <Txt
          text={'GOD'}
          y={205}
          fontFamily={font.display}
          fontWeight={600}
          fontSize={44}
          fill={palette.gold}
          opacity={0.85}
        />
      </Node>

      <Node ref={blocks} position={[-620, 123]}>
        <TryBlock label={'be good'} y={0} scale={0} />
        <TryBlock label={'be kind'} y={-78} scale={0} />
        <TryBlock label={'try harder'} y={-156} scale={0} />
      </Node>

      <Node ref={kid} position={[-620, 36]}>
        <Kid scale={1.15} />
      </Node>

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield loop(Infinity, () =>
    chain(
      light().scale(1.05, 1.8, easeInOutSine),
      light().scale(1, 1.8, easeInOutSine),
    ),
  );

  yield* say(caption(), 'Now there was a gap. A really big one.', 2.6);
  yield* say(caption(), 'And we tried so hard to cross it by ourselves.', 2.8);

  // Attempt one: jump for it.
  yield* all(
    say(caption(), 'Some of us tried jumping.', 2),
    chain(
      kid().position([-420, -110], 0.55, easeOutCubic),
      kid().position([-250, 560], 0.7, easeInCubic),
    ),
  );
  kid().position([-620, 36]).opacity(0);
  yield* kid().opacity(1, 0.5);

  // Attempt two: build a tower of good deeds.
  yield* all(
    sequence(
      0.35,
      ...blocks().children().map(b => b.scale(1, 0.6, easeOutBack)),
    ),
    say(caption(), 'Some of us tried being extra, extra good.', 3),
  );

  yield* all(
    kid().position([-620, -194], 1, easeOutCubic),
    say(caption(), 'We piled up every good thing we could think of.', 3),
  );

  yield* say(caption(), 'It was never tall enough. It was never close.', 3);

  // The tower gives way.
  yield* all(
    ...blocks().children().map((b, i) =>
      chain(
        waitFor(i * 0.12),
        all(
          b.position.y(b.position.y() + 420, 0.8, easeInCubic),
          b.rotation((i % 2 ? 1 : -1) * 25, 0.8),
          b.opacity(0, 0.8),
        ),
      ),
    ),
    kid().position([-620, 36], 0.9, easeInCubic),
    say(caption(), 'Because being good enough was never the answer.', 3.2),
  );

  yield* say(caption(), 'We could not reach God. Not on our own.', 3);

  yield* waitFor(0.5);
  yield* all(kid().opacity(0, 1), light().opacity(0, 1));
});
