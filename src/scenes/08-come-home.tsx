import {Circle, Layout, Node, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  fadeTransition,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  loop,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {Backdrop, Caption, say} from '../components/narration';
import {
  Chasm,
  Cross,
  GlowOrb,
  Heart,
  Kid,
  Sparkle,
  Starfield,
} from '../components/figures';
import {font, glow, palette, titleText, verseText} from '../theme';

export default makeScene2D(function* (view) {
  const caption = createRef<Txt>();
  const kid = createRef<Node>();
  const light = createRef<Node>();
  const bridge = createRef<Node>();
  const scene = createRef<Node>();
  const prayer = createRef<Layout>();
  const heart = createRef<Node>();
  const verse = createRef<Node>();
  const closing = createRef<Node>();
  const sparkles = createRef<Node>();

  const prayerLines = [
    'Jesus, I am sorry for the wrong things I have done.',
    'Thank you for loving me all the way to the cross.',
    'Please come and be my forever friend.',
  ];

  view.add(
    <>
      <Backdrop from={'#2d2a5e'} to={'#ffb36b'} />
      <Starfield count={60} seed={113} tint={palette.cream} />

      <Node ref={scene}>
        <Chasm warm />

        <Node ref={light} position={[620, -60]}>
          <GlowOrb color={palette.gold} radius={240} intensity={0.45} />
        </Node>

        <Node ref={bridge} position={[0, 196]} rotation={90} scale={1.55}>
          <Cross color={palette.parchment} height={420} width={260} thickness={44} />
        </Node>

        <Node ref={kid} position={[-620, 36]}>
          <Kid scale={1.15} />
        </Node>
      </Node>

      <Node ref={heart} position={[0, -310]} scale={0}>
        <Heart color={palette.rose} size={170} />
      </Node>

      <Node ref={sparkles} opacity={0}>
        <Sparkle position={[-460, -300]} size={44} color={palette.gold} />
        <Sparkle position={[480, -340]} size={34} color={palette.cream} />
        <Sparkle position={[-660, -80]} size={28} color={palette.rose} />
        <Sparkle position={[660, -140]} size={38} color={palette.mint} />
      </Node>

      <Layout
        ref={prayer}
        layout
        direction={'column'}
        gap={34}
        alignItems={'center'}
        y={20}
        opacity={0}
      >
        {prayerLines.map(line => (
          <Txt
            text={line}
            fontFamily={font.body}
            fontWeight={700}
            fontSize={54}
            fill={palette.cream}
            opacity={0}
          />
        ))}
      </Layout>

      <Node ref={verse} opacity={0}>
        <Txt
          {...verseText}
          y={-60}
          fontSize={50}
          width={1400}
          textWrap
          text={
            'For God so loved the world that he gave his one and only Son, ' +
            'that whoever believes in him shall not perish but have eternal life.'
          }
        />
        <Txt {...verseText} y={110} fontSize={40} fill={palette.gold} text={'John 3:16'} />
      </Node>

      <Node ref={closing} opacity={0}>
        <Txt {...titleText} y={-70} fontSize={126} text={'You are loved.'} />
        <Txt
          {...titleText}
          y={60}
          fontSize={84}
          fill={palette.gold}
          text={'Always.'}
        />
      </Node>

      <Caption ref={caption} />
    </>,
  );

  // Cross-fade in from the scene before, rather than cutting.
  yield* fadeTransition(0.9);

  yield loop(Infinity, () =>
    chain(
      light().scale(1.05, 1.9, easeInOutSine),
      light().scale(1, 1.9, easeInOutSine),
    ),
  );

  yield* say(caption(), 'And here is the best part of the whole story.', 2.8);
  yield* say(caption(), 'It is not finished. Because it is for you.', 3);

  // The child crosses.
  yield* all(
    kid().position([-180, 36], 2, easeOutCubic),
    say(caption(), 'Jesus says: come to me.', 2.4),
  );
  yield* all(
    kid().position([330, 36], 2.2, easeOutCubic),
    sparkles().opacity(1, 1.6),
    say(caption(), 'You do not have to fix yourself first.', 2.8),
  );
  yield* say(caption(), 'You just have to come.', 2.4);

  // Move the picture aside and let the words speak.
  yield* all(
    scene().opacity(0.22, 1.4),
    sparkles().opacity(0.5, 1.4),
    say(caption(), 'You can talk to Him right now. Like this:', 2.6),
  );

  prayer().opacity(1);
  yield* sequence(
    1.6,
    ...prayer()
      .children()
      .map(line => line.opacity(1, 0.9, easeOutCubic)),
  );
  yield* waitFor(2.4);

  yield* all(
    heart().scale(1, 1, easeOutBack),
    say(caption(), 'You do not need fancy words. He wants your heart.', 3.2),
  );
  yield loop(Infinity, () =>
    chain(heart().scale(1.12, 0.8, easeInOutSine), heart().scale(1, 0.8, easeInOutSine)),
  );

  yield* say(caption(), 'And when you come, He does not just forgive you.', 3);
  yield* say(caption(), 'He calls you His own child. Forever.', 3.2);

  // Verse.
  yield* all(
    prayer().opacity(0, 1.2),
    heart().opacity(0, 1.2),
    scene().opacity(0.12, 1.2),
  );
  yield* verse().opacity(1, 1.4);
  yield* waitFor(5.5);
  yield* verse().opacity(0, 1.2);

  // Closing.
  yield* all(
    closing().opacity(1, 1.4),
    sparkles().opacity(1, 1.4),
    scene().opacity(0.18, 1.4),
  );
  yield* waitFor(4);
  yield* all(
    closing().opacity(0, 2),
    sparkles().opacity(0, 2),
    scene().opacity(0, 2),
    light().opacity(0, 2),
  );
  yield* waitFor(0.8);
});
