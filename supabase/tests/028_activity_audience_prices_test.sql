begin;

select plan(6);

select ok(exists (select 1 from pg_constraint where conname = 'activities_exclusive_general_price_zero'),
  'exclusive activities have no general tariff');
select ok(exists (select 1 from pg_constraint where conname = 'activities_published_paid_prices_positive'),
  'published paid activities require positive enabled tariffs');

insert into public.venues(id, name, address, maps_embed_url)
values ('28000000-0000-4000-8000-000000000001', 'Sede de prueba de tarifas', 'Calle Uno',
  'https://www.google.com/maps/embed?pb=audience-price');
insert into public.activity_contacts(id, label, contact_name, whatsapp_phone)
values ('28000000-0000-4000-8000-000000000002', 'Contacto de prueba de tarifas', 'CCI', '900000028');

select lives_ok($$insert into public.activities
  (type, title, slug, description, modality, members_only, general_price, member_price, status)
  values ('training', 'Borrador exclusivo', 'borrador-exclusivo-precio', 'Prueba de precio.',
  'in_person', true, 0, 0, 'draft')$$, 'exclusive drafts may have zero member price');

select throws_ok($$insert into public.activities
  (type, title, slug, description, modality, members_only, general_price, member_price, status)
  values ('training', 'Borrador exclusivo inválido', 'borrador-exclusivo-general', 'Prueba de precio.',
  'in_person', true, 20, 30, 'draft')$$, '23514',
  'new row for relation "activities" violates check constraint "activities_exclusive_general_price_zero"',
  'exclusive drafts cannot store a general tariff');

select throws_ok($$insert into public.activities
  (type, title, slug, description, modality, venue_id, contact_id, payment_note,
   is_free, general_price, member_price, status)
  values ('event', 'Publicado sin tarifa general', 'publicado-sin-tarifa-general', 'Prueba de precio.',
  'in_person', '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002', 'Coordina el pago con CCI.',
  false, 0, 30, 'published')$$, '23514',
  'new row for relation "activities" violates check constraint "activities_published_paid_prices_positive"',
  'published open paid events require a general tariff');

select throws_ok($$insert into public.activities
  (type, title, slug, description, modality, venue_id, contact_id, payment_note,
   is_free, members_only, general_price, member_price, status)
  values ('training', 'Publicado sin tarifa asociada', 'publicado-sin-tarifa-asociada', 'Prueba de precio.',
  'in_person', '28000000-0000-4000-8000-000000000001',
  '28000000-0000-4000-8000-000000000002', 'Coordina el pago con CCI.',
  false, true, 0, 0, 'published')$$, '23514',
  'new row for relation "activities" violates check constraint "activities_published_paid_prices_positive"',
  'published exclusive paid trainings require a member tariff');

select * from finish(true);
rollback;
