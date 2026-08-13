begin;

select plan(42);

select ok(to_regprocedure('public.handle_campus_user_registration()') is not null, 'campus registration trigger function exists');
select ok(exists (select 1 from pg_trigger where tgname = 'on_campus_auth_user_created' and not tgisinternal), 'auth user trigger exists');
select ok(exists (select 1 from pg_trigger where tgname = 'zz_scrub_campus_auth_metadata' and not tgisinternal), 'temporary registration metadata scrub trigger exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'people' and policyname = 'people_own_read'), 'people own-read policy exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_accounts' and policyname = 'user_accounts_own_read'), 'account own-read policy exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_accounts' and policyname = 'user_accounts_admin_read'), 'account admin-read policy exists');
select is(has_table_privilege('authenticated', 'public.user_accounts', 'SELECT'), true, 'authenticated users can query accounts through RLS');
select is(has_table_privilege('anon', 'public.user_accounts', 'SELECT'), false, 'anonymous users cannot query accounts');
select is(has_function_privilege('authenticated', 'public.update_own_profile(jsonb)', 'EXECUTE'), true, 'authenticated users can update their own profile through RPC');
select is(has_function_privilege('anon', 'public.update_own_profile(jsonb)', 'EXECUTE'), false, 'anonymous users cannot update profiles');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '86000000-0000-4000-8000-000000000001',
  'HITO6.NEW@EXAMPLE.TEST',
  '{"registration_source":"campus","document_type":"dni","document_number":"16000001","first_names":"Nueva","last_names":"Estudiante","phone":"916000001","job_title":"Analista","company":"Empresa Nueva","ruc":"20600000001","address":"Ica","role":"administrator"}'::jsonb
);

select is((select count(*) from public.people where document_type = 'dni' and document_number = '16000001'), 1::bigint, 'new registration creates one person');
select is((select count(*) from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001'), 1::bigint, 'new registration creates one account');
select is((select role from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001'), 'student'::public.user_role, 'public registration always creates a student');
select isnt((select role::text from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001'), 'administrator', 'untrusted role metadata is ignored');
select ok((select is_active from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001'), 'new account is active');
select is((select email from public.people where document_number = '16000001'), 'hito6.new@example.test', 'person email is normalized from Auth');
select is((select person_id from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001'), (select id from public.people where document_number = '16000001'), 'account points to the created person');
select is((select raw_user_meta_data ? 'document_number' from auth.users where id = '86000000-0000-4000-8000-000000000001'), false, 'business identity is removed from Auth metadata after linking');

insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title, company)
values ('36000000-0000-4000-8000-000000000002', 'dni', '16000002', 'Participante', 'Anterior', 'anterior@example.test', '916000002', 'Gerente', 'Empresa Histórica');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '86000000-0000-4000-8000-000000000002',
  'cuenta.nueva@example.test',
  '{"registration_source":"campus","document_type":"dni","document_number":"16000002","first_names":"Participante Actualizada","last_names":"Anterior","phone":"916000022","job_title":"Directora","company":"","ruc":"","address":""}'::jsonb
);

select is((select count(*) from public.people where document_number = '16000002'), 1::bigint, 'existing participant is not duplicated');
select is((select person_id from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000002'), '36000000-0000-4000-8000-000000000002'::uuid, 'account reuses the existing person id');
select is((select first_names from public.people where id = '36000000-0000-4000-8000-000000000002'), 'Participante Actualizada', 'allowed identity data is refreshed');
select is((select email from public.people where id = '36000000-0000-4000-8000-000000000002'), 'cuenta.nueva@example.test', 'contact email is synchronized with Auth');
select is((select company from public.people where id = '36000000-0000-4000-8000-000000000002'), 'Empresa Histórica', 'omitted optional data preserves prior history');

select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values ('86000000-0000-4000-8000-000000000003', 'duplicada@example.test', '{"registration_source":"campus","document_type":"dni","document_number":"16000002","first_names":"Cuenta","last_names":"Duplicada","phone":"916000003","job_title":"Analista"}'::jsonb)$$,
  '23505', 'REGISTRATION_ACCOUNT_EXISTS', 'a document with an active account cannot register again'
);
select is((select count(*) from auth.users where id = '86000000-0000-4000-8000-000000000003'), 0::bigint, 'failed duplicate registration leaves no Auth user');
select throws_ok(
  $$insert into auth.users (id, email, raw_user_meta_data) values ('86000000-0000-4000-8000-000000000004', 'invalida@example.test', '{"registration_source":"campus","document_type":"dni","document_number":"ABC","first_names":"Cuenta","last_names":"Inválida","phone":"916000004","job_title":"Analista"}'::jsonb)$$,
  '22023', 'REGISTRATION_INVALID_DOCUMENT', 'invalid trusted metadata blocks Auth creation'
);
select is((select count(*) from auth.users where id = '86000000-0000-4000-8000-000000000004'), 0::bigint, 'invalid registration leaves no Auth user');

insert into auth.users (id, email) values ('86000000-0000-4000-8000-000000000005', 'internal@example.test');
select is((select count(*) from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000005'), 0::bigint, 'internal provisioning is not changed by the campus trigger');

insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title)
values ('36000000-0000-4000-8000-000000000006', 'dni', '16000006', 'Administradora', 'Hito Seis', 'admin6@example.test', '916000006', 'Administradora');
insert into auth.users (id, email) values ('86000000-0000-4000-8000-000000000006', 'admin6@example.test');
insert into public.user_accounts (user_id, person_id, role)
values ('86000000-0000-4000-8000-000000000006', '36000000-0000-4000-8000-000000000006', 'administrator');

insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title)
values ('36000000-0000-4000-8000-000000000007', 'dni', '16000007', 'Operador', 'Hito Seis', 'operator6@example.test', '916000007', 'Operador');
insert into auth.users (id, email) values ('86000000-0000-4000-8000-000000000007', 'operator6@example.test');
insert into public.user_accounts (user_id, person_id, role)
values ('86000000-0000-4000-8000-000000000007', '36000000-0000-4000-8000-000000000007', 'operator');

set local role authenticated;
select set_config('request.jwt.claim.sub', '86000000-0000-4000-8000-000000000001', true);
select is((select count(*) from public.user_accounts), 1::bigint, 'student sees only their own account');
select is((select count(*) from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000006'), 0::bigint, 'student cannot see another account');
select is((select count(*) from public.people), 1::bigint, 'student sees only their own person');
select is((select count(*) from public.people where id = '36000000-0000-4000-8000-000000000006'), 0::bigint, 'student cannot see another person');
select is(has_table_privilege('authenticated', 'public.people', 'UPDATE'), false, 'profile table cannot be updated directly');
select lives_ok(
  $$select public.update_own_profile('{"first_names":"Nombre Editado","last_names":"Estudiante","phone":"916000099","job_title":"Especialista","company":"Empresa Editada","ruc":"20600000009","address":"Nueva dirección"}'::jsonb)$$,
  'active user updates allowed profile fields'
);
select is((select first_names from public.people where document_number = '16000001'), 'Nombre Editado', 'profile changes persist');
select is((select document_number from public.people where id = (select person_id from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001')), '16000001', 'profile update preserves document identity');
select is((select email from public.people where id = (select person_id from public.user_accounts where user_id = '86000000-0000-4000-8000-000000000001')), 'hito6.new@example.test', 'profile update preserves authentication email');
select is(public.is_active_admin(), false, 'student is not an administrator');

reset role;
update public.user_accounts set is_active = false where user_id = '86000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '86000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.update_own_profile('{"first_names":"No Permitido","last_names":"Estudiante","phone":"916000099","job_title":"Especialista","company":"","ruc":"","address":""}'::jsonb)$$,
  '42501', 'ACCOUNT_NOT_ACTIVE', 'inactive account cannot update a profile'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '86000000-0000-4000-8000-000000000006', true);
select is(public.is_active_admin(), true, 'administrator remains recognized as internal user');
select cmp_ok((select count(*) from public.user_accounts), '>=', 4::bigint, 'administrator can inspect accounts through RLS');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '86000000-0000-4000-8000-000000000007', true);
select is(public.is_active_admin(), true, 'operator is recognized as an internal user');

reset role;
select * from finish(true);
rollback;
