begin;

select plan(37);

select ok(to_regtype('public.activity_type') is not null, 'activity_type enum exists');
select ok(to_regtype('public.activity_modality') is not null, 'activity_modality enum exists');
select ok(to_regtype('public.activity_status') is not null, 'activity_status enum exists');
select ok(to_regclass('public.activities') is not null, 'activities table exists');
select ok(to_regclass('public.activity_dates') is not null, 'activity_dates table exists');
select ok(to_regclass('public.activity_speakers') is not null, 'activity_speakers table exists');

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any(array['activities', 'activity_dates', 'activity_speakers'])
      and not c.relrowsecurity
  ),
  'RLS is enabled on every activity table'
);

select ok(to_regprocedure('public.is_active_admin()') is not null, 'admin helper exists');
select ok(
  to_regprocedure('public.save_activity(jsonb,jsonb,jsonb)') is not null,
  'atomic save function exists'
);
select ok(
  to_regprocedure('public.set_activity_status(uuid,public.activity_status)') is not null,
  'status function exists'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activities'
      and column_name = 'maps_embed_url'
  ),
  'activities stores a Google Maps embed URL'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activities'
      and column_name = 'program_image_paths'
      and data_type = 'ARRAY'
  ),
  'activities stores ordered visual program images'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'activities_program_image_limit'
  ),
  'visual programs are limited to ten images'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'activities_published_map_required'
  ),
  'published in-person activities require a map'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'activities_published_whatsapp_required'
  ),
  'published activities require a valid WhatsApp number'
);
select ok(
  to_regprocedure('public.soft_delete_activity(uuid)') is not null,
  'soft delete function exists'
);

select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_activities_slug_active'),
  'active activity slug is unique'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_activity_speaker_active'),
  'active speaker assignment is unique'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'set_activities_updated_at'),
  'activities updated_at trigger exists'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'set_activity_dates_updated_at'),
  'activity_dates updated_at trigger exists'
);
select ok(
  exists (select 1 from information_schema.triggers where trigger_name = 'set_activity_speakers_updated_at'),
  'activity_speakers updated_at trigger exists'
);
select ok(
  exists (select 1 from pg_policies where policyname = 'activities_public_read'),
  'public activity policy exists'
);
select ok(
  exists (select 1 from pg_policies where policyname = 'activities_admin_all'),
  'admin activity policy exists'
);
select ok(
  exists (select 1 from storage.buckets where id = 'activity-images' and public),
  'public activity image bucket exists'
);
select is(
  (
    select count(*)
    from public.activities
    where id in (
      '40000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000002'
    )
      and deleted_at is null
  ),
  2::bigint,
  'two seeded activities exist'
);
select is(
  (
    select count(*)
    from (
      select activity_id
      from public.activity_dates
      where activity_id in (
        '40000000-0000-4000-8000-000000000001',
        '40000000-0000-4000-8000-000000000002'
      )
        and deleted_at is null
      group by activity_id
      having count(*) >= 2
    ) seeded_activity_dates
  ),
  2::bigint,
  'seeded activities include multiple dates'
);
select is(
  (
    select count(*)
    from public.activity_speakers
    where activity_id in (
      '40000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000002'
    )
      and speaker_id = '20000000-0000-4000-8000-000000000001'
      and deleted_at is null
  ),
  2::bigint,
  'seeded activities include speakers'
);

insert into public.activities (
  id, type, title, slug, description, modality, status
) values (
  '70000000-0000-4000-8000-000000000001',
  'event',
  'Borrador no público',
  'borrador-no-publico',
  'Registro temporal para validar RLS.',
  'in_person',
  'draft'
);

set local role anon;

select is(
  (select count(*) from public.activities where type = 'event'),
  1::bigint,
  'anonymous visitors only see public events'
);
select is(
  (select count(*) from public.activities where slug = 'borrador-no-publico'),
  0::bigint,
  'draft activities are hidden from anonymous visitors'
);

reset role;

insert into auth.users (id, email)
values
  ('80000000-0000-4000-8000-000000000001', 'student.test@example.test'),
  ('80000000-0000-4000-8000-000000000002', 'admin.test@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
)
values (
  '31000000-0000-4000-8000-000000000001',
  'dni',
  '00000002',
  'Administrador',
  'Temporal',
  'admin.test@example.test',
  '900000002',
  'Administrador de prueba'
);

insert into public.user_accounts (user_id, person_id, role)
values
  (
    '80000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'student'
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    '31000000-0000-4000-8000-000000000001',
    'administrator'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '80000000-0000-4000-8000-000000000001', true);

select is(public.is_active_admin(), false, 'student is not an active administrator');
select throws_ok(
  $$select public.set_activity_status('40000000-0000-4000-8000-000000000001', 'cancelled')$$,
  '42501',
  'No autorizado para cambiar el estado.',
  'student cannot mutate activity status'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '80000000-0000-4000-8000-000000000002', true);

select is(public.is_active_admin(), true, 'active administrator is authorized');
select lives_ok(
  $$select public.save_activity(
    '{
      "type":"training",
      "title":"Actividad transaccional",
      "slug":"actividad-transaccional",
      "description":"Actividad creada desde la función atómica de prueba.",
      "modality":"virtual",
      "maps_embed_url":"https://www.google.com/maps/embed?pb=test",
      "virtual_url":"https://example.test/activity",
      "is_free":true,
      "general_price":"0",
      "member_price":"0",
      "status":"draft"
    }'::jsonb,
    '[
      {"starts_at":"2026-11-10T18:00:00-05:00","ends_at":"2026-11-10T20:00:00-05:00","label":"Sesión 1","sort_order":0},
      {"starts_at":"2026-11-12T18:00:00-05:00","ends_at":"2026-11-12T20:00:00-05:00","label":"Sesión 2","sort_order":1}
    ]'::jsonb,
    '[]'::jsonb
  )$$,
  'administrator can create an activity atomically'
);
select is(
  (select count(*) from public.activities where slug = 'actividad-transaccional'),
  1::bigint,
  'atomic save persists the activity'
);
select is(
  (select maps_embed_url from public.activities where slug = 'actividad-transaccional'),
  'https://www.google.com/maps/embed?pb=test',
  'atomic save persists the map URL'
);
select is(
  (
    select count(*)
    from public.activity_dates
    where activity_id = (
      select id from public.activities where slug = 'actividad-transaccional'
    )
  ),
  2::bigint,
  'atomic save persists multiple dates'
);
select lives_ok(
  $$select public.set_activity_status('40000000-0000-4000-8000-000000000001', 'cancelled')$$,
  'administrator can mutate activity status'
);

reset role;

select * from finish(true);

rollback;
