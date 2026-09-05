/** The handwritten caption style: white, casual, a soft shadow so it reads on any art. */
export const caption = {
  fontFamily: 'Kalam',
  fontWeight: 400,
  fontSize: 66,
  letterSpacing: 1,
  fill: '#f4f1ea',
  shadowBlur: 18,
  shadowColor: 'rgba(0, 0, 0, 0.75)',
  shadowOffset: [0, 3] as [number, number],
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
