# HITO 5 — CERTIFICADOS Y NOTIFICACIONES DE EVENTOS Y CAPACITACIONES

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 5 tiene como finalidad completar el ciclo funcional de los eventos y capacitaciones mediante la **emisión de certificados** y las **notificaciones transaccionales principales** asociadas a estos procesos.

Al finalizar el Hito 4, la plataforma ya deberá permitir:

- registrar inscripciones;
- diferenciar preinscritos y confirmados;
- confirmar inscripciones con costo;
- registrar asistencia;
- identificar quién asistió;
- mantener el historial institucional del participante.

El Hito 5 utilizará esa información para permitir que la Cámara seleccione a los participantes que cumplen las condiciones establecidas y les habilite un certificado.

La emisión de certificados de eventos y capacitaciones **no será automática únicamente por registrar asistencia**.

El flujo definido será:

**Registrar asistencia → Revisar asistentes → Seleccionar participantes → Habilitar certificado → Generar certificado → Enviar notificación → Participante accede sin cuenta.**

Solamente las personas marcadas como asistentes podrán recibir certificados.

Los participantes de eventos y capacitaciones continuarán sin necesitar una cuenta para acceder a su certificado.

---

# 2. Objetivo del hito

Implementar el sistema de certificados institucionales para eventos y capacitaciones, junto con las notificaciones transaccionales necesarias para completar el recorrido operativo del participante.

El hito deberá permitir:

1. definir plantillas institucionales;
2. configurar firmantes;
3. seleccionar participantes que asistieron;
4. emitir certificados individualmente o en grupo;
5. generar códigos únicos;
6. conservar snapshots históricos de la información certificada;
7. almacenar el archivo generado;
8. permitir acceso mediante token sin login;
9. enviar o preparar las notificaciones transaccionales del módulo de actividades;
10. mantener trazabilidad administrativa sobre la emisión y eventual revocación.

Con este hito deberá quedar completo el primer gran recorrido funcional del MVP:

**Crear actividad → Publicar → Inscripción → Confirmación → Asistencia → Certificado.**

---

# 3. Alcance del hito

El Hito 5 comprende:

- plantillas de certificados;
- firmantes;
- certificados de eventos y capacitaciones;
- generación de código único;
- snapshots;
- archivo del certificado;
- token de acceso público;
- habilitación administrativa;
- emisión individual;
- emisión múltiple;
- consulta administrativa;
- revocación;
- acceso sin cuenta;
- almacenamiento de archivos;
- cola de notificaciones;
- notificaciones de inscripción y confirmación;
- notificación de certificado emitido;
- manejo de estados de envío;
- reintentos de notificación cuando corresponda.

No comprende todavía:

- certificados automáticos de cursos;
- Campus Virtual;
- certificados dentro de “Mis certificados”;
- verificación pública mediante código;
- pasarela de pagos;
- WhatsApp masivo;
- campañas de marketing;
- facturación electrónica.

---

# 4. Regla funcional principal de certificados

Para eventos y capacitaciones deberán cumplirse estas condiciones:

```text
Inscripción válida
      +
Asistencia = attended
      +
Acción administrativa de habilitación
      ↓
Certificado
```

No deberá implementarse:

```text
attendance = attended
↓
certificado automático
```

La Cámara deberá disponer de una revisión administrativa previa antes de emitir los certificados.

---

# 5. Tareas del hito

## 5.1 Crear tabla `certificate_templates`

## Objetivo

Permitir definir las plantillas institucionales que se utilizarán para generar certificados.

## Campos

Implementar:

```text
id
name
scope
background_path
template_config
is_default
is_active
created_at
updated_at
deleted_at
deleted_by
```

El campo:

`scope`

deberá utilizar el tipo de certificado correspondiente.

Para este hito se utilizará principalmente:

`activity`

El mismo modelo podrá reutilizarse posteriormente para certificados de cursos.

---

# 6. Configuración de plantilla

La plantilla deberá permitir guardar la configuración necesaria para generar el documento institucional.

El campo:

`template_config`

podrá contener en formato `jsonb` información visual o de posicionamiento que realmente corresponda a la plantilla.

La estructura exacta del JSON deberá definirse durante la implementación del generador.

No deberá utilizarse JSON para reemplazar relaciones que ya poseen una estructura relacional clara.

---

# 7. Imagen o fondo de certificado

El campo:

`background_path`

deberá permitir relacionar la plantilla con su fondo institucional.

El archivo deberá almacenarse mediante un mecanismo de almacenamiento de archivos, preferentemente Supabase Storage dentro de la arquitectura definida.

No deberá almacenarse el archivo binario directamente dentro de PostgreSQL.

---

# 8. Crear tabla `certificate_template_signers`

## Objetivo

Permitir administrar los firmantes correspondientes a cada plantilla.

## Campos

```text
id
template_id
signer_name
signer_title
signature_path
sort_order
created_at
updated_at
deleted_at
deleted_by
```

Una plantilla podrá tener uno o varios firmantes.

---

# 9. Gestión administrativa de firmantes

El administrador deberá poder:

- registrar nombre del firmante;
- registrar cargo;
- cargar/configurar firma;
- establecer orden;
- retirar lógicamente un firmante;
- reutilizar la configuración mientras la plantilla permanezca activa.

La información final incorporada al certificado deberá quedar reflejada en el documento emitido.

---

# 10. Crear tabla `certificates`

## Objetivo

Representar cada certificado emitido por la plataforma.

## Campos

Implementar:

```text
id
person_id
template_id
registration_id
course_enrollment_id
certificate_type
certificate_code
status
participant_name_snapshot
title_snapshot
condition_snapshot
date_text_snapshot
academic_hours_snapshot
file_path
access_token
issued_at
issued_by
revoked_at
revoked_by
revocation_reason
created_at
updated_at
deleted_at
deleted_by
```

Para certificados de actividades:

```text
registration_id != NULL
course_enrollment_id = NULL
certificate_type = activity
```

La base de datos deberá garantizar que exista exactamente un origen válido.

---

# 11. Crear enum `certificate_type`

Implementar:

```text
activity
course
```

Aunque el Hito 5 utilice únicamente `activity`, se mantendrá el tipo completo aprobado para reutilizar la misma infraestructura posteriormente.

---

# 12. Crear enum `certificate_status`

Implementar:

```text
issued
revoked
```

Los estados deberán representar hechos históricos.

Un certificado revocado no deberá eliminarse físicamente.

---

# 13. Código único de certificado

Cada certificado deberá generar un código único.

Ejemplo:

```text
CCI-CERT-2026-000245
```

El código:

- será visible administrativamente;
- será independiente del UUID;
- será único;
- nunca deberá reutilizarse;
- deberá conservarse aunque posteriormente el certificado sea revocado.

Implementar:

```text
UNIQUE(certificate_code)
```

---

# 14. Token de acceso

Cada certificado deberá disponer de:

`access_token`

como UUID suficientemente aleatorio.

Implementar:

```text
UNIQUE(access_token)
```

El token permitirá que una persona acceda al certificado sin necesidad de autenticarse.

No deberá exponerse el ID interno del certificado como mecanismo principal de acceso público.

---

# 15. Snapshots del certificado

El certificado deberá conservar una copia histórica de la información utilizada durante su emisión.

Guardar:

- `participant_name_snapshot`;
- `title_snapshot`;
- `condition_snapshot`;
- `date_text_snapshot`;
- `academic_hours_snapshot`.

Esto permitirá que cambios posteriores en:

- nombre de la actividad;
- datos de la persona;
- horas académicas;
- información administrativa;

no modifiquen retroactivamente la información de un certificado ya emitido.

---

# 16. Condición del certificado

El certificado podrá incluir una condición correspondiente.

Ejemplos establecidos funcionalmente:

```text
Participó
Culminó
Aprobó
```

Para eventos y capacitaciones deberá utilizarse la condición correspondiente definida por administración o por configuración de la actividad/plantilla.

El modelo deberá evitar limitarse exclusivamente a una única palabra fija.

---

# 17. Horas académicas

Los certificados podrán mostrar:

`academic_hours`

cuando corresponda.

En eventos podrán no utilizarse.

En capacitaciones podrán utilizarse cuando hayan sido configuradas.

El certificado deberá conservar:

`academic_hours_snapshot`

para preservar el valor histórico.

---

# 18. Crear sección administrativa de certificados

Crear:

`/admin/certificados`

y una sección específica equivalente a:

`/admin/certificados/actividades`

Desde esta área deberá ser posible consultar certificados de eventos y capacitaciones.

---

# 19. Gestión de plantillas

Crear:

`/admin/certificados/plantillas`

Como mínimo deberá permitir:

- listar plantillas;
- crear;
- editar;
- activar/desactivar;
- seleccionar plantilla predeterminada;
- configurar fondo;
- configurar firmantes.

Podrán existir rutas equivalentes a:

```text
/admin/certificados/plantillas/nueva
/admin/certificados/plantillas/[id]
```

---

# 20. Integración con actividad

Desde una actividad administrativa deberá existir una sección o acceso equivalente a:

**Certificados**

El administrador deberá poder visualizar:

- participantes confirmados;
- asistencia;
- elegibilidad para certificado;
- certificados ya emitidos.

---

# 21. Elegibilidad para certificado

Una persona deberá ser elegible únicamente cuando:

```text
registration.status = confirmed
```

y:

```text
attendance.status = attended
```

Cuando no se cumpla esta condición, la interfaz no deberá permitir la emisión normal del certificado.

---

# 22. Participante pendiente

Una inscripción con:

`status = pending`

no deberá permitir emisión de certificado.

Aunque accidentalmente exista un estado de asistencia asociado, la inscripción deberá estar confirmada antes de emitir.

---

# 23. Participante ausente

Cuando:

```text
attendance.status = absent
```

no deberá habilitarse la acción normal de certificado.

---

# 24. Asistencia pendiente

Cuando:

```text
attendance.status = pending
```

tampoco deberá habilitarse certificado.

La Cámara deberá registrar previamente la asistencia.

---

# 25. Habilitación administrativa

La administración deberá seleccionar:

- un participante;
- varios participantes;

y ejecutar una acción equivalente a:

**Habilitar certificados**

Esta acción será explícita.

No deberá generarse automáticamente por el simple hecho de que una persona haya asistido.

---

# 26. Emisión individual

Deberá permitirse generar el certificado de una persona elegible.

La operación deberá:

1. volver a comprobar elegibilidad;
2. seleccionar plantilla;
3. obtener información necesaria;
4. crear código único;
5. crear token;
6. capturar snapshots;
7. generar documento;
8. almacenar archivo;
9. crear registro `certificates`;
10. registrar `issued_at`;
11. registrar `issued_by`;
12. crear evento de notificación.

---

# 27. Emisión múltiple

La administración deberá poder seleccionar varios asistentes y generar/habilitar sus certificados.

La operación deberá manejar correctamente:

- participantes elegibles;
- participantes que ya tienen certificado;
- errores parciales;
- duplicados.

No deberá generar dos certificados activos para el mismo origen cuando la operación sea repetida accidentalmente.

---

# 28. Prevención de certificado duplicado

La lógica deberá evitar que una misma inscripción genere múltiples certificados equivalentes por doble clic o repetición accidental.

La implementación exacta podrá utilizar:

- restricción;
- índice;
- función PostgreSQL/RPC;
- lógica transaccional equivalente.

La protección final no deberá depender únicamente de deshabilitar un botón.

---

# 29. Generación del documento

El certificado deberá generarse a partir de:

- plantilla;
- participante;
- actividad;
- fecha;
- condición;
- horas académicas;
- firmantes;
- código.

La tecnología exacta para generar el PDF **no está definida en los documentos del proyecto** y deberá seleccionarse durante la implementación de este hito.

La arquitectura técnica sí establece que, al tratarse de generación documental y potencial acceso a almacenamiento privado, esta operación puede requerir ejecución del lado servidor.

---

# 30. Procesamiento servidor

Si la generación del certificado requiere:

- librería exclusivamente de servidor;
- claves privadas;
- firma;
- acceso privilegiado;
- generación de archivo;

se deberá utilizar una solución de servidor apropiada.

Dentro de la arquitectura definida podrá utilizarse un:

`Route Handler`

cuando exista una razón real para que la operación no se ejecute directamente desde el navegador.

No deberá crearse un API CRUD general únicamente por este módulo.

---

# 31. Almacenamiento de certificados

Los archivos generados deberán almacenarse de forma controlada.

Se propone utilizar un bucket equivalente a:

`certificates`

Los certificados deberán considerarse archivos privados.

El `file_path` deberá almacenarse en la tabla `certificates`.

---

# 32. Acceso seguro al archivo

El participante no deberá recibir necesariamente una URL permanente y pública del archivo.

La arquitectura podrá utilizar:

- archivo privado;
- token público de la aplicación;
- URL firmada temporal de Supabase Storage;

para permitir la descarga correspondiente.

Supabase Storage podrá formar parte de esta estrategia, tal como se estableció en el diseño técnico.

---

# 33. Crear página pública de certificado

Crear:

`/certificados/[token]`

La página deberá resolver:

```text
token
↓
certificate.access_token
↓
certificado correspondiente
```

No requerirá login.

---

# 34. Información pública del certificado

La página podrá mostrar como mínimo:

- participante;
- actividad;
- condición;
- fecha;
- horas académicas cuando corresponda;
- código;
- botón o acción de descarga.

No deberá mostrar información administrativa sensible.

---

# 35. Certificado inexistente

Cuando el token no exista:

- mostrar estado `not found`;
- no revelar información técnica;
- no intentar adivinar certificados cercanos.

---

# 36. Certificado revocado

Cuando:

`status = revoked`

la página deberá informar que el certificado ya no se encuentra vigente/disponible según la experiencia definida.

No deberá entregarse silenciosamente como certificado vigente.

---

# 37. Revocación administrativa

El administrador deberá poder revocar un certificado cuando exista una razón válida.

Registrar:

```text
status = revoked
revoked_at
revoked_by
revocation_reason
```

La revocación no deberá borrar el registro ni reutilizar el código.

---

# 38. Soft delete y revocación

Un certificado revocado:

```text
status = revoked
```

no equivale a:

```text
deleted_at IS NOT NULL
```

Los estados deberán preservar correctamente el historial.

---

# 39. Crear tabla `notification_outbox`

## Objetivo

Desacoplar las operaciones principales de negocio del proceso de envío de notificaciones.

## Campos

Crear:

```text
id
person_id
event_type
recipient_email
related_entity_type
related_entity_id
payload
status
attempts
next_attempt_at
last_error
sent_at
created_at
updated_at
deleted_at
deleted_by
```

La estructura deberá seguir el diseño físico aprobado.

---

# 40. Crear enum `notification_status`

Implementar:

```text
pending
processing
sent
failed
cancelled
```

---

# 41. Eventos de notificación de actividades

El sistema deberá contemplar inicialmente:

```text
activity_free_registration_confirmed
activity_paid_preregistration_created
activity_paid_registration_confirmed
activity_certificate_issued
```

Estos eventos corresponden a los procesos definidos funcionalmente para actividades.

---

# 42. Notificación de inscripción gratuita

Cuando una persona se inscriba correctamente a una actividad gratuita deberá generarse:

`activity_free_registration_confirmed`

El mensaje deberá comunicar claramente que:

**la inscripción está confirmada.**

Este evento se origina funcionalmente desde el proceso desarrollado en el Hito 3.

---

# 43. Notificación de preinscripción con costo

Cuando una actividad con costo genere:

`status = pending`

deberá utilizarse:

`activity_paid_preregistration_created`

La comunicación deberá dejar claro que:

- el registro fue recibido;
- todavía no está confirmado;
- deberá coordinarse con la Cámara.

---

# 44. Notificación de confirmación manual

Cuando en el Hito 4 una inscripción pase:

`pending → confirmed`

deberá generarse:

`activity_paid_registration_confirmed`

El participante deberá recibir la confirmación correspondiente.

---

# 45. Notificación de certificado

Cuando se emita un certificado de actividad deberá generarse:

`activity_certificate_issued`

El mensaje deberá permitir al participante acceder a su certificado.

---

# 46. Separación entre negocio y contenido de correo

Las funciones como:

- registrar inscripción;
- confirmar inscripción;
- emitir certificado;

no deberán contener todo el HTML o diseño final del correo.

Deberán generar un evento y un payload suficiente para que la capa responsable de notificaciones construya o envíe el mensaje.

---

# 47. Contenido del payload

El `payload` podrá contener la información necesaria para producir el mensaje.

Por ejemplo:

- nombre del participante;
- actividad;
- código de inscripción;
- estado;
- enlace al certificado;
- información de contacto.

El payload deberá incluir únicamente la información necesaria para la notificación correspondiente.

---

# 48. Proveedor de correo

El proveedor exacto de correo **no ha sido definido en los documentos técnicos como una decisión definitiva**.

El análisis previo contempla que puede utilizarse:

- servicio especializado;
- n8n;
- integración externa.

Si el proveedor utiliza una API key privada, esta no deberá enviarse al navegador.

La integración deberá ejecutarse mediante contexto seguro, como Route Handler u otra función backend apropiada.

---

# 49. Integración con n8n

La definición funcional contempla automatización de los correos transaccionales principales.

Si el equipo mantiene n8n como solución de automatización, `notification_outbox` podrá actuar como punto de integración.

La decisión concreta de consumo, polling, webhook o mecanismo equivalente deberá establecerse durante la implementación, ya que el documento físico define la cola pero no prescribe un único mecanismo de integración.

---

# 50. Reintentos

`notification_outbox` deberá permitir manejar fallos mediante:

- `attempts`;
- `next_attempt_at`;
- `last_error`.

Una falla del proveedor de correo no deberá provocar que el certificado desaparezca o que se revierta una inscripción correctamente registrada.

La operación de negocio y la entrega de notificación deberán permanecer desacopladas.

---

# 51. Estados de notificación

## `pending`

Esperando procesamiento.

## `processing`

Actualmente en proceso.

## `sent`

Enviado correctamente.

## `failed`

No fue posible completar el envío después del procesamiento correspondiente.

## `cancelled`

La notificación fue cancelada y no debe procesarse.

---

# 52. Idempotencia de notificaciones

El sistema deberá evitar el envío repetido accidental del mismo evento cuando la operación administrativa se ejecute varias veces.

Ejemplo:

Si una inscripción ya estaba confirmada, volver a pulsar Confirmar no deberá crear indefinidamente:

`activity_paid_registration_confirmed`

La misma consideración deberá aplicarse a certificados.

---

# 53. Consulta administrativa de notificaciones

No es obligatorio construir un sistema completo de marketing o mailing.

Sin embargo, deberá existir capacidad técnica suficiente para consultar:

- estado;
- intentos;
- último error;
- fecha de envío;

cuando sea necesario diagnosticar una notificación transaccional.

---

# 54. Auditoría de certificados

Las operaciones administrativas relevantes deberán quedar preparadas para `audit_logs`.

Auditar prioritariamente:

- emisión;
- revocación;
- habilitación;
- modificación de plantilla;
- modificación de firmantes;

cuando corresponda según la implementación de auditoría adoptada.

---

# 55. Estructura por features

Mantener separación de responsabilidades:

```text
src/features/
    certificates/
    notifications/
```

Ejemplo:

```text
certificates/
    components/
    queries/
    mutations/
    schemas/
    types/
    utils/

notifications/
    queries/
    mutations/
    types/
```

---

# 56. Queries de certificados

Crear operaciones equivalentes a:

```text
getActivityCertificates()
getCertificateByToken()
getCertificatesByRegistration()
getEligibleParticipantsForCertificates()
getCertificateTemplates()
```

Los nombres exactos podrán variar.

---

# 57. Mutations de certificados

Crear operaciones equivalentes a:

```text
issueCertificate()
bulkIssueCertificates()
revokeCertificate()
createCertificateTemplate()
updateCertificateTemplate()
```

Las operaciones sensibles podrán utilizar RPC o procesamiento servidor cuando resulte técnicamente necesario.

---

# 58. Queries de notificaciones

Crear operaciones equivalentes a:

```text
getNotificationStatus()
getPendingNotifications()
```

principalmente para operación y diagnóstico administrativo cuando corresponda.

---

# 59. Atomic Design aplicado al Hito 5

## Atoms

Reutilizar:

- Button;
- Badge;
- Checkbox;
- Text;
- Spinner;
- Input.

## Molecules

Crear/reutilizar:

```text
StatusBadge
CertificateStatus
SignerField
DownloadAction
```

## Organisms

Crear componentes equivalentes a:

```text
CertificateTemplatesTable
CertificateEligibleParticipantsTable
CertificateCard
CertificateTemplateForm
CertificateSignersEditor
```

## Templates

Podrán utilizarse estructuras como:

```text
CertificatesManagementTemplate
CertificatePublicTemplate
CertificateTemplateEditor
```

---

# 60. Requerimientos técnicos

## RT-01 — Modelo central de certificados

Deberá utilizarse una tabla central:

`certificates`

capaz de soportar posteriormente tanto actividades como cursos.

---

## RT-02 — Origen único

Para certificados de actividades:

`registration_id`

deberá ser el origen.

No deberá existir simultáneamente un `course_enrollment_id`.

---

## RT-03 — Plantillas

Las plantillas deberán almacenarse en:

`certificate_templates`.

---

## RT-04 — Firmantes

Los firmantes deberán almacenarse en:

`certificate_template_signers`.

---

## RT-05 — Código

`certificate_code` deberá ser único.

---

## RT-06 — Token

`access_token` deberá ser único y suficientemente aleatorio.

---

## RT-07 — Snapshots

Los certificados deberán almacenar los snapshots definidos en el diseño físico.

---

## RT-08 — Elegibilidad

La emisión deberá volver a validar:

```text
registration.status = confirmed
AND
attendance.status = attended
```

en la lógica confiable.

No deberá depender exclusivamente de que el botón esté habilitado.

---

## RT-09 — Emisión manual

La asistencia no deberá generar automáticamente certificados de actividades.

---

## RT-10 — Idempotencia

La emisión repetida no deberá crear certificados duplicados para el mismo origen.

---

## RT-11 — Generación documental

La generación del archivo deberá realizarse en el entorno técnicamente apropiado.

Si requiere ejecución segura del lado servidor, deberá utilizarse procesamiento servidor.

---

## RT-12 — Storage

Los archivos de certificados deberán almacenarse fuera de PostgreSQL.

---

## RT-13 — Archivos privados

Los certificados deberán tratarse como archivos privados.

---

## RT-14 — Acceso sin cuenta

El acceso deberá resolverse mediante:

`access_token`

y no requerir Supabase Auth.

---

## RT-15 — URLs firmadas

Podrán utilizarse URLs firmadas temporales de Storage para entregar el archivo privado.

---

## RT-16 — Revocación

La revocación deberá utilizar estados funcionales, no eliminación física.

---

## RT-17 — Cola de notificaciones

Deberá utilizarse:

`notification_outbox`

para desacoplar notificaciones del proceso principal.

---

## RT-18 — Estado de notificación

Deberán utilizarse los estados definidos en `notification_status`.

---

## RT-19 — Reintentos

La estructura deberá soportar intentos y programación de reintentos.

---

## RT-20 — Secretos

Cualquier clave privada del proveedor de correo deberá mantenerse fuera del navegador.

---

## RT-21 — Route Handler

Solo deberá utilizarse cuando exista una necesidad real de procesamiento servidor, secretos o integración externa.

---

## RT-22 — TypeScript

Las operaciones de certificado y notificación deberán estar tipadas.

---

## RT-23 — Soft Delete

Las tablas correspondientes deberán mantener:

```text
deleted_at
deleted_by
```

según el modelo aprobado.

---

## RT-24 — Índices

Crear índices relevantes para:

```text
certificates(person_id)
certificates(certificate_code)
notification_outbox(status, next_attempt_at)
```

además de los necesarios para claves foráneas y búsquedas.

---

## RT-25 — RLS

Todas las tablas y objetos de Storage creados en este hito deberán aplicar RLS o políticas equivalentes desde su creación.

Las operaciones administrativas requerirán roles internos autorizados. El acceso público a un certificado deberá devolver únicamente el registro asociado a un token válido, sin permitir enumeración ni lectura general de certificados, personas o inscripciones.

El Hito 11 realizará la auditoría global y el endurecimiento final.

---

# 61. Requerimientos funcionales

## RF-01 — Plantilla institucional

La Cámara deberá poder disponer de al menos una plantilla institucional activa para certificados de actividades.

---

## RF-02 — Firmantes

La plantilla deberá permitir configurar uno o varios firmantes.

---

## RF-03 — Asistencia obligatoria

Solamente participantes con:

`attendance = attended`

podrán recibir certificado.

---

## RF-04 — Confirmación obligatoria

La inscripción deberá encontrarse confirmada.

---

## RF-05 — Acción administrativa

El certificado no deberá emitirse automáticamente por asistencia.

---

## RF-06 — Selección individual

El administrador deberá poder seleccionar un asistente y emitir su certificado.

---

## RF-07 — Selección múltiple

El administrador deberá poder emitir certificados a varios asistentes elegibles.

---

## RF-08 — Código único

Cada certificado deberá recibir un código único.

---

## RF-09 — Nombre histórico

El nombre utilizado durante la emisión deberá almacenarse como snapshot.

---

## RF-10 — Actividad histórica

El nombre de la actividad deberá almacenarse como snapshot.

---

## RF-11 — Condición

El certificado deberá permitir indicar la condición correspondiente.

---

## RF-12 — Horas académicas

El certificado podrá contener horas académicas cuando corresponda.

---

## RF-13 — Archivo

El certificado deberá quedar asociado a un archivo generado.

---

## RF-14 — Acceso sin login

Un participante de eventos o capacitaciones deberá poder acceder al certificado sin crear una cuenta.

---

## RF-15 — Token

El enlace deberá utilizar un token que no exponga directamente IDs internos.

---

## RF-16 — Descarga

El participante deberá poder descargar su certificado desde el enlace recibido.

---

## RF-17 — Certificado revocado

Un certificado revocado no deberá presentarse como vigente.

---

## RF-18 — Inscripción gratuita

La inscripción gratuita deberá generar su notificación de confirmación.

---

## RF-19 — Preinscripción con costo

La preinscripción deberá comunicar claramente que todavía no está confirmada.

---

## RF-20 — Confirmación con costo

Al confirmar administrativamente una inscripción con costo deberá generarse su notificación de confirmación.

---

## RF-21 — Certificado emitido

Cuando el certificado sea emitido deberá generarse una notificación con acceso al mismo.

---

## RF-22 — Sin cuenta

Ninguna de estas notificaciones deberá obligar al participante de actividad a crear una cuenta.

---

## RF-23 — Historial

El certificado deberá permanecer relacionado con:

- persona;
- inscripción;
- actividad mediante la inscripción.

---

## RF-24 — Revocación histórica

La revocación deberá preservar el registro histórico del certificado.

---

# 62. Fuera del alcance del Hito 5

No forma parte de este hito:

- verificación pública avanzada de certificados;
- búsqueda pública por código;
- blockchain;
- QR avanzado de verificación;
- certificados de cursos;
- certificado automático de curso;
- login de estudiantes;
- Campus Virtual;
- mensajería masiva por WhatsApp;
- campañas de correo;
- newsletter;
- marketing automation;
- pasarela de pagos;
- facturación;
- comunicación automática de cambios o cancelaciones de actividades.

Estas funcionalidades continúan fuera del MVP o serán abordadas en hitos posteriores.

---

# 63. Definition of Done

El Hito 5 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe `certificate_type`.
- [ ] Existe `certificate_status`.
- [ ] Existe `notification_status`.
- [ ] Existe `certificate_templates`.
- [ ] Existe `certificate_template_signers`.
- [ ] Existe `certificates`.
- [ ] Existe `notification_outbox`.
- [ ] Todas las foreign keys correspondientes funcionan.
- [ ] Existe la restricción de origen correcto del certificado.
- [ ] `certificate_code` es único.
- [ ] `access_token` es único.
- [ ] Existen los snapshots requeridos.
- [ ] Se implementó soft delete donde corresponde.
- [ ] Funcionan los triggers de `updated_at`.
- [ ] Existen los índices definidos.
- [ ] Todo fue creado mediante migraciones versionadas.

## Plantillas

- [ ] Se puede crear una plantilla.
- [ ] Se puede editar.
- [ ] Se puede activar/desactivar.
- [ ] Se puede definir como predeterminada cuando corresponda.
- [ ] Se puede configurar fondo.
- [ ] Se pueden agregar firmantes.
- [ ] Se pueden ordenar firmantes.
- [ ] Se pueden retirar lógicamente firmantes.

## Elegibilidad

- [ ] Una inscripción pendiente no puede recibir certificado.
- [ ] Una inscripción cancelada no puede recibir certificado.
- [ ] Una persona con asistencia pendiente no puede recibir certificado.
- [ ] Una persona ausente no puede recibir certificado.
- [ ] Una inscripción confirmada + asistencia attended sí es elegible.
- [ ] La regla se valida en lógica confiable y no únicamente en UI.

## Emisión

- [ ] Se puede emitir un certificado individual.
- [ ] Se pueden seleccionar múltiples asistentes.
- [ ] La emisión múltiple funciona.
- [ ] Se genera código único.
- [ ] Se genera token.
- [ ] Se guardan snapshots.
- [ ] Se registra `issued_at`.
- [ ] Se registra `issued_by`.
- [ ] Se genera el archivo.
- [ ] Se guarda `file_path`.
- [ ] No se crean duplicados por doble clic.
- [ ] La emisión repetida se maneja de forma idempotente.

## Documento

- [ ] El documento utiliza la plantilla correspondiente.
- [ ] Muestra participante.
- [ ] Muestra actividad.
- [ ] Muestra condición.
- [ ] Muestra fecha cuando corresponda.
- [ ] Muestra horas académicas cuando corresponda.
- [ ] Muestra código.
- [ ] Incluye firmantes configurados.
- [ ] El archivo generado puede abrirse correctamente.

## Storage

- [ ] Existe almacenamiento para certificados.
- [ ] El archivo no se guarda como binario en PostgreSQL.
- [ ] Los certificados son tratados como privados.
- [ ] El acceso público no depende de hacer público todo el bucket.
- [ ] Se puede generar acceso válido al archivo correspondiente.

## Acceso público

- [ ] Existe `/certificados/[token]`.
- [ ] No requiere login.
- [ ] Un token válido devuelve únicamente su certificado.
- [ ] Un token inválido muestra not found.
- [ ] Un certificado revocado no se muestra como vigente.
- [ ] Existe acción de descarga.
- [ ] No se exponen IDs internos innecesariamente.

## Revocación

- [ ] Un administrador puede revocar certificado.
- [ ] Se cambia estado a `revoked`.
- [ ] Se registra `revoked_at`.
- [ ] Se registra `revoked_by`.
- [ ] Se puede registrar motivo.
- [ ] El registro no se elimina.
- [ ] El código no se reutiliza.

## Notificaciones

- [ ] Existe evento `activity_free_registration_confirmed`.
- [ ] Existe evento `activity_paid_preregistration_created`.
- [ ] Existe evento `activity_paid_registration_confirmed`.
- [ ] Existe evento `activity_certificate_issued`.
- [ ] Las operaciones crean su evento correspondiente.
- [ ] Se registra correo destinatario.
- [ ] Se registra payload.
- [ ] Se registra relación con la entidad correspondiente.
- [ ] Existen estados pending/processing/sent/failed/cancelled.
- [ ] Se registran intentos.
- [ ] Se puede registrar último error.
- [ ] Se registra `sent_at` cuando el envío es exitoso.
- [ ] Una falla de correo no revierte la operación de negocio.
- [ ] Se evitan notificaciones duplicadas por repetición accidental.

## Correos

- [ ] La inscripción gratuita comunica confirmación.
- [ ] La preinscripción con costo comunica que todavía está pendiente.
- [ ] La confirmación administrativa comunica que la participación fue confirmada.
- [ ] El certificado emitido comunica cómo acceder al documento.
- [ ] Los mensajes utilizan el correo registrado del participante.
- [ ] Ningún secreto del proveedor se ejecuta desde el navegador.

## Arquitectura

- [ ] La lógica de certificados está separada de la presentación.
- [ ] La lógica de notificaciones está desacoplada del proceso principal.
- [ ] Los componentes respetan Atomic Design.
- [ ] Las queries están organizadas.
- [ ] Las mutations están organizadas.
- [ ] Los tipos están actualizados.
- [ ] No existe una API CRUD innecesaria.
- [ ] Las operaciones que necesitan servidor utilizan contexto seguro.
- [ ] RLS y las políticas de Storage protegen los datos privados y permiten únicamente los accesos definidos en este hito.

---

# 64. Pruebas funcionales obligatorias

## Caso 1 — Participante asistente

```text
1. Crear actividad.
2. Inscribir participante.
3. Confirmarlo.
4. Marcar attendance = attended.
5. Abrir certificados.
6. Participante aparece como elegible.
7. Emitir certificado.
8. Generar código.
9. Generar token.
10. Generar archivo.
11. Guardar certificado.
12. Crear notification_outbox.
13. Acceder mediante token.
14. Descargar certificado.
```

---

## Caso 2 — Participante ausente

```text
1. Inscripción confirmada.
2. attendance = absent.
3. Abrir certificados.
4. Participante no es elegible.
5. Intentar emitir mediante operación directa.
6. Backend/PostgreSQL rechaza la emisión.
```

---

## Caso 3 — Asistencia pendiente

```text
1. Inscripción confirmada.
2. attendance = pending.
3. No permitir emisión.
4. Registrar asistencia.
5. attendance = attended.
6. Ahora permitir emisión.
```

---

## Caso 4 — Emisión múltiple

```text
1. Tener diez asistentes elegibles.
2. Seleccionar cinco.
3. Emitir certificados.
4. Crear cinco certificados.
5. Cada uno recibe código diferente.
6. Cada uno recibe token diferente.
7. Los otros cinco permanecen sin certificado.
```

---

## Caso 5 — Doble emisión

```text
1. Emitir certificado para una inscripción.
2. Repetir accidentalmente la acción.
3. No generar un segundo certificado equivalente.
4. Mantener el certificado original.
```

---

## Caso 6 — Token público

```text
1. Obtener access_token válido.
2. Abrir /certificados/[token].
3. Consultar certificado correcto.
4. Descargar archivo.
5. Probar token aleatorio.
6. Mostrar not found.
```

---

## Caso 7 — Revocación

```text
1. Emitir certificado.
2. Confirmar que está disponible.
3. Revocarlo.
4. status = revoked.
5. Registrar fecha/responsable.
6. Abrir enlace anterior.
7. No presentarlo como certificado vigente.
```

---

## Caso 8 — Inscripción gratuita y correo

```text
1. Realizar inscripción gratuita.
2. Crear evento activity_free_registration_confirmed.
3. Procesar notificación.
4. Marcar sent.
5. Registrar sent_at.
```

---

## Caso 9 — Preinscripción con costo

```text
1. Realizar preinscripción.
2. status = pending.
3. Crear activity_paid_preregistration_created.
4. Procesar notificación.
5. Mensaje comunica que falta confirmación.
```

---

## Caso 10 — Confirmación con costo

```text
1. Tener inscripción pending.
2. Administrador confirma.
3. status = confirmed.
4. Crear activity_paid_registration_confirmed.
5. Procesar notificación.
6. Participante recibe confirmación.
```

---

## Caso 11 — Certificado y notificación

```text
1. Emitir certificado.
2. Crear activity_certificate_issued.
3. Incluir acceso mediante token.
4. Procesar correo.
5. Participante abre enlace.
6. Descarga certificado.
```

---

## Caso 12 — Falla del proveedor de correo

```text
1. Emitir certificado correctamente.
2. Simular error del proveedor.
3. Certificado continúa emitido.
4. notification_outbox registra fallo.
5. attempts aumenta.
6. last_error se registra.
7. Puede reintentarse posteriormente.
```

---

# 65. Validación final del hito

Antes de aprobar el Hito 5, el equipo deberá demostrar el recorrido completo de eventos y capacitaciones:

```text
1. Crear actividad.
2. Publicarla.
3. Registrar participante.
4. Confirmarlo cuando corresponda.
5. Registrar asistencia.
6. Abrir módulo de certificados.
7. Seleccionar asistentes.
8. Generar certificados.
9. Comprobar códigos únicos.
10. Comprobar archivos.
11. Comprobar tokens.
12. Procesar notificaciones.
13. Abrir enlace como usuario sin cuenta.
14. Descargar certificado.
15. Revocar un certificado.
16. Comprobar comportamiento del enlace revocado.
17. Revisar estados de notificaciones.
```

Todo el recorrido deberá poder realizarse desde la aplicación y los mecanismos definidos, sin modificar manualmente las tablas desde Supabase para completar el flujo normal.

---

# 66. Resultado final esperado del Hito 5

Al finalizar este hito deberá estar terminado el primer gran dominio funcional del MVP:

```text
ACTIVIDAD
    │
    ▼
PUBLICACIÓN
    │
    ▼
INSCRIPCIÓN
    │
    ├── Gratuita → CONFIRMED
    │
    └── Con costo → PENDING → CONFIRMED
    │
    ▼
ASISTENCIA
    │
    ├── ATTENDED
    ├── ABSENT
    └── PENDING
    │
    ▼
REVISIÓN ADMINISTRATIVA
    │
    ▼
CERTIFICADO
    │
    ├── Plantilla
    ├── Firmantes
    ├── Código
    ├── Snapshots
    ├── Archivo
    └── Token
    │
    ▼
NOTIFICACIÓN
    │
    ▼
/certificados/[token]
    │
    ▼
DESCARGA SIN CUENTA
```

Con el cumplimiento de este hito, la Cámara deberá poder gestionar digitalmente un evento o capacitación desde su publicación hasta la entrega del certificado al participante.

Esto constituye uno de los dos recorridos principales utilizados para determinar el éxito funcional del MVP. El segundo recorrido corresponderá al Campus Virtual y comenzará con el registro y la autenticación de cuentas permanentes de estudiantes, reutilizando la base interna de autenticación ya existente.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 6 — Registro, Login y Autenticación.**
