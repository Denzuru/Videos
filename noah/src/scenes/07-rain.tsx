import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutCubic,
  fadeTransition,
  linear,
  loop,
  waitFor,
} from '@revideo/core';
import {Ark} from '../components/ark';
import {Caption, PunchWord, punch, say} from '../components/narration';
import {
  Cloud,
  Hill,
  Rain,
  SkyBackdrop,
  Water,
  makeSwell,
} from '../components/world';
import {palette} from '../theme';

export default makeScene2D('rain', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const storm = createRef<Rect>();
  const rainA = createRef<Node>();
  const rainB = createRef<Node>();
  const flash = createRef<Rect>();
  const ark = createRef<Node>();
  const land = createRef<Node>();
  const sea = createRef<Node>();
  const swell = makeSwell();

  view.add(
    <>
      <SkyBackdrop top={'#2c6fb8'} bottom={'#9ed3ef'} />
      <SkyBackdrop ref={storm} top={palette.stormTop} bottom={palette.stormLow} opacity={0} />
      <Cloud position={[-540, -390]} scale={1} color={'#8e9cc0'} />
      <Cloud position={[420, -420]} scale={1.25} color={'#7e8cb2'} />
      <Cloud position={[760, -250]} scale={0.8} color={'#8e9cc0'} />

      <Node ref={land}>
        <Hill size={1700} position={[0, 880]} color={palette.grassDeep} />
        <Rect width={2100} height={560} y={620} fill={palette.grass} />
      </Node>

      <Node ref={ark} position={[0, 340]} scale={1.2}>
        <Ark />
      </Node>

      {/* Water starts below the frame and climbs. */}
      <Node ref={sea} y={900}>
        <Water phase={swell} color={palette.water} amplitude={30} />
        <Water phase={() => swell() + 1.9} y={44} color={palette.waterDeep} amplitude={24} />
      </Node>

      <Node ref={rainA} opacity={0}>
        <Rain count={90} seed={21} />
      </Node>
      <Node ref={rainB} opacity={0}>
        <Rain count={90} seed={44} />
      </Node>

      <Rect ref={flash} width={1980} height={1140} fill={palette.white} opacity={0} />
      <PunchWord ref={word} y={-320} fontSize={186} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  yield* fadeTransition(0.5);
  yield loop(Infinity, () => swell(swell() + Math.PI * 2, 2.8, linear));

  yield* say(caption(), 'And then Noah felt it. One drop on his nose.', 2.2);

  // The sky turns over.
  yield* all(
    storm().opacity(1, 1.6),
    rainA().opacity(1, 1),
    rainB().opacity(1, 1),
    say(caption(), 'Then two. Then a hundred. Then a million.', 2.3),
  );

  // Two offset curtains, so the rain never visibly repeats. The snap back to
  // the top is a plain assignment, not a tween, so it has to live in a
  // generator body rather than inside chain().
  yield loop(Infinity, function* () {
    rainA().position.y(-600);
    yield* rainA().position.y(600, 0.5, linear);
  });
  yield loop(Infinity, function* () {
    rainB().position.y(-300);
    yield* rainB().position.y(900, 0.75, linear);
  });

  yield* punch(word(), '40 DAYS!', 0.7, -6);
  yield* punch(word(), '40 NIGHTS!', 0.7, 6);

  yield* chain(flash().opacity(0.8, 0.06), flash().opacity(0, 0.3));

  // The flood.
  yield* all(
    sea().position.y(200, 5, easeOutCubic),
    land().position.y(700, 4, easeOutCubic),
    land().opacity(0, 4),
    ark().position.y(70, 5, easeOutCubic),
    say(caption(), 'The water came up, and up, and up.', 2.4),
  );

  yield loop(Infinity, () =>
    chain(
      all(ark().position.y(46, 1.3, easeInOutSine), ark().rotation(2.5, 1.3, easeInOutSine)),
      all(ark().position.y(70, 1.3, easeInOutSine), ark().rotation(-2.5, 1.3, easeInOutSine)),
    ),
  );

  yield* say(caption(), 'It covered the fields. It covered the hills.', 2.3);
  yield* say(caption(), 'But the big boat did exactly what it was built to do.', 2.6);

  yield* punch(word(), 'IT FLOATED!', 0.9, -4);

  yield* say(caption(), 'Inside, everyone was warm and dry and safe.', 2.5);
  yield* say(caption(), 'God was taking care of them the whole time.', 2.5);
  yield* waitFor(0.5);
});
