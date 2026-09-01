/**
 * The film travels from a green hillside in Canaan to the gold of Egypt, so
 * the palette carries two families: the bright home colours and a warmer,
 * dustier Egyptian set. Everything stays high-chroma - this is meant to be fun
 * to look at.
 */
export const palette = {
  sky: '#57d6ff',
  skyDeep: '#159ee0',
  skyPale: '#c2f0ff',

  // Egypt
  sand: '#f2c46b',
  sandDeep: '#d99f3f',
  dune: '#e8b354',
  duneShade: '#c98f34',
  stone: '#d8c197',
  terracotta: '#e2703a',
  lapis: '#2b5fd9',
  nile: '#0f9bc4',
  nileDeep: '#0a6f8f',

  // Night, dreams and the well
  night: '#25306b',
  nightDeep: '#151d47',
  pit: '#120f22',

  sun: '#ffd60a',
  sunDeep: '#ffaa00',
  orange: '#ff8500',
  coral: '#ff5d8f',
  pink: '#ff90c4',
  purple: '#9d4edd',

  grass: '#57cc47',
  grassDeep: '#3a9e2f',
  wheat: '#f0c040',
  wheatDeep: '#c8901c',

  cream: '#fffaf0',
  ink: '#2b2438',
  white: '#ffffff',
} as const;

/** The coat. Every colour in it, which is rather the point. */
export const coatStripes = [
  '#ff595e',
  '#ff924c',
  '#ffca3a',
  '#8ac926',
  '#1982c4',
  '#6a4c93',
  '#ff5d8f',
] as const;

export const rainbow = coatStripes;

export const font = {
  display: '"Baloo 2", Nunito, sans-serif',
  body: 'Nunito, sans-serif',
};

/**
 * Big chunky title type with a heavy ink outline, comic-book style.
 *
 * `lineJoin: 'round'` matters: the default miter join grows long spikes where
 * an outline turns a sharp corner, which at this stroke width reads as the
 * letters bleeding.
 */
export const punchText = {
  fontFamily: font.display,
  fontWeight: 800,
  fill: palette.cream,
  stroke: palette.ink,
  lineWidth: 13,
  lineJoin: 'round' as const,
  strokeFirst: true,
  textAlign: 'center' as const,
};

/** The read-aloud line along the bottom. */
export const narrationText = {
  fontFamily: font.body,
  fontWeight: 800,
  fontSize: 58,
  fill: palette.cream,
  stroke: palette.ink,
  // Thinner than the title outline in proportion to the type size, so the
  // counters inside letters like a and e stay open at reading size.
  lineWidth: 8,
  lineJoin: 'round' as const,
  strokeFirst: true,
  textAlign: 'center' as const,
  lineHeight: 78,
};

export function glow(color: string, blur = 40) {
  return {shadowColor: color, shadowBlur: blur};
}
