# Inscripción estudiantil configurable

En eventos y capacitaciones, **Participación y cupos → Permitir inscripciones de estudiantes** permite habilitar ambos perfiles o aceptar únicamente **Profesional o empresario**. La opción nace activada y la migración mantiene todas las actividades existentes habilitadas. La restricción solo verifica el perfil declarado, sin acreditar vínculo laboral, revisar universidades ni añadir aprobación manual.

`activities.allows_student_registration` es un booleano obligatorio con valor predeterminado `true`. La RPC administrativa mantiene sus controles de permisos y envoltorios existentes, acepta valores booleanos explícitos y conserva el valor al recibir una edición antigua que omite el campo. Un cambio explícito queda auditado como `activity.student_registration_policy_changed`. En actividades exclusivas para asociados, el control se oculta y se transmite su valor guardado.

Las consultas públicas incluyen la opción. La acción administrativa invalida las etiquetas y rutas públicas existentes; la nueva versión de caché impide reutilizar objetos anteriores sin el campo. El detalle y el formulario restringido muestran **Actividad dirigida a profesionales y empresarios**. Los campos académicos se excluyen y se conserva la obligatoriedad de empresa, RUC y cargo.

La acción de inscripción comprueba la configuración vigente. La función interna de PostgreSQL repite el control bajo el bloqueo de la actividad y antes de escribir personas, inscripciones, asistencia, auditoría o notificaciones. Un perfil estudiante rechazado conserva el código `STUDENT_REGISTRATION_NOT_ALLOWED`; el mensaje indica actualizar la página para revisar los requisitos. No se convierte un envío estudiantil en profesional. Los formularios abiertos antes de una restricción se rechazan al enviarse.

Se conservan los envoltorios de facturación y certificados, el formulario grupal, las tarifas, la confirmación automática de actividades gratuitas y los registros históricos. No se añaden snapshots de política ni campos nuevos a Excel, correos o certificados.

## Publicación

Aplicar `202609300004_activity_student_registration_policy.sql` sin seeds, regenerar los tipos vinculados y ejecutar `035_activity_student_registration_policy_test.sql` junto con las regresiones de perfiles profesionales, facturación y grupos. Publicar el frontend después de la migración. Solo entonces desactivar la opción en las actividades deseadas; ninguna actividad se restringe automáticamente durante el despliegue.
