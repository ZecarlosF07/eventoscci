begin;

select no_plan();

select ok(
  to_regprocedure('public.get_certificate_activity_summaries()') is not null,
  'certificate activity aggregation RPC exists'
);
select is(
  has_function_privilege('anon', 'public.get_certificate_activity_summaries()', 'EXECUTE'),
  false,
  'anonymous users cannot read operational certificate counters'
);
select ok(
  has_function_privilege('authenticated', 'public.get_certificate_activity_summaries()', 'EXECUTE'),
  'authenticated internal users can invoke the protected aggregation'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_certificates_registration_status_active'),
  'activity certificate lookup has a covering production index'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_course_enrollments_course_status_active'),
  'course roster lookup has a production index'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_lessons_module_published_active'),
  'published lesson lookup has a production index'
);

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '3c000000-0000-4000-8000-000000000001', 'dni', '24000001',
  'Admin', 'Producción', 'admin12@example.test', '924000001', 'Administración'
);
insert into auth.users (id, email) values (
  '8c000000-0000-4000-8000-000000000001', 'admin12@example.test'
);
insert into public.user_accounts (user_id, person_id, role) values (
  '8c000000-0000-4000-8000-000000000001',
  '3c000000-0000-4000-8000-000000000001',
  'administrator'
);
insert into public.activities (
  id, type, title, slug, description, modality, is_free, contact_phone, status, published_at
) values (
  '4c000000-0000-4000-8000-000000000001', 'training', 'Capacitación H12',
  'capacitacion-h12', 'Validación integral', 'virtual', true, '900000012', 'published', now()
);
insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '3c000000-0000-4000-8000-000000000002', 'dni', '24000002',
  'Participante', 'Producción', 'student12@example.test', '924000002', 'Analista'
);
insert into public.registrations (
  id, activity_id, person_id, registration_code, registration_type, status, confirmed_at
) values (
  '7c000000-0000-4000-8000-000000000001',
  '4c000000-0000-4000-8000-000000000001',
  '3c000000-0000-4000-8000-000000000002',
  'CCI-H12-0001', 'general', 'confirmed', now()
);
insert into public.attendance (registration_id, status, marked_at) values (
  '7c000000-0000-4000-8000-000000000001', 'attended', now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8c000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(
  (select eligible_count from public.get_certificate_activity_summaries() where id = '4c000000-0000-4000-8000-000000000001'),
  1::bigint,
  'aggregation reports one eligible attendee without loading complete tables'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8c000000-0000-4000-8000-000000000099', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select throws_ok(
  $$select * from public.get_certificate_activity_summaries()$$,
  '42501',
  'UNAUTHORIZED',
  'runtime authorization rejects a non-internal authenticated account'
);
reset role;

select * from finish(true);
rollback;
