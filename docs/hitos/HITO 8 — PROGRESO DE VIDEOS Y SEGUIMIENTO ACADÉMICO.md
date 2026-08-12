# HITO 8 — PROGRESO DE VIDEOS Y SEGUIMIENTO ACADÉMICO

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 8 tiene como finalidad implementar el **seguimiento automático del avance del estudiante dentro de los cursos grabados**.

Al finalizar el Hito 7, la plataforma ya deberá permitir:

- crear cursos;
- crear módulos;
- crear clases;
- asociar un video a cada clase;
- publicar contenido;
- habilitar alumnos;
- acceder al Campus;
- navegar entre módulos;
- reproducir los videos;
- consultar materiales generales del curso.

Sin embargo, hasta ese punto el sistema todavía no conoce cuánto contenido ha consumido realmente cada alumno.

El Hito 8 incorporará el seguimiento académico necesario para que la plataforma pueda:

- recordar hasta dónde llegó el alumno en un video;
- registrar los segundos visualizados;
- calcular el porcentaje alcanzado en una clase;
- marcar automáticamente una clase como completada;
- calcular el avance general del curso;
- mostrar visualmente el progreso;
- conservar el progreso entre diferentes sesiones;
- preparar la lógica necesaria para determinar posteriormente la finalización completa del curso.

La regla principal definida para el MVP es:

**Una clase se considera completada cuando el estudiante alcanza al menos el 90 % de visualización del video.**

El alumno **no marcará manualmente una clase como completada**. La plataforma deberá determinarlo automáticamente. 
---

# 2. Objetivo del hito

Implementar un sistema persistente y automático de seguimiento académico para las clases en video de los cursos.

Al finalizar este hito deberá funcionar el recorrido:

**Alumno abre clase → Reproduce video → Sistema registra avance → Alumno abandona la clase → Regresa posteriormente → Continúa desde su última posición → Al alcanzar 90 % → Clase completada → Progreso general actualizado.**

Este hito dejará además preparada la función:

`check_course_completion()`

que posteriormente será utilizada junto con los quizzes para determinar cuándo un curso puede considerarse completamente terminado.

---

# 3. Alcance del hito

El Hito 8 comprende:

- tabla `lesson_progress`;
- seguimiento individual por alumno y clase;
- registro de posición del video;
- registro de segundos visualizados;
- cálculo de porcentaje;
- regla automática del 90 %;
- fecha de finalización de clase;
- persistencia del progreso;
- actualización periódica;
- guardado al pausar o abandonar la clase;
- reanudación desde la última posición;
- progreso general del curso;
- visualización de clases completadas;
- actualización de `course_enrollments.progress_percent`;
- función PostgreSQL `update_lesson_progress()`;
- preparación de `check_course_completion()`.

No comprende todavía:

- quizzes;
- preguntas;
- intentos;
- nota mínima del 80 %;
- finalización definitiva del curso cuando existen quizzes;
- generación automática de certificado;
- valoraciones.

Estas funcionalidades serán implementadas en los Hitos 9 y 10.

---

# 4. Principio funcional del progreso

El progreso deberá pertenecer a una matrícula específica.

La estructura conceptual será:

```text
PERSON
   │
   ▼
COURSE_ENROLLMENT
   │
   ▼
LESSON_PROGRESS
   │
   ▼
LESSON
```

Por tanto, el progreso no deberá almacenarse directamente dentro de:

`lessons`

porque una misma clase puede ser consumida por muchos alumnos.

Tampoco deberá asociarse directamente solamente con:

`person_id`

porque el contexto académico correcto es la matrícula del curso.

La relación deberá utilizar:

`enrollment_id + lesson_id`.

---

# 5. Tareas del hito

## 5.1 Crear tabla `lesson_progress`

## Objetivo

Almacenar el progreso individual de cada alumno en cada clase.

Implementar los campos definidos en el diseño físico:

```text
id
enrollment_id
lesson_id
last_position_seconds
watched_seconds
progress_percent
is_completed
completed_at
created_at
updated_at
deleted_at
deleted_by
```

La tabla deberá relacionarse con:

- `course_enrollments`;
- `lessons`.



---

# 6. Una fila de progreso por clase y matrícula

Deberá existir como máximo un registro activo para:

```text
enrollment_id
+
lesson_id
```

Esto evita que el mismo alumno termine teniendo múltiples registros activos para la misma clase.

Deberá implementarse la restricción única parcial correspondiente considerando soft delete.

---

# 7. `last_position_seconds`

Este campo deberá almacenar aproximadamente la última posición conocida del reproductor.

Ejemplo:

```text
Video: 1 200 segundos
Última posición: 485 segundos
```

Cuando el alumno vuelva a abrir la clase, el reproductor podrá comenzar aproximadamente desde:

```text
485 segundos
```

El propósito es permitir que el alumno continúe desde donde dejó el contenido.

---

# 8. `watched_seconds`

El sistema deberá mantener la cantidad de segundos visualizados que correspondan según la estrategia técnica implementada.

Este valor será utilizado para determinar el avance de la clase.

No deberá confiarse únicamente en un porcentaje enviado libremente por el navegador.

La operación de actualización deberá validar la información recibida respecto de la duración de la clase.

---

# 9. `progress_percent`

Deberá representar el progreso de la clase.

Conceptualmente:

```text
watched_seconds
---------------- × 100
duration_seconds
```

El resultado deberá mantenerse dentro de valores válidos.

Como mínimo:

```text
0 <= progress_percent <= 100
```

El cálculo definitivo deberá formar parte de la lógica confiable y no depender exclusivamente del componente React.

---

# 10. `is_completed`

La plataforma deberá establecer automáticamente:

```text
is_completed = true
```

cuando:

```text
progress_percent >= 90
```

Esta es una regla funcional obligatoria para el MVP.

---

# 11. `completed_at`

La primera vez que la clase alcance el criterio de finalización deberá registrarse:

```text
completed_at
```

La fecha deberá representar el momento en el que la clase se consideró completada.

Una actualización posterior del reproductor no deberá perder arbitrariamente dicha información.

---

# 12. Clase obligatoria y clase opcional

La tabla `lessons` ya dispone de:

`is_required`

Para el cálculo de finalización del curso, las clases obligatorias serán las relevantes según las reglas del diseño.

En este hito deberá distinguirse correctamente entre:

```text
is_required = true
```

y:

```text
is_required = false
```

La lógica definitiva de finalización completa del curso se terminará de integrar en los siguientes hitos.

---

# 13. Crear función PostgreSQL `update_lesson_progress()`

La actualización del progreso deberá centralizarse mediante una función PostgreSQL equivalente a:

`update_lesson_progress()`.

El recorrido conceptual será:

```text
Reproductor
     │
     ▼
Mutation
     │
     ▼
supabase.rpc(
  "update_lesson_progress"
)
     │
     ▼
PostgreSQL
```

Esta función constituye la pieza técnica principal del Hito 8.

---

# 14. Responsabilidades de `update_lesson_progress()`

La función deberá realizar como mínimo las siguientes comprobaciones y operaciones.

## 14.1 Validar matrícula

Comprobar que:

- la matrícula existe;
- corresponde al alumno;
- pertenece al curso de la clase;
- se encuentra activa;
- no está eliminada.

---

## 14.2 Validar clase

Comprobar que:

- la clase existe;
- pertenece al curso correspondiente;
- no está eliminada;
- se encuentra disponible para el alumno según las condiciones del Campus.

---

## 14.3 Validar duración

La función deberá utilizar:

`lessons.duration_seconds`

para evitar cálculos incoherentes.

Cuando el progreso dependa de la duración, deberá comprobarse que exista un valor válido.

---

## 14.4 Crear progreso si no existe

En la primera reproducción:

```text
lesson_progress no existe
```

La función deberá crear el registro correspondiente.

---

## 14.5 Actualizar progreso si existe

Si ya existe:

```text
lesson_progress
```

deberá actualizar:

- última posición;
- segundos vistos;
- porcentaje;
- estado de finalización;

según la información válida recibida.

---

## 14.6 Detectar finalización

Si el resultado alcanza:

```text
>= 90 %
```

la función deberá:

```text
is_completed = true
```

y registrar:

`completed_at`

cuando corresponda.

---

# 15. Evitar confiar ciegamente en el navegador

El frontend no deberá poder enviar simplemente:

```text
progress_percent = 100
```

y conseguir que una clase quede completada sin validación.

La lógica confiable deberá calcular o comprobar el porcentaje utilizando la duración y los datos válidos disponibles.

Esto es especialmente importante porque el progreso posteriormente determinará:

- finalización del curso;
- certificado automático.

---

# 16. Persistencia periódica

El reproductor deberá actualizar el progreso periódicamente.

Sin embargo, **no deberá realizar una escritura a Supabase por cada segundo de reproducción**.

La aplicación deberá utilizar una estrategia razonable de persistencia periódica.

El intervalo exacto podrá definirse durante la implementación del reproductor.

El objetivo será equilibrar:

- precisión;
- experiencia del usuario;
- cantidad de operaciones;
- rendimiento.

Esta decisión concreta de frecuencia es técnica y no está fijada en el análisis funcional.

---

# 17. Guardado al pausar

Cuando el alumno pause el video, deberá intentarse persistir el progreso más reciente.

Conceptualmente:

```text
PLAY
↓
avance
↓
PAUSE
↓
guardar progreso
```

Esto reducirá la pérdida de avance entre sesiones.

---

# 18. Guardado al cambiar de clase

Si el alumno navega desde:

```text
Clase 1.1
```

hacia:

```text
Clase 1.2
```

deberá persistirse el avance disponible de la clase anterior antes o durante el cambio, según la estrategia implementada.

---

# 19. Guardado al abandonar la página

Cuando sea técnicamente posible, la aplicación deberá intentar conservar el progreso reciente al abandonar la clase.

No deberá depender exclusivamente de este evento, porque el navegador podría cerrarse inesperadamente.

Por ello también será necesaria la persistencia periódica.

---

# 20. Reanudación del video

Al abrir una clase con progreso existente:

```text
last_position_seconds > 0
```

el reproductor deberá poder iniciar aproximadamente desde dicha posición.

El alumno no deberá comenzar obligatoriamente desde cero cada vez que abre el contenido.

---

# 21. Clase ya completada

Cuando:

```text
is_completed = true
```

el alumno deberá poder volver a reproducir la clase.

Una clase completada no deberá bloquearse.

Revisar nuevamente el video tampoco deberá borrar su estado de finalización.

---

# 22. Retroceder el reproductor

Si una clase ya se encuentra completada y el alumno vuelve a una posición anterior:

```text
100 %
↓
20 %
```

el sistema no deberá considerar automáticamente que la clase volvió a estar incompleta.

La finalización alcanzada deberá preservarse.

---

# 23. Evitar regresión injustificada del progreso

El progreso académico alcanzado no deberá disminuir arbitrariamente debido a una nueva posición del reproductor.

Por ejemplo:

```text
progress_percent = 75
```

y el estudiante vuelve a reproducir desde:

```text
20 %
```

La última posición podrá ser menor, pero el **avance máximo reconocido** no deberá perderse.

La implementación deberá diferenciar adecuadamente:

- posición actual/reanudación;
- progreso académico alcanzado.

---

# 24. Progreso inicial

Cuando un alumno nunca ha abierto una clase:

```text
lesson_progress inexistente
```

la interfaz deberá representar:

```text
0 %
```

sin necesidad de crear previamente una fila vacía para todas las clases.

El registro podrá crearse cuando exista interacción real.

---

# 25. Mostrar progreso por clase

La interfaz del curso deberá mostrar visualmente el estado correspondiente.

Ejemplos:

```text
Clase 1.1 — 100 % — Completada
Clase 1.2 — 63 %
Clase 1.3 — 0 %
```

La visualización podrá utilizar:

- porcentaje;
- barra;
- icono;
- distintivo de completada.

---

# 26. Mostrar progreso en navegación

La estructura de módulos deberá permitir al estudiante identificar:

- clases completadas;
- clases iniciadas;
- clases todavía no iniciadas.

Esto deberá ayudar al alumno a conocer dónde continuar.

---

# 27. Progreso general del curso

`course_enrollments` ya contempla:

`progress_percent`

Este campo deberá comenzar a actualizarse en este hito.

El porcentaje general deberá representar el avance académico de las clases correspondientes del curso.

La lógica deberá utilizar las clases obligatorias según el diseño definido.

---

# 28. Cálculo general

La implementación deberá determinar el progreso a partir del estado de las clases obligatorias.

La fórmula exacta de visualización podrá ser definida técnicamente, siempre respetando que la finalización depende del cumplimiento de las clases obligatorias.

No deberán utilizarse:

- materiales;
- cantidad de descargas;
- tiempo conectado al Campus;

como indicadores de progreso académico.

---

# 29. Materiales no afectan progreso

Debe mantenerse expresamente:

```text
Abrir PDF
≠
Avanzar curso
```

```text
Descargar material
≠
Completar clase
```

Los materiales continuarán siendo recursos complementarios.

---

# 30. Mostrar progreso en “Mis cursos”

La página:

`/campus/cursos`

deberá comenzar a mostrar el avance de cada matrícula.

Ejemplo:

```text
Marketing Digital
65 % completado
```

---

# 31. Mostrar progreso dentro del curso

La página:

`/campus/cursos/[courseId]`

deberá mostrar:

- porcentaje general;
- clases completadas;
- clases pendientes;
- estructura visual del avance.

---

# 32. Actualizar `course_enrollments.progress_percent`

Después de cambios relevantes de progreso, la plataforma deberá actualizar el progreso general almacenado en:

`course_enrollments.progress_percent`

La lógica deberá mantenerse centralizada para evitar que diferentes componentes calculen resultados inconsistentes.

---

# 33. Crear `check_course_completion()`

El diseño físico recomienda una función PostgreSQL equivalente a:

`check_course_completion()`.

En este hito deberá quedar creada o preparada para comenzar a evaluar las clases obligatorias.

La lógica completa será ampliada en el Hito 9, cuando existan quizzes.

---

# 34. Responsabilidad inicial de `check_course_completion()`

En esta etapa deberá poder comprobar como mínimo:

- matrícula;
- clases obligatorias;
- estado `is_completed` de cada una.

Sin embargo, no deberá marcar definitivamente como finalizado un curso que posteriormente requiera quizzes si todavía no existe la lógica de evaluación necesaria.

La finalización integral se cerrará en los siguientes hitos.

---

# 35. Curso sin quizzes

La regla funcional definitiva establece que, cuando un curso no tenga quizzes, las clases obligatorias serán suficientes para su finalización.

La automatización completa de este resultado se consolidará junto con la lógica de finalización del Campus.

En este hito deberá dejarse preparada esta condición sin generar certificados todavía.

---

# 36. Curso con quizzes futuros

Cuando un curso tenga evaluaciones, completar todas las clases no será suficiente.

El flujo final será:

```text
Clases obligatorias completadas
+
Quizzes aprobados
=
Curso completado
```

Los quizzes serán desarrollados en el Hito 9.

---

# 37. No marcar manualmente completado

No deberá existir un botón equivalente a:

```text
☑ Marcar clase como completada
```

para el estudiante.

La finalización de la clase deberá ser determinada automáticamente mediante la visualización del video.

---

# 38. Navegación libre continúa vigente

La implementación de progreso no deberá introducir bloqueo secuencial.

Aunque:

```text
Clase 1.1 = 0 %
```

el alumno podrá entrar a:

```text
Clase 1.3
```

si está publicada y tiene acceso al curso.

El progreso será informativo y académico, no un mecanismo de desbloqueo.

---

# 39. Progreso por matrícula

Si una persona tuviera históricamente otra matrícula o contexto futuro distinto, el progreso deberá permanecer relacionado con la matrícula correspondiente.

No deberá almacenarse de forma global únicamente por:

`person_id + lesson_id`.

---

# 40. Validación de pertenencia

Una solicitud de actualización deberá verificar:

```text
lesson
↓
module
↓
course
↓
course_enrollment
```

La plataforma no deberá permitir actualizar progreso de una clase perteneciente a un curso distinto.

---

# 41. Curso revocado

Cuando:

```text
course_enrollment.status = revoked
```

el alumno no deberá poder continuar registrando progreso normalmente.

La función confiable deberá comprobar el estado de la matrícula.

---

# 42. Contenido no publicado

Una clase no publicada no deberá aceptar progreso normal del alumno dentro del flujo estándar.

La validación deberá respetar la disponibilidad de contenido.

---

# 43. Soft delete

Los registros con:

```text
deleted_at IS NOT NULL
```

deberán quedar excluidos de los cálculos normales.

Esto aplica a:

- matrículas;
- módulos;
- clases;
- progreso;

según corresponda.

---

# 44. Manejo de múltiples dispositivos

El progreso se almacena centralmente en Supabase.

Por tanto, si el alumno utiliza posteriormente otro navegador o dispositivo con la misma cuenta:

- deberá consultar el progreso persistido;
- deberá poder continuar a partir del último estado almacenado.

No deberá depender únicamente de `localStorage`.

---

# 45. Estado local del reproductor

Podrá utilizarse estado local para mejorar la experiencia de reproducción.

Sin embargo, el progreso académico definitivo deberá persistirse en PostgreSQL.

`localStorage` no deberá utilizarse como única fuente del progreso.

---

# 46. Manejo de errores de guardado

Si ocurre una falla temporal al guardar progreso:

- el video no deberá necesariamente detenerse;
- la interfaz podrá conservar temporalmente el estado;
- deberá volver a intentarse en un momento apropiado según la estrategia implementada;
- deberá mostrarse un error solo cuando sea relevante para el usuario.

No deberán mostrarse errores SQL directamente.

---

# 47. Evitar exceso de escrituras

La implementación deberá evitar patrones como:

```text
timeupdate
↓
INSERT/UPDATE cada segundo
```

porque producirían operaciones innecesarias.

Se deberá implementar un mecanismo de throttling, debounce, intervalo o estrategia equivalente.

La técnica específica queda a criterio del equipo.

---

# 48. Reproductor desacoplado

El componente visual del reproductor no deberá contener toda la lógica de acceso a base de datos.

La estructura recomendada será conceptualmente:

```text
LessonPlayer
     │
     ▼
useLessonProgress()
     │
     ▼
updateLessonProgress()
     │
     ▼
RPC
```

Los nombres pueden variar.

---

# 49. Queries del dominio de progreso

Crear operaciones equivalentes a:

```text
getLessonProgress()
getCourseProgress()
getCourseLessonProgress()
```

Las consultas deberán utilizar la matrícula del alumno autenticado.

---

# 50. Mutation principal

Crear una operación TypeScript equivalente a:

`updateLessonProgress()`

Internamente deberá ejecutar:

```text
supabase.rpc(
  "update_lesson_progress",
  ...
)
```

---

# 51. Hook de progreso

Podrá crearse un hook equivalente a:

`useLessonProgress()`

responsable de coordinar:

- datos iniciales;
- posición;
- persistencia periódica;
- pausa;
- finalización;
- estados de guardado.

El nombre y estructura exactos pueden variar.

---

# 52. Estructura por features

Mantener separación mediante:

```text
src/features/progress/
```

o el dominio correspondiente definido en la estructura del proyecto.

Ejemplo:

```text
progress/
    hooks/
    queries/
    mutations/
    types/
    utils/
```

Los elementos visuales podrán permanecer en los features de cursos/lecciones cuando sea más coherente.

---

# 53. Atomic Design aplicado al Hito 8

## Atoms

Reutilizar:

- Text;
- Badge;
- Spinner;
- iconos;
- elementos de progreso base.

## Molecules

Crear componentes equivalentes a:

```text
ProgressBar
LessonProgressBadge
CourseProgressSummary
```

## Organisms

Crear o ampliar:

```text
LessonPlayer
CourseModulesList
CourseContentNavigation
CourseProgressOverview
```

## Templates

Actualizar:

```text
CoursePlayerTemplate
MyCoursesTemplate
```

para incorporar información de progreso.

---

# 54. Estado visual de clase

El sistema deberá poder diferenciar al menos:

### No iniciada

```text
0 %
```

### En progreso

```text
1 % – 89 %
```

### Completada

```text
>= 90 %
```

No deberán crearse nuevos estados de base de datos innecesarios si pueden derivarse de `progress_percent` e `is_completed`.

---

# 55. Requerimientos técnicos

## RT-01 — Tabla de progreso

Deberá existir:

`lesson_progress`.

---

## RT-02 — Relación con matrícula

Cada progreso deberá relacionarse con:

`course_enrollments.id`.

---

## RT-03 — Relación con clase

Cada progreso deberá relacionarse con:

`lessons.id`.

---

## RT-04 — Unicidad

Deberá existir como máximo un registro activo por:

`enrollment_id + lesson_id`.

---

## RT-05 — Posición

Deberá almacenarse:

`last_position_seconds`.

---

## RT-06 — Segundos vistos

Deberá almacenarse:

`watched_seconds`.

---

## RT-07 — Porcentaje

Deberá almacenarse:

`progress_percent`.

---

## RT-08 — Finalización automática

`is_completed` deberá establecerse automáticamente al alcanzar como mínimo 90 %.

---

## RT-09 — Fecha de finalización

Deberá registrarse:

`completed_at`.

---

## RT-10 — RPC

La actualización deberá utilizar una función PostgreSQL equivalente a:

`update_lesson_progress()`.

---

## RT-11 — Validación de matrícula

La RPC deberá comprobar que la matrícula sea válida.

---

## RT-12 — Validación de pertenencia

La clase deberá pertenecer al curso de la matrícula.

---

## RT-13 — Estado activo

Una matrícula revocada no deberá poder actualizar progreso normalmente.

---

## RT-14 — Cálculo confiable

El frontend no deberá poder decidir arbitrariamente `is_completed`.

---

## RT-15 — Duración

La duración almacenada en `lessons.duration_seconds` deberá utilizarse en la lógica de progreso.

---

## RT-16 — No regresión

El progreso académico reconocido no deberá reducirse arbitrariamente al retroceder en el video.

---

## RT-17 — Persistencia periódica

No deberán realizarse escrituras por cada segundo.

---

## RT-18 — Reanudación

La última posición deberá recuperarse al volver a la clase.

---

## RT-19 — Persistencia central

PostgreSQL deberá ser la fuente persistente del progreso.

---

## RT-20 — Progreso de curso

`course_enrollments.progress_percent` deberá actualizarse de forma consistente.

---

## RT-21 — Clases obligatorias

El cálculo general deberá respetar `lessons.is_required`.

---

## RT-22 — Materiales excluidos

`course_materials` no deberá influir en el progreso.

---

## RT-23 — Sin bloqueo secuencial

El progreso no deberá utilizarse para bloquear módulos posteriores.

---

## RT-24 — TypeScript

Queries, mutations, hooks y respuestas deberán estar tipados.

---

## RT-25 — Supabase

La operación deberá utilizar Supabase/RPC según la arquitectura definida.

---

## RT-26 — Atomic Design

Los nuevos componentes de progreso deberán respetar la metodología del proyecto.

---

## RT-27 — Soft delete

Los registros eliminados lógicamente deberán excluirse del cálculo normal.

---

## RT-28 — `set_updated_at()`

`lesson_progress` deberá utilizar la estrategia estándar de `updated_at`.

---

## RT-29 — Índices

Deberán existir índices adecuados para:

```text
lesson_progress(enrollment_id)
lesson_progress(lesson_id)
lesson_progress(enrollment_id, lesson_id)
```

según el diseño físico.

---

## RT-30 — Preparación para finalización

Deberá existir o quedar preparada:

`check_course_completion()`.

---

# 56. Requerimientos funcionales

## RF-01 — Progreso individual

Cada alumno deberá conservar su propio progreso por clase.

---

## RF-02 — Independencia entre alumnos

El progreso de un alumno no deberá afectar el de otro.

---

## RF-03 — Reanudación

Al volver a una clase, el alumno deberá continuar aproximadamente desde su última posición registrada.

---

## RF-04 — Persistencia

Cerrar sesión y volver posteriormente no deberá eliminar el progreso.

---

## RF-05 — Diferente dispositivo

El progreso guardado deberá poder consultarse desde otra sesión del mismo usuario.

---

## RF-06 — Porcentaje visible

El alumno deberá poder visualizar el porcentaje de avance.

---

## RF-07 — Regla del 90 %

Una clase se considerará completada cuando alcance al menos el 90 %.

---

## RF-08 — Sin acción manual

El alumno no deberá marcar manualmente una clase como completada.

---

## RF-09 — Clase completada

La interfaz deberá identificar visualmente las clases completadas.

---

## RF-10 — Clase en progreso

La interfaz deberá identificar las clases parcialmente vistas.

---

## RF-11 — Clase no iniciada

Las clases sin progreso deberán mostrarse como no iniciadas o 0 %.

---

## RF-12 — Revisar clase

Una clase completada podrá reproducirse nuevamente.

---

## RF-13 — Mantener completada

Revisar una clase completada no deberá devolverla automáticamente a estado incompleto.

---

## RF-14 — Progreso general

El alumno deberá poder consultar el progreso general del curso.

---

## RF-15 — Mis cursos

La sección Mis cursos deberá mostrar el avance de cada curso.

---

## RF-16 — Contenido del curso

La navegación del curso deberá mostrar el avance de sus clases.

---

## RF-17 — Sin progreso por materiales

Consultar materiales no deberá incrementar el avance.

---

## RF-18 — Sin bloqueo

El alumno podrá continuar navegando libremente aunque no haya completado clases anteriores.

---

## RF-19 — Matrícula requerida

Solo un alumno con acceso válido deberá registrar progreso.

---

## RF-20 — Revocación

Un alumno con matrícula revocada no deberá continuar acumulando progreso.

---

## RF-21 — Historial preservado

La revocación del acceso no deberá borrar automáticamente el progreso histórico almacenado.

---

# 57. Fuera del alcance del Hito 8

No forma parte de este hito:

- quizzes;
- banco de preguntas;
- respuestas;
- calificaciones;
- intentos;
- nota mínima del 80 %;
- aprobación de módulos;
- certificado automático;
- valoración de curso;
- tareas;
- exámenes manuales;
- progreso de materiales;
- asistencia virtual;
- bloqueo secuencial;
- vencimiento del curso;
- gamificación;
- puntos;
- medallas.

---

# 58. Definition of Done

El Hito 8 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe la tabla `lesson_progress`.
- [ ] Se relaciona con `course_enrollments`.
- [ ] Se relaciona con `lessons`.
- [ ] Existe unicidad activa por `enrollment_id + lesson_id`.
- [ ] Existe `last_position_seconds`.
- [ ] Existe `watched_seconds`.
- [ ] Existe `progress_percent`.
- [ ] Existe `is_completed`.
- [ ] Existe `completed_at`.
- [ ] Se implementó soft delete.
- [ ] Funciona `updated_at`.
- [ ] Existen índices adecuados.
- [ ] Todo fue creado mediante migraciones versionadas.

## RPC `update_lesson_progress()`

- [ ] Existe la función.
- [ ] Valida matrícula.
- [ ] Valida estado de matrícula.
- [ ] Valida clase.
- [ ] Valida pertenencia al curso.
- [ ] Utiliza duración válida.
- [ ] Crea progreso si no existe.
- [ ] Actualiza progreso existente.
- [ ] Actualiza posición.
- [ ] Actualiza segundos vistos.
- [ ] Calcula porcentaje.
- [ ] Limita valores válidos.
- [ ] Detecta 90 %.
- [ ] Marca `is_completed`.
- [ ] Registra `completed_at`.
- [ ] No permite manipulación trivial desde frontend.
- [ ] No genera registros duplicados.

## Reproductor

- [ ] Puede cargar progreso existente.
- [ ] Inicia aproximadamente desde la última posición guardada.
- [ ] Persiste progreso durante la reproducción.
- [ ] No escribe en Supabase cada segundo.
- [ ] Guarda al pausar cuando corresponde.
- [ ] Guarda al cambiar de clase.
- [ ] Maneja el abandono de página de forma razonable.
- [ ] Una falla de guardado no rompe innecesariamente la reproducción.
- [ ] El reproductor no contiene toda la lógica de acceso a datos directamente.

## Regla del 90 %

- [ ] Una clase con 89 % permanece no completada.
- [ ] Una clase con 90 % queda completada.
- [ ] Una clase por encima de 90 % queda completada.
- [ ] No existe botón manual de “Completar”.
- [ ] `completed_at` se registra correctamente.
- [ ] Volver a una posición anterior no elimina la finalización alcanzada.

## Progreso visual

- [ ] Se muestra progreso por clase.
- [ ] Se diferencia no iniciada.
- [ ] Se diferencia en progreso.
- [ ] Se diferencia completada.
- [ ] Se muestra progreso general.
- [ ] “Mis cursos” muestra avance.
- [ ] La vista interna del curso muestra avance.
- [ ] La navegación por módulos muestra el estado de las clases.

## Progreso general

- [ ] `course_enrollments.progress_percent` se actualiza.
- [ ] El cálculo respeta clases obligatorias.
- [ ] Los materiales no afectan el porcentaje.
- [ ] Clases eliminadas lógicamente no afectan cálculos normales.
- [ ] El cálculo se encuentra centralizado y no duplicado en múltiples componentes.

## Seguridad lógica

- [ ] Un usuario sin matrícula no puede registrar progreso.
- [ ] Una matrícula revocada no puede actualizar progreso.
- [ ] Una clase de otro curso no puede recibir progreso utilizando esa matrícula.
- [ ] Un alumno no puede actualizar directamente el progreso de otro alumno mediante el flujo normal.
- [ ] Los valores críticos no dependen únicamente del frontend.

## Arquitectura

- [ ] Existe una mutation centralizada para progreso.
- [ ] La mutation utiliza RPC.
- [ ] Los hooks están separados de la presentación.
- [ ] Los componentes respetan Atomic Design.
- [ ] Los tipos de Supabase están actualizados.
- [ ] Las queries están tipadas.
- [ ] Las mutations están tipadas.
- [ ] La solución está preparada para `check_course_completion()`.

---

# 59. Pruebas funcionales obligatorias

## Caso 1 — Primera reproducción

```text
1. Alumno abre una clase por primera vez.
2. No existe lesson_progress.
3. Reproduce video.
4. Sistema crea lesson_progress.
5. Guarda posición.
6. Guarda progreso.
7. La interfaz muestra avance.
```

---

## Caso 2 — Salir y regresar

```text
1. Alumno reproduce hasta aproximadamente 45 %.
2. Sale de la clase.
3. Cierra sesión.
4. Inicia sesión nuevamente.
5. Abre la misma clase.
6. Sistema recupera progreso.
7. Video continúa aproximadamente desde la última posición.
8. Progreso académico sigue conservado.
```

---

## Caso 3 — Regla del 89 %

```text
1. Reproducir clase hasta 89 %.
2. Guardar progreso.
3. is_completed = false.
4. No registrar la clase como completada.
```

---

## Caso 4 — Regla del 90 %

```text
1. Continuar reproducción.
2. Alcanzar 90 %.
3. Guardar progreso.
4. is_completed = true.
5. completed_at registrado.
6. Interfaz muestra clase completada.
```

---

## Caso 5 — Volver hacia atrás

```text
1. Clase ya completada.
2. Alumno vuelve al 30 % del video.
3. last_position_seconds puede actualizarse.
4. is_completed continúa true.
5. El progreso académico alcanzado no se pierde.
```

---

## Caso 6 — Múltiples clases

```text
1. Curso contiene 4 clases obligatorias.
2. Completar Clase 1.
3. Clase 2 queda al 50 %.
4. Clases 3 y 4 no se inician.
5. El curso muestra un progreso coherente.
6. Cada clase conserva su propio estado.
```

---

## Caso 7 — Materiales

```text
1. Registrar progreso general.
2. Abrir PDF del curso.
3. Descargar material.
4. Volver al curso.
5. El porcentaje no cambia por utilizar materiales.
```

---

## Caso 8 — Navegación libre

```text
1. Clase 1 permanece en 0 %.
2. Alumno abre Clase 3.
3. Sistema permite acceso.
4. Comienza a registrar progreso de Clase 3.
```

---

## Caso 9 — Matrícula revocada

```text
1. Alumno tiene progreso registrado.
2. Administrador revoca matrícula.
3. Alumno intenta abrir/actualizar clase.
4. Sistema impide acceso normal.
5. Progreso histórico anterior permanece almacenado.
```

---

## Caso 10 — Clase de otro curso

```text
1. Usuario posee matrícula de Curso A.
2. Intenta enviar progreso para una clase de Curso B.
3. update_lesson_progress() valida relaciones.
4. Operación es rechazada.
```

---

## Caso 11 — Dos dispositivos

```text
1. Alumno reproduce clase en dispositivo A.
2. Guarda 60 %.
3. Abre Campus en dispositivo B.
4. Consulta la misma clase.
5. Recupera el progreso persistido.
```

---

## Caso 12 — Manipulación de porcentaje

```text
1. Navegador intenta enviar un valor de progreso no coherente.
2. La función valida los datos recibidos.
3. No confía ciegamente en progress_percent enviado por el cliente.
4. No permite completar arbitrariamente la clase.
```

---

# 60. Validación final del hito

Antes de aprobar el Hito 8, el equipo deberá demostrar:

```text
1. Iniciar sesión como estudiante.
2. Abrir un curso habilitado.
3. Abrir una clase.
4. Reproducir parcialmente el video.
5. Confirmar que el progreso se guarda.
6. Salir.
7. Volver a entrar.
8. Continuar desde la última posición.
9. Alcanzar menos de 90 %.
10. Confirmar que la clase no está completada.
11. Alcanzar 90 %.
12. Confirmar finalización automática.
13. Revisar progreso general del curso.
14. Revisar progreso en Mis cursos.
15. Abrir otra clase sin completar la anterior.
16. Confirmar navegación libre.
17. Abrir materiales.
18. Confirmar que no afectan progreso.
19. Probar matrícula revocada.
20. Probar manipulación inválida del progreso.
```

Todo deberá realizarse mediante los flujos normales de la aplicación, sin modificar manualmente `lesson_progress` desde el Dashboard de Supabase.

---

# 61. Resultado final esperado del Hito 8

Al finalizar este hito, el Campus dejará de ser únicamente un repositorio de videos y comenzará a comportarse como una plataforma de formación con seguimiento académico.

El recorrido deberá ser:

```text
ALUMNO
   │
   ▼
MIS CURSOS
   │
   └── Progreso general
   │
   ▼
CURSO
   │
   ├── Módulo 1
   │      │
   │      ├── Clase 1 → 100 % ✓
   │      ├── Clase 2 → 65 %
   │      └── Clase 3 → 0 %
   │
   └── Materiales
          └── No afectan progreso

                 │
                 ▼
             CLASE
                 │
                 ▼
              VIDEO
                 │
          ┌──────┴───────┐
          │              │
          ▼              ▼
    última posición   segundos vistos
          │              │
          └──────┬───────┘
                 ▼
      update_lesson_progress()
                 │
                 ▼
          lesson_progress
                 │
                 ▼
       ¿Progreso >= 90 %?
          │             │
         No            Sí
          │             │
          ▼             ▼
     En progreso    COMPLETADA
                        │
                        ▼
               progreso del curso
```

El progreso deberá persistir entre sesiones y dispositivos, y ninguna acción manual del alumno será necesaria para marcar una clase como completada.

Con este hito quedará preparada la información necesaria para añadir las evaluaciones académicas y combinar ambos criterios:

**Clases completadas + Quizzes aprobados.**

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 9 — Quizzes, Evaluaciones y Aprobación Académica.**