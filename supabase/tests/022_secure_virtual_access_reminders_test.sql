begin;

select plan(34);

select ok(to_regclass('public.activity_virtual_access') is not null, 'private virtual access table exists');
select ok(to_regclass('public.activity_virtual_reminders') is not null, 'virtual reminder identity table exists');
select is(has_table_privilege('anon', 'public.activity_virtual_access', 'SELECT'), false, 'anonymous users cannot read virtual access');
select is(has_table_privilege('anon', 'public.activity_virtual_reminders', 'SELECT'), false, 'anonymous users cannot read reminder identities');
select is(has_function_privilege('anon', 'public.claim_due_virtual_reminders(integer)', 'EXECUTE'), false, 'anonymous users cannot claim reminders');
select is(has_function_privilege('authenticated', 'public.claim_due_virtual_reminders(integer)', 'EXECUTE'), false, 'authenticated users cannot claim reminders');
select is(has_function_privilege('anon', 'public.build_activity_virtual_notification_payload(uuid,timestamp with time zone)', 'EXECUTE'), false, 'anonymous users cannot build private notification payloads');
select is(has_function_privilege('authenticated', 'public.build_activity_virtual_notification_payload(uuid,timestamp with time zone)', 'EXECUTE'), false, 'authenticated users cannot build private notification payloads');
select is(has_table_privilege('service_role', 'public.activity_virtual_access', 'INSERT'), true, 'service role can manage private access');

insert into auth.users (id, email) values
  ('8f000000-0000-4000-8000-000000000001', 'admin22@example.test'),
  ('8f000000-0000-4000-8000-000000000002', 'student22@example.test'),
  ('8f000000-0000-4000-8000-000000000003', 'operator22@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3f000000-0000-4000-8000-000000000001', 'dni', '22000001', 'Admin', 'Virtual', 'admin22@example.test', '922000001', 'Administradora'),
  ('3f000000-0000-4000-8000-000000000002', 'dni', '22000002', 'Alumno', 'Virtual', 'student22@example.test', '922000002', 'Analista'),
  ('3f000000-0000-4000-8000-000000000003', 'dni', '22000003', 'Operador', 'Virtual', 'operator22@example.test', '922000003', 'Operador');

insert into public.user_accounts (user_id, person_id, role) values
  ('8f000000-0000-4000-8000-000000000001', '3f000000-0000-4000-8000-000000000001', 'administrator'),
  ('8f000000-0000-4000-8000-000000000002', '3f000000-0000-4000-8000-000000000002', 'student'),
  ('8f000000-0000-4000-8000-000000000003', '3f000000-0000-4000-8000-000000000003', 'operator');

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone, email
) values (
  'af000000-0000-4000-8000-000000000001',
  'Responsable virtual',
  'Responsable Hito virtual',
  '922000022',
  'virtual22@example.test'
);

insert into public.venues (id, name, address, maps_embed_url)
values (
  'bf000000-0000-4000-8000-000000000001',
  'Auditorio Hito virtual',
  'Av. Principal 123, Ica',
  'https://www.google.com/maps/embed?pb=test'
);

insert into public.activities (
  id, contact_id, venue_id, type, title, slug, description, modality, is_free,
  general_price, member_price, status, published_at
) values
  (
    '7f000000-0000-4000-8000-000000000001',
    'af000000-0000-4000-8000-000000000001',
    null,
    'event', 'Evento virtual seguro', 'evento-virtual-seguro',
    'Actividad gratuita para validar acceso virtual seguro.', 'virtual', true,
    0, 0, 'published', now()
  ),
  (
    '7f000000-0000-4000-8000-000000000002',
    'af000000-0000-4000-8000-000000000001',
    'bf000000-0000-4000-8000-000000000001',
    'training', 'Capacitación híbrida segura', 'capacitacion-hibrida-segura',
    'Actividad pagada para validar confirmación híbrida.', 'hybrid', false,
    100, 80, 'published', now()
  );

insert into public.activity_virtual_access (activity_id, virtual_url) values
  ('7f000000-0000-4000-8000-000000000001', 'https://meet.example.test/free'),
  ('7f000000-0000-4000-8000-000000000002', 'https://meet.example.test/paid');

insert into public.activity_dates (id, activity_id, starts_at, ends_at, label, sort_order) values
  ('cf000000-0000-4000-8000-000000000004', '7f000000-0000-4000-8000-000000000001', now() + interval '30 minutes', now() + interval '90 minutes', 'Sesión inmediata', 0),
  ('cf000000-0000-4000-8000-000000000001', '7f000000-0000-4000-8000-000000000001', now() + interval '3 hours', now() + interval '4 hours', 'Sesión 1', 0),
  ('cf000000-0000-4000-8000-000000000002', '7f000000-0000-4000-8000-000000000001', now() + interval '1 day', now() + interval '1 day 1 hour', 'Sesión 2', 1),
  ('cf000000-0000-4000-8000-000000000003', '7f000000-0000-4000-8000-000000000002', now() + interval '4 hours', now() + interval '5 hours', 'Sesión híbrida', 0);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is((select count(*) from public.activity_virtual_access), 0::bigint, 'students cannot read private access through RLS');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(
  (select count(*) from public.activity_virtual_access where activity_id in (
    '7f000000-0000-4000-8000-000000000001',
    '7f000000-0000-4000-8000-000000000002'
  )),
  2::bigint,
  'administrators can read activity access'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(
  (select count(*) from public.activity_virtual_access where activity_id in (
    '7f000000-0000-4000-8000-000000000001',
    '7f000000-0000-4000-8000-000000000002'
  )),
  2::bigint,
  'operators can read activity access for administration'
);
reset role;

create temporary table hito_virtual_results (kind text primary key, payload jsonb);
grant select, insert on hito_virtual_results to anon, authenticated;

set local role anon;
insert into hito_virtual_results values (
  'free',
  public.register_activity(
    '7f000000-0000-4000-8000-000000000001',
    '{"document_type":"dni","document_number":"22000011","first_names":"Participante","last_names":"Gratuito","email":"free22@example.test","phone":"922000011","job_title":"Analista","registration_type":"general"}'::jsonb
  )
);
insert into hito_virtual_results values (
  'paid',
  public.register_activity(
    '7f000000-0000-4000-8000-000000000002',
    '{"document_type":"dni","document_number":"22000012","first_names":"Participante","last_names":"Pagado","email":"paid22@example.test","phone":"922000012","job_title":"Gerente","registration_type":"general"}'::jsonb
  )
);
reset role;

select is(
  (select count(*) from public.activity_virtual_reminders where registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free') and deleted_at is null),
  2::bigint,
  'confirmation schedules only sessions more than one hour away'
);
select is(
  (select count(*) from public.activity_virtual_reminders where registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid') and deleted_at is null),
  0::bigint,
  'paid preregistration does not schedule reminders'
);
select is(
  (select payload->>'virtual_access_url' from public.notification_outbox where event_type = 'activity_free_registration_confirmed' and related_entity_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free')),
  'https://meet.example.test/free',
  'free confirmation includes private access'
);
select ok(
  (select not (payload ? 'virtual_access_url') from public.notification_outbox where event_type = 'activity_paid_preregistration_created' and related_entity_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid')),
  'paid preregistration omits private access'
);
select is(
  (public.get_public_registration_result((select payload->>'registration_code' from hito_virtual_results where kind = 'free'))->>'virtual_access_url'),
  null::text,
  'code-only result never exposes virtual access'
);
select is(
  (public.get_public_registration_result_secure(
    (select payload->>'registration_code' from hito_virtual_results where kind = 'free'),
    (select (payload->>'certificate_request_token')::uuid from hito_virtual_results where kind = 'free')
  )->>'virtual_access_url'),
  'https://meet.example.test/free',
  'secure confirmed result exposes virtual access'
);
select is(
  public.get_public_registration_result_secure(
    (select payload->>'registration_code' from hito_virtual_results where kind = 'free'),
    '00000000-0000-4000-8000-000000000099'
  ),
  null::jsonb,
  'an incorrect token cannot recover virtual access'
);
select is(
  (public.get_public_registration_result_secure(
    (select payload->>'registration_code' from hito_virtual_results where kind = 'paid'),
    (select (payload->>'certificate_request_token')::uuid from hito_virtual_results where kind = 'paid')
  )->>'virtual_access_url'),
  null::text,
  'pending secure result does not expose virtual access'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select public.confirm_registration((select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid'));
reset role;

select is(
  (select count(*) from public.activity_virtual_reminders where registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid') and deleted_at is null),
  1::bigint,
  'paid confirmation schedules the hybrid session'
);
select is(
  (select payload->>'virtual_access_url' from public.notification_outbox where event_type = 'activity_paid_registration_confirmed' and related_entity_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid')),
  'https://meet.example.test/paid',
  'paid confirmation includes private access'
);
select is(
  (select payload->>'venue_name' from public.notification_outbox where event_type = 'activity_paid_registration_confirmed' and related_entity_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid')),
  'Auditorio Hito virtual',
  'hybrid confirmation includes its venue'
);
select is(
  (public.get_public_registration_result_secure(
    (select payload->>'registration_code' from hito_virtual_results where kind = 'paid'),
    (select (payload->>'certificate_request_token')::uuid from hito_virtual_results where kind = 'paid')
  )->>'virtual_access_url'),
  'https://meet.example.test/paid',
  'paid secure result exposes access only after confirmation'
);

select public.sync_activity_virtual_reminders('7f000000-0000-4000-8000-000000000001');
select public.sync_activity_virtual_reminders('7f000000-0000-4000-8000-000000000001');
select is(
  (select count(*) from public.activity_virtual_reminders where registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free') and deleted_at is null),
  2::bigint,
  'repeated synchronization remains idempotent'
);
select is(
  (select count(*)
   from public.notification_outbox notification
   join public.activity_virtual_reminders reminder on reminder.id = notification.related_entity_id
   where notification.event_type = 'activity_virtual_session_reminder'
     and notification.deleted_at is null
     and reminder.registration_id in (
       (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free'),
       (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid')
     )),
  3::bigint,
  'one outbox record exists per confirmed registration and session'
);

update public.activity_virtual_access
set virtual_url = 'https://meet.example.test/free-updated'
where activity_id = '7f000000-0000-4000-8000-000000000001';
select is(
  (select count(*)
   from public.notification_outbox notification
   join public.activity_virtual_reminders reminder on reminder.id = notification.related_entity_id
   where notification.event_type = 'activity_virtual_session_reminder'
     and notification.deleted_at is null
     and notification.payload->>'virtual_access_url' = 'https://meet.example.test/free-updated'
     and reminder.registration_id = (
       select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free'
     )),
  2::bigint,
  'pending reminders always use the latest virtual link'
);

update public.notification_outbox
set next_attempt_at = now() - interval '100 years'
where id = (
  select notification.id
  from public.notification_outbox notification
  join public.activity_virtual_reminders reminder on reminder.id = notification.related_entity_id
  where notification.event_type = 'activity_virtual_session_reminder'
    and reminder.registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'free')
    and notification.deleted_at is null
  order by reminder.session_starts_at
  limit 1
);
create temporary table claimed_virtual_reminders as
select * from public.claim_due_virtual_reminders(1);
select is((select count(*) from claimed_virtual_reminders), 1::bigint, 'scheduler claims one due reminder');
select is((select status from claimed_virtual_reminders limit 1), 'processing'::public.notification_status, 'claimed reminder enters processing');

set local session_replication_role = replica;
update public.notification_outbox
set updated_at = now() - interval '16 minutes'
where id = (select id from claimed_virtual_reminders);
set local session_replication_role = origin;
create temporary table reclaimed_virtual_reminders as
select * from public.claim_due_virtual_reminders(1);
select is((select count(*) from reclaimed_virtual_reminders), 1::bigint, 'scheduler recovers processing work stalled for fifteen minutes');

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select public.cancel_registration(nullif((select payload->>'registration_id' from hito_virtual_results where kind = 'paid'), '')::uuid, 'Prueba de cancelación');
reset role;
select is(
  (select count(*) from public.notification_outbox notification join public.activity_virtual_reminders reminder on reminder.id = notification.related_entity_id where reminder.registration_id = (select (payload->>'registration_id')::uuid from hito_virtual_results where kind = 'paid') and notification.event_type = 'activity_virtual_session_reminder' and notification.deleted_at is null),
  0::bigint,
  'cancelling a registration retires its pending reminders'
);
select is(
  (public.get_public_registration_result_secure(
    (select payload->>'registration_code' from hito_virtual_results where kind = 'paid'),
    (select (payload->>'certificate_request_token')::uuid from hito_virtual_results where kind = 'paid')
  )->>'virtual_access_url'),
  null::text,
  'a cancelled registration cannot recover virtual access'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8f000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select throws_ok(
  $$select public.save_activity(
    '{"id":"","type":"event","title":"Publicación sin enlace","slug":"publicacion-sin-enlace","description":"Actividad virtual publicada sin acceso.","modality":"virtual","is_free":true,"general_price":0,"member_price":0,"members_only":false,"certificate_mode":"none","certificate_general_price":0,"certificate_member_price":0,"status":"published","contact_id":"af000000-0000-4000-8000-000000000001"}'::jsonb,
    jsonb_build_array(jsonb_build_object('starts_at', now() + interval '2 days', 'sort_order', 0)),
    '[]'::jsonb
  )$$,
  '23514',
  'Indica el enlace virtual antes de publicar.',
  'published virtual activities require a private access link'
);
reset role;

select is(
  (select count(*) from public.activities where virtual_url is not null),
  0::bigint,
  'legacy public activity column stores no virtual links'
);

select * from finish(true);
rollback;
