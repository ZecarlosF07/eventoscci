begin;

select no_plan();

select ok(
  to_regprocedure('public.get_public_course_curriculum(uuid)') is not null,
  'public course curriculum RPC exists'
);
select ok(
  has_function_privilege('anon', 'public.get_public_course_curriculum(uuid)', 'EXECUTE'),
  'anonymous visitors can request public curriculum'
);

insert into public.courses (id, title, slug, description, status, published_at)
values
  ('5e000000-0000-4000-8000-000000000001', 'Curso público', 'curriculum-publico', 'Curso publicado', 'published', now()),
  ('5e000000-0000-4000-8000-000000000002', 'Curso borrador', 'curriculum-borrador', 'Curso borrador', 'draft', null);

insert into public.course_modules (id, course_id, title, description, sort_order, is_published) values
  ('6e000000-0000-4000-8000-000000000001', '5e000000-0000-4000-8000-000000000001', 'Módulo visible', 'Descripción visible', 0, true),
  ('6e000000-0000-4000-8000-000000000002', '5e000000-0000-4000-8000-000000000001', 'Módulo oculto', null, 1, false),
  ('6e000000-0000-4000-8000-000000000003', '5e000000-0000-4000-8000-000000000002', 'Módulo de borrador', null, 0, true);

insert into public.lessons (id, module_id, title, sort_order, video_provider, video_asset_id, video_storage_path, duration_seconds, is_required, is_published) values
  ('7e000000-0000-4000-8000-000000000001', '6e000000-0000-4000-8000-000000000001', 'Clase visible', 0, 'supabase', null, '5e000000-0000-4000-8000-000000000001/private.mp4', 300, true, true),
  ('7e000000-0000-4000-8000-000000000002', '6e000000-0000-4000-8000-000000000001', 'Clase oculta', 1, 'youtube', 'secret-id', null, 120, false, false);

set local role anon;

select is(
  jsonb_array_length(public.get_public_course_curriculum('5e000000-0000-4000-8000-000000000001')),
  1,
  'only published modules are returned'
);
select is(
  jsonb_array_length(public.get_public_course_curriculum('5e000000-0000-4000-8000-000000000001')->0->'lessons'),
  1,
  'only published lessons are returned'
);
select is(
  public.get_public_course_curriculum('5e000000-0000-4000-8000-000000000002'),
  '[]'::jsonb,
  'draft courses have no public curriculum'
);
select ok(
  not (public.get_public_course_curriculum('5e000000-0000-4000-8000-000000000001')::text ~ '(video_provider|video_asset_id|video_storage_path|private.mp4|secret-id)'),
  'the response never exposes video providers, identifiers, or storage paths'
);

select * from finish(true);
rollback;
