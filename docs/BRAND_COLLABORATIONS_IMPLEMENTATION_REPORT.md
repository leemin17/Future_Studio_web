# Brand Collaborations — Implementation Report

Date: 2026-07-23

## Outcome

Future Studio now has a database-backed brand collaboration feature:

- A responsive editorial logo section appears after the portfolio grid on the
  main All Products page.
- Selecting a brand opens `/brands/:slug`.
- Each brand page shows only projects linked through `products.brand_id`.
- Selecting a project opens the existing Quick View and closing it returns to the same brand page.
- Administrators can create, edit, hide, order, and delete brands from the home section.
- Project creation/editing now includes a collaboration-brand selector.

The public section remains hidden while there are no visible brand records.

## Backend and data

- Added shared `Brand` type and `NewsItem.brandId`.
- Added public brand list/detail routes:
  - `GET /api/brands`
  - `GET /api/brands/:slug`
- Added authenticated administrator routes:
  - `GET /api/brands/admin/all`
  - `POST /api/brands`
  - `PUT /api/brands/:id`
  - `DELETE /api/brands/:id`
- Product mapping now reads and writes `brand_id`.
- Added Zod validation for brand inputs, slugs, and product brand IDs.
- Added the idempotent migration `20260723_create_brands.sql`.

## Logo storage

- Created the public Supabase bucket `brand-assets`.
- The bucket is restricted to image MIME types and a 10 MB maximum file size.
- Upload authorization is issued only by authenticated Express route
  `POST /api/uploads/brands/sign`.
- The browser receives a short-lived signed upload token; it never receives the
  service-role key.
- Deleting a brand also removes its managed logo object when applicable.

## Frontend and CMS

- Added a React Query brand service and cache.
- Added `PartnersSection` on the Team page, immediately before the team-member showcase.
- Added `BrandCollectionPage` and route `/brands/:brandSlug`.
- Added `BrandAdminModal`, including:
  - logo upload or existing URL;
  - editable name and slug;
  - description and website;
  - display order;
  - public visibility;
  - delete with confirmation.
- Hidden brands remain available in the authenticated CMS but are removed from
  the public query cache immediately.
- When a product is linked to a brand and no project-specific logo is supplied,
  the product uses the brand logo.

## SEO and deployment

- Brand URLs are added to the generated sitemap when visible records exist.
- Brand pages receive prerendered metadata and project markup during production
  builds when Vercel Supabase variables are available.
- Added a Vercel rewrite for `/brands/:brandSlug`.

## Security verification

- Confirmed the live `brands` columns and `products.brand_id` relationship.
- Confirmed an anonymous insert is rejected by PostgreSQL RLS with code `42501`.
- Confirmed no `.env` files or secret values are part of the implementation diff.
- Public clients can read public logos, but database and Storage mutations are
  performed through the trusted Express backend.

## Verification results

- Backend TypeScript: passed.
- Frontend TypeScript: passed.
- ESLint: passed with zero errors or warnings.
- Backend unit/API tests: 7 passed.
- Frontend unit tests: 4 passed.
- Playwright E2E and visual regression: 13 passed.
- Production build and prerender: passed.
- `git diff --check`: passed.

## First content entry

The live `brands` table currently contains zero records. After deployment:

1. Sign in as an administrator.
2. Open **All Products** and scroll below the portfolio grid.
3. Select **Manage collaborations**.
4. Add the brand name, logo, description, and display order.
5. Edit an existing project and choose that brand in **Collaboration brand**.

The brand logo will then appear publicly, and its collection page will list the
linked project.
