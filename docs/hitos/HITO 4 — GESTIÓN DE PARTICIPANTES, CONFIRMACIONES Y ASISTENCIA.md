# HITO 4 — GESTIÓN DE PARTICIPANTES, CONFIRMACIONES Y ASISTENCIA

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 4 tiene como finalidad implementar la operación administrativa posterior a las inscripciones recibidas en eventos y capacitaciones.

En el Hito 3 la plataforma ya permite que una persona:

- consulte una actividad;
- se inscriba sin cuenta;
- quede confirmada automáticamente si la actividad es gratuita;
- quede como preinscrita si la actividad tiene costo;
- obtenga un código de inscripción;
- aparezca en la administración.

El Hito 4 permitirá que el personal de la Cámara gestione esas inscripciones y participantes durante la operación real de una actividad.

Se desarrollarán principalmente:

- gestión centralizada de participantes;
- búsqueda y consulta de personas;
- ficha institucional del participante;
- historial de actividades;
- gestión de preinscritos;
- confirmación manual de inscripciones con costo;
- cancelación administrativa de inscripciones;
- control general de asistencia;
- acciones múltiples sobre asistencia;
- filtros operativos;
- exportación de información.

Este hito deberá convertir el registro de participantes en una herramienta administrativa utilizable durante la organización y ejecución de eventos y capacitaciones.

---

# 2. Objetivo del hito

Implementar las funcionalidades administrativas necesarias para que la Cámara de Comercio de Ica pueda gestionar las personas inscritas en sus actividades desde su registro inicial hasta el control de asistencia.

Al finalizar este hito deberá poder realizarse el recorrido:

**Preinscripción → Revisión administrativa → Confirmación → Participación → Registro de asistencia.**

Asimismo, el sistema deberá comenzar a ofrecer una visión institucional consolidada de cada persona mediante la entidad:

`people`

permitiendo consultar todas las actividades en las que haya participado.

La información de una persona deberá mantenerse centralizada y no duplicarse por cada inscripción. 
---

# 3. Alcance del hito

El Hito 4 comprende:

- listado general de participantes;
- búsqueda de participantes;
- ficha individual;
- edición controlada de información personal;
- historial de actividades;
- consulta de inscripciones;
- consulta de preinscritos;
- consulta de confirmados;
- confirmación manual;
- cancelación de inscripción;
- registro de motivo de cancelación;
- asistencia individual;
- asistencia mediante selección múltiple;
- estados de asistencia;
- filtros administrativos;
- exportación de información;
- actualización de auditoría de operaciones sensibles cuando corresponda.

No comprende todavía:

- generación de certificados;
- habilitación de certificados;
- plantillas de certificados;
- descarga pública de certificados;
- login de participantes;
- cursos grabados;
- control de asistencia por cada sesión;
- QR de asistencia;
- pasarela de pagos.

---

# 4. Tareas del hito

## 4.1 Implementar módulo administrativo de participantes

Crear:

`/admin/participantes`

Esta sección deberá permitir consultar todas las personas registradas institucionalmente.

No deberá mostrar únicamente personas con cuenta.

También deberán aparecer personas que solamente hayan participado en eventos o capacitaciones.

---

# 5. Listado general de participantes

El listado deberá mostrar información relevante como:

- tipo de documento;
- número de documento;
- nombres;
- apellidos;
- correo;
- teléfono;
- cargo;
- empresa;
- RUC;
- cantidad de participaciones o información resumida cuando corresponda.

La lista deberá contar con:

- búsqueda;
- filtros necesarios;
- paginación;
- acceso a ficha individual.

---

# 6. Búsqueda de participantes

La administración deberá permitir buscar personas mediante:

- documento;
- nombres;
- apellidos;
- correo;
- teléfono.

La búsqueda deberá ejecutarse sobre `people`.

No deberá ser necesario conocer previamente una inscripción específica.

---

# 7. Crear ficha individual del participante

Crear:

`/admin/participantes/[id]`

La ficha deberá presentar como mínimo:

## Datos personales

- documento;
- nombres;
- apellidos;
- correo;
- teléfono;
- cargo;
- empresa;
- RUC;
- dirección.

## Historial de actividades

Mostrar las actividades relacionadas mediante:

`people → registrations → activities`

Para cada participación podrá mostrarse:

- actividad;
- tipo;
- fecha;
- código de inscripción;
- tipo de inscripción;
- estado;
- asistencia.

---

# 8. Mantener identidad institucional única

La ficha deberá utilizar siempre:

`people.id`

como referencia central.

Una inscripción adicional no deberá generar otra identidad.

Ejemplo:

```text
JUAN PÉREZ
│
├── Congreso Empresarial
│   └── Confirmado / Asistió
│
├── Taller Tributario
│   └── Confirmado / No asistió
│
└── Capacitación Marketing
    └── Pendiente
```

Este modelo constituirá la base para posteriormente incorporar también cursos y certificados dentro del historial institucional.

---

# 9. Edición administrativa de participante

El personal autorizado deberá poder corregir información de una persona.

Podrán modificarse cuando corresponda:

- nombres;
- apellidos;
- correo;
- teléfono;
- cargo;
- empresa;
- RUC;
- dirección.

La modificación de los datos actuales de `people` no deberá alterar los snapshots históricos ya almacenados en las inscripciones.

Por ejemplo:

`price_snapshot`

deberá permanecer sin cambios.

Lo mismo deberá aplicarse a:

- `company_snapshot`;
- `ruc_snapshot`.

---

# 10. Gestión administrativa de inscripciones

Crear o completar:

`/admin/inscripciones`

Deberá existir una vista general desde la cual puedan consultarse las inscripciones de todas las actividades.

---

# 11. Preinscritos

Crear una vista equivalente a:

`/admin/inscripciones/preinscritos`

Deberá mostrar principalmente:

`status = pending`

Estas personas representan registros que todavía requieren confirmación de la Cámara.

La interfaz deberá denominarlos claramente como:

- Preinscritos;
- No confirmados;

sin presentarlos como participantes definitivamente confirmados.

---

# 12. Confirmados

Crear una vista equivalente a:

`/admin/inscripciones/confirmados`

Deberá mostrar:

`status = confirmed`

Aquí aparecerán:

- participantes de actividades gratuitas confirmados automáticamente;
- participantes de actividades con costo confirmados posteriormente por administración.

---

# 13. Confirmación manual de preinscripción

El personal administrativo deberá poder transformar una inscripción:

`pending`

en:

`confirmed`

La operación deberá registrar:

- nuevo estado;
- `confirmed_at`;
- `confirmed_by`.

No deberá bastar con modificar visualmente el estado en el frontend.

La operación deberá persistirse en PostgreSQL.

---

# 14. Regla de confirmación

La confirmación manual estará destinada principalmente a actividades con costo.

El proceso funcional será:

```text
Preinscripción
      ↓
CCI verifica externamente pago / condición
      ↓
Administrador confirma
      ↓
registration.status = confirmed
      ↓
confirmed_at = fecha/hora
      ↓
confirmed_by = usuario administrativo
```

La plataforma no comprobará automáticamente pagos durante el MVP.

---

# 15. Idempotencia de confirmación

La acción de confirmar deberá ser idempotente.

Si una inscripción ya se encuentra:

`confirmed`

volver a ejecutar accidentalmente la misma acción no deberá:

- generar registros duplicados;
- alterar incorrectamente fechas;
- provocar notificaciones duplicadas;
- crear estados inconsistentes.

---

# 16. Cancelación de inscripción

El administrador deberá poder cancelar una inscripción.

El cambio deberá establecer:

`status = cancelled`

y registrar:

- `cancelled_at`;
- `cancelled_by`;
- `cancellation_reason`.

La cancelación será un estado funcional.

No deberá implementarse mediante soft delete.

---

# 17. Diferencia entre cancelación y eliminación

Una inscripción cancelada deberá conservarse históricamente.

Por lo tanto:

```text
status = cancelled
```

significa:

> La persona estuvo registrada, pero su inscripción fue cancelada.

Mientras:

```text
deleted_at IS NOT NULL
```

significa:

> El registro fue eliminado lógicamente del uso normal.

Ambas situaciones deberán mantenerse diferenciadas.

---

# 18. Crear módulo administrativo de asistencia

Crear:

`/admin/asistencia`

Desde esta sección deberá poder seleccionarse una actividad y consultar sus participantes.

También podrá accederse directamente mediante una ruta equivalente a:

`/admin/asistencia/[activityId]`

---

# 19. Fuente de datos de asistencia

La asistencia deberá relacionarse con:

`registrations → attendance`

Cada inscripción activa tendrá un registro de asistencia previamente creado.

Los estados serán:

```text
pending
attended
absent
```

---

# 20. Estado pendiente

Antes de realizarse la actividad:

`attendance.status = pending`

Esto significa que todavía no se ha registrado el resultado de asistencia.

No significa ausencia.

---

# 21. Marcar asistencia

El personal administrativo deberá poder cambiar el estado a:

`attended`

La operación deberá registrar:

- `status`;
- `marked_at`;
- `marked_by`.

---

# 22. Marcar ausencia

El personal deberá poder cambiar el estado a:

`absent`

También deberá registrarse:

- `marked_at`;
- `marked_by`.

---

# 23. Modificación posterior

Una asistencia podrá corregirse si el personal administrativo cometió un error.

Ejemplo:

```text
absent
↓
attended
```

La operación deberá actualizar correctamente:

- estado;
- fecha;
- usuario responsable.

Las operaciones sensibles deberán quedar preparadas para auditoría.

---

# 24. Asistencia general por actividad

El MVP no deberá implementar asistencia individual por cada fecha.

Aunque una capacitación tenga:

```text
Fecha 1
Fecha 2
Fecha 3
```

solo existirá una condición general:

```text
Asistió
No asistió
Pendiente
```

para la capacitación completa.

---

# 25. Participantes visibles en asistencia

La pantalla deberá permitir distinguir claramente:

- preinscritos/no confirmados;
- confirmados.

Los no confirmados podrán seguir apareciendo para consulta administrativa.

Sin embargo, la interfaz deberá evitar confundirlos con participantes definitivamente confirmados.

---

# 26. Selección múltiple

La pantalla de asistencia deberá permitir seleccionar varios participantes.

Ejemplo:

```text
☑ Ana Pérez
☑ Luis Torres
☑ Juan Flores
```

y ejecutar una acción:

**Marcar como asistieron**

También podrá existir:

**Marcar como no asistieron**

según la solución visual implementada.

---

# 27. Acciones masivas

Las operaciones masivas deberán ejecutarse de forma controlada.

No deberá depender de decenas de modificaciones independientes sin manejo de error.

La implementación podrá utilizar:

- operaciones agrupadas adecuadamente;
- RPC PostgreSQL si resulta necesario para garantizar consistencia.

El equipo deberá priorizar una solución que permita saber qué registros fueron procesados correctamente.

---

# 28. Notas de asistencia

Cuando resulte necesario, deberá poder utilizarse:

`attendance.notes`

para información administrativa complementaria.

El campo será opcional.

---

# 29. Filtros operativos por actividad

El panel deberá permitir filtrar participantes como mínimo por:

- estado de inscripción;
- tipo de inscripción;
- asistencia.

Cuando corresponda también podrá incluir:

- nombre;
- documento;
- empresa.

---

# 30. Búsqueda dentro de una actividad

Al administrar una actividad deberá poder localizarse rápidamente a un participante mediante:

- documento;
- nombre;
- correo.

Esto será especialmente importante durante el control presencial.

---

# 31. Integración con la gestión de actividad

Desde la administración de una actividad deberá poder accederse a secciones equivalentes a:

- Información;
- Fechas;
- Expositores;
- Inscritos;
- Asistencia.

Los certificados serán incorporados en el siguiente hito.

---

# 32. Exportación de participantes

El MVP deberá permitir exportar listas de participantes.

El formato mínimo podrá ser:

`CSV`

compatible con Excel y otras hojas de cálculo.

---

# 33. Campos mínimos de exportación

La exportación deberá incluir cuando corresponda:

- tipo de documento;
- número de documento;
- nombres;
- apellidos;
- correo;
- celular;
- cargo;
- empresa;
- RUC;
- tipo de inscripción;
- estado;
- asistencia.

Podrá incluir también:

- código de inscripción;
- precio registrado;

si resulta útil administrativamente.

---

# 34. Exportación según filtros

Preferentemente la exportación deberá respetar el contexto seleccionado.

Ejemplo:

```text
Actividad: Congreso Empresarial
Filtro: Confirmados
```

Entonces la exportación deberá poder generar la lista correspondiente a ese conjunto.

También deberá ser posible exportar la relación completa cuando sea necesario.

---

# 35. Generación de exportación

Para los volúmenes normales esperados en el MVP, el archivo podrá generarse desde el cliente utilizando los datos consultados.

No será obligatorio crear un proceso servidor exclusivamente para exportaciones pequeñas.

Si el volumen futuro aumenta significativamente, la estrategia podrá modificarse.

---

# 36. Preparar notificación de confirmación

Cuando una inscripción con costo pase de:

`pending → confirmed`

deberá generarse conceptualmente el evento:

`activity_paid_registration_confirmed`

definido en el diseño de notificaciones.

La implementación completa del envío de correo se consolidará en el Hito 5.

No obstante, la operación de confirmación deberá quedar preparada para producir el evento correspondiente sin tener que rediseñar posteriormente el flujo.

---

# 37. Auditoría

El diseño físico contempla:

`audit_logs`

como tabla append-only para operaciones administrativas relevantes.

Si dicha tabla se incorpora en este hito, deberán auditarse prioritariamente acciones como:

- confirmar inscripción;
- cancelar inscripción;
- cambiar asistencia;
- modificar datos de persona.

La implementación deberá registrar cuando sea posible:

- usuario;
- acción;
- entidad;
- estado anterior;
- estado nuevo;
- fecha.

---

# 38. Tabla `audit_logs`

Si se implementa como parte de este hito, deberá seguir el diseño aprobado:

```text
id
actor_user_id
action
entity_type
entity_id
old_data
new_data
metadata
ip_address
user_agent
created_at
```

No deberá utilizar:

- `deleted_at`;
- `deleted_by`.

Los logs serán append-only.

---

# 39. Queries del dominio de participantes

Crear operaciones equivalentes a:

```text
getParticipants()
getParticipantById()
getParticipantHistory()
searchParticipants()
```

No es obligatorio utilizar exactamente estos nombres.

---

# 40. Queries del dominio de inscripciones

Crear operaciones equivalentes a:

```text
getRegistrations()
getPendingRegistrations()
getConfirmedRegistrations()
getActivityRegistrations()
```

Las consultas deberán soportar:

- búsqueda;
- filtros;
- paginación.

---

# 41. Mutations de inscripciones

Crear operaciones equivalentes a:

```text
confirmRegistration()
cancelRegistration()
```

Estas operaciones deberán encapsular la interacción con Supabase/PostgreSQL.

Los componentes visuales no deberán modificar tablas directamente mediante lógica repetida.

---

# 42. Queries de asistencia

Crear operaciones equivalentes a:

```text
getActivityAttendance()
getAttendanceByRegistration()
```

---

# 43. Mutations de asistencia

Crear operaciones equivalentes a:

```text
markAttendance()
bulkMarkAttendance()
```

La solución exacta podrá utilizar consultas directas o RPC según la complejidad y necesidad transaccional.

---

# 44. Mutation de participante

Crear una operación equivalente a:

```text
updateParticipant()
```

Deberá permitir únicamente modificaciones válidas sobre `people`.

No deberá alterar snapshots históricos.

---

# 45. Separación por features

Mantener la organización:

```text
src/features/
```

con módulos como:

```text
participants/
registrations/
attendance/
```

Ejemplo:

```text
participants/
    components/
    queries/
    mutations/
    schemas/
    types/

registrations/
    components/
    queries/
    mutations/

attendance/
    components/
    queries/
    mutations/
```

---

# 46. Atomic Design aplicado al Hito 4

## Atoms

Reutilizar:

- Button;
- Input;
- Checkbox;
- Badge;
- Text;
- Spinner.

## Molecules

Crear/reutilizar:

```text
SearchInput
StatusBadge
Pagination
FormField
AttendanceSelector
```

## Organisms

Crear componentes equivalentes a:

```text
ParticipantsTable
RegistrationsTable
AttendanceTable
ParticipantInformation
ParticipantHistory
```

## Templates

Podrán existir:

```text
ParticipantsManagementTemplate
ParticipantDetailTemplate
AttendanceManagementTemplate
```

---

# 47. Manejo de estados visuales

Cada pantalla deberá contemplar:

- loading;
- error;
- empty;
- success.

Ejemplos:

**No se encontraron participantes.**

**Esta actividad todavía no tiene inscritos.**

**No existen participantes pendientes de confirmación.**

---

# 48. Requerimientos técnicos

## RT-01 — Uso de `people`

La gestión de participantes deberá utilizar `people` como núcleo de identidad.

---

## RT-02 — Historial relacional

El historial deberá obtenerse mediante relaciones entre:

```text
people
registrations
activities
attendance
```

No deberá almacenarse como un JSON duplicado dentro de `people`.

---

## RT-03 — Confirmación persistente

La confirmación deberá actualizar:

```text
registrations.status
registrations.confirmed_at
registrations.confirmed_by
```

---

## RT-04 — Cancelación persistente

La cancelación deberá utilizar:

```text
status = cancelled
cancelled_at
cancelled_by
cancellation_reason
```

---

## RT-05 — Cancelación ≠ soft delete

Las cancelaciones no deberán ejecutarse mediante `deleted_at`.

---

## RT-06 — Asistencia

La asistencia deberá utilizar la tabla:

`attendance`

---

## RT-07 — Una asistencia por inscripción

Deberá mantenerse la restricción de una asistencia activa por `registration_id`.

---

## RT-08 — Estados de asistencia

Solo deberán utilizarse:

```text
pending
attended
absent
```

dentro del alcance actual.

---

## RT-09 — No asistencia por sesión

No deberán crearse tablas o funcionalidades de asistencia por cada `activity_date` en el MVP.

---

## RT-10 — Acciones múltiples

La selección múltiple deberá procesarse de forma controlada y manejar errores.

---

## RT-11 — Snapshots

La edición de `people` no deberá modificar snapshots existentes en `registrations`.

---

## RT-12 — Paginación

Los listados generales administrativos deberán soportar paginación.

---

## RT-13 — Filtros en base de datos

Los filtros administrativos deberán realizarse preferentemente desde PostgreSQL/Supabase y no cargando siempre todos los registros al navegador.

---

## RT-14 — Búsqueda

La búsqueda deberá aprovechar índices definidos para campos relevantes.

---

## RT-15 — Selección de columnas

Las tablas administrativas deberán evitar consultas `select *` indiscriminadas cuando no sean necesarias.

---

## RT-16 — Exportación

La exportación deberá generar al menos CSV válido y compatible con hojas de cálculo.

---

## RT-17 — TypeScript

Queries, mutations, filtros, formularios y respuestas deberán estar correctamente tipados.

---

## RT-18 — Supabase directo

Las operaciones normales podrán utilizar `supabase-js` directamente.

No deberá construirse una API CRUD intermedia innecesaria.

---

## RT-19 — RPC

Podrán utilizarse funciones PostgreSQL para operaciones administrativas que requieran múltiples cambios atómicos o acciones masivas complejas.

---

## RT-20 — Auditoría

Las operaciones administrativas sensibles deberán quedar preparadas para registrarse mediante `audit_logs`.

---

## RT-21 — Atomic Design

Las tablas, filtros, badges, selectores y componentes administrativos deberán respetar la arquitectura Atomic Design definida.

---

## RT-22 — Soft delete

Los registros eliminados lógicamente deberán excluirse de los flujos administrativos normales salvo vistas especiales futuras.

---

## RT-23 — RLS

RLS ya deberá estar activo sobre `people`, `registrations` y `attendance`.

Este hito deberá ampliar y verificar las políticas para que únicamente cuentas internas activas con rol `operator` o `administrator` puedan consultar datos personales, confirmar o cancelar inscripciones y registrar asistencia. No se habilitará acceso anónimo directo a estas tablas.

El Hito 11 realizará la auditoría global y el endurecimiento final.

---

# 49. Requerimientos funcionales

## RF-01 — Listado de participantes

La administración deberá poder consultar todas las personas registradas.

---

## RF-02 — Participante sin cuenta

Una persona deberá aparecer en administración aunque no posea usuario de Campus.

---

## RF-03 — Búsqueda por documento

El personal deberá poder localizar una persona mediante su documento.

---

## RF-04 — Búsqueda por nombre

El personal deberá poder buscar mediante nombres o apellidos.

---

## RF-05 — Búsqueda por correo

El personal deberá poder buscar mediante correo.

---

## RF-06 — Búsqueda por teléfono

El personal deberá poder localizar mediante teléfono cuando corresponda.

---

## RF-07 — Ficha de participante

La administración deberá poder consultar los datos principales de una persona.

---

## RF-08 — Historial

La ficha deberá mostrar sus participaciones anteriores registradas en la plataforma.

---

## RF-09 — Edición

El personal autorizado deberá poder corregir datos de una persona.

---

## RF-10 — Preservación histórica

La edición de datos personales actuales no deberá modificar los valores históricos almacenados como snapshots.

---

## RF-11 — Consultar preinscritos

La administración deberá disponer de una vista diferenciada de preinscritos.

---

## RF-12 — Consultar confirmados

La administración deberá disponer de una vista diferenciada de confirmados.

---

## RF-13 — Confirmar inscripción

Una inscripción pendiente deberá poder confirmarse manualmente.

---

## RF-14 — Registro de responsable

Al confirmar deberá registrarse quién realizó la operación.

---

## RF-15 — Registro de fecha

Al confirmar deberá registrarse cuándo se realizó.

---

## RF-16 — Cancelación

Una inscripción deberá poder cancelarse.

---

## RF-17 — Motivo de cancelación

La cancelación podrá registrar un motivo administrativo.

---

## RF-18 — Preservación de inscripción cancelada

Una inscripción cancelada deberá conservarse históricamente.

---

## RF-19 — Consultar asistencia

El personal deberá poder consultar la asistencia de una actividad.

---

## RF-20 — Asistencia pendiente

Los registros deberán encontrarse inicialmente en estado pendiente.

---

## RF-21 — Marcar asistió

El personal deberá poder establecer:

`attended`

---

## RF-22 — Marcar no asistió

El personal deberá poder establecer:

`absent`

---

## RF-23 — Corregir asistencia

Una asistencia deberá poder modificarse posteriormente por personal autorizado.

---

## RF-24 — Asistencia múltiple

Se deberá permitir seleccionar varios participantes y registrar asistencia en grupo.

---

## RF-25 — No confirmados visibles

Los preinscritos/no confirmados deberán poder seguir consultándose desde las pantallas administrativas de la actividad.

---

## RF-26 — Diferenciación visual

La interfaz deberá distinguir claramente:

- pendiente;
- confirmado;
- cancelado;
- asistió;
- no asistió.

---

## RF-27 — Exportación

La Cámara deberá poder exportar la relación de participantes.

---

## RF-28 — Datos de exportación

La exportación deberá contener los campos administrativos definidos funcionalmente.

---

## RF-29 — Filtros

La administración deberá poder filtrar registros según estado y asistencia.

---

## RF-30 — Sin pago integrado

La confirmación manual no deberá requerir una operación de pago dentro del sistema.

---

# 50. Fuera del alcance del Hito 4

No forma parte de este hito:

- pasarela de pagos;
- comprobación bancaria automática;
- validación automática de asociado;
- facturación;
- lista de espera;
- QR de asistencia;
- escaneo de entradas;
- asistencia por sesión;
- certificados;
- PDF de certificados;
- acceso público a certificados;
- login de participantes;
- cursos;
- progreso académico;
- quizzes.

---

# 51. Definition of Done

El Hito 4 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Participantes

- [ ] Existe `/admin/participantes`.
- [ ] Se muestran personas existentes en `people`.
- [ ] Una persona sin cuenta puede aparecer en el listado.
- [ ] Existe búsqueda por documento.
- [ ] Existe búsqueda por nombre/apellido.
- [ ] Existe búsqueda por correo.
- [ ] Existe búsqueda por teléfono cuando corresponda.
- [ ] Existe paginación.
- [ ] Existe `/admin/participantes/[id]`.
- [ ] Se muestran los datos personales.
- [ ] Se muestra historial de actividades.
- [ ] Se muestran estados de inscripción.
- [ ] Se muestra asistencia.
- [ ] Se pueden corregir datos permitidos.
- [ ] Los snapshots históricos no cambian al editar `people`.

## Inscripciones

- [ ] Existe listado administrativo de inscripciones.
- [ ] Existe vista de preinscritos.
- [ ] Existe vista de confirmados.
- [ ] Se puede filtrar por actividad.
- [ ] Se puede buscar participante.
- [ ] Se puede confirmar una inscripción pendiente.
- [ ] La confirmación establece `status = confirmed`.
- [ ] Se registra `confirmed_at`.
- [ ] Se registra `confirmed_by`.
- [ ] Confirmar dos veces no genera inconsistencias.
- [ ] Se puede cancelar una inscripción.
- [ ] La cancelación establece `status = cancelled`.
- [ ] Se registra `cancelled_at`.
- [ ] Se registra `cancelled_by`.
- [ ] Puede registrarse `cancellation_reason`.
- [ ] Una inscripción cancelada no se elimina físicamente.

## Asistencia

- [ ] Existe módulo administrativo de asistencia.
- [ ] Puede seleccionarse una actividad.
- [ ] Se muestran sus inscripciones.
- [ ] Se distinguen preinscritos y confirmados.
- [ ] Cada inscripción muestra su estado de asistencia.
- [ ] Se puede marcar `attended`.
- [ ] Se puede marcar `absent`.
- [ ] Se puede devolver/corregir un estado.
- [ ] Se registra `marked_at`.
- [ ] Se registra `marked_by`.
- [ ] Se pueden seleccionar múltiples participantes.
- [ ] Se puede registrar asistencia en grupo.
- [ ] Las operaciones múltiples manejan correctamente errores.
- [ ] No se implementó asistencia por cada sesión.

## Historial

- [ ] Una persona puede mostrar múltiples actividades.
- [ ] La ficha institucional no depende de que la persona tenga cuenta.
- [ ] No se crean duplicados de persona por nuevas participaciones.
- [ ] La información histórica se obtiene relacionalmente.

## Exportaciones

- [ ] Se puede exportar una lista.
- [ ] El archivo es compatible con hojas de cálculo.
- [ ] Contiene documento.
- [ ] Contiene nombres y apellidos.
- [ ] Contiene correo.
- [ ] Contiene celular.
- [ ] Contiene cargo.
- [ ] Contiene empresa.
- [ ] Contiene RUC.
- [ ] Contiene tipo de inscripción.
- [ ] Contiene estado.
- [ ] Contiene asistencia.
- [ ] La exportación respeta el contexto/filtros definidos cuando corresponda.

## Arquitectura

- [ ] Queries de participantes están separadas de componentes.
- [ ] Queries de inscripciones están organizadas.
- [ ] Mutations de confirmación/cancelación están organizadas.
- [ ] Queries y mutations de asistencia están organizadas.
- [ ] Los componentes respetan Atomic Design.
- [ ] Las tablas administrativas son reutilizables cuando corresponde.
- [ ] No existe una API CRUD duplicada e innecesaria.
- [ ] Las operaciones están tipadas con TypeScript.

## Performance

- [ ] Los listados utilizan paginación.
- [ ] Los filtros se ejecutan adecuadamente contra Supabase/PostgreSQL.
- [ ] No se cargan todos los participantes innecesariamente para operaciones normales.
- [ ] Las consultas seleccionan columnas relevantes.
- [ ] Los índices necesarios están disponibles.

## Manejo de errores

- [ ] Se informa cuando una inscripción ya está confirmada.
- [ ] Se maneja cancelación de inscripción.
- [ ] Se manejan errores al actualizar asistencia.
- [ ] Se manejan errores de operaciones múltiples.
- [ ] No se muestran mensajes SQL directamente al usuario.
- [ ] Existen estados loading.
- [ ] Existen estados empty.
- [ ] Existen estados success/error.

---

# 52. Pruebas funcionales obligatorias

## Caso 1 — Confirmación de actividad con costo

```text
1. Persona realiza preinscripción.
2. Estado = pending.
3. Administrador abre preinscritos.
4. Localiza al participante.
5. Confirma inscripción.
6. Estado cambia a confirmed.
7. Se registra confirmed_at.
8. Se registra confirmed_by.
9. Aparece en confirmados.
```

---

## Caso 2 — Participante con múltiples actividades

```text
1. Persona se inscribe en Evento A.
2. Misma persona se inscribe en Capacitación B.
3. Se reutiliza el mismo person_id.
4. Administrador abre ficha.
5. Aparecen Evento A y Capacitación B.
```

---

## Caso 3 — Corrección de datos

```text
1. Abrir participante.
2. Modificar teléfono y empresa.
3. Guardar.
4. people refleja los nuevos datos.
5. company_snapshot de inscripción anterior permanece igual.
6. price_snapshot permanece igual.
```

---

## Caso 4 — Cancelación

```text
1. Seleccionar inscripción.
2. Cancelarla.
3. Registrar motivo.
4. status = cancelled.
5. cancelled_at registrado.
6. cancelled_by registrado.
7. La inscripción continúa existiendo históricamente.
```

---

## Caso 5 — Asistencia individual

```text
1. Abrir actividad.
2. Consultar participantes.
3. Seleccionar participante confirmado.
4. Marcar Asistió.
5. attendance.status = attended.
6. Registrar marked_at.
7. Registrar marked_by.
```

---

## Caso 6 — Ausencia

```text
1. Seleccionar participante.
2. Marcar No asistió.
3. attendance.status = absent.
4. El estado aparece correctamente en administración.
```

---

## Caso 7 — Corrección de asistencia

```text
1. Participante está marcado absent.
2. Administrador corrige a attended.
3. Estado se actualiza.
4. La interfaz refleja la corrección.
```

---

## Caso 8 — Asistencia masiva

```text
1. Abrir una actividad con múltiples participantes.
2. Seleccionar varios registros.
3. Ejecutar “Marcar como asistieron”.
4. Todos los registros seleccionados se actualizan.
5. Los no seleccionados permanecen sin cambios.
```

---

## Caso 9 — Exportación

```text
1. Abrir participantes de una actividad.
2. Filtrar confirmados.
3. Exportar.
4. Abrir archivo en una hoja de cálculo.
5. Verificar columnas.
6. Verificar que los registros correspondan al filtro.
```

---

# 53. Validación final del hito

Antes de aprobar el Hito 4, el equipo deberá demostrar el siguiente recorrido completo:

```text
1. Crear una actividad con costo.
2. Recibir varias preinscripciones.
3. Abrir administración.
4. Buscar un participante.
5. Consultar su ficha.
6. Consultar su historial.
7. Confirmar algunas inscripciones.
8. Dejar otras pendientes.
9. Cancelar una inscripción.
10. Consultar claramente los diferentes estados.
11. Ejecutar la actividad.
12. Marcar asistencia individual.
13. Marcar asistencia múltiple.
14. Corregir una asistencia.
15. Exportar la lista final.
16. Confirmar que la información histórica se conserva.
```

Todo el proceso deberá realizarse desde la aplicación, sin modificar directamente los registros desde el Dashboard de Supabase.

---

# 54. Resultado final esperado del Hito 4

Al finalizar este hito, la Cámara deberá poder utilizar la plataforma para gestionar operativamente una actividad hasta el momento posterior a su realización.

El flujo será:

```text
INSCRIPCIONES
      │
      ├── PENDING
      │      ↓
      │   Verificación externa
      │      ↓
      │   CONFIRMED
      │
      ├── CONFIRMED
      │
      └── CANCELLED
             │
             ▼
        PARTICIPANTES
             │
             ├── Datos
             ├── Historial
             └── Participaciones
             │
             ▼
          ACTIVIDAD
             │
             ▼
         ASISTENCIA
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
   PENDING ATTENDED ABSENT
             │
             ▼
         EXPORTACIÓN
```

Con este hito quedará completada la operación administrativa necesaria para saber:

- quién se registró;
- quién continúa pendiente;
- quién fue confirmado;
- quién fue cancelado;
- quién asistió;
- quién no asistió;
- cuál es el historial de cada persona.

El siguiente paso será utilizar esta información para determinar qué participantes pueden recibir certificados.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 5 — Certificados y notificaciones de eventos y capacitaciones.**
