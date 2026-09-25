# HITO 16 — PASES GRATUITOS POR EMPRESA ASOCIADA

## Plataforma Digital de Eventos, Capacitaciones y Cursos
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

Este hito amplía la inscripción grupal del Hito 15: un **evento exclusivo para asociados y pagado** podrá incluir una cantidad configurable de pases gratuitos **por RUC y por evento**. La empresa podrá presentar varias solicitudes para añadir asistentes, pero no volverá a recibir los pases ya utilizados. Cada asistente conservará su inscripción, cupo, estado, asistencia y eventual certificado individuales.

```text
Evento exclusivo pagado con 0, 1, 2… pases gratuitos por empresa
→ verificación del RUC activo
→ asignación por orden de ingreso entre todas las solicitudes de ese RUC
→ pases gratuitos confirmados y demás plazas pendientes de pago
→ comprobante y coordinación del pago solo si queda importe por cobrar
→ validación manual de las plazas pagadas
```

Este hito **no** cambia el flujo individual de eventos abiertos, capacitaciones ni cursos. Con cuota `0`, el evento exclusivo pagado conserva íntegramente el flujo del Hito 15. Con cuota positiva, las reglas de este hito sustituyen **solo** las reglas del Hito 15 que suponían que todas las plazas de un evento pagado eran pendientes y que toda solicitud de ese evento exigía comprobante. Un evento marcado como «Actividad gratuita» seguirá confirmando a todos sin usar una cuota de pases. El certificado opcional del Hito 14 permanece separado del precio de participación.

---

# 2. Objetivo

Permitir beneficios de 0 o más pases por empresa sin bloquear solicitudes posteriores del mismo RUC, evitar que dividir asistentes en varios envíos multiplique el beneficio y presentar de forma comprensible qué plazas están confirmadas y cuáles requieren pago.

La entrega debe funcionar de extremo a extremo: configuración administrativa, formulario y resumen, asignación transaccional, estados individuales, pagos parciales, correos, auditoría y pruebas. La implementación está en el repositorio; la aplicación de la migración vinculada y la actualización del workflow activo se verifican por separado en la matriz de aceptación.

---

# 3. Decisiones funcionales

- La cantidad configurada será un **entero no negativo por RUC y evento**, no un total compartido por todas las empresas ni una cantidad nueva por solicitud. Su valor inicial será `0`; no habrá un límite comercial fijo.
- Solo se ofrecerá en eventos **exclusivos para asociados y pagados**. Si el evento completo es gratuito, la cantidad efectiva será `0` y todos los asistentes se confirmarán conforme al Hito 15.
- Los pases disponibles se asignarán a las primeras personas de la solicitud según el orden en que aparecen, considerando antes todos los pases ya utilizados por ese RUC en solicitudes anteriores. No se limitará la cantidad de solicitudes de una misma empresa; la prohibición de duplicar a una persona activa en el evento continúa vigente.
- Los asistentes cubiertos por pases quedarán **confirmados automáticamente**. Los demás tendrán el precio de asociado y quedarán pendientes hasta que el personal valide su pago. Todos ocuparán cupo desde el registro.
- Una solicitud cuyo importe de participación sea `0` no solicitará boleta, factura ni coordinación de pago. Una solicitud mixta sí solicitará datos de comprobante, pero solo cobrará las plazas pagadas. El precio de un certificado opcional no se incluirá en este cálculo.
- Después de la **primera inscripción al evento**, el administrador podrá **aumentar** la cantidad de pases, pero no reducirla. Tampoco podrá cambiar exclusividad o gratuidad de forma que invalide pases asignados. Antes de la primera inscripción podrá ajustar la configuración normalmente.
- Cancelar una plaza de cortesía no devuelve automáticamente el pase al saldo disponible. El personal podrá transferirlo, con motivo y auditoría, a una inscripción activa y todavía impaga del **mismo evento y RUC**, antes de registrar asistencia. Un pago ya validado no se transferirá ni generará devolución automática.
- Se conserva el riesgo aceptado del Hito 15: **un RUC activo basta para solicitar y confirmar un pase; conocerlo no prueba identidad ni vínculo laboral**. Esta cuota impide multiplicar pases mediante solicitudes repetidas, pero no evita que un tercero reclame los primeros.

---

# 4. Alcance y compatibilidad

Comprende la configuración por evento; asignación y seguimiento por empresa; solicitudes con plazas gratuitas y pagadas; vista pública y administrativa; transferencia excepcional; comunicaciones; seguridad y pruebas.

No comprende códigos de empresa, aprobación manual previa de los pases, acreditación laboral, pagos en línea, emisión de comprobantes, devoluciones, transferencia de pagos validados ni cambios al cobro independiente de certificados opcionales. Los eventos exclusivos totalmente gratuitos y los formularios ajenos al flujo grupal conservarán su comportamiento actual.

Las solicitudes e inscripciones creadas antes de esta funcionalidad se tratarán como **sin pase de cortesía asignado**; sus precios y estados no se recalcularán retroactivamente. Si se aumenta la cuota después, solo las nuevas solicitudes podrán aprovechar el incremento, salvo una transferencia administrativa explícita conforme a este hito.

---

# 5. Persistencia y reglas de PostgreSQL

## 5.1 Configuración y trazabilidad

Agregar a `activities` una cantidad de pases gratuitos por RUC, `integer not null default 0`, con restricción `>= 0`. Una actividad no exclusiva o gratuita deberá guardar `0`. Registrar de forma auditable las asignaciones por **actividad, RUC, pase y persona**; cada pase tendrá una identidad estable aunque se cancele o transfiera, para que una cancelación no lo reponga por accidente. Conservar en cada inscripción el precio aplicable y la condición de cortesía; los cambios excepcionales por transferencia dejarán valores anteriores, nuevos, responsable, fecha y motivo.

El cupo comercial de la actividad y la cuota de cortesías son conceptos distintos: **cada plaza, gratuita o pagada, consume un cupo**. Los totales de la solicitud se derivarán de las plazas vigentes y sus importes; no se confiará en cantidades o precios enviados por el navegador. Cambios posteriores del precio de asociado o del padrón no alterarán las solicitudes ya registradas.

## 5.2 Asignación transaccional

Ampliar la operación grupal del Hito 15 para que, en la misma transacción e idempotencia, vuelva a verificar RUC, actividad, cupos, duplicados y pases disponibles. Serializar la asignación por actividad y RUC —aprovechando el bloqueo de la actividad existente o un bloqueo equivalente— para que dos solicitudes simultáneas nunca reciban el mismo pase ni superen la cuota. Asignar los pases restantes en el orden recibido de asistentes y calcular el precio de los demás desde el precio de asociado guardado para la solicitud.

Un reintento idéntico devolverá el resultado original sin consumir otro pase, crear otra plaza ni repetir correos; reutilizar la clave con datos distintos seguirá rechazándose. La validación de pagos admitirá únicamente plazas pendientes **con importe positivo**. Ninguna RPC antigua de inscripción o confirmación podrá eludir estas reglas en un evento exclusivo.

## 5.3 Cancelación y transferencia

La cancelación ordinaria de una plaza pagada y confirmada seguirá bloqueada. Para una plaza gratuita ya confirmada, habilitar una operación administrativa específica antes de su asistencia: cancelar la plaza con motivo y conservar consumido su pase. Una operación de transferencia auditada podrá reasignar ese **mismo pase** a otra inscripción activa, pendiente e impaga del mismo RUC y evento; confirmará a la persona receptora y recalculará el importe pendiente de su solicitud sin duplicar cupos o pagos. Si la receptora ya pagó, asistió o tiene certificado emitido, no se permitirá transferir desde este flujo.

El registro histórico de la plaza original y de cualquier importe anterior permanecerá consultable. La transferencia no será una forma de reducir o reembolsar un pago validado. Solo personal con permisos operativos podrá ejecutarla; las operaciones concurrentes o repetidas no producirán dos titulares del mismo pase.

Todas las nuevas tablas expuestas tendrán RLS y permisos mínimos desde su creación. Validaciones, restricciones, asignación y transferencia deberán estar protegidas en PostgreSQL además de la interfaz.

---

# 6. Configuración administrativa del evento

En «Participación y cupos», junto al precio para asociados y los cupos, mostrar **«Pases gratuitos por empresa asociada»** solo cuando «Exclusiva para asociados» esté activada y «Actividad gratuita» desactivada. Usar un campo numérico entero con mínimo `0` y esta ayuda: «Cantidad disponible para cada RUC durante todo el evento, aunque envíe varias solicitudes». Aclarar que `0` significa que todos pagan el precio de asociado y que los pases no aumentan la capacidad del evento.

Al alternar opciones, actualizar la interfaz de inmediato sin perder temporalmente lo escrito; al guardar, persistir únicamente el valor aplicable. Mostrar errores junto al campo. Permitir borradores incompletos según las reglas actuales, pero rechazar al publicar una combinación inválida. Al editar un evento con inscripciones, bloquear la reducción y los cambios de exclusividad/gratuidad incompatibles mediante formulario, servidor y PostgreSQL, con un mensaje que explique por qué. La vista administrativa del evento mostrará la cuota configurada.

---

# 7. Experiencia pública de inscripción

Tras verificar el RUC, informar de modo simple cuántos pases gratuitos quedan para esa empresa. Esta cifra será una **vista previa**, no una promesa hasta completar la solicitud. En el paso de asistentes, identificar por orden quién tendría pase gratuito y quién tendría el precio de asociado. No añadir una elección compleja por persona: si quedan dos pases, los recibirán los dos primeros asistentes escritos.

El segundo paso mostrará asistentes, plazas gratuitas, plazas pagadas, precio individual y total. Si el total es `0`, mostrar únicamente el resumen y «Confirmar inscripción». Si existe un importe positivo, conservar la elección de boleta o factura y «Enviar solicitud», con instrucciones de pago separadas de los datos del comprobante.

Si otra solicitud consume pases entre la vista previa y el envío, **no** registrar silenciosamente un importe mayor. Devolver la disponibilidad vigente, actualizar el desglose conservando los datos escritos y exigir una nueva confirmación expresa antes de enviar. Los errores de cupo, RUC o duplicados conservarán el comportamiento atómico del Hito 15.

El resultado protegido mostrará por asistente «Confirmado — pase gratuito» o «Pendiente de validación del pago» según corresponda. Solo habrá botón de coordinación del pago y monto pendiente cuando reste dinero por cobrar. La página nunca llamará «pendiente» a una plaza gratuita ya confirmada ni «confirmada» a una pagada aún sin validar.

El lenguaje, la jerarquía y los controles seguirán siendo claros para personas mayores: texto legible, áreas táctiles de al menos 44 px, errores con foco, teclado completo, contraste y ausencia de desplazamiento horizontal.

---

# 8. Operación administrativa y comunicaciones

La bandeja y el detalle grupal mostrarán por solicitud y por RUC: pases configurados, utilizados y disponibles; persona beneficiaria de cada pase; plazas gratuitas confirmadas; plazas pagadas pendientes o confirmadas; total a cobrar, validado y pendiente. La vista de varias solicitudes del mismo RUC no sumará un pase nuevo por cada una. El CSV distinguirá cortesía de pago y evitará contar una plaza gratuita como ingreso.

La verificación manual de pago seguirá seleccionando **solo plazas con importe positivo**. El personal podrá ver el historial de asignación y, cuando corresponda, cancelar o transferir un pase mediante una acción separada con confirmación y motivo. Si una solicitud mixta pasa a importe cero por transferencia, el panel conservará trazabilidad de los datos de comprobante previamente aportados sin presentarlos como un comprobante emitido.

Enviar confirmación individual inmediata a cada asistente con pase gratuito; los asistentes pagados recibirán su confirmación únicamente tras validar el pago. El titular recibirá un solo resumen con ambos estados e importe pendiente; si toda la solicitud es gratuita, no se le pedirán datos ni coordinación de pago. Al cancelar o transferir, avisar a las personas afectadas con mensajes que reflejen su nuevo estado. Los contratos de `notification_outbox`, la plantilla fuente y el JSON importable de n8n conservarán la idempotencia y no expondrán datos de terceros en enlaces públicos. El acceso virtual y los certificados continuarán siguiendo el estado individual de cada inscripción.

---

# 9. Seguridad, estructura y despliegue futuro

- Mantener la consulta pública limitada al RUC exacto y su razón social; no exponer un listado del padrón ni los nombres de quienes usaron pases a otros visitantes. El estado detallado de la empresa se mostrará solo donde exista autorización para ver la solicitud.
- Registrar abuso y limitar frecuencia sin imponer un máximo comercial fijo de asistentes o solicitudes. El RUC activo seguirá siendo el único requisito de pertenencia por decisión de producto; el riesgo de uso indebido se comunicará expresamente.
- Auditar configuración, asignaciones, cancelaciones y transferencias. Aplicar RLS y permisos de administrador/operador adecuados; visitantes no podrán modificar cuotas, estados ni pases.
- Implementar el dominio futuro en `src/features`, reutilizando componentes pequeños (máximo 170 líneas), tipos e interfaces separados, utilidades y servicios de responsabilidad única, esquemas de validación y Tailwind sin CSS específico, conforme a `.agents/rules.md`. Revisar las guías instaladas de Next.js 16 antes de codificar y no crear `middleware.ts`.
- Crear migraciones correlativas en `supabase/migrations` y pruebas SQL transaccionales. Antes del despliegue, revisar `supabase db push --linked --dry-run`, aplicar solo las migraciones aprobadas sin seeds, regenerar tipos y actualizar el workflow activo de n8n; el JSON del repositorio por sí solo no cambia los correos enviados.

---

# 10. Pruebas y aceptación

## 10.1 Datos y concurrencia

- Cuota `0`, `1` y varios pases; dos RUC diferentes; varias solicitudes sucesivas del mismo RUC; asistente duplicado; orden de asignación; cupo final y evento completamente gratuito.
- Un grupo solo con pases gratuitos se confirma sin comprobante; uno mixto confirma los gratuitos y mantiene pendientes los pagados; uno sin pases disponibles cobra a todos el precio de asociado. El certificado opcional no altera estos importes.
- Dos envíos simultáneos para el mismo RUC no superan la cuota; reintento idéntico no consume otro pase; errores no dejan grupos parciales. Cambio de disponibilidad entre vista previa y envío exige reconfirmación del nuevo total.
- Una vez inscrita la primera persona, aumentar la cuota funciona para solicitudes nuevas; reducirla o invalidar exclusividad/gratuidad se rechaza sin cambiar datos históricos. Cambiar precio o padrón después no altera plazas previas.
- Cancelar un pase no lo repone; transferencia válida al mismo RUC confirma solo al receptor impago y deja auditoría. Rechazar otro RUC, receptor pagado/asistente, doble transferencia, operación fuera de plazo o por rol no autorizado.

## 10.2 Portal, administración y comunicaciones

- Resumen, resultado y panel muestran estados e importes por plaza sin confundir «evento pagado» con «todas sus plazas son pagadas». Boleta/factura y WhatsApp solo aparecen si hay importe positivo.
- Pago parcial selecciona únicamente plazas pagadas pendientes; ingresos, saldos y CSV excluyen cortesías y no duplican importes entre solicitudes.
- Cada persona recibe solo la comunicación que corresponde a su estado; el titular recibe un resumen único; cancelaciones y transferencias notifican sin duplicados por reintento. Verificar acceso virtual y certificado con estados mixtos.
- Probar teclado, lector de pantalla, contraste y vistas de **390 × 844, 768 × 1024 y 1440 × 900**. Ejecutar pruebas unitarias y SQL, `yarn lint`, `yarn typecheck` y `yarn build` en la implementación futura. Registrar ambiente, fecha, commit y evidencia en la matriz; no marcar como ejecutado lo que aún no se pruebe.

---

# 11. Definition of Done

El hito estará terminado cuando un administrador configure la cuota por RUC en un evento exclusivo pagado; dos solicitudes del mismo RUC puedan añadir asistentes sin duplicar pases; PostgreSQL asigne el beneficio de forma segura incluso ante concurrencia; las plazas gratuitas se confirmen automáticamente y las pagadas se validen por el flujo manual existente; el formulario, resultado, panel, correos y CSV reflejen el desglose; y el personal pueda cancelar y transferir excepcionalmente un pase con auditoría.

Será incorrecto si cada solicitud vuelve a recibir la cuota completa, un cambio concurrente aumenta el precio sin aceptación expresa, una cancelación libera automáticamente el pase, se cobra un certificado como parte de la participación, se exige comprobante a un grupo de importe cero, un pago confirma una plaza gratuita, se permite reducir la cuota tras la primera inscripción o un RUC ajeno recibe una transferencia.

Permanece explícito el riesgo funcional: **el RUC activo no prueba que el solicitante represente a la empresa**. La confirmación automática de los pases es una decisión deliberada de esta versión.
