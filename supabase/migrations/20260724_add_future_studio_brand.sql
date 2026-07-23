-- Internal/default brand for projects without an external collaboration.
-- It is hidden from the public collaborations grid but remains available
-- in the authenticated product editor.

insert into public.brands (
  name,
  slug,
  logo_url,
  description,
  website_url,
  display_order,
  is_visible
)
values (
  'Future Studio',
  'future-studio',
  'https://futurestudiovn.com/images/logofuturesymbol.png',
  'Future Studio internal production.',
  'https://futurestudiovn.com',
  10000,
  false
)
on conflict (slug) do update
set
  name = excluded.name,
  logo_url = excluded.logo_url,
  updated_at = now();

