# Hito 20 — Tipos de certificados y firmas personalizables

**Estado:** implementación validada en local y migración aplicada en Supabase. Pendiente publicar el frontend y comprobar el editor con una sesión administrativa en producción.

## Gestión y emisión

- **Catálogos → Tipos de certificados** abre el editor existente. Se conserva el acceso desde Certificados y se agrupan los modelos de Participación, Ponentes y Cursos.
- Los administradores crean, editan, desactivan y retiran modelos. Los operadores autorizados pueden emitir con modelos activos. El catálogo de plantillas y los recursos se mantienen bajo los permisos internos existentes, con escritura administrativa.
- Cada modelo nuevo pertenece a un tipo. Los modelos compartidos anteriores siguen disponibles para participación y ponentes. El predeterminado específico tiene prioridad sobre el compartido. El Campus conserva su selección automática del modelo de curso.
- Antes de desactivar o retirar el último modelo activo de Cursos, el administrador debe activar otro. La base de datos aplica esta regla también al editor anterior.
- El editor permite configurar nombre interno, fondo, encabezado y reconocimiento. El nombre impreso del destinatario, el título, el código y el QR provienen de la emisión. Un reconocimiento personalizado incluye `{{condicion}}` y puede usar `{{titulo}}`. Los textos vacíos usan la redacción institucional.
- Se conservan las condiciones de emisión existentes, incluido DNI y correo para ponentes. El documento de ponentes omite horas académicas y el de cursos omite fechas.

## Firmas y vista previa

- Cada modelo admite de uno a cuatro firmantes. El editor permite cargar o reemplazar su imagen, editar nombre y cargo, quitarlo y moverlo con botones accesibles por teclado.
- Una firma se centra, dos van lado a lado, tres ocupan una fila y cuatro se reparten en dos filas de dos. El generador preserva la proporción de la imagen y ajusta el bloque de texto al espacio disponible antes de dibujar las firmas. Un texto que sigue sin caber o contiene caracteres incompatibles devuelve una indicación para corregirlo.
- Se aceptan PNG, JPG y WebP de hasta 5 MB por archivo. Para firmas se recomienda PNG transparente. El servidor verifica el formato real, normaliza la orientación y convierte WebP a un formato compatible con el PDF. Los firmantes anteriores que carecían de imagen pueden conservarse.
- **Vista previa PDF** usa las imágenes y textos del formulario, con datos de ejemplo y la marca **«Muestra · no válido»**. El mismo generador produce la vista previa y el documento final. La muestra usa un QR de prueba y no crea certificados, consume códigos ni envía correos.

## Historial y publicación

- Las emisiones nuevas guardan una copia del modelo, los textos, el fondo, las firmas, su orden y la versión del diseño. Las regeneraciones usan la copia guardada.
- Los certificados históricos que carecen de copia usan como referencia la plantilla disponible al migrar. Esa referencia puede diferir del diseño original. La migración no modifica sus PDF.
- Los archivos de fondos y firmas se guardan en rutas privadas de solo escritura inicial. Reemplazarlos crea rutas nuevas y conserva los archivos anteriores. Los intentos de guardado interrumpidos pueden dejar archivos sin referencia. Cualquier limpieza debe comprobar también los diseños históricos y los snapshots.
- Una tanda de emisión activa protege el modelo de cambios, desactivación y retiro. Los certificados preparados o emitidos conservan su diseño aunque se retire el modelo posteriormente.
- Verificar las migraciones `202611130002_certificate_template_designs.sql`, `202611130003_preserve_legacy_template_layout.sql` y `202611130004_keep_campus_certificate_model.sql` antes de publicar el frontend. Comprobar el editor en escritorio y móvil con una cuenta de prueba y usar la vista previa.

Los criterios de cierre se registran en la [matriz de aceptación](../produccion/matriz-pruebas-aceptacion.md#hito-20--tipos-de-certificados-y-firmas-personalizables).
