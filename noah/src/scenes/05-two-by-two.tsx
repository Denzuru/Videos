import {Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInBack,
  easeInOutSine,
  easeOutBack,
  fadeTransition,
  linear,
  loop,
  sequence,
  waitFor,
} from '@revideo/core';
import {Ark} from '../components/ark';
import {
  Elephant,
  Giraffe,
  Lion,
  Monkey,
  Turtle,
  Zebra,
} from '../components/creatures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {Bird} from '../components/creatures';
import {Cloud, Hill, SkyBackdrop} from '../components/world';
import {font, palette} from '../theme';

const GROUND = 250;

/** Two of a kind, side by side, with a name tag over them. */
function Pair({
  of: Creature,
  label = '',
  gap = 240,
  scale = 1,
  lift = 0,
  tagY = -140,
  ...rest
}: {
  of: (props: Record<string, unknown>) => Node;
  label?: string;
  gap?: number;
  scale?: number;
  lift?: number;
  /** Where the name tag sits, tuned per species so it clears their heads. */
  tagY?: number;
} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Node scale={scale} position={[-gap / 2, GROUND - lift]}>
        <Creature />
      </Node>
      <Node scale={scale} position={[gap / 2, GROUND - lift]}>
        <Creature />
      </Node>
      <Node position={[0, tagY]}>
        <Rect size={[360, 96]} radius={48} fill={palette.purple} stroke={palette.ink} lineWidth={8} />
        <Txt
          text={label}
          fontFamily={font.display}
          fontWeight={800}
          fontSize={50}
          fill={palette.cream}
        />
      </Node>
    </Node>
  );
}

export default makeScene2D('two-by-two', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const parade = createRef<Node>();
  const ark = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />
      <Cloud position={[-500, -390]} scale={0.75} />
      <Cloud position={[520, -350]} scale={0.9} />
      <Hill size={1800} position={[0, 900]} color={palette.grassDeep} />
      <Rect width={2100} height={560} y={600} fill={palette.grass} />

      <Node ref={ark} position={[-960, 330]} scale={1.05}>
        <Ark />
      </Node>

      <Node ref={parade}>
        <Pair of={Elephant} label={'ELEPHANTS x2'} scale={1.5} gap={430} tagY={-130} x={1700} />
        <Pair of={Giraffe} label={'GIRAFFES x2'} scale={1.0} gap={430} tagY={-250} x={1700} />
        <Pair of={Lion} label={'LIONS x2'} scale={1.5} gap={430} tagY={-130} x={1700} />
        <Pair of={Zebra} label={'ZEBRAS x2'} scale={1.3} gap={420} tagY={-180} x={1700} />
        <Pair of={Monkey} label={'MONKEYS x2'} scale={1.7} gap={400} tagY={-160} x={1700} />
        <Pair of={Turtle} label={'TURTLES x2'} scale={1.7} gap={420} tagY={-60} x={1700} />
        <Pair of={Bird} label={'BIRDS x2'} scale={1.8} gap={400} lift={420} tagY={-360} x={1700} />
      </Node>

      <PunchWord ref={word} y={-330} fontSize={190} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'twoByTwo');

  yield* fadeTransition(0.5);
  yield* begin();
  yield loop(Infinity, () =>
    chain(ark().position.y(310, 1.1, easeInOutSine), ark().position.y(330, 1.1, easeInOutSine)),
  );

  yield* speak('And then, one morning, Noah heard a sound.');

  // The parade starts here, under the narration, so the field is never empty
  // while there is still talking to do. Each pair walks the full width and
  // then shrinks away at the ark as though climbing the ramp - which is also
  // what stops them sliding across the hull, as no draw order would.
  yield sequence(
    1.35,
    ...parade()
      .children()
      .map(pair =>
        chain(
          pair.position.x(-700, 12, linear),
          all(
            pair.scale(0, 0.6, easeInBack),
            pair.position.x(-920, 0.6, linear),
          ),
        ),
      ),
  );

  yield* speak('Thump. Flap. Squeak. Roar.');
  yield punch(word(), 'THE ANIMALS!', 0.8, -5);
  yield* speak('They came from everywhere, all by themselves.');

  // Every pair bobs the whole way across.
  for (const [i, pair] of parade().children().entries()) {
    yield loop(Infinity, () =>
      chain(
        waitFor(i * 0.07),
        pair.position.y(-16, 0.34, easeInOutSine),
        pair.position.y(0, 0.34, easeInOutSine),
      ),
    );
  }

  yield punch(word(), 'TWO BY TWO!', 1, 6);
  yield* speak('Two elephants. Two giraffes. Two lions.');
  yield* speak('Two of every kind of animal in the world.');
  yield* speak('They all walked up the ramp and climbed inside.');
  yield* speak('Nobody was left out. Not a single one.');
  yield* untilDone();
});
