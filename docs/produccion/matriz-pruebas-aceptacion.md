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
| SEO y rendimiento público | `tests/unit/seo.test.ts` | Metadata, JSON-LD, sesiones múltiples, slugs, búsquedas seguras y analítica sin PII |

Los archivos usan transacciones con `rollback`; no conservan fixtures en la base vinculada.

## Escenarios obligatorios

| Escenario | Recorrido | Evidencia | Estado previo al lanzamiento |
|---|---|---|---|
| A — actividad gratuita | crear → publicar → registrar → confirmar automático → asistencia → certificado → token | 002, 003, 004 y 005 | Ejecutar smoke controlado |
| B — actividad pagada | crear → publicar → preinscribir → confirmar → asistencia → certificado → token | 002, 003, 004 y 005 | Ejecutar smoke controlado |
| C — curso gratuito | publicar → registrar alumno → matricular → progreso → quiz → completar → certificado → valorar | 006 a 010 | Ejecutar smoke controlado |
| D — curso pagado | publicar → alta manual → contenido → progreso → completar → certificado → valorar | 007 a 010 | Ejecutar smoke controlado |

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
