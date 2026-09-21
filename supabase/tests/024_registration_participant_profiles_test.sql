begin;

select plan(22);

select ok(to_regtype('public.participant_profile') is not null, 'participant profile enum exists');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'people' and column_name = 'participant_profile'), 'people stores participant profile');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'people' and column_name = 'academic_institution'), 'people stores academic institution');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'people' and column_name = 'career'), 'people stores career');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'registrations' and column_name = 'participant_profile'), 'registration stores participant profile');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'registrations' and column_name = 'job_title_snapshot'), 'registration stores job title snapshot');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'registrations' and column_name = 'academic_institution_snapshot'), 'registration stores institution snapshot');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'registrations' and column_name = 'career_snapshot'), 'registration stores career snapshot');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'registrations' and column_name = 'future_topics_suggestion'), 'registration stores future topic suggestion');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, members_only, capacity, registration_open_at,
  registration_close_at, maps_embed_url, contact_phone, status, published_at
) values
  ('24000000-0000-4000-8000-000000000001', 'event', 'Actividad perfiles uno', 'actividad-perfiles-uno', 'Prueba.', 'in_person', false, 120, 80, false, 20, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=profiles-1', '900000001', 'published', now()),
  ('24000000-0000-4000-8000-000000000002', 'training', 'Actividad perfiles dos', 'actividad-perfiles-dos', 'Prueba.', 'in_person', false, 120, 80, false, 20, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=profiles-2', '900000002', 'published', now()),
  ('24000000-0000-4000-8000-000000000003', 'event', 'Actividad perfiles tres', 'actividad-perfiles-tres', 'Prueba.', 'in_person', false, 120, 80, false, 20, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=profiles-3', '900000003', 'published', now());

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone,
  job_title, company, ruc
) values (
  '24000000-0000-4000-8000-000000000010', 'dni', '24000001', 'Ana', 'Existente',
  'ana@example.test', '924000001', 'Analista', 'Empresa conservada', '20123456789'
);

set local role anon;

select lives_ok(
  $$select public.register_activity(
    '24000000-0000-4000-8000-000000000001',
    '{"document_type":"dni","document_number":"24000001","first_names":"Ana","last_names":"Existente","email":"ana.nueva@example.test","phone":"924000001","participant_profile":"student","academic_institution":" Universidad de Ica ","career":" Administración ","registration_type":"general","future_topics_suggestion":" Inteligencia artificial aplicada "}'::jsonb
  )$$,
  'student registers with general pricing'
);

reset role;

select is((select price_snapshot from public.registrations where activity_id = '24000000-0000-4000-8000-000000000001'), 120::numeric, 'student receives general price');
select is((select participant_profile from public.registrations where activity_id = '24000000-0000-4000-8000-000000000001'), 'student'::public.participant_profile, 'student profile is stored');
select is((select academic_institution_snapshot from public.registrations where activity_id = '24000000-0000-4000-8000-000000000001'), 'Universidad de Ica', 'institution snapshot is normalized');
select is((select career_snapshot from public.registrations where activity_id = '24000000-0000-4000-8000-000000000001'), 'Administración', 'career snapshot is normalized');
select is((select future_topics_suggestion from public.registrations where activity_id = '24000000-0000-4000-8000-000000000001'), 'Inteligencia artificial aplicada', 'suggestion is normalized');
select is((select job_title from public.people where id = '24000000-0000-4000-8000-000000000010'), 'Analista', 'student registration preserves an existing job title');
select is((select company from public.people where id = '24000000-0000-4000-8000-000000000010'), 'Empresa conservada', 'student registration preserves existing company data');

set local role anon;

select lives_ok(
  $$select public.register_activity(
    '24000000-0000-4000-8000-000000000002',
    '{"document_type":"dni","document_number":"24000002","first_names":"Bruno","last_names":"Asociado","email":"bruno@example.test","phone":"924000002","participant_profile":"professional","job_title":"Gerente","company":"Empresa Asociada","ruc":"20987654321","registration_type":"member"}'::jsonb
  )$$,
  'member registers as a professional'
);

reset role;

select is((select price_snapshot from public.registrations where activity_id = '24000000-0000-4000-8000-000000000002'), 80::numeric, 'member keeps member price');
select is((select participant_profile from public.registrations where activity_id = '24000000-0000-4000-8000-000000000002'), 'professional'::public.participant_profile, 'member profile is professional');

set local role anon;

select throws_ok(
  $$select public.register_activity(
    '24000000-0000-4000-8000-000000000003',
    '{"document_type":"dni","document_number":"24000003","first_names":"Carla","last_names":"Inválida","email":"carla@example.test","phone":"924000003","participant_profile":"student","academic_institution":"Universidad","career":"Derecho","registration_type":"member"}'::jsonb
  )$$,
  '22023', 'VALIDATION_ERROR', 'student cannot use member registration type'
);

select throws_ok(
  $$select public.register_activity(
    '24000000-0000-4000-8000-000000000003',
    jsonb_build_object('document_type', 'dni', 'document_number', '24000004', 'first_names', 'Diego', 'last_names', 'Extenso', 'email', 'diego@example.test', 'phone', '924000004', 'participant_profile', 'professional', 'job_title', 'Analista', 'registration_type', 'general', 'future_topics_suggestion', repeat('x', 501))
  )$$,
  '22023', 'VALIDATION_ERROR', 'suggestion cannot exceed five hundred characters'
);

reset role;

select * from finish();
rollback;
