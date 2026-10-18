import { z, defineCollection } from 'astro:content';

const texturesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title:      z.string(),
    category:   z.enum(['terrain', 'architecture', 'character', 'vfx', 'props']),
    tags:       z.array(z.string()).default([]),
    resolution: z.string().default('16x16'),
    tileable:   z.boolean().default(false),
    palette:    z.array(z.string()).default([]),
    era:        z.enum(['vedic', 'mughal', 'colonial', 'modern', 'future', 'universal']).optional(),
    prompt:     z.string().optional(),
    added:      z.coerce.date().optional(),
  }),
});

export const collections = {
  textures: texturesCollection,
};
