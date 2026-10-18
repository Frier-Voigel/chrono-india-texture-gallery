#!/usr/bin/env node
/**
 * generate-thumbnails.mjs
 * Build-time script: Walk /public/textures/ → generate 128×128 WebP thumbnails
 * into /public/thumbnails/ using Sharp's nearestNeighbor algorithm.
 *
 * Usage: node scripts/generate-thumbnails.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const SRC_DIR   = path.join(ROOT, 'public', 'textures');
const OUT_DIR   = path.join(ROOT, 'public', 'thumbnails');
const THUMB_SIZE = 128;

const CATEGORIES = ['terrain', 'architecture', 'character', 'vfx', 'props'];

async function generateThumbnails() {
  let total = 0;
  let errors = 0;

  for (const cat of CATEGORIES) {
    const srcCat = path.join(SRC_DIR, cat);
    const outCat = path.join(OUT_DIR, cat);

    if (!existsSync(srcCat)) {
      console.log(`  [skip] ${cat}/ — source folder not found`);
      continue;
    }

    await mkdir(outCat, { recursive: true });

    let files;
    try {
      files = await readdir(srcCat);
    } catch {
      console.warn(`  [warn] Could not read ${srcCat}`);
      continue;
    }

    const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));

    for (const png of pngs) {
      const srcPath = path.join(srcCat, png);
      const baseName = path.basename(png, '.png');
      const outPath = path.join(outCat, `${baseName}.webp`);

      try {
        await sharp(srcPath)
          .resize(THUMB_SIZE, THUMB_SIZE, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: sharp.kernel.nearest,   // Preserve pixel-art crispness
          })
          .webp({ quality: 90, lossless: true })
          .toFile(outPath);

        console.log(`  ✓ ${cat}/${baseName}.webp`);
        total++;
      } catch (err) {
        console.error(`  ✗ ${cat}/${png}: ${err.message}`);
        errors++;
      }
    }
  }

  // Generate placeholder thumbnail for missing images
  await generatePlaceholder();

  console.log(`\nDone: ${total} thumbnails generated, ${errors} errors.`);
}

async function generatePlaceholder() {
  const placeholderPath = path.join(OUT_DIR, 'placeholder.webp');
  if (existsSync(placeholderPath)) return;

  await mkdir(OUT_DIR, { recursive: true });

  // Create a simple 128×128 dark grey placeholder
  const size = 128;
  const pixels = Buffer.alloc(size * size * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i]   = 42;  // R (dark grey)
    pixels[i+1] = 34;  // G
    pixels[i+2] = 26;  // B
    pixels[i+3] = 255; // A
  }

  await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 80 })
    .toFile(placeholderPath);

  console.log('  ✓ placeholder.webp (fallback)');
}

generateThumbnails().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
