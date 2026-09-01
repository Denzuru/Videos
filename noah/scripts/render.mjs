/**
 * Renders the Revideo project to an MP4.
 *
 * Revideo ships its own headless renderer: it splits the timeline across
 * several Puppeteer instances and pipes frames straight into ffmpeg, so this
 * is just configuration plus progress reporting.
 */
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
const outFile = args.out ?? 'noahs-big-boat.mp4';

// Deliberately NOT the pre-installed Playwright Chromium: that build ships
// without the H.264 encoder, and Revideo encodes frames in the browser through
// WebCodecs. Puppeteer's own Chrome download has the codec.

const progress = new Array(workers).fill(0);
let lastReport = 0;

const file = await renderVideo({
  projectFile: path.join(root, 'src/project.ts'),
  settings: {
    outFile,
    outDir: root,
    workers,
    logProgress: false,
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
      console.log(
        `  ${(mean * 100).toFixed(1)}%  [${progress
          .map(p => `${(p * 100).toFixed(0)}%`)
          .join(' ')}]`,
      );
    },
  },
});

console.log(`\ndone: ${file}`);
