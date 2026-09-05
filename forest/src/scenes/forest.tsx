import {Gradient, Img, Node, Rect, Txt, makeScene2D} from '@revideo/2d';
import {
  all,
  cancel,
  createRef,
  delay,
  easeInCubic,
  easeInOutSine,
  easeOutCubic,
  linear,
  waitFor,
} from '@revideo/core';
import type {ThreadGenerator} from '@revideo/core';
import {makeWeather} from '../components/weather';
import {CROSSFADE, shots} from '../shots';
import {caption} from '../theme';

const W = 1080;
const H = 1920;
const CAPTION_Y = -30;

export default makeScene2D('forest', function* (view) {
  view.add(<Rect size={[W, H]} fill={'#050607'} />);

  const vignette = new Gradient({
    type: 'radial',
    from: [0, 0],
    to: [0, 0],
    fromRadius: 520,
    toRadius: 1240,
    stops: [
      {offset: 0, color: 'rgba(0, 0, 0, 0)'},
      {offset: 1, color: 'rgba(0, 0, 0, 0.6)'},
    ],
  });

  const built = shots.map((shot, i) => {
    const layer = createRef<Node>();
    const cam = createRef<Node>();
    const txt = createRef<Txt>();
    const weather = makeWeather(shot.weather, 100 + i);
    const node = (
      <Node ref={layer} opacity={0}>
        <Node ref={cam} scale={shot.zoom[0]}>
          <Img src={shot.src} size={[W, H]} />
          {weather.node}
        </Node>
        <Rect size={[W, H]} fill={vignette} />
        <Rect size={[W, H]} fill={'rgba(0, 0, 0, 0.14)'} />
        <Txt
          ref={txt}
          {...caption}
          y={CAPTION_Y}
          width={940}
          textWrap={true}
          textAlign={'center'}
          skew={[-7, 0]}
          opacity={0}
        />
      </Node>
    );
    return {shot, node, layer, cam, txt, weather};
  });
  view.add(<Node>{built.map(b => b.node)}</Node>);

  function* showCaption(txt: Txt, text: string, hold: number) {
    txt.text(text);
    txt.opacity(0);
    txt.position.y(CAPTION_Y + 16);
    yield* all(txt.opacity(1, 0.55, easeInOutSine), txt.position.y(CAPTION_Y, 0.7, easeOutCubic));
    yield* waitFor(hold);
    yield* all(txt.opacity(0, 0.45, easeInOutSine), txt.position.y(CAPTION_Y - 12, 0.45, easeInCubic));
  }

  let previous: {layer: () => Node; tasks: ThreadGenerator[]} | null = null;

  for (let i = 0; i < built.length; i++) {
    const b = built[i];
    const {duration, zoom, drift, captions} = b.shot;
    const fade = i === 0 ? 1.2 : CROSSFADE;

    // Background work for this shot: weather, the slow camera move, captions.
    const tasks: ThreadGenerator[] = [];
    tasks.push(yield b.weather.run());
    tasks.push(yield b.cam().scale(zoom[1], duration + CROSSFADE, linear));
    tasks.push(yield b.cam().position(drift, duration + CROSSFADE, linear));
    for (const c of captions) {
      tasks.push(yield delay(c.at, showCaption(b.txt(), c.text, c.hold)));
    }

    yield* b.layer().opacity(1, fade, easeInOutSine);

    // The shot underneath is fully covered now; stop paying for it.
    if (previous) {
      previous.layer().opacity(0);
      previous.tasks.forEach(cancel);
    }
    previous = {layer: b.layer, tasks};

    yield* waitFor(duration - fade);
  }

  // Out to black.
  yield* previous!.layer().opacity(0, 1.1, easeInOutSine);
  yield* waitFor(0.3);
});
