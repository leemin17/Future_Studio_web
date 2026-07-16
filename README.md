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
