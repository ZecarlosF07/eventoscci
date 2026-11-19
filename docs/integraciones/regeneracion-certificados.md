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


## Corrección de título y horas de una actividad

Al configurar certificado incluido u opcional, las horas académicas son obligatorias y deben ser mayores que cero. El formulario, Zod, el trigger de actividades, la preparación SQL y el motor PDF validan esta regla. La validación no rellena actividades ni certificados históricos.

Para corregir documentos emitidos, guardar el título y las horas oficiales en la ficha de la actividad. Después abrir `/admin/certificados/actividades/<id>` y utilizar **Regenerar título y horas**, comprobando ambos valores antes de confirmar. Mantener la página abierta mientras procesa lotes de 20. La consulta detecta certificados de participantes vigentes con PDF disponible cuando el título, las horas o ambos difieren de la actividad. Detecta cambios de título aunque las horas ya coincidan. Al repetir, se procesan los pendientes.

La RPC `replace_activity_certificate_details` verifica permisos internos, actividad, título y horas actuales y ruta previa bajo bloqueo. La corrección explícita reemplaza `title_snapshot`, `academic_hours_snapshot` y `file_path`, conservando nombre, condición, fechas, diseño, código, token y fecha de emisión. Queda auditada como `certificate.details_corrected`, con valores anteriores y nuevos. Un cambio de título u horas durante la ejecución exige recargar. La RPC anterior `replace_activity_certificate_hours` conserva su contrato para clientes anteriores.

Se genera y carga primero el PDF corregido con la plantilla original, aunque esté inactiva. El cambio de snapshot y ruta es atómico; los errores de archivo o concurrencia se muestran como pendientes. El archivo anterior se retira después del reemplazo y los fallos de limpieza se informan. No se crean notificaciones ni se reenvían correos; los enlaces públicos conservan su identidad.


### Progreso de la corrección

El panel consulta el número real de certificados pendientes y muestra barra, conteo de corregidos sobre el total de la ejecución y porcentaje. Cada lote devuelve su conteo previo y los reemplazos confirmados; el cliente actualiza el progreso después de guardar esos cambios. El porcentaje no alcanza 100% antes de completar el total. Mientras se procesa, muestra actividad y segundos transcurridos; una interrupción o error conserva el progreso parcial. Al reintentar, el total corresponde únicamente a los pendientes restantes.

El contador de corregidos corresponde a la ejecución actual, no al acumulado histórico. Después de cada lote, el servidor consulta nuevamente cuántos siguen pendientes y solo comunica finalización si ese conteo es cero. El panel muestra los pendientes por separado y vuelve a consultarlos incluso ante una interrupción: un lote puede haberse guardado aunque el navegador no reciba su respuesta. No existe un tope de 100 para corregir horas; los lotes de 20 continúan mientras queden pendientes y no haya errores.

La consulta de regeneración incluye `recipient_type`, requerido por el esquema del generador desde los certificados de ponentes. Su omisión provocaba que todos los documentos fallaran antes de generar el PDF. La regresión se comprueba con una respuesta simulada de PostgREST que respeta las columnas solicitadas, y la corrección de título y horas se verifica con SQL transaccional.
