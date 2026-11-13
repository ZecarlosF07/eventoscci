begin;
select no_plan();

select is(has_function_privilege('anon', 'public.save_activity(jsonb,jsonb,jsonb)', 'EXECUTE'), false, 'public callers cannot change visibility');
select is(has_function_privilege('authenticated', 'public.save_activity_without_passes(jsonb,jsonb,jsonb)', 'EXECUTE'), false, 'listing core stays private');

insert into auth.users(id,email) values ('43000000-0000-4000-8000-000000000040','admin43@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('43000000-0000-4000-8000-000000000041','dni','43100041','Admin','Visibilidad','admin43@example.test','943000041','Administrador');
insert into public.user_accounts(user_id,person_id,role)
values ('43000000-0000-4000-8000-000000000040','43000000-0000-4000-8000-000000000041','administrator');
insert into public.activity_contacts(id,label,contact_name,whatsapp_phone)
values ('43000000-0000-4000-8000-000000000042','Contacto visibilidad','Contacto de prueba','943000042');

create temporary table visibility43 as select
  '{"type":"training","title":"Capacitación de visibilidad","slug":"visibilidad-43-capacitacion","description":"Prueba de capacitación por enlace directo","modality":"virtual","is_free":true,"general_price":0,"member_price":0,"status":"published","contact_id":"43000000-0000-4000-8000-000000000042","virtual_url":"https://example.test/sesion"}'::jsonb as activity,
  jsonb_build_array(jsonb_build_object('starts_at', now()+interval '3 days','ends_at', now()+interval '3 days 2 hours','sort_order',0)) as dates;
grant select on visibility43 to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub','43000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.save_activity((select activity from visibility43),(select dates from visibility43),'[]')$$,'training with no visibility input is listed by default');
select is((select is_listed from public.activities where slug='visibilidad-43-capacitacion'),true,'new training uses the existing default');
select lives_ok($$select public.save_activity((select activity||jsonb_build_object('id',a.id,'is_listed',false) from visibility43 cross join public.activities a where a.slug='visibilidad-43-capacitacion'),(select dates from visibility43),'[]')$$,'published training can be hidden using the admin RPC');
select is((select is_listed from public.activities where slug='visibilidad-43-capacitacion'),false,'hidden training persists');
select lives_ok($$select public.save_activity((select activity||jsonb_build_object('id',a.id) from visibility43 cross join public.activities a where a.slug='visibilidad-43-capacitacion'),(select dates from visibility43),'[]')$$,'legacy API client may omit visibility on edit');
select is((select is_listed from public.activities where slug='visibilidad-43-capacitacion'),false,'omission does not relist an existing training');
select lives_ok($$select public.save_activity((select activity||'{"slug":"visibilidad-43-evento","type":"event","is_listed":false}' from visibility43),(select dates from visibility43),'[]')$$,'unlisted event creation remains supported');
reset role;

set local role anon;
select set_config('request.jwt.claim.sub','',true);
select is((select count(*) from public.activities where slug='visibilidad-43-capacitacion' and is_listed),0::bigint,'listed-only catalog does not include hidden training');
select is((select status from public.activities where slug='visibilidad-43-capacitacion'),'published'::public.activity_status,'anonymous direct slug still resolves the published training');
select is((select public.get_activity_registration_availability(id)->>'is_open' from public.activities where slug='visibilidad-43-capacitacion'),'true','anonymous direct link can still register while open');
select lives_ok($$select public.register_activity(
  (select id from public.activities where slug='visibilidad-43-capacitacion'),
  '{"document_type":"dni","document_number":"43100001","first_names":"Ana","last_names":"Prueba","email":"training43@example.test","phone":"943000001","job_title":"Analista","company":"Organización de prueba","registration_type":"general","participant_profile":"professional","privacy_accepted":true,"marketing_accepted":false}'::jsonb
    || jsonb_build_object('privacy_version',public.current_privacy_version())
)$$,'hidden training accepts a registration through the normal public RPC');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','43000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.save_activity((select activity||jsonb_build_object('id',a.id,'is_listed',true) from visibility43 cross join public.activities a where a.slug='visibilidad-43-capacitacion'),(select dates from visibility43),'[]')$$,'administrator can relist the same training');
reset role;
select is((select is_listed from public.activities where slug='visibilidad-43-capacitacion'),true,'training becomes discoverable again without changing its slug');
select is((select is_listed from public.activities where slug='visibilidad-43-evento'),false,'event remains unlisted');

select is((select r.status from public.registrations r join public.activities a on a.id=r.activity_id where a.slug='visibilidad-43-capacitacion'),'confirmed'::public.registration_status,'changing listing does not cancel an existing registration');

select * from finish(true);
rollback;
