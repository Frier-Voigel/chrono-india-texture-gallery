#!/usr/bin/env node
/**
 * generate-manifest.mjs
 * Build-time: Walk /public/textures/ → write src/data/manifest.json
 * This JSON index can be used for client-side search / SSR.
 *
 * Usage: node scripts/generate-manifest.mjs
 */

import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const TEX_DIR   = path.join(ROOT, 'public', 'textures');
const OUT_FILE  = path.join(ROOT, 'src', 'data', 'manifest.json');

const CATEGORIES = ['terrain', 'architecture', 'character', 'vfx', 'props'];

async function generateManifest() {
  const manifest = {};

  for (const cat of CATEGORIES) {
    const catDir = path.join(TEX_DIR, cat);
    if (!existsSync(catDir)) {
      manifest[cat] = [];
      continue;
    }

    let files;
    try {
      files = await readdir(catDir);
    } catch {
      manifest[cat] = [];
      continue;
    }

    const pngs = files
      .filter(f => f.toLowerCase().endsWith('.png'))
      .map(f => {
        const slug = path.basename(f, '.png');
        return {
          slug,
          category: cat,
          src:   `/textures/${cat}/${f}`,
          thumb: `/thumbnails/${cat}/${slug}.webp`,
        };
      });

    manifest[cat] = pngs;
    console.log(`  ${cat}: ${pngs.length} textures`);
  }

  // Flatten for convenience
  const flat = Object.values(manifest).flat();
  manifest._all = flat;
  manifest._count = flat.length;
  manifest._generated = new Date().toISOString();

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest written: ${OUT_FILE} (${flat.length} total textures)`);
}

generateManifest().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
