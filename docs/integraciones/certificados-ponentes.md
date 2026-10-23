# Certificados de ponentes

La sección **Certificados → Certificados de ponentes** usa los perfiles de Catálogos y las asignaciones existentes de cada actividad. Admite emisión individual o múltiple, rol ajustable, recuperación de pendientes, descarga, enlace público, regeneración y revocación.

## Consulta por DNI y Campus

### Edición del perfil desde emisión

La columna «Datos del ponente» reúne DNI y correo. Sin correo válido muestra «Correo pendiente · necesario para emitir» y no permite seleccionar al candidato. «Completar datos» / «Editar datos» carga bajo demanda un diálogo accesible con el formulario reutilizado de Catálogos: nombres, apellidos, correo, teléfono, organización, cargo, especialidades, biografía, enlaces, notas y fotografía. El correo y teléfono aparecen al principio del perfil; la fotografía conserva sus validaciones y límite de 5 MB.

El DNI se guarda en una sección independiente dentro del mismo diálogo, con sus permisos, confirmación y auditoría existentes. Los demás datos se guardan en el perfil compartido de Catálogos sin navegar fuera de la actividad. Se verifica sesión interna, relación con actividad o certificado histórico y actividad no archivada tanto al cargar como al guardar. El guardado del formulario no dispara la emisión del formulario padre.

Al guardar, la tabla actualiza DNI, organización y modo de entrega sin perder la selección. El nombre predeterminado cambia con el perfil antes de preparar, mientras que un nombre personalizado y los snapshots preparados/emitidos se conservan. Añadir correo habilita próximas emisiones automáticas; guardar un correo no reenvía certificados emitidos previamente. No requiere migración nueva ni cambios de n8n.

Validación de esta edición integrada: 269 unitarias aprobadas, incluidas ocho nuevas sobre datos, formulario, nombres, diálogo y guardas del servidor; `yarn lint`, `yarn typecheck`, `yarn build` y `git diff --check` aprobados. No se modificaron perfiles reales ni se enviaron correos de prueba. La comprobación visual interactiva con sesión administrativa queda pendiente del despliegue del frontend.

La ampliación `202610230002_speaker_certificate_dni_lookup.sql` mantiene `speaker_id` como origen y añade `speaker_identity_documents` (privada, RLS, sin escritura directa). Se admite únicamente DNI peruano de ocho dígitos, único incluso para perfiles inactivos; los ceros iniciales se conservan. No crea personas o cuentas artificiales.

RPC administrativas:

- `get_speaker_document_context(uuid[])`: documento y permisos de corrección por ponente; solo personal interno.
- `set_speaker_document(uuid,text,text,text,boolean)`: documento nuevo, documento esperado, motivo y confirmación. Bloquea la fila del ponente, rechaza cambios obsoletos y audita los cambios. Con certificados, la corrección exige administrador, motivo y confirmación; no se permite retirar el documento.
- `create_speaker_with_document(jsonb,text)`: creación atómica de perfil y DNI inicial opcional. Un conflicto devuelve el perfil relacionado al personal autorizado sin crear otro perfil ni fusionar datos.

Catálogos guarda el DNI existente por separado para no perderlo al editar correo/teléfono/nombre. La emisión permite completarlo desde cada candidato y bloquea nuevas preparaciones o recuperación/finalización sin documento, también desde clientes anteriores y escrituras de archivo. Los perfiles pueden guardarse sin DNI, pero no emitir nuevos certificados. Certificados antiguos sin DNI conservan acceso por token; registrar el documento incorpora automáticamente sus PDF finalizados a la búsqueda.

`search_public_certificates_by_dni` combina personas y ponentes sin requerir una fila en `people`. `get_my_certificates` obtiene el documento DNI de la persona de la sesión activa; una cuenta CE no coincide aunque su numeración sea igual. Ambos devuelven ID, `recipient_type` y nombre impreso; solo los ponentes con PDF finalizado aparecen, incluidos revocados sin descarga. Eliminados y actividades archivadas conservan su exclusión. No se exponen DNI, correo o teléfono privados en resultados ni se concede acceso a identidad desde el Campus.

Corregir el DNI traslada todo el historial al nuevo documento sin modificar PDF, snapshots, códigos o tokens. Los resultados están ordenados y sin duplicados, y las tarjetas muestran Ponente y su rol. La página por token incluye enlaces de consulta por DNI y Campus. La descarga y el rate limit/auditoría de búsqueda permanecen sin cambios. No requiere actualizar n8n ni regenerar PDF.

Verificar `040_speaker_certificate_dni_lookup_test.sql`, regresiones `038`, `015`, `010`, `018` y unitarias. Aplicar migración antes del frontend y ejecutar `yarn types:db:linked`.

Validación del 23/10/2026: migración `202610230002` aplicada al proyecto Supabase vinculado, RLS comprobado y tipos regenerados. Pasaron 65 comprobaciones de identidad/búsqueda y 128 de regresión (038: 28, 015: 20, 010: 62, 018: 18), con rollback; no quedaron ponentes ni certificados de prueba. Pasaron 261 unitarias, lint, typecheck y build. El frontend se publica mediante el despliegue habitual; no se envió correo real ni se regeneraron PDF existentes.

Desde el 23/10/2026, la migración `202610230001` admite `full_name` opcional en cada destinatario de preparación. «Editar nombre» permite ajustar el texto impreso antes de emitir, sin modificar Catálogos. Se validan 2–241 caracteres; omitir el dato conserva la compatibilidad con clientes anteriores. La consulta administrativa muestra el snapshot después de emitir y los reintentos no lo reemplazan. No requiere cambios en n8n porque el correo ya utiliza el snapshot del nombre.

Los certificados usan `certificate_type=activity` y `recipient_type=speaker`, con `activity_id` y `speaker_id`. El origen no depende de inscripciones y no exige horas. `template_snapshot` conserva la plantilla y los firmantes elegidos. Los documentos históricos permanecen visibles administrativamente al desvincular un ponente.

La preparación y finalización son idempotentes; una reclamación por certificado dura cinco minutos. Tras una interrupción, recuperar un pendiente conserva sus snapshots. No se garantiza entrega exactamente una vez del proveedor de correo; el outbox evita crear notificaciones duplicadas y mantiene sus herramientas de revisión.

`speaker_certificate_issued` utiliza `activity_title`, `participant_name`, `condition`, `certificate_code` y `certificate_url`. Las emisiones nuevas requieren correo privado válido y siempre crean su notificación; no existe entrega manual para emisiones nuevas. No se añade ningún cron ni workflow adicional. El workflow importable y el código legible deben mantenerse sincronizados.

La migración `202610230003_speaker_certificate_email_required.sql` requiere correo al preparar, reclamar y finalizar pendientes, con bloqueo de la fila de contacto durante la finalización y guardas de escritura. Comparte el patrón de validación con Zod, comprobado por prueba de paridad. Se conserva la consulta, descarga e idempotencia de certificados históricos ya finalizados sin correo. Los errores del proveedor siguen gestionándose en Notificaciones; no se garantiza recepción ni se confunde un certificado disponible con un correo entregado. Regresiones SQL: 038 y 040; prueba nueva: 041.

Validación del 23/10/2026: `202610230003` aplicada y guardia de correo activa en Supabase vinculado; tipos regenerados. Aprobadas 121 comprobaciones SQL con rollback (038: 28, 040: 65, 041: 28), 273 unitarias, lint, typecheck, build y diff-check. No quedaron perfiles de prueba ni se enviaron correos reales. La actualización visual requiere desplegar el frontend; no hay cambios adicionales de n8n.

Despliegue: migración `202610220001`, actualización de «Preparar correo» en n8n y frontend. La prueba SQL es `038_speaker_certificates_test.sql`. El hito completo está en [Hito 18](../hitos/HITO%2018%20—%20CERTIFICADOS%20PARA%20PONENTES%20POR%20ACTIVIDAD.md).

El 23/10/2026 se aplicó la migración a Supabase y pasaron 22 comprobaciones del Hito 18 y 62 del flujo existente de finalización/certificados de cursos, ambas con rollback. Se conservaron los 259 certificados anteriores. Los tipos se regeneraron desde la base; el usuario confirmó la actualización del nodo n8n. El despliegue del frontend es independiente.
