import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Brand } from '@shared/types';
import { brandsQueryKey } from '../hooks/useBrands';
import {
  createDatabaseBrand,
  deleteDatabaseBrand,
  fetchAdminBrands,
  updateDatabaseBrand,
  type BrandInput,
} from '../services/brands';
import { uploadBrandLogo } from '../services/storage';

interface BrandAdminModalProps {
  open: boolean;
  brands: Brand[];
  onClose: () => void;
}

const emptyForm: BrandInput = {
  name: '',
  slug: '',
  logoUrl: '',
  description: '',
  websiteUrl: '',
  displayOrder: 0,
  isVisible: true,
};

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const BrandAdminModal: React.FC<BrandAdminModalProps> = ({ open, brands, onClose }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandInput>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const { data: adminBrands } = useQuery({
    queryKey: [...brandsQueryKey, 'admin'],
    queryFn: fetchAdminBrands,
    enabled: open,
  });

  const orderedBrands = useMemo(
    () => [...(adminBrands ?? brands)].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)),
    [adminBrands, brands],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteDatabaseBrand,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Brand[]>(brandsQueryKey, (current = []) => current.filter((brand) => brand.id !== id));
      queryClient.setQueryData<Brand[]>([...brandsQueryKey, 'admin'], (current = []) => current.filter((brand) => brand.id !== id));
    },
  });

  if (!open) return null;

  const closeAndReset = () => {
    setEditing(null);
    setForm(emptyForm);
    setLogoFile(null);
    setError('');
    setSlugEdited(false);
    onClose();
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, displayOrder: orderedBrands.length });
    setLogoFile(null);
    setError('');
    setSlugEdited(false);
  };

  const startEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
      description: brand.description ?? '',
      websiteUrl: brand.websiteUrl ?? '',
      displayOrder: brand.displayOrder,
      isVisible: brand.isVisible,
    });
    setLogoFile(null);
    setError('');
    setSlugEdited(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const name = form.name.trim();
    const slug = slugify(form.slug || name);
    if (name.length < 2 || slug.length < 2) {
      setError('Brand name and URL slug must contain at least 2 characters.');
      return;
    }
    if (!logoFile && !form.logoUrl.trim()) {
      setError('Choose a logo image or enter its public URL.');
      return;
    }

    try {
      setSaving(true);
      const logoUrl = logoFile ? await uploadBrandLogo(logoFile, name) : form.logoUrl.trim();
      const input: BrandInput = {
        ...form,
        name,
        slug,
        logoUrl,
        description: form.description?.trim(),
        websiteUrl: form.websiteUrl?.trim(),
        displayOrder: Number(form.displayOrder) || 0,
      };
      const saved = editing
        ? await updateDatabaseBrand(editing.id, input)
        : await createDatabaseBrand(input);
      queryClient.setQueryData<Brand[]>(brandsQueryKey, (current = []) => {
        if (!saved.isVisible) return current.filter((brand) => brand.id !== saved.id);
        const exists = current.some((brand) => brand.id === saved.id);
        return exists
          ? current.map((brand) => brand.id === saved.id ? saved : brand)
          : [...current, saved];
      });
      queryClient.setQueryData<Brand[]>([...brandsQueryKey, 'admin'], (current = []) => {
        const exists = current.some((brand) => brand.id === saved.id);
        return exists ? current.map((brand) => brand.id === saved.id ? saved : brand) : [...current, saved];
      });
      startCreate();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this brand.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (brand: Brand) => {
    if (!window.confirm(`Delete "${brand.name}"? Its projects will remain but will no longer belong to this brand.`)) return;
    try {
      setError('');
      await deleteMutation.mutateAsync(brand.id);
      if (editing?.id === brand.id) startCreate();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this brand.');
    }
  };

  return (
    <div className="brand-admin-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeAndReset();
    }}>
      <section className="brand-admin-modal" role="dialog" aria-modal="true" aria-labelledby="brand-admin-title">
        <header className="brand-admin-header">
          <div>
            <span>Future Studio CMS</span>
            <h2 id="brand-admin-title">Brand collaborations</h2>
          </div>
          <button type="button" onClick={closeAndReset} aria-label="Close brand manager">×</button>
        </header>

        <div className="brand-admin-layout">
          <aside className="brand-admin-list">
            <button type="button" className="brand-admin-new" onClick={startCreate}>+ Add brand</button>
            {orderedBrands.map((brand) => (
              <article key={brand.id} className={editing?.id === brand.id ? 'is-active' : ''}>
                <button type="button" className="brand-admin-list-main" onClick={() => startEdit(brand)}>
                  <img src={brand.logoUrl} alt="" />
                  <span><strong>{brand.name}</strong><small>{brand.isVisible ? 'Visible' : 'Hidden'}</small></span>
                </button>
                <button type="button" className="brand-admin-delete" onClick={() => void remove(brand)} aria-label={`Delete ${brand.name}`}>×</button>
              </article>
            ))}
          </aside>

          <form className="brand-admin-form" onSubmit={(event) => void save(event)}>
            <p>{editing ? `Editing ${editing.name}` : 'Create a collaboration entry'}</p>
            <label>Brand name
              <input value={form.name} onChange={(event) => {
                const name = event.target.value;
                setForm((current) => ({ ...current, name, slug: slugEdited ? current.slug : slugify(name) }));
              }} required />
            </label>
            <label>URL slug
              <input value={form.slug} onChange={(event) => {
                setSlugEdited(true);
                setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
              }} placeholder="bitis" required />
            </label>
            <label className="brand-admin-file">Logo image
              <input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
              <span>{logoFile?.name ?? 'Choose a transparent PNG, SVG or WebP'}</span>
            </label>
            <label>Or existing logo URL
              <input type="url" value={form.logoUrl} onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))} placeholder="https://..." />
            </label>
            <label>Description
              <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label>Website
              <input type="url" value={form.websiteUrl} onChange={(event) => setForm((current) => ({ ...current, websiteUrl: event.target.value }))} placeholder="https://..." />
            </label>
            <label>Display order
              <input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} />
            </label>
            <label className="brand-admin-checkbox">
              <input type="checkbox" checked={form.isVisible} onChange={(event) => setForm((current) => ({ ...current, isVisible: event.target.checked }))} />
              Show this brand on the public website
            </label>
            {error && <div className="brand-admin-error" role="alert">{error}</div>}
            <button className="brand-admin-save" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create brand'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default BrandAdminModal;
