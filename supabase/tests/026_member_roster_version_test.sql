begin;

select plan(9);

select ok((select relrowsecurity from pg_class where oid = 'public.member_companies'::regclass), 'member roster has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.member_roster_imports'::regclass), 'roster previews have RLS');
select ok(to_regprocedure('public.preview_member_roster_import(text,text,jsonb)') is not null, 'preview RPC exists');
select ok(to_regprocedure('public.apply_member_roster_import(uuid)') is not null, 'replacement RPC exists');

insert into auth.users (id, email) values
  ('26000000-0000-4000-8000-000000000040', 'admin26@example.test');
insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '26000000-0000-4000-8000-000000000041', 'dni', '26100041', 'Admin', 'Padron',
  'admin26@example.test', '926000041', 'Administradora'
);
insert into public.user_accounts(user_id, person_id, role) values
  ('26000000-0000-4000-8000-000000000040', '26000000-0000-4000-8000-000000000041', 'administrator');

set local role anon;
select throws_ok(
  $$select count(*) from public.member_companies$$,
  '42501', 'permission denied for table member_companies', 'anonymous callers cannot list active member RUCs'
);
select throws_ok(
  $$select public.preview_member_roster_import('padron.xlsx', repeat('a', 64), '[{"ruc":"20123456789","legal_name":"Empresa Uno"}]'::jsonb)$$,
  '42501', 'permission denied for function preview_member_roster_import', 'anonymous callers cannot preview a replacement'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '26000000-0000-4000-8000-000000000040', true);
select lives_ok(
  $$select public.preview_member_roster_import('hito15-version-test.xlsx', repeat('a', 64), '[{"ruc":"20123456789","legal_name":"Empresa Uno"}]'::jsonb)$$,
  'administrator can preview an Excel replacement'
);
reset role;

select is((select base_version from public.member_roster_imports where file_name = 'hito15-version-test.xlsx' order by created_at desc limit 1),
  (select version from public.member_roster_state where singleton), 'preview records the reviewed roster version');

update public.member_roster_state set version = version + 1 where singleton;
set local role authenticated;
select set_config('request.jwt.claim.sub', '26000000-0000-4000-8000-000000000040', true);
select throws_ok(
  $$select public.apply_member_roster_import((select id from public.member_roster_imports where file_name = 'hito15-version-test.xlsx' order by created_at desc limit 1))$$,
  'P0001', 'ROSTER_PREVIEW_STALE', 'a stale preview cannot replace the roster'
);
reset role;

select * from finish(true);
rollback;
