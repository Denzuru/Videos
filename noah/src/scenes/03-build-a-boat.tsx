import {Line, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
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
import {Noah} from '../components/creatures';
import {Caption, PunchWord, punch, say} from '../components/narration';
import {Cloud, Hill, SkyBackdrop} from '../components/world';
import {font, palette, punchText} from '../theme';

/** One of the "and it was THIS big" fact cards. */
function FactCard({
  label = '',
  color = palette.coral,
  ...rest
}: {label?: string; color?: string} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Rect
        size={[500, 108]}
        radius={54}
        fill={color}
        stroke={palette.ink}
        lineWidth={9}
      />
      <Txt
        text={label}
        fontFamily={font.display}
        fontWeight={800}
        fontSize={52}
        fill={palette.cream}
      />
    </Node>
  );
}

export default makeScene2D('build-a-boat', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const noah = createRef<Node>();
  const blueprint = createRef<Node>();
  const facts = createRef<Node>();
  const voice = createRef<Txt>();

  view.add(
    <>
      <SkyBackdrop top={'#2f7fd0'} bottom={'#8fd4f5'} />
      <Cloud position={[-620, -360]} scale={0.85} color={'#dcefff'} />
      <Cloud position={[560, -300]} scale={1} color={'#dcefff'} />
      <Hill size={1600} position={[-500, 760]} color={palette.grassDeep} />
      <Rect width={2100} height={560} y={600} fill={palette.grass} />

      <Node ref={noah} position={[-700, 340]} scale={1.35}>
        <Noah />
      </Node>

      <Txt
        ref={voice}
        {...punchText}
        y={-436}
        fontSize={92}
        fill={palette.sun}
        opacity={0}
        scale={0.8}
        text={'"NOAH! BUILD A BOAT!"'}
      />

      {/* The plan, drawn as a chalk outline before the real thing exists. */}
      <Node ref={blueprint} position={[330, 30]} scale={0.92} opacity={0}>
        <Line
          points={[
            [-380, -96],
            [380, -96],
            [292, 86],
            [-292, 86],
          ]}
          closed
          radius={26}
          stroke={palette.cream}
          lineWidth={10}
          lineDash={[26, 18]}
        />
        <Rect
          size={[430, 156]}
          radius={22}
          y={-180}
          stroke={palette.cream}
          lineWidth={10}
          lineDash={[26, 18]}
        />
        <Line
          points={[
            [-250, 0],
            [250, 0],
            [0, -104],
          ]}
          closed
          radius={14}
          y={-256}
          stroke={palette.cream}
          lineWidth={10}
          lineDash={[26, 18]}
        />
      </Node>

      <Node ref={facts}>
        <FactCard label={'LONGER THAN 4 BUSES'} color={palette.coral} position={[-560, -230]} scale={0} />
        <FactCard label={'THREE WHOLE FLOORS'} color={palette.purple} position={[-560, -100]} scale={0} />
      </Node>

      <PunchWord ref={word} y={-150} fontSize={170} fill={palette.pink} />
      <Caption ref={caption} />
    </>,
  );

  yield* fadeTransition(0.5);
  yield loop(Infinity, () =>
    chain(noah().position.y(320, 0.9, easeInOutSine), noah().position.y(340, 0.9, easeInOutSine)),
  );

  yield* say(caption(), 'One day, God said something surprising.', 1.9);

  yield* all(
    voice().opacity(1, 0.3),
    voice().scale(1, 0.5, easeOutBack),
    say(caption(), 'A big flood was coming, and everyone needed rescuing.', 2.4),
  );

  yield* all(
    blueprint().opacity(1, 0.6),
    blueprint().scale(0.98, 0.6, easeOutBack),
    say(caption(), 'So God gave Noah a plan.', 1.8),
  );
  yield* blueprint().scale(0.92, 0.3);

  yield* punch(word(), 'A HUGE BOAT!', 0.8, 5);

  yield* all(
    sequence(0.25, ...facts().children().map(f => f.scale(1, 0.5, easeOutBack))),
    say(caption(), 'Not a little rowing boat. An enormous one.', 2.3),
  );

  yield* say(caption(), 'Big enough for Noah, his family, and the animals.', 2.5);
  yield* say(caption(), 'Every single kind of animal.', 2);

  yield* all(
    voice().opacity(0, 0.5),
    facts().opacity(0, 0.5),
    blueprint().opacity(0, 0.5),
  );
});
