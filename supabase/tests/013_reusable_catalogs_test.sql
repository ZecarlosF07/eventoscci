begin;

select no_plan();

select ok(to_regclass('public.venues') is not null, 'venues table exists');
select ok(to_regclass('public.activity_contacts') is not null, 'activity contacts table exists');
select ok(to_regclass('public.speaker_private_details') is not null, 'speaker private details table exists');

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'activities' and column_name = 'venue_id'
  ),
  'activities reference a reusable venue'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'activities' and column_name = 'contact_id'
  ),
  'activities reference a reusable contact'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'speakers' and column_name = 'specialties'
  ),
  'speakers include specialties'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'speakers' and column_name = 'linkedin_url'
  ),
  'speakers include public professional links'
);
select is(
  has_table_privilege('anon', 'public.speaker_private_details', 'SELECT'),
  false,
  'anonymous users cannot read private speaker details'
);
select ok(
  exists (select 1 from storage.buckets where id = 'speaker-images' and public),
  'speaker image bucket is public for profile rendering'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_activity_contacts_default_active'),
  'only one active default contact is allowed'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'validate_activity_catalogs_before_write'),
  'activity catalog validation trigger exists'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'propagate_venue_compatibility_after_update'),
  'venue edits propagate to compatibility fields'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'propagate_contact_compatibility_after_update'),
  'contact edits propagate to compatibility fields'
);
select ok(
  to_regprocedure('public.is_venue_used_by_public_activity(uuid)') is not null,
  'venue visibility uses a non-recursive helper'
);
select ok(
  to_regprocedure('public.is_contact_used_by_public_activity(uuid)') is not null,
  'contact visibility uses a non-recursive helper'
);
select ok(
  has_function_privilege('anon', 'public.is_category_used_by_public_activity(uuid)', 'EXECUTE'),
  'anonymous catalog reads can evaluate category visibility safely'
);

select * from finish(true);
rollback;
