/**
 * Renders the Motion Canvas project to an MP4 without opening the editor.
 *
 * Vite is started in-process so the Motion Canvas exporter has its usual HMR
 * channel to write frames through, Playwright drives a headless Chromium that
 * runs the renderer, and ffmpeg turns the frame sequence into video.
 *
 * Frames are rendered in chunks and encoded away after each chunk so that a
 * three minute 1080p film never needs the whole PNG sequence on disk at once.
 */
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = 'gospel-for-a-child';
const frameDir = path.join(root, 'output', PROJECT);
const partsDir = path.join(root, 'output', 'parts');

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
    return [key, value];
  }),
);

const fps = Number(args.fps ?? 30);
const chunk = Number(args.chunk ?? 20);
const limit = args.limit ? Number(args.limit) : Infinity;
const outFile = path.join(root, args.out ?? `${PROJECT}.mp4`);

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {stdio: ['ignore', 'ignore', 'pipe']});
    let stderr = '';
    child.stderr.on('data', d => (stderr += d));
    child.on('error', reject);
    child.on('close', code =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}\n${stderr.slice(-2500)}`)),
    );
  });
}

async function frameCount() {
  const files = await fs.readdir(frameDir).catch(() => []);
  return files.filter(f => f.endsWith('.png')).length;
}

async function encodePart(index) {
  const files = (await fs.readdir(frameDir)).filter(f => f.endsWith('.png')).sort();
  if (files.length === 0) return null;

  const part = path.join(partsDir, `part-${String(index).padStart(3, '0')}.mp4`);
  await run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-framerate', String(fps),
    '-start_number', String(Number(files[0].replace('.png', ''))),
    '-i', path.join(frameDir, '%06d.png'),
    '-frames:v', String(files.length),
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    part,
  ]);

  await Promise.all(files.map(f => fs.rm(path.join(frameDir, f))));
  return part;
}

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  logLevel: 'warn',
  server: {port: 9000, strictPort: true},
});
await server.listen();
const url = `http://localhost:${server.config.server.port}/render.html`;
console.log(`vite listening, rendering from ${url}`);

// The pre-installed Chromium in this environment predates the pinned
// Playwright build, so point at it explicitly rather than downloading one.
const bundled = '/opt/pw-browsers/chromium';
const executablePath = existsSync(bundled) ? bundled : undefined;

const browser = await chromium.launch({
  executablePath,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--font-render-hinting=none',
    '--force-color-profile=srgb',
    '--disable-lcd-text',
  ],
});

let exitCode = 0;
try {
  await fs.rm(frameDir, {recursive: true, force: true});
  await fs.rm(partsDir, {recursive: true, force: true});
  await fs.mkdir(frameDir, {recursive: true});
  await fs.mkdir(partsDir, {recursive: true});

  const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [page]', msg.text());
  });
  page.on('pageerror', err => console.error('  [page]', err.message));

  await page.goto(url, {waitUntil: 'networkidle', timeout: 120_000});
  await page.waitForFunction(() => typeof window.renderVideo === 'function', {
    timeout: 120_000,
  });
  // Text metrics are wrong until the webfonts are actually resident.
  await page.evaluate(() => document.fonts.ready);

  const parts = [];
  let start = 0;
  let index = 0;
  let total = 0;

  while (start < limit) {
    const end = Math.min(start + chunk, limit);
    const result = await page.evaluate(
      ([from, to, framerate]) => window.renderVideo(framerate, from, to),
      [start, end, fps],
    );
    if (result !== 'success') {
      throw new Error(`renderer reported "${result}" for range ${start}-${end}s`);
    }

    // A full slice yields one frame per step plus the boundary frame. Anything
    // short of that means the animation ended inside this slice.
    const produced = await frameCount();
    const expected = Math.round((end - start) * fps) + 1;
    const reachedEnd = produced < expected;

    // Past the end, the renderer still flushes a couple of trailing frames.
    if (produced <= 2) {
      await fs.rm(frameDir, {recursive: true, force: true});
      await fs.mkdir(frameDir, {recursive: true});
      break;
    }

    total += produced;
    const part = await encodePart(index++);
    if (part) parts.push(part);
    console.log(
      `  rendered ${start}s-${end}s (${produced} frames, ${total} total)`,
    );
    if (reachedEnd) break;
    start = end;
  }

  if (parts.length === 0) throw new Error('no frames were rendered');

  const listFile = path.join(partsDir, 'parts.txt');
  await fs.writeFile(listFile, parts.map(p => `file '${p}'`).join('\n'));
  await run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    '-movflags', '+faststart',
    outFile,
  ]);

  console.log(`\ndone: ${outFile} (${total} frames at ${fps}fps)`);
} catch (error) {
  console.error(error);
  exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}

process.exit(exitCode);
