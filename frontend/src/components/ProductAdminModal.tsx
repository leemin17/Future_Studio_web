import React, { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { NewsItem } from '@shared/types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { createDatabaseProduct, updateDatabaseProduct } from '../services/products';
import { uploadProductFiles } from '../services/storage';
import ProjectBlockEditor, { type ProjectEditorBlock } from './ProjectBlockEditor';
import ConfirmDialog from './ConfirmDialog';
import { productFormSchema, type ProductFormValues } from '../validation/productSchema';
import { Eye, EyeOff } from 'lucide-react';
import { fetchAdminProfile } from '../services/auth';

interface ProductAdminModalProps {
  open: boolean;
  product?: NewsItem | null;
  onClose: () => void;
  onSaved: (product: NewsItem) => void;
}

const splitUrls = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);

const getYouTubeId = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)?.[1] ?? '';

const getYouTubeThumbnail = (url: string) => {
  const videoId = getYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
};

const getVimeoId = (url: string) =>
  url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/i)?.[1] ?? '';

const getRemoteVideoThumbnail = (url: string) => {
  const youtubeThumbnail = getYouTubeThumbnail(url);
  if (youtubeThumbnail) return youtubeThumbnail;
  const vimeoId = getVimeoId(url);
  return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : '';
};

const createVideoThumbnail = (file: File): Promise<File> => new Promise((resolve, reject) => {
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);
  const timeout = window.setTimeout(() => finish(new Error('The video took too long to prepare a thumbnail.')), 15_000);
  let settled = false;

  const cleanup = () => {
    window.clearTimeout(timeout);
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  };
  const finish = (error?: Error, thumbnail?: File) => {
    if (settled) return;
    settled = true;
    cleanup();
    if (error) reject(error);
    else if (thumbnail) resolve(thumbnail);
  };

  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.onerror = () => finish(new Error('The selected video could not be used to create a thumbnail.'));
  video.onloadeddata = () => {
    try {
      const maxDimension = 1600;
      const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('The browser could not prepare the video thumbnail.');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        canvas.width = 1;
        canvas.height = 1;
        if (!blob) {
          finish(new Error('The video thumbnail could not be created.'));
          return;
        }
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'video';
        finish(undefined, new File([blob], `${baseName}-thumbnail.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        }));
      }, 'image/jpeg', 0.88);
    } catch (error) {
      finish(error instanceof Error ? error : new Error('The video thumbnail could not be created.'));
    }
  };
  video.src = objectUrl;
  video.load();
});

const withSaveTimeout = async <T,>(operation: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const prepareThumbnailImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) throw new Error('Thumbnail must be an image file.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Thumbnail is larger than 25 MB. Choose a smaller image.');
  if (file.type === 'image/svg+xml') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const maxDimension = 1920;
    const largestDimension = Math.max(bitmap.width, bitmap.height);
    if (largestDimension <= maxDimension && file.size <= 4 * 1024 * 1024) return file;

    const scale = Math.min(1, maxDimension / largestDimension);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('The browser could not prepare this thumbnail.');
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    canvas.width = 1;
    canvas.height = 1;
    if (!blob) throw new Error('The browser could not optimize this thumbnail.');
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'thumbnail';
    return new File([blob], `${baseName}-optimized.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (error) {
    throw error instanceof Error ? error : new Error('The selected thumbnail could not be read.');
  } finally {
    bitmap?.close();
  }
};

const emptyBlock = (type: ProjectEditorBlock['type'], index: number): ProjectEditorBlock => ({
  id: `existing-${type}-${index}-${Date.now()}`,
  type,
  files: [],
  url: '',
  content: '',
  html: '',
  caption: '',
  columns: 1,
  textStyle: {},
});

const blocksFromProduct = (product: NewsItem): ProjectEditorBlock[] =>
  (product.quickViewLayout ?? []).flatMap((layout, layoutIndex) => {
    if (layout.type === 'text') {
      const block = emptyBlock('text', layoutIndex);
      block.content = layout.items.map((item) => item.content ?? '').filter(Boolean).join('\n');
      block.html = layout.items.find((item) => item.html)?.html ?? '';
      block.textStyle = layout.items.find((item) => item.textStyle)?.textStyle ?? {};
      return block.content ? [block] : [];
    }
    if (layout.type === 'grid') {
      const block = emptyBlock('grid', layoutIndex);
      block.url = layout.items.map((item) => item.url ?? '').filter(Boolean).join('\n');
      block.caption = layout.items.find((item) => item.caption)?.caption ?? '';
      block.columns = layout.columns ?? 2;
      return block.url ? [block] : [];
    }
    return layout.items.flatMap((item, itemIndex) => {
      if (!item.url) return [];
      const type = item.kind === 'image' || item.kind === 'video' || item.kind === 'embed' || item.kind === 'model'
        ? item.kind
        : layout.type === 'embed' || layout.type === 'model' ? layout.type : 'image';
      const block = emptyBlock(type, layoutIndex * 100 + itemIndex);
      block.url = item.url;
      block.caption = item.caption ?? '';
      return [block];
    });
  });

const emptyProductForm: ProductFormValues = {
  title: '',
  clientInformation: '',
  category: 'tvc',
  date: '',
  describe: '',
  imageUrl: '',
  partnerLogoUrl: '',
};

const ProductAdminModal: React.FC<ProductAdminModalProps> = ({ open, product, onClose, onSaved }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [processingThumbnail, setProcessingThumbnail] = useState(false);
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null);
  const [projectBlocks, setProjectBlocks] = useState<ProjectEditorBlock[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveStage, setSaveStage] = useState<'idle' | 'preparing' | 'uploading' | 'saving'>('idle');
  const [saveProgress, setSaveProgress] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProductFormValues | null>(null);
  const saveInFlightRef = useRef(false);
  const {
    register,
    reset,
    watch,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductForm,
  });
  const formValues = watch();
  const { title, clientInformation, imageUrl, partnerLogoUrl } = formValues;

  useEffect(() => {
    if (!open) return;
    reset({
      title: product?.title ?? '',
      clientInformation: product?.clientInformation ?? '',
      category: product?.category ?? 'tvc',
      date: product?.date.replaceAll('.', '-') ?? '',
      describe: product?.describe ?? '',
      imageUrl: product?.imageUrl ?? '',
      partnerLogoUrl: product?.partnerLogoUrl ?? '',
    });
    setThumbnailFile(null);
    setPartnerLogoFile(null);
    setProjectBlocks(product ? blocksFromProduct(product) : []);
  }, [open, product, reset]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    setErrorMessage('');
    setSaveStage('idle');
    setSaveProgress(0);

    if (!supabase) {
      setCheckingSession(false);
      return () => {
        document.body.style.overflow = '';
      };
    }

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setAuthenticated(false);
        setCheckingSession(false);
        return;
      }
      try {
        const profile = await fetchAdminProfile(data.session.access_token);
        setAuthenticated(profile.isAdmin);
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    });

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setErrorMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      setErrorMessage(error.message);
      return;
    }
    try {
      const profile = await fetchAdminProfile(data.session?.access_token);
      if (!profile.isAdmin) {
        await supabase.auth.signOut();
        setErrorMessage('This account does not have administrator permission.');
        return;
      }
      setAuthenticated(true);
    } catch (profileError) {
      setErrorMessage(profileError instanceof Error ? profileError.message : 'Unable to verify administrator permission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase || submitting) return;
    setSubmitting(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signOut();
    setSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setAuthenticated(false);
    setPassword('');
  };

  const requestSave = (values: ProductFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleThumbnailSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file || processingThumbnail) return;

    setProcessingThumbnail(true);
    setErrorMessage('');
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const preparedFile = await prepareThumbnailImage(file);
      React.startTransition(() => setThumbnailFile(preparedFile));
    } catch (error) {
      setThumbnailFile(null);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to prepare this thumbnail.');
    } finally {
      setProcessingThumbnail(false);
    }
  };

  const handleSave = async (values: ProductFormValues) => {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    setConfirmOpen(false);
    setSubmitting(true);
    setErrorMessage('');
    setSaveStage('preparing');
    setSaveProgress(0);
    try {
      const firstVideoBlock = projectBlocks.find((block) => block.type === 'video');
      const firstLocalVideo = firstVideoBlock?.files.find((file) => file.type.startsWith('video/'));
      const firstVideoLink = firstVideoBlock ? splitUrls(firstVideoBlock.url)[0] ?? '' : '';
      const automaticRemoteThumbnail = getRemoteVideoThumbnail(firstVideoLink);
      const generatedVideoThumbnail = !thumbnailFile && !imageUrl.trim() && firstLocalVideo
        ? await createVideoThumbnail(firstLocalVideo)
        : null;
      const effectiveThumbnailFile = thumbnailFile ?? generatedVideoThumbnail;

      if (!effectiveThumbnailFile && !imageUrl.trim() && !automaticRemoteThumbnail) {
        throw new Error('Add a thumbnail or include a YouTube, Vimeo, or uploaded video so a thumbnail can be created automatically.');
      }

      const filesToUpload = [
        ...(effectiveThumbnailFile ? [effectiveThumbnailFile] : []),
        ...(partnerLogoFile ? [partnerLogoFile] : []),
        ...projectBlocks.flatMap((block) => block.files),
      ];
      setSaveStage(filesToUpload.length ? 'uploading' : 'saving');
      const uploadedUrls = filesToUpload.length
        ? await uploadProductFiles(filesToUpload, values.title, setSaveProgress)
        : [];
      let uploadedIndex = 0;
      const uploadedThumbnail = effectiveThumbnailFile ? uploadedUrls[uploadedIndex++] : undefined;
      const uploadedPartnerLogo = partnerLogoFile ? uploadedUrls[uploadedIndex++] : undefined;
      const resolvedBlocks = projectBlocks.map((block) => {
        const blockUrls = uploadedUrls.slice(uploadedIndex, uploadedIndex + block.files.length);
        uploadedIndex += block.files.length;
        return { ...block, uploadedUrls: blockUrls };
      });
      const rawThumbnailUrl = values.imageUrl.trim();
      const thumbnailFromVideoUrl = getRemoteVideoThumbnail(rawThumbnailUrl);
      const thumbnailUrl = uploadedThumbnail ?? (thumbnailFromVideoUrl || rawThumbnailUrl || automaticRemoteThumbnail);
      const finalPartnerLogoUrl = uploadedPartnerLogo ?? values.partnerLogoUrl.trim();
      const quickViewLayout: NonNullable<NewsItem['quickViewLayout']> = resolvedBlocks.flatMap((block): NonNullable<NewsItem['quickViewLayout']> => {
        if (block.type === 'text') {
          return block.content.trim() ? [{ type: 'text' as const, items: [{ kind: 'text' as const, content: block.content.trim(), html: block.html, textStyle: block.textStyle }] }] : [];
        }
        const urls = [...block.uploadedUrls, ...splitUrls(block.url)];
        if (!urls.length) return [];
        if (block.type === 'grid') {
          return [{ type: 'grid' as const, columns: block.columns, items: urls.map((url) => ({ kind: 'image' as const, url, caption: block.caption.trim() || undefined })) }];
        }
        const kind = block.type === 'image' ? 'image' : block.type === 'video' ? 'video' : block.type;
        return urls.map((url) => ({ type: kind === 'image' || kind === 'video' ? 'full' as const : kind, items: [{ kind, url, caption: block.caption.trim() || undefined }] }));
      });
      const images = quickViewLayout.flatMap((block) => block.items.filter((item) => item.kind === 'image').map((item) => item.url).filter((url): url is string => Boolean(url)));
      const videos = quickViewLayout.flatMap((block) => block.items.filter((item) => item.kind === 'video').map((item) => item.url).filter((url): url is string => Boolean(url)));

      const productInput = {
        date: values.date.replaceAll('-', '.'),
        title: values.title.trim(),
        clientInformation: values.clientInformation.trim(),
        describe: values.describe.trim(),
        imageUrl: thumbnailUrl,
        partnerLogoUrl: finalPartnerLogoUrl || undefined,
        category: values.category,
        videoUrl: videos[0] ?? (thumbnailFromVideoUrl ? rawThumbnailUrl : undefined),
        modelUrl: quickViewLayout.flatMap((block) => block.items).find((item) => item.kind === 'model')?.url,
        imageGallery: images,
        videoGallery: videos,
        quickViewLayout,
      };
      setSaveStage('saving');
      const saveOperation = product
        ? updateDatabaseProduct(product.id, productInput)
        : createDatabaseProduct(productInput);
      const savedProduct = await withSaveTimeout(
        saveOperation,
        30_000,
        'The backend API did not respond while saving the project. Check the connection and try again.',
      );
      onSaved(savedProduct);
      onClose();
      reset(emptyProductForm);
      setThumbnailFile(null);
      setPartnerLogoFile(null);
      setProjectBlocks([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save this product.');
    } finally {
      saveInFlightRef.current = false;
      setPendingValues(null);
      setSubmitting(false);
      setSaveStage('idle');
      setSaveProgress(0);
    }
  };

  return (
    <div className="product-admin-backdrop" onClick={onClose}>
      <section className={`product-admin-modal ${authenticated ? 'product-admin-modal--workspace' : 'product-admin-modal--login'}`} onClick={(event) => event.stopPropagation()}>
        {authenticated ? (
          <div className="product-admin-session-actions">
            <button className="product-admin-logout-button" type="button" onClick={() => void handleLogout()} disabled={submitting}>Log out</button>
            <button className="product-admin-close-button" type="button" onClick={onClose} aria-label="Close editor">×</button>
          </div>
        ) : (
          <header className="product-admin-header">
            <div>
              <span>Future Studio CMS</span>
              <h2>Admin sign in</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close form">×</button>
          </header>
        )}

        {!isSupabaseConfigured ? (
          <div className="product-admin-setup">
            <strong>Supabase has not been connected.</strong>
            <p>Add the two VITE_SUPABASE variables to frontend/.env, then restart the project.</p>
          </div>
        ) : checkingSession ? (
          <div className="product-admin-setup">Checking admin session...</div>
        ) : !authenticated ? (
          <form className="product-admin-form product-admin-login" onSubmit={handleLogin}>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>
              Password
              <span className="product-admin-password-field">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {errorMessage && <p className="product-admin-error">{errorMessage}</p>}
            <button className="product-admin-submit" type="submit" disabled={submitting}>Sign in</button>
          </form>
        ) : (
          <>
          <form className="product-admin-form product-admin-workspace-form" onSubmit={submitForm(requestSave)}>
            <main className="product-admin-workspace-canvas">
              <ProjectBlockEditor blocks={projectBlocks} onChange={setProjectBlocks} title={title} clientInformation={clientInformation} partnerLogoFile={partnerLogoFile} partnerLogoUrl={partnerLogoUrl} onUseFrameAsCover={setThumbnailFile} />
            </main>

            <aside className="product-admin-workspace-sidebar">
              <section>
                <div className="product-admin-sidebar-title"><span>{product ? 'Edit project' : 'Project details'}</span><small>{product ? `ID ${product.id}` : 'Required information'}</small></div>
                <label>Project title<input {...register('title')} />{errors.title && <small className="product-admin-field-error">{errors.title.message}</small>}</label>
                <label>Client<input {...register('clientInformation')} />{errors.clientInformation && <small className="product-admin-field-error">{errors.clientInformation.message}</small>}</label>
                <label>Category<select id="product-category" {...register('category')}><option value="tvc">TVC</option><option value="cartoon-3d">Cartoon 3D</option><option value="art">Art</option><option value="showreel">Showreel</option></select></label>
                <label>Project date<input type="date" {...register('date')} />{errors.date && <small className="product-admin-field-error">{errors.date.message}</small>}</label>
                <label>Description<textarea id="product-description" rows={4} {...register('describe')} />{errors.describe && <small className="product-admin-field-error">{errors.describe.message}</small>}</label>
              </section>

              <section>
                <div className="product-admin-sidebar-title"><span>Cover image</span><small>Shown on product pages</small></div>
                <label className={`product-admin-file-field ${processingThumbnail ? 'product-admin-file-field--processing' : ''}`}>
                  Thumbnail from computer
                  <input id="product-thumbnail-file" type="file" accept="image/*" disabled={processingThumbnail} onChange={(event) => void handleThumbnailSelection(event)} />
                  <span>{processingThumbnail ? 'Optimizing thumbnail...' : thumbnailFile ? `${thumbnailFile.name} · ${Math.max(1, Math.round(thumbnailFile.size / 1024))} KB` : 'Choose one image'}</span>
                </label>
                <label>Or thumbnail / YouTube URL<input type="url" {...register('imageUrl')} placeholder="https://youtube.com/watch?v=..." />{errors.imageUrl && <small className="product-admin-field-error">{errors.imageUrl.message}</small>}</label>
              </section>

              <section>
                <div className="product-admin-sidebar-title"><span>Partner logo</span><small>Shown in Quick View</small></div>
                <label className="product-admin-file-field">Logo from computer<input type="file" accept="image/*" onChange={(event) => setPartnerLogoFile(event.target.files?.[0] ?? null)} /><span>{partnerLogoFile ? partnerLogoFile.name : 'Choose partner logo'}</span></label>
                <label>Or logo URL<input type="url" {...register('partnerLogoUrl')} placeholder="https://..." />{errors.partnerLogoUrl && <small className="product-admin-field-error">{errors.partnerLogoUrl.message}</small>}</label>
              </section>

              <div className="product-admin-sidebar-actions">
                {errorMessage && <p className="product-admin-error">{errorMessage}</p>}
                {submitting && (
                  <div className="product-admin-save-progress" role="status" aria-live="polite">
                    <span>{saveStage === 'uploading' ? `Uploading media ${saveProgress}%` : saveStage === 'saving' ? 'Saving product data...' : 'Preparing files...'}</span>
                    <div><i style={{ width: `${saveStage === 'uploading' ? saveProgress : saveStage === 'saving' ? 100 : 8}%` }} /></div>
                  </div>
                )}
                <p className="product-admin-confirm-note">
                  <strong>Final confirmation</strong>
                  <span>{product ? 'Saving will replace the current product information and Quick View layout.' : 'Completing will publish this project to the selected product category.'}</span>
                </p>
                <button className="product-admin-submit" type="submit" disabled={submitting}>{submitting ? saveStage === 'uploading' ? `Uploading ${saveProgress}%` : 'Saving...' : product ? 'Save changes' : 'Complete project'}</button>
              </div>
            </aside>

          </form>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={product ? 'Save project changes?' : 'Publish this project?'}
            description={product ? `The current information for "${title || product.title}" will be replaced.` : `"${title || 'This project'}" will appear in the selected product category.`}
            confirmLabel={product ? 'Save changes' : 'Publish project'}
            busy={submitting}
            onConfirm={() => { if (pendingValues) void handleSave(pendingValues); }}
          />
          </>
        )}
      </section>
    </div>
  );
};

export default ProductAdminModal;
