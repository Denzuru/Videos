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
  waitFor,
} from '@revideo/core';
import {Ark} from '../components/ark';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {Cloud, Hill, SkyBackdrop} from '../components/world';
import {palette} from '../theme';

export default makeScene2D('the-door', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const stage = createRef<Node>();
  const ark = createRef<Node>();
  const door = createRef<Rect>();
  const gloom = createRef<Rect>();

  view.add(
    <>
      <SkyBackdrop top={'#2c6fb8'} bottom={'#9ed3ef'} />
      <Cloud position={[-560, -380]} scale={0.9} color={'#c9dcea'} />
      <Cloud position={[540, -330]} scale={1.05} color={'#c9dcea'} />

      <Node ref={stage}>
        <Hill size={1700} position={[0, 880]} color={palette.grassDeep} />
        <Rect width={2100} height={560} y={620} fill={palette.grass} />
        <Node ref={ark} position={[0, 340]} scale={1.3}>
          <Ark doorRef={door} />
        </Node>
      </Node>

      <Rect ref={gloom} width={1980} height={1140} fill={'#2a3350'} opacity={0} />
      <PunchWord ref={word} y={-330} fontSize={176} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'theDoor');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () =>
    chain(ark().position.y(322, 1.2, easeInOutSine), ark().position.y(340, 1.2, easeInOutSine)),
  );

  yield* speak('Noah went in. His whole family went in.');
  yield* speak('Every animal found its place.');

  // The door swings shut and the world lands on it.
  yield* all(
    door().scale([1, 1], 0.9, easeOutCubic),
    speak('And then something happened that nobody expected.'),
  );
  yield* chain(
    stage().position.y(16, 0.06),
    stage().position.y(0, 0.12, easeOutBack),
  );

  yield punch(word(), 'THUD!', 0.6, -8);

  yield* all(
    gloom().opacity(0.2, 1),
    speak('God shut the door Himself.'),
  );
  yield* speak('Nobody had to hold it. They were safe inside.');
  yield* untilDone();
});
