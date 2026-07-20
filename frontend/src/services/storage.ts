import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';

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
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase upload configuration is missing.');

  const { data: sessionData } = await client.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your admin session has expired. Sign in again before uploading.');

  const projectReference = new URL(supabaseUrl).hostname.split('.')[0];
  const paths = files.map((file) => `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`);
  const uppy = new Uppy({
    autoProceed: false,
    restrictions: { maxNumberOfFiles: files.length },
  }).use(Tus, {
    endpoint: `https://${projectReference}.storage.supabase.co/storage/v1/upload/resumable`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
    },
    chunkSize: 6 * 1024 * 1024,
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    allowedMetaFields: ['bucketName', 'objectName', 'contentType', 'cacheControl'],
  });

  try {
    files.forEach((file, index) => {
      uppy.addFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: file,
        meta: {
          bucketName: PRODUCT_MEDIA_BUCKET,
          objectName: paths[index],
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
        },
      });
    });

    const result = await uppy.upload();
    if (!result || result.failed.length) {
      throw new Error(result?.failed[0]?.error?.message || 'One or more files could not be uploaded.');
    }

    return paths.map((path) => client.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
  } finally {
    uppy.destroy();
  }
};

export const uploadTeamMemberImage = async (file: File, memberName: string): Promise<string> => {
  const client = requireSupabase();
  const folder = safeFolderName(memberName || 'team-member');
  const path = `team-members/${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await client.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) throw new Error(error.message || `Unable to upload ${file.name}.`);
  return client.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
};
