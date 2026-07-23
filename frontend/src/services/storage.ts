import { supabase } from '../lib/supabase';
import { apiRequest } from './apiClient';

const bucket = 'product-media';

interface SignedUpload {
  path: string;
  token: string;
  publicUrl: string;
}

const signUploads = (files: File[], projectTitle: string) =>
  apiRequest<{ uploads: SignedUpload[] }>('/uploads/sign', {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({
      projectTitle,
      files: files.map((file) => ({ name: file.name, contentType: file.type || 'application/octet-stream' })),
    }),
  });

const uploadSignedFiles = async (
  files: File[],
  projectTitle: string,
  signingPath: string,
  bucketName: string,
  onProgress?: (progress: number) => void,
) => {
  if (!files.length) return [];
  if (!supabase) throw new Error('Supabase storage is not configured.');
  const { uploads } = await apiRequest<{ uploads: SignedUpload[] }>(signingPath, {
    method: 'POST',
    authenticated: true,
    body: JSON.stringify({
      projectTitle,
      files: files.map((file) => ({ name: file.name, contentType: file.type || 'application/octet-stream' })),
    }),
  });

  const urls: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const signed = uploads[index];
    if (!signed) throw new Error('Backend returned an incomplete upload authorization.');
    const { error } = await supabase.storage.from(bucketName).uploadToSignedUrl(signed.path, signed.token, files[index], {
      contentType: files[index].type || undefined,
      cacheControl: '3600',
    });
    if (error) throw new Error(error.message || `Unable to upload ${files[index].name}.`);
    urls.push(signed.publicUrl);
    onProgress?.(Math.round(((index + 1) / files.length) * 100));
  }
  return urls;
};

export const uploadProductFiles = async (
  files: File[],
  projectTitle: string,
  onProgress?: (progress: number) => void,
): Promise<string[]> => {
  if (!files.length) return [];
  if (!supabase) throw new Error('Supabase storage is not configured.');

  const { uploads } = await signUploads(files, projectTitle);
  const urls: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const signed = uploads[index];
    if (!signed) throw new Error('Backend returned an incomplete upload authorization.');
    const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(signed.path, signed.token, files[index], {
      contentType: files[index].type || undefined,
      cacheControl: '3600',
    });
    if (error) throw new Error(error.message || `Unable to upload ${files[index].name}.`);
    urls.push(signed.publicUrl);
    onProgress?.(Math.round(((index + 1) / files.length) * 100));
  }
  return urls;
};

export const uploadTeamMemberImage = async (file: File, memberName: string): Promise<string> => {
  const [url] = await uploadProductFiles([file], `team-members-${memberName}`);
  return url;
};

export const uploadBrandLogo = async (file: File, brandName: string): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Brand logo must be an image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Brand logo must be smaller than 10 MB.');
  const [url] = await uploadSignedFiles([file], brandName, '/uploads/brands/sign', 'brand-assets');
  return url;
};
