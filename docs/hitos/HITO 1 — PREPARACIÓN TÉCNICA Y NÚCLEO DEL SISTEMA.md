# HITO 1 — PREPARACIÓN TÉCNICA Y NÚCLEO DEL SISTEMA

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 1 establece la base técnica sobre la cual se desarrollará todo el MVP.

Su finalidad no es entregar todavía funcionalidades completas para el usuario final, sino dejar preparada una estructura de desarrollo estable, reproducible y suficientemente organizada para comenzar posteriormente con los módulos de eventos, capacitaciones y cursos.

En este hito deberán quedar definidos y funcionando:

- proyecto Next.js;
- conexión con Supabase;
- estructura de carpetas;
- estructura Atomic Design;
- sistema de migraciones;
- configuración de variables de entorno;
- clientes de Supabase;
- modelo inicial de identidad;
- categorías;
- expositores;
- soft delete;
- timestamps;
- tipos de base de datos;
- layouts principales de la aplicación.

El resultado debe permitir que los siguientes hitos se desarrollen incrementalmente sin necesidad de reorganizar constantemente la arquitectura base.

---

# 2. Objetivo del hito

Construir y validar la **fundación técnica inicial de la plataforma**, asegurando que Next.js y Supabase se encuentren correctamente integrados y que exista una estructura de proyecto preparada para implementar posteriormente las funcionalidades del MVP.

El hito deberá establecer especialmente:

1. la arquitectura inicial del proyecto Next.js;
2. la conexión con Supabase;
3. el sistema de migraciones de PostgreSQL;
4. la organización mediante Atomic Design;
5. la separación entre interfaz, lógica de dominio y acceso a datos;
6. el modelo central de identidad institucional;
7. las primeras entidades reutilizadas transversalmente;
8. las convenciones técnicas del proyecto.

Una de las decisiones fundamentales que deberá quedar representada desde este hito es que:

**Persona ≠ Cuenta de usuario.**

Una persona podrá existir en la plataforma sin tener una cuenta y posteriormente vincularse con Supabase Auth sin perder su historial institucional. 
---

# 3. Alcance del hito

El Hito 1 comprende únicamente la preparación técnica y las entidades transversales.

No incluye todavía el desarrollo completo de:

- eventos;
- capacitaciones;
- inscripciones;
- asistencia;
- certificados;
- cursos;
- módulos;
- clases;
- progreso;
- quizzes.

Tampoco incluye todavía la implementación funcional completa del login del Campus.

La autenticación administrativa mínima se incorporará en el Hito 2 antes de habilitar mutaciones del panel. El registro, login y recuperación de cuenta para estudiantes del Campus se completarán en el Hito 6.

Sin embargo, sí deberá crearse la estructura `user_accounts`, ya que constituye parte del modelo central de datos.

---

# 4. Tareas del hito

## 4.1 Crear el proyecto Next.js

Crear la aplicación utilizando:

- Next.js;
- App Router;
- TypeScript.

La aplicación deberá constituir una única solución que posteriormente contendrá:

- portal público;
- campus virtual;
- panel administrativo.

No deberán crearse aplicaciones independientes para estas áreas.

---

## 4.2 Configurar TypeScript

El proyecto deberá utilizar TypeScript desde el inicio.

Se deberá:

- activar configuración estricta razonable;
- evitar el uso indiscriminado de `any`;
- definir aliases para imports;
- preparar tipos reutilizables;
- permitir posteriormente utilizar tipos generados desde Supabase.

---

## 4.3 Crear y configurar Supabase

Crear el proyecto Supabase que se utilizará para desarrollo.

Deberán quedar disponibles:

- PostgreSQL;
- Auth;
- Storage;
- API de datos.

En este hito no es necesario desarrollar todavía toda la configuración funcional de Auth o Storage.

---

## 4.4 Configurar variables de entorno

Como mínimo deberán prepararse las variables necesarias para la conexión con Supabase.

Ejemplo conceptual:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Las variables secretas deberán mantenerse únicamente en contexto servidor.

No deberán almacenarse secretos directamente en el código fuente.

---

## 4.5 Configurar clientes de Supabase

Crear una configuración centralizada.

Estructura recomendada:

```text
src/lib/supabase/
    client.ts
    server.ts
    database.types.ts
```

No deberán existir múltiples configuraciones independientes de Supabase dispersas en el proyecto.

El cliente de navegador será utilizado principalmente para el acceso directo mediante `supabase-js`.

El cliente servidor se utilizará cuando sea necesario trabajar desde Server Components, SSR o funcionalidades exclusivamente de servidor.

---

## 4.6 Configurar sistema de migraciones

Crear:

```text
supabase/
    migrations/
    seed.sql
    config.toml
```

Los cambios estructurales de base de datos deberán mantenerse mediante migraciones.

No se deberá depender exclusivamente de modificaciones manuales realizadas desde el Dashboard de Supabase.

La primera migración podrá agrupar el núcleo del sistema, por ejemplo:

```text
001_core.sql
```

---

# 5. Crear estructura de rutas

Preparar los principales Route Groups.

Ejemplo:

```text
src/app/

(public)/
(campus)/
(admin)/
api/
```

Deberán existir las bases para:

```text
/
```

```text
/campus
```

```text
/admin
```

En este hito no es necesario implementar todavía todas sus páginas internas.

---

# 6. Crear layouts principales

Crear al menos:

- layout general;
- layout público;
- layout del Campus;
- layout administrativo.

Los layouts podrán ser inicialmente básicos.

Su propósito será establecer desde el inicio la separación visual y estructural entre las principales áreas del sistema.

---

# 7. Implementar Atomic Design

Atomic Design será obligatorio para la estructura de componentes.

La jerarquía será:

```text
Atoms
↓
Molecules
↓
Organisms
↓
Templates
↓
Pages
```

Deberá crearse como mínimo:

```text
src/components/
    atoms/
    molecules/
    organisms/
    templates/
```

La atomicidad deberá buscar reutilización sin trasladar arbitrariamente reglas de negocio a los componentes visuales.

---

# 8. Crear átomos base

No es necesario construir desde este hito absolutamente todos los componentes que utilizará el producto.

Deberán desarrollarse solamente los elementos base necesarios para comenzar los siguientes hitos.

Inicialmente se recomienda crear:

- `Button`;
- `Input`;
- `Textarea`;
- `Select`;
- `Checkbox`;
- `Badge`;
- `Spinner`;
- `Skeleton`;
- `Heading`;
- `Text`;
- `Label`.

Estos componentes:

- no deberán consultar Supabase;
- no deberán conocer reglas del dominio;
- deberán recibir información mediante props;
- deberán ser reutilizables.

---

# 9. Preparar estructura de features

Crear la estructura para separar funcionalidad por dominio.

Por ejemplo:

```text
src/features/
    activities/
    registrations/
    participants/
    attendance/
    speakers/
    courses/
    course-enrollments/
    lessons/
    progress/
    quizzes/
    certificates/
    authentication/
    users/
```

No será necesario implementar todos estos módulos todavía.

El propósito es establecer una convención estable.

---

# 10. Preparar estructura de utilidades y configuración

Crear como mínimo:

```text
src/
    hooks/
    utils/
    constants/
    config/
    types/
```

Podrán incorporarse progresivamente elementos como:

```text
utils/dates.ts
utils/currency.ts
utils/strings.ts

constants/routes.ts
constants/pagination.ts

config/navigation.ts
config/permissions.ts
```

No deberán crearse utilidades sin uso únicamente para completar carpetas.

---

# 11. Crear enums iniciales de PostgreSQL

Deberán crearse inicialmente los enums necesarios para las entidades del núcleo.

Como mínimo:

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

Los demás enums podrán crearse cuando sus respectivos dominios sean implementados en hitos posteriores.

---

# 12. Crear tabla `people`

## Objetivo

Representar la identidad institucional única de una persona.

Esta tabla será una de las entidades centrales del proyecto.

Una persona podrá:

- participar en un evento sin cuenta;
- participar en varias capacitaciones;
- crear posteriormente una cuenta;
- acceder después a cursos;

manteniendo siempre el mismo `person_id`.

## Campos

Como mínimo:

```text
id
document_type
document_number
first_names
last_names
email
phone
job_title
company
ruc
address
created_at
updated_at
deleted_at
deleted_by
```

## Restricciones

Crear identidad única permanente mediante:

```text
document_type + document_number
```

sin excluir registros eliminados lógicamente.

El documento deberá almacenarse en una forma canónica equivalente a:

```text
upper(trim(document_number))
```

Si una persona fue eliminada lógicamente, deberá restaurarse o reutilizarse en lugar de crear una nueva identidad con el mismo documento.

También deberán establecerse las validaciones del RUC definidas en el diseño físico.

---

# 13. Crear tabla `user_accounts`

## Objetivo

Preparar la relación futura entre Supabase Auth y la identidad institucional.

Relación:

```text
auth.users
    ↓
user_accounts
    ↓
people
```

## Campos principales

```text
user_id
person_id
role
is_active
created_at
updated_at
deleted_at
deleted_by
```

## Consideraciones

- `user_id` referenciará `auth.users.id`.
- `person_id` referenciará `people.id`.
- Una persona solamente podrá mantener una cuenta activa.
- Todavía no será necesario implementar todo el proceso de registro/login.

---

# 14. Crear tabla `categories`

## Objetivo

Preparar el catálogo temático que utilizarán posteriormente eventos y capacitaciones.

Campos:

```text
id
name
slug
description
sort_order
is_active
created_at
updated_at
deleted_at
deleted_by
```

El `slug` deberá ser único entre registros activos.

---

# 15. Crear tabla `speakers`

## Objetivo

Disponer desde el inicio del registro reutilizable de:

- expositores;
- docentes;
- instructores.

Campos:

```text
id
first_names
last_names
professional_title
organization
bio
photo_path
created_at
updated_at
deleted_at
deleted_by
```

La misma entidad será utilizada posteriormente tanto por actividades como por cursos.

---

# 16. Implementar campos estándar

Las tablas operativas del sistema deberán utilizar una convención común.

Como base:

```text
id
created_at
updated_at
deleted_at
deleted_by
```

Las claves primarias utilizarán:

```text
UUID
```

con:

```text
gen_random_uuid()
```

cuando corresponda.

---

# 17. Implementar Soft Delete

El borrado administrativo normal deberá ser lógico.

Un registro activo:

```sql
deleted_at IS NULL
```

Una eliminación lógica deberá establecer conceptualmente:

```text
deleted_at = now()
deleted_by = usuario responsable
```

Soft delete deberá diferenciarse siempre de los estados funcionales.

Por ejemplo:

```text
cancelled
```

no significa:

```text
deleted
```

Esta convención deberá quedar establecida desde el primer hito.

---

# 18. Crear función `set_updated_at()`

Crear una función PostgreSQL reutilizable para actualizar automáticamente:

```text
updated_at = now()
```

cuando un registro modificable sea actualizado.

Deberá poder reutilizarse en las tablas posteriores del sistema.

---

# 19. Crear índices iniciales

Como mínimo deberán crearse los índices definidos para las tablas del núcleo.

Especialmente:

```text
people(document_type, document_number)
people(email)
categories(slug)
```

además de los índices que correspondan a claves foráneas y búsquedas principales.

---

# 20. Generar tipos TypeScript desde Supabase

Una vez ejecutadas las migraciones iniciales, deberán generarse los tipos correspondientes al esquema.

Archivo sugerido:

```text
src/lib/supabase/database.types.ts
```

El objetivo es reducir inconsistencias entre PostgreSQL y TypeScript.

---

# 21. Crear datos iniciales mínimos

Preparar `seed.sql` para información estrictamente necesaria.

En este hito podrán agregarse, por ejemplo:

- categorías iniciales de prueba;
- configuraciones básicas necesarias para desarrollo.

No deberán agregarse grandes cantidades de datos ficticios como parte de producción.

---

# 22. Verificar conexión completa

Deberá existir al menos una comprobación real de:

```text
Next.js
↓
supabase-js
↓
PostgreSQL
```

La validación deberá demostrar que:

- la aplicación puede conectarse;
- puede ejecutar una consulta;
- puede leer información creada mediante migraciones/seeds;
- los tipos se encuentran disponibles en TypeScript.

---

# 23. Requerimientos técnicos

## RT-01 — Framework

La aplicación deberá utilizar:

```text
Next.js + App Router
```

---

## RT-02 — Lenguaje

El proyecto deberá utilizar:

```text
TypeScript
```

---

## RT-03 — Backend

Supabase será utilizado para:

- PostgreSQL;
- Auth;
- Storage;
- APIs de datos.

---

## RT-04 — Acceso a datos

El mecanismo principal será:

```text
supabase-js
```

No deberá crearse una API CRUD propia para operaciones básicas.

---

## RT-05 — Route Handlers

La carpeta:

```text
src/app/api/
```

podrá existir, pero no deberá utilizarse todavía para construir una capa API innecesaria.

Route Handlers se reservarán para:

- secretos;
- claves privadas;
- integraciones externas;
- procesamiento exclusivamente servidor.

---

## RT-06 — Migraciones

Todo cambio estructural relevante deberá mantenerse mediante migraciones versionadas.

---

## RT-07 — Identificadores

Las claves primarias de negocio utilizarán UUID.

Los códigos públicos futuros serán campos independientes.

---

## RT-08 — Convención de base de datos

La base deberá utilizar:

```text
snake_case
```

---

## RT-09 — Soft Delete

Las entidades operativas correspondientes deberán soportar:

```text
deleted_at
deleted_by
```

---

## RT-10 — Atomic Design

Los componentes visuales deberán organizarse obligatoriamente mediante:

- atoms;
- molecules;
- organisms;
- templates.

---

## RT-11 — Separación de responsabilidades

La lógica visual deberá mantenerse separada de:

- acceso a datos;
- reglas de negocio;
- validaciones;
- utilidades.

---

## RT-12 — Variables de entorno

Ningún secreto deberá incorporarse directamente al repositorio o enviarse al navegador.

---

## RT-13 — Tipos de base de datos

Los tipos TypeScript deberán generarse desde el esquema Supabase siempre que sea posible.

---

## RT-14 — RLS

El diseño detallado de permisos por rol queda fuera de este hito.

Todas las tablas creadas en el esquema expuesto `public` deberán tener RLS habilitado desde su migración.

En este hito se aplicará una línea base segura:

- `people` y `user_accounts` no tendrán acceso anónimo;
- `categories` y `speakers` podrán exponer únicamente lectura de registros activos y no eliminados;
- no se concederán mutaciones administrativas anónimas;
- las políticas adicionales se incorporarán con el hito que introduzca cada caso de uso.

El Hito 11 auditará y endurecerá la matriz completa de autorización, pero no será el momento en que RLS se active por primera vez.

---

# 24. Requerimientos funcionales del Hito 1

El Hito 1 tiene pocos requerimientos funcionales visibles para un usuario final, porque constituye principalmente una etapa de fundación técnica.

Sin embargo, deberán cumplirse los siguientes comportamientos.

## RF-01 — Identidad institucional única

El sistema deberá disponer de una entidad `people` capaz de representar una persona aunque esta todavía no tenga cuenta.

---

## RF-02 — Documento único

Una misma combinación histórica de:

```text
document_type
+
document_number
```

no podrá representar a dos personas diferentes, incluso si una de ellas fue eliminada lógicamente.

---

## RF-03 — Preparación para cuenta futura

Una persona podrá relacionarse posteriormente con una cuenta de Supabase Auth mediante `user_accounts`.

---

## RF-04 — Roles iniciales

El modelo deberá permitir almacenar los siguientes roles:

```text
student
operator
administrator
```

---

## RF-05 — Gestión temática

El sistema deberá disponer de categorías reutilizables que posteriormente puedan asociarse a actividades.

---

## RF-06 — Gestión de expositores

El sistema deberá disponer de un registro reutilizable de expositores/instructores.

Un expositor no será un simple texto repetido dentro de cada actividad futura.

---

## RF-07 — Eliminación lógica

La eliminación administrativa normal de las entidades del núcleo deberá preservar el registro mediante soft delete.

---

## RF-08 — Historial preservable

El diseño deberá permitir que la información histórica de una persona pueda conservarse cuando posteriormente se implementen:

- inscripciones;
- cursos;
- certificados;
- progreso.

---

# 25. Fuera del alcance del Hito 1

No deberá considerarse parte del Definition of Done de este hito:

- catálogo público de eventos;
- creación de eventos;
- creación de capacitaciones;
- inscripción;
- cupos;
- asistencia;
- certificados;
- login funcional del Campus;
- registro de alumnos;
- recuperación de contraseña;
- cursos;
- videos;
- materiales;
- quizzes;
- progreso;
- matriz completa de permisos por rol;
- correos;
- generación de certificados PDF;
- integraciones externas.

Estas funcionalidades serán desarrolladas progresivamente en los siguientes hitos.

---

# 26. Definition of Done

El Hito 1 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Infraestructura

- [ ] Existe un proyecto Next.js funcional.
- [ ] App Router se encuentra habilitado.
- [ ] TypeScript está correctamente configurado.
- [ ] El proyecto puede ejecutarse en entorno de desarrollo.
- [ ] Next.js está correctamente conectado con Supabase.
- [ ] Las variables de entorno están correctamente configuradas.
- [ ] No existen secretos escritos directamente en el código.

## Arquitectura

- [ ] Existe separación entre portal público, Campus y administración.
- [ ] Existen los layouts básicos correspondientes.
- [ ] Existe estructura Atomic Design.
- [ ] Existen carpetas `atoms`, `molecules`, `organisms` y `templates`.
- [ ] Existe estructura inicial por `features`.
- [ ] Las responsabilidades de interfaz y acceso a datos están separadas.
- [ ] No existe una capa API CRUD innecesaria.

## Supabase

- [ ] Existe una configuración centralizada del cliente Supabase.
- [ ] Existe cliente de navegador.
- [ ] Existe configuración de servidor cuando corresponda.
- [ ] Existe el directorio `supabase/migrations`.
- [ ] Las migraciones pueden ejecutarse correctamente.
- [ ] El esquema puede reconstruirse utilizando las migraciones del repositorio.
- [ ] RLS está habilitado en todas las tablas expuestas del núcleo.
- [ ] Las tablas con información personal no permiten acceso anónimo.
- [ ] Las políticas públicas del núcleo son únicamente de lectura y filtran registros activos no eliminados.

## Base de datos

- [ ] Existen los enums iniciales necesarios.
- [ ] Existe la tabla `people`.
- [ ] Existe la tabla `user_accounts`.
- [ ] Existe la tabla `categories`.
- [ ] Existe la tabla `speakers`.
- [ ] Las relaciones entre tablas son correctas.
- [ ] Existen las foreign keys correspondientes.
- [ ] Existen restricciones de identidad para `people`.
- [ ] Existen los índices definidos para el núcleo.
- [ ] Los campos estándar se encuentran implementados.
- [ ] Soft delete funciona correctamente.
- [ ] Existe `set_updated_at()`.
- [ ] Los triggers correspondientes funcionan.

## TypeScript

- [ ] Los tipos de Supabase pueden generarse correctamente.
- [ ] Existe `database.types.ts`.
- [ ] Los tipos pueden utilizarse desde Next.js.
- [ ] No se depende innecesariamente de tipos manuales duplicados del esquema.

## Atomic Design

- [ ] Existen los átomos base definidos para comenzar el siguiente hito.
- [ ] Los átomos no consultan directamente Supabase.
- [ ] Los componentes no contienen reglas de negocio innecesarias.
- [ ] Los componentes base pueden ser reutilizados.

## Datos

- [ ] Existe `seed.sql` cuando sea necesario.
- [ ] Se pueden insertar categorías de prueba.
- [ ] Se puede insertar al menos un expositor de prueba.
- [ ] Se puede insertar y consultar una persona.

## Integración

- [ ] Next.js puede consultar datos reales de Supabase.
- [ ] La aplicación puede leer como mínimo información del núcleo.
- [ ] La conexión funciona sin utilizar datos mock para la validación final.
- [ ] No existen errores de TypeScript relacionados con la configuración principal.
- [ ] No existen errores críticos de ejecución.

## Validación final

El equipo deberá poder demostrar exitosamente:

```text
1. Levantar el proyecto.
2. Ejecutar migraciones.
3. Ejecutar seeds.
4. Iniciar Next.js.
5. Conectarse con Supabase.
6. Consultar datos reales.
7. Crear o consultar una persona.
8. Consultar categorías.
9. Consultar expositores.
10. Confirmar que la estructura está preparada para comenzar Hito 2.
```

---

# 27. Resultado final esperado del Hito 1

Al finalizar este hito deberá existir una aplicación técnicamente preparada para comenzar la construcción funcional del producto.

El equipo no deberá haber desarrollado todavía el sistema completo de eventos o cursos.

Sin embargo, deberá contar con:

```text
NEXT.JS
   │
   ├── Portal público preparado
   ├── Campus preparado
   └── Administración preparada
          │
          ▼
     supabase-js
          │
          ▼
       SUPABASE
          │
          ├── people
          ├── user_accounts
          ├── categories
          └── speakers
```

Deberán encontrarse establecidas las convenciones que utilizará el resto del proyecto:

- UUID;
- snake_case;
- soft delete;
- timestamps;
- migraciones;
- TypeScript;
- Atomic Design;
- separación por features;
- acceso directo mediante Supabase;
- identidad única de persona.

Una vez cumplido el Definition of Done, el equipo podrá avanzar al:

**Hito 2 — Gestión y publicación de eventos y capacitaciones.**
