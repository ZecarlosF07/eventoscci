# Quizzes y aprobación académica

## Flujo seguro

Cada módulo admite como máximo un quiz activo. El administrador guarda el quiz completo mediante
`save_quiz()`, que valida en PostgreSQL que cada pregunta tenga al menos dos alternativas y
exactamente una respuesta correcta. La nota mínima del MVP permanece fijada en 80 %.

El Campus obtiene el formulario mediante `get_student_quiz()`. Esta RPC devuelve los textos y el
orden de preguntas y alternativas, pero nunca expone `quiz_options.is_correct`. Además, las tablas
académicas del quiz no conceden acceso directo a `authenticated`; tanto administración como Campus
usan RPC específicas.

Al entregar, el navegador envía exclusivamente pares `question_id` y `selected_option_id` a
`submit_quiz_attempt()`. PostgreSQL valida matrícula, curso, publicación y pertenencia de cada
opción; después corrige, numera el intento con protección de concurrencia y guarda el intento y sus
respuestas en una sola transacción.

## Historial

Los intentos son ilimitados e inmutables. Cada respuesta conserva snapshots de pregunta, opción
seleccionada, opción correcta y explicación, por lo que una edición posterior del quiz no altera la
interpretación de resultados anteriores. Las respuestas correctas solo se devuelven después de un
envío válido, mediante el resultado del intento.

## Cumplimiento del curso

`check_course_completion()` devuelve `true` cuando se cumplen simultáneamente estas condiciones:

- todas las clases obligatorias publicadas alcanzaron el 90 %;
- cada quiz publicado del curso tiene al menos un intento aprobado.

Una nota posterior inferior no revierte una aprobación previa. Desde el Hito 10, la función cambia
la matrícula a `completed`, fija el avance en 100 % y reserva un certificado único cuando se cumple
la última condición académica.
