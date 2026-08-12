# HITO 7 — GESTIÓN DE CURSOS Y CONTENIDO DEL CAMPUS

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 7 tiene como finalidad implementar la estructura funcional y administrativa principal del **Campus Virtual de cursos grabados**.

En el Hito 6 ya deberá existir:

- registro de usuarios;
- login;
- recuperación de contraseña;
- vínculo entre `auth.users`, `user_accounts` y `people`;
- protección del Campus;
- protección administrativa;
- perfil básico.

A partir del Hito 7 comenzará la construcción del contenido académico que utilizarán los alumnos autenticados.

El hito deberá permitir que la Cámara pueda:

- crear cursos;
- editar cursos;
- publicar cursos;
- asignar instructores;
- crear módulos;
- crear clases;
- asociar un video a cada clase;
- agregar materiales generales al curso;
- administrar alumnos;
- habilitar acceso a cursos;
- revocar acceso;
- consultar la estructura académica.

Paralelamente, el alumno deberá poder:

- consultar el catálogo público de cursos;
- visualizar el detalle de un curso;
- ingresar al Campus;
- consultar sus cursos habilitados;
- abrir un curso;
- navegar por sus módulos;
- abrir clases;
- reproducir sus videos;
- consultar materiales generales.

En este hito todavía **no se implementará el cálculo completo de progreso ni la regla del 90 %**. Esa funcionalidad pertenece al Hito 8.

Tampoco se implementarán todavía los quizzes, que serán desarrollados en el Hito 9.

---

# 2. Objetivo del hito

Implementar el núcleo académico del Campus Virtual, permitiendo crear, publicar, organizar y consumir cursos grabados.

Al finalizar el hito deberá funcionar el recorrido:

**Administrador crea curso → Asigna instructor → Crea módulos → Crea clases → Configura videos → Agrega materiales → Publica → Habilita alumno → Alumno inicia sesión → Ve “Mis cursos” → Accede al curso → Navega contenido.**

El modelo académico deberá respetar la estructura corregida del proyecto:

```text
COURSE
│
├── COURSE_MODULES
│   │
│   ├── LESSON
│   │   └── VIDEO
│   │
│   ├── LESSON
│   │   └── VIDEO
│   │
│   └── QUIZ opcional
│
└── COURSE_MATERIALS
```

Los materiales serán **generales del curso**, no materiales individuales de cada clase.

---

# 3. Alcance del hito

El Hito 7 comprende:

- modelo de cursos;
- instructores;
- módulos;
- clases;
- videos;
- materiales generales;
- matrículas/habilitaciones;
- administración de cursos;
- administración de estructura académica;
- catálogo público;
- detalle público;
- sección “Mis cursos”;
- navegación del alumno;
- acceso a clases;
- reproducción inicial de video;
- acceso a materiales;
- cursos gratuitos;
- cursos con costo;
- habilitación manual;
- revocación de acceso.

No comprende todavía:

- progreso automático;
- posición persistente del video;
- regla del 90 %;
- quizzes;
- intentos;
- calificación del 80 %;
- finalización automática;
- certificados automáticos de curso;
- valoraciones.

---

# 4. Modelo académico definitivo

La estructura aprobada deberá ser:

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
├── progreso
│
├── intentos de quiz
│
├── valoración
│
└── certificados
```

En este hito se implementará únicamente la parte correspondiente a:

```text
curso
instructores
módulos
clases
videos
materiales
alumnos/habilitaciones
```

El resto será incorporado en hitos posteriores.

---

# 5. Tareas del hito

## 5.1 Crear enum `course_status`

Crear:

```text
draft
published
archived
```

---

# 6. Crear enum `course_enrollment_status`

Crear:

```text
active
completed
revoked
```

En este hito se utilizarán principalmente:

```text
active
revoked
```

`completed` será utilizado funcionalmente en los siguientes hitos.

---

# 7. Crear enum `material_type`

Crear:

```text
file
external_link
```

Esto permitirá almacenar tanto archivos como recursos externos.

---

# 8. Crear tabla `courses`

## Objetivo

Representar la entidad principal del Campus Virtual.

## Campos

Implementar:

```text
id
title
slug
short_description
description
objectives
contents_overview
duration_text
academic_hours
banner_path
is_free
general_price
member_price
status
published_at
created_by
updated_by
created_at
updated_at
deleted_at
deleted_by
```

La estructura deberá seguir el diseño físico corregido.

---

# 9. Restricciones de `courses`

Implementar reglas equivalentes a:

```text
general_price >= 0
member_price >= 0
academic_hours >= 0 cuando exista
```

Si:

```text
is_free = true
```

los precios deberán mantenerse coherentes con la condición gratuita.

---

# 10. Slug de curso

Cada curso deberá tener un slug público.

Ejemplo:

```text
marketing-digital-para-empresas
```

El slug deberá ser único entre cursos activos.

Implementar el índice parcial correspondiente considerando soft delete.

---

# 11. Estado del curso

## `draft`

Curso en preparación.

No deberá mostrarse como curso disponible al público.

## `published`

Curso visible públicamente.

## `archived`

Curso retirado del catálogo operativo, pero conservado históricamente.

El estado deberá ser independiente de `deleted_at`.

---

# 12. Crear tabla `course_instructors`

## Objetivo

Relacionar cursos con instructores reutilizables registrados en:

`speakers`

Relación:

```text
COURSES
    │
COURSE_INSTRUCTORS
    │
SPEAKERS
```

## Campos

```text
id
course_id
speaker_id
is_primary
role_label
sort_order
created_at
updated_at
deleted_at
deleted_by
```

---

# 13. Instructor principal

La relación deberá permitir indicar:

```text
is_primary = true
```

cuando un expositor sea el instructor principal del curso.

También podrán existir instructores secundarios.

---

# 14. Reutilizar `speakers`

No deberá crearse una nueva tabla independiente para docentes del Campus.

La misma entidad:

`speakers`

deberá reutilizarse para:

- expositores de eventos;
- docentes;
- instructores de cursos.

Esto permite mantener un historial común de profesionales.

---

# 15. Crear tabla `course_modules`

## Objetivo

Organizar el curso en módulos.

## Campos

```text
id
course_id
title
description
sort_order
is_published
created_at
updated_at
deleted_at
deleted_by
```

Relación:

```text
courses 1:N course_modules
```

---

# 16. Orden de módulos

Cada módulo deberá utilizar:

`sort_order`

para determinar su posición.

Ejemplo:

```text
Módulo 1
Módulo 2
Módulo 3
```

El orden no deberá depender de:

- fecha de creación;
- UUID;
- nombre alfabético.

---

# 17. Publicación independiente de módulo

`is_published`

permitirá controlar si un módulo se encuentra disponible para el alumno.

Un módulo no publicado no deberá aparecer normalmente en el Campus del estudiante.

---

# 18. Crear tabla `lessons`

## Objetivo

Representar cada clase perteneciente a un módulo.

La estructura será:

```text
Módulo 1
├── Clase 1.1
├── Clase 1.2
└── Clase 1.3
```

Cada clase deberá tener su propio video.

---

# 19. Campos de `lessons`

Implementar:

```text
id
module_id
title
description
sort_order
video_provider
video_asset_id
video_storage_path
duration_seconds
is_required
is_published
created_at
updated_at
deleted_at
deleted_by
```

---

# 20. Video por clase

Cada clase podrá contener la información necesaria para identificar su video.

El modelo deberá soportar:

- proveedor;
- identificador externo;
- ruta de almacenamiento;
- duración.

La solución deberá poder adaptarse a la decisión de infraestructura multimedia que se tome.

---

# 21. Proveedor de video

El diseño técnico todavía no fija definitivamente si los videos utilizarán:

- Supabase Storage;
- proveedor especializado;
- almacenamiento externo.

Por lo tanto, el modelo deberá mantener flexibilidad mediante:

```text
video_provider
video_asset_id
video_storage_path
```

La selección concreta del proveedor deberá definirse antes o durante la implementación efectiva del reproductor.

---

# 22. Duración del video

Cuando exista:

```text
duration_seconds > 0
```

La duración será posteriormente necesaria para el cálculo del progreso.

En este hito deberá almacenarse correctamente, aunque la regla del 90 % se implementará en el Hito 8.

---

# 23. Clase obligatoria

`is_required`

indicará si la clase será necesaria para completar posteriormente el curso.

Valor predeterminado:

```text
true
```

La lógica completa de finalización se implementará más adelante.

---

# 24. Publicación de clase

`is_published`

deberá controlar si la clase aparece disponible para el alumno.

No deberá mostrarse normalmente contenido no publicado.

---

# 25. Crear tabla `course_materials`

## Objetivo

Almacenar los materiales complementarios generales del curso.

**Los materiales no pertenecen a cada clase.**

Esta es la corrección definitiva del modelo académico.

---

# 26. Campos de `course_materials`

Implementar:

```text
id
course_id
title
description
material_type
storage_path
external_url
mime_type
file_size_bytes
sort_order
created_at
updated_at
deleted_at
deleted_by
```

---

# 27. Material tipo archivo

Cuando:

```text
material_type = file
```

deberá existir:

```text
storage_path
```

y no deberá utilizarse simultáneamente `external_url`.

---

# 28. Material tipo enlace

Cuando:

```text
material_type = external_link
```

deberá existir:

```text
external_url
```

y no deberá utilizarse simultáneamente `storage_path`.

La restricción correspondiente deberá implementarse en PostgreSQL.

---

# 29. Materiales no afectan progreso

En este hito deberá mantenerse expresamente la regla:

**abrir, descargar o consultar materiales no afecta el progreso del curso.**

No deberá crearse:

`material_progress`

dentro del MVP.

---

# 30. Crear tabla `course_enrollments`

## Objetivo

Representar qué cursos tiene habilitados una persona.

Relación:

```text
PEOPLE
   │
   ▼
COURSE_ENROLLMENTS
   │
   ▼
COURSES
```

Esta tabla constituye la matrícula o habilitación de acceso.

---

# 31. Campos de `course_enrollments`

Implementar:

```text
id
course_id
person_id
status
registration_type
price_snapshot
progress_percent
access_granted_at
access_granted_by
completed_at
revoked_at
revoked_by
revocation_reason
created_at
updated_at
deleted_at
deleted_by
```

Aunque algunos campos se utilizarán completamente en hitos posteriores, deberán formar parte del modelo aprobado.

---

# 32. Matrícula única

Una persona deberá tener como máximo una matrícula activa por curso.

Implementar el índice único parcial:

```text
course_id + person_id
```

considerando soft delete.

---

# 33. Estado inicial de matrícula

Una matrícula habilitada deberá comenzar normalmente con:

```text
status = active
```

En el Hito 8 y posteriores podrá pasar a:

```text
completed
```

Cuando se retire acceso:

```text
revoked
```

---

# 34. Precio histórico

`price_snapshot`

deberá almacenar el precio correspondiente al momento de habilitar el curso.

No deberá depender posteriormente del precio actual del catálogo.

---

# 35. Tipo de matrícula

Reutilizar:

`registration_type`

con:

```text
general
member
```

Esto permitirá conservar si el usuario fue habilitado como público general o asociado.

---

# 36. Cursos gratuitos

El análisis funcional establece:

```text
Usuario autenticado
↓
Curso gratuito
↓
Inscribirse
↓
Habilitación inmediata
```

Por tanto deberá implementarse una función equivalente a:

`enroll_free_course()`.

---

# 37. Crear función `enroll_free_course()`

La función deberá:

1. identificar al usuario autenticado;
2. obtener su `person_id`;
3. comprobar que el curso existe;
4. comprobar que está publicado;
5. comprobar que es gratuito;
6. evitar matrícula duplicada;
7. crear `course_enrollment`;
8. establecer estado `active`;
9. registrar acceso.

La operación podrá ejecutarse mediante RPC desde Supabase.

---

# 38. Cursos con costo

Para cursos con costo no se implementará pago integrado.

El flujo será:

```text
Usuario
↓
Consulta curso
↓
Coordina externamente con CCI
↓
CCI valida
↓
Administrador habilita curso
↓
Curso aparece en Mis cursos
```

Esta regla debe mantenerse dentro del MVP.

---

# 39. Habilitación administrativa

El administrador deberá poder seleccionar una persona y un curso y crear la matrícula correspondiente.

La operación deberá establecer:

```text
status = active
access_granted_at
access_granted_by
```

y el precio correspondiente.

---

# 40. Revocación de curso

La administración deberá poder retirar acceso a un curso.

La operación deberá establecer:

```text
status = revoked
revoked_at
revoked_by
revocation_reason
```

No deberá eliminarse la matrícula.

---

# 41. Revocación ≠ soft delete

Una matrícula revocada deberá preservarse históricamente.

Por lo tanto:

```text
status = revoked
```

no equivale a:

```text
deleted_at IS NOT NULL
```

---

# 42. Administración de cursos

Crear:

`/admin/cursos`

Desde esta sección deberá ser posible:

- listar cursos;
- buscar;
- filtrar;
- crear;
- editar;
- publicar;
- archivar;
- acceder al contenido;
- administrar alumnos.

---

# 43. Crear nuevo curso

Crear:

`/admin/cursos/nuevo`

El formulario deberá permitir administrar como mínimo:

- título;
- slug;
- descripción corta;
- descripción;
- objetivos;
- resumen de contenidos;
- duración;
- horas académicas;
- portada;
- gratuita/con costo;
- precio general;
- precio asociado;
- instructor.

---

# 44. Editar curso

Crear:

`/admin/cursos/[id]`

o las subrutas definidas en la navegación del proyecto.

La administración deberá poder acceder a secciones equivalentes a:

```text
Información
Módulos
Materiales
Alumnos
Progreso
```

La sección de progreso todavía podrá estar vacía o preparada para el Hito 8.

---

# 45. Gestión de instructores

El administrador deberá poder:

- seleccionar expositor existente;
- agregar uno o varios;
- indicar principal;
- indicar rol;
- establecer orden.

No deberá duplicarse el registro del instructor.

---

# 46. Gestión de módulos

Crear una ruta equivalente a:

`/admin/cursos/[id]/modulos`

Permitir:

- listar módulos;
- crear;
- editar;
- ordenar;
- publicar/no publicar;
- eliminar lógicamente.

---

# 47. Crear módulo

Crear una ruta equivalente a:

`/admin/cursos/[id]/modulos/nuevo`

Solicitar:

- título;
- descripción;
- orden;
- publicación.

---

# 48. Gestión de clases

Desde un módulo deberá poder consultarse y administrar sus clases.

Permitir:

- crear;
- editar;
- ordenar;
- publicar;
- ocultar;
- eliminar lógicamente;
- configurar video.

---

# 49. Crear clase

Crear una ruta equivalente a:

`/admin/cursos/[id]/modulos/[moduleId]/clases/nueva`

Solicitar:

- título;
- descripción;
- orden;
- video;
- duración;
- obligatoria;
- publicada.

---

# 50. Gestión de materiales

Crear:

`/admin/cursos/[id]/materiales`

La pantalla deberá permitir:

- listar materiales;
- crear material tipo archivo;
- crear material tipo enlace;
- editar;
- ordenar;
- eliminar lógicamente.

---

# 51. Subida de archivos

Los materiales de tipo archivo deberán almacenarse mediante Supabase Storage u otra solución coherente con la arquitectura aprobada.

Se deberá guardar en PostgreSQL únicamente:

- ruta;
- metadata;
- tamaño;
- MIME type.

No deberá almacenarse el binario dentro de la tabla.

---

# 52. Materiales privados

Los materiales del Campus deberán considerarse contenido restringido.

Aunque las políticas RLS/Storage completas se desarrollarán en el Hito 11, la estructura deberá quedar preparada para que solamente alumnos habilitados puedan acceder en producción.

---

# 53. Gestión de alumnos

Crear:

`/admin/cursos/[id]/alumnos`

La administración deberá poder:

- buscar persona;
- consultar usuarios;
- habilitar curso;
- ver alumnos habilitados;
- consultar estado;
- revocar acceso.

---

# 54. Buscar alumno

La administración deberá poder localizar personas mediante:

- documento;
- nombre;
- correo.

La matrícula deberá relacionarse siempre con:

`people.id`

y no directamente con `auth.users.id`.

Esto mantiene el modelo institucional centralizado.

---

# 55. Requisito de cuenta para Campus

Aunque `course_enrollments` se relaciona con `people`, para consumir un curso desde el Campus la persona deberá tener una cuenta autenticada.

Por tanto, deberá existir:

```text
people
↕
user_accounts
↕
auth.users
```

para el alumno que accede al contenido.

---

# 56. Catálogo público de cursos

Crear:

`/cursos`

Los visitantes, incluso sin cuenta, deberán poder consultar los cursos publicados.

La página deberá mostrar únicamente cursos visibles según el estado correspondiente.

---

# 57. Tarjeta de curso

Crear un organismo reutilizable equivalente a:

`CourseCard`

Podrá mostrar:

- imagen;
- título;
- instructor;
- duración;
- precio;
- condición gratuita;
- precio asociado;
- información breve.

No deberá consultar Supabase directamente dentro del componente.

---

# 58. Detalle público del curso

Crear:

`/cursos/[slug]`

La página deberá mostrar:

- nombre;
- portada;
- descripción;
- objetivos;
- instructor;
- contenido general;
- módulos visibles cuando corresponda;
- duración;
- horas académicas;
- precio general;
- precio asociado;
- condición gratuita/con costo.

Cualquier visitante deberá poder consultar esta información sin login.

---

# 59. CTA para curso gratuito

Si el curso es gratuito:

## Usuario no autenticado

Mostrar una acción equivalente a:

**Registrarme / Iniciar sesión para acceder**

## Usuario autenticado sin matrícula

Mostrar:

**Inscribirme gratis**

Al ejecutarla deberá utilizar:

`enroll_free_course()`.

## Usuario ya matriculado

Mostrar:

**Ir al curso**

---

# 60. CTA para curso con costo

Cuando el curso tenga costo:

La interfaz deberá indicar la necesidad de coordinación con la Cámara.

No deberá existir pasarela de pago.

Si posteriormente administración habilita el acceso:

**Ir al curso**

deberá quedar disponible.

---

# 61. Crear “Mis cursos”

Crear:

`/campus/cursos`

Esta página deberá consultar:

```text
people
↓
course_enrollments
↓
courses
```

y mostrar los cursos habilitados para el usuario autenticado.

---

# 62. Estados visibles de matrícula

En este hito deberán manejarse al menos:

## `active`

Curso disponible.

## `revoked`

Acceso retirado.

`completed` se utilizará plenamente en hitos posteriores.

Un curso revocado no deberá permitir continuar consumiendo contenido.

---

# 63. Vista interna del curso

Crear:

`/campus/cursos/[courseId]`

Deberá mostrar:

- portada;
- nombre;
- instructor;
- estructura de módulos;
- clases disponibles;
- materiales;
- navegación del curso.

---

# 64. Validar matrícula

El Campus no deberá permitir acceder a:

`/campus/cursos/[courseId]`

solamente porque el usuario conozca el ID.

Antes de mostrar contenido deberá comprobarse que:

- existe sesión;
- existe `user_accounts`;
- corresponde a `people`;
- existe `course_enrollment`;
- `status = active` o estado permitido.

---

# 65. Navegación por contenido

Crear una estructura equivalente a:

`/campus/cursos/[courseId]/contenido`

Desde esta página deberá mostrarse la lista de módulos.

---

# 66. Vista de módulo

Crear:

`/campus/cursos/[courseId]/modulos/[moduleId]`

La vista deberá mostrar:

- nombre;
- descripción;
- clases publicadas;
- quiz futuro cuando corresponda.

En este hito todavía no deberá existir el quiz funcional.

---

# 67. Vista de clase

Crear:

`/campus/cursos/[courseId]/modulos/[moduleId]/clases/[lessonId]`

La página deberá:

- comprobar matrícula;
- comprobar pertenencia de módulo al curso;
- comprobar pertenencia de clase al módulo;
- comprobar publicación;
- mostrar título;
- mostrar descripción;
- reproducir video.

---

# 68. Reproductor inicial

En este hito deberá poder reproducirse el video.

No será obligatorio todavía:

- persistir la posición;
- registrar segundos vistos;
- calcular porcentaje;
- marcar completado.

Estas funciones pertenecen al Hito 8.

---

# 69. Materiales del curso

Crear:

`/campus/cursos/[courseId]/materiales`

La página deberá listar todos los materiales generales del curso.

Ejemplo:

```text
Materiales

Manual del curso.pdf
Presentación.pdf
Plantilla.xlsx
Recursos adicionales
```

No deberá organizarlos obligatoriamente por clase.

---

# 70. Acceso a materiales

Solo un alumno habilitado deberá poder acceder normalmente a los materiales privados del curso.

La protección definitiva mediante RLS/Storage se desarrollará en el Hito 11.

Mientras tanto, la lógica de aplicación deberá respetar la matrícula.

---

# 71. Sin desbloqueo secuencial

El análisis funcional establece que el alumno podrá ingresar libremente a los módulos.

Por tanto, no deberá implementarse:

```text
Módulo 2 bloqueado hasta terminar Módulo 1
```

El alumno podrá seleccionar cualquier módulo publicado disponible.

---

# 72. Sin vencimiento

El MVP no contempla vencimiento automático del acceso al curso.

No deberán agregarse arbitrariamente:

- fechas límite;
- expiración;
- bloqueo temporal.

---

# 73. Queries del dominio de cursos

Crear operaciones equivalentes a:

```text
getCourses()
getPublishedCourses()
getCourseBySlug()
getCourseById()
getCourseModules()
getCourseLessons()
getCourseMaterials()
getCourseInstructors()
```

---

# 74. Queries del Campus

Crear operaciones equivalentes a:

```text
getMyCourses()
getMyCourse()
getCourseContentForStudent()
```

Estas consultas deberán validar correctamente la relación con la persona autenticada.

---

# 75. Mutations de cursos

Crear operaciones equivalentes a:

```text
createCourse()
updateCourse()
publishCourse()
archiveCourse()
```

---

# 76. Mutations de módulos

Crear:

```text
createModule()
updateModule()
reorderModules()
```

o equivalentes.

---

# 77. Mutations de clases

Crear:

```text
createLesson()
updateLesson()
reorderLessons()
```

o equivalentes.

---

# 78. Mutations de materiales

Crear:

```text
createCourseMaterial()
updateCourseMaterial()
deleteCourseMaterial()
```

o equivalentes.

---

# 79. Mutations de matrícula

Crear operaciones equivalentes a:

```text
enrollFreeCourse()
grantCourseAccess()
revokeCourseAccess()
```

La operación gratuita deberá utilizar la RPC correspondiente cuando se implemente según el diseño físico.

---

# 80. Separación por features

Mantener la estructura:

```text
src/features/
```

con dominios como:

```text
courses/
course-materials/
course-enrollments/
lessons/
speakers/
```

Ejemplo:

```text
courses/
    components/
    queries/
    mutations/
    schemas/
    types/
    constants/

lessons/
    components/
    queries/
    mutations/
    types/
```

---

# 81. Atomic Design aplicado al Hito 7

## Atoms

Reutilizar:

- Button;
- Input;
- Textarea;
- Select;
- Badge;
- Heading;
- Text;
- Avatar;
- Spinner.

## Molecules

Crear/reutilizar:

```text
PriceDisplay
CourseProgress
FormField
StatusBadge
InstructorDisplay
MaterialItem
```

`CourseProgress` podrá existir inicialmente sin toda la lógica funcional del Hito 8.

## Organisms

Crear componentes equivalentes a:

```text
CourseCard
CourseForm
CourseModule
CourseModulesList
LessonList
LessonPlayer
CourseMaterialsList
CourseStudentsTable
CourseInstructors
```

## Templates

Podrán existir:

```text
CourseDetailTemplate
CoursePlayerTemplate
CourseAdminTemplate
MyCoursesTemplate
```

---

# 82. Manejo de estados

Las páginas deberán contemplar:

- loading;
- success;
- error;
- empty.

Ejemplos:

**Aún no tienes cursos habilitados.**

**Este curso no tiene módulos publicados.**

**Este curso todavía no tiene materiales.**

---

# 83. Requerimientos técnicos

## RT-01 — Dominio independiente

Los cursos no deberán almacenarse dentro de `activities`.

Deberán utilizar la tabla:

`courses`.

---

## RT-02 — Instructores reutilizables

Los instructores deberán reutilizar:

`speakers`.

---

## RT-03 — Relación M:N

Los instructores de cursos deberán utilizar:

`course_instructors`.

---

## RT-04 — Módulos

Los módulos deberán almacenarse en:

`course_modules`.

---

## RT-05 — Clases

Las clases deberán almacenarse en:

`lessons`.

---

## RT-06 — Video por clase

Cada clase deberá permitir asociar su propio video.

---

## RT-07 — Materiales generales

Los materiales deberán utilizar:

`course_materials → courses`.

No deberá implementarse:

`lesson_materials`.

---

## RT-08 — Matrícula

El acceso al curso deberá utilizar:

`course_enrollments`.

---

## RT-09 — Persona como referencia

La matrícula deberá relacionarse con:

`people.id`

y no directamente con `auth.users.id`.

---

## RT-10 — Matrícula única

No deberá existir más de una matrícula activa por:

`course_id + person_id`.

---

## RT-11 — Cursos gratuitos

La habilitación gratuita deberá realizarse mediante una operación segura equivalente a:

`enroll_free_course()`.

---

## RT-12 — Curso con costo

La habilitación deberá ser administrativa.

---

## RT-13 — Precio

El precio histórico deberá almacenarse en:

`price_snapshot`.

---

## RT-14 — Revocación

La revocación deberá utilizar estado y metadata específica, no soft delete.

---

## RT-15 — Soft Delete

Las nuevas tablas deberán utilizar:

```text
deleted_at
deleted_by
```

según corresponda.

---

## RT-16 — Ordenamiento

Módulos, clases, materiales e instructores deberán utilizar `sort_order`.

---

## RT-17 — Publicación

Cursos, módulos y clases deberán respetar sus estados/campos de publicación.

---

## RT-18 — Storage

Portadas y materiales deberán almacenarse mediante Storage, no como binarios en PostgreSQL.

---

## RT-19 — Video flexible

El modelo deberá soportar diferentes proveedores de video.

---

## RT-20 — Sin progreso todavía

No deberá simularse artificialmente la finalización de clases en este hito.

---

## RT-21 — Sin quiz todavía

Las interfaces podrán dejar preparado el lugar, pero la funcionalidad de quiz pertenece al Hito 9.

---

## RT-22 — Acceso autenticado

Las páginas del Campus deberán requerir usuario autenticado.

---

## RT-23 — Validación de matrícula

El contenido interno deberá comprobar matrícula válida.

---

## RT-24 — Sin secuencia obligatoria

No deberá implementarse desbloqueo progresivo de módulos.

---

## RT-25 — Supabase directo

Las consultas y operaciones CRUD normales deberán utilizar principalmente `supabase-js`.

---

## RT-26 — RPC

Operaciones transaccionales como matrícula gratuita podrán utilizar PostgreSQL/RPC.

---

## RT-27 — TypeScript

Cursos, módulos, clases, materiales y matrículas deberán estar correctamente tipados.

---

## RT-28 — Schemas

Los formularios deberán utilizar schemas centralizados.

---

## RT-29 — Atomic Design

Los componentes deberán mantener la metodología definida.

---

## RT-30 — RLS

Las políticas completas continúan programadas para el Hito 11.

La arquitectura de acceso deberá quedar preparada para proteger cursos y materiales antes de producción.

---

# 84. Requerimientos funcionales

## RF-01 — Crear curso

El administrador deberá poder crear un curso.

---

## RF-02 — Editar curso

El administrador deberá poder modificar un curso existente.

---

## RF-03 — Publicar curso

El administrador deberá poder publicar un curso.

---

## RF-04 — Archivar curso

Un curso deberá poder archivarse preservando su historial.

---

## RF-05 — Instructor

Un curso deberá poder tener uno o varios instructores.

---

## RF-06 — Instructor principal

Podrá definirse un instructor principal.

---

## RF-07 — Módulos

Un curso deberá poder contener múltiples módulos.

---

## RF-08 — Orden de módulos

El administrador deberá poder ordenar módulos.

---

## RF-09 — Clases

Cada módulo deberá contener clases.

---

## RF-10 — Orden de clases

Las clases deberán poder ordenarse.

---

## RF-11 — Video

Cada clase deberá permitir asociar su video.

---

## RF-12 — Clase obligatoria

Una clase podrá configurarse como obligatoria o no obligatoria.

---

## RF-13 — Materiales

El curso deberá disponer de materiales generales.

---

## RF-14 — Archivo

Un material podrá ser un archivo.

---

## RF-15 — Enlace externo

Un material podrá ser un enlace.

---

## RF-16 — Material independiente del progreso

Abrir un material no deberá completar ninguna clase ni incrementar progreso.

---

## RF-17 — Catálogo público

Cualquier visitante deberá poder consultar cursos publicados.

---

## RF-18 — Detalle público

El visitante deberá poder consultar descripción, instructor, contenido, duración y precio.

---

## RF-19 — Cuenta requerida para contenido

Para acceder al contenido interno deberá existir usuario autenticado.

---

## RF-20 — Curso gratuito

Un usuario autenticado deberá poder inscribirse inmediatamente a un curso gratuito.

---

## RF-21 — Curso con costo

Un curso con costo deberá requerir habilitación administrativa.

---

## RF-22 — Sin pago interno

La plataforma no deberá cobrar el curso directamente durante el MVP.

---

## RF-23 — Múltiples cursos

Un usuario podrá tener varios cursos habilitados simultáneamente.

---

## RF-24 — Mis cursos

El alumno deberá disponer de una sección con sus cursos habilitados.

---

## RF-25 — Curso habilitado

Un alumno deberá poder ingresar a un curso con matrícula `active`.

---

## RF-26 — Curso no habilitado

Un usuario sin matrícula no deberá poder acceder al contenido interno.

---

## RF-27 — Curso revocado

Una matrícula revocada deberá impedir acceso normal al contenido.

---

## RF-28 — Navegación libre

El alumno deberá poder acceder libremente a cualquier módulo publicado del curso.

---

## RF-29 — Clase

El alumno deberá poder abrir una clase y visualizar su video.

---

## RF-30 — Materiales

El alumno deberá disponer de una sección independiente de materiales.

---

# 85. Fuera del alcance del Hito 7

No forma parte de este hito:

- seguimiento de segundos vistos;
- guardado de posición;
- progreso por clase;
- progreso general;
- regla del 90 %;
- quizzes;
- preguntas;
- alternativas;
- intentos;
- aprobación del 80 %;
- finalización automática;
- certificados de cursos;
- valoraciones;
- desbloqueo progresivo;
- vencimiento de cursos;
- streaming propio;
- videoconferencia;
- tareas;
- trabajos académicos;
- evaluación manual.

---

# 86. Definition of Done

El Hito 7 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe `course_status`.
- [ ] Existe `course_enrollment_status`.
- [ ] Existe `material_type`.
- [ ] Existe la tabla `courses`.
- [ ] Existe `course_instructors`.
- [ ] Existe `course_modules`.
- [ ] Existe `lessons`.
- [ ] Existe `course_materials`.
- [ ] Existe `course_enrollments`.
- [ ] Las foreign keys funcionan.
- [ ] Los slugs activos son únicos.
- [ ] Existe matrícula única activa por persona/curso.
- [ ] Existen restricciones de materiales.
- [ ] Existen restricciones de precios.
- [ ] Existen restricciones de duración cuando corresponda.
- [ ] Se implementó soft delete.
- [ ] Funcionan triggers de `updated_at`.
- [ ] Existen los índices definidos.
- [ ] Todo fue creado mediante migraciones.

## Administración de cursos

- [ ] Existe `/admin/cursos`.
- [ ] Se pueden listar cursos.
- [ ] Existe búsqueda.
- [ ] Existe paginación.
- [ ] Se puede crear curso.
- [ ] Se puede editar.
- [ ] Se puede guardar como borrador.
- [ ] Se puede publicar.
- [ ] Se puede archivar.
- [ ] Se puede configurar portada.
- [ ] Se puede configurar precio general.
- [ ] Se puede configurar precio asociado.
- [ ] Se puede configurar curso gratuito.
- [ ] Se pueden asignar instructores.
- [ ] Se puede indicar instructor principal.

## Módulos

- [ ] Se puede crear módulo.
- [ ] Se puede editar.
- [ ] Se puede ordenar.
- [ ] Se puede publicar.
- [ ] Se puede ocultar.
- [ ] Se puede eliminar lógicamente.
- [ ] Un curso puede tener múltiples módulos.

## Clases

- [ ] Se puede crear clase.
- [ ] Se puede editar.
- [ ] Se puede ordenar.
- [ ] Se puede publicar.
- [ ] Se puede ocultar.
- [ ] Se puede configurar como obligatoria.
- [ ] Se puede asociar un video.
- [ ] Se puede almacenar proveedor/identificador/ruta.
- [ ] Se puede registrar duración.

## Materiales

- [ ] Existe administración de materiales.
- [ ] Los materiales se asocian al curso.
- [ ] No se asocian individualmente a clases.
- [ ] Se puede crear material tipo archivo.
- [ ] Se puede crear enlace externo.
- [ ] Se puede ordenar.
- [ ] Se puede eliminar lógicamente.
- [ ] Se valida correctamente `storage_path` vs `external_url`.
- [ ] Los archivos se almacenan fuera de PostgreSQL.

## Alumnos

- [ ] Existe administración de alumnos por curso.
- [ ] Se puede buscar persona.
- [ ] Se puede habilitar curso.
- [ ] Se registra `access_granted_at`.
- [ ] Se registra `access_granted_by`.
- [ ] Se almacena `price_snapshot`.
- [ ] No se crea matrícula duplicada.
- [ ] Se puede revocar acceso.
- [ ] Se registra `revoked_at`.
- [ ] Se registra `revoked_by`.
- [ ] Se puede registrar motivo.
- [ ] Una matrícula revocada no se elimina.

## Cursos gratuitos

- [ ] Existe `enroll_free_course()` o equivalente.
- [ ] Solo funciona para cursos publicados.
- [ ] Solo funciona para cursos gratuitos.
- [ ] Identifica correctamente al usuario.
- [ ] Recupera su `person_id`.
- [ ] Evita duplicados.
- [ ] Crea matrícula `active`.
- [ ] El curso aparece inmediatamente en Mis cursos.

## Portal público

- [ ] Existe `/cursos`.
- [ ] Se muestran cursos publicados.
- [ ] Los borradores no aparecen.
- [ ] Existe `CourseCard` reutilizable.
- [ ] Existe `/cursos/[slug]`.
- [ ] Se muestra descripción.
- [ ] Se muestra instructor.
- [ ] Se muestra duración.
- [ ] Se muestran precios.
- [ ] Se muestra condición gratuita/con costo.
- [ ] Se muestra contenido general.

## Campus

- [ ] Existe `/campus/cursos`.
- [ ] Se muestran cursos habilitados del usuario autenticado.
- [ ] Una persona puede tener varios cursos.
- [ ] Existe `/campus/cursos/[courseId]`.
- [ ] Se valida matrícula.
- [ ] Un usuario no matriculado no puede acceder normalmente.
- [ ] Una matrícula revocada no permite acceso.
- [ ] Se muestran módulos publicados.
- [ ] Se muestran clases publicadas.
- [ ] Existe vista de clase.
- [ ] El video puede reproducirse.
- [ ] Existe sección de materiales.
- [ ] Se pueden abrir/descargar recursos.
- [ ] No existe bloqueo secuencial de módulos.

## Arquitectura

- [ ] Los cursos están separados de `activities`.
- [ ] Se reutiliza `speakers`.
- [ ] No existe `lesson_materials`.
- [ ] Se utiliza `course_materials`.
- [ ] Queries y mutations están organizadas.
- [ ] Los componentes respetan Atomic Design.
- [ ] Los formularios utilizan schemas.
- [ ] Los tipos de Supabase están actualizados.
- [ ] No existe una API CRUD innecesaria.
- [ ] Las operaciones transaccionales utilizan RPC cuando corresponde.
- [ ] La solución queda preparada para progreso y quizzes.

---

# 87. Pruebas funcionales obligatorias

## Caso 1 — Crear curso completo

```text
1. Iniciar sesión como administrador.
2. Crear curso.
3. Asignar instructor.
4. Crear Módulo 1.
5. Crear tres clases.
6. Configurar un video por clase.
7. Crear Módulo 2.
8. Crear dos clases.
9. Agregar materiales generales.
10. Publicar curso.
11. Abrir /cursos.
12. Encontrar el curso.
13. Abrir su detalle público.
```

---

## Caso 2 — Curso gratuito

```text
1. Publicar curso gratuito.
2. Iniciar sesión como student.
3. Abrir detalle.
4. Pulsar Inscribirme.
5. Ejecutar enroll_free_course().
6. Crear course_enrollment.
7. status = active.
8. Abrir Mis cursos.
9. Curso aparece inmediatamente.
10. Entrar al contenido.
```

---

## Caso 3 — Curso con costo

```text
1. Publicar curso con costo.
2. Usuario autenticado consulta curso.
3. No se crea matrícula automática.
4. CCI realiza validación externa.
5. Administrador busca persona.
6. Habilita curso.
7. Crear course_enrollment active.
8. Curso aparece en Mis cursos.
```

---

## Caso 4 — Múltiples cursos

```text
1. Habilitar Curso A.
2. Habilitar Curso B.
3. Abrir Mis cursos.
4. Mostrar ambos.
5. Cada matrícula corresponde al mismo person_id.
```

---

## Caso 5 — Acceso no habilitado

```text
1. Iniciar sesión.
2. Copiar URL interna de curso no matriculado.
3. Abrirla directamente.
4. Sistema comprueba matrícula.
5. Impedir acceso al contenido.
```

---

## Caso 6 — Revocación

```text
1. Alumno tiene curso activo.
2. Puede acceder.
3. Administrador revoca matrícula.
4. status = revoked.
5. Alumno intenta entrar nuevamente.
6. Sistema impide acceso.
7. Matrícula permanece históricamente.
```

---

## Caso 7 — Materiales

```text
1. Crear PDF general.
2. Crear enlace externo.
3. Ambos aparecen en Materiales.
4. No aparecen como materiales individuales de una clase.
5. Abrir recursos.
6. No modificar progreso.
```

---

## Caso 8 — Navegación libre

```text
1. Curso tiene Módulo 1 y Módulo 2.
2. Alumno abre curso.
3. No ha visto Módulo 1.
4. Abre directamente Módulo 2.
5. Sistema permite acceso.
```

---

## Caso 9 — Curso no publicado

```text
1. Crear curso draft.
2. Abrir /cursos.
3. No debe aparecer.
4. Publicarlo.
5. Ahora debe aparecer.
```

---

## Caso 10 — Contenido no publicado

```text
1. Curso publicado.
2. Módulo B is_published = false.
3. Alumno abre curso.
4. Módulo B no aparece normalmente.
5. Publicarlo.
6. Ahora aparece.
```

---

# 88. Validación final del hito

Antes de aprobar el Hito 7, el equipo deberá demostrar:

```text
1. Crear un curso desde administración.
2. Asignar instructor.
3. Crear múltiples módulos.
4. Crear múltiples clases.
5. Configurar un video por clase.
6. Agregar materiales generales.
7. Publicar el curso.
8. Consultarlo sin login desde /cursos.
9. Consultar su ficha pública.
10. Registrar/iniciar sesión como alumno.
11. Inscribirse a un curso gratuito.
12. Verlo en Mis cursos.
13. Navegar por módulos.
14. Reproducir clases.
15. Consultar materiales.
16. Habilitar manualmente un curso con costo.
17. Acceder al mismo desde el Campus.
18. Revocar acceso.
19. Confirmar que deja de poder entrar.
20. Confirmar que no existe desbloqueo secuencial.
```

Todo deberá funcionar utilizando los flujos normales de la aplicación, sin modificar manualmente la base de datos para completar el proceso.

---

# 89. Resultado final esperado del Hito 7

Al finalizar este hito deberá existir un Campus Virtual funcional a nivel de contenido y acceso.

El recorrido principal será:

```text
ADMINISTRADOR
      │
      ▼
Crear curso
      │
      ├── Instructor
      ├── Información
      ├── Módulos
      │     └── Clases
      │          └── Video
      │
      └── Materiales generales
      │
      ▼
Publicar
      │
      ▼
CATÁLOGO PÚBLICO
      │
      ▼
/cursos/[slug]
      │
      ▼
USUARIO AUTENTICADO
      │
      ├── Curso gratuito
      │      ↓
      │   Matrícula automática
      │
      └── Curso con costo
             ↓
        Habilitación CCI
      │
      ▼
course_enrollments
      │
      ▼
MIS CURSOS
      │
      ▼
CURSO
      │
      ├── Módulos
      │     └── Clases
      │          └── Video
      │
      └── Materiales
```

Con este hito, la Cámara podrá crear y publicar cursos grabados y asignarlos a estudiantes, mientras estos podrán acceder al contenido desde su cuenta.

Todavía no existirá seguimiento académico automático.

Ese será el siguiente paso.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 8 — Progreso de Videos y Seguimiento Académico.**