import { z } from 'zod';
export const licenses = ['CC0-1.0', 'CC-BY-4.0'];
export const licenseURLs = {
  'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
};
export const safePath = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+$/)
  .refine((s) => !s.split('/').some((p) => p === '.' || p === '..'));
export const assetSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: z.string().regex(/^[a-z0-9-]+\/(models|rigs|animations|tex|ui|sfx)\/[a-z0-9_-]+$/),
    name: z.string().min(2).max(100),
    kind: z.enum(['model', 'rig', 'animation', 'texture', 'artwork', 'sound']),
    collection: z.string().regex(/^[a-z0-9-]+$/),
    category: z.string().min(2).max(50),
    description: z.string().min(20).max(1500),
    tags: z
      .array(z.string().regex(/^[a-z0-9-]+$/))
      .min(1)
      .max(30),
    creator: z.strictObject({
      name: z.string().min(2).max(100),
      url: z.url().startsWith('https://'),
    }),
    license: z.enum(licenses),
    attribution: z.string().min(5).max(600),
    file: safePath,
    preview: safePath.optional(),
    source: z.strictObject({
      method: z.enum(['ai-generated', 'procedural', 'authored', 'mixed']),
      generator: z.string().min(2).max(150),
      description: z.string().min(10).max(2000),
      referenceRights: z.string().min(10).max(600).optional(),
    }),
    usage: z.strictObject({
      units: z.enum(['metres', 'unspecified']).optional(),
      upAxis: z.enum(['Y', 'Z']).optional(),
      scaleVerified: z.boolean().optional(),
      seamlessVerified: z.boolean().optional(),
      rigTarget: z.string().min(3).max(120).optional(),
      rootMotion: z.enum(['in-place', 'root-motion', 'mixed', 'unspecified']).optional(),
      notes: z.array(z.string().min(1).max(500)).max(12),
    }),
  })
  .superRefine((a, ctx) => {
    const [collection, folder, slug] = a.id.split('/'),
      ext = a.file.split('.').at(-1);
    const allowed = {
      model: ['glb'],
      rig: ['glb'],
      animation: ['glb'],
      texture: ['webp', 'png', 'jpg'],
      artwork: ['webp', 'png', 'jpg'],
      sound: ['wav', 'mp3', 'ogg'],
    };
    if (
      a.collection !== collection ||
      a.file !== `assets/${collection}/${folder}/${slug}.${ext}` ||
      !allowed[a.kind].includes(ext)
    )
      ctx.addIssue({ code: 'custom', message: 'File, ID, collection and kind must agree.' });
    if (
      folder !==
      {
        model: 'models',
        rig: 'rigs',
        animation: 'animations',
        texture: 'tex',
        artwork: 'ui',
        sound: 'sfx',
      }[a.kind]
    )
      ctx.addIssue({ code: 'custom', message: 'ID folder must agree with kind.' });
    if (['model', 'rig', 'animation'].includes(a.kind) && !a.preview)
      ctx.addIssue({ code: 'custom', message: '3D assets need a preview image.' });
    if (['rig', 'animation'].includes(a.kind) && !a.usage.rigTarget)
      ctx.addIssue({
        code: 'custom',
        message: 'Rigs and animation packs need an explicit target-rig ID or contract.',
      });
    if (a.preview && !/^thumbnails\/[a-zA-Z0-9_.-]+\.(png|webp|jpg)$/.test(a.preview))
      ctx.addIssue({
        code: 'custom',
        message: 'Preview must be an image directly under thumbnails/.',
      });
  });
