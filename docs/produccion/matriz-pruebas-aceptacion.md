# Matriz de pruebas y aceptación del MVP

## Criterio de salida

No se libera una versión con defectos críticos o altos abiertos. Los resultados se registran como `APROBADO`, `FALLIDO`, `BLOQUEADO` o `NO EJECUTADO`, junto con fecha, commit, ambiente y evidencia.

## Cobertura automatizada

| Área | Evidencia automatizada | Cobertura principal |
|---|---|---|
| Fundación | `001_core_schema_test.sql` | Tablas, constraints, triggers, RLS y catálogos |
| Actividades | `002_activities_schema_test.sql` | Creación, publicación, fechas, precios y exposición pública |
| Inscripciones | `003_registrations_schema_test.sql` | Gratuita, pagada, cupo final, duplicado y periodo cerrado |
| Operación | `004_operational_management_test.sql` | Confirmación, cancelación, asistencia, búsqueda y auditoría |
| Certificados y notificaciones | `005_certificates_notifications_test.sql` | Elegibilidad, snapshots, unicidad, revocación y reintentos |
| Auth | `006_student_authentication_test.sql` | Alta, reutilización de persona, roles y cuenta inactiva |
| Campus | `007_courses_campus_test.sql` | Cursos, contenido, matrícula gratuita y acceso pagado |
| Progreso | `008_lesson_progress_test.sql` | Recuperación, 89/90 %, monotonía y consolidación |
| Quizzes | `009_quizzes_academic_approval_test.sql` | Respuestas privadas, 80 %, intentos e idempotencia |
| Finalización | `010_course_completion_certificates_ratings_test.sql` | Cierre, certificado, rating y revocación |
| Seguridad | `011_security_rls_access_control_test.sql` | Matriz visitante/Student/Operator/Admin y Storage |
| Producción | `012_production_readiness_test.sql` | Agregaciones operativas, permisos e índices finales |
| Regeneración de certificados | `016_certificate_regeneration_test.sql` | Corrección auditada, identidad pública, permisos y listados paginados |
| Certificados opcionales | `020_optional_activity_certificates_test.sql` | Modalidad y tarifa capturadas, solicitud segura e idempotente, auditoría y oferta posterior a la asistencia |
| Solicitud y pago manual del certificado | `023_activity_certificate_payment_tracking_test.sql` | Solicitud administrativa, pago externo verificado, reversión con motivo, permisos, idempotencia y estados comerciales para emisión |
| Perfiles de inscripción y sugerencias | `024_registration_participant_profiles_test.sql` | Profesional, estudiante y asociado; tarifa general estudiantil, snapshots, preservación de datos y sugerencia opcional |
| Eventos exclusivos y padrón | `025_member_group_events_test.sql`, `026_member_roster_version_test.sql` | Inscripción grupal, pagos y reemplazo del padrón |
| Pases gratuitos por empresa | `027_member_company_complimentary_passes_test.sql` | Cuota por RUC, grupo mixto, importe cero, reintentos, cancelación, transferencia y auditoría |
| SEO y rendimiento público | `tests/unit/seo.test.ts` | Metadata, JSON-LD, sesiones múltiples, slugs, búsquedas seguras y analítica sin PII |

Los archivos usan transacciones con `rollback`; no conservan fixtures en la base vinculada.

## Escenarios obligatorios

| Escenario | Recorrido | Evidencia | Estado previo al lanzamiento |
|---|---|---|---|
| A — actividad gratuita | crear → publicar → registrar → confirmar automático → asistencia → certificado → token | 002, 003, 004 y 005 | Ejecutar smoke controlado |
| B — actividad pagada | crear → publicar → preinscribir → confirmar → asistencia → certificado → token | 002, 003, 004 y 005 | Ejecutar smoke controlado |
| C — curso gratuito | publicar → registrar alumno → matricular → progreso → quiz → completar → certificado → valorar | 006 a 010 | Ejecutar smoke controlado |
| D — curso pagado | publicar → alta manual → contenido → progreso → completar → certificado → valorar | 007 a 010 | Ejecutar smoke controlado |

## Hito 15 — Eventos exclusivos para asociados e inscripción grupal

La implementación y las pruebas automatizadas del Hito 15 ya se ejecutaron en local y Supabase vinculado. Los casos integrales siguen **NO EJECUTADOS** hasta completar la revisión visual y accesible en 390/768/1440, un correo real desde el workflow activo de n8n y el recorrido administrativo con un archivo `.xlsx` real. Las pruebas SQL usan transacciones con `rollback` y no dejan datos de prueba.

| Caso | Recorrido y resultado exigido | Evidencia prevista | Estado |
|---|---|---|---|
| H15-01 — Evento no listado | publicar → desactivar «Mostrar en el portal» → abrir enlace directo; ausente de inicio, catálogo, búsqueda, sugerencias y sitemap; metadata `noindex` | SQL, unitarias SEO y smoke público | NO EJECUTADO |
| H15-02 — Padrón | previsualizar Excel válido e inválido → confirmar reemplazo; duplicados y errores no sustituyen datos; solo administrador importa | SQL, unitarias de archivo y prueba administrativa | NO EJECUTADO |
| H15-02A — Vista previa obsoleta | administrador A previsualiza → B reemplaza padrón → A intenta confirmar; rechazar lote/versión obsoletos sin alterar el padrón de B | SQL de concurrencia y prueba administrativa | NO EJECUTADO |
| H15-03 — RUC asociado | RUC activo muestra razón social y permite continuar; ausente o inactivo bloquea; cambio de padrón respeta solicitudes previas | SQL y formulario | NO EJECUTADO |
| H15-04 — Grupo atómico | titular y adicionales → detectar duplicado o cupos insuficientes; cero registros parciales; cada plaza válida tiene precio, cupo y asistencia propios | SQL de concurrencia y unitarias | NO EJECUTADO |
| H15-04A — Mismo RUC | crear dos solicitudes del mismo RUC para sumar asistentes; ambas aparecen en panel agrupadas por empresa; repetir persona activa en cualquiera se rechaza | SQL, panel y formulario | NO EJECUTADO |
| H15-04B — Nombre existente | completar grupo con DNI previo y nombres distintos → actualizar persona con auditoría y mantener snapshots históricos; un fallo del grupo no cambia el nombre | SQL transaccional y auditoría | NO EJECUTADO |
| H15-05 — Comprobante | boleta del titular u otra persona; factura al mismo u otro RUC con dirección; guardar solo datos para emisión externa, sin registrar comprobante emitido | SQL, formulario y panel | NO EJECUTADO |
| H15-05A — Evento gratuito | exclusivo gratuito → omitir elección de boleta/factura y confirmar todas las plazas; exclusivo pagado con tarifa de asociado cero no se publica | SQL, formulario y resultado | NO EJECUTADO |
| H15-06 — Pago parcial | grupo pagado pendiente → seleccionar parte del grupo → verificar importe y referencia → confirmar solo esas plazas → completar el resto después; rechazar selección repetida | SQL, panel y auditoría | NO EJECUTADO |
| H15-06A — Cupos y cancelación | solicitud impaga conserva cupos sin vencimiento; panel muestra antigüedad → cancelar manualmente solo plazas pendientes y liberar cupos; bloquear cancelación ordinaria de plaza pagada | SQL, panel y auditoría | NO EJECUTADO |
| H15-06B — Cobro por RUC | ver varias solicitudes del mismo RUC asociado con plazas, total, confirmado y pendiente; distinguir RUC de facturación distinto sin duplicar ingresos | Panel, consultas y CSV | NO EJECUTADO |
| H15-06C — Atajos antiguos | `register_activity` rechaza evento exclusivo y `confirm_registration` rechaza plaza grupal aunque se invoquen directamente | SQL de seguridad y regresión | NO EJECUTADO |
| H15-06D — Reintentos | repetir solicitud o pago con misma clave/datos devuelve resultado original sin plazas, pagos ni correos nuevos; clave reutilizada con datos distintos falla | SQL, unitarias y outbox | NO EJECUTADO |
| H15-07 — Comunicaciones | titular recibe un resumen; cada asistente recibe su confirmación individual; certificado opcional sigue separado; sin duplicados por reintentos | Unitarias, outbox y correo de prueba | NO EJECUTADO |
| H15-08 — Privacidad y accesibilidad | resultado grupal exige token; padrón no es enumerable; roles y RLS correctos; flujo usable con teclado y en móvil | SQL de seguridad y revisión 390/768/1440 | NO EJECUTADO |
| H15-09 — Coordinación del pago | resultado pagado muestra código e importe y abre WhatsApp del contacto del evento sin DNI, RUC ni asistentes en el mensaje; resultado gratuito no pide coordinar pago | Unitarias, UI y smoke móvil | NO EJECUTADO |

## Hito 16 — Pases gratuitos por empresa asociada

El Hito 16 está implementado en el repositorio y la migración `202609250003` se aplicó a la base Supabase vinculada el **25/09/2026**. La revisión posterior de migraciones quedó al día. Sobre base `daefbd4` más cambios locales sin commit, pasaron las pruebas SQL transaccionales 025 (34 casos), 026 (9 casos) y 027 (30 casos), las 125 pruebas unitarias, `yarn lint`, `yarn typecheck` y `yarn build`. Los casos integrales permanecen **NO EJECUTADOS** hasta revisar el flujo visual/accesible y actualizar y probar el workflow activo de n8n. Ninguna evidencia del Hito 15 se atribuye al Hito 16.

| Caso | Recorrido y resultado exigido | Evidencia prevista | Estado |
|---|---|---|---|
| H16-01 — Configuración | exclusivo pagado admite entero 0, 1 o mayor por RUC; gratuito o no exclusivo guarda 0; errores junto al campo y ayuda comprensible | Formulario, servidor y SQL | NO EJECUTADO |
| H16-02 — Edición segura | antes de inscripciones se puede ajustar; tras la primera solo aumentar; reducción o cambio de exclusividad/gratuidad incompatible se rechaza sin alterar inscripciones | SQL y formulario administrativo | NO EJECUTADO |
| H16-03 — Solicitudes del mismo RUC | primera solicitud usa hasta la cuota disponible; solicitud posterior del mismo RUC recibe solo el remanente y no bloquea nuevas personas; otro RUC tiene cuota propia | SQL y formulario grupal | NO EJECUTADO |
| H16-04 — Asignación y cupos | asistentes reciben pases por orden de ingreso; los demás tienen precio de asociado; cada persona ocupa cupo; duplicados y último cupo mantienen atomicidad | SQL, unitarias y smoke | NO EJECUTADO |
| H16-05 — Concurrencia y reintentos | dos solicitudes simultáneas no superan la cuota; repetir envío idéntico devuelve el resultado previo sin pases, plazas ni correos nuevos | SQL concurrente, unitarias y outbox | NO EJECUTADO |
| H16-06 — Vista previa obsoleta | otra solicitud consume pases antes del envío; el sistema conserva datos, recalcula el total y exige aceptación expresa antes de registrar | Formulario, SQL y smoke | NO EJECUTADO |
| H16-07 — Total cero y comprobante | evento pagado con solicitud íntegramente cubierta confirma plazas y omite boleta/factura y WhatsApp; evento totalmente gratuito conserva su flujo anterior | SQL, UI y resultado | NO EJECUTADO |
| H16-08 — Grupo mixto y pago | pases se confirman al enviar; plazas de precio positivo permanecen pendientes; se pide comprobante solo por importe a cobrar y el pago parcial confirma solo plazas seleccionadas con costo | SQL, panel y resultado | NO EJECUTADO |
| H16-09 — Cancelación y transferencia | cancelar no repone cuota; personal transfiere el mismo pase a inscripción activa impaga del mismo RUC y evento, con motivo y auditoría; rechazar pago previo, asistencia, otro RUC, doble operación y rol indebido | SQL, RLS, panel y auditoría | NO EJECUTADO |
| H16-10 — Historial y administración | cambiar precio o padrón no recalcula solicitudes previas; detalle por RUC muestra pases utilizados/disponibles y estados; CSV no cuenta cortesías como ingreso | SQL, panel y CSV | NO EJECUTADO |
| H16-11 — Comunicaciones y certificados | confirmación inmediata solo a beneficiarios; pagados confirmados tras validar; titular recibe resumen único; cancelación/transferencia notifican; certificado opcional mantiene cobro separado | Outbox, plantillas, n8n y smoke | NO EJECUTADO |
| H16-12 — Privacidad y accesibilidad | visitante no enumera padrón ni beneficiarios; formulario y panel funcionan con teclado y lector de pantalla, sin desbordar 390 × 844, 768 × 1024 y 1440 × 900 | SQL de seguridad y revisión visual/accesible | NO EJECUTADO |

Para cambiar un caso a **APROBADO** faltan las comprobaciones específicas de interfaz, concurrencia real, correos desde el workflow activo y vistas accesibles en 390, 768 y 1440 px que correspondan a ese caso.

## Concurrencia e idempotencia

| Riesgo | Protección implementada | Prueba |
|---|---|---|
| Último cupo | bloqueo de la fila de actividad antes de contar | 003 |
| Inscripción duplicada | índice único parcial y bloqueo transaccional | 003 |
| Matrícula gratuita duplicada | advisory lock e índice único parcial | 007 |
| Progreso concurrente/regresivo | índice único, bloqueo de fila y trigger de incremento | 008 |
| Doble envío de quiz | numeración bajo bloqueo y respuestas ligadas al intento | 009 |
| Certificado duplicado | índices únicos parciales por inscripción/matrícula | 005 y 010 |
| Regeneración concurrente | bloqueo de fila y comparación de la ruta previa | 016 |
| Solicitud duplicada de certificado | token opaco, bloqueo de inscripción y unicidad del outbox | 020 |
| Interés de certificado durante la inscripción | registro atómico, auditoría y aviso interno único | 021 |
| Finalización repetida | `check_course_completion` idempotente | 010 |
| Acceso virtual expuesto | tabla privada, RLS y consultas públicas explícitas | 022 |
| Recordatorio virtual duplicado | identidad única por inscripción y sesión | 022 |

## Acceso virtual y recordatorios

| Caso | Validación | Evidencia |
|---|---|---|
| VA-DB-01 | Anónimos y estudiantes no pueden consultar enlaces ni identidades de recordatorio | 022 |
| VA-DB-02 | Cada inscripción confirmada programa exactamente un recordatorio por sesión futura | 022 |
| VA-MAIL-01 | Registro gratuito confirmado recibe acceso; preinscripción pagada no lo recibe | Unitarias + smoke |
| VA-MAIL-02 | Confirmación pagada e híbrida incluye acceso, sede y acciones de certificado independientes | Unitarias + smoke |
| VA-PUBLIC-01 | Código sin token o inscripción pendiente no revela el enlace virtual | 022 |
| VA-CRON-01 | El scheduler reclama vencidos y recupera trabajos atascados por más de 15 minutos | 022 + smoke |

Antes del lanzamiento se repite la suite vinculada y un recorrido UI con dos envíos simultáneos controlados. Las restricciones de base de datos son la barrera definitiva aunque dos instancias de Vercel procesen la misma acción.

## Matriz visual y de navegador

Probar portada, catálogos, detalle, inscripción, login, panel, reproductor y quiz en:

- móvil: 390 × 844;
- tableta: 768 × 1024;
- escritorio: 1440 × 900;
- Chromium estable y WebKit/Safari estable;
- navegación solo con teclado, foco visible, etiquetas de formulario y contraste básico.

Las tablas administrativas pueden usar desplazamiento horizontal en móvil; los flujos públicos y del Campus no deben requerirlo.

## Registro de ejecución

| Fecha | Commit | Ambiente | Suite | Resultado | Incidencias |
|---|---|---|---|---|---|
| 2026-08-24 | Por versionar | Supabase vinculado | Hitos 1–11, 539 aserciones | APROBADO | Ninguna crítica |
| 2026-08-24 | Por versionar | Local/Next producción | Lint, TypeScript y build de 38 páginas | APROBADO | El primer build aislado fue bloqueado por el sandbox; la ejecución normal finalizó correctamente |
| 2026-08-24 | Por versionar | Local/Chromium | Móvil 390, tableta 768 y escritorio 1440 | APROBADO | Sin desbordamiento horizontal en recorridos públicos |
| 2026-08-24 | Por versionar | Local/HTTP | Portada, catálogos, auth, 404, redirects, health y cabeceras | APROBADO | `yarn smoke:production http://localhost:3000` |
| 2026-08-24 | Por versionar | PDF A4 | Actividad y curso virtual con nombre/título extensos | APROBADO | Curso sin fecha; contenido dentro de zona segura |
| Pendiente | Por versionar | Supabase vinculado | Migración/prueba 012 | BLOQUEADO | Requiere sesión vigente de Supabase CLI |
| Pendiente | Por versionar | Vercel producción | Smoke HTTP y cuatro escenarios | NO EJECUTADO | Requiere proyecto, dominio y variables productivas |
| 2026-09-09 | Por versionar | Local/Next 16.2.10 | Hito 13: 47 unitarias, lint, TypeScript y build | APROBADO | Validación de producción, Rich Results, Lighthouse posterior y navegadores aún pendientes |
| 2026-09-11 | Por versionar | Local/Next 16.2.10 | Ampliación Hito 14: 81 unitarias, lint, TypeScript y build | APROBADO | Sin incidencias locales |
| 2026-09-11 | Por versionar | Supabase vinculado | Migración 202609110002; pruebas SQL 020 y 023, 78 aserciones | APROBADO | Migración aplicada; pruebas transaccionales finalizadas con `rollback` |
| 2026-09-24 | Por versionar | Supabase vinculado | Hito 15: migraciones 202609240001–005, SQL 025–026 (43 aserciones) y suite SQL previa 001–024 | APROBADO | `supabase db push --linked`; pruebas transaccionales con `rollback`, sin seeds |
| 2026-09-24 | Por versionar | Local/Next 16.2.10 | Hito 15: 105 unitarias, lint, TypeScript, build y smoke HTTP (`/api/health`, `/eventos`, protección de `/admin/asociados`) | APROBADO | Pendientes: validación visual y accesible, recorrido administrativo real y workflow activo de n8n |
