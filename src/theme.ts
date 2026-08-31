import {Color} from '@motion-canvas/core';

/**
 * A warm night-to-dawn palette. The story travels from deep night (scenes 1-4)
 * into sunrise gold (scenes 6-8), so most colours come in a cool and a warm
 * variant that scenes tween between.
 */
export const palette = {
  nightDeep: '#0d1330',
  night: '#161f47',
  nightSoft: '#243066',
  dusk: '#3b2f6b',
  plum: '#5a3a6e',

  gold: '#ffd97d',
  goldDeep: '#f5b944',
  amber: '#ff9f5a',
  rose: '#ff8fab',
  coral: '#ff7a6b',

  mint: '#7fe3c4',
  sky: '#8fd4ff',

  cream: '#fff8ee',
  parchment: '#f3e3c8',
  muted: '#a9b0d6',

  grey: '#6b7392',
  greyDeep: '#3d4361',
} as const;

export const font = {
  display: 'Fredoka, Nunito, sans-serif',
  body: 'Nunito, sans-serif',
};

/** Title copy: big, soft, centred. */
export const titleText = {
  fontFamily: font.display,
  fontWeight: 600,
  fill: palette.cream,
  textAlign: 'center' as const,
  lineHeight: 110,
};

/** Narration copy: the line a parent would read aloud. */
export const narrationText = {
  fontFamily: font.body,
  fontWeight: 400,
  fill: palette.cream,
  textAlign: 'center' as const,
  fontSize: 58,
  lineHeight: 84,
  // A dark halo, so a caption stays readable wherever the art puts it.
  shadowColor: 'rgba(6, 8, 22, 0.9)',
  shadowBlur: 22,
};

export const verseText = {
  fontFamily: font.body,
  fontWeight: 400,
  fill: palette.parchment,
  textAlign: 'center' as const,
  fontSize: 40,
  lineHeight: 60,
};

/** Soft outer glow used on anything that should feel lit from within. */
export function glow(color: string, blur = 60) {
  return {shadowColor: color, shadowBlur: blur};
}

export function alpha(color: string, a: number) {
  return new Color(color).alpha(a).css();
}
