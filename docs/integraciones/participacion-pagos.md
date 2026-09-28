# Participación: pagos por actividad

## Recorrido administrativo

Elegir una actividad en Participación y utilizar **Inscripciones · Pagos · Asistencia**. El header y las reglas comerciales de los Hitos 14, 15 y 16 no cambian. Esta organización sustituye las antiguas colas globales y las acciones monetarias de Inscripciones, Asistencia y detalle grupal; no es un módulo principal adicional.

- **Inscripciones:** personas, estados, búsqueda, exportación, solicitud de interés de certificado y operaciones no monetarias. «Ver pago» abre la solicitud correspondiente dentro de Pagos.
- **Pagos de participación:** una fila por grupo o inscripción individual, saldo y plazas pendientes, importe validado, cortesías y antigüedad. Pendientes por defecto; búsqueda por código, nombre, documento, correo y ambos RUC. Filtrado individual/grupal, estado y paginación estable de 20 solicitudes, de antiguas a recientes. El detalle se abre en la misma página, conservando filtros y paginación.
- **Certificados opcionales:** sección separada con contador, saldo, filtro y paginación propios. Los solicitados con participación pendiente dicen «Requiere confirmar participación». Se conservan los requisitos de verificación y reversión con motivo y bloqueo después de emisión. Registrar interés continúa disponible en Inscripciones y Asistencia; sus verificaciones/reversiones solo se ofrecen en Pagos.
- **Asistencia:** se mantienen las operaciones existentes. Su información comercial enlaza a Pagos.

Cada tarjeta diferencia **solicitudes con pago pendiente** de **plazas pendientes**. Un grupo de cinco personas impagas son una solicitud y cinco plazas. Los certificados no se suman a esos números; se presentan por separado. «Todas con pagos pendientes» localiza también actividades terminadas con saldo de participación o de certificados.

La mejora de buscadores del 28/09/2026 separa el periodo del checkbox «Solo con pagos pendientes»: pueden combinarse. Los enlaces antiguos `periodo=payments` siguen siendo compatibles. La pestaña Pagos exporta solicitudes de participación filtradas, individuales y grupales, sin mezclar cobros de certificados. El CSV grupal original conserva su ruta por compatibilidad. Consultar [Búsquedas administrativas](busquedas-administrativas.md) para filtros, selección y evidencia actualizada.

## Fechas operativas

«Próximas y en curso» usa `operational_ends_at`: máximo del fin de las sesiones activas. Sin hora de fin, se usa la medianoche siguiente al día de esa sesión en **America/Lima**, excluida del periodo. Con fin exacto en el instante actual la actividad deja de ser próxima/en curso. Actividades sin fechas solo aparecen en Todas o en el filtro de pagos si tienen deuda; finalizadas y canceladas no son próximas/en curso.

`next_date` sigue significando siguiente inicio futuro y `last_date` conserva el último inicio. No se cambian el catálogo público, el cierre de inscripción ni las reglas públicas de disponibilidad.

## Persistencia y validación

Las vistas `participation_payment_requests`, `certificate_payment_requests`, `activity_payment_totals` y `activity_participation_summary` comparten la definición de cobros pendientes. Excluyen actividad archivada/eliminada, persona eliminada, inscripción eliminada, cancelación y cortesía de los saldos pendientes. Los agregados globales se resuelven en PostgreSQL mediante `participation_global_metrics`, sin descargar hasta 1.000 actividades para sumarlas en el navegador/servidor.

`individual_registration_payments` guarda inscripción única, importe exacto del snapshot, referencia obligatoria, nota opcional, responsable, fecha, hash y clave de idempotencia. `verify_individual_registration_payment` bloquea la plaza e inserta pago, confirmación, auditoría y outbox en una transacción. Repetir la misma clave/datos devuelve el pago existente; reutilizarla con otros datos falla. Un segundo pago para la misma plaza o un importe diferente se rechaza. No existen abonos parciales para una plaza individual.

`confirm_registration` ya no confirma una inscripción individual pagada pendiente sin un registro de pago. La función privada anterior no es ejecutable por roles del API. Las plazas grupales siguen utilizando exclusivamente `verify_member_group_payment`, con selección de plazas completas pendientes con precio positivo y referencia obligatoria. No se modifican cuotas, pases, cancelaciones, transferencias ni datos de comprobante.

Se conserva la operación sobre inscripciones individuales históricas anteriores al cambio de exclusividad; el trigger sigue rechazando nuevas plazas individuales en eventos exclusivos y cambios de actividad que intenten eludirlo. Las confirmaciones antiguas sin referencia se muestran como tales; no se crean pagos ni referencias ficticias retroactivas.

Todas las tablas nuevas tienen RLS, lectura interna y ninguna escritura directa de `authenticated`. Las vistas usan `security_invoker`. El servidor comprueba sesión interna y valida entradas; PostgreSQL repite permisos, importes, estados e idempotencia. Las notificaciones se entregan solo ante una operación nueva; ante un fallo de entrega, la outbox permite reintento sin revertir el pago.

## Rutas y compatibilidad

Ruta canónica: `/admin/inscripciones/[activityId]/pagos`. Selección de solicitud mediante `solicitud`; selección de certificado mediante `certificado`. Los parámetros mantienen ambos filtros/páginas independientes.

`pendientes`, `preinscritos` y `solicitudes` redirigen a Pagos cuando incluyen una actividad válida. Sin actividad vuelven al selector con «Todas con pagos pendientes». `confirmados` conserva el contexto de inscripciones si hay actividad, o lleva al selector completo. Se mantienen los filtros compatibles; no se aplica una búsqueda de documentos a títulos de actividades. El detalle `/solicitudes/[id]` permanece para comprobante, asistentes, cancelaciones, transferencias e historial, sin formulario de pago. Las exportaciones existentes permanecen disponibles: Inscripciones conserva el CSV de participantes y Pagos enlaza al CSV de todos los grupos de la actividad, identificado como exportación completa (no de los filtros de pagos).

## Migraciones y verificación

- `202609280001_activity_payments_workspace.sql`: ledger, RPC individual y vistas operativas.
- `202609280002_activity_payment_totals.sql`: saldos completos y separados por actividad.
- `202609280003_historical_individual_payment_compatibility.sql`: compatibilidad de historial sin permitir nuevas inscripciones individuales exclusivas.

Antes de aplicar cada migración se revisó `supabase db push --linked --dry-run`; se aplicaron sin seeds y se regeneraron los tipos con `yarn types:db:linked`. Las pruebas SQL usan `rollback`; no dejan fixtures, cobros ni correos reales.

Evidencia automatizada y pruebas integrales pendientes: consultar `docs/produccion/matriz-pruebas-aceptacion.md`. La revisión visual/accesible autenticada, concurrencia de sesiones reales y entrega real de correos no se sustituyen por las pruebas unitarias ni por la outbox SQL.
