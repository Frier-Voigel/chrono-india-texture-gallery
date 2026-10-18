#!/usr/bin/env node
/**
 * generate-zips.mjs
 * Build-time: Create per-category ZIP bundles for bulk download.
 * Uses JSZip (Node CJS-compatible).
 *
 * Usage: node scripts/generate-zips.mjs
 */

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const JSZip = require('jszip');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT    = path.resolve(__dirname, '..');
const TEX_DIR = path.join(ROOT, 'public', 'textures');
const ZIP_DIR = path.join(ROOT, 'public', 'zip');

const CATEGORIES = ['terrain', 'architecture', 'character', 'vfx', 'props'];

async function generateZips() {
  await mkdir(ZIP_DIR, { recursive: true });

  for (const cat of CATEGORIES) {
    const catDir = path.join(TEX_DIR, cat);
    if (!existsSync(catDir)) {
      console.log(`  [skip] ${cat}/ — no source folder`);
      continue;
    }

    let files;
    try {
      files = await readdir(catDir);
    } catch {
      console.warn(`  [warn] Could not read ${catDir}`);
      continue;
    }

    const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));
    if (!pngs.length) {
      console.log(`  [skip] ${cat}/ — no PNG files`);
      continue;
    }

    const zip = new JSZip();
    const folder = zip.folder(`chrono-india-textures-${cat}`);

    for (const png of pngs) {
      const data = await readFile(path.join(catDir, png));
      folder.file(png, data);
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const outPath = path.join(ZIP_DIR, `${cat}.zip`);
    await writeFile(outPath, zipBuffer);
    console.log(`  ✓ ${cat}.zip (${pngs.length} PNGs, ${(zipBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log('\nAll ZIPs generated.');
}

generateZips().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
