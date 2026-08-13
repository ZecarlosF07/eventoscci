begin;

select plan(55);

select ok(to_regclass('public.audit_logs') is not null, 'audit log table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.audit_logs'::regclass), 'audit log RLS is enabled');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_audit_logs_entity'), 'audit entity index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_audit_logs_actor'), 'audit actor index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_audit_logs_created_at'), 'audit date index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_attendance_status_active'), 'attendance status index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_registrations_type_active'), 'registration type index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_people_document_trgm_active'), 'participant document search index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_people_first_names_trgm_active'), 'participant first name search index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_people_last_names_trgm_active'), 'participant last name search index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_people_email_trgm_active'), 'participant email search index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_people_phone_trgm_active'), 'participant phone search index exists');
select ok(to_regprocedure('public.confirm_registration(uuid)') is not null, 'confirmation RPC exists');
select ok(to_regprocedure('public.cancel_registration(uuid,text)') is not null, 'cancellation RPC exists');
select ok(to_regprocedure('public.update_participant(uuid,jsonb)') is not null, 'participant update RPC exists');
select ok(to_regprocedure('public.set_attendance_status(uuid[],public.attendance_status,text)') is not null, 'attendance RPC exists');
select is(has_function_privilege('anon', 'public.confirm_registration(uuid)', 'EXECUTE'), false, 'anonymous cannot confirm registrations');
select is(has_function_privilege('authenticated', 'public.confirm_registration(uuid)', 'EXECUTE'), true, 'authenticated role can reach guarded confirmation RPC');
select is(has_table_privilege('anon', 'public.audit_logs', 'SELECT'), false, 'anonymous cannot read audit logs');
select is(has_table_privilege('authenticated', 'public.audit_logs', 'INSERT'), false, 'authenticated role cannot append audit logs directly');

insert into auth.users (id, email)
values
  ('82000000-0000-4000-8000-000000000001', 'hito4.student@example.test'),
  ('82000000-0000-4000-8000-000000000002', 'hito4.admin@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
)
values
  ('33000000-0000-4000-8000-000000000001', 'dni', '13000001', 'Estudiante', 'Hito Cuatro', 'hito4.student@example.test', '913000001', 'Estudiante'),
  ('33000000-0000-4000-8000-000000000002', 'dni', '13000002', 'Administrador', 'Hito Cuatro', 'hito4.admin@example.test', '913000002', 'Administrador');

insert into public.user_accounts (user_id, person_id, role)
values
  ('82000000-0000-4000-8000-000000000001', '33000000-0000-4000-8000-000000000001', 'student'),
  ('82000000-0000-4000-8000-000000000002', '33000000-0000-4000-8000-000000000002', 'administrator');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, capacity, registration_open_at, registration_close_at,
  status, published_at
)
values (
  '73000000-0000-4000-8000-000000000001', 'event', 'Operación Hito 4',
  'operacion-hito-4', 'Actividad temporal para pruebas operativas.', 'in_person',
  false, 150, 90, 10, now() - interval '1 day', now() + interval '1 day',
  'published', now()
);

set local role anon;
select public.register_activity(
  '73000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"13000003","first_names":"Participante","last_names":"Operativo Uno","email":"operativo1@example.test","phone":"913000003","job_title":"Gerente","company":"Empresa Original SAC","ruc":"20130000003","registration_type":"member"}'::jsonb
);
select public.register_activity(
  '73000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"13000004","first_names":"Participante","last_names":"Operativo Dos","email":"operativo2@example.test","phone":"913000004","job_title":"Analista","registration_type":"general"}'::jsonb
);
reset role;

create temporary table hito4_refs as
select
  registrations.id as registration_id,
  registrations.person_id,
  attendance.id as attendance_id,
  people.document_number
from public.registrations
join public.people on people.id = registrations.person_id
join public.attendance on attendance.registration_id = registrations.id
where registrations.activity_id = '73000000-0000-4000-8000-000000000001';

grant select on hito4_refs to authenticated;

select is((select status from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), 'pending'::public.registration_status, 'paid registration starts pending');
select is((select status from public.attendance where id = (select attendance_id from hito4_refs where document_number = '13000003')), 'pending'::public.attendance_status, 'attendance starts pending');

set local role authenticated;
select set_config('request.jwt.claim.sub', '82000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.confirm_registration((select registration_id from hito4_refs where document_number = '13000003'))$$,
  '42501', 'UNAUTHORIZED', 'student cannot confirm a registration'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '82000000-0000-4000-8000-000000000002', true);

select lives_ok(
  $$select public.confirm_registration((select registration_id from hito4_refs where document_number = '13000003'))$$,
  'administrator confirms a pending registration'
);
select is((select status from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), 'confirmed'::public.registration_status, 'confirmation persists confirmed status');
select is((select confirmed_by from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), '82000000-0000-4000-8000-000000000002'::uuid, 'confirmation records actor');
select ok((select confirmed_at is not null from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), 'confirmation records timestamp');
select is((select count(*) from public.notification_outbox where event_type = 'activity_paid_registration_confirmed' and related_entity_id = (select registration_id from hito4_refs where document_number = '13000003')), 1::bigint, 'confirmation prepares one notification');
select is((select count(*) from public.audit_logs where action = 'registration.confirmed' and entity_id = (select registration_id from hito4_refs where document_number = '13000003')), 1::bigint, 'confirmation is audited');

create temporary table hito4_confirmation as
select confirmed_at
from public.registrations
where id = (select registration_id from hito4_refs where document_number = '13000003');

grant select on hito4_confirmation to authenticated;

select lives_ok(
  $$select public.confirm_registration((select registration_id from hito4_refs where document_number = '13000003'))$$,
  'repeated confirmation is idempotent'
);
select is((select confirmed_at from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), (select confirmed_at from hito4_confirmation), 'repeated confirmation preserves timestamp');
select is((select count(*) from public.notification_outbox where event_type = 'activity_paid_registration_confirmed' and related_entity_id = (select registration_id from hito4_refs where document_number = '13000003')), 1::bigint, 'repeated confirmation does not duplicate notification');
select is((select count(*) from public.audit_logs where action = 'registration.confirmed' and entity_id = (select registration_id from hito4_refs where document_number = '13000003')), 1::bigint, 'repeated confirmation does not duplicate audit');

select lives_ok(
  $$select public.cancel_registration((select registration_id from hito4_refs where document_number = '13000004'), 'No completó la coordinación externa')$$,
  'administrator cancels a registration'
);
select is((select status from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000004')), 'cancelled'::public.registration_status, 'cancellation persists cancelled status');
select ok((select cancelled_at is not null from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000004')), 'cancellation records timestamp');
select is((select cancelled_by from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000004')), '82000000-0000-4000-8000-000000000002'::uuid, 'cancellation records actor');
select is((select cancellation_reason from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000004')), 'No completó la coordinación externa', 'cancellation stores reason');
select ok((select deleted_at is null from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000004')), 'cancellation is not soft deletion');
select is((select count(*) from public.audit_logs where action = 'registration.cancelled' and entity_id = (select registration_id from hito4_refs where document_number = '13000004')), 1::bigint, 'cancellation is audited');
select lives_ok(
  $$select public.cancel_registration((select registration_id from hito4_refs where document_number = '13000004'), 'Segundo intento')$$,
  'repeated cancellation is idempotent'
);
select is((select count(*) from public.audit_logs where action = 'registration.cancelled' and entity_id = (select registration_id from hito4_refs where document_number = '13000004')), 1::bigint, 'repeated cancellation does not duplicate audit');

select lives_ok(
  $$select public.update_participant(
    (select person_id from hito4_refs where document_number = '13000003'),
    '{"first_names":"Participante Actualizado","last_names":"Operativo Uno","email":"actualizado@example.test","phone":"919999999","job_title":"Director","company":"Empresa Nueva SAC","ruc":"20139999999","address":"Ica"}'::jsonb
  )$$,
  'administrator updates participant data'
);
select ok((select email = 'actualizado@example.test' and phone = '919999999' and company = 'Empresa Nueva SAC' from public.people where id = (select person_id from hito4_refs where document_number = '13000003')), 'people reflects corrected current data');
select is((select company_snapshot from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), 'Empresa Original SAC', 'participant update preserves company snapshot');
select is((select price_snapshot from public.registrations where id = (select registration_id from hito4_refs where document_number = '13000003')), 90::numeric, 'participant update preserves price snapshot');
select is((select count(*) from public.audit_logs where action = 'participant.updated' and entity_id = (select person_id from hito4_refs where document_number = '13000003')), 1::bigint, 'participant update is audited');

select lives_ok(
  $$select public.set_attendance_status(array[(select attendance_id from hito4_refs where document_number = '13000003')], 'attended', 'Ingreso validado')$$,
  'administrator marks individual attendance'
);
select ok((select status = 'attended' and marked_at is not null and marked_by = '82000000-0000-4000-8000-000000000002'::uuid from public.attendance where id = (select attendance_id from hito4_refs where document_number = '13000003')), 'attendance stores state timestamp and actor');
select lives_ok(
  $$select public.set_attendance_status(array[(select attendance_id from hito4_refs where document_number = '13000003')], 'absent', null)$$,
  'administrator corrects attendance to absent'
);
select is((select status from public.attendance where id = (select attendance_id from hito4_refs where document_number = '13000003')), 'absent'::public.attendance_status, 'attendance correction persists');
select lives_ok(
  $$select public.set_attendance_status(
    array(select attendance_id from hito4_refs order by attendance_id),
    'attended',
    'Control masivo'
  )$$,
  'administrator marks attendance in bulk'
);
select is((select count(*) from public.attendance where id in (select attendance_id from hito4_refs) and status = 'attended'), 2::bigint, 'bulk attendance updates every selected record');
select ok((select count(*) from public.audit_logs where action = 'attendance.status_changed') >= 4, 'attendance changes are audited');
select ok((select count(*) from public.audit_logs) >= 7, 'active administrator can read audit logs through RLS');

reset role;

select * from finish(true);

rollback;
