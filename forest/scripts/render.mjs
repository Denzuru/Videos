/**
 * Renders the film to an MP4 with Revideo's headless renderer.
 *
 *   node scripts/render.mjs [--out=pulled-back.mp4] [--workers=4]
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderVideo} from '@revideo/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
    return [key, value];
  }),
);

const workers = Number(args.workers ?? Math.max(1, Math.min(4, os.cpus().length)));
const outFile = args.out ?? 'quiet-growth.mp4';

const progress = new Array(workers).fill(0);
let lastReport = 0;

// Relative asset paths such as /music/bed.wav resolve against
// `<outDir>/../public`, so render into a directory inside the project.
const file = await renderVideo({
  projectFile: path.join(root, 'src/project.ts'),
  settings: {
    outFile,
    outDir: 'output',
    workers,
    logProgress: false,
    // Stream lossless frames out to ffmpeg instead of encoding in the browser,
    // so scripts/ffmpeg-hq.sh can set a real quality target.
    projectSettings: {
      exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}},
    },
    ffmpeg: {ffmpegPath: path.join(root, 'scripts/ffmpeg-hq.sh')},
    puppeteer: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
        '--force-color-profile=srgb',
        '--disable-lcd-text',
      ],
    },
    progressCallback: (worker, value) => {
      progress[worker] = value;
      const now = Date.now();
      if (now - lastReport < 5000) return;
      lastReport = now;
      const mean = progress.reduce((a, b) => a + b, 0) / workers;
      console.log(`  ${(mean * 100).toFixed(1)}%  [${progress.map(p => `${(p * 100).toFixed(0)}%`).join(' ')}]`);
    },
  },
});

const finished = path.join(root, outFile);
await fs.rename(path.resolve(root, file), finished);
console.log('wrote', finished);
