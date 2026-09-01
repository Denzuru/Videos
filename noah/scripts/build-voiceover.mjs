/**
 * Cuts the recorded scene narration into one clip per spoken line.
 *
 * The voice is recorded a whole scene at a time - one call per scene rather
 * than one per line, which is both cheaper and gives the reader a consistent
 * run-up so the delivery does not reset between sentences. This script finds
 * the pauses between sentences and cuts there, producing a clip per line plus
 * the measured durations the scenes use to hold each caption.
 *
 *   node scripts/build-voiceover.mjs
 *
 * Reads  vo/raw/<scene>.mp3
 * Writes public/vo/<scene>.wav  and  src/narration.json
 *
 * One track per scene rather than one clip per line, because Revideo only
 * renders the first Audio node a scene adds - later ones are silently dropped.
 * So the scene plays its whole recording once and the captions are timed to
 * offsets inside it.
 */
import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = path.join(root, 'vo/raw');
const outDir = path.join(root, 'public/vo');

/** Pulled straight from the scenes' own line table so the two cannot drift. */
async function loadLines() {
  const src = await fs.readFile(path.join(root, 'src/narration-lines.ts'), 'utf8');
  const scenes = {};
  let current = null;
  for (const line of src.split('\n')) {
    const scene = line.match(/^ {2}(\w+): \[$/);
    if (scene) {
      current = scene[1];
      scenes[current] = [];
      continue;
    }
    const entry = line.match(/\{id: '([^']+)', text: '((?:[^'\\]|\\.)*)'\}/);
    if (entry && current) {
      scenes[current].push({id: entry[1], text: entry[2].replace(/\\'/g, "'")});
    }
  }
  return scenes;
}

async function duration(file) {
  const {stdout} = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1',
    file,
  ]);
  return Number(stdout.trim());
}

/** Every silent stretch in the file, as [start, end] pairs. */
async function findGaps(file, minGap) {
  const {stderr} = await run('ffmpeg', [
    '-hide_banner', '-nostats',
    '-i', file,
    '-af', `silencedetect=noise=-40dB:d=${minGap}`,
    '-f', 'null', '-',
  ]).catch(e => e);

  const gaps = [];
  let start = null;
  for (const line of String(stderr).split('\n')) {
    const s = line.match(/silence_start: ([\d.]+)/);
    if (s) start = Number(s[1]);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (e && start !== null) {
      gaps.push([start, Number(e[1])]);
      start = null;
    }
  }
  return gaps;
}

/**
 * Choose which pauses are line boundaries.
 *
 * A pause threshold alone does not work: in a line like "Thump. Flap. Squeak.
 * Roar." the gaps between words are as long as the gaps between sentences. So
 * every pause is a candidate, and the best set of boundaries is the one that
 * both falls on long pauses AND lands near where each line is expected to end,
 * estimated from how much text precedes it. A short dynamic program picks the
 * combination with the best total score, in order.
 */
async function findSplitPoints(file, lines) {
  const total = await duration(file);
  const gaps = (await findGaps(file, 0.22)).filter(
    ([s, e]) => s > 0.15 && e < total - 0.15,
  );

  const wanted = lines.length - 1;
  if (gaps.length < wanted) return null;

  // Where each boundary should fall if the reader kept a steady pace.
  //
  // Character count alone is a poor clock: "Thump. Flap. Squeak. Roar." is
  // short to write and slow to say, because the reader pauses at every full
  // stop. Counting each sentence break as roughly six characters' worth of
  // time tracks the real delivery closely enough to aim at.
  const SENTENCE_BREAK_IN_CHARS = 6;
  const weights = lines.map(
    l => l.text.length + (l.text.match(/[.!?]/g)?.length ?? 0) * SENTENCE_BREAK_IN_CHARS,
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const targets = [];
  let run = 0;
  for (let i = 0; i < wanted; i++) {
    run += weights[i];
    targets.push((run / totalWeight) * total);
  }

  const candidates = gaps.map(([s, e]) => ({mid: (s + e) / 2, len: e - s}));
  // A long pause is evidence of a boundary; distance from the expected time is
  // evidence against. The weights only have to rank candidates sensibly.
  const score = (c, b) => c.len * 3 - Math.abs(c.mid - targets[b]) * 0.35;

  // best[b][c] = best total score placing boundary b at candidate c.
  const NEG = -Infinity;
  const best = Array.from({length: wanted}, () => new Array(candidates.length).fill(NEG));
  const from = Array.from({length: wanted}, () => new Array(candidates.length).fill(-1));

  for (let c = 0; c < candidates.length; c++) {
    best[0][c] = score(candidates[c], 0);
  }
  for (let b = 1; b < wanted; b++) {
    for (let c = b; c < candidates.length; c++) {
      for (let prev = b - 1; prev < c; prev++) {
        if (best[b - 1][prev] === NEG) continue;
        const total_ = best[b - 1][prev] + score(candidates[c], b);
        if (total_ > best[b][c]) {
          best[b][c] = total_;
          from[b][c] = prev;
        }
      }
    }
  }

  let end = -1;
  for (let c = wanted - 1; c < candidates.length; c++) {
    if (end === -1 || best[wanted - 1][c] > best[wanted - 1][end]) end = c;
  }
  if (end === -1 || best[wanted - 1][end] === NEG) return null;

  const picked = [];
  for (let b = wanted - 1, c = end; b >= 0; b--) {
    picked.unshift(candidates[c].mid);
    c = from[b][c];
  }

  return {total, cuts: picked, candidates: candidates.length};
}

const scenes = await loadLines();
await fs.rm(outDir, {recursive: true, force: true});
await fs.mkdir(outDir, {recursive: true});

const manifest = {};
let failures = 0;

for (const [scene, lines] of Object.entries(scenes)) {
  const file = path.join(rawDir, `${scene}.mp3`);
  const found = await findSplitPoints(file, lines);

  if (!found) {
    console.error(
      `  ${scene}: could not place ${lines.length - 1} boundaries - not enough ` +
      `pauses in the recording`,
    );
    failures++;
    continue;
  }

  // The scene plays this one file; the cuts become caption timings.
  const track = path.join(outDir, `${scene}.wav`);
  await run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', file,
    '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le',
    track,
  ]);

  const bounds = [0, ...found.cuts, found.total];
  manifest[scene] = {
    src: `/vo/${scene}.wav`,
    duration: Number(found.total.toFixed(3)),
    lines: lines.map((line, i) => ({
      id: line.id,
      start: Number(bounds[i].toFixed(3)),
      end: Number(bounds[i + 1].toFixed(3)),
    })),
  };

  console.log(
    `  ${scene}: ${lines.length} lines placed in a ${found.total.toFixed(1)}s ` +
    `track (${found.candidates} candidate pauses)`,
  );
}

await fs.writeFile(
  path.join(root, 'src/narration.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

const spoken = Object.values(manifest).reduce((a, s) => a + s.duration, 0);
console.log(`\n${Object.keys(manifest).length} scene tracks, ${spoken.toFixed(1)}s of narration`);
if (failures) {
  console.error(`${failures} scene(s) failed`);
  process.exit(1);
}
