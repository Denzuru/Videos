/** Graphite on paper. Everything is a shade of grey; the paper supplies the warmth. */
export const ink = {
  dark: '#2c2c2c',
  line: '#3b3b3b',
  mid: '#6a6a6a',
  wood: '#b7b7b1',
  highlight: '#d9d9d4',
  vane: '#dededa',
};

/** Shared stroke settings that make a vector path read as a pencil line. */
export const pencil = {
  stroke: ink.line,
  lineWidth: 4,
  lineCap: 'round' as const,
  lineJoin: 'round' as const,
  shadowBlur: 3,
  shadowColor: 'rgba(40, 40, 40, 0.35)',
};

/** The handwritten caption style, upper case with a little air between letters. */
export const handwriting = {
  fontFamily: 'Caveat',
  fontWeight: 700,
  fontSize: 68,
  letterSpacing: 4,
  fill: ink.dark,
};

/** Tiny deterministic PRNG so every render of the film is identical. */
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
