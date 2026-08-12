# HITO 3 — INSCRIPCIÓN A EVENTOS Y CAPACITACIONES

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 3 tiene como finalidad implementar el proceso completo de **inscripción y preinscripción a eventos y capacitaciones**.

A partir de este hito, las actividades publicadas durante el Hito 2 dejarán de ser únicamente informativas y comenzarán a recibir participantes reales.

La característica principal de este proceso es que **una persona no necesitará crear una cuenta ni iniciar sesión para inscribirse en un evento o capacitación**.

El proceso deberá ser rápido y directo desde la ficha de la actividad.

La plataforma deberá ser capaz de:

- identificar o crear una persona;
- recibir sus datos;
- diferenciar público general y asociado CCI;
- validar el periodo de inscripción;
- evitar inscripciones duplicadas;
- controlar cupos;
- determinar el precio correspondiente;
- diferenciar actividades gratuitas y con costo;
- crear una inscripción o preinscripción;
- generar un código único;
- dejar preparado el registro de asistencia;
- mostrar el resultado al participante;
- mostrar la inscripción al personal administrativo.

La operación crítica de inscripción no deberá depender de una secuencia de consultas e inserciones realizadas exclusivamente desde el navegador.

Se deberá implementar una función PostgreSQL transaccional equivalente a:

`register_activity()`

que concentre las principales reglas de negocio y garantice consistencia ante concurrencia, doble envío o intentos simultáneos de tomar el último cupo. 
---

# 2. Objetivo del hito

Implementar un proceso de inscripción confiable, simple y transaccional para eventos y capacitaciones, permitiendo que cualquier visitante pueda registrarse sin cuenta y que la Cámara pueda visualizar inmediatamente las inscripciones recibidas.

Al finalizar el hito deberá funcionar el recorrido:

**Actividad publicada → Formulario → Validación → Registro de persona → Inscripción/preinscripción → Código → Resultado → Visualización administrativa.**

Este hito deberá contemplar dos comportamientos diferentes:

### Actividad gratuita

**Inscripción → Confirmación automática**

### Actividad con costo

**Inscripción → Preinscripción pendiente → Confirmación administrativa posterior**

La confirmación administrativa de actividades con costo comenzará a utilizarse operativamente en el Hito 4.

---

# 3. Alcance del hito

El Hito 3 comprende:

- modelo de inscripciones;
- modelo inicial de asistencia;
- tipos de inscripción;
- estados de inscripción;
- formulario público;
- identificación de personas;
- reutilización de `people`;
- prevención de duplicados;
- validación de cupos;
- validación del periodo de inscripción;
- generación de código;
- precios históricos;
- datos históricos de asociado;
- inscripción gratuita;
- preinscripción con costo;
- función PostgreSQL transaccional;
- página de resultado;
- listados administrativos iniciales;
- manejo de errores de negocio.

No comprende todavía:

- proceso completo de asistencia;
- acciones masivas de asistencia;
- certificados;
- generación de PDF;
- login de participantes;
- pagos integrados;
- validación automática del padrón de asociados;
- pasarela de pago.

---

# 4. Tareas del hito

## 4.1 Crear enums del dominio de inscripción

Crear los siguientes enums PostgreSQL.

### `registration_type`

```text
general
member
```

### `registration_status`

```text
pending
confirmed
cancelled
```

### `attendance_status`

```text
pending
attended
absent
```

En este hito la asistencia se creará inicialmente en estado:

`pending`

La gestión operativa de asistencia se desarrollará completamente en el Hito 4.

---

# 5. Crear tabla `registrations`

## Objetivo

Representar cada inscripción o preinscripción realizada por una persona a una actividad.

La relación será:

```text
PEOPLE
   │
   ▼
REGISTRATIONS
   │
   ▼
ACTIVITIES
```

Una inscripción deberá vincular siempre:

- una persona;
- una actividad.

## Campos

Implementar:

```text
id
activity_id
person_id
registration_code
registration_type
status
company_snapshot
ruc_snapshot
price_snapshot
confirmed_at
confirmed_by
cancelled_at
cancelled_by
cancellation_reason
created_at
updated_at
deleted_at
deleted_by
```

La estructura deberá respetar el diseño físico aprobado.

---

# 6. Evitar inscripciones duplicadas

La regla funcional establece que una misma persona no podrá inscribirse dos veces en la misma actividad utilizando la misma identidad.

Esta validación **no deberá depender únicamente del frontend**.

Deberá existir una restricción equivalente a:

```sql
CREATE UNIQUE INDEX uq_registration_person_activity_active
ON registrations(activity_id, person_id)
WHERE deleted_at IS NULL;
```

Por tanto:

```text
Persona A + Actividad X
```

solo podrá tener una inscripción activa.

Si intenta registrarse nuevamente, la interfaz deberá mostrar un mensaje comprensible equivalente a:

**“Ya te encuentras inscrito en esta actividad”.** 
---

# 7. Código de inscripción

Cada inscripción deberá generar un código público único.

Ejemplo:

```text
CCI-EV-000124
```

El código:

- no será la clave primaria;
- no reemplazará el UUID;
- deberá ser único;
- no deberá reutilizarse;
- deberá poder consultarse posteriormente desde administración.

La generación del código no deberá depender de un contador calculado exclusivamente en el navegador.

---

# 8. Snapshots de la inscripción

La tabla deberá conservar determinados valores históricos en el momento de la inscripción.

## `company_snapshot`

Empresa declarada al inscribirse.

## `ruc_snapshot`

RUC declarado al inscribirse.

## `price_snapshot`

Precio que correspondía al participante en ese momento.

Esto evita que modificaciones futuras sobre:

- datos de la persona;
- precio de la actividad;
- información empresarial;

alteren el contexto histórico de una inscripción ya realizada.

---

# 9. Crear tabla `attendance`

## Objetivo

Preparar desde la inscripción el registro de asistencia que posteriormente será gestionado operativamente.

Relación:

```text
REGISTRATION
      │
      ▼
ATTENDANCE
```

La relación será conceptualmente:

```text
1 inscripción → 1 asistencia activa
```

## Campos

```text
id
registration_id
status
marked_at
marked_by
notes
created_at
updated_at
deleted_at
deleted_by
```

Al registrarse una persona, inicialmente:

```text
status = pending
```

La asistencia general pertenece a toda la actividad.

No se implementará asistencia por cada fecha o sesión durante el MVP.

---

# 10. Restricción de asistencia

Deberá existir una sola asistencia activa por inscripción.

Implementar:

```sql
CREATE UNIQUE INDEX uq_attendance_registration_active
ON attendance(registration_id)
WHERE deleted_at IS NULL;
```

---

# 11. Reutilizar `people`

El formulario de inscripción no deberá crear automáticamente una nueva persona cada vez que alguien complete sus datos.

La regla deberá ser:

```text
Documento recibido
       ↓
Buscar persona
       ↓
¿Existe?
   ├── Sí → utilizar person_id existente
   └── No → crear persona
```

La identidad principal se determinará mediante:

```text
document_type
+
document_number
```

Esto permitirá construir desde esta etapa el historial institucional de una persona.

---

# 12. Actualización de datos de persona

Cuando una persona ya exista y vuelva a participar en otra actividad, deberá definirse una actualización controlada de los datos actuales cuando corresponda.

Por ejemplo:

- correo;
- celular;
- cargo;
- empresa;
- dirección.

La inscripción deberá seguir conservando mediante snapshots los datos históricos específicos que correspondan al momento del registro.

No deberá crearse una segunda persona por diferencias en correo, empresa o teléfono si el documento corresponde a la misma identidad institucional.

---

# 13. Crear función PostgreSQL `register_activity()`

Esta será la pieza técnica central del Hito 3.

El frontend deberá poder ejecutar conceptualmente:

```text
Formulario
    ↓
supabase.rpc("register_activity")
    ↓
PostgreSQL
```

La función deberá ejecutar la operación dentro de un proceso consistente y controlado.

---

# 14. Responsabilidades de `register_activity()`

Como mínimo deberá realizar las siguientes operaciones.

## 14.1 Validar actividad

Comprobar que:

- existe;
- no está eliminada;
- se encuentra en una condición válida para recibir inscripciones.

---

## 14.2 Validar periodo de inscripción

Comprobar:

```text
registration_open_at
registration_close_at
registrations_closed_manually
```

Si las inscripciones se encuentran cerradas, deberá detener la operación.

---

## 14.3 Localizar o crear persona

Buscar mediante:

```text
document_type
document_number
```

Si existe:

- reutilizar `person_id`;
- restaurar el registro si fue eliminado lógicamente y el proceso está autorizado para hacerlo;
- actualizar datos permitidos si corresponde.

Si no existe:

- crear `people`.

---

## 14.4 Validar duplicidad

Comprobar si la persona ya tiene una inscripción activa para la actividad.

Si existe:

- no crear otra;
- devolver error funcional de duplicidad.

---

## 14.5 Validar cupos

Si:

```text
capacity IS NULL
```

no existe límite de cupos.

Si existe una capacidad configurada:

- contar inscripciones que consumen cupo según la regla definida;
- verificar disponibilidad dentro de la misma operación transaccional.

La validación no deberá realizarse únicamente mediante:

```text
frontend consulta
↓
frontend calcula
↓
frontend inserta
```

porque existiría riesgo de concurrencia.

---

# 15. Regla recomendada de consumo de cupos

Dentro del MVP, el control deberá ser coherente con la finalidad de evitar sobreinscripciones.

La función deberá considerar las inscripciones activas que correspondan según el estado definido por negocio.

Esta regla deberá quedar centralizada en `register_activity()` y no duplicarse en diferentes componentes del frontend.

---

# 16. Determinar tipo de inscripción

El usuario deberá seleccionar:

```text
Público general
```

o:

```text
Asociado CCI
```

La aplicación deberá transformarlo respectivamente en:

```text
general
member
```

---

# 17. Regla de asociado CCI

Cuando:

```text
registration_type = member
```

deberán ser obligatorios:

- empresa;
- RUC.

El RUC deberá cumplir el formato definido:

```text
11 dígitos
```

La plataforma no verificará automáticamente durante el MVP si el RUC realmente pertenece al padrón de asociados de la Cámara.

La condición será revisada manualmente posteriormente.

---

# 18. Actividad exclusiva para asociados

Cuando:

```text
activities.members_only = true
```

el formulario deberá informar claramente que la actividad es exclusiva para asociados.

La plataforma continuará sin validación automática de padrón.

La inscripción declarada deberá permitir posteriormente la revisión administrativa correspondiente.

---

# 19. Determinar precio

La función deberá determinar el precio directamente desde la actividad y no aceptar ciegamente un precio enviado por el navegador.

## Público general

Utilizar:

```text
general_price
```

## Asociado

Utilizar:

```text
member_price
```

El resultado deberá almacenarse en:

```text
price_snapshot
```

---

# 20. Actividad gratuita

Cuando:

```text
is_free = true
```

la inscripción deberá crearse automáticamente con:

```text
status = confirmed
```

También deberá registrarse:

```text
confirmed_at
```

cuando corresponda.

El participante deberá recibir en la interfaz una respuesta equivalente a:

**“Tu inscripción ha sido confirmada”.**

---

# 21. Actividad con costo

Cuando:

```text
is_free = false
```

la inscripción deberá crearse con:

```text
status = pending
```

Esto representa una:

**preinscripción / inscripción no confirmada.**

La interfaz deberá informar claramente que la persona todavía no se encuentra confirmada.

Mensaje funcional equivalente:

**“Tu preinscripción ha sido registrada correctamente. Para confirmar tu participación, comunícate con la Cámara de Comercio de Ica”.**

---

# 22. Confirmación posterior

En este hito la inscripción con costo quedará preparada con estado:

```text
pending
```

La funcionalidad administrativa completa para cambiarla a:

```text
confirmed
```

será desarrollada operativamente en el Hito 4.

La estructura de datos ya deberá contener:

```text
confirmed_at
confirmed_by
```

---

# 23. Cancelación preparada

La tabla deberá quedar preparada para posteriores operaciones de cancelación mediante:

```text
cancelled_at
cancelled_by
cancellation_reason
```

La interfaz administrativa completa de cancelación se implementará como parte del manejo operativo posterior.

---

# 24. Notificación del proceso

El diseño físico establece que `register_activity()` deberá dejar registrado el evento correspondiente para la notificación transaccional.

Los eventos definidos inicialmente incluyen:

```text
activity_free_registration_confirmed
activity_paid_preregistration_created
```

La infraestructura y envío completo de correos se culminará en el hito de notificaciones y certificados.

En este hito deberá quedar, como mínimo, claramente definido el contrato/evento generado por la operación de inscripción para que el envío posterior no requiera modificar la lógica principal de registro.

---

# 25. Crear formulario público de inscripción

Crear rutas equivalentes a:

```text
/eventos/[slug]/inscripcion
```

y:

```text
/capacitaciones/[slug]/inscripcion
```

Ambas deberán compartir la mayor cantidad razonable de componentes y lógica.

No deberán construirse dos formularios completamente independientes.

---

# 26. Campos obligatorios del formulario

Solicitar:

- tipo de documento;
- número de documento;
- nombres;
- apellidos;
- correo electrónico;
- teléfono o celular;
- cargo.

El tipo de documento predeterminado deberá ser:

```text
DNI
```

También deberá permitirse:

```text
Carné de Extranjería
```

El cargo será un campo de texto libre.

---

# 27. Campos opcionales

Solicitar opcionalmente:

- dirección;
- empresa;
- RUC.

Sin embargo, cuando el usuario seleccione:

```text
Asociado CCI
```

los campos:

- empresa;
- RUC;

pasarán a ser obligatorios.

---

# 28. Formulario único y dinámico

No deberán existir:

```text
Formulario general
+
Formulario asociado
```

como dos procesos independientes.

Deberá existir un único formulario dinámico.

Ejemplo:

```text
Tipo de inscripción
○ Público general
○ Asociado CCI
```

Al seleccionar asociado:

```text
Empresa *
RUC *
```

deberán mostrarse o activarse como obligatorios.

---

# 29. Validación del formulario

Deberá existir validación inmediata para:

- documento;
- nombres;
- apellidos;
- correo;
- celular;
- cargo;
- RUC cuando corresponda;
- empresa cuando corresponda.

Las validaciones de experiencia de usuario podrán realizarse mediante schemas reutilizables.

Sin embargo, las reglas críticas deberán ser nuevamente comprobadas en PostgreSQL.

---

# 30. Evitar doble envío del formulario

La interfaz deberá prevenir:

- múltiples clics;
- envío mientras la operación está en curso;
- duplicación accidental.

Pero la base de datos continuará siendo la última capa de protección mediante:

- índice único;
- transacción;
- función PostgreSQL.

---

# 31. Estados de interfaz del formulario

El formulario deberá contemplar:

## Loading

Mientras procesa la inscripción.

## Success

Cuando se registra correctamente.

## Validation error

Cuando falta información.

## Business error

Por ejemplo:

- inscripción duplicada;
- inscripciones cerradas;
- sin cupos.

## Unexpected error

Cuando ocurre un problema técnico.

---

# 32. Errores funcionales

La aplicación deberá manejar al menos códigos o errores equivalentes a:

```text
DUPLICATE_REGISTRATION
REGISTRATION_CLOSED
NO_AVAILABLE_CAPACITY
ACTIVITY_NOT_FOUND
INVALID_MEMBER_DATA
VALIDATION_ERROR
DATABASE_ERROR
```

El usuario no deberá recibir errores SQL directamente.

---

# 33. Página de resultado

Crear:

```text
/eventos/[slug]/inscripcion/resultado
```

y:

```text
/capacitaciones/[slug]/inscripcion/resultado
```

La página deberá diferenciar claramente:

## Actividad gratuita

Mostrar:

- inscripción confirmada;
- código;
- actividad;
- datos básicos correspondientes.

## Actividad con costo

Mostrar:

- preinscripción registrada;
- código;
- indicación explícita de que todavía no está confirmada;
- instrucción para comunicarse con la Cámara.

---

# 34. Código visible al usuario

El resultado deberá mostrar claramente:

```text
Código de inscripción:
CCI-EV-000124
```

Este código será posteriormente utilizado también como referencia administrativa.

---

# 35. Información administrativa inicial

El panel administrativo deberá comenzar a mostrar las inscripciones asociadas a las actividades.

Como mínimo deberá ser posible consultar:

- código;
- documento;
- nombres;
- apellidos;
- correo;
- teléfono;
- cargo;
- empresa;
- RUC;
- tipo de inscripción;
- precio registrado;
- estado;
- fecha de registro.

---

# 36. Listado de preinscritos

Para actividades con costo deberá ser posible identificar claramente:

```text
pending
```

como:

**Preinscrito / No confirmado**

---

# 37. Listado de confirmados

Las actividades gratuitas deberán aparecer automáticamente como:

```text
confirmed
```

La estructura administrativa deberá permitir diferenciar:

- preinscritos;
- confirmados.

La operación manual completa sobre estos estados se ampliará en el Hito 4.

---

# 38. Integración con detalle de actividad

Las páginas:

```text
/eventos/[slug]
/capacitaciones/[slug]
```

deberán incorporar la acción de inscripción cuando corresponda.

Antes de mostrar el CTA deberá considerarse:

- estado de actividad;
- fecha de apertura;
- fecha de cierre;
- cierre manual;
- disponibilidad aparente.

La función PostgreSQL seguirá siendo la fuente final de validación.

---

# 39. Estados del CTA de inscripción

La interfaz deberá poder mostrar comportamientos como:

### Inscripciones disponibles

**Inscribirme**

### Inscripciones todavía no abiertas

**Inscripciones próximamente**

### Inscripciones cerradas

**Inscripciones cerradas**

### Actividad cancelada

No permitir nueva inscripción.

### Sin cupos

**Cupos agotados**

La información visual no reemplaza la validación transaccional al enviar el formulario.

---

# 40. Concurrencia

Se deberán contemplar especialmente dos escenarios.

## Último cupo

Dos personas intentan registrarse simultáneamente para el último espacio disponible.

Resultado esperado:

- solo las operaciones permitidas por la capacidad deberán completarse;
- no deberá superarse el límite debido a una comprobación realizada únicamente desde frontend.

## Registro duplicado

Dos solicitudes de la misma persona llegan prácticamente al mismo tiempo.

Resultado esperado:

- solamente una inscripción activa;
- la segunda deberá recibir respuesta de duplicidad.

---

# 41. Idempotencia

La inscripción deberá diseñarse para tolerar repeticiones accidentales.

Si una solicitud equivalente se repite, el sistema no deberá generar:

- dos personas;
- dos inscripciones;
- dos códigos activos;
- estados inconsistentes.

La combinación de:

- identidad de persona;
- restricción única;
- transacción;

deberá proteger esta condición.

---

# 42. Estructura por features

La funcionalidad deberá organizarse principalmente en:

```text
src/features/registrations/
```

y cuando corresponda:

```text
src/features/participants/
```

Ejemplo:

```text
registrations/
    components/
    hooks/
    mutations/
    queries/
    schemas/
    types/
    utils/
```

---

# 43. Mutation principal

Crear una operación TypeScript equivalente a:

```text
registerActivity()
```

Internamente deberá ejecutar:

```text
supabase.rpc("register_activity", ...)
```

El componente visual no deberá implementar directamente cada inserción sobre:

- `people`;
- `registrations`;
- `attendance`.

---

# 44. Queries iniciales

Crear operaciones equivalentes a:

```text
getActivityRegistrations()
getPendingRegistrations()
getConfirmedRegistrations()
getRegistrationByCode()
```

La implementación deberá seleccionar únicamente la información necesaria para cada pantalla.

---

# 45. Atomic Design aplicado al Hito 3

## Atoms

Reutilizar:

- Input;
- Button;
- Select;
- Label;
- Text;
- Badge;
- Spinner.

## Molecules

Crear cuando corresponda:

```text
FormField
DocumentField
RegistrationTypeSelector
ContactData
StatusBadge
```

## Organisms

Crear:

```text
RegistrationForm
RegistrationResult
RegistrationsTable
```

El formulario no deberá concentrar innecesariamente toda la lógica de consulta, validación y presentación en un único archivo.

---

# 46. Requerimientos técnicos

## RT-01 — Tabla `registrations`

Deberá existir la tabla según el modelo físico aprobado.

---

## RT-02 — Tabla `attendance`

Deberá existir una asistencia activa por inscripción.

---

## RT-03 — RPC transaccional

La operación de inscripción deberá utilizar una función PostgreSQL equivalente a:

`register_activity()`.

---

## RT-04 — Identidad de persona

La función deberá localizar o crear personas utilizando:

`document_type + document_number`.

---

## RT-05 — Duplicidad

La base de datos deberá impedir:

`activity_id + person_id`

duplicados activos.

---

## RT-06 — Código único

`registration_code` deberá tener unicidad convencional.

Los códigos históricos no deberán reutilizarse.

---

## RT-07 — Control de cupos

La disponibilidad deberá validarse dentro del proceso transaccional.

---

## RT-08 — Precio seguro

El navegador no deberá determinar definitivamente `price_snapshot`.

PostgreSQL deberá calcularlo a partir de:

- actividad;
- tipo de inscripción.

---

## RT-09 — Estado seguro

El navegador no deberá decidir definitivamente si una inscripción es `pending` o `confirmed`.

La función deberá determinarlo a partir de:

`activities.is_free`.

---

## RT-10 — Snapshots

La inscripción deberá conservar:

- empresa;
- RUC;
- precio;

cuando corresponda.

---

## RT-11 — Soft Delete

`registrations` y `attendance` deberán utilizar:

```text
deleted_at
deleted_by
```

---

## RT-12 — Timestamps

Deberán mantenerse automáticamente:

```text
created_at
updated_at
```

y utilizarse `set_updated_at()`.

---

## RT-13 — Índices

Crear al menos índices relevantes para:

```text
registrations(activity_id, status)
registrations(person_id)
registrations(registration_code)
attendance(registration_id)
```

---

## RT-14 — Validación compartida

Los schemas del formulario deberán centralizarse y reutilizarse.

---

## RT-15 — Supabase

La operación deberá realizarse mediante `supabase-js` utilizando RPC.

No se deberá crear un Route Handler únicamente como intermediario CRUD.

---

## RT-16 — TypeScript

La entrada y respuesta de la función deberán estar tipadas.

---

## RT-17 — Errores funcionales

Los errores PostgreSQL deberán convertirse en resultados comprensibles para la aplicación.

---

## RT-18 — Seguridad de reglas

No deberán confiarse al navegador:

- cupos;
- precio;
- duplicidad;
- estado inicial;
- identificación definitiva.

---

## RT-19 — Concurrencia

La implementación deberá ser segura frente a solicitudes simultáneas.

---

## RT-20 — RLS

Las tablas `registrations` y `attendance` deberán tener RLS habilitado desde su migración.

La inscripción pública deberá exponerse mediante `register_activity()` con permisos mínimos de ejecución y sin conceder acceso anónimo directo a los datos personales. Las consultas y mutaciones administrativas requerirán una cuenta interna activa con rol autorizado.

El Hito 11 auditará y endurecerá la matriz global, pero la información personal nunca deberá permanecer abierta mientras tanto.

---

# 47. Requerimientos funcionales

## RF-01 — Inscripción sin cuenta

El visitante deberá poder inscribirse sin:

- registrarse;
- iniciar sesión;
- crear contraseña.

---

## RF-02 — Documento predeterminado

El tipo de documento predeterminado será:

**DNI**

---

## RF-03 — Carné de Extranjería

El formulario deberá permitir seleccionar:

**CE**

---

## RF-04 — Campos obligatorios

Solicitar:

- documento;
- nombres;
- apellidos;
- correo;
- celular;
- cargo.

---

## RF-05 — Campos opcionales

Permitir:

- dirección;
- empresa;
- RUC.

---

## RF-06 — Formulario único

Deberá existir un único formulario dinámico para público general y asociado.

---

## RF-07 — Tipo general

El visitante podrá seleccionar:

**Público general**

---

## RF-08 — Tipo asociado

El visitante podrá seleccionar:

**Asociado CCI**

---

## RF-09 — Empresa de asociado

Si selecciona asociado:

**empresa será obligatoria.**

---

## RF-10 — RUC de asociado

Si selecciona asociado:

**RUC será obligatorio.**

---

## RF-11 — Sin validación automática de asociado

El sistema no deberá consultar automáticamente un padrón de asociados durante el MVP.

---

## RF-12 — Persona única

Una persona que ya exista deberá reutilizar su ficha institucional.

---

## RF-13 — Prevención de duplicados

Una persona no podrá inscribirse dos veces en la misma actividad.

---

## RF-14 — Mensaje de duplicado

El sistema deberá informar de forma clara que ya existe una inscripción.

---

## RF-15 — Cupos ilimitados

Una actividad con:

```text
capacity = NULL
```

deberá admitir inscripciones sin límite configurado.

---

## RF-16 — Cupos limitados

Una actividad con límite deberá impedir inscripciones cuando no exista disponibilidad.

---

## RF-17 — Periodo de inscripción

No deberán aceptarse inscripciones fuera del periodo establecido.

---

## RF-18 — Cierre manual

No deberán aceptarse nuevas inscripciones cuando:

```text
registrations_closed_manually = true
```

---

## RF-19 — Actividad gratuita

Una actividad gratuita deberá confirmar automáticamente al participante.

---

## RF-20 — Actividad con costo

Una actividad con costo deberá crear inicialmente una preinscripción.

---

## RF-21 — Estado gratuito

La inscripción gratuita deberá quedar:

```text
confirmed
```

---

## RF-22 — Estado con costo

La inscripción con costo deberá quedar:

```text
pending
```

---

## RF-23 — Código

Toda inscripción correctamente creada deberá recibir código único.

---

## RF-24 — Precio general

Un participante general deberá conservar el precio general correspondiente al momento de la inscripción.

---

## RF-25 — Precio asociado

Un asociado deberá conservar el precio asociado correspondiente al momento de la inscripción.

---

## RF-26 — Resultado gratuito

El usuario deberá saber claramente que su inscripción está confirmada.

---

## RF-27 — Resultado con costo

El usuario deberá saber claramente que únicamente se ha registrado una preinscripción.

---

## RF-28 — Contacto con CCI

En actividades con costo deberá indicarse que la confirmación requiere coordinación externa con la Cámara.

---

## RF-29 — Administración

Las nuevas inscripciones deberán ser visibles desde administración.

---

## RF-30 — Preinscritos y confirmados

El personal deberá poder diferenciar visualmente ambos grupos.

---

# 48. Fuera del alcance del Hito 3

No forma parte de este hito:

- pasarela de pago;
- pagos electrónicos;
- validación automática de asociados;
- facturación;
- lista de espera;
- login de participantes;
- creación de cuentas del Campus;
- control completo de asistencia;
- asistencia por sesión;
- QR;
- certificados;
- plantillas de certificados;
- generación de PDF;
- habilitación administrativa de certificados;
- notificaciones masivas;
- WhatsApp;
- automatización completa de correo.

---

# 49. Definition of Done

El Hito 3 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Base de datos

- [ ] Existe `registration_type`.
- [ ] Existe `registration_status`.
- [ ] Existe `attendance_status`.
- [ ] Existe la tabla `registrations`.
- [ ] Existe la tabla `attendance`.
- [ ] Las claves foráneas están configuradas.
- [ ] Existe unicidad activa por `activity_id + person_id`.
- [ ] `registration_code` es único.
- [ ] Existe una sola asistencia activa por inscripción.
- [ ] Existen `company_snapshot`, `ruc_snapshot` y `price_snapshot`.
- [ ] Se implementó soft delete.
- [ ] Funcionan los triggers de `updated_at`.
- [ ] Existen los índices requeridos.
- [ ] Todo fue creado mediante migraciones.

## Función `register_activity()`

- [ ] Existe la función PostgreSQL.
- [ ] Recibe los datos necesarios del formulario.
- [ ] Valida que la actividad exista.
- [ ] Valida su condición de inscripción.
- [ ] Valida fecha de apertura.
- [ ] Valida fecha de cierre.
- [ ] Valida cierre manual.
- [ ] Busca persona por documento.
- [ ] Reutiliza una persona existente.
- [ ] Crea una persona cuando no existe.
- [ ] Evita inscripción duplicada.
- [ ] Valida cupos.
- [ ] Determina público general/asociado.
- [ ] Valida empresa y RUC para asociado.
- [ ] Calcula el precio correspondiente.
- [ ] Genera código único.
- [ ] Crea la inscripción.
- [ ] Establece `confirmed` para actividad gratuita.
- [ ] Establece `pending` para actividad con costo.
- [ ] Crea asistencia `pending`.
- [ ] Devuelve un resultado tipado.
- [ ] La operación es consistente ante errores.

## Formulario público

- [ ] Existe formulario de inscripción de eventos.
- [ ] Existe formulario de inscripción de capacitaciones.
- [ ] Ambos comparten lógica reutilizable.
- [ ] DNI aparece por defecto.
- [ ] Se puede seleccionar CE.
- [ ] Documento es obligatorio.
- [ ] Nombres son obligatorios.
- [ ] Apellidos son obligatorios.
- [ ] Correo es obligatorio.
- [ ] Celular es obligatorio.
- [ ] Cargo es obligatorio.
- [ ] Dirección es opcional.
- [ ] Empresa es opcional para público general.
- [ ] RUC es opcional para público general.
- [ ] Empresa es obligatoria para asociado.
- [ ] RUC es obligatorio para asociado.
- [ ] El formulario es dinámico.
- [ ] El botón evita envíos repetidos mientras procesa.
- [ ] Los errores se muestran claramente.

## Reglas de negocio

- [ ] Una persona existente no se duplica por volver a inscribirse.
- [ ] Una persona no puede inscribirse dos veces a la misma actividad.
- [ ] Una actividad cerrada rechaza nuevas inscripciones.
- [ ] Una actividad sin cupos rechaza nuevas inscripciones.
- [ ] Una actividad cancelada no admite nueva inscripción.
- [ ] Una actividad gratuita confirma automáticamente.
- [ ] Una actividad con costo queda pendiente.
- [ ] El precio no es confiado al navegador.
- [ ] El estado inicial no es confiado al navegador.
- [ ] Los snapshots se almacenan correctamente.

## Página de resultado

- [ ] Existe resultado para evento.
- [ ] Existe resultado para capacitación.
- [ ] Se muestra código de inscripción.
- [ ] Una inscripción gratuita indica claramente “confirmada”.
- [ ] Una actividad con costo indica claramente “preinscripción”.
- [ ] Una preinscripción muestra indicación de contacto con la CCI.
- [ ] No se comunica una preinscripción como si ya estuviera confirmada.

## Administración

- [ ] Las inscripciones aparecen asociadas a la actividad correspondiente.
- [ ] Se puede consultar el código.
- [ ] Se puede consultar documento.
- [ ] Se pueden consultar nombres y apellidos.
- [ ] Se puede consultar correo.
- [ ] Se puede consultar celular.
- [ ] Se puede consultar cargo.
- [ ] Se puede consultar empresa.
- [ ] Se puede consultar RUC.
- [ ] Se puede consultar tipo de inscripción.
- [ ] Se puede consultar `price_snapshot`.
- [ ] Se puede consultar estado.
- [ ] Se puede diferenciar `pending` y `confirmed`.

## Errores

- [ ] Se maneja inscripción duplicada.
- [ ] Se maneja actividad cerrada.
- [ ] Se maneja actividad sin cupos.
- [ ] Se maneja actividad inexistente.
- [ ] Se manejan datos inválidos de asociado.
- [ ] No se muestran errores SQL directamente.
- [ ] Existen estados loading, success y error.

## Arquitectura

- [ ] La inscripción utiliza RPC.
- [ ] No existe una secuencia insegura de inserts desde componentes React.
- [ ] La mutation está separada de la interfaz.
- [ ] Los schemas están centralizados.
- [ ] Los tipos están actualizados.
- [ ] Los componentes respetan Atomic Design.
- [ ] No se creó una API CRUD innecesaria.

## Concurrencia

- [ ] Se probó doble clic de inscripción.
- [ ] Se probó inscripción duplicada simultánea.
- [ ] Se probó el último cupo con solicitudes concurrentes.
- [ ] No se crean registros duplicados.
- [ ] No se supera la capacidad configurada.

---

# 50. Pruebas funcionales obligatorias

## Caso 1 — Evento gratuito

```text
1. Abrir evento publicado.
2. Seleccionar Inscribirme.
3. Completar formulario como público general.
4. Enviar.
5. Crear/reutilizar persona.
6. Crear inscripción.
7. Generar código.
8. Estado = confirmed.
9. Crear attendance = pending.
10. Mostrar confirmación.
11. Visualizar registro en administración.
```

---

## Caso 2 — Capacitación con costo

```text
1. Abrir capacitación publicada.
2. Completar formulario.
3. Enviar.
4. Crear/reutilizar persona.
5. Crear inscripción.
6. Estado = pending.
7. Generar código.
8. Mostrar mensaje de preinscripción.
9. Indicar coordinación con CCI.
10. Mostrar como no confirmado en administración.
```

---

## Caso 3 — Asociado

```text
1. Seleccionar Asociado CCI.
2. Hacer obligatorios Empresa y RUC.
3. Completar RUC válido.
4. Registrar inscripción.
5. Guardar registration_type = member.
6. Guardar company_snapshot.
7. Guardar ruc_snapshot.
8. Guardar member_price como price_snapshot.
```

---

## Caso 4 — Inscripción duplicada

```text
1. Inscribir a una persona.
2. Volver a la misma actividad.
3. Utilizar el mismo documento.
4. Intentar registrarse nuevamente.
5. No crear otra inscripción.
6. Mostrar mensaje de duplicidad.
```

---

## Caso 5 — Sin cupos

```text
1. Crear actividad con capacidad limitada.
2. Completar todos los cupos.
3. Intentar una nueva inscripción.
4. Rechazar operación.
5. No crear registration.
6. Informar que no existen cupos disponibles.
```

---

## Caso 6 — Inscripción cerrada

```text
1. Configurar fecha de cierre vencida.
2. Intentar inscripción.
3. Rechazar operación.
4. No crear persona innecesariamente cuando la operación no debe proceder.
5. No crear inscripción.
6. Mostrar mensaje comprensible.
```

---

## Caso 7 — Concurrencia por último cupo

```text
1. Dejar únicamente un cupo disponible.
2. Ejecutar dos inscripciones prácticamente simultáneas.
3. PostgreSQL controla la operación.
4. No superar capacidad.
5. Una operación obtiene el cupo.
6. La otra recibe resultado de falta de disponibilidad.
```

---

# 51. Validación final del hito

Antes de aprobar el Hito 3, el equipo deberá demostrar sin modificar datos manualmente desde Supabase:

```text
1. Crear/publicar actividad desde el sistema.
2. Abrirla como visitante.
3. Inscribirse sin login.
4. Generar/reutilizar una persona.
5. Crear inscripción.
6. Generar código.
7. Crear asistencia pendiente.
8. Mostrar resultado correcto.
9. Consultar la inscripción desde administración.
10. Repetir el proceso con una actividad con costo.
11. Confirmar que aparece como preinscrita.
12. Probar asociado.
13. Probar duplicado.
14. Probar cupos.
15. Probar periodo cerrado.
16. Probar concurrencia del último cupo.
```

---

# 52. Resultado final esperado del Hito 3

Al finalizar este hito, la plataforma deberá haber evolucionado desde un catálogo informativo hacia una plataforma capaz de recibir participantes reales.

El recorrido deberá ser:

```text
PORTAL PÚBLICO
      │
      ▼
Actividad publicada
      │
      ▼
Inscribirse
      │
      ▼
Formulario sin cuenta
      │
      ▼
register_activity()
      │
      ├── Validar actividad
      ├── Validar periodo
      ├── Buscar/crear persona
      ├── Evitar duplicidad
      ├── Validar cupos
      ├── Determinar precio
      ├── Generar código
      ├── Crear registration
      └── Crear attendance pending
      │
      ▼
Resultado
      │
      ├── Gratuita → CONFIRMED
      │
      └── Con costo → PENDING
      │
      ▼
ADMINISTRACIÓN
      │
      ├── Preinscritos
      └── Confirmados
```

El participante continuará sin necesitar cuenta.

El Hito 3 quedará completado cuando una inscripción real pueda recorrer de forma segura todo el proceso desde el formulario público hasta PostgreSQL y posteriormente aparecer correctamente en administración, incluyendo las reglas de duplicidad, cupos, precios y estados.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 4 — Gestión de participantes, confirmaciones y asistencia.**
