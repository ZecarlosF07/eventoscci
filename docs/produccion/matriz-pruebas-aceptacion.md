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
| Pagos por actividad | `028_activity_payments_workspace_test.sql`, `tests/unit/payment-workspace*.test.ts` | Conteos grupales/individuales, saldos separados, idempotencia, fechas operativas, historial, permisos, paginación y rutas compatibles |
| Filtros administrativos | `029_admin_dynamic_filters_test.sql`, `tests/unit/admin-dynamic-filters.test.ts` | Búsqueda literal y por nombre completo, perfiles, elegibilidad antes de paginar, conteos, permisos, URL y selección conservada |
| Exportaciones administrativas | `tests/unit/xlsx-export.test.ts`, pruebas de tablas de inscripción, sugerencias, grupos y comprobantes | Archivo Excel válido, identificadores conservados como texto, contenido de usuario inerte y una fila por solicitud cuando corresponde |
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

## Hito 17 — Usuarios internos y actividades a cargo

Hito documental posterior al Hito 16. **No se han implementado permisos nuevos ni creado usuarios mediante este hito.** Las cuentas `operator` conservan el alcance vigente hasta la futura migración; no interpretar el diseño de la interfaz como una barrera de seguridad. Cada escenario parte de una instalación con al menos un `administrator` activo, dos responsables y contactos diferenciados.

| Caso | Recorrido y resultado exigido | Evidencia prevista | Estado |
|---|---|---|---|
| H17-01 — Alta interna | administrador crea usuario con documento, identidad, correo, celular, cargo, rol y contraseña confirmada; la cuenta Auth y la identidad institucional quedan vinculadas sin convertir estudiantes | Formulario, Auth y SQL | NO EJECUTADO |
| H17-02 — Alta parcial y duplicados | fallo después de crear Auth no deja acceso parcial; reintento o recuperación explícita; documento/correo existentes y cuenta `student` producen mensajes sin duplicar personas | SQL, unitarias e integración Auth | NO EJECUTADO |
| H17-03 — Contraseñas | solo el administrador completo crea o restablece contraseñas desde Usuarios; no puede consultar la anterior ni aparecen secretos en correo, URL, logs o auditoría; se comunica el límite propio de Supabase Auth | Formulario, integración Auth y revisión de logs | NO EJECUTADO |
| H17-04 — Roles y último administrador | alternar únicamente `administrator`/`operator` con auditoría; bloquear autorreducción, autodesactivación y pérdida concurrente del último administrador completo | SQL concurrente, acciones y panel | NO EJECUTADO |
| H17-05 — Contactos | crear o vincular contacto público a una cuenta; un contacto no puede tener dos responsables y una cuenta puede tener varios; vínculo privado no aparece en datos públicos | SQL, panel, RLS y consulta pública | NO EJECUTADO |
| H17-06 — Vinculación automática | correo exacto y único vincula contacto existente; falta de correo, ambigüedad o vínculo previo no asignan acceso por nombre, teléfono ni coincidencia aproximada | SQL de migración y panel de revisión | NO EJECUTADO |
| H17-07 — Actividad propia | responsable crea evento y capacitación usando solo sus contactos y gestiona edición, publicación, inscripción, pagos, asistencia y certificados; otro responsable no los ve | SQL, unitarias y recorrido administrativo | NO EJECUTADO |
| H17-08 — Catálogos acotados | responsable crea lugar, expositor y categoría desde formulario propio, pero no edita, desactiva ni borra catálogos globales ni entra a su módulo | SQL, formulario y rutas directas | NO EJECUTADO |
| H17-09 — Reasignación | administrador cambia el contacto responsable; nuevo usuario obtiene acceso y anterior lo pierde de inmediato; `operator` no puede cambiar contacto desde formulario ni RPC | SQL, auditoría y dos sesiones | NO EJECUTADO |
| H17-10 — Desactivación | borradores, actividades sin fecha y demás actividades vigentes deben reasignarse antes de desactivar; históricas conservan atribución y cuenta inactiva pierde acceso con sesión aún abierta | SQL, panel y dos sesiones | NO EJECUTADO |
| H17-11 — Acceso indirecto | modificar IDs en URL, Route Handler, RPC, vistas o enlaces guardados no revela ni modifica actividades, personas, grupos, cobros o certificados ajenos | SQL/RLS y pruebas HTTP con dos roles | NO EJECUTADO |
| H17-12 — Listados y Excel | menús, contadores, búsqueda, filtros, paginación, sugerencias y exportaciones reflejan solo actividades autorizadas; no filtran únicamente la página descargada | SQL, unitarias y descargas reales | NO EJECUTADO |
| H17-13 — Storage y servicio | carga temporal y archivo definitivo no pueden moverse, sobrescribirse o borrarse desde otra cuenta; operaciones `service_role` verifican actor y actividad antes de usar privilegios | Políticas Storage, rutas y pruebas de abuso | NO EJECUTADO |
| H17-14 — Módulos excluidos y regresión | responsable no accede a Cursos, Directorio global, Usuarios, Notificaciones globales ni plantillas; administrador conserva todo; público, Campus y Hitos 15/16 mantienen su comportamiento | SQL, rutas y regresión integral | NO EJECUTADO |
| H17-15 — Calidad y despliegue | teclado, foco, contraste y vistas 390×844, 768×1024 y 1440×900; unitarias y SQL, lint, typecheck, build, dry-run, migración sin seeds y tipos regenerados | Evidencia fechada de pruebas, CLI y revisión accesible | NO EJECUTADO |

## Participación — Pagos por actividad (28/09/2026)

Base de trabajo `38b2198` más cambios locales sin commit. Aplicadas las migraciones `202609280001`, `202609280002` y `202609280003` a Supabase vinculada, con dry-run previo, sin seeds y tipos regenerados. Pasaron 51 casos SQL nuevos (028) y las regresiones 004 (58), 005 (73), 017 (7), 018 (18), 022 (39), 023 (34), 025 (34), 026 (9) y 027 (30). Se actualizaron las fixtures de pago individual para utilizar la nueva operación con referencia; el caso de auditoría de 027 ahora se limita a la actividad de prueba. No se atribuyen estos resultados a las pruebas integrales pendientes.

| Caso | Evidencia real / pendiente | Estado |
|---|---|---|
| P-01 Conteo sin lista vacía | 028: solicitudes grupales e individuales en la misma actividad; una fila por solicitud y cortesías excluidas | APROBADO (SQL) |
| P-02 Pagos individuales | 028: importe exacto, referencia, auditoría, responsable, segunda operación bloqueada e idempotencia | APROBADO (SQL) |
| P-03 Pagos grupales y pases | 025, 027, 028: selección parcial por plazas completas; cortesías separadas y sin cobro; padrón y transferencias conservados | APROBADO (SQL) |
| P-04 Certificados separados | 023 y 028: saldo separado, participación confirmada, reversión y bloqueo después de emisión | APROBADO (SQL) |
| P-05 Fechas operativas | 028: evento en curso, varias sesiones, fin exacto, sesión sin fin en Lima, sin fechas y finalización; fechas originales conservadas | APROBADO (SQL) |
| P-06 Escala y búsqueda | 028: tres actividades con más de 100 solicitudes, página final, búsqueda de documento y agregación de más de 1.000 actividades | APROBADO (SQL) |
| P-07 Historial y exclusiones | 028 y 018: confirmaciones antiguas sin pagos ficticios; historial mixto operable; exclusión de eliminados, cancelados y archivados | APROBADO (SQL) |
| P-08 Navegación y operación visual | Pestañas, filtros, detalle inline, conservación de páginas, CSV y rutas antiguas, con sesión administrativa real | NO EJECUTADO |
| P-09 Accesibilidad y responsive | Teclado, foco, lector de pantalla y revisión visual 390×844, 768×1024, 1440×900 | NO EJECUTADO |
| P-10 Concurrencia real | Dos operadores intentando confirmar la misma plaza al mismo tiempo | NO EJECUTADO |
| P-11 Correo real | Entrega desde el workflow activo, sin duplicados por reintento; SQL solo verifica outbox | NO EJECUTADO |

El navegador local está en el login administrativo: la revisión autenticada necesita que el usuario inicie sesión. No se extrajeron credenciales ni se omitió la autenticación para probar la interfaz. Pasaron 138 pruebas unitarias (incluye render estático de las pestañas, listas y filtros), `yarn lint`, `yarn typecheck` y `yarn build`. La compilación necesitó acceso de red para las fuentes existentes de Google Fonts. El dry-run final confirmó la base vinculada al día, sin migraciones ni seeds pendientes.

## Concurrencia e idempotencia (protecciones)

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

## Búsquedas automáticas administrativas — 28/09/2026

Implementación y alcance: [Búsquedas administrativas](../integraciones/busquedas-administrativas.md). No se modifica el header, el buscador público ni las reglas comerciales.

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| BA-01 | Utilidades de debounce de 350 ms, URL, páginas independientes, parsers y búsqueda literal | APROBADO | Suite de 150 unitarias; la prueba de debounce comprueba su configuración, no sustituye la medición temporal en navegador |
| BA-02 | RPC filtrada: perfiles/datos contextuales, permisos, sin comodines, Listos/Emitidos/Revocados, pago opcional, conteo de segunda página y límites | APROBADO | SQL 029, 28 aserciones, `finish(true)` y rollback en Supabase vinculado |
| BA-03 | Regresión de participación, pago de certificado y perfiles | APROBADO | SQL 028 (51 aserciones), 023 (34) y 024 (22); las dos últimas repetidas con finalización estricta en copias temporales; rollback |
| BA-04 | Migraciones revisadas/aplicadas sin seeds; tipos regenerados | APROBADO | 202609280004 y 202609280005; dry-run final `upToDate: true`, sin migraciones ni seeds pendientes |
| BA-05 | Lint, typecheck y build | APROBADO | Yarn, Next 16.2.10; build con acceso a las fuentes existentes Google Fonts |
| BA-06 | Texto + selector sin perder valores, Enter, limpieza y mensaje actualizado | APROBADO | Sesión administrativa local: Participación, «Prueba» + periodo Todas, una coincidencia, limpieza a Próximas y en curso; foco/texto conservados |
| BA-07 | Listado real de inscripciones sobre vista nueva y filtros iniciales de asistencia | APROBADO | Sesión local autenticada; tres inscripciones y una confirmada en Asistencia; sin mutaciones |
| BA-08 | Seleccionado oculto conserva selección y nota | APROBADO | Selección de una persona en Asistencia, nota temporal y búsqueda sin resultados: 1 seleccionado, 0 visibles, 1 fuera de la vista; nota conservada. No se guardó asistencia |
| BA-09 | Confirmación de operación masiva con seleccionados ocultos | BLOQUEADO | El navegador de automatización quedó bloqueado al abrir el diálogo. Se pidió pulsar Cancelar; no se confirmó ni guardó la operación |
| BA-10 | Escritura rápida, medición exacta del debounce, consultas lentas, errores y respuestas fuera de orden | NO EJECUTADO | Pendiente de prueba integral de red; no basta la cobertura de utilidades ni el manejo de navegación de Next |
| BA-11 | Atrás/adelante y enlaces guardados de todos los módulos | NO EJECUTADO | Parsers y compatibilidad cubiertos en unitarias; recorrido integral pendiente |
| BA-12 | Nuevos filtros y exportación real fuera de primera página en todos los módulos | NO EJECUTADO | Criterios compartidos comprobados en unitarias; falta revisión integral con volumen real en el formato Excel actual |
| BA-13 | Selección/páginas de certificados, emisión parcial, límite, permisos y elegibilidad cambiada durante una operación | NO EJECUTADO | Revalidación implementada; no se emitieron certificados ni se enviaron correos reales para esta prueba |
| BA-14 | Pagos abiertos conservan borradores al filtrar, ambas páginas y certificados separados | NO EJECUTADO | URL y separación cubiertas en unitarias; comprobación integral pendiente |
| BA-15 | Vistas 390×844, 768×1024 y 1440×900; lectores de pantalla y teclado completo | NO EJECUTADO | Recorrido parcial por teclado realizado, pero no se aprueba el conjunto de tamaños/accesibilidad sin completarlo |

No hay despliegue del frontend productivo asociado a este registro. Las migraciones sí están aplicadas en la base vinculada. Las pruebas SQL no dejan fixtures, pagos, notificaciones ni semillas.

### Compactación de buscadores — 28/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| BA-16 | Contenedor compartido, barra única, controles secundarios conservados al cerrar y apertura inicial de filtros activos | APROBADO | 152 pruebas unitarias, lint, typecheck y build; sin cambios de base de datos, header o buscadores públicos |
| BA-17 | Inscripciones: despliegue por Enter, aplicar perfil profesional, cerrar conservando el valor y limpiar; ajustes en 390×844, 768×1024 y 1440×900 | APROBADO | Sesión local autenticada; controles de 44 px, sin desbordamiento del formulario. Buscador cerrado sin filtros activos: 122 px en escritorio; tableta: 174 px. No se guardaron operaciones |
| BA-18 | Participación y Pagos: filtros juntos sin confundir participación y certificados | APROBADO | Revisión visual local a 1440×900; buscadores de 122 px y 142 px respectivamente, sin desbordamiento del formulario |
| BA-19 | Recorrido visual completo de todos los módulos, lectores de pantalla y prueba móvil de cada variante | NO EJECUTADO | Layout compartido comprobado; no se considera realizada una auditoría completa a partir de las pantallas anteriores. BA-15 conserva su estado |

## Datos para comprobantes — 28/09/2026

Alcance y activación: [Datos para comprobantes de participación](../integraciones/comprobantes-participacion.md). Preparación para emisión externa dentro de Pagos; sin emisión de comprobantes, acciones monetarias adicionales ni cambios al header.

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| CP-01 | Boleta/factura, documentos, dirección, destinatario distinto, CE, estudiante, copia explícita y limpieza de campos inactivos | APROBADO | Suite de 164 unitarias; 12 pruebas nuevas de esquema, utilidades y componentes de comprobantes |
| CP-02 | Persistencia transaccional, rechazo de inscripciones pagadas sin datos con obligatoriedad activa, privacidad e históricos sin relleno | APROBADO | SQL 030: 62 aserciones, `finish(true)` y rollback en Supabase vinculado; activación ensayada solo dentro de la transacción |
| CP-03 | Una fila por solicitud, cortesías, pagos parciales/completos, cancelaciones, 20 empresas por página y 20 solicitudes desplegadas | APROBADO | Fixtures SQL 030: 22 empresas y 22 solicitudes de una empresa; conteos y segundas páginas verificados antes del rollback |
| CP-04 | Corrección de datos existentes con motivo, auditoría anterior/nueva y permisos; rechazo de carga administrativa de datos faltantes | APROBADO | SQL 030; controles de RLS, RPC central y guardas del editor grupal anterior |
| CP-05 | CSV seguro, importes no multiplicados y filtros compartidos | APROBADO | Unitarias de fórmulas e importes; descarga real local: CSV completo con dos solicitudes y CSV filtrado por Factura con una, además de encabezados |
| CP-06 | Regresión de pagos y pases gratuitos | APROBADO | SQL 028: 51 aserciones; SQL 027: 30 aserciones. Con SQL 030 suman 143; pruebas transaccionales con rollback |
| CP-07 | Migraciones revisadas/aplicadas sin seeds y tipos regenerados | APROBADO | 202609280006 y 202609280007; dry-run final `upToDate: true`, sin migraciones ni seeds pendientes |
| CP-08 | Lint, typecheck y build | APROBADO | Yarn y Next 16.2.10; build posterior a todos los cambios de código |
| CP-09 | Navegación agrupada, separación de RUC asociado/facturación, filtros automáticos y conservación de borradores | APROBADO | Sesión local autenticada: una empresa, dos solicitudes independientes; alternar boleta/factura conserva valores; búsqueda sin coincidencias conserva detalle y motivo; limpieza restaura resultados. Sin guardar correcciones |
| CP-10 | Copia accesible, teclado en selector y primer error inválido | APROBADO | Mensaje «Datos copiados»; cambio de opción mediante Espacio; motivo vacío muestra error y enfoca su campo sin enviar corrección. Contenido de copia verificado en unitarias, no mediante lectura del portapapeles |
| CP-11 | Vista agrupada, filtros y editor a 390×844, 768×1024 y 1440×900 | APROBADO | Revisión visual y dimensiones DOM locales: formulario sin desbordamiento del viewport; controles de aproximadamente 44 px y tablas con desplazamiento propio |
| CP-12 | Recorrido público integral de inscripción individual pagada en evento abierto y capacitación | NO EJECUTADO | No había una actividad publicada pagada individual apropiada; no se crearon actividades ni inscripciones reales para la prueba. Esquemas y reglas SQL sí comprobados |
| CP-13 | Corrección persistida mediante navegador y recorrido administrativo integral en producción | NO EJECUTADO | Las mutaciones se probaron en SQL con rollback; no se modificaron destinatarios ni pagos reales desde la sesión de navegador |
| CP-14 | Auditoría completa de lectores de pantalla, teclado y navegadores móviles | NO EJECUTADO | Las comprobaciones parciales de CP-10 y CP-11 no sustituyen una auditoría integral |
| CP-15 | Frontend productivo y activación global de obligatoriedad | NO EJECUTADO | Pendiente publicar el formulario actualizado y ejecutar después `supabase/rollouts/enable_registration_billing.sql`; la ventana de compatibilidad sigue abierta |

No se enviaron correos ni se registraron pagos durante estas pruebas. Las migraciones están aplicadas, pero el nuevo frontend no se ha desplegado a producción. La obligatoriedad global permanece pendiente deliberadamente para no romper el formulario actualmente publicado. Los resultados anteriores de otros hitos y módulos no se modifican.

## Indicadores de pagos pendientes — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| IP-01 | Contraste solo con pendientes, conteos individuales/grupales conservados, certificados separados, singular y destino contextual | APROBADO | Tres pruebas nuevas de render dentro de 167 unitarias; sin cambios en consultas, header o base de datos |
| IP-02 | Diseño de los avisos de participación y certificado, y contadores en cero | APROBADO | Sesión local autenticada en Chrome: evento con 2 solicitudes/2 plazas pendientes; capacitación con 0/0 y 6 certificados pendientes; revisión visual a 1440×900 y ajuste móvil a 390×844 sin desbordamiento de los avisos |
| IP-03 | Lint, typecheck y build | APROBADO | Yarn y Next 16.2.10; sin migraciones necesarias |
| IP-04 | Auditoría integral de lectores de pantalla y todos los tamaños/navegadores | NO EJECUTADO | Icono decorativo y foco visible implementados; las pruebas visuales y estáticas no equivalen a una auditoría integral |

### Importe automático al validar participación — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| IA-01 | Total por selección, exclusión de plazas no elegibles, suma en céntimos y ausencia del campo editable en ambos formularios | APROBADO | Cuatro pruebas nuevas dentro de 171 unitarias: cambios de selección, IDs duplicados/desconocidos, cortesías, canceladas/confirmadas y decimales; comprobación estática del envío del total y conservación de referencia, nota, diálogo e idempotencia |
| IA-02 | Formulario grupal real calcula importe sin digitación | APROBADO | Chrome local autenticado: seleccionar una plaza actualiza S/ 0.00 a S/ 300.00; desmarcar vuelve a cero y deshabilita confirmar. Referencia y nota visibles; no se confirmó ni registró un pago |
| IA-03 | Lint, typecheck y build | APROBADO | Yarn y Next 16.2.10; RPC y reglas SQL sin cambios, sin migración necesaria |
| IA-04 | Recorrido individual y envío real de pago desde navegador | NO EJECUTADO | Cambio individual cubierto estáticamente; no se crearon inscripciones ni cobros reales para la prueba |
| IA-05 | Detalle de pago sin datos de facturación duplicados; RUC asociado debajo del nombre y botón contextual | APROBADO | Prueba estática añadida dentro de 172 unitarias; Chrome local: el botón abre «Datos para comprobantes» con CCI-GR-000038, la misma solicitud. No se guardaron correcciones ni pagos; lint, typecheck y build posteriores correctos |

### Detalle de pago en popup — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| PP-01 | Diálogo modal compartido para el detalle individual y grupal, con cierre contextual y controles accesibles | APROBADO | Dos pruebas de render y estructura añadidas; 174 unitarias, lint, typecheck y build correctos. No se modifican RPC ni reglas de pago |
| PP-02 | Apertura grupal, foco inicial, fondo bloqueado, Escape y regreso al listado con filtros y foco restaurados | APROBADO | Chrome local autenticado con CCI-GR-000040: diálogo nativo modal, foco inicial en «Cerrar detalle», búsqueda AGRICOLA y tipo grupal conservados; Escape elimina `solicitud`, restaura el scroll del documento y el foco del enlace original |
| PP-03 | Popup adaptable y contenido desplazable sin perder el cierre | APROBADO | Revisión visual en escritorio y 390×844: popup de 358×812, contenido con scroll propio y encabezado visible al desplazar. Comprobación a 768×1024: 736×948; cierre mediante botón probado. No se validaron pagos reales |
| PP-04 | Recorrido individual real, lectores de pantalla, navegación atrás/adelante y todos los navegadores | NO EJECUTADO | El mismo wrapper cubre ambos tipos; las pruebas estructurales y el recorrido grupal no sustituyen una auditoría integral |

### Carga independiente del popup de pago — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| PC-01 | Apertura/cierre locales, consulta mínima, carga, errores, contrato, filtros y cancelación | APROBADO | Ocho pruebas añadidas; URL contextual, enlace accesible, payload sin campos extra, endpoint/signal/no-store, errores 403/404 y respuesta ajena, aislamiento de cargas, permisos/contexto, actualización solo tras éxito. La suite final incluye 183 unitarias, incluida PC-06; lint, typecheck y build correctos |
| PC-02 | Apertura sin esperar Supabase, carga grupal e importe por plaza | APROBADO | Chrome local autenticado: primer snapshot de CCI-GR-000040 muestra «Cargando detalle…», cierre enfocado y fondo modal a ~525 ms desde el clic, incluyendo automatización. Luego aparecen los datos y seleccionar una plaza actualiza S/ 0.00 a S/ 300.00; no se registró ningún pago. No es una medición productiva ni del tiempo total del backend |
| PC-03 | Escape, atrás/adelante y cierre durante la carga, sin perder filtros | APROBADO | Chrome local: Escape conserva `estado=pending`, `tipo=group`, `q=AGRICOLA` y restaura foco. CCI-GR-000038 se cierra con atrás mientras carga y vuelve a abrirse con adelante; posteriormente muestra únicamente la plaza pagada elegible, no el pase gratuito |
| PC-04 | Presentación móvil tras la carga independiente | APROBADO | Chrome 390×844: diálogo modal de 358 px de ancho, encabezado/cierre visibles y contenido desplazable; sin desbordamiento horizontal del popup |
| PC-05 | Historial pagado e individual real, permisos con otras sesiones, fallos de red reales, lectores de pantalla y medición productiva | NO EJECUTADO | Contrato, ramas individuales, permisos y fallos cubiertos por pruebas estáticas/unitarias; no se crearon cobros ni se cambiaron sesiones. No hay migración ni despliegue productivo en este cambio |
| PC-06 | Texto de carga centrado con spinner discreto | APROBADO | Prueba de render del estado de carga: centrado, etiqueta accesible, spinner y movimiento reducido. Chrome 390×844: revisión visual del estado «Cargando detalle…» centrado con el indicador circular, sin bloquear el cierre |

### Popup optimizado de datos para comprobantes — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| DC-01 | Contrato mínimo, endpoint independiente, errores, contexto, acción accesible y reutilización del diálogo/carga | APROBADO | Ocho pruebas nuevas: contrato sin datos extra, históricos/gratuidad, no-store/signal, respuesta ajena, 403/404, botón «Ver datos», título propio, ausencia de consulta de detalle en el listado, permisos y corrección con motivo. Hook compartido conserva cancelación y aislamiento de respuestas comprobados en PC-01 |
| DC-02 | Apertura inmediata y carga centrada antes de obtener los datos | APROBADO | Chrome local autenticado: primer snapshot de CCI-GR-000038 y CCI-GR-000040 muestra «Cargando detalle…» con el cierre enfocado; revisión visual del spinner centrado a 390×844. No se midió latencia productiva |
| DC-03 | Datos de factura/boleta, RUC diferenciados, importes y editor central | APROBADO | CCI-GR-000038 conserva RUC asociado y RUC de facturación distintos, corte de cortesía y saldo; CCI-GR-000040 muestra boleta. Editor abierto para comprobar campos y motivo obligatorio, sin guardar correcciones ni pagos |
| DC-04 | Cierre, Escape, foco y atrás/adelante sin perder contexto | APROBADO | Escape y botón cierran, eliminan solo `solicitud` y restauran foco en «Ver datos»; `vista=comprobantes` y empresa permanecen. Atrás/adelante cierran/reabren CCI-GR-000040 y muestran la solicitud correcta |
| DC-05 | Acción visible y popup adaptable a 390, 768 y 1440 px | APROBADO | Botón verde oscuro de 44 px en primera columna; popup móvil de 358 px, sin desbordamiento horizontal. Editor con scroll propio y cierre visible; revisión visual a 768×1024 y listado a 1440×900 |
| DC-06 | Suite, lint, typecheck y build | APROBADO | 191 unitarias; Yarn y Next 16.2.10. Build con acceso autorizado a Google Fonts existentes. No requiere migración ni cambia SQL, exportaciones o header |
| DC-07 | Guardado real de corrección, recorrido individual real, otras sesiones, fallos de red reales y auditoría integral de accesibilidad | NO EJECUTADO | Se conserva RPC auditada y editor existentes; contratos/errores cubiertos en unitarias. No se modificaron destinatarios ni cobros reales, no se cambiaron sesiones y no se desplegó frontend productivo |
| DC-08 | «Ver solicitudes» no reabre el comprobante cerrado desde un enlace directo | APROBADO | Fallo reproducido en Chrome: el enlace de empresa arrastraba `solicitud` tras el cierre local. Corregido con `billingListUrl`; repetido el recorrido directo CCI-GR-000038 → cerrar → Ver solicitudes: tabla con dos solicitudes, cero diálogos y URL sin `solicitud`. «Ver datos» de CCI-GR-000040 sigue abriendo su popup con loading |
| DC-09 | Enlaces de empresa y paginación independientes del detalle; regresión técnica | APROBADO | Tres pruebas nuevas para filtros inicialmente con `requestId`, expandir/contraer y ambos niveles de paginación. 194 unitarias, lint, typecheck y build correctos; sin migraciones ni cambios de datos |

### Asistencia simplificada — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| AS-01 | Dos filtros principales, secundarios plegados y valores iniciales/históricos correctamente identificados | APROBADO | Render unitario de búsqueda/asistencia; `estado=confirmed` no activa ni abre «Más filtros», mientras Todas/Pendientes/Canceladas y tipo asociado sí cuentan y conservan controles/criterios visibles en enlaces guardados |
| AS-02 | Resumen compacto y acciones masivas solo al seleccionar | APROBADO | Chrome local 1440×900: resumen de 46 px, filtros de 122 px, tabla comienza aproximadamente a 475 px sin selección. Al seleccionar aparece un único bloque de unos 122 px con total/visibles/ocultos, revisión, limpieza, estado, nota desplegable y aplicación |
| AS-03 | Seleccionado fuera de resultados y nota temporal conservados | APROBADO | Seleccionar Bolo FIJO, escribir nota temporal y buscar sin coincidencias: 1 seleccionado, 0 visibles, 1 fuera de vista; nota conservada. Limpiar filtros restaura la persona/nota y limpiar selección retira el bloque. Sin aplicar asistencia |
| AS-04 | Consulta histórica y bloqueo de personas no confirmadas | APROBADO | Más filtros → Todas muestra tres inscripciones; dos pendientes conservan selección deshabilitada y mensaje de confirmación previa. Limpieza retorna a una confirmada; motivo, elegibilidad, límites y confirmación de ocultos permanecen sin cambios |
| AS-05 | Tabla de cinco columnas y nota individual desplegable sin perder operaciones | APROBADO | Render/estructura y Chrome 1440×900: Guardar accesible sin desplazamiento horizontal; inscripción/certificado agrupados, estado/fecha en una celda. Notas siguen usando borradores, nombre de campo y acción individual existentes |
| AS-06 | Móvil/tablet y controles accesibles | APROBADO | Revisión visual a 390×844 y 768×1024: sin desbordamiento del documento; tarjetas antes de `lg`, filtros secundarios cerrados y notas opcionales plegadas. Se conservan etiquetas y controles de 44 px |
| AS-07 | Unitarias, lint, typecheck y build | APROBADO | Seis pruebas nuevas, 200 unitarias correctas; Yarn y Next 16.2.10, build con acceso a Google Fonts existentes. No se modifican consultas, RPC, SQL ni header; sin migración necesaria |
| AS-08 | Guardado real, confirmación masiva con ocultos, auditoría integral de teclado/lectores de pantalla y volumen de participantes | NO EJECUTADO | Las guardas y borradores se comprobaron sin mutaciones; no se guardó asistencia ni se enviaron correos, y esta revisión visual no repite pruebas SQL ni despliega frontend productivo |
| AS-09 | Distribución laptop con revisión expandida y nota abierta | APROBADO | Chrome local 1366×768: contador y acciones en una misma fila; lista revisada en una fila independiente de ancho completo, sin desplazar limpieza ni encabezado. Estado/nota/aplicación distribuidos y contadores equidistantes. Revisión visual también a 390×844 y 768×1024; sin guardar asistencia |
| AS-10 | Regresión tras ajustar distribución y desplegable | APROBADO | 201 unitarias, `yarn lint`, `yarn typecheck`, `yarn build` y `git diff --check` correctos. Prueba estructural exige revisión accesible con `aria-expanded`/`aria-controls` y listado independiente, sin depender de `display: contents` en un desplegable nativo. Sin migración ni despliegue productivo |

### Emisión rápida de certificados — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| ER-01 | Un botón usa la elegibilidad completa de la actividad, no solo la página visible | APROBADO | Render en Chrome local: «Emisión rápida» indica 3 listos en la actividad comprobada aunque el listado esté paginado. Acción consulta `get_activity_certificate_candidates_filtered` con `ready`, búsqueda vacía, offset 0 y máximo 20; la ruta administrativa comprueba ámbito y permisos antes de emitir |
| ER-02 | Plantilla/condición previas, confirmación de lote, duplicados y protección de pago opcional | APROBADO | UI a ancho de escritorio y 390×844; control automático después de plantilla y condición, con confirmación explícita que advierte sobre notificaciones. Migración escrita para repetir elegibilidad en `prepare_activity_certificates`; dos unitarias nuevas cubren el contrato. No se ejecutó emisión con personas reales |
| ER-03 | Suite y comprobaciones frontend | APROBADO | 203 unitarias, `yarn lint`, `yarn typecheck`, `yarn build` y `git diff --check` correctos con Next 16.2.10 |
| ER-04 | Prueba SQL y migración vinculada | APROBADO | `supabase db push --linked --dry-run` identificó únicamente `202609290001_certificate_bulk_eligibility.sql`; `supabase db push --linked` la aplicó el 29/09/2026 sin seeds ni roles. La prueba transaccional 031 terminó correctamente con seis aserciones verificadas y `ROLLBACK`; el dry-run posterior devolvió `upToDate: true`, sin pendientes. La firma de la RPC no cambió, por lo que no se requirió regenerar tipos |
| ER-05 | Emisión real, correo y reintentos en un entorno de prueba | NO EJECUTADO | La actividad visible contiene personas reales elegibles: no se pulsó «Emitir» ni se enviaron PDF o correos. Pendiente prueba operativa controlada; aplicar la migración no desplegó el frontend |

### Recuperación de tandas interrumpidas — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| ER-06 | Tanda persistente de hasta 20, recuperación de certificados previos sin PDF, inicio repetido sin segunda tanda | APROBADO (SQL) | Migración 202609290002; prueba SQL 032 transaccional con 17 aserciones y `ROLLBACK` |
| ER-07 | Bloqueo por intento, vencimiento, rechazo de token antiguo, elegibilidad revisada y un solo registro de correo | APROBADO (SQL) | SQL 032: reclamo concurrente denegado, bloqueo vencido recuperado y finalización rechazada tras cambiar asistencia; 202609290003 reconcilia PDF terminado por otra ruta |
| ER-08 | Progreso visible, reanudar sin proceso de fondo y conservar plantilla/condición | APROBADO (código) | Componente de progreso y acciones por certificado; 204 unitarias, lint, typecheck y build correctos. Vista administrativa local revisada sin emitir; falta probar cierre real durante una emisión controlada |
| ER-09 | Cierre real durante generación, PDF y webhook; dos administradores; móviles y correo real | NO EJECUTADO | No se interrumpieron emisiones de participantes reales ni se enviaron correos de prueba. Requiere entorno y destinatarios controlados; no se desplegó frontend productivo |

### Exportaciones administrativas en Excel — 29/09/2026

| Caso | Verificación | Estado | Evidencia |
|---|---|---|---|
| EX-01 | Las cinco rutas de inscripción, sugerencias, solicitudes grupales, pagos y datos para comprobantes descargan `.xlsx` con permisos, filtros y límites conservados | APROBADO (código) | Inspección de rutas; todas comparten `createXlsxResponse` y ninguna responde `text/csv`. El enlace de Asistencia reutiliza la exportación de inscripciones |
| EX-02 | Archivo legible por Excel; RUC/DNI como texto, importes numéricos y cadenas que comienzan con `=` sin ejecución | APROBADO (unitarias) | Archivo generado y leído con ExcelJS; encabezados, tipos de celda, contenido, nombre y MIME comprobados. 204 unitarias, lint, typecheck y build correctos |
| EX-03 | Descarga real autenticada con filtros, datos fuera de primera página y apertura en Excel de escritorio/móvil | NO EJECUTADO | No se descargaron datos de participantes reales en esta revisión; BA-12 conserva su estado. No requiere migración de base de datos ni cambia datos persistidos |


## Información profesional y Provincia — 30/09/2026

| Caso | Resultado esperado | Estado |
|---|---|---|
| Escritorio y móvil | Empresa / Organización, RUC, Cargo, Provincia; dos columnas o una, respectivamente | APROBADO (navegador local) |
| Profesional general | Empresa, RUC y Cargo obligatorios; Provincia opcional | APROBADO (unitarias y pgTAP vinculado) |
| Asociado individual | Empresa, RUC y Cargo obligatorios; Provincia opcional | APROBADO (navegador y pgTAP vinculado) |
| Alternar perfiles | Conserva borradores y excluye información profesional del estudiante | APROBADO (navegador y unitarias) |
| Persistencia | Reutiliza address; guarda province_snapshot; posteriores ediciones no cambian snapshots | APROBADO (pgTAP vinculado) |
| Históricos | No convierte direcciones ni completa provincias; permite editar empresa vacía | APROBADO (pgTAP vinculado) |
| Factura | Copia empresa/RUC y conserva dirección fiscal; Provincia no se copia | APROBADO (unitarias y pgTAP vinculado) |
| Excel | Empresa / Organización, RUC, Cargo, Provincia; históricos sin snapshot quedan vacíos | APROBADO (unitarias) |
| Seguridad y cobro | Vista interna, núcleo privado y validación transaccional de comprobantes conservados | APROBADO (pgTAP vinculado) |

Evidencia automatizada: `registration-professional-province.test.ts`, `registrations-export.test.ts` y `033_registration_professional_province_test.sql`. Registrar ambiente y resultados reales antes de publicar; las pruebas aisladas no sustituyen aceptación en Supabase ni envío por n8n.

Verificación del 30/09/2026, árbol de trabajo actual: `yarn lint`, `yarn typecheck`, `yarn build` y 211 pruebas unitarias aprobados. Revisión visual del formulario individual a 1280×900 y 390×844; se comprobó orden, obligatoriedad del RUC de asociados y conservación de borradores al alternar perfiles, sin enviar inscripciones reales.

Se aplicaron las 64 migraciones en PostgreSQL embebido PGlite, con esquemas mínimos de Auth/Storage y funciones de aserción equivalentes para ejecutar las suites 003, 024, 025, 027 (pases), 030 y 033: 230 comprobaciones aprobadas. La fixture antigua de la suite 003 se ajustó a la regla vigente de precio general cero en eventos exclusivos; mantiene el rechazo del recorrido individual. Estas pruebas validan PostgreSQL y las operaciones del repositorio, pero no constituyen ejecución del CLI/pgTAP contra Supabase alojado.

Actualización del 30/09/2026 tras iniciar sesión en Supabase: `supabase db push --linked --dry-run` identificó exclusivamente `202609300001_registration_professional_province.sql`; `supabase db push --linked --yes` la aplicó sin seeds. Se regeneraron los tipos del esquema vinculado en un archivo temporal, se aplicaron las mismas refinaciones de `scripts/refine-supabase-types.mjs` y se verificó `yarn typecheck`.

Las seis suites 003, 024, 025, 027 (pases), 030 y 033 se ejecutaron con pgTAP en la base vinculada: 230 comprobaciones aprobadas. Se usó `finish(true)` en cada suite para que cualquier aserción fallida causara un error del comando; todas terminaron correctamente y revirtieron sus transacciones. La suite 033 queda configurada con ese mismo cierre y su consulta de dirección fiscal restringe el resultado a la actividad de prueba, sin depender de la cantidad de comprobantes reales.

La migración quedó registrada y la vista administrativa dispone de `province_snapshot`. La consulta posterior confirmó cero actividades de la suite 033. El esquema y los tipos de Supabase están actualizados. No se publicó un deployment; continúa pendiente la publicación del frontend en producción.


Actualización adicional del 30/09/2026: RUC pasa a ser obligatorio para toda nueva inscripción individual profesional, tanto general como asociada. Se rechazan valores vacíos, espacios y formatos distintos de 11 dígitos. Los estudiantes siguen sin enviar RUC y la edición administrativa de históricos mantiene sus reglas existentes.

Se aplicó exclusivamente `202609300002_registration_professional_ruc_required.sql` en Supabase vinculado, sin seeds. La migración amplía la validación del núcleo privado y conserva los envoltorios de certificados y comprobantes. Pasaron 211 pruebas unitarias, `yarn lint`, `yarn typecheck`, `yarn build` y seis suites pgTAP vinculadas (003, 024, 025, 027, 030 y 033; 234 comprobaciones con `finish(true)` y rollback). El navegador confirmó RUC marcado obligatorio, patrón de 11 dígitos y rechazo de valor vacío en el formulario general. La publicación del frontend en producción continúa pendiente.


## Horas académicas y corrección de certificados — 30/09/2026

- Certificado incluido y opcional: exige horas mayores que cero en formulario, servidor, PostgreSQL y motor PDF. Actividades sin certificado conservan horas opcionales.
- Corrección explícita por actividad: carga un PDF versionado y actualiza sus horas bajo bloqueo; mantiene códigos, enlaces, fecha de emisión y los demás snapshots; no envía correos.
- Procesamiento en lotes de 20 con progreso y reintento de pendientes; certificados revocados y actividades archivadas se excluyen.
- Migración `202609300003_certificate_academic_hours_correction.sql` revisada con dry-run y aplicada a Supabase vinculado sin seeds ni backfill. Tipos vinculados regenerados y refinados.
- Pasaron las suites pgTAP 016, 020, 030, 031, 032 y 034 con `finish(true)` y rollback: 168 comprobaciones de permisos, horas positivas, snapshots, concurrencia, auditoría, ausencia de correos, emisión y tandas existentes.
- Evento real: II Encuentro Académico “A Otro Nivel”, id `c0a5e073-97d5-437c-a353-e6e5256edc2b`, actualizado por el operador a 3 horas; 143 certificados conservaban snapshot de 0. La consulta fue de lectura y no ejecutó su regeneración. La vista local solicita iniciar sesión en el panel administrativo para realizar la corrección explícita. El frontend en producción aún requiere publicación.

Validación final: 215 unitarias aprobadas, `yarn lint`, `yarn typecheck` y `yarn build` correctos. La consulta posterior confirmó 143 certificados vigentes con PDF y snapshot 0, actividad en 3 horas y cero actividades de prueba 034. La corrección masiva real sigue pendiente de ejecución administrativa. La revisión visual del panel autenticado está pendiente: el navegador local presentó el login.


Actualización de progreso del 30/09/2026: barra accesible con conteo, porcentaje y tiempo transcurrido en la regeneración por horas. El total usa el mismo filtro que procesa los PDF (actividad, vigencia, documento disponible y horas diferentes); se actualiza desde reemplazos confirmados por lote. Unitarias cubren lotes, terminación, avance parcial, reintento y valores ARIA. Revisión local autenticada: el panel mostró 0 de 23 pendientes, coherente con la consulta actual; esta comprobación fue de lectura y no inició ninguna regeneración.

Validación del progreso: 218 pruebas unitarias aprobadas y `yarn lint`, `yarn typecheck`, `yarn build` correctos. El cambio utiliza consultas existentes del esquema y no requiere migración. El avance se actualiza tras cada lote confirmado y el contador de tiempo se actualiza durante la espera.

Revisión del conteo parcial: consulta de solo lectura en Supabase para «A Otro Nivel» confirmó 143 certificados con PDF, 120 con las 3 horas actuales y 23 pendientes; la auditoría registra 120 correcciones. El contador de la ejecución no representa el acumulado histórico. Cada lote consulta ahora los pendientes restantes; solo anuncia finalización con cero pendientes y refresca el panel también después de una interrupción. La causa concreta de la interrupción del navegador no quedó verificada. No se inició una nueva regeneración durante esta revisión. Validación: 219 unitarias y `yarn lint`, `yarn typecheck`, `yarn build` aprobados.
