begin;

select plan(52);

select ok(to_regtype('public.registration_type') is not null, 'registration_type enum exists');
select ok(to_regtype('public.registration_status') is not null, 'registration_status enum exists');
select ok(to_regtype('public.attendance_status') is not null, 'attendance_status enum exists');
select ok(to_regtype('public.notification_status') is not null, 'notification_status enum exists');
select ok(to_regclass('public.activity_registration_code_seq') is not null, 'registration code sequence exists');
select ok(to_regclass('public.registrations') is not null, 'registrations table exists');
select ok(to_regclass('public.attendance') is not null, 'attendance table exists');
select ok(to_regclass('public.notification_outbox') is not null, 'notification outbox exists');

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any(array['registrations', 'attendance', 'notification_outbox'])
      and not c.relrowsecurity
  ),
  'RLS is enabled on registration tables'
);
select ok(to_regprocedure('public.register_activity(uuid,jsonb)') is not null, 'registration RPC exists');
select ok(to_regprocedure('public.get_public_registration_result(text)') is not null, 'public result RPC exists');
select ok(to_regprocedure('public.get_activity_registration_availability(uuid)') is not null, 'public availability RPC exists');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_registration_person_activity_active'), 'active registration is unique');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_attendance_registration_active'), 'active attendance is unique');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_notification_registration_event_active'), 'registration notification is unique');
select ok(exists (select 1 from information_schema.triggers where trigger_name = 'set_registrations_updated_at'), 'registration timestamp trigger exists');
select ok(exists (select 1 from information_schema.triggers where trigger_name = 'set_attendance_updated_at'), 'attendance timestamp trigger exists');
select ok(exists (select 1 from information_schema.triggers where trigger_name = 'set_notification_outbox_updated_at'), 'outbox timestamp trigger exists');
select ok(exists (select 1 from pg_policies where policyname = 'people_admin_read'), 'people admin policy exists');
select ok(exists (select 1 from pg_policies where policyname = 'registrations_admin_read'), 'registration admin policy exists');
select ok(exists (select 1 from pg_policies where policyname = 'attendance_admin_read'), 'attendance admin policy exists');
select ok(exists (select 1 from pg_policies where policyname = 'notification_outbox_admin_read'), 'outbox admin policy exists');
select matches(
  pg_get_functiondef('public.register_activity_internal(uuid,jsonb)'::regprocedure),
  '(?i)for update',
  'registration serializes capacity checks with a row lock'
);
select ok(has_function_privilege('anon', 'public.register_activity(uuid,jsonb)', 'EXECUTE'), 'anonymous registration can execute only the RPC');
select is(has_table_privilege('anon', 'public.registrations', 'SELECT'), false, 'anonymous visitors cannot read registrations');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, members_only, capacity, registration_open_at,
  registration_close_at, status, published_at
)
values
  (
    '71000000-0000-4000-8000-000000000001', 'event', 'Evento gratuito de prueba',
    'evento-gratuito-hito-3', 'Actividad temporal de pruebas.', 'in_person', true,
    0, 0, false, 3, now() - interval '1 day', now() + interval '1 day',
    'published', now()
  ),
  (
    '71000000-0000-4000-8000-000000000002', 'training', 'Capacitación pagada de prueba',
    'capacitacion-pagada-hito-3', 'Actividad temporal de pruebas.', 'virtual', false,
    150, 90, false, null, now() - interval '1 day', now() + interval '1 day',
    'published', now()
  ),
  (
    '71000000-0000-4000-8000-000000000003', 'event', 'Evento cerrado de prueba',
    'evento-cerrado-hito-3', 'Actividad temporal de pruebas.', 'in_person', true,
    0, 0, false, null, now() - interval '2 days', now() - interval '1 day',
    'published', now() - interval '3 days'
  ),
  (
    '71000000-0000-4000-8000-000000000004', 'event', 'Evento de un cupo',
    'evento-un-cupo-hito-3', 'Actividad temporal de pruebas.', 'in_person', true,
    0, 0, false, 1, now() - interval '1 day', now() + interval '1 day',
    'published', now()
  ),
  (
    '71000000-0000-4000-8000-000000000005', 'event', 'Evento exclusivo de prueba',
    'evento-exclusivo-hito-3', 'Actividad temporal de pruebas.', 'in_person', false,
    120, 70, true, null, now() - interval '1 day', now() + interval '1 day',
    'published', now()
  );

set local role anon;

select lives_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000001',
    '{"document_type":"dni","document_number":"10000001","first_names":"Ana","last_names":"Prueba","email":"ana@example.test","phone":"900100001","job_title":"Empresaria","registration_type":"general"}'::jsonb
  )$$,
  'anonymous visitor registers in a free activity'
);

reset role;

select is((select status from public.registrations where activity_id = '71000000-0000-4000-8000-000000000001'), 'confirmed'::public.registration_status, 'free registration is confirmed');
select is((select price_snapshot from public.registrations where activity_id = '71000000-0000-4000-8000-000000000001'), 0::numeric, 'free registration stores zero price');
select is((select attendance.status from public.attendance join public.registrations on registrations.id = attendance.registration_id where registrations.activity_id = '71000000-0000-4000-8000-000000000001'), 'pending'::public.attendance_status, 'registration prepares pending attendance');
select is((select event_type from public.notification_outbox where related_entity_id = (select id from public.registrations where activity_id = '71000000-0000-4000-8000-000000000001')), 'activity_free_registration_confirmed', 'free confirmation emits its notification event');

set local role anon;
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000001',
    '{"document_type":"dni","document_number":"10000001","first_names":"Ana","last_names":"Prueba","email":"ana@example.test","phone":"900100001","job_title":"Empresaria","registration_type":"general"}'::jsonb
  )$$,
  '23505',
  'DUPLICATE_REGISTRATION',
  'duplicate registration is rejected'
);
select lives_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000002',
    '{"document_type":"dni","document_number":"10000002","first_names":"Bruno","last_names":"Asociado","email":"bruno@example.test","phone":"900100002","job_title":"Gerente","company":"Empresa Asociada SAC","ruc":"20123456789","registration_type":"member"}'::jsonb
  )$$,
  'member registers in a paid activity'
);
reset role;

select is((select status from public.registrations where person_id = (select id from public.people where document_number = '10000002')), 'pending'::public.registration_status, 'paid registration remains pending');
select is((select price_snapshot from public.registrations where person_id = (select id from public.people where document_number = '10000002')), 90::numeric, 'member price is calculated by PostgreSQL');
select is((select company_snapshot from public.registrations where person_id = (select id from public.people where document_number = '10000002')), 'Empresa Asociada SAC', 'member company snapshot is stored');
select is((select event_type from public.notification_outbox where person_id = (select id from public.people where document_number = '10000002')), 'activity_paid_preregistration_created', 'paid preregistration emits its notification event');

set local role anon;
select lives_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000002',
    '{"document_type":"dni","document_number":"10000001","first_names":"Ana","last_names":"Prueba","email":"ana.actualizada@example.test","phone":"900100009","job_title":"Directora","registration_type":"general"}'::jsonb
  )$$,
  'existing person registers in a different activity'
);
reset role;

select is((select count(*) from public.people where document_type = 'dni' and document_number = '10000001'), 1::bigint, 'existing identity is not duplicated');
select is((select email from public.people where document_number = '10000001'), 'ana.actualizada@example.test', 'allowed current contact data is updated');
select is((select price_snapshot from public.registrations where activity_id = '71000000-0000-4000-8000-000000000002' and person_id = (select id from public.people where document_number = '10000001')), 150::numeric, 'general price is calculated by PostgreSQL');

set local role anon;
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000002',
    '{"document_type":"dni","document_number":"10000003","first_names":"Carla","last_names":"Sin RUC","email":"carla@example.test","phone":"900100003","job_title":"Analista","registration_type":"member"}'::jsonb
  )$$,
  '22023',
  'INVALID_MEMBER_DATA',
  'member data is required'
);
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000005',
    '{"document_type":"dni","document_number":"10000004","first_names":"Diego","last_names":"General","email":"diego@example.test","phone":"900100004","job_title":"Analista","registration_type":"general"}'::jsonb
  )$$,
  'P0001',
  'INVALID_MEMBER_DATA',
  'members-only activity rejects general registration'
);
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000003',
    '{"document_type":"dni","document_number":"10000005","first_names":"Elena","last_names":"Tarde","email":"elena@example.test","phone":"900100005","job_title":"Contadora","registration_type":"general"}'::jsonb
  )$$,
  'P0001',
  'REGISTRATION_CLOSED',
  'closed activity rejects registration'
);
reset role;

select is((select count(*) from public.people where document_number = '10000005'), 0::bigint, 'closed activity does not create a person');

set local role anon;
select lives_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000004',
    '{"document_type":"dni","document_number":"10000006","first_names":"Fabio","last_names":"Primero","email":"fabio@example.test","phone":"900100006","job_title":"Abogado","registration_type":"general"}'::jsonb
  )$$,
  'last available capacity can be taken'
);
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000004',
    '{"document_type":"dni","document_number":"10000007","first_names":"Gloria","last_names":"Segunda","email":"gloria@example.test","phone":"900100007","job_title":"Administradora","registration_type":"general"}'::jsonb
  )$$,
  'P0001',
  'NO_AVAILABLE_CAPACITY',
  'capacity cannot be exceeded'
);
select throws_ok(
  $$select public.register_activity(
    '71000000-0000-4000-8000-000000000004',
    '{"document_type":"dni","document_number":"10000006","first_names":"Fabio","last_names":"Primero","email":"fabio@example.test","phone":"900100006","job_title":"Abogado","registration_type":"general"}'::jsonb
  )$$,
  '23505',
  'DUPLICATE_REGISTRATION',
  'duplicate retry remains idempotent even when activity is full'
);
reset role;

select is((select count(*) from public.registrations where activity_id = '71000000-0000-4000-8000-000000000004'), 1::bigint, 'full activity keeps exactly one registration');
select is((public.get_activity_registration_availability('71000000-0000-4000-8000-000000000004')->>'reason'), 'full', 'availability reports a full activity');
select is((public.get_public_registration_result((select registration_code from public.registrations where activity_id = '71000000-0000-4000-8000-000000000001'))->>'status'), 'confirmed', 'public result returns registration status');
select is((public.get_public_registration_result((select registration_code from public.registrations where activity_id = '71000000-0000-4000-8000-000000000001')) ? 'email'), false, 'public result does not expose personal email');

insert into auth.users (id, email)
values ('81000000-0000-4000-8000-000000000001', 'hito3.admin@example.test');
insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '32000000-0000-4000-8000-000000000001', 'dni', '10000008', 'Admin', 'Hito Tres',
  'hito3.admin@example.test', '900100008', 'Administrador'
);
insert into public.user_accounts (user_id, person_id, role)
values (
  '81000000-0000-4000-8000-000000000001',
  '32000000-0000-4000-8000-000000000001',
  'administrator'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
select ok((select count(*) from public.registrations) >= 4, 'active administrator can read registrations through RLS');
reset role;

select * from finish(true);

rollback;
