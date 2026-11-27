/**
 * Convert the supplied PNG photography to WebP at source resolution.
 *
 * The originals are 2.0–3.0MB PNGs. next/image still re-encodes to AVIF/WebP
 * per breakpoint, but decoding a 2.2MB PNG on every cold optimisation is slow
 * enough to be visible. Quality 82 is visually lossless on this material.
 * The logo stays PNG — it needs the alpha channel and is already small.
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve('public/img');
const KEEP_PNG = new Set(['logo.png']);

const files = (await readdir(dir)).filter((f) => f.endsWith('.png') && !KEEP_PNG.has(f));
let before = 0;
let after = 0;

for (const file of files) {
  const from = path.join(dir, file);
  const to = from.replace(/\.png$/, '.webp');
  before += (await stat(from)).size;
  await sharp(from).webp({ quality: 82, effort: 5 }).toFile(to);
  after += (await stat(to)).size;
  await unlink(from);
  process.stdout.write('.');
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\n${files.length} images  ${mb(before)}MB -> ${mb(after)}MB`);
