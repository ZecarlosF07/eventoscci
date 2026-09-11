# HITO 14 — CERTIFICADOS OPCIONALES CON COBRO MANUAL

## Plataforma Digital de Eventos, Capacitaciones y Cursos
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 14 incorpora una configuración explícita de certificación para eventos y capacitaciones. Cada actividad podrá no ofrecer certificado, incluirlo en la participación u ofrecerlo opcionalmente con tarifa general y tarifa para asociados. El cobro manual aplica únicamente a la tercera modalidad, sin incorporar una pasarela de pago ni convertir el módulo de certificados en un sistema contable.

La inscripción y el certificado continuarán siendo procesos independientes. La plataforma conservará la solicitud y la verificación manual del pago para que el responsable pueda completar el seguimiento aunque el participante no termine el contacto por WhatsApp:

```text
Inscripción a la actividad
        +
Modalidad de certificación
        +
Solicitud y pago verificado solo cuando tenga costo adicional
        +
Coordinación y validación manual del pago
        +
Asistencia registrada
        +
Selección administrativa existente
        ↓
Emisión del certificado
```

Cuando el certificado esté incluido, todos los participantes confirmados que registren asistencia tendrán derecho a recibirlo y no deberán solicitarlo ni realizar otro pago. Cuando sea opcional con costo, el participante podrá marcar “Sí, deseo solicitar el certificado digital” durante la inscripción o solicitarlo posteriormente desde el resultado y los correos. El interés se registrará antes de continuar por WhatsApp. Si el participante no envía el mensaje, el personal conservará un aviso pendiente y podrá contactarlo al celular registrado durante la inscripción.

No se creará un módulo independiente de solicitudes ni una tabla adicional. El control comercial mínimo se resolverá en las vistas administrativas de inscripciones existentes; el comprobante y el cobro continuarán fuera de la plataforma.

---

# 2. Objetivo del hito

Implementar un recorrido simple y comercial que permita:

1. definir una modalidad de certificación por actividad;
2. diferenciar el certificado incluido del certificado opcional con costo;
3. configurar un precio general y uno para asociados solo cuando exista costo adicional;
4. informar el beneficio sin dificultar la inscripción;
5. registrar el interés antes de abrir el WhatsApp del responsable;
6. mostrar al personal las solicitudes con pago pendiente, pago verificado o listas para emitir;
7. recordar la oferta con costo una sola vez después de registrar asistencia;
8. conservar la modalidad y tarifa comunicadas al participante;
9. permitir solicitudes tardías sin perder la oportunidad de venta;
10. mantener intacta la emisión administrativa de certificados.

---

# 3. Decisiones funcionales

- La modalidad predeterminada será “Sin certificado”.
- Las modalidades serán excluyentes: `none`, `included` y `optional_paid`.
- Podrán configurarse en eventos y capacitaciones, independientemente de si la participación es gratuita o pagada.
- En `included`, el certificado formará parte de la participación y no tendrá precio adicional.
- En `included`, todos los participantes confirmados con asistencia `attended` tendrán derecho al certificado mediante el flujo de emisión existente.
- En `optional_paid`, se exigirán una tarifa general y una para asociados.
- En `optional_paid`, la inscripción mostrará un checkbox opcional y desmarcado para registrar el interés sin condicionar la inscripción.
- En `optional_paid`, el participante podrá solicitarlo antes o después de asistir.
- El checkbox y la acción “Solicitar mi certificado” aparecerán exclusivamente en `optional_paid`.
- En `included` no existirán solicitud, seguimiento comercial ni recordatorio de venta.
- Presionar la acción registrará la solicitud antes de intentar abrir WhatsApp.
- La solicitud quedará asociada a la inscripción; no se creará un módulo ni una entidad independiente.
- Si el participante no completa el mensaje de WhatsApp, el personal podrá identificarlo y contactarlo al celular registrado.
- El pago se coordinará y validará fuera de la plataforma.
- El comprobante no se almacenará en Supabase.
- La plataforma derivará los estados `sin solicitar`, `pago pendiente`, `pago verificado`, `pendiente de asistencia`, `listo para emitir` y `emitido` sin almacenar información bancaria.
- “Atendida” y “Seguimiento realizado” quedan retirados porque son ambiguos y nunca equivaldrán a un pago aprobado.
- Pagar no garantiza la emisión: seguirá siendo obligatorio tener inscripción confirmada y asistencia `attended`.
- El pago anticipado será no reembolsable si la persona no asiste. Esta condición deberá mostrarse antes de iniciar la coordinación.
- En `optional_paid`, el personal decidirá a quién seleccionar para emitir el certificado después de validar el comprobante.

---

# 4. Alcance

El hito comprende:

- configuración administrativa de las tres modalidades y, cuando corresponda, sus precios;
- persistencia de la configuración en `activities`;
- snapshot de la modalidad y tarifa aplicable en `registrations`;
- trazabilidad mínima de solicitud y verificación de pago en la propia `registration`;
- información visible en el detalle y registro de la actividad;
- solicitud desde el formulario o el resultado de inscripción, con persistencia previa a la redirección;
- enlace de WhatsApp específico del responsable;
- aviso persistente y filtros dentro de las vistas administrativas existentes;
- ampliación de los correos de inscripción y confirmación;
- recordatorio posterior a la asistencia solo para certificados opcionales con costo;
- soporte del nuevo evento en `notification_outbox` y n8n;
- auditoría de cambios de configuración;
- actualización de tipos, documentación y pruebas.

No comprende:

- pasarela de pagos;
- integración con Yape, Plin, bancos u otros medios;
- carga o almacenamiento de comprobantes;
- conciliación, facturación o devoluciones;
- conciliación automática o estados contables de pago;
- una tabla, ruta o módulo independiente de solicitudes;
- un panel contable o una bandeja de comprobantes;
- bloqueo automático de la emisión por pago;
- cambios en plantillas, generación, regeneración, revocación o descarga de certificados;
- cambios en certificados automáticos de cursos;
- generación de códigos QR o campañas masivas de WhatsApp.

---

# 5. Persistencia

## 5.1 Configuración en `activities`

Añadir mediante una migración correlativa en `supabase/migrations`:

```text
certificate_mode text not null default 'none'
certificate_general_price numeric(10, 2) not null default 0
certificate_member_price numeric(10, 2) not null default 0
```

Aplicar restricciones de base de datos:

- `certificate_mode` solo podrá ser `none`, `included` u `optional_paid`;
- los precios nunca podrán ser negativos;
- en `none` e `included`, ambos precios deberán ser cero;
- en `optional_paid`, ambos precios deberán ser mayores que cero;
- en `optional_paid`, el precio de asociado no podrá superar el precio general.

La tarifa del certificado será independiente de `general_price`, `member_price` e `is_free`, que continuarán representando únicamente el costo de participación en la actividad.

## 5.2 Snapshot en `registrations`

Añadir:

```text
certificate_mode_snapshot text not null default 'none'
certificate_price_snapshot numeric(10, 2)
```

Reglas:

- `certificate_mode_snapshot` copiará la modalidad vigente al completar la inscripción;
- en `none` e `included`, `certificate_price_snapshot` será `NULL`;
- en `optional_paid`, una inscripción general recibirá `certificate_general_price`;
- en `optional_paid`, una inscripción de asociado recibirá `certificate_member_price`;
- cambiar modalidad o precios posteriormente no modificará snapshots ya establecidos;
- al configurar por primera vez la certificación en una actividad con inscripciones existentes, se podrán completar únicamente los snapshots que todavía sean `none`, mediante una operación administrativa explícita y auditada;
- cambiar la actividad a `none` ocultará acciones públicas y evitará nuevos recordatorios, sin borrar los snapshots históricos;
- cambiar la actividad a `included` eliminará cualquier acción comercial futura: nadie deberá solicitar ni pagar el certificado aunque conserve un snapshot histórico anterior.

Actualizar `save_activity` y `register_activity` para aplicar estas reglas atómicamente. Las restricciones deberán existir también en PostgreSQL y no depender solo de Zod.

## 5.3 Tipos generados

Regenerar `src/lib/supabase/database.types.ts` y ampliar los tipos de actividades, formularios, resultados de inscripción y notificaciones. Crear un tipo compartido para `none | included | optional_paid`. Las interfaces nuevas deberán permanecer en archivos separados conforme a `.agents/rules.md`.

## 5.4 Trazabilidad mínima en `registrations`

La solicitud no tendrá una tabla propia. Añadir a `registrations`:

```text
certificate_request_token uuid not null default gen_random_uuid()
certificate_requested_at timestamptz
certificate_requested_by uuid references auth.users(id) on delete set null
certificate_payment_verified_at timestamptz
certificate_payment_verified_by uuid references auth.users(id) on delete set null
certificate_followed_up_at timestamptz
certificate_followed_up_by uuid references auth.users(id) on delete set null
```

Aplicar un índice único sobre `certificate_request_token`. Este token opaco será la credencial de la acción pública; el código correlativo de inscripción no será suficiente para modificar una solicitud.

Los campos `certificate_followed_up_at` y `certificate_followed_up_by` se conservan temporalmente por compatibilidad, se reinician y dejan de utilizarse. La condición operativa se deriva así:

```text
Solicitud pendiente de pago =
certificate_requested_at is not null
and certificate_payment_verified_at is null

Listo para emitir =
certificate_payment_verified_at is not null
and registration.status = 'confirmed'
and attendance.status = 'attended'
and no existe certificado activo
```

Reglas:

- el primer clic establecerá `certificate_requested_at`; los clics posteriores serán idempotentes;
- el personal podrá registrar solicitudes recibidas por WhatsApp, teléfono o presencialmente;
- no se podrá verificar el pago si antes no existe una solicitud y la inscripción no está confirmada;
- verificar el pago guardará fecha y usuario administrativo;
- una verificación podrá revertirse con motivo obligatorio mientras no exista un certificado emitido;
- no se almacenarán comprobante, medio de pago ni información bancaria;
- la existencia de un certificado emitido se consultará mediante la relación vigente y no se duplicará en la inscripción;
- todos los cambios administrativos de solicitud y pago quedarán auditados.

---

# 6. Configuración administrativa

En “Precio, asociados y cupos” del formulario de actividad se añadirá una selección única:

```text
Certificación de la actividad

○ Sin certificado
○ Certificado incluido en la participación
○ Certificado opcional con costo
```

Comportamiento:

- “Sin certificado” estará seleccionado al crear una actividad;
- las tres alternativas serán mutuamente excluyentes;
- al seleccionar “Certificado opcional con costo” aparecerán “Precio general del certificado” y “Precio para asociados”;
- al seleccionar “Sin certificado” o “Certificado incluido” se ocultarán los campos y se enviarán ambos valores como cero;
- los errores se mostrarán junto al campo correspondiente;
- se indicará que estos importes no son el precio de participación;
- el precio para asociados deberá ser menor o igual al general;
- el bloque funcionará igual al crear y editar eventos o capacitaciones.

El esquema Zod, el lector de `FormData`, la acción administrativa y la RPC de guardado deberán compartir las mismas reglas. La UI utilizará Tailwind y componentes existentes; si el formulario supera el tamaño permitido, el bloque se extraerá a un componente pequeño dentro de `features/activities`.

---

# 7. Experiencia pública

## 7.1 Detalle y formulario de inscripción

La información dependerá de la modalidad.

Para `included` se mostrará un beneficio compacto:

```text
Certificado digital incluido
Está incluido en tu participación y se emitirá a quienes registren asistencia.
```

No se mostrará precio, botón de solicitud ni instrucciones de pago.

Para `optional_paid` se mostrará un bloque separado del precio de participación:

```text
Certificado digital opcional
General: S/ X · Asociados: S/ Y
Puedes solicitarlo ahora o después de participar.
```

Para una actividad gratuita con `optional_paid` deberá quedar explícito:

```text
La participación es gratuita. El certificado digital es opcional y tiene costo.
```

Para `none` no se mostrará ninguna referencia al certificado.

En `optional_paid`, el formulario mostrará el checkbox desmarcado “Sí, deseo solicitar el certificado digital”, acompañado de la tarifa aplicable según el tipo de inscripción. Marcarlo registrará el interés atómicamente junto con la inscripción, pero no condicionará ni bloqueará el registro. Si permanece desmarcado, el participante podrá solicitarlo posteriormente desde el resultado o los correos.

## 7.2 Resultado de inscripción

Si la modalidad vigente y el snapshot son `optional_paid`, y la inscripción está confirmada, mostrar:

- tarifa aplicable congelada;
- texto “Puedes solicitarlo ahora o después de participar”;
- un único botón principal “Solicitar mi certificado”;
- aviso “La emisión requiere asistencia registrada”;
- condición “Si pagas antes y no asistes, el importe no es reembolsable”;
- consentimiento “Al solicitarlo, autorizas a la Cámara de Comercio de Ica a contactarte al celular registrado para coordinar el certificado y su pago”.

Cuando el checkbox ya fue marcado, el resultado mostrará “Solicitud de certificado registrada” y la acción “Continuar por WhatsApp”, sin crear una segunda solicitud. En una preinscripción pendiente, conservará el interés y explicará que la participación y la asistencia deberán confirmarse antes de emitir.

Para preinscripciones pendientes de actividades pagadas se podrá informar la existencia del certificado, pero la acción se habilitará después de confirmar la participación para no mezclar el pago de ingreso con el pago del certificado.

En `included` se mostrará “Certificado incluido” sin ninguna acción. En `none`, o cuando la actividad ya no ofrezca certificación, no se mostrará ninguna referencia al certificado.

---

# 8. Solicitud persistente y apertura de WhatsApp

Tanto el checkbox enviado con la inscripción como el botón posterior deberán persistir la solicitud antes de continuar. El botón ejecutará una acción de servidor que:

1. valide el código de inscripción y `certificate_request_token`;
2. confirme que la actividad y la inscripción conservan la modalidad `optional_paid`;
3. establezca `certificate_requested_at` si aún está vacío;
4. encole, cuando corresponda, el aviso interno al responsable;
5. devuelva la URL del WhatsApp asignado a la actividad.

La interfaz abrirá WhatsApp únicamente después de que el servidor confirme la persistencia. Si la escritura falla, mostrará un error recuperable y permitirá reintentar; no abrirá WhatsApp dejando una solicitud sin trazabilidad.

El enlace usará `activity_contacts.whatsapp_phone` del contacto asignado a la actividad. No utilizará el enlace de la comunidad pública ni un teléfono global mientras exista un responsable específico.

Crear una utilidad tipada y reutilizable que normalice el teléfono y genere una URL `https://wa.me/` con un mensaje codificado:

```text
Hola, deseo solicitar el certificado de «{actividad}».
Código de inscripción: {código}.
Tarifa aplicable: {General|Asociado} — S/ {precio}.
```

La URL no incluirá DNI, correo, nombre completo ni otros datos personales. El código de inscripción será la referencia operativa. Los clics repetidos devolverán el mismo destino sin duplicar la solicitud ni sus notificaciones.

No se expondrán canales de solicitud distintos del checkbox y la acción segura “Solicitar mi certificado”. Si WhatsApp no está iniciado en la laptop, el navegador podrá mostrar el QR o la opción de continuar en el teléfono; aun si la persona cierra ese paso, su interés ya habrá quedado registrado.

Cuando el contacto tenga correo, podrá utilizarse internamente para avisarle de una nueva solicitud y como `Reply-To` en mensajes transaccionales compatibles. El correo no reemplaza la acción pública única.

Si el correo del responsable es `NULL`, WhatsApp seguirá siendo suficiente porque su número ya es obligatorio para publicar la actividad.

---

# 9. Oferta posterior a la actividad

Ampliar `set_attendance_status` para que, al producirse una transición real hacia `attended`, encole `activity_certificate_offer` únicamente cuando:

```text
registration.status = confirmed
activity.certificate_mode = 'optional_paid'
registration.certificate_mode_snapshot = 'optional_paid'
registration.certificate_price_snapshot > 0
registration.certificate_requested_at is null
```

La notificación se relacionará con la inscripción:

```text
event_type = activity_certificate_offer
related_entity_type = registration
related_entity_id = registration.id
```

El índice único existente de la outbox impedirá duplicados. Marcar nuevamente `attended`, editar notas o repetir una operación masiva no deberá crear otro recordatorio.

El correo incluirá:

- agradecimiento por la participación;
- título de la actividad;
- tarifa aplicable;
- botón “Solicitar mi certificado” hacia la acción segura que registra la solicitud y después abre WhatsApp;
- texto “Si ya enviaste tu comprobante, no necesitas realizar ninguna acción adicional”.

La acción administrativa de asistencia deberá entregar inmediatamente las nuevas notificaciones mediante un servicio por lote con concurrencia acotada. Un fallo de n8n no revertirá la asistencia; la notificación quedará visible y reintentable en `/admin/notificaciones`.

No se enviarán automáticamente ofertas retroactivas a quienes ya figuraban como asistentes antes de activar la funcionalidad. En esos casos el personal podrá compartir manualmente el mismo enlace de solicitud.

En `included` no se enviará `activity_certificate_offer`: el certificado ya forma parte de la actividad y todos los asistentes confirmados serán elegibles en el flujo existente. En `none` tampoco se enviará ninguna comunicación de certificación.

Opcionalmente, al registrarse una solicitud `optional_paid` se encolará `activity_certificate_request_created` dirigido al correo institucional del responsable. El aviso administrativo persistente será la fuente de verdad: un fallo del correo interno no borrará la solicitud ni impedirá su seguimiento.

---

# 10. Contrato de notificaciones

Añadir `activity_certificate_offer` a los tipos y constantes permitidos. Su payload mínimo será:

```json
{
  "activity_id": "uuid",
  "activity_slug": "slug",
  "activity_title": "Título",
  "activity_type": "event | training",
  "registration_code": "CCI-EV-000123",
  "registration_type": "general | member",
  "certificate_price": 30,
  "contact_name": "Responsable",
  "contact_whatsapp_phone": "51900000000",
  "contact_email": "responsable@ejemplo.pe"
}
```

Añadir también `activity_certificate_request_created` cuando se habilite el aviso interno. Su payload mínimo será:

```json
{
  "activity_id": "uuid",
  "activity_title": "Título",
  "registration_id": "uuid",
  "registration_code": "CCI-EV-000123",
  "participant_name": "Nombre del participante",
  "participant_phone": "999999999",
  "certificate_price": 30,
  "requested_at": "2026-09-10T15:00:00-05:00",
  "responsible_email": "responsable@ejemplo.pe"
}
```

Los datos personales solo podrán enviarse al responsable autorizado dentro de la notificación interna. Nunca se incorporarán a la URL pública de WhatsApp.

Los eventos existentes de inscripción y confirmación incorporarán la modalidad de certificación cuando aplique. n8n mostrará “Certificado incluido” sin llamada comercial para `included`, y la tarifa y el acceso de solicitud para `optional_paid`. Deberá aceptar los eventos nuevos sin alterar los correos de emisión.

Actualizar:

- documentación de integración con n8n;
- workflow importable;
- validación de eventos y campos obligatorios;
- pruebas del payload y del HTML;
- configuración de `Reply-To`;
- destinatario institucional y plantilla del aviso interno.

El payload nunca incluirá el comprobante ni información financiera del pagador.

---

# 11. Operación interna

El procedimiento será:

1. El participante marca el checkbox durante la inscripción o presiona posteriormente “Solicitar mi certificado”.
2. La plataforma registra la solicitud y abre el WhatsApp del responsable.
3. El responsable atiende el mensaje o revisa las solicitudes pendientes en la vista administrativa existente.
4. Si al cierre de la jornada el participante no completó el contacto, el responsable le escribe al celular registrado.
5. El responsable envía los medios de pago y recibe el comprobante fuera de la plataforma.
6. Si la solicitud llegó directamente por un canal externo, utiliza “Registrar solicitud”.
7. El responsable valida importe, código de inscripción y comprobante fuera de la plataforma.
8. Utiliza “Confirmar pago”; la plataforma registra fecha, usuario y auditoría.
9. Si el pago fue anticipado, espera a que la persona figure como asistente.
10. Cuando el pago y la asistencia estén confirmados, el caso figura “Listo para emitir”.
11. Lo selecciona junto con los demás casos validados.
12. Emite el certificado mediante el procedimiento actual.

## 11.1 Presentación en las vistas existentes

No se construirá una bandeja nueva. Para `optional_paid`, las tablas administrativas de inscripciones o asistencia mostrarán, cuando aplique:

- estado comercial explícito;
- fecha de solicitud;
- nombre, código y teléfono del participante;
- tarifa congelada;
- fecha y responsable de la verificación del pago;
- acciones “Registrar solicitud”, “Confirmar pago” y “Revertir pago”.

Se añadirá el filtro `Todas | Sin solicitar | Pago pendiente | Pago verificado | Listos para emitir`. Los pagos pendientes se ordenarán por antigüedad. La atención deberá realizarse durante el mismo día hábil; las solicitudes recibidas fuera del horario se atenderán el siguiente día hábil.

Se recomienda utilizar etiquetas de WhatsApp Business:

- `Certificado pagado — pendiente de asistencia`;
- `Certificado pagado — listo para emitir`;
- `Certificado emitido`.

Estas etiquetas pueden seguir utilizándose en WhatsApp Business, pero la fuente de verdad será la inscripción y su auditoría.

Para `included`, no existirán solicitudes ni seguimiento comercial. Después de registrar asistencia, el personal utilizará la selección múltiple vigente para incluir a todos los participantes confirmados y asistentes en el lote de emisión.

---

# 12. Invariantes del módulo de certificados

Este hito no deberá modificar:

- rutas ni navegación del módulo;
- plantillas o firmantes;
- selección individual o múltiple;
- elegibilidad por inscripción confirmada y asistencia;
- generación y almacenamiento del PDF;
- código y token público;
- correo `activity_certificate_issued`;
- regeneración por corrección de nombre;
- revocación;
- consultas públicas de certificados.

No se añadirá una condición SQL de pago a `prepare_activity_certificates`. El personal conservará la responsabilidad de seleccionar únicamente solicitudes validadas.

En actividades con `certificate_mode = 'included'`, todas las inscripciones confirmadas con asistencia `attended` tendrán derecho al certificado. Esto no requiere automatizar la generación: el personal podrá seleccionar el conjunto elegible y emitirlo por lote mediante el flujo existente.

Los campos comerciales pertenecen a la inscripción. El módulo de certificados mostrará su estado como orientación, sin bloquear técnicamente la selección ni modificar la emisión manual.

---

# 13. Seguridad, auditoría y privacidad

- Solo administradores y operadores autorizados podrán modificar la modalidad y sus precios mediante `save_activity`.
- Los cambios quedarán registrados por la auditoría existente de actividades, incluyendo valores anteriores y nuevos.
- Las restricciones se aplicarán en Zod y PostgreSQL.
- Las consultas públicas expondrán la modalidad cuando la actividad esté publicada; los precios y el contacto comercial solo se expondrán en `optional_paid`.
- El resultado por código seguirá devolviendo solo la inscripción correspondiente.
- La acción pública exigirá el código de inscripción junto con `certificate_request_token`; el código visible por sí solo no autorizará escrituras.
- La actualización pública será idempotente y solo podrá establecer la primera fecha de solicitud válida.
- Solo administradores y operadores autorizados podrán registrar solicitudes manuales, verificar pagos o revertirlos.
- No se enviarán DNI, nombres, correos ni teléfonos personales en enlaces de WhatsApp.
- El número y correo institucional del responsable podrán incluirse porque constituyen datos de contacto publicados por la Cámara.
- No se registrará contenido de conversaciones ni comprobantes.
- La solicitud, el pago y las reversiones conservarán fecha, usuario y auditoría suficiente sin convertirse en historial de conversaciones.

---

# 14. Pruebas y aceptación

## 14.1 Base de datos

- modalidad `none` por defecto;
- rechazo de modalidades diferentes a `none`, `included` y `optional_paid`;
- precios obligatoriamente en cero para `none` e `included`;
- rechazo de precios negativos o en cero para `optional_paid`;
- rechazo de precio de asociado mayor al general;
- snapshot correcto de las tres modalidades;
- precio `NULL` en snapshots `none` e `included`;
- precio correcto para inscripción general y de asociado en `optional_paid`;
- conservación de snapshots ante cambios posteriores de precio;
- backfill controlado al configurar la certificación en actividades con inscripciones existentes;
- token de solicitud único y no predecible;
- registro idempotente de la solicitud antes de devolver la redirección;
- rechazo de código o token inválido;
- rechazo de verificación de pago si no existe solicitud o la inscripción no está confirmada;
- conservación de fecha y usuario de solicitud manual y verificación de pago;
- reversión auditada con motivo obligatorio antes de la emisión;
- creación única de `activity_certificate_offer` al pasar a `attended` en `optional_paid`;
- ausencia de ofertas y solicitudes comerciales en `none` e `included`;
- exclusión de pendientes, cancelados, ausentes, modalidad inactiva y solicitudes ya registradas;
- creación única de `activity_certificate_request_created` cuando el aviso interno esté habilitado;
- autorización de RPC y auditoría administrativa.

## 14.2 Servicios y notificaciones

- construcción correcta del enlace de WhatsApp;
- persistencia confirmada antes de abrir WhatsApp;
- error recuperable sin redirección silenciosa cuando falle la persistencia;
- clic repetido sin solicitudes ni notificaciones duplicadas;
- codificación de tildes, comillas y títulos extensos;
- ausencia de PII en la URL;
- payload condicional en correos de registro y confirmación;
- entrega por lote después de marcar asistencia;
- fallo de n8n sin rollback de asistencia;
- reintento desde administración;
- recordatorio posterior excluye a quienes ya solicitaron;
- `Reply-To` solo cuando exista correo válido;
- ausencia de nuevos correos de emisión o regeneración.

## 14.3 UI

- selección `none` al crear;
- control accesible con tres modalidades mutuamente excluyentes;
- aparición de precios únicamente en `optional_paid`;
- mensajes de validación junto a los campos;
- distinción visual entre participación y certificado;
- checkbox opcional, desmarcado y exclusivo de `optional_paid` durante la inscripción;
- solicitud atómica al enviar la inscripción con el checkbox marcado;
- ausencia completa del certificado en `none`;
- distintivo “Certificado incluido” sin precio ni acción en `included`;
- tarifa correcta en detalle, resultado y correo para `optional_paid`;
- WhatsApp del responsable correcto;
- una sola acción pública “Solicitar mi certificado” exclusivamente en `optional_paid`;
- consentimiento de contacto y condición de no reembolso visibles;
- solicitud conservada aunque el participante no complete el mensaje de WhatsApp;
- estados, filtros y acciones comerciales en las vistas administrativas existentes;
- pendientes ordenables por antigüedad y teléfono accesible al personal autorizado;
- acciones utilizables con teclado;
- revisión móvil, tableta y escritorio.

## 14.4 Regresión

- inscripción gratuita continúa confirmándose automáticamente;
- preinscripción pagada conserva su flujo;
- asistencia masiva continúa funcionando hasta 500 filas;
- emisión múltiple de certificados permanece igual;
- asistentes de actividades `included` permanecen elegibles sin solicitud ni pago adicional;
- cursos y certificados de cursos no cambian;
- `yarn test:unit`;
- pruebas SQL de actividades, inscripciones, asistencia, seguridad y certificados;
- `yarn lint`;
- `yarn typecheck`;
- `yarn build`.

---

# 15. Definition of Done

El hito estará terminado cuando una actividad pueda configurarse en cualquiera de las tres modalidades y se cumplan estos recorridos:

```text
Sin certificado
→ no mostrar información ni acciones de certificación

Certificado incluido
→ informar que está incluido
→ confirmar inscripción y asistencia
→ seleccionar a todos los asistentes elegibles
→ emitir por lote con el módulo actual
```

Para el certificado opcional con costo:

```text
Configurar modalidad y precios
→ publicar actividad
→ informar sin dificultar la inscripción
→ registrar tarifa aplicable
→ registrar solicitud desde el checkbox o la acción posterior
→ permitir continuar por WhatsApp
→ mostrar pago pendiente en administración
→ contactar al participante si no completa el mensaje
→ validar pago externamente
→ confirmar el pago en la inscripción
→ marcar asistencia
→ enviar un único recordatorio
→ mostrar listo para emitir
→ seleccionar y emitir con el módulo actual
```

La implementación se considerará incorrecta si muestra una solicitud o cobra nuevamente cuando el certificado está incluido, exige registrar un pago para emitir, almacena comprobantes, crea un módulo independiente de solicitudes, abre WhatsApp sin conservar previamente el interés, envía recordatorios duplicados, mezcla el precio de participación con el precio del certificado o modifica la lógica vigente del módulo de certificados.

La ampliación comercial queda cubierta por la migración `202609110002_activity_certificate_payment_tracking.sql`, la prueba SQL `023_activity_certificate_payment_tracking_test.sql` y las pruebas unitarias de estados comerciales. La migración debe aplicarse antes de desplegar el código que consulta los campos nuevos.
