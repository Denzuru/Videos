/**
 * The film, shot by shot. Each shot is one illustration with a slow camera
 * move, a weather layer, and one or two captions timed within the shot.
 */
export type Weather = 'motes' | 'leaves' | 'stars' | 'mist' | 'rain';

export interface Caption {
  text: string;
  /** Seconds into the shot when the line starts fading in. */
  at: number;
  /** Seconds the line is held fully visible. */
  hold: number;
}

export interface Shot {
  src: string;
  duration: number;
  weather: Weather;
  /** Camera scale at the start and end of the shot. */
  zoom: [number, number];
  /** Camera drift in pixels over the shot, x and y. */
  drift: [number, number];
  captions: Caption[];
}

export const shots: Shot[] = [
  {
    src: '/art/01-redwoods.jpg',
    duration: 4.8,
    weather: 'motes',
    zoom: [1.08, 1.16],
    drift: [0, -40],
    captions: [
      {text: 'A falling tree', at: 0.5, hold: 1.3},
      {text: 'is heard for miles.', at: 2.5, hold: 1.5},
    ],
  },
  {
    src: '/art/02-moonlit-deer.jpg',
    duration: 4.8,
    weather: 'leaves',
    zoom: [1.16, 1.08],
    drift: [0, 30],
    captions: [
      {text: 'A growing tree', at: 0.5, hold: 1.3},
      {text: 'is heard by no one.', at: 2.5, hold: 1.5},
    ],
  },
  {
    src: '/art/03-summit-stars.jpg',
    duration: 3.8,
    weather: 'stars',
    zoom: [1.06, 1.14],
    drift: [0, -30],
    captions: [{text: 'So grow anyway.', at: 0.6, hold: 2.2}],
  },
  {
    src: '/art/04-mist-walker.jpg',
    duration: 4.4,
    weather: 'mist',
    zoom: [1.1, 1.16],
    drift: [-40, 0],
    captions: [{text: 'Nobody has to clap for it to count.', at: 0.6, hold: 2.7}],
  },
  {
    src: '/art/05-rain-forest.jpg',
    duration: 5.2,
    weather: 'rain',
    zoom: [1.08, 1.15],
    drift: [0, -30],
    captions: [
      {text: 'Loud was never the proof.', at: 0.5, hold: 1.6},
      {text: 'Deep is.', at: 3.0, hold: 1.5},
    ],
  },
];

/** How long one shot dissolves into the next. */
export const CROSSFADE = 0.8;
