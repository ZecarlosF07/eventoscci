# HITO 10 — FINALIZACIÓN DE CURSOS, CERTIFICADOS Y VALORACIONES

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 10 tiene como finalidad completar el recorrido funcional del **Campus Virtual**, implementando la finalización automática de cursos, la emisión de certificados académicos y el sistema de valoraciones por parte de los alumnos.

Al finalizar el Hito 9, la plataforma ya deberá ser capaz de:

- registrar progreso de videos;
- marcar clases como completadas al alcanzar el 90 %;
- calcular progreso del curso;
- administrar quizzes;
- guardar intentos;
- calificar automáticamente;
- determinar aprobación con 80 %;
- conservar intentos ilimitados;
- comprobar si todas las condiciones académicas han sido cumplidas.

El Hito 10 utilizará toda esta información para determinar cuándo una matrícula puede pasar definitivamente de:

`active`

a:

`completed`

Una vez que el curso se encuentre completado, la plataforma deberá:

- registrar la fecha de finalización;
- establecer el progreso general en 100 %;
- generar automáticamente el certificado;
- relacionarlo con la matrícula;
- permitir que el alumno lo consulte desde el Campus;
- permitir su descarga;
- incorporar el certificado al historial institucional de la persona;
- permitir posteriormente una valoración del curso.

A diferencia de los certificados de eventos y capacitaciones, los certificados de cursos **no requerirán una habilitación manual del administrador**.

La regla será:

**Cumplimiento académico → Curso completado → Certificado automático.**



---

# 2. Objetivo del hito

Completar el ciclo académico del Campus Virtual, permitiendo que el sistema determine automáticamente cuándo un alumno ha terminado un curso y genere su certificado sin intervención administrativa.

Al finalizar este hito deberá funcionar el recorrido:

**Login → Curso → Clases → Progreso → Quizzes → Cumplimiento académico → Curso completado → Certificado → Valoración.**

El hito deberá cerrar el segundo gran recorrido funcional del MVP.

---

# 3. Alcance del hito

El Hito 10 comprende:

- finalización automática del curso;
- integración definitiva de `check_course_completion()`;
- actualización de `course_enrollments`;
- registro de `completed_at`;
- progreso final al 100 %;
- certificados automáticos de cursos;
- reutilización de la infraestructura de certificados del Hito 5;
- plantillas de certificados para cursos;
- acceso a certificados desde el Campus;
- sección “Mis certificados”;
- descarga del certificado;
- historial de cursos completados;
- tabla `course_ratings`;
- calificación de 1 a 5 estrellas;
- comentario opcional;
- edición posterior de valoración;
- restricción de valoración a alumnos que hayan completado el curso.

No comprende:

- RLS definitivo;
- auditoría completa de seguridad;
- despliegue productivo;
- pruebas finales de seguridad;
- optimización final de producción.

Estos puntos serán tratados en los Hitos 11 y 12.

---

# 4. Regla definitiva de finalización de curso

La finalización deberá basarse en dos posibles escenarios.

## Curso sin quizzes

```text
TODAS las clases obligatorias completadas
=
CURSO COMPLETADO
```

---

## Curso con quizzes

```text
TODAS las clases obligatorias completadas
+
TODOS los quizzes aplicables aprobados
=
CURSO COMPLETADO
```

No deberán considerarse para la finalización:

- materiales descargados;
- tiempo conectado al Campus;
- cantidad de veces que abrió una clase;
- clases opcionales;
- valoraciones.



---

# 5. Tareas del hito

## 5.1 Completar `check_course_completion()`

La función preparada en los Hitos 8 y 9 deberá consolidarse como la principal responsable de determinar la finalización académica.

La función deberá recibir o determinar una matrícula:

`course_enrollment`

y comprobar todas las condiciones correspondientes.

---

# 6. Validar matrícula

Antes de evaluar el curso deberá comprobarse que:

- la matrícula existe;
- no está eliminada;
- corresponde a una persona válida;
- corresponde a un curso válido;
- su estado permite la evaluación.

Una matrícula:

`revoked`

no deberá finalizarse automáticamente.

---

# 7. Obtener clases obligatorias

La función deberá localizar:

```text
course
↓
course_modules activos
↓
lessons activas
↓
is_required = true
```

Únicamente estas clases deberán utilizarse para determinar el cumplimiento obligatorio.

---

# 8. Validar progreso de clases

Para cada clase obligatoria deberá existir un progreso equivalente a:

```text
lesson_progress.is_completed = true
```

La regla de finalización de clase continúa siendo:

**90 % de visualización.**

No deberá recalcularse arbitrariamente una regla distinta en este hito.

---

# 9. Obtener quizzes aplicables

La función deberá localizar los quizzes correspondientes al curso mediante:

```text
course
↓
course_modules
↓
quizzes
```

considerando únicamente los registros aplicables según:

- publicación;
- soft delete;
- estructura vigente.

---

# 10. Validar quizzes aprobados

Por cada quiz aplicable deberá comprobarse que exista al menos un intento:

```text
quiz_attempts.is_passed = true
```

para la matrícula correspondiente.

No será necesario que:

- el último intento sea aprobado;
- todos los intentos sean aprobados.

La condición será:

**Existe al menos un intento aprobado por cada quiz requerido.**

---

# 11. Curso sin quizzes

Cuando el curso no tenga quizzes aplicables, la función no deberá fallar ni exigir evaluaciones inexistentes.

En ese caso:

```text
clases obligatorias completas
=
curso completado
```

---

# 12. Curso con clases opcionales

Cuando:

```text
lessons.is_required = false
```

la clase podrá quedar:

- sin iniciar;
- parcialmente vista;
- completada;

sin impedir la finalización del curso.

---

# 13. Marcar matrícula como completada

Cuando se cumplan todas las condiciones, actualizar:

```text
course_enrollments.status = completed
```

y registrar:

```text
completed_at
```

---

# 14. Progreso final

Al completarse el curso deberá establecerse:

```text
course_enrollments.progress_percent = 100
```

Esto representará la finalización académica del curso.

---

# 15. Idempotencia de finalización

La función deberá ser idempotente.

Si una matrícula ya se encuentra:

```text
status = completed
```

una nueva ejecución de `check_course_completion()` no deberá:

- modificar incorrectamente `completed_at`;
- generar otro certificado;
- crear notificaciones duplicadas;
- alterar el historial.

---

# 16. Momento de ejecución

La comprobación deberá ejecutarse cuando ocurran acciones que puedan completar el curso.

Principalmente:

```text
Clase llega al 90 %
```

o:

```text
Quiz obtiene aprobación
```

No deberá ejecutarse innecesariamente cada segundo.

---

# 17. Integración con `update_lesson_progress()`

Cuando una clase pase por primera vez a:

```text
is_completed = true
```

la lógica deberá ejecutar o desencadenar:

`check_course_completion()`

para comprobar si esa era la última condición pendiente.

---

# 18. Integración con `submit_quiz_attempt()`

Cuando un intento obtenga:

```text
is_passed = true
```

también deberá ejecutarse o desencadenarse:

`check_course_completion()`.

---

# 19. Reutilizar sistema de certificados

La infraestructura general de certificados creada en el Hito 5 deberá reutilizarse.

No deberá crearse una segunda tabla independiente como:

```text
course_certificates
```

La tabla central continuará siendo:

`certificates`.



---

# 20. Certificado de curso

Para un certificado académico:

```text
certificate_type = course
```

y deberá relacionarse mediante:

```text
course_enrollment_id
```

Mientras:

```text
registration_id = NULL
```

---

# 21. Origen único del certificado

El modelo deberá garantizar que un certificado tenga un único origen válido.

Para cursos:

```text
course_enrollment_id != NULL
registration_id = NULL
```

Para actividades:

```text
registration_id != NULL
course_enrollment_id = NULL
```

No deberán existir certificados ambiguos.

---

# 22. Plantillas de certificados de cursos

La tabla:

`certificate_templates`

deberá permitir plantillas con:

```text
scope = course
```

o la representación equivalente definida en el modelo.

El administrador deberá poder disponer de una plantilla institucional para cursos.

---

# 23. Firmantes

Los certificados de cursos deberán reutilizar:

`certificate_template_signers`

permitiendo mantener:

- nombre del firmante;
- cargo;
- firma;
- orden.

No deberá duplicarse la infraestructura del Hito 5.

---

# 24. Emisión automática

La principal diferencia con actividades será:

## Eventos y capacitaciones

```text
attendance
↓
selección administrativa
↓
certificado
```

## Cursos

```text
check_course_completion()
↓
completed
↓
certificado automático
```

No deberá requerirse una acción adicional del administrador para cada alumno.

---

# 25. Crear certificado una sola vez

Al completar el curso deberá comprobarse primero si ya existe un certificado correspondiente a:

`course_enrollment_id`.

Si existe, deberá reutilizarse.

No deberá generarse otro por:

- doble llamada;
- recarga;
- segundo dispositivo;
- nuevo acceso al curso;
- reejecución de `check_course_completion()`.

---

# 26. Código del certificado

Cada certificado de curso deberá recibir:

`certificate_code`

único.

Por ejemplo:

```text
CCI-CUR-2026-000321
```

El formato exacto podrá definirse durante implementación siempre que mantenga unicidad.

---

# 27. Token de acceso

El certificado deberá conservar también:

`access_token`

único.

Aunque el alumno pueda acceder desde el Campus, este token permitirá reutilizar la infraestructura pública de certificados cuando corresponda.

---

# 28. Snapshots del certificado

Deberán almacenarse los snapshots correspondientes.

Como mínimo:

```text
participant_name_snapshot
title_snapshot
condition_snapshot
date_text_snapshot
academic_hours_snapshot
```

Para un curso, la condición podrá utilizar un valor institucional equivalente a:

```text
Culminó
```

o:

```text
Aprobó
```

según la configuración correspondiente.

---

# 29. Nombre del participante

El certificado deberá obtener el nombre desde:

`people`

en el momento de emisión y conservarlo posteriormente mediante snapshot.

Un cambio futuro del perfil no deberá modificar retroactivamente el documento emitido.

---

# 30. Nombre del curso

Deberá conservarse:

`title_snapshot`

para que una modificación posterior del título del curso no cambie el certificado histórico.

---

# 31. Fecha del certificado

La fecha deberá corresponder al contexto de finalización/emisión definido.

Deberá conservarse en:

`date_text_snapshot`

cuando corresponda.

---

# 32. Horas académicas

Cuando el curso tenga:

`academic_hours`

el certificado deberá poder incluirlas.

El valor deberá conservarse mediante:

`academic_hours_snapshot`.

---

# 33. Generación documental

La generación deberá reutilizar el mecanismo desarrollado en el Hito 5.

La tecnología específica de PDF deberá ser la misma o compatible con la infraestructura ya implementada.

No deberá desarrollarse un segundo motor innecesario.

---

# 34. Almacenamiento

El archivo deberá guardarse en el almacenamiento de certificados definido previamente.

Persistir:

`file_path`

en la tabla `certificates`.

---

# 35. Estado inicial

El certificado automático deberá crearse con:

```text
status = issued
```

y:

```text
issued_at
```

La identificación de `issued_by` podrá adaptarse al contexto automático definido en el diseño físico.

La implementación deberá distinguir claramente que no fue emitido por una aprobación administrativa individual.

---

# 36. Revocación

Los certificados de cursos deberán continuar permitiendo revocación administrativa mediante la infraestructura del Hito 5.

Registrar:

```text
status = revoked
revoked_at
revoked_by
revocation_reason
```

---

# 37. Curso completado y certificado revocado

Revocar el certificado **no deberá descompletar el curso**.

Son estados distintos:

```text
course_enrollment.status = completed
```

puede coexistir con:

```text
certificate.status = revoked
```

---

# 38. Crear sección “Mis certificados”

Crear:

`/campus/certificados`

Esta sección deberá mostrar los certificados correspondientes a la persona autenticada.

Principalmente:

- certificados de cursos;
- y, si la experiencia del producto lo considera coherente, podrán visualizarse también certificados de actividades vinculados a la misma `person_id`.

La implementación deberá respetar la identidad central de `people`.

---

# 39. Tarjeta de certificado

Cada certificado podrá mostrar:

- curso/actividad;
- tipo;
- fecha;
- código;
- estado;
- acción de ver;
- acción de descargar.

---

# 40. Acceso al certificado

Desde el Campus deberá poder consultarse el certificado directamente.

Además podrá reutilizarse:

`/certificados/[token]`

cuando corresponda.

No será necesario crear un segundo mecanismo de descarga completamente distinto.

---

# 41. Certificado revocado en Campus

Cuando un certificado esté:

`revoked`

deberá aparecer claramente como revocado o dejar de estar disponible para descarga vigente según la experiencia definida.

No deberá presentarse como válido.

---

# 42. Historial de cursos

La sección del Campus deberá permitir distinguir:

- cursos activos;
- cursos completados.

Podrá crearse una vista o filtro equivalente a:

```text
Mis cursos
├── En progreso
└── Completados
```

---

# 43. Curso completado

Un curso con:

```text
course_enrollments.status = completed
```

deberá continuar siendo accesible para consulta mientras el acceso no haya sido revocado.

Completar un curso no significa necesariamente perder acceso al contenido.

El MVP no contempla vencimiento automático.

---

# 44. Visualización de progreso completado

Un curso finalizado deberá mostrar:

```text
100 %
```

y un estado visual equivalente a:

**Completado.**

---

# 45. Crear tabla `course_ratings`

## Objetivo

Permitir que un alumno valore un curso después de completarlo.

La relación será:

```text
PEOPLE
   │
   ▼
COURSE_RATINGS
   │
   ▼
COURSES
```

La estructura deberá seguir el modelo físico corregido.

---

# 46. Campos de `course_ratings`

Implementar los campos definidos en el diccionario, incluyendo como mínimo:

```text
id
course_id
person_id
rating
comment
created_at
updated_at
deleted_at
deleted_by
```

---

# 47. Valor de puntuación

`rating`

deberá permitir:

```text
1
2
3
4
5
```

representando una calificación de una a cinco estrellas.

La base de datos deberá impedir valores fuera de ese rango.

---

# 48. Comentario

`comment`

será opcional.

El alumno podrá:

- seleccionar estrellas;
- escribir comentario;
- guardar valoración.

---

# 49. Una valoración activa por persona y curso

Una persona deberá tener como máximo:

**una valoración activa por curso.**

La base de datos deberá utilizar la restricción parcial correspondiente considerando soft delete.



---

# 50. Requisito de curso completado

Solamente podrá valorar un curso quien tenga una matrícula:

```text
status = completed
```

para ese curso.

La validación no deberá existir únicamente en la interfaz.

---

# 51. Usuario sin matrícula

Una persona que nunca haya tenido acceso al curso no deberá poder valorarlo.

---

# 52. Matrícula activa sin completar

Cuando:

```text
status = active
```

el estudiante todavía no deberá poder enviar valoración.

---

# 53. Matrícula revocada antes de completar

Una matrícula:

```text
status = revoked
```

sin haber cumplido el curso no deberá habilitar valoración.

---

# 54. Editar valoración

La definición funcional permite que el alumno pueda modificar posteriormente su valoración.

Por tanto deberá poder:

- cambiar estrellas;
- editar comentario.

No deberá crear una segunda valoración activa.

---

# 55. Eliminar valoración

Si la interfaz permite retirar una valoración, deberá utilizarse soft delete según la convención del proyecto.

No deberá destruirse físicamente de forma normal.

---

# 56. Interfaz de valoración

Después de completar el curso podrá mostrarse una sección equivalente a:

```text
¿Cómo calificarías este curso?

☆ ☆ ☆ ☆ ☆

Comentario (opcional)
```

---

# 57. Valoración no condiciona certificado

El certificado deberá generarse al completar académicamente el curso.

No deberá exigirse valorar para:

- completar el curso;
- obtener certificado;
- descargar certificado.

La valoración será posterior y opcional.

---

# 58. Promedio público

Los documentos del proyecto definen las valoraciones de curso, pero no obligan a implementar en este hito una visualización pública agregada de:

- promedio;
- número total de opiniones;
- ranking.

Por tanto, podrá quedar fuera del alcance salvo que el equipo decida incorporarlo expresamente.

La funcionalidad obligatoria es registrar la valoración del alumno.

---

# 59. Notificación de curso completado

El diseño de notificaciones podrá ampliarse para registrar el evento correspondiente al certificado de curso si está contemplado por la implementación de `notification_outbox`.

El documento físico establece la infraestructura de outbox, pero el listado funcional previo se concentra principalmente en los eventos transaccionales definidos.

Si se incorpora una notificación de certificado de curso, deberá reutilizar la arquitectura existente y no acoplar el proveedor de correo a `check_course_completion()`.

---

# 60. Separar finalización de envío de correo

La finalización del curso no deberá fallar porque el proveedor de correo esté indisponible.

El flujo deberá ser:

```text
Curso completado
↓
Matrícula completed
↓
Certificado emitido
↓
Evento de notificación
↓
Procesamiento externo
```

No:

```text
Correo falla
↓
Curso deja de estar completado
```

---

# 61. Auditoría

Las operaciones administrativas relacionadas con:

- revocación de certificado;
- cambios de plantilla;
- firmantes;

deberán mantener la estrategia de auditoría ya definida.

La finalización académica automática deberá poder ser trazable mediante los timestamps y entidades correspondientes.

---

# 62. Queries de finalización

Crear operaciones equivalentes a:

```text
getCourseCompletionStatus()
getCompletedCourses()
```

cuando sean necesarias para la interfaz.

La lógica definitiva de decisión deberá permanecer centralizada en PostgreSQL.

---

# 63. Queries de certificados

Crear/reutilizar:

```text
getMyCertificates()
getCourseCertificate()
getCertificateByToken()
```

No deberá duplicarse innecesariamente la lógica desarrollada en el Hito 5.

---

# 64. Queries de valoraciones

Crear operaciones equivalentes a:

```text
getMyCourseRating()
getCourseRatings()
```

según las pantallas implementadas.

---

# 65. Mutations de valoraciones

Crear operaciones equivalentes a:

```text
createCourseRating()
updateCourseRating()
deleteCourseRating()
```

Estas operaciones deberán validar la elegibilidad del usuario.

---

# 66. Mutation de certificado automático

La emisión podrá formar parte de:

`check_course_completion()`

o de una función específica invocada de forma segura por dicha operación.

La implementación deberá garantizar:

- atomicidad razonable;
- idempotencia;
- ausencia de certificados duplicados.

---

# 67. Estructura por features

Mantener la separación:

```text
src/features/
    course-enrollments/
    certificates/
    ratings/
```

La lógica de finalización podrá residir en el dominio de matrículas/progreso según la estructura ya establecida.

---

# 68. Atomic Design aplicado al Hito 10

## Atoms

Reutilizar:

- Button;
- Badge;
- Text;
- Heading;
- Spinner;
- iconos.

## Molecules

Crear componentes equivalentes a:

```text
CourseCompletionBadge
CertificateStatus
StarRating
CertificateDownloadAction
```

## Organisms

Crear:

```text
CompletedCourseCard
MyCertificatesList
CourseRatingForm
CourseCompletionSummary
```

## Templates

Podrán existir:

```text
CompletedCoursesTemplate
MyCertificatesTemplate
CourseCompletedTemplate
```

---

# 69. Pantalla de curso completado

Cuando un alumno termine el curso, la interfaz deberá reflejar claramente:

```text
Curso completado
100 %
```

y proporcionar:

**Ver certificado**

cuando el certificado esté disponible.

---

# 70. Estado de generación de certificado

Si la generación documental requiere algunos pasos internos, la interfaz deberá manejar adecuadamente estados como:

- generando;
- disponible;
- error de generación.

Sin embargo, la operación deberá diseñarse para que la finalización académica no se pierda ante un error documental temporal.

---

# 71. Recuperación ante error de PDF

Si:

```text
matrícula = completed
```

pero ocurre un fallo durante la generación del archivo:

- la matrícula deberá continuar completada;
- deberá poder reintentarse la generación;
- no deberá crearse un segundo certificado si el registro ya existe;
- deberá mantenerse trazabilidad del error.

La estrategia técnica exacta deberá adaptarse a la infraestructura utilizada para certificados.

---

# 72. Requerimientos técnicos

## RT-01 — `check_course_completion()`

Deberá existir en su versión definitiva.

---

## RT-02 — Clases obligatorias

Deberá comprobar todas las clases activas con:

`is_required = true`.

---

## RT-03 — Regla 90 %

La finalización de clase deberá continuar utilizando la regla ya implementada del 90 %.

---

## RT-04 — Quizzes

Cuando existan, todos deberán tener al menos un intento aprobado.

---

## RT-05 — Regla 80 %

La aprobación del quiz continuará siendo 80 % o más según el alcance definido.

---

## RT-06 — Curso sin quizzes

No deberá requerir quizzes inexistentes.

---

## RT-07 — Matrícula completada

El estado deberá cambiar a:

`completed`.

---

## RT-08 — Fecha de finalización

Deberá registrarse:

`completed_at`.

---

## RT-09 — Progreso final

Deberá establecerse:

`progress_percent = 100`.

---

## RT-10 — Idempotencia

Reevaluar un curso ya completado no deberá duplicar operaciones.

---

## RT-11 — Certificado central

Los certificados de cursos deberán utilizar:

`certificates`.

---

## RT-12 — Tipo

Deberá utilizarse:

`certificate_type = course`.

---

## RT-13 — Origen

El certificado deberá relacionarse con:

`course_enrollment_id`.

---

## RT-14 — Sin `registration_id`

En certificados de curso:

`registration_id = NULL`.

---

## RT-15 — Un certificado por matrícula

La lógica/base deberá impedir certificados equivalentes duplicados.

---

## RT-16 — Generación automática

La finalización deberá desencadenar la emisión sin aprobación administrativa individual.

---

## RT-17 — Snapshots

Deberán almacenarse los snapshots históricos definidos.

---

## RT-18 — Storage

El archivo deberá almacenarse fuera de PostgreSQL.

---

## RT-19 — Archivo privado

Deberá mantenerse el modelo privado de certificados definido previamente.

---

## RT-20 — Token

El certificado deberá conservar `access_token`.

---

## RT-21 — Código

`certificate_code` deberá ser único.

---

## RT-22 — Revocación

La revocación del certificado no deberá modificar la finalización del curso.

---

## RT-23 — `course_ratings`

Deberá existir la tabla según el modelo físico.

---

## RT-24 — Rating

Deberá estar limitado entre:

```text
1 y 5
```

---

## RT-25 — Valoración única

Deberá existir máximo una valoración activa por persona/curso.

---

## RT-26 — Curso completado

La creación o edición inicial de valoración deberá validar que el usuario haya completado el curso.

---

## RT-27 — Persona

Las valoraciones deberán relacionarse con:

`people.id`.

---

## RT-28 — Soft delete

Las valoraciones deberán respetar soft delete.

---

## RT-29 — TypeScript

Certificados, finalización y valoraciones deberán estar correctamente tipados.

---

## RT-30 — Atomic Design

Los nuevos componentes deberán seguir la arquitectura del proyecto.

---

## RT-31 — Supabase directo

Las operaciones simples podrán utilizar Supabase directamente.

---

## RT-32 — RPC

Las operaciones de finalización y generación de datos transaccionales deberán utilizar PostgreSQL/RPC cuando corresponda.

---

## RT-33 — Servidor para PDF

La generación del documento deberá ejecutarse en servidor cuando así lo requiera la librería, secretos o acceso privilegiado.

---

## RT-34 — No API CRUD innecesaria

No deberá crearse una segunda API general para certificados o valoraciones sin necesidad técnica.

---

## RT-35 — RLS futuro

La solución deberá quedar preparada para la implementación definitiva de RLS en el Hito 11.

---

# 73. Requerimientos funcionales

## RF-01 — Finalización automática

El alumno no deberá pulsar un botón para marcar el curso como terminado.

---

## RF-02 — Clases obligatorias

Todas deberán estar completadas.

---

## RF-03 — Clases opcionales

No deberán impedir la finalización.

---

## RF-04 — Curso sin quizzes

Podrá completarse únicamente mediante sus clases obligatorias.

---

## RF-05 — Curso con quizzes

Deberá requerir todos los quizzes aplicables aprobados.

---

## RF-06 — Aprobación histórica

Un quiz deberá considerarse aprobado si existe al menos un intento aprobado.

---

## RF-07 — Progreso completo

Al terminar el curso deberá mostrar 100 %.

---

## RF-08 — Estado completado

La matrícula deberá pasar a `completed`.

---

## RF-09 — Fecha

Deberá almacenarse cuándo se completó el curso.

---

## RF-10 — Certificado automático

El certificado deberá generarse automáticamente.

---

## RF-11 — Sin aprobación administrativa

No deberá requerirse una habilitación manual de certificado para cursos.

---

## RF-12 — Certificado único

Un alumno no deberá recibir varios certificados idénticos por completar una sola matrícula.

---

## RF-13 — Código

El certificado deberá disponer de código único.

---

## RF-14 — Descarga

El alumno deberá poder descargar su certificado.

---

## RF-15 — Mis certificados

El Campus deberá disponer de una sección para consultar certificados.

---

## RF-16 — Historial

El certificado deberá mantenerse relacionado con la persona.

---

## RF-17 — Curso completado visible

El alumno deberá poder identificar sus cursos terminados.

---

## RF-18 — Continuar consultando

Completar el curso no deberá eliminar automáticamente el acceso al contenido.

---

## RF-19 — Valoración

Un alumno que completó el curso deberá poder valorarlo.

---

## RF-20 — Estrellas

La valoración deberá ser de 1 a 5.

---

## RF-21 — Comentario

El comentario será opcional.

---

## RF-22 — Una valoración

Cada alumno deberá tener una valoración activa por curso.

---

## RF-23 — Edición

El alumno deberá poder modificar su valoración.

---

## RF-24 — Usuario sin completar

No deberá poder valorar.

---

## RF-25 — Valoración opcional

No será obligatorio valorar para obtener certificado.

---

## RF-26 — Revocación de certificado

Un certificado podrá ser revocado por administración.

---

## RF-27 — Curso sigue completado

La revocación del certificado no deberá cambiar el estado académico del curso.

---

# 74. Fuera del alcance del Hito 10

No forma parte de este hito:

- certificados con blockchain;
- verificación pública avanzada por código;
- ranking de estudiantes;
- gamificación;
- insignias;
- puntos;
- leaderboard;
- evaluación manual;
- tutorías;
- vencimiento automático del curso;
- revalidación obligatoria;
- renovación de certificados;
- emisión física;
- firma digital certificada;
- RLS completo;
- pruebas finales de penetración;
- despliegue productivo.

---

# 75. Definition of Done

El Hito 10 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Finalización académica

- [ ] `check_course_completion()` está completamente implementada.
- [ ] Comprueba matrícula válida.
- [ ] Comprueba clases obligatorias.
- [ ] Ignora clases opcionales para el requisito de finalización.
- [ ] Comprueba quizzes aplicables.
- [ ] Un curso sin quizzes no exige evaluaciones.
- [ ] Un curso con quizzes exige todos aprobados.
- [ ] La función reconoce intentos aprobados históricos.
- [ ] No depende del último intento únicamente.
- [ ] La operación es idempotente.

## Matrícula

- [ ] Una matrícula que cumple condiciones cambia a `completed`.
- [ ] Se registra `completed_at`.
- [ ] Se establece `progress_percent = 100`.
- [ ] Una matrícula revocada no se completa automáticamente.
- [ ] Volver a ejecutar la comprobación no cambia incorrectamente la fecha.
- [ ] Una matrícula completada conserva su historial.

## Integración con progreso

- [ ] Completar la última clase puede desencadenar comprobación.
- [ ] Aprobar el último quiz puede desencadenar comprobación.
- [ ] No se ejecuta innecesariamente por cada segundo de video.
- [ ] Una clase opcional pendiente no bloquea el curso.
- [ ] Un material pendiente no bloquea el curso.

## Certificados de curso

- [ ] Se reutiliza `certificates`.
- [ ] `certificate_type = course`.
- [ ] Existe `course_enrollment_id`.
- [ ] `registration_id` queda vacío.
- [ ] Se genera certificado automáticamente.
- [ ] No requiere selección administrativa.
- [ ] Existe código único.
- [ ] Existe token único.
- [ ] Se guardan snapshots.
- [ ] Se registra fecha de emisión.
- [ ] Se genera documento.
- [ ] Se guarda `file_path`.
- [ ] El documento puede abrirse.
- [ ] El documento puede descargarse.
- [ ] No se genera un certificado duplicado por reintentos.
- [ ] Se puede revocar administrativamente.
- [ ] Una revocación no cambia `course_enrollments.status`.

## Plantillas

- [ ] Existe al menos una plantilla válida para cursos.
- [ ] Se pueden reutilizar firmantes.
- [ ] El certificado utiliza fondo/configuración correspondiente.
- [ ] El certificado muestra nombre del alumno.
- [ ] Muestra nombre del curso.
- [ ] Muestra condición.
- [ ] Muestra fecha.
- [ ] Muestra horas académicas cuando corresponda.
- [ ] Muestra código.

## Campus

- [ ] “Mis cursos” distingue cursos completados.
- [ ] Los cursos completados muestran 100 %.
- [ ] Existe `/campus/certificados`.
- [ ] El alumno puede consultar sus certificados.
- [ ] Puede abrir un certificado.
- [ ] Puede descargarlo.
- [ ] Un certificado revocado no aparece como vigente.
- [ ] Completar un curso no bloquea automáticamente su contenido.

## Valoraciones

- [ ] Existe `course_ratings`.
- [ ] Se relaciona con `courses`.
- [ ] Se relaciona con `people`.
- [ ] `rating` acepta únicamente 1–5.
- [ ] `comment` es opcional.
- [ ] Existe máximo una valoración activa por persona/curso.
- [ ] Solo una persona con curso completado puede valorar.
- [ ] Una persona sin matrícula no puede valorar.
- [ ] Una matrícula activa sin completar no puede valorar.
- [ ] Se puede crear valoración.
- [ ] Se puede editar.
- [ ] No se crea otra valoración al editar.
- [ ] Soft delete funciona si se permite retirar valoración.
- [ ] La valoración no afecta certificado ni finalización.

## Arquitectura

- [ ] La lógica de finalización está centralizada.
- [ ] La generación de certificado es idempotente.
- [ ] Se reutiliza el sistema del Hito 5.
- [ ] No se creó una tabla paralela innecesaria para certificados de cursos.
- [ ] Queries y mutations están organizadas.
- [ ] Los componentes respetan Atomic Design.
- [ ] Los tipos Supabase están actualizados.
- [ ] Las operaciones críticas no dependen únicamente del frontend.
- [ ] La solución queda preparada para RLS.

---

# 76. Pruebas funcionales obligatorias

## Caso 1 — Curso sin quizzes

```text
1. Crear curso con 3 clases obligatorias.
2. No crear quizzes.
3. Completar Clase 1.
4. Completar Clase 2.
5. Curso continúa active.
6. Completar Clase 3.
7. Ejecutar check_course_completion().
8. status = completed.
9. progress_percent = 100.
10. completed_at registrado.
11. Generar certificado automático.
```

---

## Caso 2 — Curso con quiz pendiente

```text
1. Completar todas las clases.
2. Existe un quiz.
3. Quiz no está aprobado.
4. Ejecutar check_course_completion().
5. Curso continúa active.
6. No generar certificado.
```

---

## Caso 3 — Curso con todo aprobado

```text
1. Todas las clases obligatorias completas.
2. Todos los quizzes aprobados.
3. Ejecutar check_course_completion().
4. Curso cambia a completed.
5. Registrar completed_at.
6. Generar certificado.
7. Mostrar 100 %.
```

---

## Caso 4 — Clase opcional pendiente

```text
1. Curso tiene tres clases obligatorias.
2. Tiene una clase opcional.
3. Completar las tres obligatorias.
4. No abrir la opcional.
5. Cumplir quizzes cuando existan.
6. Curso puede completarse.
```

---

## Caso 5 — Aprobación histórica de quiz

```text
1. Intento 1 = 90 %.
2. Intento 2 = 40 %.
3. Consultar cumplimiento.
4. Quiz continúa considerado aprobado.
5. El curso puede completarse si cumple lo demás.
```

---

## Caso 6 — Doble ejecución

```text
1. Curso ya está completed.
2. Certificado ya existe.
3. Ejecutar nuevamente check_course_completion().
4. completed_at no cambia incorrectamente.
5. No crear otro certificado.
6. El certificado original permanece.
```

---

## Caso 7 — Mis certificados

```text
1. Completar curso.
2. Abrir /campus/certificados.
3. Aparece certificado.
4. Abrir certificado.
5. Descargar archivo.
6. Comprobar información.
```

---

## Caso 8 — Revocar certificado

```text
1. Curso está completed.
2. Certificado está issued.
3. Administrador revoca certificado.
4. status = revoked.
5. course_enrollment permanece completed.
6. Campus no muestra el certificado como vigente.
```

---

## Caso 9 — Valoración correcta

```text
1. Alumno completa curso.
2. Abrir sección de valoración.
3. Seleccionar 5 estrellas.
4. Escribir comentario.
5. Guardar.
6. Crear course_rating.
7. Relacionar con person_id y course_id.
```

---

## Caso 10 — Valoración antes de completar

```text
1. Alumno tiene matrícula active.
2. Curso al 60 %.
3. Intentar crear valoración.
4. La UI no debe habilitarla normalmente.
5. La lógica confiable debe rechazar la operación.
```

---

## Caso 11 — Editar valoración

```text
1. Alumno tiene valoración 4 estrellas.
2. Editar a 5 estrellas.
3. Modificar comentario.
4. Guardar.
5. Actualizar misma valoración.
6. No crear una segunda activa.
```

---

## Caso 12 — Usuario de otro curso

```text
1. Alumno completó Curso A.
2. Nunca completó Curso B.
3. Intentar valorar Curso B.
4. Operación rechazada.
5. Completar Curso B.
6. Ahora permitir valoración.
```

---

## Caso 13 — Fallo al generar PDF

```text
1. Alumno cumple todas las condiciones.
2. Matrícula pasa a completed.
3. Simular error al generar archivo.
4. Matrícula continúa completed.
5. Registrar/manejar fallo.
6. Reintentar generación.
7. No duplicar certificado.
8. Documento queda disponible posteriormente.
```

---

# 77. Validación final del hito

Antes de aprobar el Hito 10, el equipo deberá demostrar el recorrido completo del Campus:

```text
1. Crear un curso.
2. Crear módulos.
3. Crear clases.
4. Crear quiz.
5. Habilitar estudiante.
6. Iniciar sesión como estudiante.
7. Ver clases.
8. Registrar progreso.
9. Completar todas las clases obligatorias.
10. Resolver quiz.
11. Aprobarlo.
12. Ejecutar finalización.
13. Confirmar matrícula completed.
14. Confirmar progreso 100 %.
15. Generar certificado automático.
16. Consultar certificado en Campus.
17. Descargar certificado.
18. Consultar curso como completado.
19. Crear valoración.
20. Editar valoración.
21. Revocar certificado desde administración.
22. Confirmar que el curso sigue completado.
```

Todo el proceso deberá realizarse mediante los flujos normales de la aplicación, sin modificar manualmente:

- `course_enrollments`;
- `certificates`;
- `course_ratings`;

desde el Dashboard de Supabase para completar el recorrido.

---

# 78. Resultado final esperado del Hito 10

Al finalizar este hito deberá quedar terminado el segundo gran recorrido funcional del MVP:

```text
                    USUARIO
                       │
                       ▼
                     LOGIN
                       │
                       ▼
                   MIS CURSOS
                       │
                       ▼
                     CURSO
                       │
             ┌─────────┴──────────┐
             │                    │
             ▼                    ▼
           CLASES               QUIZZES
             │                    │
             ▼                    ▼
         >= 90 %              >= 80 %
             │                    │
             └─────────┬──────────┘
                       ▼
          check_course_completion()
                       │
                       ▼
                  COMPLETED
                       │
             progress = 100 %
                       │
                       ▼
              CERTIFICADO AUTO.
                       │
                       ▼
               MIS CERTIFICADOS
                       │
                       ▼
                    DESCARGA
                       │
                       ▼
                   VALORACIÓN
                    1–5 ★
```

Con este hito, la plataforma deberá poder gestionar completamente un curso desde su creación hasta su finalización académica y certificación.

Los dos recorridos principales del MVP quedarán funcionalmente completos:

### Eventos y capacitaciones

**Actividad → Publicación → Inscripción → Confirmación → Asistencia → Certificado**

### Cursos

**Registro/Login → Curso → Clases → Progreso → Quizzes → Finalización → Certificado → Valoración**

Una vez cumplido el Definition of Done, el producto deberá avanzar a la etapa transversal de preparación para producción:

**Hito 11 — Seguridad, RLS y Control de Acceso.**