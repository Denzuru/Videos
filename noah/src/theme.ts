/**
 * A loud, saturated palette. This film is meant to be fun to look at, so the
 * colours stay high-chroma and high-contrast rather than tasteful.
 */
export const palette = {
  sky: '#57d6ff',
  skyDeep: '#159ee0',
  skyPale: '#c2f0ff',
  stormTop: '#33436b',
  stormLow: '#5f7099',

  sun: '#ffd60a',
  sunDeep: '#ffaa00',
  orange: '#ff8500',
  coral: '#ff5d8f',
  pink: '#ff90c4',
  purple: '#9d4edd',
  grape: '#6a4c93',

  grass: '#57cc47',
  grassDeep: '#3a9e2f',
  water: '#0091d5',
  waterDeep: '#00679c',
  foam: '#a8ecff',

  wood: '#d08a3e',
  woodDeep: '#a2621f',
  woodDark: '#7a4715',

  cream: '#fffaf0',
  ink: '#2b2438',
  white: '#ffffff',
} as const;

/** Six bands, in order, used for the rainbow and for confetti. */
export const rainbow = [
  '#ff595e',
  '#ff924c',
  '#ffca3a',
  '#8ac926',
  '#1982c4',
  '#6a4c93',
] as const;

export const font = {
  display: '"Baloo 2", Nunito, sans-serif',
  body: 'Nunito, sans-serif',
};

/** Big chunky title type with a heavy ink outline, comic-book style. */
export const punchText = {
  fontFamily: font.display,
  fontWeight: 800,
  fill: palette.cream,
  stroke: palette.ink,
  lineWidth: 14,
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
  lineWidth: 10,
  strokeFirst: true,
  textAlign: 'center' as const,
  lineHeight: 78,
};

export function glow(color: string, blur = 40) {
  return {shadowColor: color, shadowBlur: blur};
}
