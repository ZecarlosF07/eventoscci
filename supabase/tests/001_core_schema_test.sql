begin;

select plan(14);

select ok(to_regtype('public.document_type') is not null, 'document_type enum exists');
select ok(to_regtype('public.user_role') is not null, 'user_role enum exists');
select ok(to_regclass('public.people') is not null, 'people table exists');
select ok(to_regclass('public.user_accounts') is not null, 'user_accounts table exists');
select ok(to_regclass('public.categories') is not null, 'categories table exists');
select ok(to_regclass('public.speakers') is not null, 'speakers table exists');

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any(array['people', 'user_accounts', 'categories', 'speakers'])
      and not c.relrowsecurity
  ),
  'RLS is enabled on every core table'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'uq_people_document'
      and indexdef not ilike '% where %'
  ),
  'people document identity is permanently unique'
);

select ok(
  exists (
    select 1
    from pg_proc
    where proname = 'set_updated_at'
      and pronamespace = 'public'::regnamespace
  ),
  'set_updated_at function exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_public_read'
  ),
  'categories public read policy exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'speakers'
      and policyname = 'speakers_public_read'
  ),
  'speakers public read policy exists'
);

select ok(
  (select count(*) from public.categories where deleted_at is null) >= 5
    and exists (select 1 from public.speakers where deleted_at is null)
    and exists (select 1 from public.people where deleted_at is null),
  'minimum seed data exists'
);

select ok(
  not has_table_privilege('anon', 'public.people', 'select')
    and not has_table_privilege('anon', 'public.user_accounts', 'select'),
  'anonymous users cannot read personal core tables'
);

update public.categories
set deleted_at = now()
where id = '10000000-0000-4000-8000-000000000001';

set local role anon;

select is(
  (select count(*) from public.categories),
  4::bigint,
  'soft-deleted categories are hidden from public reads'
);

reset role;

select * from finish();

rollback;
