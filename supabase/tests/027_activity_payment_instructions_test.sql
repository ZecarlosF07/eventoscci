begin;

select plan(11);
set constraints validate_activity_payment_note immediate;

select ok(exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'activities' and column_name = 'payment_note'
), 'activities store public payment instructions');

insert into public.venues(id, name, address, maps_embed_url)
values ('27000000-0000-4000-8000-000000000001', 'Sede de prueba pago', 'Calle Uno', 'https://www.google.com/maps/embed?pb=payment-note');
insert into public.activity_contacts(id, label, contact_name, whatsapp_phone)
values ('27000000-0000-4000-8000-000000000002', 'Contacto prueba pago', 'CCI', '900000027');

insert into public.activities (
  id, type, title, slug, description, modality, venue_id, contact_id,
  is_free, general_price, member_price, status, published_at, payment_note
) values (
  '27000000-0000-4000-8000-000000000003', 'event', 'Evento de pago válido',
  'evento-pago-instrucciones', 'Descripción de prueba.', 'in_person',
  '27000000-0000-4000-8000-000000000001', '27000000-0000-4000-8000-000000000002',
  false, 50, 30, 'published', now(), 'Coordina el pago con la CCI.'
);
select is((select payment_note from public.activities where id = '27000000-0000-4000-8000-000000000003'),
  'Coordina el pago con la CCI.', 'published paid event retains its instructions');

select lives_ok($$insert into public.activities (
  type, title, slug, description, modality, venue_id, contact_id,
  is_free, general_price, member_price, status, published_at, payment_note
) values ('training', 'Capacitación de pago válida', 'capacitacion-pago-instrucciones',
  'Descripción de prueba.', 'in_person',
  '27000000-0000-4000-8000-000000000001', '27000000-0000-4000-8000-000000000002',
  false, 50, 30, 'published', now(), 'Transferencia coordinada con la CCI.')$$,
  'published paid training accepts instructions');

select throws_ok($$insert into public.activities (
  type, title, slug, description, modality, venue_id, contact_id,
  is_free, general_price, member_price, status, published_at
) values ('event', 'Evento sin nota', 'evento-pago-sin-nota', 'Descripción de prueba.',
  'in_person', '27000000-0000-4000-8000-000000000001',
  '27000000-0000-4000-8000-000000000002', false, 50, 30, 'published', now())$$,
  '23514', 'Indica cómo realizar el pago antes de publicar.',
  'published paid event cannot omit instructions');

select throws_ok($$update public.activities set payment_note = null
  where id = '27000000-0000-4000-8000-000000000003'$$,
  '23514', 'Indica cómo realizar el pago antes de publicar.',
  'direct updates cannot remove payment instructions from published paid activity');

select lives_ok($$insert into public.activities (
  type, title, slug, description, modality, is_free, general_price, member_price, status
) values ('event', 'Borrador pagado', 'borrador-pago-sin-nota', 'Descripción de prueba.',
  'in_person', false, 50, 30, 'draft')$$,
  'paid draft may omit payment instructions');

select throws_ok($$insert into public.activities (
  type, title, slug, description, modality, is_free, general_price, member_price, status, payment_note
) values ('event', 'Gratuito con nota', 'gratuito-con-nota', 'Descripción de prueba.',
  'in_person', true, 0, 0, 'draft', 'No corresponde')$$,
  '23514', 'Una actividad gratuita no puede tener indicaciones de pago.',
  'free activity cannot retain payment instructions');

select throws_ok($$update public.activities set payment_note = repeat('x', 601)
  where id = '27000000-0000-4000-8000-000000000003'$$,
  '23514', 'new row for relation "activities" violates check constraint "activities_payment_note_length"',
  'payment instructions respect the length limit');

select lives_ok($$update public.activities set is_free = true, general_price = 0,
  member_price = 0, payment_note = null
  where id = '27000000-0000-4000-8000-000000000003'$$,
  'paid activity may become free when the note is cleared');

insert into auth.users (id, email)
values ('27000000-0000-4000-8000-000000000010', 'admin27@example.test');
insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '27000000-0000-4000-8000-000000000011', 'dni', '27000011', 'Admin', 'Pruebas',
  'admin27@example.test', '927000011', 'Administradora'
);
insert into public.user_accounts(user_id, person_id, role)
values ('27000000-0000-4000-8000-000000000010', '27000000-0000-4000-8000-000000000011', 'administrator');

set local role authenticated;
select set_config('request.jwt.claim.sub', '27000000-0000-4000-8000-000000000010', true);
select lives_ok($$select public.save_activity(
  '{"type":"event","title":"Borrador con pago","slug":"borrador-con-pago","description":"Actividad de prueba con nota de pago.","modality":"in_person","is_free":false,"general_price":50,"member_price":30,"status":"draft","payment_note":"Coordina el pago con la CCI."}'::jsonb,
  jsonb_build_array(jsonb_build_object('starts_at', now() + interval '2 days', 'sort_order', 0)),
  '[]'::jsonb
)$$, 'save_activity stores payment guidance');
reset role;
select is((select payment_note from public.activities where slug = 'borrador-con-pago'),
  'Coordina el pago con la CCI.', 'save_activity persisted the note');

select * from finish(true);
rollback;
