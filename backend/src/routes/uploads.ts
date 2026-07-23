import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.ts';
import { requireSupabaseAdmin } from '../lib/supabase.ts';
import { uploadRequestSchema } from '../validation/schemas.ts';

const router = Router();
const bucket = 'product-media';

const safeName = (name: string) => {
  const extensionIndex = name.lastIndexOf('.');
  const extension = extensionIndex >= 0 ? name.slice(extensionIndex).toLowerCase().replace(/[^.a-z0-9]/g, '') : '';
  const base = (extensionIndex >= 0 ? name.slice(0, extensionIndex) : name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'media';
  return `${base}${extension}`;
};

const safeFolder = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'project';

router.post('/sign', ...requireAdmin, async (request, response) => {
  const input = uploadRequestSchema.parse(request.body);
  const client = requireSupabaseAdmin();
  const folder = safeFolder(input.projectTitle);

  const uploads = await Promise.all(input.files.map(async (file) => {
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
    const { data, error } = await client.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw error;
    const publicUrl = client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return { path, token: data.token, publicUrl };
  }));

  response.status(201).json({ uploads });
});

router.post('/brands/sign', ...requireAdmin, async (request, response) => {
  const input = uploadRequestSchema.parse(request.body);
  if (input.files.some((file) => !file.contentType.startsWith('image/'))) {
    return response.status(400).json({ message: 'Brand logos must be image files.' });
  }

  const client = requireSupabaseAdmin();
  const folder = safeFolder(input.projectTitle);
  const uploads = await Promise.all(input.files.map(async (file) => {
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
    const { data, error } = await client.storage.from('brand-assets').createSignedUploadUrl(path);
    if (error) throw error;
    const publicUrl = client.storage.from('brand-assets').getPublicUrl(path).data.publicUrl;
    return { path, token: data.token, publicUrl };
  }));

  return response.status(201).json({ uploads });
});

export default router;
