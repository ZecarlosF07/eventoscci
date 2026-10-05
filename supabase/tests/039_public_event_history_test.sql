begin;
select plan(20);

insert into public.activity_contacts (id, label, contact_name, whatsapp_phone)
values ('ae000000-0000-4000-8000-000000000099', 'Contacto SEO temporal', 'Contacto temporal', '930000039');

insert into public.activities (
  id, contact_id, type, title, slug, description, modality, is_free,
  certificate_mode, status, published_at, is_listed, deleted_at
)
select ('ae000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'ae000000-0000-4000-8000-000000000099',
  case when n = 8 then 'training'::public.activity_type else 'event'::public.activity_type end,
  'SEO_TEST_20261005_ ' || n, 'seo-test-039-' || n,
  'Descripción de prueba temporal para el catálogo SEO.', 'virtual', true, 'none',
  case n when 4 then 'draft'::public.activity_status when 5 then 'archived'::public.activity_status
    when 7 then 'cancelled'::public.activity_status when 9 then 'finished'::public.activity_status
    else 'published'::public.activity_status end,
  now() - interval '40 days', n <> 3,
  case when n = 6 then now() else null end
from generate_series(1, 13) n;

insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order)
select ('ae000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  case when n = 10 then now() - interval '1 hour' else now() - interval '30 days 2 hours' end,
  case when n = 10 then now() + interval '1 hour' when n = 13 then null else now() - interval '30 days' end, 0
from generate_series(1, 13) n where n <> 11;

-- Session 2 keeps event 2 upcoming. A deleted future session must not keep event 12 upcoming.
insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order, deleted_at)
values ('ae000000-0000-4000-8000-000000000002', now() + interval '2 days', now() + interval '2 days 1 hour', 1, null),
  ('ae000000-0000-4000-8000-000000000012', now() + interval '2 days', now() + interval '2 days 1 hour', 1, now());

insert into public.activities (id, contact_id, type, title, slug, description, modality,
  is_free, certificate_mode, status, published_at)
select ('ae000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'ae000000-0000-4000-8000-000000000099', 'event', 'SEO_TEST_20261005_ ' || n,
  'seo-test-039-' || n, 'Descripción de prueba temporal para el historial.',
  'virtual', true, 'none', 'published', now() - interval '40 days'
from generate_series(30, 43) n;
insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order)
select ('ae000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  now() - interval '1 day' * (n - 29) - interval '1 hour',
  now() - interval '1 day' * (n - 29), 0
from generate_series(30, 43) n;

select throws_ok($$insert into public.activities(type, title, slug, description, modality, certificate_mode)
  values ('event', 'Slug reservado', 'realizados', 'Descripción temporal suficiente.', 'virtual', 'none')$$,
  '23514', null, 'la ruta realizados queda reservada también ante escrituras SQL');

set local role anon;
select is((public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_')->>'total')::int, 18, 'historial completo sin límite de diez días');
select is(jsonb_array_length(public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_')->'activity_ids'), 12, 'primera página de doce');
select is(jsonb_array_length(public.get_public_event_page(p_view => 'past', p_page => 2, p_query => 'SEO_TEST_20261005_')->'activity_ids'), 6, 'segunda página de seis');
select is(jsonb_array_length(public.get_public_event_page(p_view => 'past', p_page_size => 6, p_query => 'SEO_TEST_20261005_')->'activity_ids'), 6, 'vista previa de seis');
select is(public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_')->'activity_ids'->>0, 'ae000000-0000-4000-8000-000000000030', 'orden por fecha final real descendente');
select is((public.get_public_event_page(p_query => 'SEO_TEST_20261005_')->>'total')::int, 2, 'agenda incluye evento en curso y evento con sesiones futuras');
select is(public.get_public_event_page(p_query => 'SEO_TEST_20261005_')->'activity_ids'->>0, 'ae000000-0000-4000-8000-000000000010', 'evento en curso aparece primero');
select ok(not ((public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_')->'activity_ids') @> '["ae000000-0000-4000-8000-000000000002"]'), 'una sesión pendiente impide aparecer como realizado');
select is((public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_ 12')->>'total')::int, 1, 'ignora las sesiones eliminadas');
select is((public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_ 13')->>'total')::int, 1, 'usa inicio cuando no existe hora final');
select is((public.get_public_event_page(p_view => 'past', p_query => 'SEO_TEST_20261005_ 3')->>'total')::int, 10, 'búsqueda literal coincide con títulos públicos, no evento oculto');
select is((public.get_public_event_page(p_view => 'past', p_is_free => false, p_query => 'SEO_TEST_20261005_')->>'total')::int, 0, 'filtro de precio');
select is((public.get_public_event_page(p_view => 'past', p_modality => 'in_person', p_query => 'SEO_TEST_20261005_')->>'total')::int, 0, 'filtro de modalidad');
select is((public.get_public_event_page(p_view => 'past', p_date => current_date + 1, p_query => 'SEO_TEST_20261005_')->>'total')::int, 0, 'filtro de fecha no altera fin real');
select is((public.get_public_event_page(p_view => 'past', p_query => 'SEO_%')->>'total')::int, 0, 'porcentaje no actúa como comodín');
select is((public.get_public_event_page(p_view => 'past', p_page => 100, p_query => 'SEO_TEST_20261005_')->>'total')::int, 18, 'página fuera de rango conserva total');
select throws_ok($$select public.get_public_event_page(p_view => 'invalid')$$, '22023', 'INVALID_EVENT_PAGE', 'valida vista');
select throws_ok($$select public.get_public_event_page(p_page_size => 13)$$, '22023', 'INVALID_EVENT_PAGE', 'limita tamaño público');
select throws_ok($$select public.get_public_event_page(p_page => 0)$$, '22023', 'INVALID_EVENT_PAGE', 'valida página');
reset role;
select * from finish(true);
rollback;
