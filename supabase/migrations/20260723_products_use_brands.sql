-- Make brands the single source of truth for a product's client name and logo.
-- This migration intentionally stops when an unlinked product exists so no
-- client information is lost silently.

do $$
declare
  unlinked_count integer;
begin
  select count(*) into unlinked_count
  from public.products
  where brand_id is null;

  if unlinked_count > 0 then
    raise exception
      'Cannot finish brand migration: % product(s) still have brand_id = null. Link every product to a brand first.',
      unlinked_count;
  end if;
end
$$;

alter table public.products
drop constraint if exists products_brand_id_fkey;

alter table public.products
alter column brand_id set not null;

alter table public.products
add constraint products_brand_id_fkey
foreign key (brand_id)
references public.brands(id)
on delete restrict;

alter table public.products
drop column if exists client_information,
drop column if exists partner_logo_url;

