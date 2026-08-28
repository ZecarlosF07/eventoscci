alter table public.activities
add column program_image_paths text[] not null default '{}'::text[];

alter table public.activities
add constraint activities_program_image_limit check (
  cardinality(program_image_paths) <= 10
);

comment on column public.activities.program_image_paths is
  'Imágenes verticales ordenadas que componen el programa o temario visual.';
