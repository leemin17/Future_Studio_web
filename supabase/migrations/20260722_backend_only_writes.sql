-- Route all database and Storage mutations through the trusted Express backend.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

revoke insert, update, delete on public.products from authenticated;
revoke insert, update, delete on public.site_content from authenticated;
revoke insert, update, delete on public.members from authenticated;
revoke usage on sequence public.products_id_seq from authenticated;
revoke usage on sequence public.members_id_seq from authenticated;

drop policy if exists "Authenticated admins can create products" on public.products;
drop policy if exists "Authenticated admins can update products" on public.products;
drop policy if exists "Authenticated admins can delete products" on public.products;
drop policy if exists "Authenticated admins can create site content" on public.site_content;
drop policy if exists "Authenticated admins can update site content" on public.site_content;
drop policy if exists "Authenticated admins can delete site content" on public.site_content;
drop policy if exists "Authenticated admins can create members" on public.members;
drop policy if exists "Authenticated admins can update members" on public.members;
drop policy if exists "Authenticated admins can delete members" on public.members;
drop policy if exists "Authenticated admins can upload product media" on storage.objects;
drop policy if exists "Authenticated admins can update product media" on storage.objects;
drop policy if exists "Authenticated admins can delete product media" on storage.objects;

-- Add an existing Supabase Auth account as an administrator after applying this migration:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do nothing;
