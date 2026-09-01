import {Node, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  createSignal,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  linear,
  loop,
  waitFor,
} from '@revideo/core';
import {Ark} from '../components/ark';
import {
  Cloud,
  Confetti,
  SkyBackdrop,
  Sun,
  Water,
  makeSwell,
} from '../components/world';
import {palette, punchText} from '../theme';

export default makeScene2D('title', function* (view) {
  const rays = createRef<Node>();
  const clouds = createRef<Node>();
  const line1 = createRef<Txt>();
  const line2 = createRef<Txt>();
  const tag = createRef<Txt>();
  const ark = createRef<Node>();
  const confetti = createRef<Node>();
  const swell = makeSwell();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={palette.skyPale} />

      <Node position={[-620, -300]}>
        <Node ref={rays}>
          <Sun />
        </Node>
      </Node>

      <Node ref={clouds}>
        <Cloud position={[420, -330]} scale={1.1} />
        <Cloud position={[760, -160]} scale={0.8} />
        <Cloud position={[-180, -420]} scale={0.65} />
      </Node>

      <Node ref={ark} position={[0, 352]} scale={0.92}>
        <Ark />
      </Node>

      <Water phase={swell} y={392} color={palette.water} amplitude={22} />
      <Water phase={() => swell() + 1.6} y={444} color={palette.waterDeep} amplitude={18} />

      <Node ref={confetti} position={[0, -60]} scale={0} opacity={0}>
        <Confetti count={40} seed={5} spread={720} />
      </Node>

      <Txt ref={line1} {...punchText} y={-268} fontSize={132} fill={palette.sun} opacity={0} scale={0} text={"NOAH'S"} />
      <Txt ref={line2} {...punchText} y={-108} fontSize={196} fill={palette.cream} opacity={0} scale={0} text={'BIG BOAT'} />
      <Txt
        ref={tag}
        {...punchText}
        y={38}
        fontSize={62}
        lineWidth={9}
        fill={palette.pink}
        opacity={0}
        text={'a true story about a really big promise'}
      />
    </>,
  );

  // Everything that never stops moving.
  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 26, linear));
  yield loop(Infinity, () =>
    chain(ark().position.y(332, 1.1, easeInOutSine), ark().position.y(352, 1.1, easeInOutSine)),
  );
  yield loop(Infinity, () => swell(swell() + Math.PI * 2, 3.4, linear));
  yield loop(Infinity, () =>
    chain(clouds().position.x(40, 6, easeInOutSine), clouds().position.x(0, 6, easeInOutSine)),
  );

  yield* all(
    line1().opacity(1, 0.3),
    line1().scale(1, 0.5, easeOutBack),
    line1().rotation(-4, 0.5, easeOutBack),
  );
  yield* all(
    line2().opacity(1, 0.3),
    line2().scale(1, 0.55, easeOutBack),
    line2().rotation(2, 0.55, easeOutBack),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
  );

  yield* all(
    tag().opacity(1, 0.5, easeOutCubic),
    confetti().opacity(0, 1.4),
    confetti().position.y(180, 1.6, easeOutCubic),
  );

  // A little heartbeat on the title so the frame never sits still.
  yield loop(Infinity, () =>
    chain(line2().scale(1.04, 0.7, easeInOutSine), line2().scale(1, 0.7, easeInOutSine)),
  );

  yield* waitFor(2.4);
  yield* all(line1().opacity(0, 0.5), line2().opacity(0, 0.5), tag().opacity(0, 0.5));
});
