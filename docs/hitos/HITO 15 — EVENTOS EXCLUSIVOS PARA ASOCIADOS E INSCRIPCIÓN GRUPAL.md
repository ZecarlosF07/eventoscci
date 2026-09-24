# HITO 15 — EVENTOS EXCLUSIVOS PARA ASOCIADOS E INSCRIPCIÓN GRUPAL

## Plataforma Digital de Eventos, Capacitaciones y Cursos
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

Este hito amplía el MVP con eventos publicados pero no listados, un padrón administrable de empresas asociadas y una solicitud que permite registrar a varios asistentes de una misma empresa. La participación mantiene el cobro manual y cada asistente conserva una inscripción, un cupo, una asistencia y, cuando corresponda, un certificado propios.

```text
Evento exclusivo publicado, listado o con enlace directo
→ RUC activo y razón social del padrón
→ titular y asistentes adicionales
→ datos para boleta o factura solo si hay cobro
→ solicitud grupal y precio total
→ confirmación inmediata si es gratuito o validación manual del pago
→ confirmación individual de las plazas cubiertas
```

El Hito 3 definió la inscripción de asociados sin comprobación automática del padrón. Este hito reemplaza esa regla **solo para eventos marcados como exclusivos para asociados**. Las inscripciones generales, las inscripciones como asociado en actividades no exclusivas y los cursos mantienen su flujo vigente. Las reglas de certificados del Hito 14 siguen siendo independientes del precio de participación.

---

# 2. Objetivo del hito

Entregar un recorrido completo que permita al personal compartir un evento no listado, mantener actualizado el padrón mediante Excel, recibir una solicitud grupal clara para personas mayores y validar pagos parciales sin perder la trazabilidad de cada asistente.

El hito no se considerará completo por tener únicamente el formulario o las tablas: deberá funcionar desde la importación del padrón y la publicación hasta la consulta administrativa, la confirmación, los correos y las pruebas.

---

# 3. Decisiones funcionales

- «Mostrar en el portal» será independiente de «Exclusiva para asociados». Un evento no listado podrá tener inscripciones abiertas y seguirá accesible por enlace directo.
- El nuevo formulario grupal y la consulta obligatoria del padrón se aplicarán **solo** a eventos exclusivos para asociados; no cambiarán los formularios de capacitaciones ni de otros eventos.
- Un RUC activo del padrón será suficiente para continuar. No se exigirá cuenta, código de empresa ni revisión de pertenencia de cada persona.
- Una solicitud podrá contener al titular y cualquier cantidad de asistentes adicionales, sin límite comercial fijo. Todos pertenecerán al mismo RUC asociado.
- Una empresa podrá enviar más de una solicitud para el mismo evento; no podrá inscribir dos veces a una persona activa en ese evento.
- La solicitud tendrá una referencia y un importe total; cada plaza conservará precio y estado propios. El personal podrá confirmar parte del grupo mediante pagos asignados a asistentes concretos.
- Un evento exclusivo podrá ser gratuito; confirmará sus plazas sin solicitar datos de cobro. Si se marca como pagado, la tarifa de asociado deberá ser mayor que cero.
- En eventos pagados, los cupos pendientes permanecerán reservados hasta su confirmación o cancelación manual; no caducarán automáticamente. Solo se podrán cancelar plazas todavía no pagadas.
- Para eventos pagados, factura y boleta serán alternativas excluyentes presentadas como dos opciones grandes, no como dos casillas independientes.
- Podrá solicitarse factura a un RUC distinto del RUC que habilitó la participación como asociado.
- La plataforma recogerá los datos necesarios para la emisión externa, pero no registrará comprobantes emitidos, no emitirá boletas ni facturas electrónicas y no recibirá pagos en línea.
- La vigencia del RUC se verificará al enviar la solicitud. Un reemplazo posterior del padrón no anulará las solicitudes ya registradas.

**Riesgos aceptados:** conocer un RUC activo no demuestra que una persona pertenezca a esa empresa. Quien tenga el enlace del evento y conozca ese RUC podrá solicitar plazas. Las plazas pendientes sin vencimiento pueden bloquear cupos hasta que intervenga el personal. El evento «no listado» tampoco es secreto ni sustituye un mecanismo de autorización.

---

# 4. Alcance y compatibilidad

El hito comprende la configuración de visibilidad de eventos; importación y reemplazo del padrón; consulta exacta de RUC; inscripción grupal; snapshots de empresa, precios y comprobante; pagos manuales asociados a personas; vista administrativa agrupada; notificaciones; auditoría y pruebas.

No comprende integración con SUNAT, validación externa del RUC, acreditación laboral del asistente, registro o emisión de comprobantes fiscales, pasarela de pago, conciliación bancaria, devoluciones automáticas, carga de vouchers o comprobantes de pago, ni cambios en la emisión de certificados. El pago de un certificado opcional seguirá el proceso separado del Hito 14.

Las inscripciones individuales anteriores continuarán consultables y confirmables. No se convertirán artificialmente en grupos. El archivado de una actividad continuará ocultando sus inscripciones de las vistas operativas según las reglas existentes; «no listado» no tendrá ese efecto.

---

# 5. Persistencia y reglas de PostgreSQL

## 5.1 Visibilidad de eventos

Agregar a `activities` un indicador `is_listed boolean not null default true`. Los registros existentes conservarán la visibilidad actual. El estado `published` y `published_at` seguirán determinando si el detalle y la inscripción son accesibles; `is_listed` controlará únicamente su descubrimiento público.

El formulario de creación y edición de eventos mostrará «Mostrar en el portal» con una explicación concreta. La vista administrativa indicará «No listado» y ofrecerá «Copiar enlace». Cambiar el indicador invalidará los cachés del portal y del sitemap sin alterar inscripciones ni estado de la actividad.

## 5.2 Padrón de asociados

Crear `member_companies` con RUC único, razón social, estado activo, referencia al lote de importación y marcas de auditoría. Crear `member_roster_imports` para registrar archivo, huella, cantidades, responsable, fecha y resultado; no es necesario conservar el Excel original.

El archivo `.xlsx` tendrá las columnas `RUC` y `Razón social`. El RUC se tratará como texto de exactamente 11 dígitos, nunca como importe o número de coma flotante. Se ignorarán filas completamente vacías; las filas incompletas, RUC inválidos y duplicados serán errores. No se permitirá reemplazar el padrón por un archivo vacío.

La importación tendrá dos operaciones separadas: **previsualizar** y **confirmar reemplazo**. La previsualización mostrará filas válidas, errores con número de fila, altas, cambios de razón social y bajas. Quedará asociada a un lote, la huella del archivo y la versión del padrón examinado. Solo una confirmación explícita del administrador activará ese mismo lote en una transacción; si otro reemplazo modificó el padrón entre la vista previa y la confirmación, se rechazará la vista obsoleta y habrá que previsualizar nuevamente. Una importación fallida conservará íntegro el padrón anterior. Los RUC ausentes quedarán inactivos, no se borrarán sus referencias históricas.

La consulta pública aceptará solo un RUC exacto, devolverá únicamente si está activo y su razón social, y no permitirá listar o exportar el padrón. Tendrá límites de consulta y respuestas que no expongan datos de otras empresas. Operadores podrán consultar el estado necesario para atender solicitudes, pero solo administradores podrán reemplazar el Excel.

## 5.3 Solicitud, inscripciones y pagos

Crear una entidad de solicitud grupal con código único, token opaco para la consulta pública protegida, clave de idempotencia, actividad, empresa asociada, titular, RUC y razón social congelados, datos de comprobante solo cuando exista cobro, fecha y auditoría. Agregar a `registrations` una relación nullable con la solicitud; `NULL` identificará el flujo individual anterior. La empresa y el precio de cada plaza permanecerán congelados aunque después cambien el padrón o la configuración del evento.

Cada asistente tendrá su `person`, `registration`, `attendance`, código individual, `price_snapshot` y eventual interés de certificado. Los importes y el estado operativo del grupo serán **derivados** de esas inscripciones: total vigente, confirmado y pendiente; solicitud pendiente, parcialmente confirmada o sin plazas pendientes según los casos. No se almacenarán contadores duplicados que puedan desincronizarse.

Registrar cada verificación de pago con importe, medio o referencia, nota opcional, fecha, usuario, clave de idempotencia y relación con las inscripciones seleccionadas. No guardar datos bancarios, imagen del voucher ni estado de emisión de boletas o facturas. La verificación deberá exigir que todos los seleccionados pertenezcan a la misma solicitud, estén pendientes y que el importe validado coincida con la suma de sus precios congelados. Un asistente no podrá quedar cubierto por dos verificaciones. Repetir la misma operación tras un corte de conexión devolverá el resultado ya creado, sin nuevas confirmaciones ni correos; reutilizar la clave con otros datos se rechazará.

La creación del grupo y sus asistentes será una única RPC transaccional e idempotente. Una repetición con la misma clave y los mismos datos devolverá la solicitud existente; reutilizarla con datos distintos se rechazará. La RPC volverá a verificar que el RUC esté activo, bloqueará la actividad antes de comprobar cupos y rechazará todo el grupo si falta espacio, hay un asistente duplicado dentro del formulario o ya existe una inscripción activa de esa persona al evento, incluso en otra solicitud del mismo RUC. Las inscripciones pendientes seguirán ocupando cupo. El precio se calculará en PostgreSQL desde la tarifa de asociado; nunca se aceptará el total enviado por el navegador como fuente de verdad. Una actividad exclusiva pagada no podrá publicarse con tarifa de asociado igual a cero. El interés opcional por el certificado de cada persona se registrará en la misma transacción, sin sumar su tarifa al total de participación.

Si el evento es gratuito, todas las plazas se confirmarán al registrar la solicitud con RUC activo y conservarán la cancelación administrativa habitual. Si es pagado, todas comenzarán pendientes y solo las seleccionadas en una verificación válida pasarán a confirmadas. No habrá vencimiento automático de solicitudes o plazas pagadas: el personal podrá cancelar manualmente solo las pendientes, liberando su cupo y actualizando el saldo derivado. Se bloqueará la cancelación ordinaria de una plaza ya pagada y confirmada; cualquier rectificación excepcional requerirá un proceso administrativo separado, fuera de este hito.

Si el documento de un asistente identifica a una persona existente y los nombres enviados difieren, la RPC actualizará su nombre vigente únicamente al completar correctamente todo el grupo. Registrará documento, valores anterior y nuevo, fecha y origen de la solicitud para auditoría; una solicitud fallida no modificará a la persona. Los snapshots de inscripciones anteriores conservarán sus nombres históricos. Las RPC individuales anteriores deberán rechazar eventos exclusivos y la confirmación individual anterior deberá rechazar plazas grupales, para impedir saltarse el padrón o validar una plaza sin pago.

## 5.4 Comprobante solicitado

Solo una solicitud pagada guardará los datos solicitados para emisión externa, como instantánea independiente de la empresa asociada:

- `boleta`: DNI de ocho dígitos, nombres y apellidos;
- `factura`: RUC de 11 dígitos, razón social y dirección.

El RUC de factura podrá ser diferente del RUC asociado y no requerirá pertenecer al padrón. Se validará su formato y que los campos estén completos, sin afirmar que la plataforma verificó su situación tributaria. Habrá un único conjunto de datos de facturación por solicitud, también cuando se validen pagos parciales. El personal podrá corregirlo desde administración con registro de valores anterior y nuevo, usuario y motivo; no modificará retroactivamente la empresa asociada que habilitó la solicitud. La plataforma no guardará números, archivos ni estados de boletas o facturas emitidas.

Todas las tablas nuevas expuestas tendrán RLS desde su creación. Las restricciones de formato, unicidad, estados, permisos y correspondencia entre pagos e inscripciones existirán en PostgreSQL además de las validaciones de interfaz.

---

# 6. Configuración y descubrimiento del evento

Un evento publicado no listado:

- seguirá mostrando su detalle e inscripción al abrir su URL directamente;
- no aparecerá en hero, destacados, catálogo de eventos, búsqueda global, sugerencias, recomendaciones ni sitemap;
- tendrá `noindex` en sus metadatos y no publicará datos estructurados de evento para descubrimiento;
- no contará como resultado público paginado, para evitar huecos y totales incorrectos;
- será visible normalmente para el personal en administración y Participación.

El filtro se aplicará en las consultas que alimentan cada superficie, no solo ocultando tarjetas en el navegador. El enlace directo podrá ser reenviado; el texto administrativo no lo presentará como acceso privado.

---

# 7. Experiencia pública de inscripción

## 7.1 Paso 1 — Empresa y personas

Mostrar un indicador simple de dos pasos: «1. Empresa y asistentes → 2. Comprobante y resumen» si el evento es pagado, o «1. Empresa y asistentes → 2. Resumen» si es gratuito. El primer control será «RUC de la empresa asociada», con teclado numérico, longitud de 11 dígitos y acción clara de verificación. Un RUC activo mostrará la razón social del padrón en un bloque de confirmación no editable. Un RUC ausente o inactivo impedirá avanzar y mostrará cómo contactar a la CCI; no se permitirá declarar manualmente que la empresa es asociada.

Después aparecerá «Tus datos» para el titular: DNI predeterminado —con Carné de Extranjería disponible como en el formulario actual—, nombres, apellidos, correo, celular y cargo. «Añadir otra persona» insertará tarjetas «Asistente 2», «Asistente 3», etc., con los mismos campos, títulos inequívocos y una acción «Quitar» que evite eliminar por accidente una tarjeta ya completada. No se repetirá el RUC en cada tarjeta.

Los campos se validarán junto al dato correspondiente y el primer error recibirá foco. «Siguiente» solo avanzará cuando el paso esté completo, sin enviar todavía la inscripción. Volver y cambiar entre pasos conservará la información escrita. Un cambio de RUC invalidará la razón social previamente verificada y exigirá verificar el nuevo valor.

La sugerencia opcional sobre futuros temas se pedirá una sola vez para la solicitud; no se enviará a analítica ni a correos. Si hay certificado `optional_paid`, cada tarjeta tendrá su propia casilla opcional de interés y su tarifa informativa; este costo no se sumará al precio de participación grupal.

## 7.2 Paso 2 — Comprobante, cuando corresponda, y resumen

Solo si el evento es pagado, presentar «Boleta» y «Factura» como dos opciones grandes de selección única. Para boleta, precargar DNI, nombres y apellidos del titular cuando corresponda, permitiendo editar para otro receptor. Para factura, mostrar RUC, razón social y dirección; una casilla «Usar datos de la empresa asociada» copiará RUC y razón social, pero la dirección seguirá siendo obligatoria. Si no se marca, podrá indicarse otro RUC. En un evento gratuito se omitirá por completo la elección y los campos de comprobante.

Mostrar nombres de asistentes, tarifa individual, número de plazas y total de participación. Incluir una confirmación breve de que el titular cuenta con autorización para registrar los datos de las personas adicionales. El botón final será «Enviar solicitud» o «Confirmar inscripción» según corresponda; deberá impedir doble envío y conservar datos ante errores recuperables.

La interfaz utilizará lenguaje directo, controles táctiles de al menos 44 px, texto legible, contraste y foco visible. No dependerá de colores solamente ni tendrá desplazamiento horizontal en móvil. El flujo se probará especialmente con usuarios mayores y con varios asistentes.

## 7.3 Resultado

El resultado protegido mostrará código de solicitud, empresa, lista de asistentes, importe y estado por persona. En evento pagado dirá: «Recibimos tu solicitud. El personal de la CCI verificará el pago antes de confirmar las plazas». Mostrará el importe por validar y un botón de WhatsApp hacia el número de contacto configurado en el evento; el mensaje incluirá el código de solicitud y el importe, sin DNI, RUC ni datos de los asistentes. No utilizará «inscripción confirmada» mientras haya plazas pendientes. Cuando existan confirmaciones parciales, mostrará cantidades confirmadas y pendientes sin revelar el grupo con solo conocer el código.

El resultado de un evento gratuito mostrará todas las plazas confirmadas. Una solicitud fallida por cupo o duplicado no generará resultado ni registros parciales; permitirá corregir el formulario.

---

# 8. Operación administrativa y pagos parciales

En la bandeja «Pagos por verificar», las solicitudes grupales se mostrarán **una vez por grupo**, no como varias filas indistinguibles. La fila resumirá evento, empresa/RUC asociado, RUC de facturación cuando corresponda, titular, código, tipo de comprobante solicitado, `confirmados/total`, importe total, confirmado, saldo pendiente y antigüedad. Se podrá buscar por ambos RUC, código, nombre de asistente y referencia, y filtrar por actividad y estado. El panel permitirá agrupar o filtrar las distintas solicitudes de un mismo RUC asociado para ver cuántas plazas y qué importe corresponde cobrar, sin confundirlo con el RUC de facturación. Las inscripciones individuales conservarán su tabla y acciones existentes.

El detalle de la solicitud mostrará primero empresa y comprobante, después el resumen económico y finalmente tarjetas de asistentes con documento, contacto, cargo, tarifa, estado, asistencia y certificado. Para registrar un pago el personal seleccionará solo asistentes pendientes; el sistema calculará el importe a verificar. Se pedirá medio o referencia y se admitirá una nota. La confirmación mostrará el número de plazas y el importe antes de ejecutar la RPC.

La selección parcial dejará a los no seleccionados pendientes y con cupo reservado hasta cancelación manual. No habrá «abonos sin asignar»: si el importe recibido no cubre exactamente la selección, el personal deberá resolver la diferencia fuera de la plataforma antes de confirmarla. No se podrá confirmar a personas canceladas o ya confirmadas ni cancelar ordinariamente a una persona con pago validado. El panel resaltará la antigüedad de las solicitudes pendientes y permitirá cancelar plazas no pagadas, con motivo y auditoría. La operación de pago guardará responsable y fecha, será idempotente y ofrecerá un mensaje claro si otro operador confirmó una plaza concurrentemente.

Las exportaciones administrativas diferenciarán código grupal, RUC asociado, RUC de facturación, tipo de comprobante solicitado, asistente, estado e importes sin repetir un pago grupal como ingreso nuevo por cada fila. Los valores exportados se protegerán contra fórmulas maliciosas de hojas de cálculo. Los datos personales y de facturación solo estarán disponibles para roles internos autorizados. No habrá registro de comprobantes emitidos en el panel. Archivar el evento lo ocultará de las vistas operativas existentes; no eliminará la trazabilidad histórica.

---

# 9. Comunicaciones

- Al enviar una solicitud pagada, enviar al titular un único resumen del grupo con código, asistentes, total y estado «pendiente de validación». Los adicionales no recibirán mensajes pendientes duplicados.
- Al confirmar una plaza pagada, enviar al correo de ese asistente su confirmación y código individuales, incluyendo acceso virtual cuando corresponda según las reglas de seguridad existentes.
- En un evento gratuito, enviar la confirmación individual a cada asistente y el resumen al titular sin duplicar el correo del titular.
- Mantener separados el pago de participación y la solicitud/pago de un certificado opcional. Un certificado solicitado por una persona no se aplicará automáticamente a las demás.
- Actualizar contratos de `notification_outbox`, plantillas fuente y JSON importable de n8n sin exponer DNI, RUC ni datos de terceros en URLs públicas. Los reintentos deberán ser idempotentes.

---

# 10. Seguridad, privacidad y prevención de errores

- Restringir la importación y el reemplazo del padrón a `administrator`; permitir a `operator` únicamente las consultas y operaciones necesarias para atender solicitudes y validar pagos.
- No exponer el Excel original, el padrón completo ni endpoints de búsqueda parcial de empresas al visitante. Limitar las consultas exactas de RUC y registrar abuso sin introducir una cuenta obligatoria.
- Exigir código y token opaco para consultar el resultado grupal; un código visible por sí solo no autorizará leer los datos de los demás asistentes.
- Aplicar RLS y permisos mínimos a padrón, lotes, solicitudes, verificaciones y relaciones. Ningún cliente público podrá marcar pagos o modificar estados directamente.
- Auditar reemplazos del padrón, correcciones de facturación, cambios de nombre de personas existentes, verificaciones de pago, confirmaciones y cancelaciones; proteger las RPC contra dobles envíos y carreras.
- Impedir mediante PostgreSQL que `register_activity` inscriba en eventos exclusivos o que `confirm_registration` confirme plazas grupales por fuera del flujo de pagos. La nueva RPC de grupo y la de verificación usarán claves de idempotencia y devolverán su resultado previo en un reintento idéntico.
- Validar tamaño, estructura y tipos de celda del Excel antes de importarlo; no ejecutar fórmulas, vínculos ni macros. Aplicar límites técnicos de carga y de frecuencia sin imponer un máximo comercial fijo de asistentes. Las restricciones de cupo, duplicidad, precio y pertenencia a la solicitud se comprobarán de nuevo en PostgreSQL.
- No prometer que un evento no listado sea confidencial ni que un RUC activo pruebe identidad o vínculo laboral. La decisión de usar solo RUC y la reserva indefinida de cupos pendientes son riesgos funcionales aceptados; el personal deberá monitorear solicitudes antiguas y cancelar manualmente las improcedentes.
- La actualización pública de nombres por documento tampoco verifica identidad por sí sola: conservar auditoría y permitir revisión administrativa de cambios sospechosos, sin reescribir snapshots históricos.

---

# 11. Estructura técnica y despliegue futuro

Implementar el dominio en `src/features` mediante componentes reutilizables y pequeños, tipos e interfaces en archivos separados, esquemas Zod, utilidades puras y servicios de una sola responsabilidad. Reutilizar átomos, moléculas y templates existentes; usar Tailwind sin CSS específico. Ningún componente excederá 170 líneas. Consultar la documentación instalada de Next.js 16 antes de codificar APIs de App Router y no crear `middleware.ts`.

Crear migraciones correlativas en `supabase/migrations`, generar tipos Supabase después de aplicarlas y añadir pruebas SQL transaccionales. La importación `.xlsx` se procesará en el servidor; una ruta administrativa propia solo se justificará para el archivo y su procesamiento, mientras que las operaciones transaccionales del dominio se resolverán mediante RPC. Mantener compatibilidad con inscripciones y correos existentes.

Antes de desplegar: revisar migraciones pendientes con `supabase db push --linked --dry-run`, aplicar únicamente las aprobadas sin seeds productivos, regenerar tipos, actualizar el workflow activo de n8n y enviar correos de prueba. Desplegar el código que usa las columnas nuevas solo después de aplicar la migración.

---

# 12. Pruebas y aceptación

## 12.1 Datos y concurrencia

- Archivo válido, archivo vacío, cabeceras incorrectas, RUC inválidos, duplicados y reemplazo fallido sin pérdida del padrón anterior.
- Conteo correcto de altas, cambios y bajas; solo administradores pueden confirmar el reemplazo; una previsualización queda obsoleta si otro administrador cambia el padrón antes de confirmarla; los registros históricos conservan sus snapshots.
- Un RUC inactivo no puede registrar; uno activo puede hacerlo. Cambiar el Excel después de una solicitud no modifica su elegibilidad histórica.
- Grupo de una persona, grupos con varios asistentes y varias solicitudes del mismo RUC; sin límite comercial fijo; duplicados internos o previos de una misma persona rechazan toda la operación.
- Últimos cupos y dos envíos concurrentes: o se registra el grupo completo o ninguno. Cada plaza pendiente o confirmada consume un cupo.
- Evento exclusivo gratuito confirma sin datos de comprobante; evento exclusivo pagado exige tarifa de asociado mayor que cero. Tarifa calculada en SQL, certificados opcionales independientes, importes grupales derivados y unicidad de códigos.
- Pago parcial con selección válida, segundo pago del resto, importe incorrecto, selección repetida, persona cancelada y dos operadores concurrentes. En eventos pagados solo se cancelan plazas pendientes; una pagada queda bloqueada para cancelación ordinaria. El gratuito conserva su cancelación habitual.
- Cupos pendientes sin vencimiento automático, antigüedad visible y liberación únicamente por cancelación manual auditada.
- Reintento idéntico de solicitud y verificación de pago devuelve el mismo resultado, sin duplicar plazas, pagos ni correos; reutilizar la clave con contenido diferente falla.
- Las RPC individuales antiguas rechazan inscripción en evento exclusivo y confirmación de plaza grupal. Cambiar precio o padrón después de solicitar no altera snapshots.
- DNI existente con nombres nuevos actualiza `people` solo tras crear el grupo completo; fallo transaccional conserva el nombre previo; auditoría registra antes/después y las inscripciones anteriores no cambian.
- Auditoría, permisos y RLS para padrón, solicitudes, facturación, cambios de identidad y pagos.

## 12.2 Portal, administración y comunicaciones

- Evento publicado no listado accesible por URL directa e invisible en inicio, eventos, búsqueda, sugerencias, sitemap y resultados paginados; `noindex` presente.
- Formulario exclusivo con RUC primero, razón social verificada, tarjetas adicionales, regreso sin pérdida de datos, foco en errores y doble envío impedido.
- Boleta para titular u otra persona; factura para misma u otra empresa, con dirección obligatoria; evento gratuito no pide comprobante. No se registra ni se emite un comprobante desde la web.
- Resultado pagado pendiente con WhatsApp al contacto del evento, código e importe sin datos personales; gratuito confirmado, confirmación parcial y código grupal protegido.
- Bandeja con una fila por solicitud, varias solicitudes del mismo RUC consultables juntas, ambos RUC diferenciados, cantidades e importes útiles para cobro, antigüedad y cancelación manual; edición auditada de facturación y exportación sin duplicar importes.
- Resumen al titular y confirmaciones individuales sin correos duplicados; fallos de n8n reintentables sin revertir la inscripción o el pago.
- Revisiones en 390 × 844, 768 × 1024 y 1440 × 900; teclado, foco, lector de pantalla, contraste y ausencia de desbordamiento público.

Ejecutar pruebas unitarias, SQL de actividades/inscripciones/seguridad/operación y regresión de certificados; `yarn lint`, `yarn typecheck` y `yarn build`. Registrar fecha, commit, ambiente, resultado y evidencia en la matriz de aceptación, sin declarar aprobadas pruebas aún no ejecutadas.

---

# 13. Definition of Done

El hito estará terminado cuando un administrador pueda reemplazar el padrón con vista previa y auditoría; publicar un evento exclusivo no listado; compartir su enlace; un asociado pueda verificar RUC y registrar un grupo gratuito sin comprobante o uno pagado con datos de boleta o factura; y el personal pueda consultar varias solicitudes por RUC, cancelar plazas impagas, validar parcialmente un pago y confirmar solo las plazas seleccionadas. El titular y cada asistente recibirán exclusivamente los avisos que les corresponden.

La implementación será incorrecta si un evento no listado aparece en superficies de descubrimiento, un RUC ausente permite avanzar, un error deja medio grupo registrado o cambia nombres, una RPC antigua evita validar padrón o pago, una vista previa obsoleta reemplaza el padrón, se confirma un importe calculado por el navegador, se cancela ordinariamente una plaza pagada, se cobra el certificado como parte de la participación, se duplican correos o pagos, o una preinscripción pagada se presenta como confirmada.

El hito conserva dos decisiones de riesgo explícitas: **el RUC activo por sí solo habilita el registro y no verifica la identidad ni la relación laboral de los asistentes; los cupos impagos no vencen automáticamente y requieren seguimiento manual**.
