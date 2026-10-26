# HITO 19 — PRIVACIDAD Y AUTORIZACIONES DE DATOS PERSONALES

Estado inicial: **Planificado** — 26/10/2026.

Estado actual: **Implementado y validado; pendiente publicación, comprobación final con sesión administrativa y activación de obligatoriedad SQL**. No marcar terminado antes de esos pasos.

## Objetivo y recorridos

Una política breve en `/privacidad` y dos casillas independientes: tratamiento necesario obligatorio y publicidad opcional por correo y WhatsApp. Ambas desmarcadas. Contacto: **comercial@camaraica.org.pe**. Inscripciones individuales, grupos de asociados y cuentas del Campus quedan cubiertos. En grupos cada aceptación comprende a todos los asistentes y declara autorización del representante. Las cuentas anteriores aceptan antes de una nueva matrícula, sin bloquear cursos concedidos.

## Requisitos y textos

El texto exacto versionado se encuentra en `src/features/privacy/constants/privacy-policy.json`. La política abre en otra pestaña sin perder el formulario. No aceptar publicidad no impide el registro. Desmarcarla en otro registro no revoca una autorización anterior. Las bajas se gestionan manualmente por el correo de contacto y se registran desde la ficha administrativa. No se crean campañas ni envíos promocionales automáticos.

## Datos, permisos y auditoría

Versiones de política inmutables e historial de aceptaciones por persona/finalidad, con texto de referencia, origen, fecha del servidor y vínculo de inscripción, grupo o cuenta. Distinguir aceptación propia, declaración del representante y baja administrativa. RLS desde la creación, ninguna escritura directa pública y operaciones transaccionales por RPC. La ausencia de aceptación o una versión antigua se rechaza antes de modificar datos. No se atribuyen aceptaciones a históricos. Mantener idempotencia grupal, precios, comprobantes, pases y certificados. Los contactos promocionales deben tener autorización vigente.

## Etapas

- [x] Esquema compatible, política versionada, RPC y RLS.
- [x] Página pública, pie del portal y casillas reutilizables accesibles.
- [x] Integración individual, grupal, Auth y nuevas matrículas del Campus.
- [x] Ficha administrativa, bajas auditadas y contactos promocionales autorizados.
- [x] Pruebas unitarias, SQL transaccionales, lint, typecheck y build.
- [x] Migración aplicada sin seeds y tipos regenerados.
- [ ] Frontend publicado y comprobado.
- [ ] Activación explícita de la exigencia SQL después del despliegue.

## Conformidad

Seguir `.agents/rules.md`: Tailwind sin CSS de componentes, tipos separados, componentes de hasta 170 líneas, utilidades por dominio y Yarn. Consultar las guías instaladas de Next.js. Actualizar análisis funcional, diseño técnico, diccionario de datos, índice de hitos y matriz de aceptación. Depende de los recorridos existentes de los hitos 3, 6, 7, 11, 13 y 15.

## Pruebas y finalización

Aceptación ausente, válida y obsoleta; publicidad rechazada; representante por grupo completo; cuenta nueva y anterior; curso ya concedido; rechazos sin personas/cupos/matrículas/notificaciones; reintentos sin duplicados; permisos; baja y exclusión de contactos. Revisar móvil, escritorio y teclado. SQL con rollback. Hito completo solo con recorrido publicado, exigencia activada y evidencia registrada.

## Excepción acordada de Analytics

No agregar aviso de cookies ni modificar su funcionamiento actual. Informarlo en la política sin registrar una aceptación automática. El consentimiento de analítica queda pendiente y no se considera resuelto por este hito. No se incorporan autorizaciones de fotografías, términos extensos ni marketing automático.

### Ajuste de textos durante revisión

Las casillas usan textos breves. La publicidad dice «Quiero recibir información de próximos eventos, capacitaciones y cursos por correo y WhatsApp.» La explicación para retirar autorización permanece en la política, sin repetirse junto a la casilla. La versión `2026-10-26.v2` conserva la primera versión como historial inmutable.

## Evidencia de implementación — 26/10/2026

- Migraciones `202610260001_privacy_consent.sql` y `202610260002_privacy_short_notices.sql` revisadas con dry-run y aplicadas en Supabase vinculado, sin seeds; tipos regenerados después de añadir tablas y RPC. La segunda migración conserva la copia v1 inmutable y activa los textos breves v2.
- 279 unitarias aprobadas, además de `yarn lint`, `yarn typecheck`, `yarn build` y `git diff --check`.
- Suite 042: 61 comprobaciones SQL aprobadas con `finish(true)` y rollback, incluida versión v2. Regresión 006/007/025/027/033/035/036: 280 comprobaciones. Total: 341, sin cuentas, inscripciones o notificaciones de prueba persistentes.
- Navegador: política y registro de cuenta a 375 px sin desbordamiento; ambas casillas desmarcadas y publicidad opcional; enlace en otra pestaña conserva el borrador. Formulario individual del evento Hub TecnológICA: error de privacidad conectado mediante ARIA y foco en la casilla, sin registro enviado; revisión posterior con los textos v2 resumidos. En escritorio a 1440 px se confirmó ausencia de desbordamiento y que solo la casilla de inscripción es obligatoria.
- No se crearon cuentas reales, no se enviaron comunicaciones ni se activaron workflows.

## Publicación y activación pendientes

1. Publicar el frontend actualizado por el proceso habitual del usuario.
2. Comprobar política, inscripciones individuales/grupales, nueva cuenta y matrícula de una cuenta anterior; desde una sesión interna comprobar constancias, baja y exportación autorizada.
3. Ejecutar la suite 042 durante la fase compatible. Después, **solo tras publicar y comprobar**, ejecutar `supabase db query --linked -f supabase/rollouts/enable_privacy_consent.sql`.
4. Verificar rechazo de formularios antiguos sin aceptación y recarga, y conservación de accesos ya concedidos. La suite 042 completa presupone la fase compatible: no ejecutarla sin adaptar en una base ya activada ni desactivar la protección global para probar. Las regresiones posteriores de ambas fases deben realizarse en un entorno de prueba.
5. Registrar las evidencias productivas y cerrar el hito. El consentimiento de Analytics continúa como excepción pendiente.

La guardia `privacy_consent_enforced()` se mantiene en **false** hasta ese despliegue. Los nuevos formularios y acciones sí validan ya explícitamente la aceptación. No se atribuyen autorizaciones a inscripciones anteriores.
