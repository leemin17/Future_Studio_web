import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import { supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';

const PRODUCT_MEDIA_BUCKET = 'product-media';
const DIRECT_UPLOAD_TIMEOUT = 45_000;

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

const withUploadTimeout = async <T,>(operation: PromiseLike<T>, fileName: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Upload timed out for ${fileName}. Check the connection and try again.`)),
          DIRECT_UPLOAD_TIMEOUT,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const uploadProductFiles = async (
  files: File[],
  projectTitle: string,
  onProgress?: (progress: number) => void,
): Promise<string[]> => {
  if (!files.length) return [];
  const client = requireSupabase();
  const folder = safeFolderName(projectTitle);
  const paths = files.map((file) => `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`);
  const uploadedUrls = new Array<string>(files.length);
  const directUploadLimit = 6 * 1024 * 1024;
  const totalBytes = files.reduce((sum, file) => sum + Math.max(file.size, 1), 0);
  let completedBytes = 0;
  const directEntries = files.map((file, index) => ({ file, index })).filter(({ file }) => file.size <= directUploadLimit);
  const resumableEntries = files.map((file, index) => ({ file, index })).filter(({ file }) => file.size > directUploadLimit);

  for (const { file, index } of directEntries) {
    const { error } = await withUploadTimeout(
      client.storage.from(PRODUCT_MEDIA_BUCKET).upload(paths[index], file, {
        cacheControl: '3600',
        contentType: file.type || undefined,
        upsert: false,
      }),
      file.name,
    );
    if (error) throw new Error(error.message || `Unable to upload ${file.name}.`);
    uploadedUrls[index] = client.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(paths[index]).data.publicUrl;
    completedBytes += Math.max(file.size, 1);
    onProgress?.(Math.round((completedBytes / totalBytes) * 100));
  }

  if (!resumableEntries.length) {
    onProgress?.(100);
    return uploadedUrls;
  }

  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase upload configuration is missing.');
  const { data: sessionData } = await client.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Your admin session has expired. Sign in again before uploading.');

  const projectReference = new URL(supabaseUrl).hostname.split('.')[0];
  const resumableBytes = resumableEntries.reduce((sum, { file }) => sum + Math.max(file.size, 1), 0);
  const uppy = new Uppy({
    autoProceed: false,
    restrictions: { maxNumberOfFiles: resumableEntries.length },
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
    resumableEntries.forEach(({ file, index }) => {
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

    let inactivityTimer: ReturnType<typeof setTimeout> | undefined;
    let rejectInactivity: ((reason: Error) => void) | undefined;
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        rejectInactivity?.(new Error('Upload stopped responding for 90 seconds. Check the connection and try again.'));
      }, 90_000);
    };
    const inactivityPromise = new Promise<never>((_resolve, reject) => {
      rejectInactivity = reject;
      resetInactivityTimer();
    });
    uppy.on('progress', (progress) => {
      const uploadedLargeBytes = resumableBytes * (progress / 100);
      onProgress?.(Math.min(99, Math.round(((completedBytes + uploadedLargeBytes) / totalBytes) * 100)));
      resetInactivityTimer();
    });

    const result = await Promise.race([uppy.upload(), inactivityPromise]);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (!result || (result.failed?.length ?? 0) > 0) {
      throw new Error(String(result?.failed?.[0]?.error || 'One or more files could not be uploaded.'));
    }

    onProgress?.(100);
    resumableEntries.forEach(({ index }) => {
      uploadedUrls[index] = client.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(paths[index]).data.publicUrl;
    });
    return uploadedUrls;
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
