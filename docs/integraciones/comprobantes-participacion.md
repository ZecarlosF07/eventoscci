# Datos para comprobantes de participación

## Alcance y recorrido

Dentro de **Participación → actividad → Pagos** hay dos vistas: **Validar pagos** y **Datos para comprobantes**. La segunda prepara datos para emisión externa: no confirma pagos, emite comprobantes ni guarda números, archivos o estados de emisión. No incluye certificados opcionales, cursos del Campus ni cambios al header.

Los eventos exclusivos se agrupan por RUC asociado. Cada empresa despliega sus solicitudes independientes, incluidas las de un solo asistente. Las capacitaciones, aun exclusivas, y las actividades abiertas conservan inscripción y pago individual. El historial individual anterior a la exclusividad no se transforma en un grupo.

El listado inicia sin restringir estado ni comprobante. Incluye solicitudes pendientes, parcialmente pagadas, completas y canceladas; excluye personas/inscripciones eliminadas y actividades archivadas/eliminadas. La empresa asociada y el destinatario del comprobante se identifican por separado; nunca se fusionan solicitudes por compartir RUC.

Se muestran importes históricos de participación, dinero efectivamente validado, saldo, cortesías y confirmaciones anteriores sin pago registrado. El total solicitado conserva plazas canceladas para representar su historial; el saldo pendiente las excluye. Una cortesía confirmada no convierte por sí sola una solicitud impaga en «Pago parcial».

## Búsqueda, paginación y exportación

Los filtros compactos utilizan el buscador automático compartido: 350 ms al escribir; selectores inmediatos; URL sin recarga completa. Buscar por código, participante/asistente, DNI o CE, empresa, RUC asociado o documento/nombre del destinatario. `%` y `_` se tratan como texto literal. El detalle abierto y su borrador se mantienen al filtrar, con una advertencia de que pueden quedar fuera de los resultados.

La paginación se resuelve antes de renderizar: 20 solicitudes individuales, o 20 empresas y 20 solicitudes dentro de la empresa desplegada. Los conteos de empresas son completos en PostgreSQL. La búsqueda y los filtros de comprobante/situación se comparten entre listado, agrupación y exportación.

El CSV contiene **una fila por solicitud**, sin multiplicar importes por asistentes y con protección contra fórmulas mediante `csvCell`. Exporta todos los resultados filtrados, no solo la página o empresa desplegada; no utiliza la selección del detalle como filtro. Tiene un límite explícito de 5.000 solicitudes y requiere sesión interna activa. Durante una actualización de filtros se bloquea la exportación. «Copiar datos» copia exclusivamente el código y destinatario del comprobante, no el RUC asociado, y anuncia éxito o error de forma accesible.

## Formulario individual y validación

En una inscripción individual con precio de participación positivo, después de los datos personales aparecen dos opciones de selección única:

- **Boleta:** DNI de ocho dígitos, nombres y apellidos.
- **Factura:** RUC de once dígitos, razón social y dirección fiscal.

El destinatario puede ser distinto del participante y su empresa. La copia de datos ingresados requiere un botón explícito; un CE nunca se copia como DNI. Al alternar opciones se conservan borradores en memoria y solo se envían campos aplicables. Los errores se muestran junto al campo y se enfoca el primero inválido. No se añaden asistentes al formulario individual.

No se solicitan ni persisten datos de comprobante con precio de participación cero, incluidos grupos totalmente cubiertos por pases. El interés o precio de un certificado opcional no altera esta regla.

El payload JSON de `register_activity` incluye `billing`. El formulario y el servidor comparten validación; el servidor vuelve a consultar el precio aplicable. PostgreSQL repite validación y guarda inscripción, asistencia, outbox y comprobante en la misma transacción. Se conserva el circuito grupal existente.

## Persistencia, correcciones y privacidad

`registration_billing_details` guarda el destinatario individual ligado por clave única a la inscripción. Los grupos mantienen sus campos en `member_group_requests`. No hay relleno retrospectivo: los individuales anteriores aparecen como **Sin datos de comprobante**, sin editor para agregar datos faltantes.

`participation_billing_requests` es una vista `security_invoker`, apoyada en los criterios de pagos existentes. `get_participation_billing_companies` agrega y pagina por RUC. Ambos requieren permisos internos; la tabla individual tiene RLS, lectura interna y ninguna escritura directa de `authenticated`.

`correct_participation_billing` centraliza las correcciones de datos existentes. Exige motivo de 2–500 caracteres, valida documentos y bloquea la fila antes de actualizar. La auditoría conserva responsable, fecha, valores anteriores/nuevos y motivo. No agrega datos a históricos individuales ni grupos de importe cero sin comprobante. El detalle grupal y el detalle de pago solo muestran información y enlaces al editor central.

Estos datos no se agregan a analítica, correos, payloads de n8n ni resultados públicos de inscripción. Las exportaciones envían `Cache-Control: private, no-store` y vuelven a comprobar una cuenta interna activa.

## Despliegue coordinado

Migraciones aditivas `202609280006_participation_billing.sql` y `202609280007_participation_billing_hardening.sql`: revisadas con `supabase db push --linked --dry-run`, aplicadas sin seeds y con tipos vinculados regenerados. No se backfillearon inscripciones.

La obligatoriedad global se activa **después** de publicar y comprobar el frontend actualizado. Hasta entonces, un cliente anterior que omita por completo la clave `billing` mantiene compatibilidad; los clientes nuevos que envíen la clave deben aportar datos válidos si hay cobro. Esto es una ventana de transición, no el estado final del requisito.

Una vez desplegado el formulario, ejecutar el archivo explícito `supabase/rollouts/enable_registration_billing.sql` con el CLI vinculado. Cambia `registration_billing_enforced()` a `true`. Desde entonces ninguna RPC individual, ni una inserción directa nueva con precio positivo, puede omitir el comprobante: un trigger diferido comprueba la integridad al finalizar la transacción. Los registros históricos no se modifican.

La activación **no se ha ejecutado** en esta entrega porque el frontend productivo todavía no se ha desplegado. No ejecutar el rollout anticipadamente ni activar la regla solo por haber aplicado las migraciones. Las pruebas SQL ejercitan la activación dentro de una transacción con rollback, sin activarla globalmente.

## Verificación

Consultar la sección «Datos para comprobantes» en la [matriz de aceptación](../produccion/matriz-pruebas-aceptacion.md). Las suites SQL no dejan inscripciones, cobros ni correos reales; no sustituyen una prueba de entrega desde n8n ni el recorrido integral del formulario publicado.
