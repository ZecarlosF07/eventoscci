# DICCIONARIO DE DATOS Y DISEÑO FÍSICO DE BASE DE DATOS

## Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica

**Motor:** PostgreSQL mediante Supabase  
**Etapa:** Diseño técnico de base de datos  
**Versión:** Corregida  
**Identificadores:** UUID  
**Convención:** `snake_case`  
**Borrado:** Soft Delete  
**Frontend:** Next.js  
**Backend:** Supabase

---

# 1. Principios del modelo

La base de datos deberá soportar una sola Plataforma Digital de Eventos y Formación, manteniendo integrados pero claramente diferenciados:

- eventos;
- capacitaciones;
- cursos grabados;
- participantes;
- usuarios del campus;
- certificados;
- expositores;
- historial institucional.

Los eventos y capacitaciones compartirán el mismo modelo de datos denominado `activities`, tal como fue definido funcionalmente.

Los cursos grabados utilizarán un dominio propio debido a sus necesidades de módulos, clases, videos, progreso, evaluaciones y certificados.

---

# 2. Diferencia entre tipo y categoría de actividad

Una actividad posee dos clasificaciones distintas.

## Tipo

Indica qué clase de actividad institucional es:

```text
event
training
```

Por ejemplo:

```text
Congreso Empresarial
type = event
```

```text
Taller de Marketing
type = training
```

## Categoría

Representa la temática.

Ejemplos:

```text
Marketing
Tributación
Comercio Exterior
Gestión Empresarial
Transformación Digital
```

Por tanto:

```text
type != category
```

Ejemplo:

```text
Congreso Tributario
type = event
category = Tributación
```

```text
Taller Tributario
type = training
category = Tributación
```

Ambos pertenecen a la misma categoría pero son tipos de actividad distintos.

---

# 3. Convenciones generales

Las claves primarias utilizarán:

```sql
uuid
```

con:

```sql
gen_random_uuid()
```

como valor predeterminado.

Los códigos visibles al usuario serán campos independientes.

Ejemplos:

```text
CCI-EV-000124
CCI-CERT-2026-000245
```

Estos códigos no constituirán claves primarias.

---

# 4. Campos estándar

La mayoría de tablas operativas utilizarán:

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

`deleted_by` referenciará:

```text
auth.users.id
```

cuando la eliminación lógica sea realizada por un usuario identificado.

---

# 5. Soft Delete

El borrado normal del sistema será lógico.

Un registro activo cumple:

```sql
deleted_at IS NULL
```

Eliminar lógicamente:

```sql
deleted_at = now()
deleted_by = auth.uid()
```

No se deberá utilizar eliminación física para operaciones administrativas normales.

---

# 6. Soft Delete y estados

Soft delete y estado funcional son conceptos diferentes.

Ejemplo:

```text
activity.status = cancelled
```

significa:

> La actividad existió y fue cancelada.

Mientras:

```text
activity.deleted_at IS NOT NULL
```

significa:

> El registro fue retirado del uso normal del sistema.

Igualmente:

```text
course_enrollment.status = revoked
```

no equivale a eliminar la matrícula.

Los estados preservan hechos históricos.

---

# 7. Índices únicos y Soft Delete

Para elementos de catálogo que pueden reutilizarse después de ser eliminados lógicamente se utilizarán índices únicos parciales.

Ejemplo:

```sql
CREATE UNIQUE INDEX uq_categories_slug_active
ON categories(slug)
WHERE deleted_at IS NULL;
```

Las identidades institucionales y los códigos históricos nunca se reutilizarán.

Ejemplos:

```text
people(document_type, document_number)
registration_code
certificate_code
```

Estos tendrán `UNIQUE` convencional.

---

# 8. Enums

## `document_type`

```text
dni
ce
```

## `user_role`

```text
student
operator
administrator
```

## `activity_type`

```text
event
training
```

## `activity_modality`

```text
in_person
virtual
hybrid
```

## `activity_status`

```text
draft
published
finished
archived
cancelled
```

## `registration_type`

```text
general
member
```

## `registration_status`

```text
pending
confirmed
cancelled
```

## `attendance_status`

```text
pending
attended
absent
```

## `course_status`

```text
draft
published
archived
```

## `course_enrollment_status`

```text
active
completed
revoked
```

## `material_type`

```text
file
external_link
```

## `certificate_type`

```text
activity
course
```

## `certificate_status`

```text
issued
revoked
```

## `notification_status`

```text
pending
processing
sent
failed
cancelled
```

---

# 9. Tabla `people`

Representa la identidad institucional única de una persona.

Una persona puede existir sin una cuenta del campus.

Posteriormente puede crear una cuenta manteniendo su mismo `person_id`, preservando todo su historial previo. Esta regla forma parte del análisis funcional.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `document_type` | `document_type` | No | `'dni'` |
| `document_number` | `varchar(20)` | No | — |
| `first_names` | `varchar(120)` | No | — |
| `last_names` | `varchar(120)` | No | — |
| `email` | `text` | No | — |
| `phone` | `varchar(30)` | No | — |
| `job_title` | `text` | No | — |
| `company` | `text` | Sí | `NULL` |
| `ruc` | `varchar(11)` | Sí | `NULL` |
| `address` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricciones:

```sql
CHECK (length(trim(document_number)) > 0);

CHECK (document_number = upper(trim(document_number)));

CHECK (
  ruc IS NULL
  OR ruc ~ '^[0-9]{11}$'
);
```

Identidad institucional permanente:

```sql
CREATE UNIQUE INDEX uq_people_document
ON people(document_type, document_number);
```

El documento deberá almacenarse en formato canónico mediante `upper(trim(document_number))` antes de insertar o actualizar. Si una persona fue eliminada lógicamente, un nuevo proceso deberá restaurar o reutilizar ese registro en lugar de crear una segunda identidad.

Índices adicionales:

```text
lower(email)
lower(first_names)
lower(last_names)
phone
```

---

# 10. Tabla `user_accounts`

Relaciona Supabase Auth con una persona.

```text
auth.users
    ↓
user_accounts
    ↓
people
```

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `user_id` | `uuid` | No | — |
| `person_id` | `uuid` | No | — |
| `role` | `user_role` | No | `'student'` |
| `is_active` | `boolean` | No | `true` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

`user_id`:

```text
PK
FK → auth.users.id
```

`person_id`:

```text
FK → people.id
```

Una persona solo podrá mantener una cuenta activa:

```sql
CREATE UNIQUE INDEX uq_user_accounts_person_active
ON user_accounts(person_id)
WHERE deleted_at IS NULL;
```

---

# 11. Tabla `categories`

Clasifica temáticamente las actividades.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `name` | `varchar(100)` | No | — |
| `slug` | `varchar(120)` | No | — |
| `description` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `is_active` | `boolean` | No | `true` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Índice:

```sql
CREATE UNIQUE INDEX uq_categories_slug_active
ON categories(slug)
WHERE deleted_at IS NULL;
```

---

# 12. Tabla `speakers`

Registro reutilizable de expositores, docentes e instructores.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `first_names` | `varchar(120)` | No | — |
| `last_names` | `varchar(120)` | No | — |
| `professional_title` | `text` | Sí | `NULL` |
| `organization` | `text` | Sí | `NULL` |
| `bio` | `text` | Sí | `NULL` |
| `photo_path` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Se reutilizará tanto para actividades como para cursos.

---

# 13. Tabla `activities`

Es la tabla principal de eventos y capacitaciones.

No existirán tablas separadas:

```text
events
trainings
```

porque ambos procesos son prácticamente idénticos funcionalmente.

La diferencia se almacena mediante:

```text
type = event
```

o:

```text
type = training
```

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `category_id` | `uuid` | Sí | `NULL` |
| `type` | `activity_type` | No | — |
| `title` | `varchar(200)` | No | — |
| `slug` | `varchar(220)` | No | — |
| `short_description` | `text` | Sí | `NULL` |
| `description` | `text` | No | — |
| `objective` | `text` | Sí | `NULL` |
| `target_audience` | `text` | Sí | `NULL` |
| `modality` | `activity_modality` | No | — |
| `location_name` | `text` | Sí | `NULL` |
| `address` | `text` | Sí | `NULL` |
| `virtual_url` | `text` | Sí | `NULL` |
| `duration_text` | `varchar(100)` | Sí | `NULL` |
| `academic_hours` | `numeric(6,2)` | Sí | `NULL` |
| `program` | `text` | Sí | `NULL` |
| `syllabus` | `text` | Sí | `NULL` |
| `banner_path` | `text` | Sí | `NULL` |
| `is_free` | `boolean` | No | `false` |
| `general_price` | `numeric(10,2)` | No | `0` |
| `member_price` | `numeric(10,2)` | No | `0` |
| `members_only` | `boolean` | No | `false` |
| `capacity` | `integer` | Sí | `NULL` |
| `registration_open_at` | `timestamptz` | Sí | `NULL` |
| `registration_close_at` | `timestamptz` | Sí | `NULL` |
| `registrations_closed_manually` | `boolean` | No | `false` |
| `contact_name` | `text` | Sí | `NULL` |
| `contact_phone` | `varchar(30)` | Sí | `NULL` |
| `contact_email` | `text` | Sí | `NULL` |
| `additional_info` | `text` | Sí | `NULL` |
| `status` | `activity_status` | No | `'draft'` |
| `published_at` | `timestamptz` | Sí | `NULL` |
| `created_by` | `uuid` | Sí | `NULL` |
| `updated_by` | `uuid` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricciones:

```sql
CHECK (general_price >= 0);
CHECK (member_price >= 0);
CHECK (capacity IS NULL OR capacity > 0);
CHECK (academic_hours IS NULL OR academic_hours >= 0);
```

Si es gratuita:

```sql
CHECK (
  is_free = false
  OR (
      general_price = 0
      AND member_price = 0
  )
);
```

Slug:

```sql
CREATE UNIQUE INDEX uq_activities_slug_active
ON activities(slug)
WHERE deleted_at IS NULL;
```

Índices importantes:

```text
type
category_id
status
modality
published_at
registration_open_at
registration_close_at
```

---

# 14. Tabla `activity_dates`

Una actividad puede tener una o varias fechas.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `activity_id` | `uuid` | No | — |
| `starts_at` | `timestamptz` | No | — |
| `ends_at` | `timestamptz` | Sí | `NULL` |
| `label` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CHECK (
  ends_at IS NULL
  OR ends_at > starts_at
);
```

---

# 15. Tabla `activity_speakers`

Relación:

```text
activities
↕
speakers
```

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `activity_id` | `uuid` | No | — |
| `speaker_id` | `uuid` | No | — |
| `role_label` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CREATE UNIQUE INDEX uq_activity_speaker_active
ON activity_speakers(activity_id, speaker_id)
WHERE deleted_at IS NULL;
```

---

# 16. Tabla `registrations`

Representa una inscripción o preinscripción a un evento o capacitación.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `activity_id` | `uuid` | No | — |
| `person_id` | `uuid` | No | — |
| `registration_code` | `varchar(40)` | No | — |
| `registration_type` | `registration_type` | No | `'general'` |
| `status` | `registration_status` | No | `'pending'` |
| `company_snapshot` | `text` | Sí | `NULL` |
| `ruc_snapshot` | `varchar(11)` | Sí | `NULL` |
| `price_snapshot` | `numeric(10,2)` | No | `0` |
| `confirmed_at` | `timestamptz` | Sí | `NULL` |
| `confirmed_by` | `uuid` | Sí | `NULL` |
| `cancelled_at` | `timestamptz` | Sí | `NULL` |
| `cancelled_by` | `uuid` | Sí | `NULL` |
| `cancellation_reason` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

La duplicidad se impide mediante:

```sql
CREATE UNIQUE INDEX uq_registration_person_activity_active
ON registrations(activity_id, person_id)
WHERE deleted_at IS NULL;
```

Código:

```sql
UNIQUE(registration_code)
```

Los snapshots conservan la situación en el momento de la inscripción.

---

# 17. Tabla `attendance`

Representa la asistencia general a una actividad.

No se implementará asistencia por sesión en el MVP.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `registration_id` | `uuid` | No | — |
| `status` | `attendance_status` | No | `'pending'` |
| `marked_at` | `timestamptz` | Sí | `NULL` |
| `marked_by` | `uuid` | Sí | `NULL` |
| `notes` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Una asistencia activa por inscripción:

```sql
CREATE UNIQUE INDEX uq_attendance_registration_active
ON attendance(registration_id)
WHERE deleted_at IS NULL;
```

---

# 18. Tabla `courses`

Entidad principal del campus virtual.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `title` | `varchar(200)` | No | — |
| `slug` | `varchar(220)` | No | — |
| `short_description` | `text` | Sí | `NULL` |
| `description` | `text` | No | — |
| `objectives` | `text` | Sí | `NULL` |
| `contents_overview` | `text` | Sí | `NULL` |
| `duration_text` | `varchar(100)` | Sí | `NULL` |
| `academic_hours` | `numeric(6,2)` | Sí | `NULL` |
| `banner_path` | `text` | Sí | `NULL` |
| `is_free` | `boolean` | No | `false` |
| `general_price` | `numeric(10,2)` | No | `0` |
| `member_price` | `numeric(10,2)` | No | `0` |
| `status` | `course_status` | No | `'draft'` |
| `published_at` | `timestamptz` | Sí | `NULL` |
| `created_by` | `uuid` | Sí | `NULL` |
| `updated_by` | `uuid` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Slug:

```sql
CREATE UNIQUE INDEX uq_courses_slug_active
ON courses(slug)
WHERE deleted_at IS NULL;
```

---

# 19. Tabla `course_instructors`

Relaciona cursos con los expositores/instructores registrados.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `course_id` | `uuid` | No | — |
| `speaker_id` | `uuid` | No | — |
| `is_primary` | `boolean` | No | `false` |
| `role_label` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Índice:

```sql
CREATE UNIQUE INDEX uq_course_instructor_active
ON course_instructors(course_id, speaker_id)
WHERE deleted_at IS NULL;
```

---

# 20. Estructura académica corregida

La estructura definitiva será:

```text
COURSE
│
├── COURSE_MODULE
│   │
│   ├── LESSON
│   │   └── VIDEO
│   │
│   ├── LESSON
│   │   └── VIDEO
│   │
│   └── QUIZ
│
├── COURSE_MODULE
│   ├── LESSON
│   │   └── VIDEO
│   └── QUIZ
│
└── COURSE_MATERIALS
    ├── PDF
    ├── Archivo
    ├── Enlace
    └── Recurso
```

Los materiales corresponden al curso completo.

Por tanto, se elimina completamente:

```text
lesson_materials
```

y se utiliza:

```text
course_materials
```

---

# 21. Tabla `course_modules`

Representa los módulos de un curso.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `course_id` | `uuid` | No | — |
| `title` | `varchar(200)` | No | — |
| `description` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `is_published` | `boolean` | No | `false` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Relación:

```text
courses 1:N course_modules
```

Índice:

```text
(course_id, sort_order)
```

---

# 22. Tabla `lessons`

Cada clase pertenece a un módulo.

Cada clase tendrá su propio video.

Ejemplo:

```text
Módulo 1
├── Clase 1.1 → Video
├── Clase 1.2 → Video
└── Clase 1.3 → Video
```

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `module_id` | `uuid` | No | — |
| `title` | `varchar(200)` | No | — |
| `description` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `video_provider` | `varchar(50)` | Sí | `NULL` |
| `video_asset_id` | `text` | Sí | `NULL` |
| `video_storage_path` | `text` | Sí | `NULL` |
| `duration_seconds` | `integer` | Sí | `NULL` |
| `is_required` | `boolean` | No | `true` |
| `is_published` | `boolean` | No | `false` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CHECK (
  duration_seconds IS NULL
  OR duration_seconds > 0
);
```

---

# 23. Tabla `course_materials`

## Finalidad

Contiene todos los materiales complementarios disponibles para el curso.

Los materiales no pertenecen individualmente a una clase.

Relación:

```text
courses 1:N course_materials
```

Ejemplo de interfaz:

```text
Curso de Marketing Digital

Contenido
├── Módulo 1
│   ├── Clase 1.1
│   ├── Clase 1.2
│   └── Clase 1.3
│
└── Módulo 2
    ├── Clase 2.1
    └── Clase 2.2

Materiales
├── Manual del curso.pdf
├── Presentación.pdf
├── Plantilla.xlsx
└── Recursos adicionales
```

## Campos

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `course_id` | `uuid` | No | — |
| `title` | `varchar(200)` | No | — |
| `description` | `text` | Sí | `NULL` |
| `material_type` | `material_type` | No | — |
| `storage_path` | `text` | Sí | `NULL` |
| `external_url` | `text` | Sí | `NULL` |
| `mime_type` | `text` | Sí | `NULL` |
| `file_size_bytes` | `bigint` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Regla:

Si:

```text
material_type = file
```

deberá existir:

```text
storage_path
```

Si:

```text
material_type = external_link
```

deberá existir:

```text
external_url
```

Restricción conceptual:

```sql
CHECK (
    (material_type = 'file'
     AND storage_path IS NOT NULL
     AND external_url IS NULL)

 OR (material_type = 'external_link'
     AND external_url IS NOT NULL
     AND storage_path IS NULL)
);
```

Los materiales no afectan el porcentaje de avance ni la finalización del curso, tal como se estableció funcionalmente.

---

# 24. Tabla `course_enrollments`

Representa la habilitación de un curso para una persona.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `course_id` | `uuid` | No | — |
| `person_id` | `uuid` | No | — |
| `status` | `course_enrollment_status` | No | `'active'` |
| `registration_type` | `registration_type` | No | `'general'` |
| `price_snapshot` | `numeric(10,2)` | No | `0` |
| `progress_percent` | `numeric(5,2)` | No | `0` |
| `access_granted_at` | `timestamptz` | No | `now()` |
| `access_granted_by` | `uuid` | Sí | `NULL` |
| `completed_at` | `timestamptz` | Sí | `NULL` |
| `revoked_at` | `timestamptz` | Sí | `NULL` |
| `revoked_by` | `uuid` | Sí | `NULL` |
| `revocation_reason` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CHECK (
  progress_percent >= 0
  AND progress_percent <= 100
);
```

Matrícula única activa:

```sql
CREATE UNIQUE INDEX uq_course_enrollment_active
ON course_enrollments(course_id, person_id)
WHERE deleted_at IS NULL;
```

---

# 25. Tabla `lesson_progress`

Registra el progreso individual de cada clase.

La clase se considerará completada cuando alcance el 90 % de visualización.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `enrollment_id` | `uuid` | No | — |
| `lesson_id` | `uuid` | No | — |
| `watched_seconds` | `integer` | No | `0` |
| `last_position_seconds` | `integer` | No | `0` |
| `duration_seconds_snapshot` | `integer` | Sí | `NULL` |
| `completion_percent` | `numeric(5,2)` | No | `0` |
| `is_completed` | `boolean` | No | `false` |
| `completed_at` | `timestamptz` | Sí | `NULL` |
| `last_watched_at` | `timestamptz` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricciones:

```sql
CHECK (watched_seconds >= 0);

CHECK (last_position_seconds >= 0);

CHECK (
  completion_percent >= 0
  AND completion_percent <= 100
);
```

Registro único:

```sql
CREATE UNIQUE INDEX uq_lesson_progress_active
ON lesson_progress(enrollment_id, lesson_id)
WHERE deleted_at IS NULL;
```

---

# 26. Tabla `quizzes`

Cada módulo puede tener opcionalmente un quiz.

En el MVP habrá como máximo un quiz activo por módulo.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `module_id` | `uuid` | No | — |
| `title` | `varchar(200)` | No | — |
| `description` | `text` | Sí | `NULL` |
| `passing_score` | `smallint` | No | `80` |
| `unlimited_attempts` | `boolean` | No | `true` |
| `is_published` | `boolean` | No | `false` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CHECK (
  passing_score >= 0
  AND passing_score <= 100
);
```

MVP:

```text
passing_score = 80
unlimited_attempts = true
```

Quiz único:

```sql
CREATE UNIQUE INDEX uq_module_quiz_active
ON quizzes(module_id)
WHERE deleted_at IS NULL;
```

---

# 27. Tabla `quiz_questions`

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `quiz_id` | `uuid` | No | — |
| `prompt` | `text` | No | — |
| `explanation` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `is_active` | `boolean` | No | `true` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

---

# 28. Tabla `quiz_options`

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `question_id` | `uuid` | No | — |
| `option_text` | `text` | No | — |
| `is_correct` | `boolean` | No | `false` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Regla:

Cada pregunta deberá tener:

```text
mínimo 2 alternativas
exactamente 1 correcta
```

`is_correct` no deberá enviarse al navegador antes de resolver el quiz.

---

# 29. Tabla `quiz_attempts`

Conserva todos los intentos.

Los intentos no se sobrescriben.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `quiz_id` | `uuid` | No | — |
| `enrollment_id` | `uuid` | No | — |
| `attempt_number` | `integer` | No | — |
| `score_percent` | `numeric(5,2)` | No | — |
| `correct_answers` | `integer` | No | — |
| `total_questions` | `integer` | No | — |
| `passed` | `boolean` | No | — |
| `submitted_at` | `timestamptz` | No | `now()` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Índice:

```sql
CREATE UNIQUE INDEX uq_quiz_attempt_number_active
ON quiz_attempts(
  quiz_id,
  enrollment_id,
  attempt_number
)
WHERE deleted_at IS NULL;
```

---

# 30. Tabla `quiz_attempt_answers`

Conserva las respuestas de cada intento.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `attempt_id` | `uuid` | No | — |
| `question_id` | `uuid` | No | — |
| `selected_option_id` | `uuid` | No | — |
| `question_text_snapshot` | `text` | No | — |
| `selected_option_text_snapshot` | `text` | No | — |
| `is_correct` | `boolean` | No | — |
| `created_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Se conservan snapshots para evitar que modificaciones futuras cambien el historial del intento.

---

# 31. Tabla `course_ratings`

La valoración estará disponible únicamente después de completar un curso.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `course_id` | `uuid` | No | — |
| `person_id` | `uuid` | No | — |
| `enrollment_id` | `uuid` | No | — |
| `rating` | `smallint` | No | — |
| `comment` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Restricción:

```sql
CHECK (
  rating BETWEEN 1 AND 5
);
```

Una valoración activa por persona/curso:

```sql
CREATE UNIQUE INDEX uq_course_rating_active
ON course_ratings(course_id, person_id)
WHERE deleted_at IS NULL;
```

---

# 32. Tabla `certificate_templates`

Configuración de las plantillas institucionales.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `name` | `varchar(150)` | No | — |
| `scope` | `certificate_type` | No | — |
| `background_path` | `text` | Sí | `NULL` |
| `template_config` | `jsonb` | No | `'{}'` |
| `is_default` | `boolean` | No | `false` |
| `is_active` | `boolean` | No | `true` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

`template_config` podrá guardar configuración visual de la plantilla.

---

# 33. Tabla `certificate_template_signers`

Firmantes asociados a una plantilla.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `template_id` | `uuid` | No | — |
| `signer_name` | `varchar(200)` | No | — |
| `signer_title` | `text` | Sí | `NULL` |
| `signature_path` | `text` | Sí | `NULL` |
| `sort_order` | `integer` | No | `0` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

---

# 34. Tabla `certificates`

Almacena certificados de actividades y cursos.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `person_id` | `uuid` | No | — |
| `template_id` | `uuid` | No | — |
| `registration_id` | `uuid` | Sí | `NULL` |
| `course_enrollment_id` | `uuid` | Sí | `NULL` |
| `certificate_type` | `certificate_type` | No | — |
| `certificate_code` | `varchar(50)` | No | — |
| `status` | `certificate_status` | No | `'issued'` |
| `participant_name_snapshot` | `text` | No | — |
| `title_snapshot` | `text` | No | — |
| `condition_snapshot` | `text` | Sí | `NULL` |
| `date_text_snapshot` | `text` | Sí | `NULL` |
| `academic_hours_snapshot` | `numeric(6,2)` | Sí | `NULL` |
| `file_path` | `text` | Sí | `NULL` |
| `access_token` | `uuid` | No | `gen_random_uuid()` |
| `issued_at` | `timestamptz` | No | `now()` |
| `issued_by` | `uuid` | Sí | `NULL` |
| `revoked_at` | `timestamptz` | Sí | `NULL` |
| `revoked_by` | `uuid` | Sí | `NULL` |
| `revocation_reason` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Debe existir exactamente un origen:

```sql
CHECK (
    (
      registration_id IS NOT NULL
      AND course_enrollment_id IS NULL
    )
 OR (
      registration_id IS NULL
      AND course_enrollment_id IS NOT NULL
    )
);
```

Códigos:

```sql
UNIQUE(certificate_code);
UNIQUE(access_token);
```

---

# 35. Tabla `notification_outbox`

Cola de correos y automatizaciones.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `person_id` | `uuid` | Sí | `NULL` |
| `event_type` | `text` | No | — |
| `recipient_email` | `text` | No | — |
| `related_entity_type` | `text` | Sí | `NULL` |
| `related_entity_id` | `uuid` | Sí | `NULL` |
| `payload` | `jsonb` | No | `'{}'` |
| `status` | `notification_status` | No | `'pending'` |
| `attempts` | `integer` | No | `0` |
| `next_attempt_at` | `timestamptz` | Sí | `NULL` |
| `last_error` | `text` | Sí | `NULL` |
| `sent_at` | `timestamptz` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Eventos iniciales:

```text
activity_free_registration_confirmed
activity_paid_preregistration_created
activity_paid_registration_confirmed
activity_certificate_issued
course_certificate_issued
```

---

# 36. Tabla `app_settings`

Configuración funcional de la aplicación.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `setting_key` | `varchar(150)` | No | — |
| `setting_value` | `jsonb` | No | — |
| `description` | `text` | Sí | `NULL` |
| `is_public` | `boolean` | No | `false` |
| `updated_by` | `uuid` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |
| `updated_at` | `timestamptz` | No | `now()` |
| `deleted_at` | `timestamptz` | Sí | `NULL` |
| `deleted_by` | `uuid` | Sí | `NULL` |

Índice:

```sql
CREATE UNIQUE INDEX uq_app_setting_key_active
ON app_settings(setting_key)
WHERE deleted_at IS NULL;
```

Nunca deberán almacenarse aquí secretos o API keys.

---

# 37. Tabla `audit_logs`

Registra las operaciones administrativas sensibles.

| Campo | Tipo | Nulo | Default |
|---|---|---:|---|
| `id` | `uuid` | No | `gen_random_uuid()` |
| `actor_user_id` | `uuid` | Sí | `NULL` |
| `action` | `varchar(150)` | No | — |
| `entity_type` | `varchar(100)` | No | — |
| `entity_id` | `uuid` | Sí | `NULL` |
| `old_data` | `jsonb` | Sí | `NULL` |
| `new_data` | `jsonb` | Sí | `NULL` |
| `metadata` | `jsonb` | Sí | `NULL` |
| `ip_address` | `inet` | Sí | `NULL` |
| `user_agent` | `text` | Sí | `NULL` |
| `created_at` | `timestamptz` | No | `now()` |

Esta tabla será:

```text
append-only
```

No tendrá:

```text
deleted_at
deleted_by
```

porque los registros de auditoría no deberán borrarse mediante operaciones normales.

---

# 38. Modelo relacional resumido

## Actividades

```text
CATEGORIES
     │
     ▼
ACTIVITIES
 ├── ACTIVITY_DATES
 ├── ACTIVITY_SPEAKERS ── SPEAKERS
 └── REGISTRATIONS
       └── ATTENDANCE
```

## Campus

```text
COURSES
│
├── COURSE_INSTRUCTORS ── SPEAKERS
│
├── COURSE_MODULES
│   │
│   ├── LESSONS
│   │     └── VIDEO
│   │
│   └── QUIZZES
│         └── QUIZ_QUESTIONS
│                └── QUIZ_OPTIONS
│
├── COURSE_MATERIALS
│
└── COURSE_ENROLLMENTS
      ├── LESSON_PROGRESS
      ├── QUIZ_ATTEMPTS
      │      └── QUIZ_ATTEMPT_ANSWERS
      ├── COURSE_RATINGS
      └── CERTIFICATES
```

---

# 39. Finalización del curso

Los materiales del curso no intervienen en la finalización.

Un curso estará completado cuando:

```text
TODAS las clases obligatorias
tengan progreso >= 90 %
```

y:

```text
TODOS los quizzes existentes
hayan sido aprobados >= 80 %
```

Si no existen quizzes:

```text
solo se requieren las clases obligatorias
```

Esta regla coincide con la definición funcional del MVP.

---

# 40. Función `register_activity`

La inscripción deberá ser transaccional.

Responsabilidades:

1. localizar o crear persona;
2. comprobar actividad;
3. comprobar periodo de inscripción;
4. comprobar duplicidad;
5. comprobar cupos;
6. determinar público general/asociado;
7. determinar precio;
8. generar código;
9. insertar inscripción;
10. determinar `pending` o `confirmed`;
11. crear asistencia `pending`;
12. crear notificación.

Actividades gratuitas:

```text
confirmed
```

Actividades con costo:

```text
pending
```

---

# 41. Función `enroll_free_course`

Responsabilidades:

1. identificar usuario;
2. recuperar persona;
3. comprobar curso;
4. comprobar que esté publicado;
5. comprobar que sea gratuito;
6. impedir matrícula duplicada;
7. crear `course_enrollment`.

---

# 42. Función `update_lesson_progress`

Responsabilidades:

1. validar matrícula;
2. validar clase;
3. registrar progreso;
4. actualizar posición;
5. calcular porcentaje;
6. marcar completado al 90 %;
7. recalcular progreso global;
8. llamar a `check_course_completion`.

---

# 43. Función `submit_quiz_attempt`

Responsabilidades:

1. recibir respuestas;
2. recuperar respuestas correctas internamente;
3. calcular resultado;
4. generar número de intento;
5. crear `quiz_attempt`;
6. crear `quiz_attempt_answers`;
7. determinar aprobación;
8. devolver resultado;
9. comprobar finalización del curso.

La corrección no deberá depender del navegador.

---

# 44. Función `check_course_completion`

Comprobará:

```text
lessons obligatorias completadas
AND
quizzes existentes aprobados
```

Si se cumple:

```text
course_enrollments.status = completed
progress_percent = 100
completed_at = now()
```

Luego se ejecutará la emisión automática del certificado.

---

# 45. Materiales y progreso

La descarga, apertura o lectura de:

```text
course_materials
```

no generará:

- porcentaje;
- estado de completado;
- condición de aprobación.

Por tanto no será necesaria una tabla:

```text
material_progress
```

en el MVP.

---

# 46. Índices prioritarios

```text
people(document_type, document_number)

people(email)

activities(type, status)

activities(category_id)

activities(published_at)

activity_dates(activity_id, starts_at)

registrations(activity_id, status)

registrations(person_id)

registrations(registration_code)

attendance(registration_id)

courses(status)

courses(slug)

course_modules(course_id, sort_order)

lessons(module_id, sort_order)

course_materials(course_id, sort_order)

course_enrollments(person_id, status)

course_enrollments(course_id)

lesson_progress(enrollment_id, lesson_id)

quizzes(module_id)

quiz_questions(quiz_id, sort_order)

quiz_options(question_id, sort_order)

quiz_attempts(enrollment_id, quiz_id)

certificates(person_id)

certificates(certificate_code)

notification_outbox(status, next_attempt_at)

audit_logs(entity_type, entity_id)

audit_logs(actor_user_id)

audit_logs(created_at)
```

---

# 47. Triggers

Se recomienda un trigger común:

```text
set_updated_at()
```

que mantenga automáticamente:

```text
updated_at = now()
```

en tablas modificables.

---

# 48. Historial institucional

`people` continuará siendo el núcleo del historial.

```text
PEOPLE
│
├── REGISTRATIONS
│   ├── ACTIVITIES
│   ├── ATTENDANCE
│   └── CERTIFICATES
│
└── COURSE_ENROLLMENTS
    ├── COURSES
    ├── LESSON_PROGRESS
    ├── QUIZ_ATTEMPTS
    ├── COURSE_RATINGS
    └── CERTIFICATES
```

Esto permitirá que una persona que inicialmente participe sin cuenta pueda posteriormente crear una cuenta y mantener todo su historial.

---

# 49. Resultado final del modelo académico

La estructura definitiva queda establecida como:

```text
COURSE
│
├── información general
│
├── instructores
│
├── módulos
│   │
│   ├── clases
│   │    └── un video por clase
│   │
│   └── quiz opcional
│
├── materiales generales del curso
│
├── alumnos
│
├── progreso por clase
│
├── intentos de quiz
│
├── valoración
│
└── certificados
```

Por tanto:

```text
course_materials → courses
```

y **no**:

```text
lesson_materials → lessons
```

---

# 50. Conclusión

El modelo corregido mantiene una sola entidad `activities` para eventos y capacitaciones porque ambos comparten prácticamente toda la estructura y los procesos.

La diferenciación correcta será:

```text
activities.type
```

para distinguir:

```text
event
training
```

mientras:

```text
activities.category_id
```

indicará únicamente la temática de la actividad.

El dominio académico queda organizado mediante:

```text
courses
→ course_modules
→ lessons
```

Cada clase tendrá su video correspondiente.

Los materiales pasan a ser recursos generales del curso:

```text
courses
→ course_materials
```

de manera que el alumno disponga de un apartado independiente de **Materiales** donde pueda consultar todos los recursos disponibles.

Estos materiales no afectarán el progreso ni las reglas de finalización.

El soft delete continuará siendo transversal mediante:

```text
deleted_at
deleted_by
```

y los estados funcionales continuarán utilizándose para preservar adecuadamente el historial institucional.

Con estas correcciones, este modelo queda como la versión base recomendada para elaborar las primeras migraciones SQL de Supabase.
