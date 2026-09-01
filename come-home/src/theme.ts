/**
 * The film makes one journey, from a cold blue night to a gold sunrise, and the
 * palette exists to make that journey readable at a glance: everything before
 * the cross is graded towards night and steel, everything after it towards
 * ember and gold. Captions sit on cream, which reads over both ends.
 */
export const palette = {
  night: '#060910',
  ink: '#0c121c',
  steel: '#16253a',
  dusk: '#27405f',

  ember: '#ff8a3d',
  gold: '#ffc46b',
  amber: '#f5a524',

  cream: '#fdf8f0',
  white: '#ffffff',
  black: '#000000',
} as const;

export const font = {
  display: '"Playfair Display", Georgia, serif',
  body: 'Inter, system-ui, sans-serif',
} as const;

/** The film is shot vertical, for a phone held upright. */
export const frame = {
  width: 1080,
  height: 1920,
} as const;

/**
 * Captions are the loudest thing on screen after the picture, so they are set
 * tight, heavy and centred, with a hard shadow that keeps them readable over a
 * blown-out sunrise as well as over a black bedroom.
 */
export const captionText = {
  fontFamily: font.body,
  fontWeight: 800,
  fontSize: 70,
  lineHeight: 84,
  letterSpacing: -1,
  textAlign: 'center' as const,
  fill: palette.cream,
  shadowColor: 'rgba(0, 0, 0, 0.85)',
  shadowBlur: 24,
  shadowOffset: [0, 6] as [number, number],
};

/** The one-word slams: bigger, tighter, all caps, gold. */
export const slamText = {
  ...captionText,
  fontSize: 168,
  lineHeight: 168,
  letterSpacing: -4,
  fill: palette.gold,
  shadowBlur: 40,
};

/** Scripture and the prayer, which want a quieter, more classical voice. */
export const verseText = {
  fontFamily: font.display,
  fontWeight: 500,
  fontSize: 62,
  lineHeight: 84,
  textAlign: 'center' as const,
  fill: palette.cream,
  shadowColor: 'rgba(0, 0, 0, 0.8)',
  shadowBlur: 24,
  shadowOffset: [0, 5] as [number, number],
};

/** Small uppercase labels: the reference under a verse, the closing handle. */
export const labelText = {
  fontFamily: font.body,
  fontWeight: 600,
  fontSize: 30,
  letterSpacing: 8,
  textAlign: 'center' as const,
  fill: palette.gold,
};
