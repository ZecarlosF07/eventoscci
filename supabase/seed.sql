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

insert into public.activities (
  id, category_id, type, title, slug, short_description, description,
  objective, target_audience, modality, location_name, address, maps_embed_url, virtual_url,
  duration_text, academic_hours, program, syllabus, is_free, general_price,
  member_price, members_only, capacity, registration_open_at,
  registration_close_at, contact_name, contact_phone, contact_email,
  additional_info, status, published_at
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'event',
    'Encuentro Empresarial CCI 2026',
    'encuentro-empresarial-cci-2026',
    'Conexiones y perspectivas para impulsar empresas de la región.',
    'Una jornada para compartir experiencias, generar alianzas y conocer oportunidades para el crecimiento empresarial de Ica.',
    'Fortalecer el ecosistema empresarial regional mediante conocimiento y relacionamiento.',
    'Empresarios, emprendedores y equipos directivos.',
    'hybrid',
    'Auditorio de la Cámara de Comercio de Ica',
    'Calle Lima 123, Ica',
    'https://www.google.com/maps/embed?pb=demo-cci-ica',
    'https://meet.example.test/encuentro-cci',
    'Dos jornadas',
    12,
    'Conferencias, panel empresarial y rueda de contactos.',
    'Innovación regional, liderazgo y oportunidades de inversión.',
    false,
    120,
    80,
    false,
    180,
    '2026-08-01 13:00:00+00',
    '2026-09-18 23:59:00+00',
    'Área de Eventos CCI',
    '956000000',
    'eventos@example.test',
    'Los asociados deberán presentar su identificación institucional.',
    'published',
    '2026-08-12 18:00:00+00'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000005',
    'training',
    'Taller de Transformación Digital para Pymes',
    'taller-transformacion-digital-pymes',
    'Herramientas prácticas para digitalizar procesos comerciales.',
    'Capacitación aplicada para identificar oportunidades de automatización, ordenar procesos y mejorar la experiencia de clientes.',
    'Diseñar una hoja de ruta digital accionable para una pyme.',
    'Propietarios, administradores y responsables comerciales de pymes.',
    'virtual',
    null,
    null,
    null,
    'https://meet.example.test/taller-digital',
    'Tres sesiones',
    9,
    'Diagnóstico, herramientas digitales y plan de implementación.',
    'Procesos, ventas digitales, métricas y automatización.',
    true,
    0,
    0,
    false,
    60,
    '2026-08-01 13:00:00+00',
    '2026-10-01 23:59:00+00',
    'Área de Capacitaciones CCI',
    '956000001',
    'capacitaciones@example.test',
    null,
    'published',
    '2026-08-12 18:00:00+00'
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
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '2026-09-21 14:00:00+00',
    '2026-09-21 22:00:00+00',
    'Día 1',
    0
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001',
    '2026-09-22 14:00:00+00',
    '2026-09-22 19:00:00+00',
    'Día 2',
    1
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000002',
    '2026-10-05 23:00:00+00',
    '2026-10-06 02:00:00+00',
    'Sesión 1',
    0
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000002',
    '2026-10-07 23:00:00+00',
    '2026-10-08 02:00:00+00',
    'Sesión 2',
    1
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
    '60000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Ponente principal',
    0
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Especialista invitada',
    0
  )
on conflict (activity_id, speaker_id) where deleted_at is null do update set
  role_label = excluded.role_label,
  sort_order = excluded.sort_order,
  deleted_at = null,
  deleted_by = null;
