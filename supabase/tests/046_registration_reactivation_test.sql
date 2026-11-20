begin;
select no_plan();

insert into auth.users(id,email) values
 ('46000000-0000-4000-8000-000000000001','admin46@example.test'),
 ('46000000-0000-4000-8000-000000000002','operator46@example.test'),
 ('46000000-0000-4000-8000-000000000003','student46@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
 ('46000000-0000-4000-8000-000000000011','dni','46100011','Admin','Prueba','admin46@example.test','946000011','Admin'),
 ('46000000-0000-4000-8000-000000000012','dni','46100012','Operador','Prueba','operator46@example.test','946000012','Operador'),
 ('46000000-0000-4000-8000-000000000013','dni','46100013','Alumno','Prueba','student46@example.test','946000013','Alumno');
insert into public.user_accounts(user_id,person_id,role) values
 ('46000000-0000-4000-8000-000000000001','46000000-0000-4000-8000-000000000011','administrator'),
 ('46000000-0000-4000-8000-000000000002','46000000-0000-4000-8000-000000000012','operator'),
 ('46000000-0000-4000-8000-000000000003','46000000-0000-4000-8000-000000000013','student');

insert into public.activities(id,type,title,slug,description,modality,is_free,status,capacity) values
 ('46000000-0000-4000-8000-000000000021','training','Reactivación virtual','reactivacion-46-virtual','Prueba','virtual',true,'draft',2),
 ('46000000-0000-4000-8000-000000000022','training','Reactivación pagada','reactivacion-46-pagada','Prueba','in_person',false,'draft',null);
insert into public.activity_virtual_access(activity_id,virtual_url)
values ('46000000-0000-4000-8000-000000000021','https://example.test/virtual-46');
insert into public.activity_dates(activity_id,starts_at,ends_at)
values ('46000000-0000-4000-8000-000000000021',now()+interval '2 days',now()+interval '2 days 2 hours');
update public.activities set status='published',published_at=now(),contact_phone='946000001' where id='46000000-0000-4000-8000-000000000021';
insert into public.registrations(
 id,activity_id,person_id,registration_code,status,confirmed_at,confirmed_by,cancelled_at,cancelled_by,cancellation_reason,
 price_snapshot,job_title_snapshot
) values
 ('46000000-0000-4000-8000-000000000031','46000000-0000-4000-8000-000000000021','46000000-0000-4000-8000-000000000012',
 'CCI-46-GRATIS','cancelled',now()-interval '1 day','46000000-0000-4000-8000-000000000001',now(),
 '46000000-0000-4000-8000-000000000001','Cancelación de prueba',0,'Operador'),
 ('46000000-0000-4000-8000-000000000032','46000000-0000-4000-8000-000000000022','46000000-0000-4000-8000-000000000011',
 'CCI-46-PAGADA','cancelled',now()-interval '1 day','46000000-0000-4000-8000-000000000001',now(),
 '46000000-0000-4000-8000-000000000001','Cancelación de prueba',100,'Admin'),
 ('46000000-0000-4000-8000-000000000033','46000000-0000-4000-8000-000000000022','46000000-0000-4000-8000-000000000013',
 'CCI-46-PENDIENTE','cancelled',null,null,now(),null,null,100,'Alumno'),
 ('46000000-0000-4000-8000-000000000034','46000000-0000-4000-8000-000000000022','46000000-0000-4000-8000-000000000012',
 'CCI-46-CON-PAGO','cancelled',null,null,now(),null,null,100,'Operador');
insert into public.attendance(registration_id,status)
values ('46000000-0000-4000-8000-000000000031','pending');
insert into public.individual_registration_payments(
 registration_id,amount,payment_reference,idempotency_key,request_hash,verified_by
) values ('46000000-0000-4000-8000-000000000034',100,'PRUEBA-46',
 '46000000-0000-4000-8000-000000000090','h46','46000000-0000-4000-8000-000000000001');
create temp table original46 as select * from public.registrations where registration_code='CCI-46-GRATIS';
grant select on original46 to authenticated;

select is(has_function_privilege('anon','public.reactivate_registration(uuid,text)','EXECUTE'),false,'anon cannot reactivate');
select is(has_table_privilege('authenticated','public.registrations','UPDATE'),false,'direct status writes remain denied');
set local role authenticated;
select set_config('request.jwt.claim.sub','46000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 '42501','UNAUTHORIZED','student rejected');
select set_config('request.jwt.claim.sub','46000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031',repeat('A',501))$$,
 '22023','VALIDATION_ERROR','oversized reason rejected');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000031','Cancelada por error')->>'status',
 'confirmed','operator restores a free registration as confirmed');
select is((select to_jsonb(r)-'status'-'cancelled_at'-'cancelled_by'-'cancellation_reason'-'updated_at'
 from public.registrations r where registration_code='CCI-46-GRATIS'),
 (select to_jsonb(r)-'status'-'cancelled_at'-'cancelled_by'-'cancellation_reason'-'updated_at' from original46 r),
 'reactivation preserves original identity, confirmation, token, prices and certificate information');
select ok((select cancelled_at is null and cancelled_by is null and cancellation_reason is null
 from public.registrations where registration_code='CCI-46-GRATIS'),'cancellation fields cleared');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000031')->>'changed','false','repeat is idempotent');
reset role;
select is((select count(*) from public.audit_logs where entity_id='46000000-0000-4000-8000-000000000031'
 and action='registration.reactivated' and metadata->>'reason'='Cancelada por error'),1::bigint,'reactivation audited once');
set local role authenticated;
select is((select count(*) from public.activity_virtual_reminders where registration_id='46000000-0000-4000-8000-000000000031'
 and deleted_at is null),1::bigint,'future session reminder restored once');
select is((select status from public.attendance where registration_id='46000000-0000-4000-8000-000000000031'),
 'pending'::public.attendance_status,'attendance preserved');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000032')->>'status',
 'confirmed','historically confirmed paid registration remains confirmed');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000033')->>'status',
 'pending','unverified payment returns to pending');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000034')->>'status',
 'confirmed','verified payment restores confirmation');
select is((select count(*) from public.individual_registration_payments where registration_id='46000000-0000-4000-8000-000000000034'),
 1::bigint,'reactivation does not create a second payment');

select public.cancel_registration('46000000-0000-4000-8000-000000000031','Otra prueba');
reset role;
insert into public.registrations(id,activity_id,person_id,registration_code,status,confirmed_at,job_title_snapshot)
values ('46000000-0000-4000-8000-000000000035','46000000-0000-4000-8000-000000000021',
 '46000000-0000-4000-8000-000000000012','CCI-46-DUPLICADA','confirmed',now(),'Operador');
set local role authenticated;
select set_config('request.jwt.claim.sub','46000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 'P0001','DUPLICATE_REGISTRATION','another active registration blocks restoration');
reset role;
update public.registrations set deleted_at=now() where registration_code='CCI-46-DUPLICADA';
insert into public.registrations(id,activity_id,person_id,registration_code,status,confirmed_at,job_title_snapshot)
values ('46000000-0000-4000-8000-000000000036','46000000-0000-4000-8000-000000000021',
 '46000000-0000-4000-8000-000000000011','CCI-46-CUPO','confirmed',now(),'Admin');
update public.activities set capacity=1 where id='46000000-0000-4000-8000-000000000021';
set local role authenticated;
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 'P0001','NO_AVAILABLE_CAPACITY','full activity blocks restoration');
reset role;
update public.registrations set deleted_at=now() where registration_code='CCI-46-CUPO';
set local role authenticated;
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000031')->>'status',
 'confirmed','administrator can restore when a place becomes available');
select is((select count(*) from public.activity_virtual_reminders where registration_id='46000000-0000-4000-8000-000000000031'
 and deleted_at is null),1::bigint,'cancel and restore keeps one active reminder');
select public.cancel_registration('46000000-0000-4000-8000-000000000031','Última prueba');
reset role;
update public.activities set status='cancelled' where id='46000000-0000-4000-8000-000000000021';
set local role authenticated;
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 'P0001','ACTIVITY_NOT_AVAILABLE','cancelled activity rejected');
reset role;
update public.activities set status='archived' where id='46000000-0000-4000-8000-000000000021';
set local role authenticated;
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 'P0001','ACTIVITY_NOT_AVAILABLE','archived activity rejected');
reset role;
update public.activities set status='draft',deleted_at=now() where id='46000000-0000-4000-8000-000000000021';
set local role authenticated;
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000031')$$,
 'P0001','ACTIVITY_NOT_AVAILABLE','deleted activity rejected');
reset role;

insert into public.member_companies(ruc,legal_name) values('20466666661','Empresa 46');
insert into public.activities(id,type,title,slug,description,modality,is_free,members_only,general_price,member_price,
 member_free_passes_per_company,status,capacity,maps_embed_url,contact_phone,payment_note)
values ('46000000-0000-4000-8000-000000000023','event','Grupo 46','reactivacion-46-grupo','Prueba','in_person',
 false,true,0,40,1,'published',10,'https://www.google.com/maps/embed?pb=h46','946000001','Coordinar pago');
insert into public.member_group_requests(id,activity_id,company_ruc,company_name_snapshot,is_free_snapshot,
 request_code,idempotency_key,request_hash)
values ('46000000-0000-4000-8000-000000000024','46000000-0000-4000-8000-000000000023','20466666661',
 'Empresa 46',false,'CCI-GROUP-46','46000000-0000-4000-8000-000000000091','h46');
insert into public.registrations(id,activity_id,person_id,registration_code,status,registration_type,ruc_snapshot,
 company_snapshot,price_snapshot,job_title_snapshot,member_group_request_id)
values
 ('46000000-0000-4000-8000-000000000037','46000000-0000-4000-8000-000000000023','46000000-0000-4000-8000-000000000012',
 'CCI-46-PASE','pending','member','20466666661','Empresa 46',40,'Operador','46000000-0000-4000-8000-000000000024'),
 ('46000000-0000-4000-8000-000000000038','46000000-0000-4000-8000-000000000023','46000000-0000-4000-8000-000000000013',
 'CCI-46-GRUPO-PAGO','pending','member','20466666661','Empresa 46',40,'Alumno','46000000-0000-4000-8000-000000000024');
insert into public.member_complimentary_passes(id,activity_id,company_ruc,slot_number,registration_id)
values ('46000000-0000-4000-8000-000000000039','46000000-0000-4000-8000-000000000023','20466666661',1,
 '46000000-0000-4000-8000-000000000037');
update public.registrations set is_complimentary=true,price_snapshot=0,status='confirmed',confirmed_at=now()
where id='46000000-0000-4000-8000-000000000037';
set local role authenticated;
select set_config('request.jwt.claim.sub','46000000-0000-4000-8000-000000000001',true);
select public.cancel_registration('46000000-0000-4000-8000-000000000037','Prueba del pase');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000037')->>'status',
 'confirmed','assigned complimentary pass can be restored');
select is((select count(*) from public.notification_outbox where related_entity_id='46000000-0000-4000-8000-000000000037'
 and event_type='activity_registration_cancelled' and deleted_at is null),0::bigint,'obsolete cancellation notice retired');
select public.cancel_registration('46000000-0000-4000-8000-000000000038','Prueba de pago grupal');
select is(public.reactivate_registration('46000000-0000-4000-8000-000000000038')->>'status',
 'pending','group attendee without verified payment returns to pending');
select public.cancel_registration('46000000-0000-4000-8000-000000000037','Transferencia del pase');
select public.transfer_member_complimentary_pass('46000000-0000-4000-8000-000000000039',
 '46000000-0000-4000-8000-000000000038','Transferencia de prueba');
select throws_ok($$select public.reactivate_registration('46000000-0000-4000-8000-000000000037')$$,
 'P0001','COMPLIMENTARY_PASS_NOT_ASSIGNED','transferred pass cannot be reclaimed by reactivation');
reset role;
select is((select count(*) from public.member_complimentary_passes where activity_id='46000000-0000-4000-8000-000000000023'),
 1::bigint,'reactivation never allocates an extra company pass');
select * from finish(true);
rollback;
