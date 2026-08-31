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

delete from public.registrations
where activity_id in (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002'
);

delete from public.activities
where id in (
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000002'
);

insert into public.activities (
  id, category_id, type, title, slug, short_description, description,
  objective, target_audience, modality, location_name, address, maps_embed_url, virtual_url,
  duration_text, academic_hours, program, syllabus, program_image_paths, is_free, general_price,
  member_price, members_only, capacity, registration_open_at,
  registration_close_at, contact_name, contact_phone, contact_email,
  additional_info, status, published_at
)
values (
  '4d000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000005',
  'training',
  'Laboratorio de ventas digitales CCI',
  'laboratorio-ventas-digitales-cci',
  'Convierte tu estrategia digital en un plan práctico para atraer y fidelizar clientes.',
  'Una experiencia aplicada para fortalecer la presencia digital de tu empresa, optimizar cada punto de contacto y convertir oportunidades en relaciones comerciales sostenibles.',
  'Diseñar un plan de ventas digitales accionable y medible para la empresa.',
  'Emprendedores, responsables comerciales y equipos de marketing de pequeñas y medianas empresas.',
  'virtual',
  null,
  null,
  null,
  'https://camaraica.org.pe/',
  '4 horas',
  4,
  null,
  null,
  array['/demo/programa-laboratorio-ventas-digitales-cci.png']::text[],
  true,
  0,
  0,
  false,
  60,
  '2026-08-28 05:00:00+00',
  '2026-10-21 23:00:00+00',
  'Cámara de Comercio de Ica',
  '956000001',
  'eventos@camaraica.org.pe',
  'El enlace de acceso será enviado a los participantes inscritos.',
  'published',
  '2026-08-28 14:00:00+00'
)
on conflict (id) do update set
  category_id = excluded.category_id,
  type = excluded.type,
  title = excluded.title,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  objective = excluded.objective,
  target_audience = excluded.target_audience,
  modality = excluded.modality,
  location_name = excluded.location_name,
  address = excluded.address,
  maps_embed_url = excluded.maps_embed_url,
  virtual_url = excluded.virtual_url,
  duration_text = excluded.duration_text,
  academic_hours = excluded.academic_hours,
  program = excluded.program,
  syllabus = excluded.syllabus,
  program_image_paths = excluded.program_image_paths,
  is_free = excluded.is_free,
  general_price = excluded.general_price,
  member_price = excluded.member_price,
  members_only = excluded.members_only,
  capacity = excluded.capacity,
  registration_open_at = excluded.registration_open_at,
  registration_close_at = excluded.registration_close_at,
  contact_name = excluded.contact_name,
  contact_phone = excluded.contact_phone,
  contact_email = excluded.contact_email,
  additional_info = excluded.additional_info,
  status = excluded.status,
  published_at = excluded.published_at,
  deleted_at = null,
  deleted_by = null;

insert into public.activity_dates (
  id, activity_id, starts_at, ends_at, label, sort_order
)
values
  (
    '5d000000-0000-4000-8000-000000000001',
    '4d000000-0000-4000-8000-000000000001',
    '2026-10-22 14:00:00+00',
    '2026-10-22 18:00:00+00',
    'Sesión virtual en vivo',
    0
  )
on conflict (id) do update set
  activity_id = excluded.activity_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.activity_speakers (
  id, activity_id, speaker_id, role_label, sort_order
)
values
  (
    '6d000000-0000-4000-8000-000000000001',
    '4d000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Facilitadora',
    0
  )
on conflict (activity_id, speaker_id) where deleted_at is null do update set
  role_label = excluded.role_label,
  sort_order = excluded.sort_order,
  deleted_at = null,
  deleted_by = null;
