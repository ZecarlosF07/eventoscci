begin;

select plan(7);

select ok(
  to_regclass('public.activity_participation_summary') is not null,
  'participation summary view exists'
);

select ok(
  coalesce((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.activity_participation_summary'::regclass), false),
  'participation view runs with invoker permissions'
);

select is(
  has_table_privilege('anon', 'public.activity_participation_summary', 'SELECT'),
  false,
  'anonymous users cannot read operational summary'
);

select is(
  has_table_privilege('authenticated', 'public.activity_participation_summary', 'SELECT'),
  true,
  'authenticated accounts can reach the RLS-protected summary'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activity_participation_summary'
      and column_name = 'pending_count'
  ),
  'summary exposes pending count'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'activity_participation_summary'
      and column_name = 'attended_count'
  ),
  'summary exposes attended count'
);

select ok(
  pg_get_functiondef('public.set_attendance_status(uuid[],public.attendance_status,text)'::regprocedure)
    like '%REGISTRATION_NOT_CONFIRMED%',
  'attendance RPC enforces confirmed registration eligibility'
);

select * from finish(true);

rollback;
