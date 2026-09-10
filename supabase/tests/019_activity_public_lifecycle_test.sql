begin;

select plan(4);

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone
) values (
  '9a000000-0000-4000-8000-000000000001',
  'Contacto temporal de ciclo público',
  'Contacto temporal',
  '930000019'
);

insert into public.activities (
  id, contact_id, type, title, slug, description, modality, is_free, status, published_at
) values
  (
    '9a000000-0000-4000-8000-000000000002',
    '9a000000-0000-4000-8000-000000000001',
    'event',
    'Actividad temporal finalizada',
    'actividad-temporal-finalizada-019',
    'Actividad para comprobar el cierre automático de inscripciones.',
    'virtual',
    true,
    'published',
    now() - interval '2 days'
  ),
  (
    '9a000000-0000-4000-8000-000000000003',
    '9a000000-0000-4000-8000-000000000001',
    'event',
    'Actividad temporal futura',
    'actividad-temporal-futura-019',
    'Actividad para comprobar que las inscripciones futuras continúan abiertas.',
    'virtual',
    true,
    'published',
    now()
  );

insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order)
values
  (
    '9a000000-0000-4000-8000-000000000002',
    now() - interval '2 hours',
    now() - interval '1 hour',
    0
  ),
  (
    '9a000000-0000-4000-8000-000000000003',
    now() + interval '1 day',
    now() + interval '1 day 2 hours',
    0
  );

select is(
  public.get_activity_registration_availability('9a000000-0000-4000-8000-000000000002')->>'reason',
  'finished',
  'a past activity reports a finished state'
);

select is(
  (public.get_activity_registration_availability('9a000000-0000-4000-8000-000000000002')->>'is_open')::boolean,
  false,
  'a past activity does not accept registrations'
);

select throws_ok(
  $$select public.register_activity('9a000000-0000-4000-8000-000000000002', '{}'::jsonb)$$,
  'P0001',
  'REGISTRATION_CLOSED',
  'the public RPC blocks a direct registration after the activity ends'
);

select is(
  public.get_activity_registration_availability('9a000000-0000-4000-8000-000000000003')->>'reason',
  'available',
  'a future published activity remains available'
);

select * from finish(true);

rollback;
