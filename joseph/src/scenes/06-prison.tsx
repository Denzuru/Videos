import {Circle, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
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
import {Joseph, Person} from '../components/figures';
import {Caption, PunchWord, makeNarrator, punch} from '../components/narration';
import {SkyBackdrop} from '../components/world';
import {font, palette} from '../theme';

const GROUND = 340;

/** A thought bubble, for the dreams Joseph is asked to explain. */
function DreamBubble({
  label = '',
  ...rest
}: {label?: string} & Record<string, unknown>) {
  return (
    <Node {...rest}>
      <Circle size={30} position={[-70, 130]} fill={palette.cream} stroke={palette.ink} lineWidth={7} />
      <Circle size={48} position={[-46, 96]} fill={palette.cream} stroke={palette.ink} lineWidth={7} />
      <Rect size={[300, 150]} radius={64} fill={palette.cream} stroke={palette.ink} lineWidth={8} />
      <Txt
        text={label}
        fontFamily={font.display}
        fontWeight={800}
        fontSize={54}
        fill={palette.ink}
        textAlign={'center'}
        width={260}
        textWrap
      />
    </Node>
  );
}

export default makeScene2D('prison', function* (view) {
  const caption = createRef<Txt>();
  const word = createRef<Txt>();
  const joseph = createRef<Node>();
  const cupbearer = createRef<Node>();
  const baker = createRef<Node>();
  const bubbles = createRef<Node>();
  const years = createRef<Txt>();

  view.add(
    <>
      <SkyBackdrop top={'#3b3f5c'} bottom={'#585d7d'} />

      {/* A stone wall, so the window has something to be a window in. */}
      {[0, 1, 2, 3, 4]
        .flatMap(row =>
          [0, 1, 2, 3, 4, 5, 6, 7].map(col => ({row, col})),
        )
        .map(({row, col}) => (
          <Rect
            size={[250, 108]}
            radius={10}
            position={[-940 + col * 254 + (row % 2 ? 60 : 0), -420 + row * 112]}
            fill={row % 2 ? '#4d5470' : '#535a78'}
            stroke={'#3d4359'}
            lineWidth={6}
          />
        ))}
      <Rect width={2100} height={520} y={600} fill={'#31364a'} />

      {/* a barred window, and the light through it */}
      <Rect size={[360, 260]} position={[0, -300]} radius={20} fill={'#8fd0ff'} stroke={palette.ink} lineWidth={9} />
      {[0, 1, 2].map(i => (
        <Rect size={[22, 250]} position={[-100 + i * 100, -300]} radius={11} fill={'#4a5066'} />
      ))}

      <Node ref={joseph} position={[-40, GROUND]} scale={1.2}>
        <Joseph />
      </Node>

      <Node ref={cupbearer} position={[-560, GROUND]} scale={1} opacity={0}>
        <Person robe={'#6f9ec4'} beard={'short'} sad />
      </Node>
      <Node ref={baker} position={[520, GROUND]} scale={1} opacity={0}>
        <Person robe={'#b07a5c'} beard={'short'} sad />
      </Node>

      <Node ref={bubbles}>
        <DreamBubble label={'grapes'} position={[-560, -30]} scale={0} />
        <DreamBubble label={'bread'} position={[520, -30]} scale={0} />
      </Node>

      <Txt
        ref={years}
        text={'2 YEARS'}
        y={-480}
        fontFamily={font.display}
        fontWeight={800}
        fontSize={140}
        fill={palette.coral}
        stroke={palette.ink}
        lineWidth={13}
        strokeFirst
        lineJoin={'round'}
        opacity={0}
        scale={0.7}
      />

      <PunchWord ref={word} y={80} fontSize={130} fill={palette.sun} />
      <Caption ref={caption} />
    </>,
  );

  const {begin, speak, untilDone} = makeNarrator(view, caption(), 'prison');

  yield* fadeTransition(0.5);
  yield* begin();

  yield loop(Infinity, () =>
    chain(
      joseph().position.y(GROUND - 14, 1.1, easeInOutSine),
      joseph().position.y(GROUND, 1.1, easeInOutSine),
    ),
  );

  yield* speak('Joseph could have given up. He did not.');
  yield* speak('In prison he helped people, and God was still with him.');

  yield* all(
    cupbearer().opacity(1, 0.5),
    baker().opacity(1, 0.5),
    sequence(0.25, ...bubbles().children().map(b => b.scale(1, 0.5, easeOutBack))),
    speak('Two of the kings servants had strange dreams.'),
  );

  yield* speak('Joseph told them what the dreams meant. And he was right.');

  yield* all(
    cupbearer().position.x(-1200, 1.6, easeOutCubic),
    bubbles().children()[0].position.x(-1200, 1.6, easeOutCubic),
    speak('One of them went back to work for the king.'),
  );

  yield all(years().opacity(1, 0.5), years().scale(1, 0.6, easeOutBack));
  yield punch(word(), 'FORGOTTEN', 0.8, 5);
  yield* speak('And then he forgot all about Joseph. For two whole years.');

  yield* untilDone();
});
