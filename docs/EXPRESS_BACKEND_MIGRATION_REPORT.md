# Express backend migration report

Date: 2026-07-22

## Outcome

The application data path has been migrated from direct browser database access to:

```text
React -> Express API -> Supabase Database
React -> Express authorization -> signed Supabase Storage upload
```

The browser keeps Supabase Auth only for sign-in, session refresh, sign-out, and the final signed upload transfer. Product, member, and site-content reads no longer use Supabase REST directly.

## Backend changes

- Added an Express app factory, centralized JSON size limit, CORS, 404 responses, Zod validation errors, and safe 500 responses.
- Added bearer-token verification with `supabase.auth.getUser(token)`.
- Added separate Auth and service-role Supabase clients.
- Added administrator authorization through `admin_users`, `ADMIN_EMAILS`, `ADMIN_USER_IDS`, or the `app_metadata.role=admin` claim.
- Added `GET /api/auth/me` for frontend permission checks.
- Completed product CRUD:
  - `GET /api/products`
  - `GET /api/products/category/:category`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- Product deletion also attempts to remove owned media from `product-media`.
- Added member CRUD under `/api/members`.
- Expanded content reads to accept both friendly aliases and database content keys.
- Added `POST /api/uploads/sign`; only an authorized admin can request signed upload tokens.
- Added backend request schemas for products, members, IDs, and upload requests.
- Added local `.env` loading through the Node runtime and made backend typecheck part of the root build.

## Frontend changes

- Added a shared API client with standardized errors and bearer-token support.
- Product and member services now call Express.
- `useSiteContent` now reads from Express.
- Added `useAdminSession`; management controls require a positive backend admin response instead of merely checking for any Supabase session.
- Product login now rejects valid Supabase users who do not have backend administrator permission.
- Product and team media use upload tokens signed by Express.
- Added a Vite `/api` development proxy to `http://localhost:4000`.
- Updated E2E fixtures to mock Express response contracts in camelCase.

## Database security changes

Migration `20260722_backend_only_writes.sql`:

- Creates `public.admin_users`.
- Revokes product, member, and site-content mutations from the browser `authenticated` role.
- Removes browser Storage mutation policies.
- Keeps public read policies.
- Leaves trusted mutations to the backend service-role client after Express authorization.

The canonical `supabase/schema.sql` finishes with the same lockdown for new environments.

## Automated verification

### Passed

- Backend API integration tests: 6/6.
  - Health and public resources.
  - Anonymous mutation rejection.
  - Product create/update/delete and request validation.
  - Member create/update/delete.
  - Signed upload authorization.
- Frontend product validation unit tests: 3/3.
- Backend TypeScript typecheck: passed.
- Frontend TypeScript and Vite production build: passed.
- Functional Playwright tests: 7/7.
  - Product listing.
  - Category filtering.
  - Quick View open/close.
  - Anonymous management-control protection.
  - Products/team/contact navigation.
  - Mobile scrolling and Quick View close behavior.
- New frontend API services and hooks: ESLint passed.
- Direct frontend table access search: no remaining `.from('products')`, `.from('members')`, or `.from('site_content')` calls.

### Known non-blocking test findings

- Full Playwright run: 8 functional/visual cases passed and 3 visual snapshots failed.
- The desktop product page differed by about 1% of pixels.
- Desktop and mobile Quick View snapshots have stale element-height baselines. Actual content remained visually equivalent in the inspected top region, but the captured element included more black page area.
- No CSS or Quick View UI code was changed by this migration, so snapshots were not automatically overwritten.
- Full-project ESLint still fails on pre-existing React Hooks rules and generated `storybook-static` files. The files introduced for the API migration lint cleanly.

## Environment-dependent verification still required

There is no `backend/.env` in the workspace, so live tests against the real Supabase project could not be performed. Before production release:

1. Create `backend/.env` from `backend/.env.example`.
2. Set `SUPABASE_SERVICE_ROLE_KEY` only on the backend.
3. Apply `20260722_backend_only_writes.sql`.
4. Add the existing Auth account to `public.admin_users`, or configure a server-side admin allowlist.
5. Run the site and verify real sign-in, create, edit, delete, small-image upload, and large-video upload.
6. Deploy Express and set `VITE_API_URL` to the deployed API URL, or proxy `/api` to it on the same domain.
7. Configure `FRONTEND_URL` with the production origin.

## Files deliberately preserved

The existing uncommitted Team page wording change from `delete` to `đuổi việc` was preserved and was not introduced by this migration.
