# HITO 2 — GESTIÓN Y PUBLICACIÓN DE EVENTOS Y CAPACITACIONES

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 2 tiene como finalidad implementar el primer módulo funcional visible de la plataforma: la **gestión y publicación de eventos y capacitaciones**.

En este hito se construirá la estructura necesaria para que el personal administrativo pueda:

- crear eventos;
- crear capacitaciones;
- editar actividades;
- configurar fechas y horarios;
- asignar categorías;
- asignar expositores;
- configurar modalidad;
- definir precios;
- configurar cupos;
- establecer fechas de inscripción;
- publicar;
- finalizar;
- archivar;
- cancelar actividades.

Simultáneamente, se desarrollará la experiencia pública necesaria para que cualquier visitante pueda:

- consultar eventos;
- consultar capacitaciones;
- visualizar próximas actividades;
- realizar búsquedas;
- aplicar filtros;
- consultar el detalle completo de una actividad.

El resultado de este hito deberá permitir por primera vez un recorrido funcional completo entre administración y portal público:

**Administrador crea actividad → configura información → publica → visitante encuentra la actividad → consulta su detalle.**

La inscripción de participantes todavía no forma parte de este hito y será implementada en el Hito 3.

Como este hito introduce las primeras mutaciones administrativas, también deberá incorporar autenticación interna mínima para cuentas previamente provisionadas con rol `operator` o `administrator`. No incluirá todavía registro público, recuperación de contraseña ni autenticación funcional del Campus.

---

# 2. Objetivo del hito

Construir el dominio funcional de eventos y capacitaciones, permitiendo su administración y publicación pública dentro de una única plataforma institucional.

Eventos y capacitaciones deberán compartir el mismo modelo principal:

`activities`

La diferenciación deberá realizarse mediante:

`activities.type`

con los valores:

- `event`;
- `training`.

La categoría tendrá una finalidad diferente y representará únicamente la temática de la actividad.

Por ejemplo:

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

Por lo tanto:

**Tipo de actividad ≠ Categoría.**

Esta separación deberá respetarse tanto en la base de datos como en la lógica de aplicación y en la interfaz.

---

# 3. Alcance del hito

El Hito 2 comprende:

- estructura de base de datos de actividades;
- fechas y horarios;
- relación con categorías;
- relación con expositores;
- administración de actividades;
- publicación;
- estados;
- catálogo público;
- buscador;
- filtros;
- página de detalle;
- visualización diferenciada de eventos y capacitaciones.

Este hito no comprende todavía:

- formulario de inscripción;
- creación de participantes mediante inscripción;
- preinscripciones;
- confirmaciones;
- control efectivo de cupos durante inscripción;
- asistencia;
- certificados;
- notificaciones de inscripción;
- login de participantes;
- cursos grabados.

---

# 4. Modelo funcional de actividades

Eventos y capacitaciones deberán utilizar una entidad común denominada:

`Activity`

La razón es que ambos comparten prácticamente el mismo proceso funcional:

```text
Crear
↓
Configurar
↓
Asignar fechas
↓
Asignar expositores
↓
Publicar
↓
Mostrar públicamente
↓
Recibir inscripciones
```

La inscripción será incorporada en el siguiente hito.

No deberán crearse tablas independientes:

```text
events
trainings
```

La estructura correcta será:

```text
activities
```

con:

```text
type = event
```

o:

```text
type = training
```

Esta decisión forma parte tanto del análisis funcional como del modelo físico corregido. 
---

# 5. Tareas del hito

## 5.1 Crear enums del dominio de actividades

Crear como mínimo los siguientes enums PostgreSQL.

### `activity_type`

```text
event
training
```

### `activity_modality`

```text
in_person
virtual
hybrid
```

### `activity_status`

```text
draft
published
finished
archived
cancelled
```

Estos valores deberán utilizarse de forma consistente en base de datos y aplicación.

---

# 6. Crear tabla `activities`

## Objetivo

Representar la información principal de eventos y capacitaciones.

## Campos

Implementar como mínimo:

```text
id
category_id
type
title
slug
short_description
description
objective
target_audience
modality
location_name
address
virtual_url
duration_text
academic_hours
program
syllabus
banner_path
is_free
general_price
member_price
members_only
capacity
registration_open_at
registration_close_at
registrations_closed_manually
contact_name
contact_phone
contact_email
additional_info
status
published_at
created_by
updated_by
created_at
updated_at
deleted_at
deleted_by
```

La estructura deberá seguir el diseño físico corregido del proyecto.

---

# 7. Restricciones de `activities`

Deberán implementarse las reglas de integridad definidas en el modelo físico.

## Precios

```text
general_price >= 0
member_price >= 0
```

## Cupos

Si existe:

```text
capacity > 0
```

Si la actividad no tiene límite:

```text
capacity = NULL
```

## Horas académicas

Cuando se utilicen:

```text
academic_hours >= 0
```

## Actividad gratuita

Cuando:

```text
is_free = true
```

los precios deberán ser:

```text
general_price = 0
member_price = 0
```

---

# 8. Slug de actividades

Cada actividad tendrá un `slug` utilizado en sus URLs públicas.

Ejemplo:

```text
congreso-empresarial-2026
```

El slug deberá ser único entre actividades activas.

Debido al uso de soft delete se deberá utilizar el índice parcial definido conceptualmente como:

```sql
CREATE UNIQUE INDEX uq_activities_slug_active
ON activities(slug)
WHERE deleted_at IS NULL;
```

---

# 9. Crear tabla `activity_dates`

## Objetivo

Permitir que una actividad tenga una o múltiples fechas.

No se deberá almacenar únicamente una fecha directamente dentro de `activities`.

La estructura será:

```text
ACTIVITY
│
├── Fecha 1
├── Fecha 2
└── Fecha 3
```

Esto permitirá representar correctamente:

- congresos de varios días;
- capacitaciones con varias fechas;
- eventos con múltiples horarios.

## Campos

```text
id
activity_id
starts_at
ends_at
label
sort_order
created_at
updated_at
deleted_at
deleted_by
```

## Restricción

Cuando exista `ends_at`:

```text
ends_at > starts_at
```

La inscripción continuará correspondiendo a la actividad completa, no a fechas individuales. 
---

# 10. Crear tabla `activity_speakers`

## Objetivo

Relacionar una actividad con uno o varios expositores registrados previamente en `speakers`.

La relación será:

```text
activities
      │
activity_speakers
      │
speakers
```

## Campos

```text
id
activity_id
speaker_id
role_label
sort_order
created_at
updated_at
deleted_at
deleted_by
```

## Restricción

Un mismo expositor no deberá asignarse dos veces activamente a la misma actividad.

---

# 11. Reutilizar `categories`

La tabla `categories`, creada en el Hito 1, deberá utilizarse para clasificar temáticamente las actividades.

Ejemplos:

- Marketing;
- Tributación;
- Comercio Exterior;
- Gestión Empresarial;
- Transformación Digital.

Cada actividad podrá tener una categoría mediante:

`activities.category_id`

La categoría no deberá utilizarse para distinguir entre evento y capacitación.

---

# 12. Reutilizar `speakers`

Los expositores creados en el Hito 1 deberán poder seleccionarse al crear o editar una actividad.

El administrador deberá poder:

- buscar un expositor existente;
- seleccionar uno;
- seleccionar varios;
- establecer orden;
- indicar un rol o denominación cuando corresponda.

Ejemplos:

```text
Ponente
Expositor
Moderador
Especialista invitado
```

El historial completo de expositor se construirá progresivamente en los siguientes hitos al existir actividades relacionadas.

---

# 13. Implementar gestión administrativa de actividades

Antes de habilitar esta sección se deberá implementar el acceso administrativo mínimo:

- login para cuentas internas previamente provisionadas;
- ruta pública `/admin/login` separada del layout administrativo protegido;
- sesión SSR mediante cookies;
- un único `src/proxy.ts` para actualización de sesión y comprobaciones optimistas de ruta;
- autorización real en RLS para roles `operator` y `administrator`;
- cierre de sesión;
- rechazo de cuentas inactivas o sin rol administrativo.

`proxy.ts` no reemplazará la autorización de datos: las políticas RLS serán la protección final. El registro público, recuperación de contraseña y flujo del estudiante seguirán reservados para el Hito 6.

Crear la sección:

```text
/admin/actividades
```

Desde esta área se deberá poder acceder como mínimo a:

```text
/admin/actividades/eventos
/admin/actividades/capacitaciones
```

El objetivo es ofrecer vistas separadas para administración sin duplicar el modelo de datos.

---

# 14. Listado administrativo de actividades

La tabla administrativa deberá mostrar información relevante como:

- título;
- tipo;
- categoría;
- modalidad;
- fecha próxima;
- condición gratuita/con costo;
- precio;
- estado;
- fecha de publicación.

Deberá permitir cuando corresponda:

- búsqueda;
- filtros;
- ordenamiento;
- paginación;
- acceso a edición.

---

# 15. Crear nueva actividad

Crear rutas administrativas equivalentes a:

```text
/admin/actividades/eventos/nuevo
```

y:

```text
/admin/actividades/capacitaciones/nueva
```

Ambas interfaces podrán compartir internamente:

- schemas;
- componentes;
- mutations;
- lógica;
- formularios.

No deberán construirse dos sistemas independientes.

---

# 16. Formulario de actividad

El formulario deberá permitir administrar como mínimo:

## Información general

- título;
- descripción corta;
- descripción;
- objetivo;
- público objetivo;
- categoría.

## Tipo

El tipo deberá establecerse correctamente:

```text
event
```

o:

```text
training
```

## Modalidad

- presencial;
- virtual;
- híbrida.

## Ubicación

Cuando corresponda:

- nombre del lugar;
- dirección.

## Virtual

Cuando corresponda:

- información/enlace virtual.

## Duración

- descripción de duración;
- horas académicas cuando corresponda.

## Contenido

- programa;
- agenda;
- temario.

## Imagen

- banner o imagen principal.

## Precio

- gratuita/con costo;
- precio general;
- precio asociado.

## Asociados

- actividad pública;
- beneficios para asociados;
- exclusiva para asociados.

## Cupos

- sin límite;
- con límite.

## Inscripciones

- fecha de apertura;
- fecha de cierre;
- cierre manual.

## Contacto

- responsable;
- teléfono;
- correo.

## Información adicional

- texto adicional cuando corresponda.

---

# 17. Validación del formulario

Las validaciones deberán existir al menos en:

```text
Frontend
+
PostgreSQL
```

El formulario deberá mostrar errores claros para:

- título requerido;
- descripción requerida;
- modalidad requerida;
- precios inválidos;
- capacidad inválida;
- fechas inválidas;
- campos obligatorios.

Las reglas críticas no deberán depender solamente del navegador.

---

# 18. Manejo de modalidad

La interfaz deberá adaptarse a la modalidad seleccionada.

## Presencial

Podrá requerir:

- ubicación;
- dirección.

## Virtual

Podrá utilizar:

- información de conexión;
- URL virtual.

## Híbrida

Podrá contener ambas configuraciones.

No todos estos campos necesitan ser obligatorios desde base de datos, pero la interfaz deberá presentar la información de forma coherente.

---

# 19. Configuración de fechas y horarios

La administración deberá permitir:

- agregar una fecha;
- agregar múltiples fechas;
- establecer inicio;
- establecer fin;
- establecer etiqueta opcional;
- ordenar fechas;
- eliminar lógicamente una fecha.

Ejemplo:

```text
Día 1 — 20 de agosto — 9:00 a.m. a 5:00 p.m.
Día 2 — 21 de agosto — 9:00 a.m. a 1:00 p.m.
```

---

# 20. Gestión de expositores dentro de la actividad

La interfaz deberá permitir:

- consultar expositores existentes;
- asignarlos;
- remover la relación;
- ordenar su aparición;
- establecer `role_label`.

La ficha pública deberá posteriormente poder mostrar dichos expositores.

---

# 21. Estados de actividad

Implementar los estados:

## `draft`

La actividad está siendo preparada y no deberá aparecer públicamente.

## `published`

La actividad está disponible en el portal.

## `finished`

La actividad ya se realizó.

## `archived`

La actividad permanece como parte del historial, pero deja de ser relevante operativamente.

## `cancelled`

La actividad fue cancelada.

Una actividad cancelada no deberá eliminarse automáticamente.

**Estado funcional y soft delete son conceptos diferentes.** 
---

# 22. Publicación de actividades

El administrador autorizado deberá poder publicar directamente una actividad.

El MVP no tendrá un proceso interno de:

- revisión;
- aprobación;
- workflow editorial.

Al publicarse deberá:

```text
status = published
```

y registrarse:

```text
published_at
```

cuando corresponda.

---

# 23. Cancelación

La administración deberá poder cambiar una actividad a:

```text
cancelled
```

La actividad cancelada deberá conservarse.

Si se mantiene visible públicamente, deberá aparecer claramente identificada como:

**Actividad cancelada.**

En este hito todavía no será necesario enviar comunicaciones automáticas a participantes por una cancelación.

---

# 24. Archivo y finalización

Se deberá poder establecer:

```text
finished
```

para una actividad que ya se realizó.

Y:

```text
archived
```

cuando deba conservarse históricamente sin continuar apareciendo como actividad relevante.

---

# 25. Portal público de eventos

Crear:

```text
/eventos
```

Esta página deberá consultar únicamente actividades que correspondan a:

```text
type = event
```

y que cumplan las condiciones públicas aplicables.

---

# 26. Portal público de capacitaciones

Crear:

```text
/capacitaciones
```

La página deberá consultar únicamente:

```text
type = training
```

La experiencia visual podrá diferenciarse, pero deberá reutilizar componentes y lógica compartida cuando sea posible.

---

# 27. Tarjeta de actividad

Crear un organismo reutilizable equivalente a:

`ActivityCard`

Podrá mostrar:

- imagen;
- título;
- tipo;
- categoría;
- fecha;
- modalidad;
- condición gratuita/con costo;
- precio;
- distintivo para asociados;
- estado cuando corresponda.

No deberá realizar consultas directamente por sí mismo.

Los datos deberán llegar mediante props.

---

# 28. Buscador

El visitante deberá poder buscar actividades mediante palabras.

La búsqueda podrá considerar inicialmente campos relevantes como:

- título;
- descripción;
- categoría.

No se requiere un motor externo de búsqueda para el MVP.

La consulta podrá resolverse mediante PostgreSQL/Supabase.

---

# 29. Filtros

El catálogo público deberá contemplar los criterios establecidos funcionalmente.

Como mínimo:

- modalidad;
- tipo;
- categoría;
- fecha;
- gratuita;
- con costo.

Además, visualmente deberá poder identificarse si una actividad es:

- pública;
- dirigida a asociados;
- exclusiva para asociados.

---

# 30. Próximas actividades

Las vistas públicas deberán priorizar las próximas actividades disponibles.

Para ello será necesario utilizar correctamente:

- `activity_dates`;
- `status`;
- fechas.

La aplicación no deberá depender exclusivamente de `created_at` para determinar qué actividad ocurre primero.

---

# 31. Página pública de detalle

Crear rutas:

```text
/eventos/[slug]
```

y:

```text
/capacitaciones/[slug]
```

La página deberá obtener la actividad mediante su slug.

---

# 32. Información visible en detalle

Dependiendo de la información disponible, deberá mostrarse:

- título;
- banner;
- descripción;
- objetivos;
- público objetivo;
- categoría;
- modalidad;
- fechas;
- horarios;
- ubicación;
- dirección;
- información virtual;
- duración;
- horas académicas;
- programa;
- agenda;
- temario;
- expositores;
- precio general;
- precio asociado;
- condición gratuita/con costo;
- exclusividad para asociados;
- contacto;
- información adicional.

No todos los campos serán obligatorios.

La interfaz deberá omitir elegantemente los campos que no tengan contenido.

---

# 33. Precio

La interfaz pública deberá representar correctamente:

## Actividad gratuita

Mostrar claramente:

**Gratis**

## Actividad con costo

Mostrar:

- precio general;
- precio asociado.

La inscripción todavía no se implementará en este hito.

---

# 34. Actividades exclusivas para asociados

Una actividad con:

```text
members_only = true
```

deberá poder seguir apareciendo públicamente.

La interfaz deberá identificar claramente que está dirigida exclusivamente a asociados.

No se realizará todavía ninguna verificación automática del padrón de asociados.

---

# 35. Cupos

Aunque el control transaccional de cupos durante la inscripción pertenece al Hito 3, en este hito deberá ser posible configurar:

```text
capacity
```

como:

- sin límite;
- límite definido.

La interfaz pública podrá mostrar información de capacidad cuando corresponda.

No deberá implementarse todavía reserva ni consumo de cupos.

---

# 36. Periodo de inscripción

El administrador deberá poder configurar:

```text
registration_open_at
registration_close_at
registrations_closed_manually
```

En este hito estos campos deberán quedar disponibles y representados visualmente.

El comportamiento completo de aceptación o rechazo de inscripciones se implementará en el Hito 3.

---

# 37. Banner e imágenes

La actividad deberá permitir almacenar:

```text
banner_path
```

La implementación podrá utilizar Supabase Storage.

Los banners son contenido público/promocional y podrán considerarse archivos públicos según el diseño técnico.

No deberán guardarse archivos binarios directamente en PostgreSQL.

---

# 38. Estructura por feature

La funcionalidad deberá organizarse preferentemente dentro de:

```text
src/features/activities/
```

Ejemplo:

```text
components/
hooks/
queries/
mutations/
schemas/
types/
utils/
constants/
```

---

# 39. Queries sugeridas

El equipo deberá crear operaciones equivalentes a:

```text
getActivities()
getEvents()
getTrainings()
getActivityBySlug()
getActivityById()
getUpcomingActivities()
```

No es obligatorio utilizar exactamente estos nombres, pero deberá existir una separación clara de responsabilidades.

---

# 40. Mutations sugeridas

Crear operaciones equivalentes a:

```text
createActivity()
updateActivity()
publishActivity()
cancelActivity()
archiveActivity()
finishActivity()
```

Cuando una creación o actualización afecte varias relaciones, la implementación deberá preservar consistencia.

---

# 41. Atomic Design aplicado al Hito 2

Los componentes deberán dividirse razonablemente.

## Atoms

Ejemplos:

```text
Button
Input
Select
Textarea
Badge
Heading
Text
```

## Molecules

Ejemplos:

```text
FormField
PriceDisplay
StatusBadge
SearchInput
ActivityDate
```

## Organisms

Ejemplos:

```text
ActivityCard
ActivityFilters
ActivityForm
ActivitySchedule
ActivitySpeakers
ActivityInformation
```

## Templates

Ejemplos:

```text
ActivityDetailTemplate
ActivitiesListTemplate
ActivityAdminFormTemplate
```

Las páginas deberán concentrarse principalmente en:

- obtención/preparación de datos;
- composición;
- selección del template.

---

# 42. SEO y metadata

Las páginas públicas de eventos y capacitaciones deberán poder disponer de metadata adecuada.

Especialmente:

```text
/eventos/[slug]
/capacitaciones/[slug]
```

La metadata podrá utilizar:

- título;
- descripción corta;
- banner.

Next.js podrá utilizar Server Components cuando beneficie al renderizado público.

Esto no implica construir una API adicional.

---

# 43. Manejo de estados de interfaz

Las páginas deberán contemplar:

- loading;
- success;
- error;
- empty.

Ejemplos:

```text
No hay eventos publicados actualmente.
```

```text
No se encontraron capacitaciones con esos filtros.
```

Los errores técnicos no deberán mostrarse directamente al visitante.

---

# 44. Requerimientos técnicos

## RT-01 — Modelo unificado

Eventos y capacitaciones deberán almacenarse en:

`activities`

No se aceptará duplicación en tablas `events` y `trainings`.

---

## RT-02 — Diferenciación por tipo

La diferenciación deberá realizarse mediante:

`activities.type`

con:

```text
event
training
```

---

## RT-03 — Categorías

La temática deberá representarse mediante:

`activities.category_id → categories.id`

---

## RT-04 — Múltiples fechas

Las fechas deberán almacenarse en:

`activity_dates`

No deberá limitarse el modelo a una fecha única dentro de `activities`.

---

## RT-05 — Expositores reutilizables

Los expositores deberán relacionarse mediante:

`activity_speakers`

y no almacenarse como un campo de texto dentro de `activities`.

---

## RT-06 — UUID

Las claves primarias deberán utilizar UUID.

---

## RT-07 — Soft Delete

Las nuevas tablas operativas deberán utilizar:

```text
deleted_at
deleted_by
```

según corresponda.

---

## RT-08 — Slug

El slug deberá ser único entre actividades activas.

---

## RT-09 — Timestamps

Deberán mantenerse:

```text
created_at
updated_at
```

y utilizarse el trigger común `set_updated_at()` cuando corresponda.

---

## RT-10 — Índices

Crear como mínimo índices relevantes sobre:

```text
activities.type
activities.category_id
activities.status
activities.modality
activities.published_at
activities.registration_open_at
activities.registration_close_at

activity_dates.activity_id
activity_dates.starts_at

activity_speakers.activity_id
activity_speakers.speaker_id
```

---

## RT-11 — Acceso a Supabase

Las consultas deberán realizarse principalmente mediante `supabase-js`.

No deberá crearse una API CRUD intermedia únicamente para gestionar actividades.

---

## RT-12 — Validación

Deberá existir validación de formulario y restricciones PostgreSQL para reglas críticas.

---

## RT-13 — Atomic Design

Los componentes del módulo deberán respetar Atomic Design.

---

## RT-14 — Separación de dominio

La lógica del dominio de actividades deberá mantenerse principalmente en:

`features/activities`

y no dispersarse arbitrariamente entre páginas.

---

## RT-15 — Tipado

Las entidades y consultas deberán utilizar TypeScript y tipos compatibles con el esquema de Supabase.

---

## RT-16 — Consultas eficientes

Las pantallas deberán seleccionar las columnas necesarias.

Se deberá evitar `select *` indiscriminado en listados administrativos o catálogos cuando no sea necesario.

---

## RT-17 — Paginación

El listado administrativo deberá quedar preparado para paginación.

---

## RT-18 — Storage

Los banners deberán almacenarse mediante un mecanismo de archivos apropiado, preferentemente Supabase Storage dentro del alcance tecnológico definido.

---

## RT-19 — RLS

Las tablas del Hito 1 ya deberán tener RLS habilitado. Las nuevas tablas de este hito también deberán habilitarlo en su migración.

Este hito deberá añadir como mínimo:

- lectura anónima únicamente de actividades publicadas y sus datos públicos relacionados;
- lectura y mutación administrativa para cuentas activas con rol `operator` o `administrator`;
- denegación por defecto para cualquier operación no contemplada.

El Hito 11 completará la auditoría integral de permisos, pero estas tablas no podrán quedar temporalmente expuestas sin políticas.

---

# 45. Requerimientos funcionales

## RF-01 — Crear evento

El personal administrativo deberá poder crear una actividad de tipo:

`event`

---

## RF-02 — Crear capacitación

El personal administrativo deberá poder crear una actividad de tipo:

`training`

---

## RF-03 — Modelo común

Eventos y capacitaciones deberán compartir la misma lógica estructural salvo diferencias de presentación o campos opcionales.

---

## RF-04 — Editar actividad

Una actividad existente deberá poder modificarse mientras se encuentre activa en el sistema.

---

## RF-05 — Múltiples fechas

Una actividad deberá aceptar una o más fechas.

---

## RF-06 — Expositores

Una actividad deberá aceptar uno o varios expositores.

---

## RF-07 — Modalidad

El administrador deberá poder seleccionar:

- presencial;
- virtual;
- híbrida.

---

## RF-08 — Categoría

Una actividad deberá poder asociarse a una categoría temática.

---

## RF-09 — Actividad gratuita

El administrador deberá poder configurar una actividad como gratuita.

---

## RF-10 — Actividad con costo

El administrador deberá poder configurar:

- precio general;
- precio asociado.

---

## RF-11 — Exclusividad de asociados

Una actividad deberá poder marcarse como exclusiva para asociados.

Esto no impedirá que sea visible públicamente.

---

## RF-12 — Cupos

Una actividad deberá poder configurarse:

- sin límite;
- con límite.

---

## RF-13 — Periodo de inscripción

El administrador deberá poder definir:

- fecha de apertura;
- fecha de cierre.

---

## RF-14 — Estados

Una actividad deberá poder encontrarse en:

- borrador;
- publicada;
- finalizada;
- archivada;
- cancelada.

---

## RF-15 — Publicación directa

Un usuario administrativo autorizado deberá poder publicar una actividad sin workflow adicional de aprobación.

---

## RF-16 — Catálogo público de eventos

Los visitantes deberán poder consultar eventos publicados.

---

## RF-17 — Catálogo público de capacitaciones

Los visitantes deberán poder consultar capacitaciones publicadas.

---

## RF-18 — Búsqueda

Los visitantes deberán poder buscar actividades mediante palabras.

---

## RF-19 — Filtros

Los visitantes deberán poder filtrar actividades al menos por:

- modalidad;
- tipo;
- categoría;
- fecha;
- gratuita;
- con costo.

---

## RF-20 — Detalle público

El visitante deberá poder abrir una actividad y consultar toda la información pública disponible.

---

## RF-21 — Estados públicos

Una actividad cancelada que continúe visible deberá indicar claramente su condición.

---

## RF-22 — Actividades no publicadas

Las actividades en estado:

`draft`

no deberán mostrarse en el catálogo público.

---

## RF-23 — Soft delete

Una actividad eliminada lógicamente no deberá aparecer en los flujos normales de administración ni portal público.

---

## RF-24 — Reutilización de expositor

Un expositor previamente registrado deberá poder utilizarse en múltiples actividades.

---

## RF-25 — Campo opcional

La ausencia de campos opcionales no deberá provocar secciones vacías o errores visuales en la ficha pública.

---

# 46. Fuera del alcance del Hito 2

No forma parte de este hito:

- registrar participantes;
- formulario de inscripción;
- crear `registrations`;
- crear `attendance`;
- validar DNI duplicado por actividad;
- generar código de inscripción;
- confirmar automáticamente actividades gratuitas;
- preinscribir actividades con costo;
- descontar cupos;
- confirmar participantes;
- enviar correos de inscripción;
- registrar asistencia;
- emitir certificados;
- crear cuentas de estudiantes;
- implementar login funcional del Campus;
- cursos grabados.

Estas funcionalidades serán implementadas a partir del Hito 3.

---

# 47. Definition of Done

El Hito 2 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe el enum `activity_type`.
- [ ] Existe el enum `activity_modality`.
- [ ] Existe el enum `activity_status`.
- [ ] Existe la tabla `activities`.
- [ ] Existe la tabla `activity_dates`.
- [ ] Existe la tabla `activity_speakers`.
- [ ] `activities` se relaciona correctamente con `categories`.
- [ ] `activity_speakers` se relaciona correctamente con `speakers`.
- [ ] Las claves foráneas están configuradas.
- [ ] Existen las restricciones de precios.
- [ ] Existe restricción de capacidad válida.
- [ ] Existe validación de horas académicas.
- [ ] Existe validación de actividad gratuita y precios.
- [ ] El slug posee unicidad entre registros activos.
- [ ] Existe prevención de duplicidad activa de expositor/actividad.
- [ ] Se implementó soft delete.
- [ ] Los triggers de `updated_at` funcionan.
- [ ] Los índices principales están creados.
- [ ] Todo el esquema fue creado mediante migraciones versionadas.
- [ ] RLS está habilitado en todas las tablas nuevas.
- [ ] La lectura anónima está limitada a actividades publicadas y relaciones públicas activas.
- [ ] Las mutaciones administrativas requieren una cuenta interna activa y autorizada.

## Acceso administrativo

- [ ] Existe login para cuentas internas previamente provisionadas.
- [ ] La sesión se mantiene mediante cookies con la configuración SSR de Supabase.
- [ ] Las rutas administrativas rechazan usuarios no autenticados.
- [ ] Las cuentas `student` o inactivas no pueden realizar operaciones administrativas.
- [ ] Existe cierre de sesión.

## Administración

- [ ] Existe `/admin/actividades`.
- [ ] Existe listado administrativo de eventos.
- [ ] Existe listado administrativo de capacitaciones.
- [ ] Se puede crear un evento.
- [ ] Se puede crear una capacitación.
- [ ] Se puede editar una actividad.
- [ ] Se puede seleccionar categoría.
- [ ] Se puede configurar modalidad.
- [ ] Se puede agregar una fecha.
- [ ] Se pueden agregar múltiples fechas.
- [ ] Se pueden ordenar fechas.
- [ ] Se pueden asignar expositores.
- [ ] Se pueden asignar varios expositores.
- [ ] Se puede configurar precio general.
- [ ] Se puede configurar precio asociado.
- [ ] Se puede configurar una actividad gratuita.
- [ ] Se puede configurar exclusividad para asociados.
- [ ] Se puede configurar un límite de cupos.
- [ ] Se puede configurar el periodo de inscripción.
- [ ] Se puede cargar/configurar banner.
- [ ] Se puede guardar una actividad como borrador.
- [ ] Se puede publicar.
- [ ] Se puede cancelar.
- [ ] Se puede marcar como finalizada.
- [ ] Se puede archivar.

## Portal público

- [ ] Existe `/eventos`.
- [ ] Existe `/capacitaciones`.
- [ ] Los eventos publicados aparecen en `/eventos`.
- [ ] Las capacitaciones publicadas aparecen en `/capacitaciones`.
- [ ] Los borradores no aparecen públicamente.
- [ ] Los registros eliminados lógicamente no aparecen públicamente.
- [ ] Existe tarjeta reutilizable de actividad.
- [ ] Existe buscador.
- [ ] Existen filtros mínimos.
- [ ] Existe `/eventos/[slug]`.
- [ ] Existe `/capacitaciones/[slug]`.
- [ ] La ficha muestra correctamente múltiples fechas.
- [ ] La ficha muestra expositores.
- [ ] La ficha muestra modalidad.
- [ ] La ficha muestra precio general/asociado.
- [ ] Una actividad gratuita aparece identificada correctamente.
- [ ] Una actividad exclusiva para asociados puede seguir siendo visible.
- [ ] Una actividad cancelada muestra claramente su estado.
- [ ] Los campos opcionales sin contenido no generan bloques vacíos.

## Componentes y arquitectura

- [ ] La interfaz utiliza los componentes base de Atomic Design.
- [ ] Existe un `ActivityCard` o equivalente reutilizable.
- [ ] Existen componentes reutilizables para precios y estados.
- [ ] El formulario administrativo no es un componente monolítico innecesario.
- [ ] La lógica de consultas está separada de la presentación.
- [ ] Las queries del dominio se encuentran organizadas.
- [ ] Las mutations están organizadas.
- [ ] Existen schemas de validación.
- [ ] No existe duplicación considerable entre formularios de eventos y capacitaciones.
- [ ] No se creó una API CRUD propia innecesaria.

## TypeScript y calidad

- [ ] Los nuevos tipos de base de datos están actualizados.
- [ ] Las consultas están tipadas.
- [ ] Las mutations están tipadas.
- [ ] Los formularios están tipados.
- [ ] No existen errores críticos de TypeScript.
- [ ] Se manejan estados `loading`.
- [ ] Se manejan estados `error`.
- [ ] Se manejan estados `empty`.
- [ ] Los errores técnicos se transforman en mensajes entendibles.

## Integración final

El equipo deberá demostrar el siguiente recorrido sin modificaciones manuales en base de datos:

```text
1. Iniciar la aplicación.
2. Autenticarse con una cuenta interna autorizada y entrar al panel administrativo.
3. Crear una categoría o utilizar una existente.
4. Seleccionar un expositor existente.
5. Crear un evento.
6. Agregar dos fechas.
7. Configurar modalidad.
8. Configurar precios.
9. Configurar cupos.
10. Guardar como borrador.
11. Confirmar que no aparece en el portal público.
12. Publicarlo.
13. Abrir /eventos.
14. Encontrar la actividad.
15. Aplicar filtros o búsqueda.
16. Abrir /eventos/[slug].
17. Visualizar correctamente la información.
18. Cancelar la actividad desde administración.
19. Comprobar su estado público correspondiente.
```

También deberá demostrarse el mismo principio con una actividad de tipo capacitación.

---

# 48. Resultado final esperado del Hito 2

Al finalizar este hito, deberá existir el primer módulo funcional real de la plataforma.

La arquitectura deberá permitir:

```text
ADMINISTRACIÓN
      │
      ▼
Crear actividad
      │
      ├── Información
      ├── Categoría
      ├── Fechas
      ├── Expositores
      ├── Modalidad
      ├── Precios
      ├── Cupos
      └── Estado
      │
      ▼
Publicar
      │
      ▼
SUPABASE
      │
      ▼
PORTAL PÚBLICO
      │
      ├── /eventos
      ├── /capacitaciones
      ├── búsqueda
      ├── filtros
      └── detalle
```

El visitante todavía no podrá inscribirse.

Ese comportamiento comenzará en:

**Hito 3 — Inscripción y gestión inicial de participantes.**

El Hito 2 quedará terminado cuando una actividad pueda ser creada completamente desde administración, persistida correctamente en Supabase y publicada en el portal sin intervención manual sobre PostgreSQL.
