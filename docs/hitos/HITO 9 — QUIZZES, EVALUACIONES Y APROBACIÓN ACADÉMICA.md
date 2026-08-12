# HITO 9 — QUIZZES, EVALUACIONES Y APROBACIÓN ACADÉMICA

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 9 tiene como finalidad implementar el sistema de **evaluaciones mediante quizzes** dentro de los cursos grabados del Campus Virtual.

Al finalizar el Hito 8, la plataforma ya deberá ser capaz de:

- registrar el progreso de las clases;
- conservar la última posición del video;
- calcular el porcentaje de avance;
- marcar automáticamente una clase como completada al alcanzar el 90 %;
- calcular el progreso general del curso.

El Hito 9 añadirá el segundo componente necesario para determinar el cumplimiento académico de un curso: **las evaluaciones**.

Cada módulo podrá tener opcionalmente un quiz.

El alumno deberá poder:

- abrir el quiz de un módulo;
- responder preguntas;
- seleccionar alternativas;
- enviar su intento;
- obtener una calificación;
- conocer si aprobó;
- revisar el resultado;
- volver a intentarlo si no alcanzó la nota mínima.

Las reglas definidas para el MVP son:

**Nota mínima aprobatoria: 80 %.**

**Número de intentos: ilimitado.**

Todos los intentos deberán conservarse históricamente.

Las respuestas correctas no deberán ser enviadas anticipadamente al navegador ni utilizadas desde el frontend para determinar la nota.

La evaluación deberá corregirse en una operación confiable del lado de PostgreSQL mediante una función equivalente a:

`submit_quiz_attempt()`.



---

# 2. Objetivo del hito

Implementar un sistema de evaluaciones automatizadas que permita determinar si un alumno ha aprobado los quizzes asociados a los módulos de un curso.

Al finalizar el hito deberá funcionar el recorrido:

**Alumno accede al módulo → Abre quiz → Responde preguntas → Envía intento → PostgreSQL corrige → Se almacena resultado → Se muestra nota → Se determina aprobado/no aprobado → Puede volver a intentar.**

Además, deberá quedar completamente integrada la lógica:

**Clases obligatorias completadas + Quizzes aprobados = Curso académicamente completado.**

La generación del certificado y el cierre final del curso se consolidarán en el Hito 10.

---

# 3. Alcance del hito

El Hito 9 comprende:

- quizzes por módulo;
- preguntas;
- opciones de respuesta;
- definición de respuesta correcta;
- orden de preguntas;
- orden de alternativas;
- administración de quizzes;
- publicación;
- resolución desde el Campus;
- intentos;
- almacenamiento histórico;
- respuestas seleccionadas;
- corrección automática;
- cálculo de nota;
- regla de aprobación del 80 %;
- intentos ilimitados;
- visualización de resultado;
- visualización de respuestas correctas después de enviar;
- explicaciones opcionales;
- integración con `check_course_completion()`.

No comprende todavía:

- certificado automático del curso;
- “Mis certificados” del Campus;
- valoraciones;
- emisión final de certificado;
- envío final de notificación por curso completado.

Estas funcionalidades corresponden principalmente al Hito 10.

---

# 4. Modelo funcional del quiz

La estructura académica deberá quedar:

```text
COURSE
│
├── MODULE 1
│   ├── LESSON
│   ├── LESSON
│   └── QUIZ
│
├── MODULE 2
│   ├── LESSON
│   └── QUIZ
│
└── MODULE 3
    ├── LESSON
    └── Sin quiz
```

Los quizzes serán opcionales.

Un módulo podrá no tener quiz.

Cuando exista un quiz activo, deberá ser considerado para determinar la finalización del curso.

---

# 5. Regla de un quiz activo por módulo

El diseño corregido establece:

**Máximo un quiz activo por módulo.**

Esto no impide que históricamente puedan existir otros registros eliminados lógicamente o versiones futuras.

La plataforma deberá impedir que un módulo tenga simultáneamente dos quizzes activos válidos.

---

# 6. Tareas del hito

## 6.1 Crear tabla `quizzes`

## Objetivo

Representar la evaluación asociada a un módulo.

## Campos

Implementar los campos definidos en el modelo físico, incluyendo como mínimo:

```text
id
module_id
title
description
passing_score
is_published
created_at
updated_at
deleted_at
deleted_by
```

La implementación deberá respetar el diccionario de datos corregido.

---

# 7. Nota mínima

El quiz deberá utilizar como regla del MVP:

```text
passing_score = 80
```

Esto representa:

**80 % de respuestas correctas.**

El sistema deberá quedar preparado técnicamente para que el valor pueda existir en la entidad, pero el comportamiento definido actualmente para el MVP es 80 %.

---

# 8. Publicación de quiz

El campo:

`is_published`

deberá controlar si el quiz está disponible para el alumno.

Un quiz no publicado:

- podrá existir en administración;
- no deberá aparecer normalmente en el Campus;
- no deberá poder resolverse mediante el flujo normal.

---

# 9. Crear tabla `quiz_questions`

## Objetivo

Representar las preguntas correspondientes a un quiz.

Relación:

```text
QUIZ
 │
 ├── QUESTION 1
 ├── QUESTION 2
 └── QUESTION 3
```

## Campos

Implementar como mínimo:

```text
id
quiz_id
question_text
explanation
sort_order
created_at
updated_at
deleted_at
deleted_by
```

La explicación será opcional y podrá mostrarse después de resolver el intento.

---

# 10. Orden de preguntas

Las preguntas deberán utilizar:

`sort_order`

para determinar su posición dentro del quiz.

No deberán ordenarse por:

- UUID;
- fecha de creación;
- texto alfabético.

---

# 11. Crear tabla `quiz_options`

## Objetivo

Representar las alternativas de respuesta de cada pregunta.

## Campos

Implementar como mínimo:

```text
id
question_id
option_text
is_correct
sort_order
created_at
updated_at
deleted_at
deleted_by
```

---

# 12. Respuesta correcta

Para cada pregunta deberá existir:

**exactamente una alternativa correcta.**

El diseño físico corregido establece esta regla explícitamente.

La plataforma deberá impedir:

```text
Pregunta
├── Opción A = correcta
├── Opción B = correcta
└── Opción C
```

y también impedir:

```text
Pregunta
├── Opción A
├── Opción B
└── Opción C

sin ninguna respuesta correcta
```

---

# 13. Proteger `is_correct`

El campo:

`quiz_options.is_correct`

es información sensible desde el punto de vista académico.

**No deberá enviarse al navegador antes de que el alumno envíe su intento.**

La consulta utilizada para construir el formulario de quiz deberá devolver:

- identificador de opción;
- texto;
- orden;

pero no:

`is_correct`.

Esta regla está contemplada expresamente en el diseño físico corregido.

---

# 14. Crear tabla `quiz_attempts`

## Objetivo

Conservar cada intento realizado por un alumno.

La relación conceptual será:

```text
COURSE_ENROLLMENT
       │
       ▼
 QUIZ_ATTEMPTS
       │
       ▼
      QUIZ
```

Cada envío completo del quiz deberá generar un nuevo intento.

---

# 15. Campos de `quiz_attempts`

Implementar según el modelo físico aprobado, incluyendo como mínimo:

```text
id
enrollment_id
quiz_id
attempt_number
score_percent
is_passed
started_at
submitted_at
created_at
```

y demás campos definidos en el diccionario cuando correspondan.

Los intentos representan historial académico y no deberán sobrescribirse cada vez que el alumno vuelva a responder.

---

# 16. Intentos ilimitados

No deberá existir un límite funcional de intentos en el MVP.

El flujo será:

```text
Intento 1 → 60 % → No aprobado
Intento 2 → 75 % → No aprobado
Intento 3 → 90 % → Aprobado
Intento 4 → Puede realizarlo nuevamente si la UI lo permite
```

Los intentos anteriores deberán conservarse.



---

# 17. Numeración del intento

El sistema deberá asignar un:

`attempt_number`

coherente por:

```text
enrollment_id + quiz_id
```

Ejemplo:

```text
Intento 1
Intento 2
Intento 3
```

La generación no deberá depender únicamente de:

```text
frontend cuenta filas
+
1
```

sin protección frente a concurrencia.

---

# 18. Crear tabla `quiz_attempt_answers`

## Objetivo

Conservar las respuestas seleccionadas dentro de cada intento.

Relación:

```text
QUIZ_ATTEMPT
     │
     ├── ANSWER 1
     ├── ANSWER 2
     └── ANSWER 3
```

---

# 19. Campos de `quiz_attempt_answers`

Implementar según el modelo físico corregido.

Como mínimo deberá conservar:

```text
id
attempt_id
question_id
selected_option_id
question_text_snapshot
selected_option_text_snapshot
correct_option_text_snapshot
is_correct
created_at
```

o los snapshots equivalentes definidos en el diseño.

La finalidad es preservar históricamente qué respondió el alumno y qué era correcto en ese momento.

---

# 20. Snapshots de respuestas

La evaluación histórica no deberá depender exclusivamente del contenido actual de:

- `quiz_questions`;
- `quiz_options`.

Si posteriormente el administrador modifica el texto de una pregunta, el intento anterior deberá seguir pudiendo interpretarse correctamente.

Por ello deberán conservarse los snapshots aprobados en el modelo.

---

# 21. No modificar intentos anteriores

Una vez enviado un intento:

- sus respuestas no deberán editarse;
- su nota no deberá recalcularse automáticamente por cambios futuros del quiz;
- deberá conservarse como hecho histórico.

Las correcciones del contenido deberán aplicarse a nuevos intentos posteriores.

---

# 22. Administración de quizzes

Dentro de cada curso/módulo deberá existir una sección administrativa para gestionar el quiz.

Ruta equivalente:

```text
/admin/cursos/[courseId]/modulos/[moduleId]/quiz
```

---

# 23. Crear quiz

El administrador deberá poder definir:

- título;
- descripción;
- nota mínima;
- estado publicado/no publicado.

En el MVP la nota mínima deberá mantenerse en 80 %, aunque la interfaz puede mostrarla como configuración si el diseño lo requiere.

---

# 24. Crear preguntas

El administrador deberá poder:

- agregar pregunta;
- editar pregunta;
- eliminar lógicamente;
- ordenar preguntas;
- agregar explicación opcional.

---

# 25. Crear alternativas

Para cada pregunta deberá poder:

- agregar opciones;
- editar texto;
- ordenar opciones;
- seleccionar exactamente una como correcta.

La interfaz administrativa deberá dejar clara cuál es la respuesta correcta.

Esta información será visible únicamente en administración.

---

# 26. Validación antes de publicar

Un quiz no deberá considerarse válido para publicación si existen preguntas incompletas.

Como mínimo:

- deberá existir al menos una pregunta;
- cada pregunta deberá tener opciones suficientes para ser respondida;
- exactamente una alternativa deberá ser correcta.

La cantidad mínima exacta de alternativas por pregunta no está fijada explícitamente en los documentos, por lo que el equipo deberá definir una validación razonable durante implementación.

---

# 27. Reordenamiento

El administrador deberá poder ordenar:

- preguntas;
- alternativas.

El orden deberá persistir en `sort_order`.

---

# 28. Visualización en el Campus

Cuando un módulo tenga un quiz publicado deberá mostrarse dentro de la navegación del módulo.

Ejemplo:

```text
Módulo 2

✓ Clase 2.1
✓ Clase 2.2
○ Quiz del módulo
```

---

# 29. Acceso libre al quiz

El modelo funcional no define desbloqueo secuencial obligatorio.

Por tanto, no deberá agregarse arbitrariamente una regla como:

**“No puedes abrir el quiz hasta ver todas las clases del módulo”.**

La plataforma deberá mantener la navegación libre definida previamente, salvo que posteriormente se cambie explícitamente el alcance funcional.

---

# 30. Crear vista de quiz

Crear una ruta equivalente a:

```text
/campus/cursos/[courseId]/modulos/[moduleId]/quiz
```

La página deberá validar:

- sesión;
- matrícula activa;
- curso;
- módulo;
- quiz;
- publicación.

---

# 31. Consulta segura del quiz

La consulta que construye el quiz deberá recuperar:

```text
quiz
questions
options
```

pero excluir:

```text
is_correct
```

antes del envío.

El navegador no deberá disponer del mapa completo de respuestas correctas.

---

# 32. Interfaz del quiz

El formulario deberá permitir al alumno:

- leer pregunta;
- visualizar alternativas;
- seleccionar una opción;
- cambiar su selección antes de enviar;
- avanzar por las preguntas;
- enviar cuando esté listo.

La interfaz exacta podrá utilizar una sola página o navegación entre preguntas.

No existe una obligación documental respecto a esa decisión visual.

---

# 33. Una respuesta por pregunta

Como cada pregunta tiene una única respuesta correcta, el alumno deberá seleccionar:

**una sola alternativa por pregunta.**

La interfaz deberá utilizar una interacción equivalente a radio buttons o selección única.

---

# 34. Validar preguntas sin responder

Antes de enviar, la aplicación deberá manejar preguntas sin respuesta según la decisión funcional implementada.

Preferentemente deberá informar al alumno de las preguntas pendientes antes de entregar el intento.

La función de servidor deberá igualmente validar la estructura de respuestas recibida.

---

# 35. Crear función PostgreSQL `submit_quiz_attempt()`

Esta será la operación crítica del Hito 9.

El flujo será:

```text
Quiz UI
   │
   ▼
Respuestas seleccionadas
   │
   ▼
submitQuizAttempt()
   │
   ▼
supabase.rpc(
  "submit_quiz_attempt"
)
   │
   ▼
PostgreSQL
```



---

# 36. Responsabilidades de `submit_quiz_attempt()`

La función deberá realizar como mínimo las siguientes acciones.

## 36.1 Validar matrícula

Comprobar que:

- existe;
- pertenece al alumno;
- está activa;
- corresponde al curso del quiz.

---

## 36.2 Validar quiz

Comprobar que:

- existe;
- pertenece al módulo correcto;
- el módulo pertenece al curso;
- está publicado;
- no está eliminado.

---

## 36.3 Validar preguntas

Las respuestas deberán corresponder únicamente a preguntas activas del quiz.

No deberá aceptarse una respuesta para una pregunta perteneciente a otro quiz.

---

## 36.4 Validar opciones

Cada opción recibida deberá:

- existir;
- pertenecer a la pregunta indicada;
- estar activa.

---

## 36.5 Consultar respuestas correctas

La función deberá leer internamente:

`quiz_options.is_correct`

desde PostgreSQL.

Esta información no deberá venir confiada desde el navegador.

---

## 36.6 Calcular resultado

Para cada pregunta:

```text
selected_option
        ↓
comparar
        ↓
correct_option
        ↓
correct / incorrect
```

Después calcular la nota general.

---

# 37. Cálculo de nota

Conceptualmente:

```text
Preguntas correctas
-------------------- × 100
Total de preguntas
```

El resultado deberá almacenarse en:

`score_percent`.

Deberá mantenerse entre:

```text
0
y
100
```

---

# 38. Determinar aprobación

La función deberá calcular:

```text
score_percent >= 80
```

Entonces:

```text
is_passed = true
```

En caso contrario:

```text
is_passed = false
```

La decisión no deberá enviarse desde el navegador.

---

# 39. Crear intento

Cada envío válido deberá crear una fila nueva en:

`quiz_attempts`.

No deberá actualizarse el intento anterior para representar el nuevo.

---

# 40. Guardar respuestas

Por cada pregunta deberá crearse una fila en:

`quiz_attempt_answers`

con:

- pregunta;
- opción seleccionada;
- resultado;
- snapshots correspondientes.

---

# 41. Atomicidad

La creación de:

- `quiz_attempt`;
- respuestas;
- nota;
- aprobación;

deberá tratarse como una única operación consistente.

No deberá quedar:

```text
quiz_attempt creado
pero
solo la mitad de respuestas guardadas
```

ante un error.

La función PostgreSQL deberá resolver esta necesidad transaccional.

---

# 42. Historial de intentos

El Campus deberá permitir mostrar al alumno sus intentos previos.

Ejemplo:

```text
Intento 1 — 65 % — No aprobado
Intento 2 — 75 % — No aprobado
Intento 3 — 90 % — Aprobado
```

---

# 43. Mejor intento

La interfaz podrá mostrar cuál fue la mejor calificación obtenida.

Sin embargo, la regla funcional de aprobación deberá basarse en que exista al menos un intento aprobado.

No deberá eliminarse el historial de intentos inferiores.

---

# 44. Intento aprobado

Una vez que el alumno obtiene:

`is_passed = true`

el quiz deberá considerarse aprobado para efectos de finalización del curso.

Realizar un intento posterior con una nota inferior no deberá hacer que el alumno pierda una aprobación ya conseguida.

La condición académica deberá ser:

**existe al menos un intento aprobado.**

---

# 45. Resultado del intento

Después de enviar, la interfaz deberá mostrar como mínimo:

- nota;
- aprobado/no aprobado;
- respuestas seleccionadas;
- respuesta correcta;
- explicación cuando exista.

La visualización de la respuesta correcta es válida **después de enviar el intento**.

---

# 46. Mensaje aprobado

Cuando:

```text
score_percent >= 80
```

mostrar un mensaje equivalente a:

**Quiz aprobado.**

---

# 47. Mensaje no aprobado

Cuando:

```text
score_percent < 80
```

mostrar claramente:

**No alcanzaste la nota mínima. Puedes volver a intentarlo.**

Dado que los intentos son ilimitados, no deberá mostrarse un mensaje de bloqueo definitivo.

---

# 48. Explicaciones

Si:

`quiz_questions.explanation`

contiene información, podrá mostrarse junto al resultado.

La explicación no será obligatoria.

---

# 49. Integración con progreso del curso

Los quizzes no deberán modificar directamente:

`lesson_progress`.

Son dos dominios distintos:

```text
LESSONS → lesson_progress
QUIZZES → quiz_attempts
```

Ambos se combinan únicamente para comprobar finalización del curso.

---

# 50. Actualizar `check_course_completion()`

La función creada/preparada en el Hito 8 deberá ampliarse en este hito.

La comprobación completa deberá considerar:

```text
TODAS las clases obligatorias
       completadas
           +
TODOS los quizzes existentes
       aprobados
           =
CURSO COMPLETADO
```



---

# 51. Clases obligatorias

Para cada curso:

- obtener módulos activos;
- obtener clases activas y obligatorias;
- comprobar `lesson_progress.is_completed`.

Todas deberán cumplirse.

---

# 52. Quizzes existentes

Para cada módulo con quiz activo/publicado que forme parte del curso, deberá comprobarse si existe:

```text
quiz_attempts.is_passed = true
```

para la matrícula correspondiente.

---

# 53. Curso sin quizzes

Si el curso no tiene ningún quiz aplicable:

```text
Todas las clases obligatorias completas
=
cumplimiento académico
```

No deberá exigirse artificialmente una evaluación inexistente.

---

# 54. Curso con quizzes

Si existen quizzes:

```text
Clases completas
pero quiz pendiente
=
curso todavía no completado
```

Igualmente:

```text
Quizzes aprobados
pero clases pendientes
=
curso todavía no completado
```

---

# 55. Momento de comprobar finalización

`check_course_completion()` deberá ejecutarse cuando existan cambios relevantes, como:

- una clase alcanza el 90 %;
- un quiz es aprobado.

No es necesario ejecutarlo en cada segundo de reproducción ni en cada renderizado.

---

# 56. `course_enrollments.status`

Cuando se cumplan todas las condiciones, el diseño deberá quedar preparado para cambiar:

```text
active
↓
completed
```

La consolidación del proceso final, incluida la generación de certificado, pertenece al Hito 10.

Si durante este hito ya se realiza el cambio a `completed` como parte de `check_course_completion()`, deberá respetarse el diseño aprobado y no generar todavía comportamiento no definido fuera de alcance.

---

# 57. `completed_at`

El sistema deberá quedar preparado para registrar:

`course_enrollments.completed_at`

cuando el curso cumpla todas sus reglas.

La operación debe ser idempotente.

---

# 58. No perder finalización

Una vez que un curso se considere completado, un nuevo intento inferior de un quiz no deberá revertir la condición académica.

Igualmente, volver a ver una clase desde una posición menor no deberá eliminar su finalización.

---

# 59. Queries administrativas de quizzes

Crear operaciones equivalentes a:

```text
getQuizByModule()
getQuizQuestions()
getQuizWithCorrectAnswersForAdmin()
```

La consulta administrativa sí podrá devolver `is_correct` cuando el usuario tenga el contexto adecuado.

---

# 60. Queries del Campus

Crear operaciones equivalentes a:

```text
getQuizForStudent()
getQuizAttempts()
getQuizAttemptResult()
getQuizStatus()
```

`getQuizForStudent()` no deberá exponer `is_correct`.

---

# 61. Mutation administrativa

Crear operaciones equivalentes a:

```text
createQuiz()
updateQuiz()
publishQuiz()
createQuizQuestion()
updateQuizQuestion()
createQuizOption()
updateQuizOption()
reorderQuizQuestions()
reorderQuizOptions()
```

Los nombres exactos podrán variar.

---

# 62. Mutation del alumno

Crear:

`submitQuizAttempt()`

Internamente deberá ejecutar:

```text
supabase.rpc(
  "submit_quiz_attempt",
  ...
)
```

---

# 63. Estructura por features

Mantener:

```text
src/features/quizzes/
```

Ejemplo:

```text
quizzes/
    components/
    queries/
    mutations/
    schemas/
    types/
    utils/
```

La lógica de finalización podrá permanecer en el dominio de progreso/matrícula correspondiente.

---

# 64. Atomic Design aplicado al Hito 9

## Atoms

Reutilizar:

- Button;
- Text;
- Badge;
- Radio;
- Spinner;
- Heading.

## Molecules

Crear componentes equivalentes a:

```text
QuizOption
QuizQuestionStatus
QuizScore
AttemptStatusBadge
```

## Organisms

Crear:

```text
QuizForm
QuizQuestion
QuizResult
QuizAttemptsHistory
QuizAdminEditor
QuizQuestionsEditor
```

## Templates

Podrán existir:

```text
QuizPlayerTemplate
QuizResultTemplate
QuizAdminTemplate
```

---

# 65. Estados visuales

La interfaz deberá contemplar:

## Sin quiz

No mostrar acciones de evaluación.

## Quiz disponible

Mostrar:

**Realizar quiz**

## Quiz aprobado

Mostrar:

**Aprobado**

con la mejor nota o información relevante.

## Quiz no aprobado

Mostrar:

**Puedes intentarlo nuevamente.**

---

# 66. Requerimientos técnicos

## RT-01 — Tabla `quizzes`

Deberá existir y relacionarse con `course_modules`.

---

## RT-02 — Un quiz activo por módulo

La base de datos deberá impedir múltiples quizzes activos equivalentes por módulo según el modelo físico.

---

## RT-03 — Preguntas

Deberá utilizarse `quiz_questions`.

---

## RT-04 — Opciones

Deberá utilizarse `quiz_options`.

---

## RT-05 — Una opción correcta

Cada pregunta deberá tener exactamente una respuesta correcta.

---

## RT-06 — Proteger respuestas

`is_correct` no deberá exponerse en las consultas del alumno antes de enviar.

---

## RT-07 — Intentos

Deberá utilizarse `quiz_attempts`.

---

## RT-08 — Respuestas

Deberá utilizarse `quiz_attempt_answers`.

---

## RT-09 — Historial

Cada intento deberá conservarse como registro independiente.

---

## RT-10 — Intentos ilimitados

No deberá existir límite de intentos en la lógica funcional del MVP.

---

## RT-11 — RPC

La corrección deberá ejecutarse mediante:

`submit_quiz_attempt()`.

---

## RT-12 — Nota segura

El frontend no deberá determinar `score_percent`.

---

## RT-13 — Aprobación segura

El frontend no deberá determinar `is_passed`.

---

## RT-14 — Nota mínima

La regla del MVP será 80 %.

---

## RT-15 — Validar pertenencia

Las preguntas y opciones recibidas deberán pertenecer al quiz correspondiente.

---

## RT-16 — Validar matrícula

Solo una matrícula válida deberá poder generar intentos.

---

## RT-17 — Validar curso

El quiz deberá pertenecer al curso de la matrícula.

---

## RT-18 — Atomicidad

Intento y respuestas deberán guardarse dentro de una operación consistente.

---

## RT-19 — Snapshots

Los intentos deberán conservar la información histórica definida.

---

## RT-20 — Inmutabilidad histórica

Los intentos enviados no deberán alterarse por cambios posteriores del quiz.

---

## RT-21 — Soft delete

Las tablas editables del quiz deberán respetar soft delete según el modelo.

Los intentos históricos deberán preservarse conforme al diseño.

---

## RT-22 — Orden

Preguntas y alternativas deberán usar `sort_order`.

---

## RT-23 — `updated_at`

Las entidades editables deberán utilizar la convención común de actualización.

---

## RT-24 — TypeScript

Quiz, preguntas, opciones, intentos y resultados deberán estar tipados.

---

## RT-25 — Schemas

Los formularios administrativos deberán usar schemas centralizados.

---

## RT-26 — Atomic Design

La interfaz deberá respetar la arquitectura establecida.

---

## RT-27 — `check_course_completion()`

La función deberá incorporar la comprobación de quizzes aprobados.

---

## RT-28 — Sin regresión

Un quiz aprobado no deberá quedar académicamente desaprobado por intentos posteriores inferiores.

---

## RT-29 — RLS

La protección definitiva de consultas será implementada en el Hito 11.

La arquitectura deberá quedar preparada para impedir que estudiantes consulten respuestas correctas directamente.

---

# 67. Requerimientos funcionales

## RF-01 — Quiz opcional

Un módulo podrá tener o no tener quiz.

---

## RF-02 — Un quiz activo

Un módulo deberá tener como máximo un quiz activo.

---

## RF-03 — Crear quiz

El administrador deberá poder crear una evaluación.

---

## RF-04 — Editar quiz

El administrador deberá poder modificarla antes o durante su uso según corresponda.

---

## RF-05 — Publicar quiz

El administrador deberá poder publicar o retirar un quiz.

---

## RF-06 — Preguntas

Un quiz podrá contener múltiples preguntas.

---

## RF-07 — Alternativas

Cada pregunta deberá disponer de alternativas.

---

## RF-08 — Una respuesta correcta

Solo una opción será correcta por pregunta.

---

## RF-09 — Explicación

Una pregunta podrá tener explicación opcional.

---

## RF-10 — Orden

El administrador deberá poder ordenar preguntas y respuestas.

---

## RF-11 — Matrícula requerida

Solo un alumno con acceso válido al curso podrá resolver el quiz.

---

## RF-12 — Quiz publicado

Solo los quizzes publicados deberán mostrarse normalmente al alumno.

---

## RF-13 — Respuestas ocultas

El alumno no deberá conocer la opción correcta antes del envío.

---

## RF-14 — Selección única

El alumno deberá seleccionar una alternativa por pregunta.

---

## RF-15 — Enviar intento

El alumno deberá poder enviar sus respuestas.

---

## RF-16 — Nota automática

El sistema deberá calcular automáticamente la nota.

---

## RF-17 — Nota mínima

Se aprobará con 80 % o más.

---

## RF-18 — No aprobado

Menos de 80 % deberá considerarse no aprobado.

---

## RF-19 — Intentos ilimitados

El alumno podrá volver a realizar el quiz.

---

## RF-20 — Historial

Todos los intentos deberán conservarse.

---

## RF-21 — Resultado

El alumno deberá conocer su nota después de enviar.

---

## RF-22 — Respuestas correctas

Después de enviar podrá visualizar cuál era la respuesta correcta.

---

## RF-23 — Explicación

Después de enviar podrá visualizar la explicación si fue configurada.

---

## RF-24 — Aprobación acumulativa

Si alguna vez obtuvo una nota aprobatoria, el quiz deberá considerarse aprobado.

---

## RF-25 — Intento posterior menor

Una nota inferior posterior no deberá eliminar una aprobación anterior.

---

## RF-26 — Curso sin quiz

Un curso sin quizzes no deberá exigirlos para completarse.

---

## RF-27 — Curso con quiz

Cuando existan quizzes, todos deberán estar aprobados para completar el curso.

---

## RF-28 — Clases obligatorias

Los quizzes no reemplazan el requisito de completar las clases obligatorias.

---

## RF-29 — Sin bloqueo secuencial

No deberá exigirse completar clases anteriores para abrir un quiz salvo cambio posterior del alcance.

---

# 68. Fuera del alcance del Hito 9

No forma parte de este hito:

- preguntas abiertas;
- evaluación manual;
- ensayos;
- subida de tareas;
- revisión docente;
- tiempo límite;
- cronómetro;
- banco aleatorio complejo;
- selección aleatoria de preguntas;
- múltiples respuestas correctas;
- penalización por respuestas incorrectas;
- límite de intentos;
- certificado automático;
- valoración;
- proctoring;
- supervisión por cámara.

Estas funcionalidades no están contempladas en el alcance aprobado del MVP.

---

# 69. Definition of Done

El Hito 9 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe `quizzes`.
- [ ] Existe `quiz_questions`.
- [ ] Existe `quiz_options`.
- [ ] Existe `quiz_attempts`.
- [ ] Existe `quiz_attempt_answers`.
- [ ] Las relaciones están correctamente configuradas.
- [ ] Existe máximo un quiz activo por módulo.
- [ ] Las preguntas soportan orden.
- [ ] Las opciones soportan orden.
- [ ] Existe exactamente una respuesta correcta por pregunta.
- [ ] Los intentos conservan historial.
- [ ] Los snapshots correspondientes están implementados.
- [ ] Se implementó soft delete donde corresponde.
- [ ] Los índices relevantes existen.
- [ ] Todo fue creado mediante migraciones versionadas.

## Administración

- [ ] Se puede crear un quiz en un módulo.
- [ ] Se puede editar.
- [ ] Se puede publicar.
- [ ] Se puede retirar de publicación.
- [ ] Se pueden crear preguntas.
- [ ] Se pueden editar preguntas.
- [ ] Se pueden eliminar lógicamente.
- [ ] Se pueden ordenar.
- [ ] Se pueden agregar alternativas.
- [ ] Se pueden editar alternativas.
- [ ] Se pueden ordenar.
- [ ] Se puede indicar exactamente una respuesta correcta.
- [ ] Se puede agregar explicación.
- [ ] No se puede publicar un quiz claramente inválido.

## Consulta del estudiante

- [ ] El quiz aparece en el módulo correspondiente.
- [ ] Solo aparece si está publicado.
- [ ] Un alumno sin matrícula no puede utilizarlo.
- [ ] Una matrícula revocada no puede generar intentos.
- [ ] Las preguntas se muestran correctamente.
- [ ] Las alternativas se muestran correctamente.
- [ ] `is_correct` no se entrega previamente al navegador.
- [ ] La selección es única por pregunta.

## `submit_quiz_attempt()`

- [ ] Existe la RPC.
- [ ] Valida matrícula.
- [ ] Valida curso.
- [ ] Valida módulo.
- [ ] Valida quiz.
- [ ] Valida preguntas.
- [ ] Valida opciones.
- [ ] Consulta internamente respuestas correctas.
- [ ] Calcula resultado.
- [ ] Calcula `score_percent`.
- [ ] Determina `is_passed`.
- [ ] Utiliza 80 % como regla.
- [ ] Crea `quiz_attempt`.
- [ ] Crea respuestas del intento.
- [ ] Conserva snapshots.
- [ ] La operación es atómica.
- [ ] No confía en nota enviada desde frontend.
- [ ] No confía en aprobación enviada desde frontend.

## Intentos

- [ ] Se puede realizar el primer intento.
- [ ] Se puede realizar un segundo intento.
- [ ] Se pueden realizar intentos adicionales.
- [ ] No existe límite funcional.
- [ ] Cada intento queda almacenado por separado.
- [ ] Los números de intento son coherentes.
- [ ] Los intentos anteriores permanecen disponibles.
- [ ] Un intento posterior no sobrescribe otro.

## Resultados

- [ ] Se muestra nota.
- [ ] Se muestra aprobado/no aprobado.
- [ ] Se muestran respuestas seleccionadas.
- [ ] Se muestran respuestas correctas después del envío.
- [ ] Se muestra explicación cuando existe.
- [ ] Si obtiene menos de 80 %, puede volver a intentar.
- [ ] Si obtiene 80 % o más, queda aprobado.
- [ ] Un aprobado anterior no se pierde con un intento posterior inferior.

## Integración con finalización

- [ ] `check_course_completion()` considera clases obligatorias.
- [ ] Considera quizzes existentes.
- [ ] Un curso sin quizzes puede cumplir mediante clases obligatorias.
- [ ] Un curso con quiz pendiente no se considera completado.
- [ ] Un curso con clases pendientes no se considera completado aunque los quizzes estén aprobados.
- [ ] Todos los quizzes aprobados + clases completas cumplen la condición académica.
- [ ] La operación es idempotente.

## Arquitectura

- [ ] Las queries administrativas y estudiantiles están separadas.
- [ ] La query del alumno no expone respuestas correctas.
- [ ] La mutation utiliza RPC.
- [ ] Los componentes respetan Atomic Design.
- [ ] Los schemas están centralizados.
- [ ] Los tipos de Supabase están actualizados.
- [ ] No se creó una API CRUD innecesaria.
- [ ] La lógica queda preparada para el Hito 10.

---

# 70. Pruebas funcionales obligatorias

## Caso 1 — Crear quiz

```text
1. Administrador abre un módulo.
2. Crea quiz.
3. Agrega cinco preguntas.
4. Agrega alternativas.
5. Define una correcta por pregunta.
6. Ordena preguntas.
7. Publica quiz.
8. Alumno puede visualizarlo.
```

---

## Caso 2 — Respuestas correctas ocultas

```text
1. Alumno abre quiz.
2. Inspeccionar respuesta recibida por frontend.
3. Las opciones aparecen.
4. is_correct no debe estar expuesto.
5. El alumno no recibe el mapa de respuestas.
```

---

## Caso 3 — Intento desaprobado

```text
1. Resolver quiz.
2. Obtener 60 %.
3. Crear attempt 1.
4. is_passed = false.
5. Mostrar nota.
6. Mostrar resultado.
7. Permitir nuevo intento.
```

---

## Caso 4 — Intento aprobado

```text
1. Realizar nuevo intento.
2. Obtener 80 %.
3. Crear nuevo quiz_attempt.
4. is_passed = true.
5. Quiz aparece aprobado.
```

---

## Caso 5 — Nota superior

```text
1. Realizar otro intento.
2. Obtener 100 %.
3. Guardar nuevo intento.
4. Mantener intentos anteriores.
5. Quiz continúa aprobado.
```

---

## Caso 6 — Intento posterior inferior

```text
1. Quiz ya tiene intento aprobado.
2. Alumno realiza otro intento.
3. Obtiene 50 %.
4. Guardar el nuevo intento.
5. El nuevo intento aparece desaprobado.
6. El quiz globalmente continúa aprobado porque existe un intento previo aprobado.
```

---

## Caso 7 — Manipular resultado

```text
1. Cliente intenta enviar score_percent = 100.
2. Cliente intenta enviar is_passed = true.
3. submit_quiz_attempt() ignora esos valores.
4. PostgreSQL calcula el resultado real.
```

---

## Caso 8 — Opción de otra pregunta

```text
1. Alterar solicitud.
2. Enviar opción perteneciente a otra pregunta.
3. RPC valida pertenencia.
4. Operación es rechazada.
5. No crear intento parcial.
```

---

## Caso 9 — Pregunta de otro quiz

```text
1. Alterar solicitud.
2. Enviar pregunta perteneciente a otro quiz.
3. Operación es rechazada.
4. No se genera resultado inválido.
```

---

## Caso 10 — Alumno sin matrícula

```text
1. Usuario autenticado no tiene Curso A.
2. Intenta enviar quiz de Curso A.
3. RPC valida enrollment.
4. Rechazar intento.
```

---

## Caso 11 — Curso sin quiz

```text
1. Curso contiene clases obligatorias.
2. No existen quizzes.
3. Alumno completa todas las clases.
4. check_course_completion() no exige un quiz inexistente.
```

---

## Caso 12 — Curso con quiz pendiente

```text
1. Alumno completa todas las clases.
2. Existe quiz publicado.
3. Nunca lo ha aprobado.
4. Curso continúa pendiente.
```

---

## Caso 13 — Curso con quiz aprobado

```text
1. Todas las clases obligatorias completadas.
2. Todos los quizzes aprobados.
3. check_course_completion() identifica cumplimiento académico.
4. Preparar matrícula para finalización definitiva.
```

---

# 71. Validación final del hito

Antes de aprobar el Hito 9, el equipo deberá demostrar:

```text
1. Crear un quiz desde administración.
2. Crear preguntas.
3. Crear alternativas.
4. Configurar una sola respuesta correcta.
5. Publicarlo.
6. Abrirlo como estudiante.
7. Comprobar que las respuestas correctas no vienen al frontend.
8. Realizar intento desaprobado.
9. Revisar nota.
10. Revisar respuestas.
11. Volver a intentar.
12. Obtener 80 % o más.
13. Confirmar aprobación.
14. Consultar historial de intentos.
15. Realizar un intento posterior inferior.
16. Confirmar que no se pierde la aprobación.
17. Completar las clases obligatorias.
18. Ejecutar comprobación de finalización.
19. Confirmar que clases + quizzes determinan cumplimiento.
20. Probar un curso sin quizzes.
```

Todo deberá poder realizarse mediante los flujos normales de la aplicación, sin modificar manualmente las notas o intentos desde Supabase.

---

# 72. Resultado final esperado del Hito 9

Al finalizar este hito, el Campus deberá disponer de los dos mecanismos académicos necesarios para evaluar el cumplimiento del curso:

```text
                    CURSO
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
        CLASES                  QUIZZES
          │                       │
          ▼                       ▼
 lesson_progress          quiz_attempts
          │                       │
          ▼                       ▼
    >= 90 % por clase      >= 80 % aprobado
          │                       │
          └───────────┬───────────┘
                      ▼
          check_course_completion()
                      │
               ┌──────┴──────┐
               │             │
              NO            SÍ
               │             │
               ▼             ▼
        Curso pendiente   Cumplimiento
                           académico
```

El sistema deberá poder determinar de forma confiable si:

- todas las clases obligatorias fueron completadas;
- todos los quizzes existentes fueron aprobados.

Los intentos deberán conservarse históricamente y la calificación deberá producirse exclusivamente mediante lógica confiable, sin exponer previamente las respuestas correctas al estudiante.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 10 — Finalización de Cursos, Certificados y Valoraciones.**