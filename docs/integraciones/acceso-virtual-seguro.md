# Acceso virtual seguro

Los enlaces de eventos y capacitaciones virtuales o híbridas se guardan en `activity_virtual_access`. Esta tabla no concede acceso a usuarios anónimos ni estudiantes y solo puede leerse desde sesiones internas activas o mediante `service_role`.

La columna histórica `activities.virtual_url` permanece temporalmente por compatibilidad de despliegue, pero se vacía durante la migración y la aplicación ya no escribe en ella. Puede eliminarse en una migración posterior, una vez confirmado que todas las instancias ejecutan la versión nueva.

## Entrega al participante

El mismo token opaco de resultado de inscripción protege la recuperación del acceso:

```text
/eventos|capacitaciones/{slug}/inscripcion/resultado
  ?codigo={registration_code}
  &solicitud={certificate_request_token}
```

El nombre heredado del parámetro y de la columna se conserva para no invalidar enlaces del Hito 14. El RPC seguro solo devuelve `virtual_access_url` cuando:

- coinciden código y token;
- la inscripción está confirmada y vigente;
- la actividad está publicada y no eliminada;
- la modalidad es virtual o híbrida;
- todavía existe al menos una sesión disponible.

La consulta basada únicamente en código, las consultas públicas de actividades, sitemap y JSON-LD nunca leen la tabla privada.

## Recordatorios

`activity_virtual_reminders` conserva la identidad de cada combinación inscripción/sesión. La notificación asociada usa `activity_virtual_session_reminder` y se agenda una hora antes mediante `notification_outbox.next_attempt_at`.

Las fechas y enlaces modificados se sincronizan sobre filas pendientes. Las entregas ya enviadas quedan intactas como historial. Cancelar la inscripción, cancelar o archivar la actividad, eliminarla o pasarla a presencial retira las entregas pendientes.

El workflow n8n programado consulta el endpoint interno cada cinco minutos. Por ello, el correo debería llegar entre 55 y 60 minutos antes del inicio, sujeto a disponibilidad de n8n, Gmail y la plataforma.
