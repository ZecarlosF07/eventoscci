-- Seed idempotente y seguro para producción.
-- No crea usuarios, personas, expositores, actividades ni credenciales de prueba.
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
