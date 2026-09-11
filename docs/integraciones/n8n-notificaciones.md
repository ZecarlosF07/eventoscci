# Integración de notificaciones con n8n

La aplicación conserva cada envío transaccional en `notification_outbox`. Un procesador autenticado reclama lotes pendientes y entrega cada notificación al webhook de n8n.

## Variables de entorno

```text
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
NOTIFICATION_CRON_SECRET=
```

Todas son exclusivas del servidor. `N8N_WEBHOOK_SECRET` se envía a n8n mediante el encabezado `X-Webhook-Secret`. `NOTIFICATION_CRON_SECRET` debe ser un valor largo y diferente; el workflow programado lo envía como `Authorization: Bearer <secreto>`.

## Contrato enviado a n8n

```json
{
  "notification_id": "uuid",
  "event_type": "activity_free_registration_confirmed | activity_paid_preregistration_created | activity_paid_registration_confirmed | activity_virtual_session_reminder | activity_certificate_offer | activity_certificate_request_created | activity_certificate_issued | course_certificate_issued",
  "recipient_email": "participante@example.com",
  "payload": {}
}
```

n8n debe responder con un estado HTTP `2xx` únicamente cuando Gmail haya enviado el mensaje. Una respuesta distinta registra la notificación como fallida. Las entregas transaccionales conservan el reintento manual; los recordatorios programados aplican el reintento automático descrito más abajo.

## Entrega inmediata

Cada operación que crea una notificación llama inmediatamente al webhook después de confirmar el cambio en Supabase:

- registro gratuito o preinscripción pagada;
- confirmación administrativa de una inscripción pagada;
- emisión de certificado de actividad;
- emisión de certificado de curso.
- oferta única de certificado opcional después de registrar asistencia;
- aviso interno al responsable cuando una persona solicita un certificado opcional.

Los correos transaccionales continúan enviándose inmediatamente. Los recordatorios virtuales se programan en `notification_outbox` con `next_attempt_at` y se procesan mediante `POST /api/internal/notifications/process`, autenticado con `NOTIFICATION_CRON_SECRET`.

El procesador reclama exclusivamente `activity_virtual_session_reminder`, en lotes de 20. Recupera filas que lleven más de 15 minutos en `processing`, aplica hasta cinco intentos con espera incremental y nunca procesa recordatorios de sesiones que ya comenzaron. Los demás correos conservan el envío inmediato y su reintento manual desde `/admin/notificaciones`.

La notificación `course_certificate_issued` se encola únicamente después de que el PDF quedó
almacenado. Un error del webhook nunca revierte la matrícula completada ni el certificado emitido.

## Workflow importable

El archivo [`n8n-workflow-eventos-cci.json`](./n8n-workflow-eventos-cci.json) contiene una sola rama:

1. Un webhook `POST /webhook/eventos-cci` que valida el evento, selecciona una plantilla HTML según `event_type`, envía el correo mediante Gmail y responde `200` solo después de la entrega.

El archivo [`n8n-workflow-recordatorios-virtuales.json`](./n8n-workflow-recordatorios-virtuales.json) ejecuta cada cinco minutos el endpoint interno. Después de importarlo se debe crear una credencial Header Auth con:

```text
Name: Authorization
Value: Bearer <mismo NOTIFICATION_CRON_SECRET configurado en Vercel>
```

El código fuente legible del nodo de preparación se conserva en
[`n8n-preparar-correo.js`](./n8n-preparar-correo.js). El JSON importable ya contiene esa misma versión.

Los correos de inscripción presentan la certificación de manera condicional:

- `included`: informa que el certificado está incluido y no muestra una llamada comercial;
- `optional_paid`: muestra la tarifa capturada; si el checkbox fue marcado, confirma que la solicitud ya está registrada y, una vez confirmada la participación, enlaza al resultado seguro para continuar por WhatsApp;
- `none`: mantiene el correo sin referencias al certificado.

El evento `activity_certificate_offer` se crea una sola vez al pasar una asistencia confirmada a
`attended`. El evento `activity_certificate_request_created` se dirige al correo del responsable y
no sustituye el aviso persistente de la vista de inscripciones. Un fallo de cualquiera de estos correos
queda en `notification_outbox` y nunca revierte asistencia ni solicitud.

## Acceso virtual

- Una inscripción gratuita confirmada recibe fechas, modalidad y enlace virtual en su primer correo.
- Una preinscripción pagada nunca recibe el enlace; se incorpora únicamente al correo emitido después de la confirmación administrativa.
- Las actividades híbridas muestran tanto la sede como el acceso virtual.
- El botón de acceso y la acción del certificado son independientes y pueden aparecer juntos.
- Se programa un recordatorio por cada sesión que se encuentre a más de una hora al momento de confirmar la inscripción.
- Si la confirmación ocurre faltando una hora o menos, el correo de confirmación es suficiente y no se crea un segundo envío inmediato.
- Los recordatorios pendientes se actualizan al cambiar el enlace o las fechas; los ya enviados se conservan como historial.
- El procesador programado ofrece entrega con reintentos, pero sigue siendo un sistema de entrega al menos una vez: una interrupción después del envío y antes de guardar el estado podría producir excepcionalmente un duplicado.

Después de importarlo en n8n se deben configurar estas credenciales desde la interfaz. El workflow ya utiliza el dominio canónico `https://eventosycursos.camaraica.org.pe`:

| Nodo | Credencial | Configuración |
| --- | --- | --- |
| `Recibir notificación CCI` | Header Auth | Nombre `X-Webhook-Secret`; valor igual a `N8N_WEBHOOK_SECRET` de Vercel. |
| `Enviar correo Gmail` | Gmail OAuth2 | Cuenta institucional de Google autorizada para enviar los mensajes. |
| `Procesar recordatorios vencidos` | Header Auth | Nombre `Authorization`; valor `Bearer ` seguido por `NOTIFICATION_CRON_SECRET`. |

Al activar el workflow, la URL de producción mostrada por el nodo Webhook debe guardarse como `N8N_WEBHOOK_URL` en Vercel. No se debe usar la URL temporal que contiene `/webhook-test/`.

## Decisión sobre fechas en certificados

Los certificados de actividades pueden mostrar sus fechas según la plantilla. Los cursos del campus son virtuales y sus certificados siempre omiten las fechas, incluso si la configuración visual de la plantilla las habilita.
