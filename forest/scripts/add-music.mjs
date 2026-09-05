/**
 * Lays the music bed under a silent render.
 *
 *   node scripts/add-music.mjs silent.mp4 quiet-growth.mp4
 *
 * The bed is synthesised to the exact length of the film by
 * scripts/make-music.py, so the score always ends with the picture no matter
 * how the shots are re-timed.
 */

import {execFile} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const ffprobe = require('@ffprobe-installer/ffprobe').path;

const [input, output] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const args = Object.fromEntries(
  process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);
if (!input || !output) {
  console.error('usage: node scripts/add-music.mjs <in.mp4> <out.mp4> ');
  process.exit(1);
}

const {stdout} = await run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', input]);
const length = Number(stdout.trim());
const bed = path.join(root, 'public/music/bed.wav');

await run('python3', [path.join(root, 'scripts/make-music.py'), bed, `--length=${length.toFixed(2)}`]);
await run(ffmpeg, [
  '-y', '-i', input, '-i', bed,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
  path.resolve(root, output),
]);
console.log(`wrote ${output} (${length.toFixed(2)}s)`);
