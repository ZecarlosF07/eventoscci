# Corrección de nombres y regeneración de certificados

## Excepción auditada a los snapshots

Los snapshots continúan siendo inmutables durante las ediciones ordinarias. La única excepción es
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
