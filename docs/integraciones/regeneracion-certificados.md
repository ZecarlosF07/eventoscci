# Corrección de nombres y horas académicas de certificados

## Excepción auditada a los snapshots

Los snapshots continúan siendo inmutables durante las ediciones ordinarias. Una excepción es
la corrección administrativa explícita del nombre de una persona: primero se actualiza `people` y,
desde su ficha, se regeneran los certificados vigentes cuyo `participant_name_snapshot` todavía no
coincide con el nombre actual.

La operación conserva el `id`, `certificate_code`, `access_token`, fecha de emisión y los demás
snapshots. Los certificados revocados nunca se regeneran. Cada cambio queda registrado como
`certificate.regenerated` con el estado anterior y posterior.

## Reemplazo seguro del archivo

El servidor reutiliza el motor PDF y la plantilla original del certificado, aunque esté inactiva.
Si la plantilla fue eliminada o falta alguno de sus recursos, ese certificado queda pendiente y no
se sustituye por otra plantilla.

El nuevo PDF se carga primero en una ruta versionada del bucket privado. La RPC
`replace_certificate_document()` bloquea la fila, comprueba persona, nombre, estado y ruta previa,
y cambia de forma atómica el snapshot y el `file_path`. Después se elimina el archivo anterior. Un
fallo previo limpia el archivo nuevo; un fallo al retirar el anterior se comunica como advertencia,
sin dejar inaccesible el documento corregido.

La regeneración no crea eventos en `notification_outbox`: el código y el enlace público existentes
continúan funcionando, por lo que no se reenvían correos.

## Experiencia administrativa

`/admin/certificados` redirige al selector paginado de actividades. La navegación del módulo usa
tarjetas hacia emisión, plantillas, accesos y consultas por DNI. Los certificados de una persona,
incluida su revocación y regeneración, se administran desde su ficha institucional.


## Corrección de horas de una actividad

Al configurar certificado incluido u opcional, las horas académicas son obligatorias y deben ser mayores que cero. El formulario, Zod, el trigger de actividades, la preparación SQL y el motor PDF validan esta regla. La validación no rellena actividades ni certificados históricos.

Para corregir horas ya emitidas, primero guardar el valor oficial en la ficha de la actividad. Después abrir `/admin/certificados/actividades/<id>` y utilizar **Regenerar por horas académicas**, comprobando el valor indicado antes de confirmar. Mantener la página abierta mientras procesa lotes de 20. Se corrigen solo certificados de actividad vigentes, con PDF disponible y snapshot de horas diferente del valor actual. No afecta cursos, certificados revocados, actividades archivadas ni certificados sin documento finalizado. Si se interrumpe, repetir procesa los pendientes y no duplica los corregidos.

La RPC `replace_activity_certificate_hours` verifica permisos internos, actividad, horas actuales y ruta previa bajo bloqueo. La corrección explícita reemplaza exclusivamente `academic_hours_snapshot` y `file_path`, conservando nombre, título, condición, fechas, plantilla, código, token y fecha de emisión. Queda auditada como `certificate.hours_corrected`. La modificación ordinaria de una actividad no altera sus certificados.

Se genera y carga primero el PDF corregido con la plantilla original, aunque esté inactiva. El cambio de snapshot y ruta es atómico; los errores de archivo o concurrencia se muestran como pendientes. El archivo anterior se retira después del reemplazo y los fallos de limpieza se informan. No se crean notificaciones ni se reenvían correos; los enlaces públicos conservan su identidad.
