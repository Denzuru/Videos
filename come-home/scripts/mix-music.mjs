/**
 * Lays a music bed under a rendered film.
 *
 * The music is mixed in afterwards rather than played from a scene, because
 * Revideo renders only the first Audio node a scene adds - that slot is taken
 * by the narration - and because ducking the music under the voice is far
 * easier to control here.
 *
 *   node scripts/mix-music.mjs in.mp4 out.mp4 [--switch=140]
 *
 * `switch` is when the aching first track hands over to the one that lifts, in
 * seconds. It wants to land on the cross, not after it. The two are crossfaded,
 * and the bed is ducked automatically wherever the narrator is speaking.
 */
import {execFile} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const [input, output] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

if (!input || !output) {
  console.error('usage: node scripts/mix-music.mjs <in.mp4> <out.mp4> [--switch=140]');
  process.exit(1);
}

const CROSSFADE = 4;
const BED_LEVEL = 0.2;   // music under narration
const DUCK_LEVEL = 0.5;   // how far the bed drops while the voice is speaking

async function duration(file) {
  const {stdout} = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file,
  ]);
  return Number(stdout.trim());
}

const filmLength = await duration(input);
const handover = Number(args.switch ?? Math.round(filmLength * 0.62));

const heavy = path.join(root, 'public/music/weight.wav');
const risen = path.join(root, 'public/music/risen.wav');

// Both tracks are looped so a short one still covers its stretch, trimmed to
// the film, crossfaded at the handover, then ducked under the voice.
const filter = [
  `[1:a]aloop=loop=-1:size=2e9,atrim=0:${handover + CROSSFADE},asetpts=N/SR/TB[a]`,
  `[2:a]aloop=loop=-1:size=2e9,atrim=0:${Math.max(CROSSFADE + 1, filmLength - handover)},asetpts=N/SR/TB[b]`,
  `[a][b]acrossfade=d=${CROSSFADE}:c1=tri:c2=tri[bed]`,
  `[bed]atrim=0:${filmLength},volume=${BED_LEVEL},` +
    `afade=t=in:st=0:d=2,afade=t=out:st=${Math.max(0, filmLength - 4)}:d=4[music]`,
  // Split the voice: one copy is heard, the other only steers the ducking.
  `[0:a]asplit=2[voice][key]`,
  `[music][key]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=450:makeup=1[ducked]`,
  `[voice][ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[out]`,
].join(';');

await run('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', input,
  '-i', heavy,
  '-i', risen,
  '-filter_complex', filter,
  '-map', '0:v', '-map', '[out]',
  '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart',
  '-shortest',
  output,
]);

console.log(
  `mixed: ${output} (${filmLength.toFixed(1)}s, music handover at ${handover}s)`,
);
