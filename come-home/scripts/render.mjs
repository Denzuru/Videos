/**
 * Renders the Revideo project to an MP4.
 *
 * Revideo ships its own headless renderer: it splits the timeline across
 * several Puppeteer instances and pipes frames straight into ffmpeg, so this
 * is just configuration plus progress reporting.
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
const outFile = args.out ?? 'come-home.mp4';

// Deliberately NOT the pre-installed Playwright Chromium: that build ships
// without the H.264 encoder, and Revideo encodes frames in the browser through
// WebCodecs. Puppeteer's own Chrome download has the codec.

const progress = new Array(workers).fill(0);
let lastReport = 0;

// Revideo resolves a relative asset src like /vo/line.wav against
// `<outDir>/../public`, so the output directory has to sit one level inside
// the project or every audio clip resolves outside it and the film comes out
// silent. Render into output/ and move the finished file afterwards.
const renderDir = 'output';

const file = await renderVideo({
  projectFile: path.join(root, 'src/project.ts'),
  settings: {
    outFile,
    outDir: renderDir,
    workers,
    logProgress: false,
    // Revideo defaults to its wasm exporter, which encodes in the browser
    // through mp4-wasm at a fixed low bitrate - that is what puts ringing
    // around the hard edges of flat cartoon art and outlined text. The ffmpeg
    // exporter instead streams lossless PNG frames out to ffmpeg, where
    // scripts/ffmpeg-hq.sh can set a real quality target.
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
      console.log(
        `  ${(mean * 100).toFixed(1)}%  [${progress
          .map(p => `${(p * 100).toFixed(0)}%`)
          .join(' ')}]`,
      );
    },
  },
});

const finished = path.join(root, outFile);
await fs.rename(path.resolve(root, file), finished);
await fs.rm(path.join(root, renderDir), {recursive: true, force: true});

console.log(`\ndone: ${finished}`);
