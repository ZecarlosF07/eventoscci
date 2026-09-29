begin;

select plan(6);
create temporary table certificate_bulk_check_results (result text not null);
grant select, insert on certificate_bulk_check_results to authenticated;

insert into auth.users (id, email) values
  ('8b310000-0000-4000-8000-000000000001', 'cert-admin-31@example.test');
insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title) values
  ('3b310000-0000-4000-8000-000000000001', 'dni', '31000001', 'Admin', 'Certificados', 'cert-admin-31@example.test', '931000001', 'Administrador'),
  ('3b310000-0000-4000-8000-000000000002', 'dni', '31000002', 'Certificado', 'Opcional', 'cert-optional-31@example.test', '931000002', 'Participante'),
  ('3b310000-0000-4000-8000-000000000003', 'dni', '31000003', 'Certificado', 'Incluido', 'cert-included-31@example.test', '931000003', 'Participante');
insert into public.user_accounts (user_id, person_id, role) values
  ('8b310000-0000-4000-8000-000000000001', '3b310000-0000-4000-8000-000000000001', 'administrator');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price, member_price,
  certificate_mode, certificate_general_price, certificate_member_price,
  maps_embed_url, contact_phone, status, published_at
) values
  ('7b310000-0000-4000-8000-000000000001', 'training', 'Certificación opcional 31', 'cert-opcional-31', 'Prueba de elegibilidad.', 'in_person', true, 0, 0, 'optional_paid', 40, 30, 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now()),
  ('7b310000-0000-4000-8000-000000000002', 'training', 'Certificación incluida 31', 'cert-incluida-31', 'Prueba de elegibilidad.', 'in_person', true, 0, 0, 'included', 0, 0, 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now());

insert into public.registrations (id, activity_id, person_id, registration_code, status, confirmed_at, job_title_snapshot) values
  ('6b310000-0000-4000-8000-000000000002', '7b310000-0000-4000-8000-000000000001', '3b310000-0000-4000-8000-000000000002', 'CCI-31-000002', 'confirmed', now(), 'Participante'),
  ('6b310000-0000-4000-8000-000000000003', '7b310000-0000-4000-8000-000000000002', '3b310000-0000-4000-8000-000000000003', 'CCI-31-000003', 'confirmed', now(), 'Participante');
insert into public.attendance (registration_id, status, marked_at) values
  ('6b310000-0000-4000-8000-000000000002', 'attended', now()),
  ('6b310000-0000-4000-8000-000000000003', 'attended', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b310000-0000-4000-8000-000000000001', true);

insert into certificate_bulk_check_results select is(
  jsonb_array_length(public.prepare_activity_certificates(array['6b310000-0000-4000-8000-000000000002'::uuid], 'c5000000-0000-4000-8000-000000000001', 'Participó')->'prepared'),
  0, 'optional certificate cannot be issued before request');
insert into certificate_bulk_check_results select is((select count(*) from public.certificates where registration_id = '6b310000-0000-4000-8000-000000000002'), 0::bigint,
  'unrequested certificate has no certificate row');

reset role;
update public.registrations set certificate_requested_at = now()
where id = '6b310000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b310000-0000-4000-8000-000000000001', true);
insert into certificate_bulk_check_results select is(
  jsonb_array_length(public.prepare_activity_certificates(array['6b310000-0000-4000-8000-000000000002'::uuid], 'c5000000-0000-4000-8000-000000000001', 'Participó')->'prepared'),
  0, 'request alone cannot bypass certificate payment');

reset role;
update public.registrations set certificate_payment_verified_at = now(), certificate_payment_verified_by = '8b310000-0000-4000-8000-000000000001'
where id = '6b310000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b310000-0000-4000-8000-000000000001', true);
insert into certificate_bulk_check_results select is(
  jsonb_array_length(public.prepare_activity_certificates(array['6b310000-0000-4000-8000-000000000002'::uuid], 'c5000000-0000-4000-8000-000000000001', 'Participó')->'prepared'),
  1, 'verified payment allows optional certificate');
insert into certificate_bulk_check_results select is(
  jsonb_array_length(public.prepare_activity_certificates(array['6b310000-0000-4000-8000-000000000003'::uuid], 'c5000000-0000-4000-8000-000000000001', 'Participó')->'prepared'),
  1, 'included certificate does not require separate payment');
insert into certificate_bulk_check_results select is(
  jsonb_array_length(public.prepare_activity_certificates(array['6b310000-0000-4000-8000-000000000002'::uuid], 'c5000000-0000-4000-8000-000000000001', 'Participó')->'existing'),
  1, 'retry returns the existing certificate without duplication');

do $$
begin
  if (select count(*) from certificate_bulk_check_results) <> 6
    or exists (select 1 from certificate_bulk_check_results where result not like 'ok %')
  then raise exception 'CERTIFICATE_BULK_TEST_FAILED'; end if;
end;
$$;
select * from finish();
rollback;
