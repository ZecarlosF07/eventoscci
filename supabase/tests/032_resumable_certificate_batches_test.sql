begin;
select plan(17);
create temporary table batch32_results (result text not null);
create temporary table batch32_state (batch_id uuid, claim jsonb, old_claim jsonb);
grant select, insert, update on batch32_results, batch32_state to authenticated;

insert into auth.users (id, email) values ('8b320000-0000-4000-8000-000000000001', 'cert-admin-32@example.test');
insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title) values
 ('3b320000-0000-4000-8000-000000000001', 'dni', '32000001', 'Admin', 'Lotes', 'cert-admin-32@example.test', '932000001', 'Administrador'),
 ('3b320000-0000-4000-8000-000000000002', 'dni', '32000002', 'Primera', 'Persona', 'cert-one-32@example.test', '932000002', 'Participante'),
 ('3b320000-0000-4000-8000-000000000003', 'dni', '32000003', 'Segunda', 'Persona', 'cert-two-32@example.test', '932000003', 'Participante');
insert into public.user_accounts (user_id, person_id, role) values
 ('8b320000-0000-4000-8000-000000000001', '3b320000-0000-4000-8000-000000000001', 'administrator');
insert into public.activities (id, type, title, slug, description, modality, is_free, general_price, member_price,
 certificate_mode, certificate_general_price, certificate_member_price, maps_embed_url, contact_phone, status, published_at)
values ('7b320000-0000-4000-8000-000000000001', 'training', 'Certificación lote 32', 'cert-lote-32',
 'Prueba recuperable.', 'in_person', true, 0, 0, 'included', 0, 0,
 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now());
insert into public.registrations (id, activity_id, person_id, registration_code, status, confirmed_at, job_title_snapshot) values
 ('6b320000-0000-4000-8000-000000000002', '7b320000-0000-4000-8000-000000000001', '3b320000-0000-4000-8000-000000000002', 'CCI-32-000002', 'confirmed', now(), 'Participante'),
 ('6b320000-0000-4000-8000-000000000003', '7b320000-0000-4000-8000-000000000001', '3b320000-0000-4000-8000-000000000003', 'CCI-32-000003', 'confirmed', now(), 'Participante');
insert into public.attendance (registration_id, status, marked_at) values
 ('6b320000-0000-4000-8000-000000000002', 'attended', now()),
 ('6b320000-0000-4000-8000-000000000003', 'attended', now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
select public.prepare_activity_certificates(array['6b320000-0000-4000-8000-000000000002'::uuid],
 'c5000000-0000-4000-8000-000000000001', 'Participó');
insert into batch32_results select is(public.count_recoverable_activity_certificates('7b320000-0000-4000-8000-000000000001'), 1,
 'legacy unfinalized certificate is visible');
insert into batch32_state(batch_id) select public.start_activity_certificate_batch('7b320000-0000-4000-8000-000000000001',
 'c5000000-0000-4000-8000-000000000001', 'Participó');
insert into batch32_results select is((public.get_activity_certificate_batch('7b320000-0000-4000-8000-000000000001')->>'total')::integer,
 2, 'batch contains legacy and new ready registration');
insert into batch32_results select is(public.start_activity_certificate_batch('7b320000-0000-4000-8000-000000000001',
 'c5000000-0000-4000-8000-000000000001', 'Participó'), (select batch_id from batch32_state), 'repeated start returns same open batch');
reset role;
update public.certificate_issue_batch_items set updated_at = now() - interval '1 minute'
where batch_id = (select batch_id from batch32_state)
  and registration_id = '6b320000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
update batch32_state set claim = public.claim_activity_certificate_batch_item(batch_id);
insert into batch32_results select is(claim->>'registration_id', '6b320000-0000-4000-8000-000000000002', 'legacy certificate claimed first') from batch32_state;
insert into batch32_results select is(public.claim_activity_certificate_batch_item((select batch_id from batch32_state))::text,
 null::text, 'concurrent claim cannot take second item while first lease active');
insert into batch32_results select is(public.finish_activity_certificate_batch_item((select (claim->>'item_id')::uuid from batch32_state),
 gen_random_uuid(), 'issued'), false, 'wrong token cannot finish item');
update batch32_state set old_claim = claim;
reset role;
update public.certificate_issue_batch_items set lease_until = now() - interval '1 second'
where id = (select (claim->>'item_id')::uuid from batch32_state);
update public.certificate_issue_batch_items set state = 'blocked', last_error = 'fixture temporal'
where batch_id = (select batch_id from batch32_state)
  and registration_id = '6b320000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
update batch32_state set claim = public.claim_activity_certificate_batch_item(batch_id);
insert into batch32_results select is(claim->>'item_id', old_claim->>'item_id', 'expired lease reclaims same item') from batch32_state;
insert into batch32_results select is(public.finish_activity_certificate_batch_item((old_claim->>'item_id')::uuid,
 (old_claim->>'lease_token')::uuid, 'issued'), false, 'expired worker cannot finish after new claim') from batch32_state;
insert into batch32_results select is(public.finalize_activity_certificate_batch_item(
 (select (claim->>'item_id')::uuid from batch32_state), (select (claim->>'lease_token')::uuid from batch32_state),
 (select id from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000002' and deleted_at is null),
 (select 'issued/' || id::text || '/' || (select claim->>'lease_token' from batch32_state) || '.pdf'
  from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000002' and deleted_at is null),
 'https://example.test'), true, 'legacy certificate finalized with its existing code');
insert into batch32_results select is(public.finalize_activity_certificate_batch_item(
 (select (claim->>'item_id')::uuid from batch32_state), (select (claim->>'lease_token')::uuid from batch32_state),
 (select id from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000002' and deleted_at is null),
 (select 'issued/' || id::text || '/' || (select claim->>'lease_token' from batch32_state) || '.pdf'
  from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000002' and deleted_at is null),
 'https://example.test'), false, 'repeating finalization cannot duplicate its side effects');
insert into batch32_results select is((select count(*) from public.notification_outbox n
 join public.certificates c on c.id = n.related_entity_id
 where c.registration_id = '6b320000-0000-4000-8000-000000000002' and n.event_type = 'activity_certificate_issued'),
 1::bigint, 'finalization queues one notification');
reset role;
update public.certificate_issue_batch_items set state = 'pending', last_error = null
where batch_id = (select batch_id from batch32_state)
  and registration_id = '6b320000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
update batch32_state set claim = public.claim_activity_certificate_batch_item(batch_id);
insert into batch32_results select is(claim->>'registration_id', '6b320000-0000-4000-8000-000000000003', 'next registration claimed') from batch32_state;
select public.prepare_activity_certificates(array['6b320000-0000-4000-8000-000000000003'::uuid],
 'c5000000-0000-4000-8000-000000000001', 'Participó');

reset role;
update public.attendance set status = 'absent' where registration_id = '6b320000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
do $$ declare v_rejected boolean := false;
begin
  begin
    perform public.finalize_activity_certificate_batch_item(
      (select (claim->>'item_id')::uuid from batch32_state),
      (select (claim->>'lease_token')::uuid from batch32_state),
      (select id from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000003' and deleted_at is null),
      (select 'issued/' || id::text || '/' || (select claim->>'lease_token' from batch32_state) || '.pdf'
        from public.certificates where registration_id = '6b320000-0000-4000-8000-000000000003' and deleted_at is null),
      'https://example.test');
  exception when sqlstate 'P0001' then v_rejected := true;
  end;
  insert into batch32_results select ok(v_rejected, 'finalization rechecks entitlement after attendance changes');
end $$;
reset role;
insert into batch32_results select is(public.activity_certificate_batch_eligible('6b320000-0000-4000-8000-000000000003'), false,
 'eligibility changed after claim');
set local role authenticated;
select set_config('request.jwt.claim.sub', '8b320000-0000-4000-8000-000000000001', true);
insert into batch32_results select is(public.finish_activity_certificate_batch_item((select (claim->>'item_id')::uuid from batch32_state),
 (select (claim->>'lease_token')::uuid from batch32_state), 'blocked', 'Asistencia modificada'), true,
 'ineligible item is blocked without certificate');
insert into batch32_results select is((public.get_activity_certificate_batch('7b320000-0000-4000-8000-000000000001')->>'blocked')::integer,
 1, 'batch exposes blocked count');
insert into batch32_results select is(public.count_recoverable_activity_certificates('7b320000-0000-4000-8000-000000000001'),
 0, 'blocked ineligible legacy certificate does not offer endless new batches');

reset role;
do $$ begin
  if (select count(*) from batch32_results) <> 17
    or exists (select 1 from batch32_results where result not like 'ok %')
  then raise exception 'RESUMABLE_CERTIFICATE_BATCH_TEST_FAILED'; end if;
end $$;
select * from finish();
rollback;
