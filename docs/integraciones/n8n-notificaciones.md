# Integración de notificaciones con n8n

La aplicación conserva cada envío transaccional en `notification_outbox`. Un procesador autenticado reclama lotes pendientes y entrega cada notificación al webhook de n8n.

## Variables de entorno

```text
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
CRON_SECRET=
```

Todas son exclusivas del servidor. `N8N_WEBHOOK_SECRET` se envía a n8n mediante el encabezado `X-Webhook-Secret` y puede omitirse solo si el flujo dispone de otro mecanismo de autenticación.

## Contrato enviado a n8n

```json
{
  "notification_id": "uuid",
  "event_type": "activity_certificate_issued | course_certificate_issued",
  "recipient_email": "participante@example.com",
  "payload": {}
}
```

n8n debe responder con un estado HTTP `2xx` únicamente cuando haya aceptado el mensaje. Una respuesta distinta deja el registro disponible para reintento, con espera incremental y un máximo de cinco intentos automáticos.

## Ejecución del procesador

Un cron externo debe ejecutar:

```text
POST /api/notifications/process
Authorization: Bearer <CRON_SECRET>
```

El administrador también puede procesar la cola o reintentar un registro desde `/admin/notificaciones`.

La notificación `course_certificate_issued` se encola únicamente después de que el PDF quedó
almacenado. Un error del webhook nunca revierte la matrícula completada ni el certificado emitido.

## Decisión sobre fechas en certificados

Los certificados de actividades pueden mostrar sus fechas según la plantilla. Los cursos del campus son virtuales y sus certificados siempre omiten las fechas, incluso si la configuración visual de la plantilla las habilita.
