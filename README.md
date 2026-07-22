# Future Studio

## Project structure

- `frontend`: React + Vite website.
- `backend`: Express + TypeScript API.
- `shared/types.ts`: shared TypeScript contracts.
- `shared/fallbackData.ts`: temporary fallback content while Supabase is unavailable.
- `supabase/schema.sql`: database, RLS, and Storage schema.

## Local development

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

Add products, Vimeo/YouTube links, team members and contact details in
Supabase. Static content in `shared/fallbackData.ts` is fallback-only.

## API architecture

Public content and all CMS mutations now use the Express API. The browser uses
Supabase only for Auth sessions and signed Storage uploads authorized by the API.

1. Copy `backend/.env.example` to `backend/.env` and provide the three Supabase keys.
2. Copy `frontend/.env.example` to `frontend/.env`; use `VITE_API_URL=/api` locally.
3. Apply `supabase/migrations/20260722_backend_only_writes.sql`.
4. Add the existing Auth user to `public.admin_users`, or configure `ADMIN_EMAILS`.

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` environment variable.
