# HITO 11 — SEGURIDAD, RLS Y CONTROL DE ACCESO

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 11 tiene como finalidad implementar la **capa definitiva de seguridad y control de acceso** antes de llevar el MVP a producción.

Durante los hitos anteriores, la prioridad fue construir y validar los recorridos funcionales completos de la plataforma:

### Eventos y capacitaciones

**Actividad → Publicación → Inscripción → Confirmación → Asistencia → Certificado**

### Campus Virtual

**Registro/Login → Curso → Clases → Progreso → Quizzes → Finalización → Certificado → Valoración**

En este punto, las principales funcionalidades del producto ya deberán estar operativas.

Sin embargo, debido a que la arquitectura del proyecto utiliza principalmente consultas directas desde Next.js hacia Supabase mediante `supabase-js`, la protección de la información no puede depender únicamente de:

- ocultar botones;
- proteger páginas en Next.js;
- comprobar roles solamente en React;
- impedir navegación visual.

La seguridad deberá reforzarse directamente en PostgreSQL y Supabase mediante **Row Level Security (RLS)** y políticas de Storage.

El objetivo será garantizar que, incluso si un usuario intenta realizar consultas manualmente contra Supabase, únicamente pueda leer o modificar la información que legítimamente le corresponda.

Este hito materializa una decisión que fue postergada deliberadamente durante las primeras fases de desarrollo: las políticas RLS no debían frenar la construcción inicial, pero **son obligatorias antes de producción** debido al modelo de acceso directo a Supabase.

---

# 2. Objetivo del hito

Implementar una estrategia integral de seguridad basada en:

- Supabase Auth;
- `auth.uid()`;
- `user_accounts`;
- roles;
- Row Level Security;
- políticas de Storage;
- validaciones de servidor;
- separación entre operaciones públicas, autenticadas y administrativas;
- protección de datos personales;
- protección de contenido privado;
- protección de operaciones críticas.

Al finalizar el hito deberán existir reglas claras para:

```text
Visitante
Student
Operator
Administrator
```

y cada tipo de usuario deberá poder realizar únicamente las operaciones necesarias para su función.

El sistema deberá seguir el principio:

**La interfaz puede ocultar acciones, pero PostgreSQL debe impedir accesos no autorizados.**

---

# 3. Alcance del hito

El Hito 11 comprende:

- activación de RLS;
- matriz de acceso;
- políticas por tabla;
- lectura pública;
- acceso autenticado;
- acceso de estudiantes;
- acceso administrativo;
- políticas para `people`;
- políticas para actividades;
- políticas para inscripciones;
- asistencia;
- certificados;
- cursos;
- matrículas;
- progreso;
- quizzes;
- valoraciones;
- notificaciones;
- Storage;
- banners públicos;
- materiales privados;
- certificados privados;
- revisión de RPC;
- revisión de funciones PostgreSQL;
- revisión de `SECURITY DEFINER`;
- protección de `service_role`;
- protección de datos personales;
- revisión de Route Handlers;
- pruebas de acceso indebido;
- revisión de logs y errores.

No comprende todavía:

- pruebas finales integrales de todo el producto;
- optimización final de rendimiento;
- despliegue productivo definitivo;
- pruebas de carga finales;
- checklist de salida a producción.

Estos puntos corresponden principalmente al Hito 12.

---

# 4. Principio general de seguridad

La aplicación deberá seguir varias capas de protección.

```text
USUARIO
   │
   ▼
NEXT.JS
   │
   ├── Protección de rutas
   ├── Validaciones
   └── Experiencia según rol
   │
   ▼
SUPABASE AUTH
   │
   ▼
POSTGRESQL
   │
   ├── RLS
   ├── Constraints
   ├── RPC
   └── Funciones
   │
   ▼
DATOS
```

Ninguna capa deberá considerarse suficiente de manera aislada.

---

# 5. Roles del sistema

Deberán mantenerse los roles definidos anteriormente:

```text
student
operator
administrator
```

almacenados en:

`user_accounts.role`

---

# 6. Visitante anónimo

Un visitante no autenticado podrá utilizar las funcionalidades expresamente públicas.

Principalmente:

- consultar eventos publicados;
- consultar capacitaciones publicadas;
- consultar cursos publicados;
- consultar categorías;
- consultar expositores públicos relacionados;
- enviar inscripción a eventos/capacitaciones mediante el mecanismo controlado;
- consultar un certificado mediante token válido.

No deberá tener acceso general directo a información privada.

---

# 7. Student

Un estudiante autenticado podrá:

- consultar su perfil;
- consultar sus cursos;
- acceder a cursos habilitados;
- consultar su progreso;
- actualizar su propio progreso;
- realizar sus quizzes;
- consultar sus intentos;
- consultar sus certificados;
- valorar cursos completados.

No deberá poder:

- administrar actividades;
- consultar participantes de terceros;
- modificar matrículas;
- consultar respuestas correctas antes de resolver quizzes;
- emitir certificados manualmente;
- consultar cursos privados de otros alumnos;
- modificar roles.

---

# 8. Operator

El rol:

`operator`

estará destinado a operaciones administrativas.

Deberá poder acceder únicamente a las funcionalidades administrativas que correspondan al alcance operativo del MVP.

Como mínimo podrá participar en tareas como:

- consultar actividades;
- gestionar inscripciones;
- consultar participantes;
- confirmar inscripciones;
- registrar asistencia;
- gestionar determinadas operaciones de cursos.

La diferencia fina entre `operator` y `administrator` podrá mantenerse relativamente simple en el MVP, tal como se definió previamente.

No es necesario implementar todavía un sistema de permisos granular por acción.

---

# 9. Administrator

El rol:

`administrator`

deberá disponer de acceso administrativo amplio.

Podrá realizar operaciones como:

- gestión de actividades;
- participantes;
- inscripciones;
- asistencia;
- certificados;
- cursos;
- contenido;
- usuarios internos;
- configuraciones;
- plantillas;
- firmantes.

La autorización seguirá estando protegida por RLS y lógica confiable, no únicamente por la interfaz.

---

# 10. Crear matriz de permisos

Antes de escribir las políticas RLS, el equipo deberá elaborar una matriz de acceso.

Ejemplo conceptual:

| Recurso | Anónimo | Student | Operator | Administrator |
|---|---:|---:|---:|---:|
| Actividades publicadas | Lectura | Lectura | Lectura/gestión | Gestión |
| Personas | No | Propia | Lectura operativa | Gestión |
| Inscripciones | RPC pública controlada | Propias si aplica | Gestión | Gestión |
| Cursos publicados | Lectura | Lectura | Gestión | Gestión |
| Matrículas | No | Propias | Gestión | Gestión |
| Progreso | No | Propio | Consulta | Gestión |
| Quizzes | Publicado sin respuestas | Propios | Gestión | Gestión |
| Certificados | Token / propio | Propios | Gestión | Gestión |
| Auditoría | No | No | Limitado o no | Consulta |

La matriz definitiva deberá basarse en los flujos funcionales ya implementados.

---

# 11. Crear helpers de autorización en PostgreSQL

Para evitar repetir lógica compleja dentro de cada política, podrán crearse funciones auxiliares.

Por ejemplo, conceptualmente:

```text
current_user_account()
current_person_id()
current_user_role()
is_admin()
is_operator_or_admin()
```

Los nombres exactos podrán variar.

Estas funciones deberán diseñarse cuidadosamente para poder utilizarse desde RLS sin introducir vulnerabilidades.

---

# 12. Relación de usuario autenticado con persona

La lógica deberá poder resolver:

```text
auth.uid()
    ↓
user_accounts.user_id
    ↓
user_accounts.person_id
    ↓
people.id
```

Esta relación será fundamental para las políticas del Campus.

---

# 13. Activar RLS

Las tablas expuestas mediante Supabase deberán activar:

```sql
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
```

según corresponda.

No deberá dejarse una tabla sensible accidentalmente expuesta sin políticas.

---

# 14. Estrategia de implementación

Las políticas deberán implementarse gradualmente por dominio:

```text
1. Catálogos públicos
2. Identidad
3. Actividades
4. Inscripciones
5. Certificados
6. Cursos
7. Matrículas
8. Progreso
9. Quizzes
10. Valoraciones
11. Administración
12. Storage
```

Después de cada grupo deberán ejecutarse pruebas de acceso.

---

# 15. RLS para `categories`

Los visitantes podrán consultar categorías activas necesarias para mostrar el portal.

La modificación deberá limitarse a usuarios internos autorizados.

Conceptualmente:

### SELECT

Permitido públicamente para registros activos.

### INSERT / UPDATE / DELETE

Solo usuarios administrativos autorizados.

---

# 16. RLS para `speakers`

Los expositores necesarios para mostrar actividades y cursos públicos podrán consultarse cuando corresponda.

Las operaciones de administración deberán limitarse a:

- operator cuando corresponda;
- administrator.

No deberá permitirse modificación anónima.

---

# 17. RLS para `activities`

Los visitantes deberán poder consultar actividades que cumplan condiciones públicas como:

```text
status = published
deleted_at IS NULL
```

Los borradores no deberán ser visibles públicamente.

---

# 18. Actividades administrativas

Las operaciones:

- crear;
- editar;
- publicar;
- cancelar;
- finalizar;
- archivar;

deberán quedar restringidas a roles internos.

No deberá ser posible modificar una actividad utilizando directamente el cliente Supabase como estudiante.

---

# 19. `activity_dates`

Las fechas asociadas a actividades publicadas podrán consultarse públicamente.

La modificación deberá limitarse a usuarios internos.

Las políticas deberán validar la actividad padre correspondiente.

---

# 20. `activity_speakers`

Las relaciones de expositores de actividades publicadas podrán consultarse públicamente.

La creación/modificación deberá ser administrativa.

---

# 21. `people`

`people` constituye una de las tablas más sensibles del sistema.

No deberá existir una política pública general equivalente a:

```text
SELECT all people
```

Un visitante no deberá poder descargar el padrón completo de personas registradas.

---

# 22. Student sobre `people`

Un estudiante autenticado deberá poder consultar principalmente:

**su propia persona.**

La relación deberá resolverse mediante:

```text
auth.uid()
↓
user_accounts
↓
person_id
```

---

# 23. Edición de perfil

Cuando un alumno modifique su perfil, solamente deberá poder actualizar los campos permitidos de su propia persona.

La autorización no deberá permitir:

- cambiar su rol;
- modificar otra persona;
- reasignarse otro `person_id`.

---

# 24. Administración de `people`

Los usuarios internos correspondientes podrán consultar participantes para las tareas administrativas.

Estas políticas deberán limitarse a roles autorizados.

---

# 25. Registro público de actividades

El flujo de inscripción de eventos y capacitaciones continuará funcionando sin login.

Sin embargo, esto **no significa que se deba conceder INSERT público indiscriminado** sobre:

- `people`;
- `registrations`;
- `attendance`.

La inscripción deberá continuar utilizando el mecanismo controlado:

`register_activity()`.



---

# 26. RPC pública controlada

El usuario anónimo podrá ejecutar únicamente la RPC necesaria para registrarse.

La función deberá:

- validar actividad;
- validar periodo;
- buscar/crear persona;
- evitar duplicados;
- validar cupos;
- calcular precio;
- determinar estado;
- crear asistencia.

La política de seguridad deberá impedir que el visitante evite esta lógica mediante INSERT directo.

---

# 27. Permisos sobre `registrations`

Un visitante no deberá poder consultar el listado completo de inscripciones.

Los usuarios administrativos podrán consultarlas según su rol.

Si en el futuro se expone alguna consulta propia al participante autenticado, deberá limitarse exclusivamente a su `person_id`.

---

# 28. Permisos sobre `attendance`

La asistencia deberá ser una funcionalidad administrativa.

Un estudiante no deberá poder marcarse a sí mismo como:

`attended`.

Las operaciones deberán estar restringidas a usuarios internos autorizados.

---

# 29. Certificados por token

Los certificados de eventos deberán continuar siendo accesibles sin cuenta mediante:

`access_token`.

Sin embargo, esto no implica una política pública general sobre toda la tabla.

La consulta pública deberá estar limitada al mecanismo diseñado.

---

# 30. Protección de datos del certificado

La página pública deberá devolver únicamente la información necesaria:

- nombre;
- actividad/curso;
- condición;
- fecha;
- código;
- estado;
- acceso al archivo cuando corresponda.

No deberá exponer metadata administrativa innecesaria.

---

# 31. Certificados del Campus

Un estudiante autenticado deberá poder consultar certificados vinculados a su propia:

`person_id`.

No deberá poder consultar certificados privados de otras personas.

---

# 32. Administración de certificados

La emisión, revocación y administración deberán estar restringidas a roles internos autorizados.

---

# 33. RLS para `courses`

Los cursos con:

```text
status = published
deleted_at IS NULL
```

podrán consultarse públicamente en su información comercial.

Los borradores no deberán estar disponibles públicamente.

---

# 34. Contenido interno de cursos

Una cosa es consultar:

`courses`

como catálogo público.

Otra distinta es acceder a:

- módulos internos;
- clases;
- videos;
- materiales.

Estos recursos deberán protegerse mediante matrícula.

---

# 35. `course_modules`

Un estudiante deberá poder consultar módulos cuando:

- está autenticado;
- posee matrícula válida;
- el módulo está publicado.

Un visitante público podrá recibir únicamente la información de contenidos que se haya decidido exponer en la ficha comercial, preferentemente mediante consultas específicas que no revelen contenido privado.

---

# 36. `lessons`

Un estudiante deberá consultar clases únicamente si:

- tiene matrícula en el curso;
- la matrícula permite acceso;
- la clase pertenece al curso;
- está publicada.

Un usuario que adivine un `lesson_id` no deberá poder consultar su información privada sin matrícula.

---

# 37. URLs o IDs de videos

Los campos que permitan acceso real al video no deberán exponerse públicamente a usuarios sin matrícula.

Especialmente:

- rutas privadas;
- IDs de activos protegidos;
- URLs firmadas;
- metadata no pública.

---

# 38. `course_materials`

Los materiales deberán tratarse como contenido privado del Campus.

Un estudiante podrá consultarlos solamente si posee matrícula válida en el curso.

---

# 39. `course_enrollments`

Un estudiante deberá poder consultar únicamente sus propias matrículas.

La relación será:

```text
auth.uid()
↓
user_accounts.person_id
↓
course_enrollments.person_id
```

No deberá poder:

- concederse otro curso;
- cambiar `status`;
- cambiar `price_snapshot`;
- marcarse como `completed`;
- eliminar su matrícula.

---

# 40. Matrícula gratuita mediante RPC

La inscripción gratuita continuará utilizando:

`enroll_free_course()`.

La función deberá comprobar al usuario autenticado mediante `auth.uid()`.

No deberá aceptar arbitrariamente un `person_id` enviado desde el frontend para matricular a terceros.

---

# 41. Habilitación manual de cursos

La operación administrativa para cursos con costo deberá limitarse a roles internos.

Un estudiante no deberá poder ejecutar directamente una habilitación mediante Supabase.

---

# 42. `lesson_progress`

Un estudiante deberá poder:

- consultar su propio progreso;
- actualizarlo únicamente mediante el mecanismo definido.

No deberá poder consultar ni modificar progreso de otros estudiantes.

---

# 43. RPC `update_lesson_progress()`

La función deberá obtener el usuario desde la sesión cuando sea posible.

No deberá confiar en un `enrollment_id` arbitrario sin validar propiedad.

Deberá verificar:

- matrícula;
- persona;
- curso;
- clase.

---

# 44. Manipulación de progreso

Las políticas y RPC deberán impedir que el usuario modifique directamente:

```text
progress_percent
is_completed
completed_at
```

sin pasar por la lógica confiable.

Idealmente, el cliente no debería disponer de UPDATE directo indiscriminado sobre `lesson_progress`.

---

# 45. `quizzes`

Un alumno matriculado podrá consultar quizzes publicados correspondientes a su curso.

No deberá consultar quizzes de cursos sin acceso.

---

# 46. `quiz_questions`

El alumno podrá consultar preguntas activas del quiz al que tiene acceso.

---

# 47. `quiz_options`

El punto crítico será evitar que:

`is_correct`

sea consultable por el estudiante.

Las políticas por fila por sí solas no controlan columnas, por lo que deberán combinarse con una estrategia adecuada.

Podrán utilizarse:

- vistas;
- funciones;
- RPC;
- selección explícita;
- restricciones de privilegios;

según la implementación seleccionada.

La condición obligatoria es que las respuestas correctas no sean accesibles al alumno antes de resolver.

---

# 48. `submit_quiz_attempt()`

La RPC deberá:

- identificar al usuario;
- validar matrícula;
- validar quiz;
- obtener respuestas correctas internamente;
- calcular nota;
- guardar intento.

El alumno no deberá poder crear manualmente un:

`quiz_attempt`

con:

```text
score_percent = 100
is_passed = true
```

---

# 49. Intentos del estudiante

Un alumno deberá poder consultar únicamente sus propios intentos.

Los administradores podrán consultar los intentos cuando corresponda a sus tareas.

---

# 50. `course_ratings`

Un estudiante deberá poder:

- consultar su propia valoración;
- crearla si completó el curso;
- editarla según las reglas.

No deberá poder crear una valoración para:

- otra persona;
- un curso no completado.

---

# 51. RLS y `audit_logs`

`audit_logs` deberá considerarse información administrativa.

No deberá estar disponible para:

- visitantes;
- estudiantes.

La escritura deberá realizarse exclusivamente mediante mecanismos internos confiables.

Los registros son append-only y no deberán modificarse o eliminarse mediante operaciones normales.

---

# 52. `notification_outbox`

La cola de notificaciones contiene:

- correos;
- payloads;
- estado de procesamiento;
- errores.

No deberá exponerse a usuarios públicos ni estudiantes.

El acceso deberá quedar limitado a procesos internos y usuarios administrativos cuando sea necesario para diagnóstico.

---

# 53. `app_settings`

La tabla de configuración no deberá contener secretos.

El diseño físico ya establece esta regla.

Los valores públicos podrán consultarse según la necesidad.

Las configuraciones internas deberán restringirse.

---

# 54. Supabase Storage

La estrategia de seguridad deberá cubrir también archivos.

Los buckets deberán clasificarse al menos entre:

```text
Públicos
Privados
```

---

# 55. Banners públicos

Podrán tratarse como públicos:

- banners de actividades;
- imágenes promocionales de cursos;
- fotografías públicas de expositores;

cuando corresponda.

Estos recursos no contienen información privada.

---

# 56. Materiales de cursos

Los materiales deberán utilizar buckets privados o políticas equivalentes.

El alumno solamente deberá obtener acceso cuando:

```text
matrícula válida
+
curso correspondiente
```

---

# 57. Certificados

Los certificados deberán mantenerse privados.

El acceso podrá realizarse mediante:

- usuario autenticado dueño del certificado;
- token público específico;
- URL firmada temporal.

No deberá hacerse público el bucket completo de certificados.

---

# 58. Firmas

Los archivos de firmas institucionales deberán protegerse de forma adecuada.

Aunque aparezcan dentro de certificados generados, el archivo original no deberá quedar necesariamente expuesto como recurso público editable o navegable.

---

# 59. URLs firmadas

Cuando se utilicen recursos privados, podrá utilizarse:

**Signed URL**

con tiempo limitado.

No deberán generarse URLs de larga duración sin necesidad.

---

# 60. `service_role`

La clave:

`service_role`

deberá permanecer exclusivamente en servidor.

Nunca deberá:

- utilizar prefijo `NEXT_PUBLIC_`;
- enviarse a componentes cliente;
- aparecer en HTML;
- almacenarse en el repositorio;
- imprimirse en logs.

---

# 61. Variables públicas

Solo las claves expresamente diseñadas para frontend deberán utilizarse como variables públicas.

La arquitectura deberá diferenciar claramente:

```text
Frontend-safe
```

de:

```text
Server-only
```

---

# 62. Route Handlers

Los Route Handlers utilizados en hitos anteriores deberán revisarse.

Especialmente los relacionados con:

- generación de PDF;
- proveedor de correo;
- claves externas;
- procesamiento privilegiado.

Cada endpoint deberá validar:

- autenticación;
- autorización;
- inputs;
- ownership cuando corresponda.

---

# 63. No confiar en el cliente

Un Route Handler no deberá asumir que un usuario es administrador simplemente porque el frontend llamó al endpoint desde una página `/admin`.

Deberá comprobar la sesión y el rol.

---

# 64. RPC `SECURITY DEFINER`

Las funciones PostgreSQL que utilicen:

`SECURITY DEFINER`

deberán revisarse especialmente.

Una función con privilegios elevados deberá:

- validar identidad;
- validar inputs;
- limitar search_path;
- evitar SQL dinámico inseguro;
- exponer únicamente operaciones necesarias.

No deberá convertirse en un mecanismo para evadir todas las políticas RLS.

---

# 65. RPC públicas

Revisar al menos:

```text
register_activity()
enroll_free_course()
update_lesson_progress()
submit_quiz_attempt()
check_course_completion()
```

y cualquier RPC administrativa agregada.

Cada función deberá disponer de permisos de ejecución adecuados.

---

# 66. Revocar permisos innecesarios

Cuando corresponda, deberá revisarse el acceso de roles PostgreSQL/Supabase a funciones y tablas.

No deberá asumirse que activar RLS automáticamente corrige todos los permisos.

---

# 67. Validación de inputs

Las operaciones críticas deberán continuar utilizando:

- constraints;
- funciones PostgreSQL;
- schemas;
- validación de servidor.

RLS controla **quién** puede acceder.

No sustituye reglas como:

- precios válidos;
- cupos;
- nota;
- progreso;
- unicidad.

---

# 68. Protección de datos personales

Deberá revisarse qué datos son realmente necesarios en cada consulta.

No deberá exponerse indiscriminadamente:

- DNI;
- CE;
- celular;
- dirección;
- RUC;
- correo;

en páginas públicas.

---

# 69. Minimización de datos

Las consultas deberán devolver solamente la información necesaria para la pantalla.

Ejemplo:

Una tarjeta pública de actividad no necesita recibir datos de participantes.

Una tarjeta de curso no necesita recibir matrículas.

---

# 70. Logs

Los logs no deberán almacenar:

- contraseñas;
- tokens de recuperación;
- `service_role`;
- datos sensibles completos sin necesidad;
- respuestas de autenticación sensibles.

---

# 71. Mensajes de error

Los usuarios no deberán recibir directamente:

- errores SQL;
- stack traces;
- paths internos;
- secretos;
- información que facilite enumeración indebida.

---

# 72. Seguridad de tokens de certificados

Los tokens deberán seguir siendo suficientemente aleatorios.

No deberán basarse en:

- ID incremental;
- DNI;
- código predecible.

Los tokens revocados o inválidos no deberán permitir acceso.

---

# 73. Soft delete y seguridad

Las políticas deberán considerar:

```text
deleted_at IS NULL
```

en los flujos normales.

Un registro eliminado lógicamente no deberá reaparecer accidentalmente mediante consultas directas.

---

# 74. Estados funcionales

RLS deberá tener en cuenta cuando corresponda estados como:

- published;
- active;
- completed;
- revoked;
- cancelled.

Por ejemplo:

una clase no publicada no debe estar disponible para el alumno solamente porque posee matrícula.

---

# 75. Pruebas negativas

Este hito deberá enfocarse especialmente en intentar hacer cosas que **no deberían permitirse**.

Ejemplos:

- Student leyendo otro `person_id`.
- Student leyendo otra matrícula.
- Student modificando progreso de otro alumno.
- Student creando certificado.
- Student modificando `is_correct`.
- Usuario anónimo leyendo participantes.
- Usuario anónimo accediendo a materiales privados.
- Usuario sin matrícula abriendo video.
- Student accediendo a `/admin`.
- Operator ejecutando acciones reservadas al administrador, si existe dicha distinción.

---

# 76. Requerimientos técnicos

## RT-01 — RLS obligatorio

Las tablas sensibles deberán tener RLS activado antes de producción.

---

## RT-02 — Políticas explícitas

No deberán utilizarse políticas excesivamente abiertas como:

```text
USING (true)
```

en tablas sensibles sin justificación.

---

## RT-03 — Identidad Auth

Las políticas autenticadas deberán basarse principalmente en:

`auth.uid()`.

---

## RT-04 — Vinculación institucional

La identidad del alumno deberá obtenerse mediante:

`user_accounts.person_id`.

---

## RT-05 — Roles

Los permisos administrativos deberán utilizar:

`user_accounts.role`.

---

## RT-06 — Cuenta activa

Una cuenta con:

`is_active = false`

no deberá mantener acceso normal.

---

## RT-07 — Público mínimo

Los visitantes únicamente deberán acceder a información expresamente pública.

---

## RT-08 — `people` protegido

No deberá existir lectura pública general de personas.

---

## RT-09 — Inscripción mediante RPC

El registro público a actividades deberá utilizar `register_activity()` y no INSERT público arbitrario.

---

## RT-10 — Campus por matrícula

El acceso a contenido deberá depender de una matrícula válida.

---

## RT-11 — Progreso propio

Un estudiante únicamente deberá acceder a su propio `lesson_progress`.

---

## RT-12 — Intentos propios

Un estudiante únicamente deberá consultar sus propios intentos.

---

## RT-13 — Respuestas correctas protegidas

`quiz_options.is_correct` no deberá estar disponible antes de enviar el intento.

---

## RT-14 — Certificados propios

El alumno autenticado deberá consultar únicamente certificados relacionados con su persona.

---

## RT-15 — Token público limitado

El acceso público por token deberá devolver únicamente el certificado solicitado.

---

## RT-16 — Storage privado

Materiales y certificados deberán quedar protegidos.

---

## RT-17 — Signed URLs

Cuando se utilicen, deberán ser temporales.

---

## RT-18 — `service_role`

Nunca deberá exponerse al frontend.

---

## RT-19 — Route Handlers

Todos los endpoints privilegiados deberán validar autorización.

---

## RT-20 — RPC revisadas

Todas las funciones críticas deberán pasar una revisión de permisos y seguridad.

---

## RT-21 — `SECURITY DEFINER`

Toda función que lo utilice deberá ser revisada específicamente.

---

## RT-22 — Constraints intactos

La implementación de RLS no deberá sustituir ni eliminar constraints existentes.

---

## RT-23 — Soft delete

Las políticas deberán excluir registros eliminados cuando corresponda.

---

## RT-24 — Storage policies

Los buckets privados deberán disponer de políticas específicas.

---

## RT-25 — TypeScript

La capa de aplicación deberá mantener correctamente tipados roles, sesión y estados de autorización.

---

## RT-26 — Server/client boundary

La aplicación deberá mantener clara separación entre operaciones cliente y servidor.

---

## RT-27 — Sin secretos en código

Los secretos deberán permanecer en variables de entorno seguras.

---

## RT-28 — Sin secretos en logs

No deberán registrarse claves o tokens sensibles.

---

## RT-29 — Auditoría

Las operaciones críticas administrativas deberán seguir siendo auditables.

---

## RT-30 — Migraciones

Las políticas RLS deberán versionarse mediante migraciones.

No deberán depender exclusivamente de configuración manual desde el Dashboard.

---

# 77. Requerimientos funcionales

## RF-01 — Portal público

Un visitante deberá continuar consultando actividades y cursos publicados.

---

## RF-02 — Inscripción sin cuenta

El visitante deberá continuar inscribiéndose a eventos/capacitaciones sin login.

---

## RF-03 — Sin exposición de participantes

Un visitante no deberá consultar listados de participantes.

---

## RF-04 — Perfil propio

Un estudiante solamente deberá consultar normalmente su propia información personal.

---

## RF-05 — Cursos propios

Un estudiante deberá consultar sus matrículas.

---

## RF-06 — Curso no matriculado

No deberá acceder al contenido privado de un curso ajeno.

---

## RF-07 — Materiales propios

Solo deberá acceder a materiales de cursos habilitados.

---

## RF-08 — Progreso propio

Solo deberá modificar su propio progreso.

---

## RF-09 — Quizzes propios

Solo deberá resolver evaluaciones de cursos a los que tenga acceso.

---

## RF-10 — Respuestas ocultas

No deberá conocer respuestas correctas antes del envío.

---

## RF-11 — Intentos propios

Solo deberá consultar sus resultados.

---

## RF-12 — Certificados propios

Un alumno deberá consultar sus certificados.

---

## RF-13 — Certificado público por token

Un participante sin cuenta deberá continuar accediendo mediante token válido.

---

## RF-14 — Administración restringida

Un visitante no deberá acceder al panel administrativo.

---

## RF-15 — Student sin administración

Un `student` no deberá utilizar operaciones administrativas.

---

## RF-16 — Operator

Un operador deberá acceder a las operaciones asignadas en la matriz definida.

---

## RF-17 — Administrator

Un administrador deberá poder realizar las tareas administrativas requeridas.

---

## RF-18 — Cuenta inactiva

Una cuenta inactiva deberá perder acceso a las áreas protegidas.

---

## RF-19 — Certificados privados

Los archivos de certificados no deberán quedar públicamente navegables.

---

## RF-20 — Materiales privados

Los materiales de cursos no deberán estar disponibles públicamente.

---

## RF-21 — Datos personales

La información privada no deberá aparecer en consultas públicas.

---

## RF-22 — Flujos existentes

La incorporación de RLS no deberá romper los recorridos funcionales válidos desarrollados en los Hitos 1–10.

---

# 78. Fuera del alcance del Hito 11

No forma parte obligatoria de este hito:

- pentesting profesional externo;
- certificación ISO 27001;
- WAF avanzado;
- SIEM empresarial;
- SOC;
- MFA obligatorio;
- SSO corporativo;
- OAuth empresarial;
- permisos granulares configurables;
- sistema ABAC;
- CAPTCHA avanzado;
- rate limiting distribuido complejo;
- escaneo automatizado de malware;
- DLP;
- cifrado personalizado de columnas;
- infraestructura multiregión.

Estas capacidades podrán incorporarse posteriormente si el nivel de riesgo o crecimiento de la plataforma lo requiere.

---

# 79. Definition of Done

El Hito 11 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Matriz de acceso

- [ ] Existe una matriz documentada de permisos.
- [ ] Define visitante.
- [ ] Define student.
- [ ] Define operator.
- [ ] Define administrator.
- [ ] Cada dominio tiene operaciones permitidas claramente definidas.

## RLS

- [ ] RLS está activado en las tablas sensibles.
- [ ] Las políticas están versionadas mediante migraciones.
- [ ] No existen tablas sensibles expuestas accidentalmente.
- [ ] Las políticas consideran `deleted_at`.
- [ ] Las políticas consideran estados funcionales cuando corresponde.

## Público

- [ ] Un visitante puede consultar eventos publicados.
- [ ] Puede consultar capacitaciones publicadas.
- [ ] Puede consultar cursos publicados.
- [ ] No puede consultar borradores.
- [ ] No puede consultar `people`.
- [ ] No puede consultar inscripciones.
- [ ] No puede consultar progreso.
- [ ] No puede consultar intentos de quiz.
- [ ] Puede ejecutar la inscripción pública por el mecanismo permitido.
- [ ] Puede consultar certificado únicamente mediante token válido.

## Identidad

- [ ] `auth.uid()` se relaciona correctamente con `user_accounts`.
- [ ] Se obtiene correctamente `person_id`.
- [ ] Se respeta `is_active`.
- [ ] Los roles se obtienen de forma segura.
- [ ] El estudiante no puede cambiar su rol.

## Student

- [ ] Solo consulta su propio perfil.
- [ ] Solo consulta sus matrículas.
- [ ] Solo accede a cursos habilitados.
- [ ] Solo accede a clases permitidas.
- [ ] Solo accede a materiales permitidos.
- [ ] Solo consulta/modifica su progreso.
- [ ] Solo realiza quizzes propios.
- [ ] Solo consulta sus intentos.
- [ ] Solo consulta sus certificados.
- [ ] Solo puede valorar cursos que completó.
- [ ] No accede a administración.

## Administración

- [ ] Operator es reconocido correctamente.
- [ ] Administrator es reconocido correctamente.
- [ ] Las operaciones administrativas verifican rol.
- [ ] Un Student no puede ejecutar mutations administrativas.
- [ ] Los Route Handlers administrativos validan autorización.
- [ ] Las RPC administrativas están protegidas.

## Actividades

- [ ] `activities` públicas respetan `published`.
- [ ] Borradores están protegidos.
- [ ] La modificación está restringida a usuarios internos.
- [ ] `activity_dates` respeta permisos.
- [ ] `activity_speakers` respeta permisos.

## Inscripciones

- [ ] No existe INSERT público indiscriminado.
- [ ] `register_activity()` continúa funcionando anónimamente.
- [ ] La RPC valida las reglas del negocio.
- [ ] El público no puede consultar todas las inscripciones.
- [ ] Solo roles internos pueden gestionar estados.
- [ ] Solo roles internos pueden registrar asistencia.

## Cursos

- [ ] El catálogo público sigue funcionando.
- [ ] Los borradores están protegidos.
- [ ] El contenido interno requiere matrícula.
- [ ] Un usuario sin matrícula no accede a clases.
- [ ] Un usuario sin matrícula no accede a materiales.
- [ ] Una matrícula revocada impide acceso normal.

## Progreso

- [ ] El Student solo consulta su progreso.
- [ ] Solo puede actualizar mediante el mecanismo permitido.
- [ ] No puede modificar `is_completed` arbitrariamente.
- [ ] No puede modificar progreso de otra persona.
- [ ] `update_lesson_progress()` valida usuario y matrícula.

## Quizzes

- [ ] Un alumno solo accede a quizzes de cursos habilitados.
- [ ] `is_correct` no es accesible antes del intento.
- [ ] No puede insertar notas manuales.
- [ ] `submit_quiz_attempt()` calcula la nota internamente.
- [ ] Solo puede consultar sus propios intentos.
- [ ] Los administradores pueden gestionar contenido según la matriz.

## Certificados

- [ ] Los certificados están protegidos.
- [ ] Un alumno consulta los suyos.
- [ ] El token público continúa funcionando.
- [ ] Un token inválido no devuelve información.
- [ ] Un certificado revocado no aparece como vigente.
- [ ] El bucket no es públicamente navegable.

## Storage

- [ ] Los banners públicos funcionan.
- [ ] Los materiales son privados.
- [ ] Los certificados son privados.
- [ ] Las políticas de Storage están implementadas.
- [ ] Se utilizan URLs firmadas cuando corresponde.
- [ ] Un usuario no matriculado no obtiene material privado.
- [ ] Un usuario ajeno no obtiene certificado privado.

## Secretos

- [ ] `service_role` no aparece en código cliente.
- [ ] No existe `NEXT_PUBLIC_SERVICE_ROLE`.
- [ ] Las API keys privadas están solo en servidor.
- [ ] No aparecen secretos en logs.
- [ ] No aparecen secretos en respuestas HTTP.

## RPC

- [ ] Se revisó `register_activity()`.
- [ ] Se revisó `enroll_free_course()`.
- [ ] Se revisó `update_lesson_progress()`.
- [ ] Se revisó `submit_quiz_attempt()`.
- [ ] Se revisó `check_course_completion()`.
- [ ] Se revisaron las RPC administrativas adicionales.
- [ ] Los permisos EXECUTE son apropiados.
- [ ] Las funciones con privilegios elevados están justificadas.

## Errores

- [ ] No se muestran errores SQL sensibles.
- [ ] No se muestran stack traces en producción.
- [ ] No se filtran datos internos mediante mensajes de error.
- [ ] Los accesos prohibidos reciben una respuesta consistente.

## Datos personales

- [ ] Las páginas públicas no exponen DNI.
- [ ] No exponen teléfonos innecesarios.
- [ ] No exponen correos privados innecesarios.
- [ ] No exponen direcciones.
- [ ] Las consultas aplican minimización de datos.

## Regresión

- [ ] El catálogo público sigue funcionando.
- [ ] La inscripción pública sigue funcionando.
- [ ] El login sigue funcionando.
- [ ] El Campus sigue funcionando.
- [ ] El progreso sigue funcionando.
- [ ] Los quizzes siguen funcionando.
- [ ] Los certificados siguen funcionando.
- [ ] Las valoraciones siguen funcionando.
- [ ] La administración autorizada sigue funcionando.

---

# 80. Pruebas funcionales y de seguridad obligatorias

## Caso 1 — Visitante consulta contenido público

```text
1. Usuario sin sesión.
2. Abre /eventos.
3. Consulta actividad publicada.
4. Abre /cursos.
5. Consulta curso publicado.
6. Todo funciona correctamente.
```

---

## Caso 2 — Visitante intenta consultar personas

```text
1. Usuario anónimo.
2. Intenta consultar people directamente.
3. RLS rechaza la operación.
4. No recibe listado de personas.
```

---

## Caso 3 — Inscripción pública

```text
1. Usuario sin login.
2. Abre evento.
3. Se inscribe.
4. register_activity() funciona.
5. No requiere INSERT directo.
6. Inscripción se crea correctamente.
```

---

## Caso 4 — Student intenta acceder a otra persona

```text
1. Student A inicia sesión.
2. Conoce person_id de Student B.
3. Intenta consultar people de B.
4. RLS rechaza.
5. Solo puede consultar su propia ficha.
```

---

## Caso 5 — Curso de otro alumno

```text
1. Student A está matriculado en Curso A.
2. No está matriculado en Curso B.
3. Intenta consultar clases privadas de Curso B.
4. RLS/política rechaza acceso.
```

---

## Caso 6 — Material privado

```text
1. Student A no tiene Curso B.
2. Obtiene o adivina storage_path.
3. Intenta descargar material.
4. Storage rechaza.
5. No se genera URL firmada válida.
```

---

## Caso 7 — Manipular progreso

```text
1. Student abre herramientas del navegador.
2. Intenta modificar lesson_progress directamente.
3. Intenta establecer is_completed = true.
4. Operación directa es rechazada o limitada.
5. update_lesson_progress() sigue siendo el mecanismo válido.
```

---

## Caso 8 — Progreso de otro alumno

```text
1. Student A conoce enrollment_id de Student B.
2. Ejecuta update_lesson_progress().
3. RPC valida ownership.
4. Operación es rechazada.
```

---

## Caso 9 — Respuestas correctas

```text
1. Student abre quiz.
2. Inspecciona respuesta Supabase.
3. is_correct no está disponible.
4. Intenta consultar quiz_options directamente.
5. No obtiene las respuestas correctas.
```

---

## Caso 10 — Crear nota falsa

```text
1. Student intenta insertar quiz_attempt manualmente.
2. Envía score_percent = 100.
3. Operación directa es rechazada.
4. submit_quiz_attempt() continúa siendo la vía válida.
```

---

## Caso 11 — Certificado ajeno

```text
1. Student A conoce certificate_id de Student B.
2. Intenta consultarlo.
3. RLS rechaza.
4. No obtiene archivo.
```

---

## Caso 12 — Token válido

```text
1. Usuario sin sesión tiene access_token válido.
2. Abre /certificados/[token].
3. Obtiene únicamente el certificado correspondiente.
4. Puede descargarlo según las reglas.
```

---

## Caso 13 — Token inválido

```text
1. Utilizar token aleatorio.
2. No obtener certificado.
3. No revelar si existen IDs cercanos.
```

---

## Caso 14 — Student intenta administración

```text
1. Student inicia sesión.
2. Abre /admin.
3. Next.js impide acceso.
4. Intenta mutation administrativa directamente.
5. PostgreSQL/RLS también rechaza.
```

---

## Caso 15 — Cuenta inactiva

```text
1. Usuario tiene user_accounts.is_active = false.
2. Intenta acceder al Campus.
3. Acceso rechazado.
4. Intenta query directa.
5. Las políticas correspondientes también impiden acceso normal.
```

---

## Caso 16 — `service_role`

```text
1. Revisar bundle del navegador.
2. Revisar HTML.
3. Revisar variables públicas.
4. Revisar network.
5. Confirmar que service_role nunca aparece.
```

---

# 81. Validación final del hito

Antes de aprobar el Hito 11, el equipo deberá demostrar que los flujos válidos continúan funcionando y que los inválidos son bloqueados.

Como mínimo:

```text
1. Visitante consulta portal público.
2. Visitante realiza inscripción.
3. Visitante no puede consultar participantes.
4. Student inicia sesión.
5. Student consulta su perfil.
6. Student accede a sus cursos.
7. Student no accede a curso ajeno.
8. Student registra su progreso.
9. Student no modifica progreso ajeno.
10. Student resuelve quiz.
11. Student no obtiene respuestas previamente.
12. Student consulta sus certificados.
13. Student no consulta certificado ajeno.
14. Student no entra a administración.
15. Operator accede a operaciones permitidas.
16. Administrator accede a administración.
17. Materiales privados permanecen protegidos.
18. Certificados privados permanecen protegidos.
19. service_role no está expuesto.
20. Las RPC críticas fueron revisadas.
21. Los Route Handlers privilegiados verifican autorización.
22. Las políticas están versionadas mediante migraciones.
```

Las pruebas deberán realizarse usando sesiones reales de:

- usuario anónimo;
- student;
- operator;
- administrator.

No será suficiente probar únicamente desde una cuenta administrativa.

---

# 82. Resultado final esperado del Hito 11

Al finalizar este hito, el mismo producto construido durante los Hitos 1–10 deberá continuar funcionando, pero ahora bajo una capa de protección consistente.

La arquitectura final deberá comportarse conceptualmente así:

```text
                        INTERNET
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
         VISITANTE                    USUARIO
             │                           │
             │                     Supabase Auth
             │                           │
             └─────────────┬─────────────┘
                           ▼
                        NEXT.JS
                           │
                           ▼
                       supabase-js
                           │
                           ▼
                    ┌─────────────┐
                    │     RLS     │
                    └─────────────┘
                           │
           ┌───────────────┼────────────────┐
           │               │                │
           ▼               ▼                ▼
        PÚBLICO          STUDENT         ADMIN
           │               │                │
           ▼               ▼                ▼
     Actividades       Sus cursos       Gestión
     Cursos públicos   Su progreso      Participantes
     Inscripción RPC   Sus quizzes      Asistencia
     Certificado token Sus certificados Certificados
                       Valoraciones      Cursos
                           │
                           ▼
                        STORAGE
                     ┌─────┴──────┐
                     │            │
                  Público       Privado
                     │            │
                  Banners      Materiales
                               Certificados
```

La seguridad deberá existir tanto en la experiencia Next.js como en Supabase/PostgreSQL.

La plataforma no deberá depender de que un usuario “no sepa” cómo consultar Supabase directamente.

Cuando se cumpla el Definition of Done, los dos grandes recorridos funcionales deberán permanecer intactos, pero con permisos correctamente restringidos.

Una vez aprobado este hito, el proyecto podrá avanzar al último hito de implementación del MVP:

**Hito 12 — Pruebas Integrales, Estabilización y Despliegue a Producción.**