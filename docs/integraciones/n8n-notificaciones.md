# Integración de notificaciones con n8n

La aplicación conserva cada envío transaccional en `notification_outbox`. Un procesador autenticado reclama lotes pendientes y entrega cada notificación al webhook de n8n.

## Variables de entorno

```text
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
```

Todas son exclusivas del servidor. `N8N_WEBHOOK_SECRET` se envía a n8n mediante el encabezado `X-Webhook-Secret`.

## Contrato enviado a n8n

```json
{
  "notification_id": "uuid",
  "event_type": "activity_free_registration_confirmed | activity_paid_preregistration_created | activity_paid_registration_confirmed | activity_certificate_offer | activity_certificate_request_created | activity_certificate_issued | course_certificate_issued",
  "recipient_email": "participante@example.com",
  "payload": {}
}
```

n8n debe responder con un estado HTTP `2xx` únicamente cuando Gmail haya enviado el mensaje. Una respuesta distinta registra la notificación como fallida, sin reintentos automáticos.

## Entrega inmediata

Cada operación que crea una notificación llama inmediatamente al webhook después de confirmar el cambio en Supabase:

- registro gratuito o preinscripción pagada;
- confirmación administrativa de una inscripción pagada;
- emisión de certificado de actividad;
- emisión de certificado de curso.
- oferta única de certificado opcional después de registrar asistencia;
- aviso interno al responsable cuando una persona solicita un certificado opcional.

No existe un scheduler ni un endpoint cron. Si una entrega falla, el administrador puede ejecutarla manualmente desde `/admin/notificaciones` y revisar el detalle de la ejecución en n8n.

La notificación `course_certificate_issued` se encola únicamente después de que el PDF quedó
almacenado. Un error del webhook nunca revierte la matrícula completada ni el certificado emitido.

## Workflow importable

El archivo [`n8n-workflow-eventos-cci.json`](./n8n-workflow-eventos-cci.json) contiene una sola rama:

1. Un webhook `POST /webhook/eventos-cci` que valida el evento, selecciona una plantilla HTML según `event_type`, envía el correo mediante Gmail y responde `200` solo después de la entrega.

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

Después de importarlo en n8n se deben configurar estas credenciales desde la interfaz. El workflow ya utiliza el dominio canónico `https://eventosycursos.camaraica.org.pe`:

| Nodo | Credencial | Configuración |
| --- | --- | --- |
| `Recibir notificación CCI` | Header Auth | Nombre `X-Webhook-Secret`; valor igual a `N8N_WEBHOOK_SECRET` de Vercel. |
| `Enviar correo Gmail` | Gmail OAuth2 | Cuenta institucional de Google autorizada para enviar los mensajes. |

Al activar el workflow, la URL de producción mostrada por el nodo Webhook debe guardarse como `N8N_WEBHOOK_URL` en Vercel. No se debe usar la URL temporal que contiene `/webhook-test/`.

## Decisión sobre fechas en certificados

Los certificados de actividades pueden mostrar sus fechas según la plantilla. Los cursos del campus son virtuales y sus certificados siempre omiten las fechas, incluso si la configuración visual de la plantilla las habilita.
