insert into public.categories (id, name, slug, description, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'Gestión Empresarial', 'gestion-empresarial', 'Gestión y desarrollo de organizaciones.', 10),
  ('10000000-0000-4000-8000-000000000002', 'Marketing', 'marketing', 'Estrategias comerciales y posicionamiento.', 20),
  ('10000000-0000-4000-8000-000000000003', 'Tributación', 'tributacion', 'Normativa y gestión tributaria.', 30),
  ('10000000-0000-4000-8000-000000000004', 'Comercio Exterior', 'comercio-exterior', 'Operaciones y oportunidades internacionales.', 40),
  ('10000000-0000-4000-8000-000000000005', 'Transformación Digital', 'transformacion-digital', 'Tecnología aplicada a los negocios.', 50)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  deleted_at = null,
  deleted_by = null;

insert into public.speakers (
  id,
  first_names,
  last_names,
  professional_title,
  organization,
  bio
)
values (
  '20000000-0000-4000-8000-000000000001',
  'María Elena',
  'Quispe Torres',
  'Especialista en Gestión Empresarial',
  'Cámara de Comercio de Ica',
  'Registro demostrativo para validar el núcleo del sistema.'
)
on conflict (id) do update set
  first_names = excluded.first_names,
  last_names = excluded.last_names,
  professional_title = excluded.professional_title,
  organization = excluded.organization,
  bio = excluded.bio,
  deleted_at = null,
  deleted_by = null;

insert into public.people (
  id,
  document_type,
  document_number,
  first_names,
  last_names,
  email,
  phone,
  job_title,
  company,
  address
)
values (
  '30000000-0000-4000-8000-000000000001',
  'dni',
  '00000001',
  'Persona',
  'Demostración',
  'persona.demo@example.test',
  '999999999',
  'Participante de prueba',
  'Datos locales de desarrollo',
  'Ica'
)
on conflict (document_type, document_number) do update set
  first_names = excluded.first_names,
  last_names = excluded.last_names,
  email = excluded.email,
  phone = excluded.phone,
  job_title = excluded.job_title,
  company = excluded.company,
  address = excluded.address,
  deleted_at = null,
  deleted_by = null;
