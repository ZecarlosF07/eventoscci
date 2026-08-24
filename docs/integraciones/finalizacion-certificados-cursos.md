# Finalización, certificados y valoraciones de cursos

## Finalización confiable

`check_course_completion(enrollment_id)` es la única operación que decide la finalización. La
función bloquea la matrícula para evitar carreras, valida identidad y estado, comprueba todas las
clases obligatorias publicadas y exige al menos un intento aprobado por cada quiz publicado.

Cuando se cumplen las condiciones:

- cambia la matrícula a `completed`;
- conserva el primer `completed_at`;
- fija `progress_percent` en 100;
- reserva un único certificado central con `certificate_type = course`.

Las clases opcionales, materiales y valoraciones no intervienen. La ejecución repetida conserva la
fecha y el certificado originales. Una matrícula revocada nunca se completa.

## Documento y recuperación

PostgreSQL guarda primero el certificado y sus snapshots dentro de la misma finalización. La UI
autenticada solicita después la generación del PDF al servidor. El servidor comprueba que el
certificado pertenece al alumno y utiliza la credencial de servicio solamente para leer la
plantilla, crear el PDF y almacenarlo en el bucket privado `certificates`.

El archivo usa el mismo motor del Hito 5. Los cursos virtuales omiten fechas por decisión funcional,
pero conservan nombre, curso, condición, horas académicas, firmantes, código y QR. La ruta es
determinista y admite reintentos; un fallo documental no revierte la matrícula ni crea otro
certificado.

Al finalizar el archivo, `finalize_course_certificate()` encola `course_certificate_issued` para
n8n. La entrega de correo permanece desacoplada del cumplimiento académico.

## Campus y valoraciones

`/campus/certificados` reúne certificados de cursos y actividades de la identidad institucional.
Los archivos vigentes se consultan y descargan mediante el token público existente; los revocados
se muestran como inválidos y no se descargan.

Las valoraciones usan `course_ratings` y RPC específicas. Solo una matrícula `completed` puede
crear o editar una valoración de 1 a 5 estrellas. Retirarla realiza soft delete y no afecta el curso
ni su certificado.
