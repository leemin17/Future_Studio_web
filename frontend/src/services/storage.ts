import { supabase } from '../lib/supabase';

const PRODUCT_MEDIA_BUCKET = 'product-media';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const safeFileName = (name: string) => {
  const extensionIndex = name.lastIndexOf('.');
  const extension = extensionIndex >= 0 ? name.slice(extensionIndex).toLowerCase() : '';
  const baseName = (extensionIndex >= 0 ? name.slice(0, extensionIndex) : name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'media';
  return `${baseName}${extension}`;
};

const safeFolderName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';

export const uploadProductFiles = async (files: File[], projectTitle: string): Promise<string[]> => {
  if (!files.length) return [];
  const client = requireSupabase();
  const folder = safeFolderName(projectTitle);

  return Promise.all(files.map(async (file) => {
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await client.storage
      .from(PRODUCT_MEDIA_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) throw new Error(error.message || `Unable to upload ${file.name}.`);
    return client.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  }));
};
