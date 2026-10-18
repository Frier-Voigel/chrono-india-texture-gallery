import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type TextureEntry = CollectionEntry<'textures'>;

/**
 * Fetch all texture entries from the content collection,
 * optionally filtered by category.
 */
export async function getAllTextures(category?: string): Promise<TextureEntry[]> {
  const all = await getCollection('textures');
  if (!category || category === 'all') return all;
  return all.filter(t => t.data.category === category);
}

/**
 * Get all unique tags across all textures.
 */
export async function getAllTags(): Promise<string[]> {
  const all = await getCollection('textures');
  const tagSet = new Set<string>();
  for (const t of all) {
    for (const tag of t.data.tags) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

/**
 * Build a lightweight serializable manifest for client-side JS.
 * Note: t.slug is the Astro auto-generated slug from the file path
 *   e.g. "terrain/terrain_grass_01"
 */
export async function buildClientManifest() {
  const all = await getCollection('textures');
  return all.map(t => {
    // t.slug = "terrain/terrain_grass_01" — use the filename part
    const fileName = t.slug.includes('/') ? t.slug.split('/').pop()! : t.slug;
    return {
      slug:       t.slug,           // full Astro slug e.g. "terrain/terrain_grass_01"
      fileName,                     // just the filename part e.g. "terrain_grass_01"
      title:      t.data.title,
      category:   t.data.category,
      tags:       t.data.tags,
      resolution: t.data.resolution,
      tileable:   t.data.tileable,
      palette:    t.data.palette,
      era:        t.data.era ?? 'universal',
      thumb:      `/thumbnails/${t.data.category}/${fileName}.webp`,
      src:        `/textures/${t.data.category}/${fileName}.png`,
      prompt:     t.data.prompt ?? '',
    };
  });
}
