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
  "event_type": "activity_free_registration_confirmed | activity_paid_preregistration_created | activity_paid_registration_confirmed | activity_certificate_issued | course_certificate_issued",
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

No existe un scheduler ni un endpoint cron. Si una entrega falla, el administrador puede ejecutarla manualmente desde `/admin/notificaciones` y revisar el detalle de la ejecución en n8n.

La notificación `course_certificate_issued` se encola únicamente después de que el PDF quedó
almacenado. Un error del webhook nunca revierte la matrícula completada ni el certificado emitido.

## Workflow importable

El archivo [`n8n-workflow-eventos-cci.json`](./n8n-workflow-eventos-cci.json) contiene una sola rama:

1. Un webhook `POST /webhook/eventos-cci` que valida el evento, selecciona una plantilla HTML según `event_type`, envía el correo mediante Gmail y responde `200` solo después de la entrega.

Después de importarlo en n8n se debe reemplazar `https://REEMPLAZAR-DOMINIO` en el nodo que prepara el correo y configurar estas credenciales desde la interfaz de n8n:

| Nodo | Credencial | Configuración |
| --- | --- | --- |
| `Recibir notificación CCI` | Header Auth | Nombre `X-Webhook-Secret`; valor igual a `N8N_WEBHOOK_SECRET` de Vercel. |
| `Enviar correo Gmail` | Gmail OAuth2 | Cuenta institucional de Google autorizada para enviar los mensajes. |

Al activar el workflow, la URL de producción mostrada por el nodo Webhook debe guardarse como `N8N_WEBHOOK_URL` en Vercel. No se debe usar la URL temporal que contiene `/webhook-test/`.

## Decisión sobre fechas en certificados

Los certificados de actividades pueden mostrar sus fechas según la plantilla. Los cursos del campus son virtuales y sus certificados siempre omiten las fechas, incluso si la configuración visual de la plantilla las habilita.
