begin;
select no_plan();

select ok((select relrowsecurity from pg_class where oid = 'public.individual_registration_payments'::regclass), 'individual payments have RLS');
select is(has_table_privilege('anon', 'public.participation_payment_requests', 'SELECT'), false, 'anonymous cannot read payments');
select is(has_table_privilege('authenticated', 'public.individual_registration_payments', 'INSERT'), false, 'no direct payment writes');
select is(has_function_privilege('anon', 'public.verify_individual_registration_payment(uuid,numeric,text,text,uuid)', 'EXECUTE'), false, 'anonymous cannot validate individual payments');

insert into auth.users(id,email) values ('28000000-0000-4000-8000-000000000040','admin28@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('28000000-0000-4000-8000-000000000041','dni','28100041','Admin','Pagos','admin28@example.test','928000041','Administradora');
insert into public.user_accounts(user_id,person_id,role)
values ('28000000-0000-4000-8000-000000000040','28000000-0000-4000-8000-000000000041','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,members_only,
  status,published_at,payment_note,contact_phone,maps_embed_url,certificate_mode,certificate_general_price,certificate_member_price)
values
 ('28000000-0000-4000-8000-000000000001','event','Pagos prueba','pagos-prueba-28','Prueba','in_person',false,60,40,false,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=28','optional_paid',20,10),
 ('28000000-0000-4000-8000-000000000002','event','Grupos prueba','grupos-prueba-28','Prueba','in_person',false,40,40,false,'published',now(),'Coordina el pago','900000002','https://www.google.com/maps/embed?pb=28','none',0,0),
 ('28000000-0000-4000-8000-000000000003','training','Sesiones prueba','sesiones-prueba-28','Prueba','in_person',true,0,0,false,'published',now(),null,'900000003','https://www.google.com/maps/embed?pb=28','none',0,0),
 ('28000000-0000-4000-8000-000000000004','event','Carga prueba','carga-prueba-28','Prueba','in_person',false,40,40,false,'published',now(),'Coordina el pago','900000004','https://www.google.com/maps/embed?pb=28','none',0,0);

insert into public.activity_dates(activity_id,starts_at,ends_at) values
 ('28000000-0000-4000-8000-000000000001',now()-interval '1 hour',now()+interval '1 hour'),
 ('28000000-0000-4000-8000-000000000003',now()-interval '2 days',now()-interval '1 day'),
 ('28000000-0000-4000-8000-000000000003',now()+interval '2 days',null);
select is((select is_operational_upcoming from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000001'),true,'event in progress remains operational');
select is((select next_date is null from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000001'),true,'next_date keeps its original meaning');
select is((select operational_ends_at from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000003'),
  (((now()+interval '2 days') at time zone 'America/Lima')::date+1)::timestamp at time zone 'America/Lima','missing end uses next Lima midnight');
select is((select is_operational_upcoming from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000002'),false,'no dates is not upcoming');

set local role anon;
select public.register_activity('28000000-0000-4000-8000-000000000001',
 '{"document_type":"dni","document_number":"28100001","first_names":"Ana","last_names":"Pagos","email":"ana28@example.test","phone":"928000001","job_title":"Gerente","registration_type":"general","request_certificate":true}'::jsonb);
reset role;
create temporary table payment28_refs as select id from public.registrations where activity_id='28000000-0000-4000-8000-000000000001';
grant select on payment28_refs to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000040',true);
select throws_ok($$select public.confirm_registration((select id from payment28_refs))$$,'P0001','INDIVIDUAL_CONFIRMATION_REQUIRES_PAYMENT_OPERATION','old confirmation cannot skip ledger');
select throws_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),30,'OP28',null,'28000000-0000-4000-8000-000000000050')$$,'P0001','PAYMENT_AMOUNT_MISMATCH','partial individual payment rejected');
select throws_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'',null,'28000000-0000-4000-8000-000000000050')$$,'22023','VALIDATION_ERROR','reference required');
select throws_ok($$select public.verify_activity_certificate_payment((select id from payment28_refs))$$,'P0001','REGISTRATION_NOT_CONFIRMED','certificate payment requires confirmed participation');
select lives_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'OP28','Verificado','28000000-0000-4000-8000-000000000050')$$,'exact individual payment succeeds');
select lives_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'OP28','Verificado','28000000-0000-4000-8000-000000000050')$$,'same retry succeeds');
select throws_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'OTRA','Verificado','28000000-0000-4000-8000-000000000050')$$,'P0001','IDEMPOTENCY_KEY_REUSED','different payload with same key rejected');
select throws_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'OTRA',null,'28000000-0000-4000-8000-000000000051')$$,'P0001','INVALID_PAYMENT_SELECTION','second payment for the same seat rejected');
select is((select count(*) from public.individual_registration_payments where registration_id=(select id from payment28_refs)),1::bigint,'one ledger entry');
select is((select count(*) from public.notification_outbox where related_entity_id=(select id from payment28_refs) and event_type='activity_paid_registration_confirmed'),1::bigint,'one confirmation email queued');
select is((select count(*) from public.audit_logs where entity_id in(select id from public.individual_registration_payments where registration_id=(select id from payment28_refs)) and action='registration.individual_payment_verified'),1::bigint,'payment audit once');
select is((select pending_amount from public.participation_payment_requests where id=(select id from payment28_refs)),0::numeric,'participation balance cleared');
select is((select validated_amount from public.participation_payment_requests where id=(select id from payment28_refs)),60::numeric,'validated receipt remains visible');
select is((select pending_amount from public.certificate_payment_requests where id=(select id from payment28_refs)),20::numeric,'certificate balance is separate');
select lives_ok($$select public.verify_activity_certificate_payment((select id from payment28_refs))$$,'existing certificate validation works');
select lives_ok($$select public.revert_activity_certificate_payment((select id from payment28_refs),'Corrección de prueba')$$,'certificate reversal still works');
reset role;

insert into public.member_companies(ruc,legal_name) values ('20888888881','Empresa Grupo 28');
-- Individual history created before the event became exclusive.
insert into public.registrations(activity_id,person_id,registration_code,price_snapshot,job_title_snapshot)
values ('28000000-0000-4000-8000-000000000002','28000000-0000-4000-8000-000000000041','CCI-28-LEGACY',40,'Administradora');
update public.activities set members_only=true,general_price=0,member_free_passes_per_company=1 where id='28000000-0000-4000-8000-000000000002';
set local role anon;
select public.register_member_group('28000000-0000-4000-8000-000000000002',
 '{"ruc":"20888888881","expected_free_count":1,"billing":{"type":"factura","document":"20888888882","name":"Facturación distinta","address":"Calle Prueba"},"attendees":[{"document_type":"dni","document_number":"28100002","first_names":"Bea","last_names":"Grupo","email":"bea28@example.test","phone":"928000002","job_title":"Gerente"},{"document_type":"dni","document_number":"28100003","first_names":"Carla","last_names":"Grupo","email":"carla28@example.test","phone":"928000003","job_title":"Gerente"},{"document_type":"dni","document_number":"28100004","first_names":"Dora","last_names":"Grupo","email":"dora28@example.test","phone":"928000004","job_title":"Gerente"}]}'::jsonb,
 '28000000-0000-4000-8000-000000000060');
reset role;
select is((select payment_pending_requests from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000002'),2,'group counts once plus legacy individual');
select is((select payment_pending_seats from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000002'),3,'three paid seats excluding courtesy');
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000002' and pending_count>0),2::bigint,'counter and list agree');
select is((select pending_amount from public.activity_payment_totals where activity_id='28000000-0000-4000-8000-000000000002'),120::numeric,'complete balance excludes courtesy');
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000002' and search_text ilike '%20888888882%'),1::bigint,'billing RUC searchable');
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.verify_member_group_payment(
 (select id from public.member_group_requests where activity_id='28000000-0000-4000-8000-000000000002'),
 array(select id from public.registrations where activity_id='28000000-0000-4000-8000-000000000002' and member_group_request_id is not null and status='pending' order by registration_code limit 1),
 'OP-GR28',40,null,'28000000-0000-4000-8000-000000000061')$$,'partial payment by whole seat remains supported');
select is((select pending_amount from public.activity_payment_totals where activity_id='28000000-0000-4000-8000-000000000002'),80::numeric,'partial group balance updates');
reset role;

-- A legacy individual registration in the same activity as a group is not lost.
select is((select payment_pending_requests from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000002'),2,'mixed activity counts individual plus group');
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000002' and pending_count>0),2::bigint,'mixed list matches badge');
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.verify_individual_registration_payment((select id from public.registrations where registration_code='CCI-28-LEGACY'),40,'LEGADO28',null,'28000000-0000-4000-8000-000000000075')$$,'legacy individual remains payable after exclusivity changes');
reset role;

-- More than 100 requests per activity and more than 1000 activities aggregate in SQL.
insert into public.people(document_type,document_number,first_names,last_names,email,phone,job_title)
select 'dni',(28200000+n)::text,'Persona','Carga '||n,'carga28-'||n||'@example.test','928000000','Gerente' from generate_series(1,105) n;
insert into public.registrations(activity_id,person_id,registration_code,price_snapshot,job_title_snapshot)
select a.id,p.id,'CCI-28-'||a.slug||'-'||p.document_number,40,'Gerente' from public.activities a cross join public.people p
where a.id in ('28000000-0000-4000-8000-000000000001','28000000-0000-4000-8000-000000000004','28000000-0000-4000-8000-000000000003')
  and p.document_number::text between '28200001' and '28200105';
select ok((select bool_and(total>100) from (select count(*) as total from public.participation_payment_requests where activity_id in
 ('28000000-0000-4000-8000-000000000001','28000000-0000-4000-8000-000000000004','28000000-0000-4000-8000-000000000003') group by activity_id) counts),'three activities exceed 100 requests');
select is((select count(*) from (select id from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000003' order by created_at,id limit 20 offset 100) page),5::bigint,'final page contains five of 105 requests');
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000003' and search_text ilike '%28200105%'),1::bigint,'search includes document beyond first pages');
update public.registrations set deleted_at=now() where activity_id='28000000-0000-4000-8000-000000000003'
  and person_id=(select id from public.people where document_number='28200105');
select is((select payment_pending_requests from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000003'),104,'deleted seat excluded from badge');
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000003'),104::bigint,'deleted seat excluded from list');
update public.registrations set status='cancelled',cancelled_at=now() where activity_id='28000000-0000-4000-8000-000000000003'
  and person_id=(select id from public.people where document_number='28200104');
select is((select payment_pending_requests from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000003'),103,'cancelled seat excluded from balance');
update public.people set deleted_at=now() where document_number='28200103';
select is((select payment_pending_requests from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000003'),102,'deleted participant excluded from balance');
insert into public.registrations(activity_id,person_id,registration_code,price_snapshot,job_title_snapshot,status,confirmed_at)
values ('28000000-0000-4000-8000-000000000004','28000000-0000-4000-8000-000000000041','CCI-28-HISTORICAL-CONFIRMED',40,'Administradora','confirmed',now());
select is((select legacy_amount from public.participation_payment_requests where code='CCI-28-HISTORICAL-CONFIRMED'),40::numeric,'legacy confirmation has explicit historical amount');
select is((select validated_amount from public.participation_payment_requests where code='CCI-28-HISTORICAL-CONFIRMED'),0::numeric,'historical confirmation does not invent a payment');
update public.activities set status='archived' where id='28000000-0000-4000-8000-000000000004';
select is((select count(*) from public.participation_payment_requests where activity_id='28000000-0000-4000-8000-000000000004'),0::bigint,'archived activity absent from payment list');
select is((select count(*) from public.activity_payment_totals where activity_id='28000000-0000-4000-8000-000000000004'),0::bigint,'archived activity absent from balances');
insert into public.activities(type,title,slug,description,modality,is_free,status)
select 'event','Carga global '||n,'carga-global-28-'||n,'Prueba','in_person',true,'draft' from generate_series(1,1005) n;
select is((select pending from public.participation_global_metrics),(select sum(payment_pending_seats) from public.activity_participation_summary),'global metrics aggregate all activities');

update public.activities set status='finished' where id='28000000-0000-4000-8000-000000000001';
select is((select is_operational_upcoming from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000001'),false,'finished activities not upcoming');
select ok((select payment_pending_requests>0 from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000001'),'finished activity retains payable balance');
-- Recreate a valid final session at the exact current instant.
update public.activity_dates set starts_at=now()-interval '1 hour', ends_at=now() where activity_id='28000000-0000-4000-8000-000000000003';
select is((select is_operational_upcoming from public.activity_participation_summary where activity_id='28000000-0000-4000-8000-000000000003'),false,'exact end is no longer upcoming');
set local role authenticated;
select set_config('request.jwt.claim.sub','28000000-0000-4000-8000-000000000041',true);
select is((select count(*) from public.individual_registration_payments),0::bigint,'unprivileged identity cannot read payments');
select throws_ok($$select public.verify_individual_registration_payment((select id from payment28_refs),60,'OP28',null,'28000000-0000-4000-8000-000000000070')$$,'42501','UNAUTHORIZED','unprivileged user cannot validate payments');
reset role;
select * from finish(true);
rollback;
