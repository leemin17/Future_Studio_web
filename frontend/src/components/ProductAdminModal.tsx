import React, { useEffect, useState } from 'react';
import type { NewsItem, ProductCategory } from '@shared/types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { createDatabaseProduct, updateDatabaseProduct } from '../services/products';
import { uploadProductFiles } from '../services/storage';
import ProjectBlockEditor, { type ProjectEditorBlock } from './ProjectBlockEditor';

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
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const emptyBlock = (type: ProjectEditorBlock['type'], index: number): ProjectEditorBlock => ({
  id: `existing-${type}-${index}-${Date.now()}`,
  type,
  files: [],
  url: '',
  content: '',
  caption: '',
  columns: 1,
});

const blocksFromProduct = (product: NewsItem): ProjectEditorBlock[] =>
  (product.quickViewLayout ?? []).flatMap((layout, layoutIndex) => {
    if (layout.type === 'text') {
      const block = emptyBlock('text', layoutIndex);
      block.content = layout.items.map((item) => item.content ?? '').filter(Boolean).join('\n');
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

const ProductAdminModal: React.FC<ProductAdminModalProps> = ({ open, product, onClose, onSaved }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [clientInformation, setClientInformation] = useState('');
  const [category, setCategory] = useState<ProductCategory>('tvc');
  const [date, setDate] = useState('');
  const [describe, setDescribe] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null);
  const [projectBlocks, setProjectBlocks] = useState<ProjectEditorBlock[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(product?.title ?? '');
    setClientInformation(product?.clientInformation ?? '');
    setCategory(product?.category ?? 'tvc');
    setDate(product?.date.replaceAll('.', '-') ?? '');
    setDescribe(product?.describe ?? '');
    setImageUrl(product?.imageUrl ?? '');
    setThumbnailFile(null);
    setPartnerLogoUrl(product?.partnerLogoUrl ?? '');
    setPartnerLogoFile(null);
    setProjectBlocks(product ? blocksFromProduct(product) : []);
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    setErrorMessage('');

    if (!supabase) {
      setCheckingSession(false);
      return () => {
        document.body.style.overflow = '';
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setCheckingSession(false);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setAuthenticated(true);
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const confirmed = window.confirm(
      product
        ? `Save all changes to "${title.trim() || product.title}"? The current product data will be replaced.`
        : `Create "${title.trim() || 'this project'}" and publish it to the product pages?`,
    );
    if (!confirmed) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      if (!thumbnailFile && !imageUrl.trim()) {
        throw new Error('Choose a thumbnail file or enter a thumbnail URL.');
      }

      const [uploadedThumbnail, uploadedPartnerLogo, resolvedBlocks] = await Promise.all([
        thumbnailFile ? uploadProductFiles([thumbnailFile], title) : Promise.resolve([]),
        partnerLogoFile ? uploadProductFiles([partnerLogoFile], `${title}-partner-logo`) : Promise.resolve([]),
        Promise.all(projectBlocks.map(async (block) => ({
          ...block,
          uploadedUrls: block.files.length ? await uploadProductFiles(block.files, title) : [],
        }))),
      ]);
      const rawThumbnailUrl = imageUrl.trim();
      const thumbnailYouTubeUrl = getYouTubeThumbnail(rawThumbnailUrl);
      const thumbnailUrl = uploadedThumbnail[0] ?? thumbnailYouTubeUrl || rawThumbnailUrl;
      const finalPartnerLogoUrl = uploadedPartnerLogo[0] ?? partnerLogoUrl.trim();
      const quickViewLayout: NonNullable<NewsItem['quickViewLayout']> = resolvedBlocks.flatMap((block): NonNullable<NewsItem['quickViewLayout']> => {
        if (block.type === 'text') {
          return block.content.trim() ? [{ type: 'text' as const, items: [{ kind: 'text' as const, content: block.content.trim() }] }] : [];
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
        date: date.replaceAll('-', '.'),
        title: title.trim(),
        clientInformation: clientInformation.trim(),
        describe: describe.trim(),
        imageUrl: thumbnailUrl,
        partnerLogoUrl: finalPartnerLogoUrl || undefined,
        category,
        videoUrl: videos[0] ?? (thumbnailYouTubeUrl ? rawThumbnailUrl : undefined),
        modelUrl: quickViewLayout.flatMap((block) => block.items).find((item) => item.kind === 'model')?.url,
        imageGallery: images,
        videoGallery: videos,
        quickViewLayout,
      };
      const savedProduct = product
        ? await updateDatabaseProduct(product.id, productInput)
        : await createDatabaseProduct(productInput);
      onSaved(savedProduct);
      onClose();
      setTitle('');
      setClientInformation('');
      setDate('');
      setDescribe('');
      setImageUrl('');
      setThumbnailFile(null);
      setPartnerLogoUrl('');
      setPartnerLogoFile(null);
      setProjectBlocks([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save this product.');
    } finally {
      setSubmitting(false);
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
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {errorMessage && <p className="product-admin-error">{errorMessage}</p>}
            <button className="product-admin-submit" type="submit" disabled={submitting}>Sign in</button>
          </form>
        ) : (
          <form className="product-admin-form product-admin-workspace-form" onSubmit={handleSave}>
            <main className="product-admin-workspace-canvas">
              <ProjectBlockEditor blocks={projectBlocks} onChange={setProjectBlocks} title={title} clientInformation={clientInformation} partnerLogoFile={partnerLogoFile} partnerLogoUrl={partnerLogoUrl} />
            </main>

            <aside className="product-admin-workspace-sidebar">
              <section>
                <div className="product-admin-sidebar-title"><span>{product ? 'Edit project' : 'Project details'}</span><small>{product ? `ID ${product.id}` : 'Required information'}</small></div>
                <label>Project title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
                <label>Client<input value={clientInformation} onChange={(event) => setClientInformation(event.target.value)} required /></label>
                <label>Category<select id="product-category" value={category} onChange={(event) => setCategory(event.target.value as ProductCategory)}><option value="tvc">TVC</option><option value="cartoon-3d">Cartoon 3D</option><option value="art">Art</option><option value="showreel">Showreel</option></select></label>
                <label>Project date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
                <label>Description<textarea id="product-description" rows={4} value={describe} onChange={(event) => setDescribe(event.target.value)} required /></label>
              </section>

              <section>
                <div className="product-admin-sidebar-title"><span>Cover image</span><small>Shown on product pages</small></div>
                <label className="product-admin-file-field">Thumbnail from computer<input id="product-thumbnail-file" type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} /><span>{thumbnailFile ? thumbnailFile.name : 'Choose one image'}</span></label>
                <label>Or thumbnail / YouTube URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." /></label>
              </section>

              <section>
                <div className="product-admin-sidebar-title"><span>Partner logo</span><small>Shown in Quick View</small></div>
                <label className="product-admin-file-field">Logo from computer<input type="file" accept="image/*" onChange={(event) => setPartnerLogoFile(event.target.files?.[0] ?? null)} /><span>{partnerLogoFile ? partnerLogoFile.name : 'Choose partner logo'}</span></label>
                <label>Or logo URL<input type="url" value={partnerLogoUrl} onChange={(event) => setPartnerLogoUrl(event.target.value)} placeholder="https://..." /></label>
              </section>

              <div className="product-admin-sidebar-actions">
                {errorMessage && <p className="product-admin-error">{errorMessage}</p>}
                <p className="product-admin-confirm-note">
                  <strong>Final confirmation</strong>
                  <span>{product ? 'Saving will replace the current product information and Quick View layout.' : 'Completing will publish this project to the selected product category.'}</span>
                </p>
                <button className="product-admin-submit" type="submit" disabled={submitting}>{submitting ? 'Uploading and saving...' : product ? 'Save changes' : 'Complete project'}</button>
              </div>
            </aside>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductAdminModal;
