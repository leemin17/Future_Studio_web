import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const product = {
  id: 1001,
  date: '2026.07.22',
  title: 'API Product',
  describe: 'A valid product returned by the API tests.',
  imageUrl: 'https://example.com/cover.jpg',
  brandId: 7,
  brand: {
    id: 7,
    name: "Biti's",
    slug: 'bitis',
    logoUrl: 'https://example.com/bitis.svg',
  },
  category: 'tvc' as const,
};

const member = {
  id: 1,
  name: 'Future Member',
  role: 'Artist',
  image: 'https://example.com/member.jpg',
  color: '#ffffff',
  bio: 'Team member biography.',
  socials: {},
  skills: [],
};

const brand = {
  id: 7,
  name: "Biti's",
  slug: 'bitis',
  logoUrl: 'https://example.com/bitis.svg',
  description: 'A long-term animation collaboration.',
  websiteUrl: 'https://bitis.com.vn',
  displayOrder: 0,
  isVisible: true,
};

vi.mock('./middleware/auth.ts', () => {
  const authorize = (request: { headers: { authorization?: string }; user?: unknown }, response: { status: (code: number) => { json: (body: unknown) => unknown } }, next: () => void) => {
    if (request.headers.authorization !== 'Bearer admin') {
      return response.status(401).json({ message: 'Authentication required' });
    }
    request.user = { id: 'admin-id', email: 'admin@example.com' };
    return next();
  };
  return {
    requireAuthenticated: authorize,
    requireAdmin: [authorize],
    isAdminUser: vi.fn(async () => true),
  };
});

vi.mock('./services/productService.ts', () => ({
  getProducts: vi.fn(async () => [product]),
  getProduct: vi.fn(async (id: number) => id === product.id ? product : null),
  createProduct: vi.fn(async (input: typeof product) => ({ ...input, id: product.id })),
  updateProduct: vi.fn(async (id: number, input: typeof product) => ({ ...input, id })),
  deleteProduct: vi.fn(async () => undefined),
}));

vi.mock('./services/memberService.ts', () => ({
  getMembers: vi.fn(async () => [member]),
  createMember: vi.fn(async (input: typeof member) => ({ ...input, id: member.id })),
  updateMember: vi.fn(async (id: number, input: typeof member) => ({ ...input, id })),
  deleteMember: vi.fn(async () => undefined),
}));

vi.mock('./services/brandService.ts', () => ({
  getBrands: vi.fn(async () => [brand]),
  getBrandBySlug: vi.fn(async (slug: string) => slug === brand.slug ? brand : null),
  createBrand: vi.fn(async (input: typeof brand) => ({ ...input, id: brand.id })),
  updateBrand: vi.fn(async (id: number, input: typeof brand) => ({ ...input, id })),
  deleteBrand: vi.fn(async () => undefined),
}));

vi.mock('./services/contentService.ts', () => ({
  getSiteContent: vi.fn(async () => [{ label: 'Projects', id: 'projects' }]),
}));

vi.mock('./lib/supabase.ts', () => ({
  requireSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: vi.fn(async (path: string) => ({ data: { token: `token:${path}` }, error: null })),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.example/${path}` } }),
      }),
    },
  }),
}));

import { createApp } from './app.ts';

let server: Server;
let baseUrl: string;

const request = (path: string, init?: RequestInit) => fetch(`${baseUrl}${path}`, init);
const jsonHeaders = { 'Content-Type': 'application/json', Authorization: 'Bearer admin' };

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe('Express API', () => {
  it('reports health and serves public resources', async () => {
    expect(await (await request('/api/health')).json()).toEqual({ status: 'ok' });
    expect(await (await request('/api/products')).json()).toEqual([product]);
    expect(await (await request('/api/members')).json()).toEqual([member]);
    expect(await (await request('/api/brands')).json()).toEqual([brand]);
    expect(await (await request('/api/brands/bitis')).json()).toEqual(brand);
    expect(await (await request('/api/content/navigation')).json()).toEqual([{ label: 'Projects', id: 'projects' }]);
  });

  it('rejects anonymous mutations', async () => {
    const response = await request('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
    expect(response.status).toBe(401);
  });

  it('validates and executes product CRUD', async () => {
    const input = { ...product };
    delete (input as { id?: number }).id;
    const created = await request('/api/products', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(input) });
    expect(created.status).toBe(201);
    expect((await created.json()).title).toBe(product.title);

    const updated = await request(`/api/products/${product.id}`, { method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ ...input, title: 'Updated Product' }) });
    expect(updated.status).toBe(200);
    expect((await updated.json()).title).toBe('Updated Product');

    expect((await request(`/api/products/${product.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer admin' } })).status).toBe(204);
  });

  it('rejects invalid product data', async () => {
    const response = await request('/api/products', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ title: 'x' }) });
    expect(response.status).toBe(400);
    expect((await response.json()).message).toBe('Invalid request data');
  });

  it('executes member CRUD', async () => {
    const input = { ...member };
    delete (input as { id?: number }).id;
    expect((await request('/api/members', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(input) })).status).toBe(201);
    expect((await request('/api/members/1', { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(input) })).status).toBe(200);
    expect((await request('/api/members/1', { method: 'DELETE', headers: { Authorization: 'Bearer admin' } })).status).toBe(204);
  });

  it('executes protected brand CRUD', async () => {
    const input = { ...brand };
    delete (input as { id?: number }).id;
    expect((await request('/api/brands', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(input) })).status).toBe(201);
    expect((await request('/api/brands/7', { method: 'PUT', headers: jsonHeaders, body: JSON.stringify(input) })).status).toBe(200);
    expect((await request('/api/brands/7', { method: 'DELETE', headers: { Authorization: 'Bearer admin' } })).status).toBe(204);
    expect((await request('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })).status).toBe(401);
  });

  it('authorizes signed uploads through the backend', async () => {
    const response = await request('/api/uploads/sign', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ projectTitle: 'Demo Project', files: [{ name: 'cover.jpg', contentType: 'image/jpeg' }] }),
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.uploads[0].token).toContain('token:demo-project/');
    expect(body.uploads[0].publicUrl).toContain('https://storage.example/demo-project/');

    const brandUpload = await request('/api/uploads/brands/sign', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ projectTitle: 'Biti’s', files: [{ name: 'logo.svg', contentType: 'image/svg+xml' }] }),
    });
    expect(brandUpload.status).toBe(201);
    expect((await brandUpload.json()).uploads[0].token).toContain('token:biti-s/');
  });
});
