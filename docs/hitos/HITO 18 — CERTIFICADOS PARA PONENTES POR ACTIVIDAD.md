# HITO 18 — CERTIFICADOS PARA PONENTES POR ACTIVIDAD

## Objetivo y recorrido

Reconocer a los ponentes de eventos y capacitaciones con un certificado institucional por actividad. Se gestiona en **Certificados → Certificados de ponentes → actividad**. Catálogos conserva el perfil y el correo privado; la asignación y su rol proceden de la actividad.

El personal selecciona una plantilla activa de actividades, revisa los roles, selecciona uno o varios ponentes y confirma la emisión. No se crean inscripciones ni personas ficticias. No se exige pago, asistencia, cuenta ni horas académicas. Se puede emitir desde borrador; una actividad archivada es de solo lectura.

## Documento e historial

- Se reutilizan fondo, firmas, QR, almacenamiento privado y acceso por token de los certificados actuales.
- Redacción: «En reconocimiento a su valiosa participación como [rol] en [actividad]».
- El rol se precarga desde la actividad o «Ponente»; puede ajustarse antes de emitir sin cambiar la actividad.
- «Editar nombre» permite completar o quitar tratamientos del nombre impreso antes de emitir (2–241 caracteres). El cambio se guarda solo en el snapshot del certificado, no en Catálogos. Los reintentos y la regeneración conservan ese nombre. La ampliación compatible está en `202610230001_speaker_certificate_name_override.sql`.
- No se imprimen horas, aunque la actividad las tenga. Se respeta la configuración de fechas de la plantilla.
- El código usa `CCI-PON-año-secuencia`.
- Se conservan nombre, título, rol, fechas y una copia de plantilla/firmantes al preparar el certificado. La regeneración utiliza estos datos originales y conserva código y token.
- Retirar al ponente de la actividad no elimina el historial emitido. Los documentos siguen accesibles mediante su token mientras la actividad no esté archivada, conforme a la política vigente de certificados de actividades.

## Modelo y permisos

La migración `202610220001_speaker_activity_certificates.sql` añade `recipient_type` (participant/student/speaker), `activity_id`, `speaker_id`, `template_snapshot` y bloqueo temporal de generación. Mantiene `certificate_type` activity/course y clasifica los datos históricos. Los certificados de cursos nuevos conservan compatibilidad mediante un trigger.

Solo los certificados de ponentes permiten `person_id` nulo y exigen actividad/ponente sin inscripción ni matrícula. Una restricción única evita duplicados por actividad/ponente. RPC protegidas con el permiso interno vigente consultan, preparan, reclaman, finalizan y regeneran. Anónimos y estudiantes carecen de acceso administrativo. No se exponen correos privados en la verificación pública.

Se procesa una persona por llamada para limitar la duración en Vercel. Un bloqueo de cinco minutos evita dos generaciones simultáneas. Si se cierra la ventana, los terminados permanecen disponibles y los pendientes pueden seleccionarse para recuperar; no se borra el certificado preparado ni se cambia su snapshot. La finalización vuelve a comprobar actividad y asignación. Regenerar sustituye el archivo con comparación del estado anterior; revocar exige motivo y conserva auditoría.

## Entrega

La emisión requiere un correo privado válido y crea una notificación idempotente `speaker_certificate_issued`, entregada mediante el flujo n8n existente. Sin correo no se permite preparar ni recuperar/finalizar certificados pendientes; la pantalla indica «Correo pendiente · necesario para emitir», sin opción de entrega manual. Si falla el envío, el PDF queda disponible y se reintenta desde Notificaciones. Los certificados históricos ya emitidos conservan sus enlaces y descargas aunque no tengan correo.

Esta regla sustituye la entrega sin correo del planteamiento original. La migración compatible `202610230003_speaker_certificate_email_required.sql` aplica las validaciones también a clientes antiguos y escrituras directas de preparación/finalización. La finalización bloquea la fila de contacto y crea la notificación con el correo vigente. Un perfil puede guardarse sin correo; la obligatoriedad se aplica al emitir. No requiere cambios en n8n ni en los PDF.

El personal dispone de ver, descargar y copiar enlace; también de regenerar y revocar mientras la actividad permita operaciones. La ampliación por DNI permite consultar certificados de ponentes en la búsqueda pública y en Mis certificados del Campus sin vincularlos artificialmente a `people`.

## Ampliación: consulta por DNI y Campus

La migración compatible `202610230002_speaker_certificate_dni_lookup.sql` incorpora una identidad privada uno-a-uno en `speaker_identity_documents`, independiente de correo/teléfono. El DNI peruano de ocho dígitos se conserva como texto (incluidos ceros iniciales) y es único aun si el perfil está inactivo. No se admiten CE, fusiones de perfiles ni cuentas automáticas.

- **Catálogos y creación rápida:** permiten guardar un perfil sin DNI. La creación con documento es atómica; un conflicto no deja otro perfil creado. En un perfil existente el DNI se guarda por separado, sin que editar nombre, correo o teléfono lo sobrescriba.
- **Certificados de ponentes:** la columna «Datos del ponente» reúne DNI y modo de entrega, con «Completar datos» / «Editar datos». Abre un diálogo en la misma pantalla para actualizar correo, teléfono, nombres, organización y el resto del perfil compartido, reutilizando Catálogos. El DNI se guarda en una sección independiente con los permisos y auditoría existentes. Sin documento no se puede preparar ni recuperar/finalizar pendientes, también por RPC o clientes antiguos. Actividades archivadas siguen siendo de solo lectura. Guardar datos no emite ni reenvía certificados anteriores; el correo actualizado se usa al emitir.
- **Identidad frente a nombre impreso:** «Editar nombre» solo cambia el snapshot previo a emitir. El DNI vincula el historial, nunca se deduce de nombres, tratamientos, correo o teléfono.
- **Permisos:** operadores y administradores registran el primer DNI. Si ya hay certificados preparados o emitidos, solo un administrador puede corregirlo, indicando motivo y confirmando el traslado de todo el historial al documento corregido. No se puede quitar el DNI con historial; sin historial se permite corregirlo o retirarlo. La base serializa cambios y rechaza ediciones obsoletas.
- **Auditoría:** registro/corrección guardan usuario, fecha, valores anterior/nuevo, motivo y confirmación. Las escrituras directas a identidad están revocadas; las mutaciones pasan por RPC protegidas. Los conflictos muestran al personal autorizado el perfil relacionado para revisión manual.
- **Históricos:** los certificados emitidos sin DNI conservan token/QR/descarga. Completar posteriormente el documento incorpora todo su historial finalizado, sin regenerar PDF ni modificar nombres, códigos, fechas o tokens. Una corrección cambia la asociación del historial completo, no el documento emitido.
- **Consulta pública:** combina participantes, cursos y ponentes, aunque no haya una persona en `people` para ese DNI. Conserva auditoría y límite de 60 consultas por IP en 10 minutos; no devuelve DNI, teléfono ni correo privado.
- **Campus:** obtiene la persona de la sesión activa y compara únicamente documentos de tipo DNI. Una cuenta posterior con el mismo DNI recupera el historial; una cuenta CE con la misma numeración no lo recibe. No acepta un DNI del navegador como prueba de propiedad ni concede lectura de la identidad privada al estudiante.
- **Resultados:** se ordenan por emisión e ID, sin duplicar certificados. Las tarjetas distinguen «Ponente» y su rol y conservan el nombre impreso. Solo se incluyen ponentes con PDF finalizado; los revocados siguen visibles sin descarga, los eliminados y actividades archivadas quedan excluidos conforme a la política vigente.
- **Accesos públicos:** la página por token del ponente ofrece consulta por DNI e invitación al Campus. No cambia el mecanismo de descarga segura.

No requiere cambios adicionales de n8n, correo ni PDF. Aplicar la migración y regenerar tipos antes del despliegue habitual del frontend. Pruebas de ampliación: `040_speaker_certificate_dni_lookup_test.sql` y `tests/unit/speaker-certificate-dni.test.ts`, además de regresión de emisión, búsqueda pública, certificados de cursos y archivo.

Estado del 23/10/2026: `202610230002` aplicada en Supabase, RLS comprobado y tipos regenerados. Aprobadas 193 comprobaciones SQL con rollback (65 de ampliación y 128 de regresión), 261 unitarias, lint, typecheck y build. Sin registros de prueba persistentes. Publicación del frontend y comprobación visual administrativa posteriores al despliegue.

## Verificación y despliegue

- Pruebas SQL transaccionales: `supabase/tests/038_speaker_certificates_test.sql`.
- Pruebas unitarias del PDF, validación de roles y correo, además de la batería existente.
- Ejecutar `yarn test:unit`, `yarn lint`, `yarn typecheck` y `yarn build`.
- Aplicar la migración antes de desplegar el frontend y regenerar los tipos desde la base al desplegar.
- Actualizar el nodo «Preparar correo» con el código legible o importar el workflow actualizado antes de emitir.
- Probar con una actividad controlada y ponentes con correo válido, ausente e inválido: solo los primeros pueden emitirse. Verificar reintentos, descarga, QR, revocación y bloqueo por archivo; los certificados históricos sin correo se conservan. Prueba SQL específica: `041_speaker_certificate_email_required_test.sql`.

La implementación local no activa workflows ni envía correos de prueba a personas reales.

### Validación de implementación

La migración y la prueba SQL se validaron inicialmente en PostgreSQL embebido. El 23/10/2026 se aplicó `202610220001` a la base Supabase vinculada y se ejecutó `038_speaker_certificates_test.sql`: 22 comprobaciones aprobadas, con rollback de todos los registros de prueba. Se verificó la conservación de los 259 certificados existentes y la ausencia de certificados, notificaciones o actividades de prueba persistentes. Los tipos TypeScript se regeneraron desde el esquema remoto. El nodo «Preparar correo» de n8n fue actualizado por el usuario. El frontend requiere su despliegue habitual.
