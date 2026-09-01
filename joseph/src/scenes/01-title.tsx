import {Node, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  chain,
  createRef,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  linear,
  loop,
  waitFor,
} from '@revideo/core';
import {Joseph} from '../components/figures';
import {
  Cloud,
  Confetti,
  Hill,
  PalmTree,
  Pyramid,
  SkyBackdrop,
  Sun,
} from '../components/world';
import {palette, punchText} from '../theme';

export default makeScene2D('title', function* (view) {
  const rays = createRef<Node>();
  const clouds = createRef<Node>();
  const line1 = createRef<Txt>();
  const line2 = createRef<Txt>();
  const tag = createRef<Txt>();
  const joseph = createRef<Node>();
  const confetti = createRef<Node>();

  view.add(
    <>
      <SkyBackdrop top={palette.skyDeep} bottom={'#ffe6ad'} />

      <Node position={[-660, -320]}>
        <Node ref={rays}>
          <Sun />
        </Node>
      </Node>

      <Node ref={clouds}>
        <Cloud position={[440, -350]} scale={1.05} />
        <Cloud position={[770, -180]} scale={0.75} />
      </Node>

      <Pyramid position={[620, 330]} size={620} />
      <Pyramid position={[880, 330]} size={420} />
      <Hill size={1500} position={[-560, 900]} color={palette.sand} />
      <PalmTree position={[-780, 330]} scale={0.9} />

      <Node ref={joseph} position={[0, 350]} scale={1.25}>
        <Joseph coat />
      </Node>

      <Node ref={confetti} position={[0, -60]} scale={0} opacity={0}>
        <Confetti count={42} seed={5} spread={740} />
      </Node>

      <Txt ref={line1} {...punchText} y={-300} fontSize={196} fill={palette.sun} opacity={0} scale={0} text={'JOSEPH'} />
      <Txt ref={line2} {...punchText} y={-150} fontSize={110} fill={palette.cream} opacity={0} scale={0} text={'AND THE AMAZING COAT'} />
      <Txt
        ref={tag}
        {...punchText}
        y={-40}
        fontSize={58}
        lineWidth={9}
        fill={palette.pink}
        opacity={0}
        text={'a true story about a very long wait'}
      />
    </>,
  );

  yield loop(Infinity, () => rays().rotation(rays().rotation() + 360, 26, linear));
  yield loop(Infinity, () =>
    chain(joseph().position.y(332, 1.1, easeInOutSine), joseph().position.y(350, 1.1, easeInOutSine)),
  );
  yield loop(Infinity, () =>
    chain(clouds().position.x(40, 6, easeInOutSine), clouds().position.x(0, 6, easeInOutSine)),
  );

  yield* all(
    line1().opacity(1, 0.3),
    line1().scale(1, 0.5, easeOutBack),
    line1().rotation(-3, 0.5, easeOutBack),
  );
  yield* all(
    line2().opacity(1, 0.3),
    line2().scale(1, 0.55, easeOutBack),
    line2().rotation(1.5, 0.55, easeOutBack),
    confetti().opacity(1, 0.3),
    confetti().scale(1, 0.9, easeOutCubic),
  );

  yield* all(
    tag().opacity(1, 0.5, easeOutCubic),
    confetti().opacity(0, 1.4),
    confetti().position.y(180, 1.6, easeOutCubic),
  );

  yield loop(Infinity, () =>
    chain(line1().scale(1.04, 0.7, easeInOutSine), line1().scale(1, 0.7, easeInOutSine)),
  );

  yield* waitFor(2.2);
  yield* all(line1().opacity(0, 0.5), line2().opacity(0, 0.5), tag().opacity(0, 0.5));
});
