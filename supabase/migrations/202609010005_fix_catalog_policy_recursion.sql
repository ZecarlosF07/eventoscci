-- Resolve catalog visibility without evaluating activities RLS recursively.

create or replace function public.is_venue_used_by_public_activity(p_venue_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.activities activity
    where activity.venue_id = p_venue_id
      and activity.deleted_at is null
      and activity.published_at is not null
      and activity.status in ('published', 'finished', 'cancelled')
  );
$$;

create or replace function public.is_contact_used_by_public_activity(p_contact_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.activities activity
    where activity.contact_id = p_contact_id
      and activity.deleted_at is null
      and activity.published_at is not null
      and activity.status in ('published', 'finished', 'cancelled')
  );
$$;

create or replace function public.is_category_used_by_public_activity(p_category_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.activities activity
    where activity.category_id = p_category_id
      and activity.deleted_at is null
      and activity.published_at is not null
      and activity.status in ('published', 'finished', 'cancelled')
  );
$$;

revoke execute on function public.is_venue_used_by_public_activity(uuid) from public;
revoke execute on function public.is_contact_used_by_public_activity(uuid) from public;
revoke execute on function public.is_category_used_by_public_activity(uuid) from public;
grant execute on function public.is_venue_used_by_public_activity(uuid) to anon, authenticated, service_role;
grant execute on function public.is_contact_used_by_public_activity(uuid) to anon, authenticated, service_role;
grant execute on function public.is_category_used_by_public_activity(uuid) to anon, authenticated, service_role;

drop policy if exists venues_public_read on public.venues;
create policy venues_public_read on public.venues
for select to anon, authenticated
using (
  deleted_at is null
  and public.is_venue_used_by_public_activity(id)
);

drop policy if exists activity_contacts_public_read on public.activity_contacts;
create policy activity_contacts_public_read on public.activity_contacts
for select to anon, authenticated
using (
  deleted_at is null
  and public.is_contact_used_by_public_activity(id)
);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
for select to anon, authenticated
using (
  deleted_at is null
  and (
    is_active
    or public.is_category_used_by_public_activity(id)
  )
);
