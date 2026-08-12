# HITO 6 — REGISTRO, LOGIN Y AUTENTICACIÓN

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 6 tiene como finalidad implementar el sistema de **identidad autenticada y acceso mediante cuentas de usuario** de la plataforma.

Hasta el Hito 5, los participantes de eventos y capacitaciones pueden utilizar la plataforma sin crear una cuenta. Esa decisión debe mantenerse.

El acceso administrativo mínimo existe desde el Hito 2. En este punto se incorporan el registro y login de estudiantes porque el siguiente gran módulo será el **Campus Virtual**, donde sí es necesario mantener una relación permanente entre la persona y la plataforma para conservar:

- cursos habilitados;
- progreso;
- evaluaciones;
- certificados;
- historial académico.

Este hito implementará:

- registro de usuario;
- login;
- logout;
- recuperación de contraseña;
- restablecimiento de contraseña;
- persistencia de sesión;
- relación entre Supabase Auth y `people`;
- creación y gestión de `user_accounts`;
- identificación de roles;
- protección del Campus;
- revisión y endurecimiento de la protección administrativa existente;
- perfil básico del usuario autenticado.

Una de las reglas más importantes del proyecto deberá respetarse estrictamente:

**PERSONA ≠ CUENTA DE USUARIO**

Una persona puede haber participado previamente en eventos y capacitaciones sin tener cuenta. Cuando posteriormente cree una cuenta para ingresar al Campus, deberá vincularse con la misma persona institucional y conservar todo su historial anterior.

No deberá crearse una segunda persona. 
---

# 2. Objetivo del hito

Implementar una autenticación segura basada en Supabase Auth que permita identificar a los usuarios que requieren acceso permanente a la plataforma y vincularlos correctamente con la entidad institucional `people`.

Al finalizar el hito deberá funcionar el recorrido:

**Persona → Registro → Vinculación con ficha institucional → Cuenta → Login → Sesión → Campus**

Además deberá reutilizarse la infraestructura existente para autenticar a usuarios internos con roles:

- `student`;
- `operator`;
- `administrator`.

Con este hito comenzará formalmente la segunda gran área funcional del MVP: el Campus Virtual.

---

# 3. Alcance del hito

El Hito 6 comprende:

- Supabase Auth;
- registro mediante correo y contraseña;
- inicio de sesión;
- cierre de sesión;
- recuperación de contraseña;
- restablecimiento de contraseña;
- persistencia de sesión;
- vinculación `auth.users → user_accounts → people`;
- búsqueda de persona existente mediante documento;
- creación de persona cuando corresponda;
- roles iniciales;
- perfil básico;
- protección del Campus;
- revisión de la protección de administración;
- redirecciones por estado de autenticación;
- manejo de errores de autenticación.

No comprende todavía:

- cursos;
- módulos;
- clases;
- videos;
- matrícula de cursos;
- progreso;
- quizzes;
- certificados de cursos;
- permisos avanzados;
- auditoría global de RLS del Hito 11.

---

# 4. Modelo de identidad

El modelo central deberá mantenerse como:

```text id="p6ah4p"
auth.users
     │
     │ 1 : 1
     ▼
user_accounts
     │
     ▼
people
```

Cada entidad tiene una responsabilidad diferente.

## `auth.users`

Responsable de:

- autenticación;
- correo de acceso;
- contraseña;
- sesión;
- recuperación de contraseña.

## `user_accounts`

Responsable de:

- vincular Auth con la aplicación;
- relacionar usuario con persona;
- almacenar rol;
- permitir habilitar/deshabilitar acceso.

## `people`

Responsable de:

- identidad institucional;
- información personal;
- historial de eventos;
- historial de capacitaciones;
- posteriormente cursos y certificados.

No deberá duplicarse innecesariamente la información de negocio dentro de `auth.users`.

---

# 5. Tareas del hito

## 5.1 Configurar Supabase Auth

Configurar Supabase Auth para soportar como mínimo:

- registro con correo electrónico;
- contraseña;
- inicio de sesión;
- cierre de sesión;
- recuperación de contraseña;
- restablecimiento de contraseña;
- mantenimiento de sesión.

La configuración deberá integrarse con Next.js App Router.

---

# 6. Configurar soporte SSR de autenticación

El proyecto deberá utilizar la configuración correspondiente de Supabase para trabajar correctamente con sesiones desde Next.js.

Deberá mantenerse la separación existente entre:

```text id="6pv0wa"
src/lib/supabase/
    client.ts
    server.ts
```

El cliente de navegador se utilizará cuando corresponda para interacción del usuario.

El cliente de servidor podrá utilizarse para:

- comprobar sesión;
- renderizado del servidor;
- protección de páginas;
- lectura inicial del usuario.

La arquitectura técnica contempla el soporte de Supabase Auth con Next.js mediante mecanismos compatibles con SSR.

---

# 7. Crear página de registro

Crear:

`/registro`

El formulario de creación de cuenta deberá solicitar como mínimo:

- tipo de documento;
- número de documento;
- nombres;
- apellidos;
- correo;
- celular;
- cargo;
- contraseña;
- confirmación de contraseña.

También podrán solicitarse como datos opcionales:

- empresa;
- RUC;
- dirección.

El correo será el dato principal utilizado para autenticación.

---

# 8. Tipo de documento

El formulario deberá permitir:

```text id="vud8ug"
DNI
CE
```

El valor predeterminado será:

**DNI**

La identidad institucional deberá continuar basada principalmente en:

`document_type + document_number`

---

# 9. Validaciones del registro

El formulario deberá validar como mínimo:

- documento obligatorio;
- nombres obligatorios;
- apellidos obligatorios;
- correo válido;
- celular obligatorio;
- cargo obligatorio;
- contraseña válida;
- confirmación de contraseña;
- coincidencia de contraseñas.

Las validaciones de formato deberán existir tanto en la experiencia del frontend como en la lógica confiable correspondiente.

---

# 10. Buscar persona existente

Antes de crear una nueva persona, el sistema deberá comprobar si existe una persona activa con:

```text id="hjdawg"
document_type
+
document_number
```

El flujo conceptual será:

```text id="x889rx"
Usuario crea cuenta
      ↓
Recibir documento
      ↓
Buscar people
      ↓
¿Existe?
 ┌────┴────┐
 Sí        No
 │          │
 ▼          ▼
Reutilizar Crear persona
person_id   nueva
 └────┬─────┘
      ▼
Crear vínculo
user_accounts
```

Esta comprobación es obligatoria para preservar el historial institucional.

---

# 11. Persona existente

Si la persona ya existe debido a participaciones anteriores:

- no crear otro registro en `people`;
- reutilizar su `person_id`;
- vincular la nueva cuenta;
- actualizar únicamente datos permitidos cuando corresponda.

Ejemplo:

```text id="4wk3u9"
ANTES

people.id = PERSON-A

Congreso Empresarial
Capacitación Tributaria
```

Después del registro:

```text id="8b2r95"
people.id = PERSON-A
│
├── Congreso Empresarial
├── Capacitación Tributaria
└── user_accounts
       ↓
   auth.users
```

No deberá aparecer:

```text id="7shyq5"
PERSON-A
PERSON-B
```

para la misma identidad documental.

---

# 12. Persona nueva

Si no existe una persona con el documento:

1. crear usuario de autenticación;
2. crear `people`;
3. crear `user_accounts`;
4. vincular ambas identidades.

La operación deberá manejar correctamente errores parciales para evitar cuentas o personas huérfanas.

---

# 13. Consistencia del proceso de registro

El proceso de registro involucra varias entidades:

```text id="nqyyni"
auth.users
people
user_accounts
```

La implementación deberá evitar estados inconsistentes como:

```text id="zrqyrp"
auth.users creado
pero
user_accounts inexistente
```

o:

```text id="447sy3"
people duplicado
```

El equipo deberá definir una operación suficientemente controlada para completar o manejar correctamente todo el proceso.

---

# 14. Crear `user_accounts`

La tabla ya fue preparada desde el Hito 1.

Deberá utilizarse formalmente en este hito.

Campos principales:

```text id="9cx7yg"
user_id
person_id
role
is_active
created_at
updated_at
deleted_at
deleted_by
```

`user_id`:

```text id="7frq5q"
PK
FK → auth.users.id
```

`person_id`:

```text id="s044a2"
FK → people.id
```

---

# 15. Una cuenta activa por persona

Deberá mantenerse la restricción:

```text id="gy0l3u"
una persona
→
máximo una user_account activa
```

utilizando el índice parcial definido en el diseño físico.

El sistema no deberá permitir que una misma persona institucional cree múltiples cuentas activas mediante el flujo normal.

---

# 16. Roles del sistema

Mantener inicialmente:

```text id="qwc82t"
student
operator
administrator
```

## `student`

Usuario del Campus.

## `operator`

Usuario interno orientado a operaciones administrativas.

## `administrator`

Usuario interno con permisos administrativos amplios.

No deberá implementarse todavía un sistema granular de permisos por cada acción.

---

# 17. Rol por defecto

Cuando un usuario se registre públicamente para utilizar el Campus, deberá crearse como:

`student`

No deberá permitirse que un usuario público seleccione:

```text id="5kx7l1"
operator
administrator
```

desde el formulario de registro.

Los roles internos deberán asignarse mediante mecanismos administrativos/seguros.

---

# 18. Usuarios administrativos

Los usuarios administrativos también deberán disponer de una cuenta autenticada.

El sistema deberá poder representar:

```text id="hgmas3"
user_accounts.role = administrator
```

o:

```text id="y9b84q"
user_accounts.role = operator
```

La forma concreta de aprovisionar la cuenta administrativa inicial deberá realizarse mediante un procedimiento seguro.

No deberá existir un registro público que permita convertirse en administrador.

---

# 19. Estado activo de cuenta

`user_accounts.is_active`

deberá permitir bloquear funcionalmente una cuenta sin eliminarla.

Cuando:

```text id="xljlcl"
is_active = false
```

el usuario no deberá acceder normalmente a las áreas protegidas de la aplicación.

La desactivación no deberá borrar:

- persona;
- historial;
- participaciones;
- certificados.

---

# 20. Crear página de login

Crear:

`/login`

Solicitar:

- correo;
- contraseña.

La autenticación deberá utilizar Supabase Auth.

---

# 21. Comportamiento de login

Cuando las credenciales sean correctas:

1. autenticar usuario;
2. recuperar sesión;
3. localizar `user_accounts`;
4. comprobar `is_active`;
5. recuperar rol;
6. redirigir al área correspondiente.

---

# 22. Redirección de estudiante

Un usuario con:

`role = student`

deberá poder ingresar al:

`/campus`

Mientras todavía no exista funcionalidad completa de cursos, podrá visualizarse una página inicial básica del Campus.

---

# 23. Redirección administrativa

Un usuario con:

```text id="2kbmfp"
operator
administrator
```

deberá poder acceder al área administrativa correspondiente.

La autorización detallada entre operador y administrador se ampliará posteriormente cuando se implemente la configuración definitiva de permisos/RLS.

---

# 24. Usuario no autenticado

Cuando un usuario anónimo intente entrar a:

`/campus`

deberá ser redirigido al login o recibir el comportamiento de autenticación definido.

Lo mismo deberá aplicarse a:

`/admin`

---

# 25. Usuario autenticado sin permiso administrativo

Un estudiante autenticado que intente ingresar a:

`/admin`

no deberá poder utilizar la administración.

El sistema deberá comprobar el rol de la cuenta.

---

# 26. Protección del Campus

Deberá protegerse:

```text id="6m99pr"
/campus
/campus/*
```

El control no deberá depender únicamente de ocultar enlaces desde la interfaz.

---

# 27. Protección administrativa

Deberá protegerse:

```text id="4pfocn"
/admin
/admin/*
```

La comprobación deberá contemplar:

- sesión válida;
- `user_accounts`;
- `is_active`;
- rol.

---

# 28. Cierre de sesión

Implementar logout.

Cuando el usuario cierre sesión:

- invalidar/cerrar sesión mediante Supabase Auth;
- eliminar el estado local correspondiente;
- redirigir al área pública o login;
- evitar que las páginas protegidas continúen funcionando con una sesión ya cerrada.

---

# 29. Persistencia de sesión

Cuando el usuario cierre y vuelva a abrir la aplicación mientras su sesión sea válida:

- deberá mantenerse autenticado;
- no deberá introducir credenciales en cada navegación.

La sesión deberá ser manejada mediante las capacidades de Supabase Auth.

---

# 30. Recuperación de contraseña

Crear:

`/recuperar-contrasena`

El usuario deberá poder introducir su correo y solicitar el flujo correspondiente de recuperación.

---

# 31. Restablecimiento de contraseña

Deberá existir un flujo para:

`/restablecer-contrasena`

o equivalente según la estrategia técnica implementada.

El usuario deberá poder:

- acceder mediante el enlace válido;
- definir una nueva contraseña;
- confirmar la nueva contraseña;
- continuar utilizando su misma cuenta.

---

# 32. Recuperación no modifica persona

El proceso de recuperación de contraseña solamente afecta la autenticación.

No deberá crear:

- nueva persona;
- nueva `user_account`;
- nueva identidad.

---

# 33. Perfil del usuario

Crear:

`/campus/perfil`

En esta primera etapa deberá permitir como mínimo consultar:

- nombres;
- apellidos;
- documento;
- correo;
- celular;
- cargo;
- empresa;
- RUC;
- dirección;

según la información disponible.

---

# 34. Edición básica de perfil

El usuario podrá modificar los datos personales que se definan como editables.

La modificación deberá actualizar:

`people`

No deberá modificar:

- `person_id`;
- documento de forma arbitraria si ello rompe la identidad institucional;
- rol;
- identificador de Auth.

El alcance exacto de cambio del documento deberá ser restrictivo, dado que constituye el principal mecanismo de vinculación histórica.

---

# 35. Correo de autenticación y correo institucional

El diseño mantiene correo dentro de `people` y Supabase Auth utiliza correo como credencial.

La implementación deberá evitar inconsistencias indebidas entre ambos valores.

Si en el futuro se permite cambiar el correo de acceso, deberá existir un proceso controlado.

Para este hito deberá establecerse un comportamiento coherente para que el correo de autenticación y el correo de contacto de la persona correspondan durante el registro inicial.

---

# 36. Estado autenticado en interfaz

La interfaz deberá poder conocer y representar:

- usuario no autenticado;
- usuario autenticado;
- rol;
- nombre de la persona;
- acción de cerrar sesión.

Por ejemplo, el Header podrá cambiar de:

```text id="n5gg75"
Iniciar sesión
```

a:

```text id="t7vjkd"
Mi Campus
Cerrar sesión
```

cuando corresponda.

---

# 37. Mantener inscripción pública independiente

La implementación de autenticación **no deberá modificar el flujo existente de eventos y capacitaciones**.

Un visitante todavía deberá poder:

```text id="mjuhz0"
Abrir evento
↓
Inscribirse
```

sin ser redirigido obligatoriamente a:

```text id="5t10fr"
/login
```

Esta regla es central en el análisis funcional.

---

# 38. Catálogo de cursos preparado

Aunque el desarrollo completo de cursos pertenece al Hito 7, la autenticación deberá quedar preparada para el siguiente flujo:

```text id="ryobyu"
Curso público
      ↓
¿Tiene cuenta?
 ├── No → Registro
 └── Sí → Login
      ↓
Campus
```

---

# 39. No duplicar Auth en tablas de negocio

No deberán almacenarse contraseñas en:

- `people`;
- `user_accounts`;
- cualquier tabla propia del proyecto.

Las credenciales serán responsabilidad de Supabase Auth.

---

# 40. Contraseñas

La aplicación no deberá:

- guardar contraseñas en texto;
- registrar contraseñas en logs;
- incluir contraseñas en `audit_logs`;
- incluirlas en payloads de notificaciones.

Supabase Auth será responsable de su almacenamiento y gestión.

---

# 41. Manejo de errores de autenticación

La aplicación deberá convertir errores técnicos en mensajes comprensibles.

Ejemplos:

```text id="pedahc"
AUTH_INVALID_CREDENTIALS
AUTH_EMAIL_ALREADY_EXISTS
ACCOUNT_INACTIVE
ACCOUNT_NOT_LINKED
VALIDATION_ERROR
PASSWORD_MISMATCH
```

No deberán mostrarse errores internos sin procesar.

---

# 42. Registro con correo ya utilizado

Si el correo ya corresponde a una cuenta existente:

- no deberá crearse otra cuenta;
- deberá mostrarse un mensaje apropiado;
- podrá orientarse al usuario hacia login o recuperación de contraseña.

---

# 43. Documento con cuenta existente

Si existe:

```text id="ar6alw"
people
+
user_accounts activa
```

para el mismo documento, el sistema no deberá crear una segunda cuenta mediante el registro normal.

Deberá indicar que la persona ya dispone de cuenta.

---

# 44. Documento existente sin cuenta

Este es el escenario esperado para una persona que anteriormente participó en eventos.

Ejemplo:

```text id="pu550m"
people existe
user_accounts no existe
```

El registro deberá:

- reutilizar `people`;
- crear Auth;
- crear `user_accounts`.

Este caso deberá probarse especialmente.

---

# 45. Correo existente en `people` sin Auth

Una persona puede existir previamente por una inscripción.

El documento continuará siendo el principal mecanismo institucional de vinculación definido para el proyecto.

El proceso deberá evitar crear una nueva persona simplemente porque el correo ingresado difiera de una participación antigua.

Las diferencias válidas de datos deberán resolverse mediante actualización controlada de la ficha existente.

---

# 46. Atomic Design aplicado al Hito 6

## Atoms

Reutilizar:

- Input;
- Button;
- Label;
- Text;
- Checkbox;
- Spinner;
- Alert/Badge cuando corresponda.

## Molecules

Crear componentes equivalentes a:

```text id="e7vhyt"
FormField
PasswordField
DocumentField
AuthError
UserMenu
```

## Organisms

Crear:

```text id="71jzk9"
LoginForm
RegisterForm
ForgotPasswordForm
ResetPasswordForm
ProfileForm
```

## Templates

Podrán existir:

```text id="bypmg0"
AuthTemplate
LoginTemplate
RegisterTemplate
ProfileTemplate
```

Los componentes visuales no deberán contener directamente toda la lógica de Supabase Auth.

---

# 47. Organización por feature

Mantener:

```text id="loavb0"
src/features/authentication/
src/features/users/
src/features/participants/
```

Ejemplo:

```text id="b7a9ao"
authentication/
    components/
    hooks/
    mutations/
    queries/
    schemas/
    types/
    utils/
```

---

# 48. Mutations de autenticación

Crear operaciones equivalentes a:

```text id="nh2tdm"
signUp()
signIn()
signOut()
requestPasswordReset()
updatePassword()
```

Los nombres exactos podrán variar.

---

# 49. Queries de usuario actual

Crear operaciones equivalentes a:

```text id="zyraav"
getCurrentUser()
getCurrentAccount()
getCurrentPerson()
```

La aplicación deberá poder recuperar conjuntamente:

- identidad Auth;
- rol;
- ficha `people`.

---

# 50. Registro de cuenta

El proceso de registro deberá encapsularse en una operación clara.

Conceptualmente:

```text id="x38w3k"
registerAccount()
```

que permita coordinar:

```text id="rhycng"
Supabase Auth
+
people
+
user_accounts
```

La lógica no deberá repetirse directamente dentro de `RegisterForm`.

---

# 51. Protección de rutas

La estrategia exacta podrá utilizar los mecanismos compatibles con Next.js y Supabase definidos en la arquitectura del proyecto.

La protección deberá realizarse en una capa suficientemente confiable y no únicamente mediante JavaScript visual en el navegador.

---

# 52. Requerimientos técnicos

## RT-01 — Supabase Auth

La autenticación deberá utilizar Supabase Auth.

---

## RT-02 — Email/password

El mecanismo inicial de acceso será correo + contraseña.

---

## RT-03 — No almacenar contraseña

Las contraseñas no deberán guardarse en tablas de aplicación.

---

## RT-04 — Modelo de identidad

La relación deberá mantenerse como:

```text id="iiryd6"
auth.users
→ user_accounts
→ people
```

---

## RT-05 — Persona reutilizable

El registro deberá comprobar `people` antes de crear una nueva persona.

---

## RT-06 — Identidad documental

La búsqueda deberá utilizar:

```text id="97ta01"
document_type
+
document_number
```

---

## RT-07 — Una cuenta activa

Una persona no deberá tener múltiples `user_accounts` activas.

---

## RT-08 — Rol

El rol deberá almacenarse en:

`user_accounts.role`.

---

## RT-09 — Rol público por defecto

El registro público deberá crear únicamente:

`student`.

---

## RT-10 — Roles administrativos

`operator` y `administrator` no deberán poder seleccionarse desde registro público.

---

## RT-11 — Cuenta activa

El acceso deberá comprobar:

`user_accounts.is_active`.

---

## RT-12 — Sesión

Las sesiones deberán gestionarse mediante Supabase Auth.

---

## RT-13 — SSR

La configuración deberá ser compatible con la arquitectura App Router/SSR del proyecto.

---

## RT-14 — Campus protegido

Las rutas `/campus/*` deberán requerir autenticación.

---

## RT-15 — Administración protegida

Las rutas `/admin/*` deberán requerir autenticación y rol interno.

---

## RT-16 — Autorización

Un estudiante no deberá poder acceder a administración únicamente por conocer la URL.

---

## RT-17 — Separación de responsabilidades

Los formularios no deberán implementar directamente toda la lógica de autenticación y vinculación.

---

## RT-18 — TypeScript

Inputs, resultados de Auth, cuentas y perfiles deberán estar tipados.

---

## RT-19 — Schemas

Las validaciones deberán centralizarse.

---

## RT-20 — Errores

Los errores de Supabase Auth deberán convertirse en mensajes de dominio comprensibles.

---

## RT-21 — Variables de entorno

Solo deberán exponerse al navegador las variables expresamente diseñadas para ello.

No deberá exponerse `service_role`.

---

## RT-22 — Acceso directo

Las operaciones compatibles podrán utilizar Supabase directamente.

Route Handlers únicamente deberán utilizarse si la operación requiere realmente servidor o privilegios especiales.

---

## RT-23 — Eventos sin login

La implementación no deberá proteger el formulario público de inscripción de eventos/capacitaciones.

---

## RT-24 — Soft Delete

La vinculación deberá considerar solamente registros `people` y `user_accounts` activos durante los flujos normales.

---

## RT-25 — RLS

RLS ya deberá estar habilitado y contar con políticas incrementales de los hitos anteriores.

Este hito deberá actualizar las políticas necesarias para utilizar `auth.uid()`, la cuenta activa y los roles en los flujos de Campus y administración. La auditoría completa y el endurecimiento transversal se realizarán en el Hito 11.

---

# 53. Requerimientos funcionales

## RF-01 — Registro

Una persona deberá poder crear una cuenta para utilizar el Campus.

---

## RF-02 — Datos de registro

Se solicitarán los datos personales definidos funcionalmente.

---

## RF-03 — DNI predeterminado

El documento predeterminado será DNI.

---

## RF-04 — CE

Se permitirá Carné de Extranjería.

---

## RF-05 — Correo como acceso

El correo será utilizado como credencial principal de acceso.

---

## RF-06 — Contraseña

El usuario deberá establecer contraseña.

---

## RF-07 — Confirmación de contraseña

La contraseña deberá confirmarse durante el registro.

---

## RF-08 — Persona existente

Si el documento ya existe en `people`, deberá reutilizarse esa persona.

---

## RF-09 — Historial anterior

La creación de cuenta no deberá eliminar ni duplicar las participaciones anteriores.

---

## RF-10 — Persona nueva

Si el documento no existe, deberá crearse la persona.

---

## RF-11 — Cuenta vinculada

Toda cuenta funcional deberá quedar relacionada con una persona.

---

## RF-12 — No duplicar cuenta

Una persona que ya tiene cuenta activa no deberá crear otra mediante el registro normal.

---

## RF-13 — Login

Un usuario registrado deberá poder iniciar sesión con correo y contraseña.

---

## RF-14 — Credenciales inválidas

Si las credenciales no son válidas, deberá mostrarse un mensaje entendible.

---

## RF-15 — Cuenta inactiva

Una cuenta deshabilitada no deberá poder utilizar normalmente las áreas protegidas.

---

## RF-16 — Logout

El usuario deberá poder cerrar sesión.

---

## RF-17 — Sesión persistente

El usuario deberá conservar su sesión mientras sea válida.

---

## RF-18 — Recuperación de contraseña

El usuario deberá poder iniciar un proceso de recuperación mediante su correo.

---

## RF-19 — Nueva contraseña

El usuario deberá poder establecer una nueva contraseña mediante el flujo correspondiente.

---

## RF-20 — Campus autenticado

Solo usuarios autenticados deberán acceder al Campus.

---

## RF-21 — Administración autenticada

Solo usuarios internos autorizados deberán acceder al panel administrativo.

---

## RF-22 — Estudiante sin administración

Un `student` no deberá poder entrar al panel administrativo.

---

## RF-23 — Perfil

El usuario del Campus deberá poder consultar sus datos personales.

---

## RF-24 — Datos únicos

El perfil deberá corresponder a la misma persona utilizada en sus participaciones institucionales.

---

## RF-25 — Eventos continúan públicos

La creación del sistema de login no deberá obligar a iniciar sesión para inscribirse en eventos y capacitaciones.

---

# 54. Consideración sobre los Hitos 2–5

El Hito 2 introdujo autenticación administrativa mínima para proteger las primeras mutaciones. Los Hitos 3 al 5 reutilizaron esa base para sus operaciones internas.

A partir de este hito se añadirá la autenticación completa de estudiantes y se revisará la base interna existente.

Antes de dar por terminado este hito deberán volver a verificarse las rutas administrativas construidas anteriormente:

```text id="my2dwd"
/admin/actividades
/admin/participantes
/admin/inscripciones
/admin/asistencia
/admin/certificados
```

y asegurar que continúen protegidas frente a usuarios públicos, estudiantes y cuentas inactivas.

---

# 55. Fuera del alcance del Hito 6

No forma parte de este hito:

- OAuth con Google;
- OAuth con Microsoft;
- login social;
- autenticación multifactor avanzada;
- SSO empresarial;
- gestión granular de permisos;
- roles personalizados;
- impersonación;
- cursos;
- módulos;
- clases;
- videos;
- progreso;
- quizzes;
- matrícula de cursos;
- certificados automáticos de cursos;
- auditoría global y endurecimiento final de RLS, correspondientes al Hito 11.

Estas funcionalidades no han sido definidas como necesarias para el alcance actual del MVP.

---

# 56. Definition of Done

El Hito 6 se considerará **TERMINADO** únicamente cuando se cumplan todos los siguientes criterios.

## Supabase Auth

- [ ] Supabase Auth está configurado.
- [ ] El registro mediante correo/contraseña funciona.
- [ ] El login funciona.
- [ ] El logout funciona.
- [ ] La sesión se mantiene correctamente.
- [ ] Existe recuperación de contraseña.
- [ ] Existe restablecimiento de contraseña.
- [ ] Las contraseñas no se almacenan en tablas propias.
- [ ] Las claves privadas no se exponen al navegador.

## Registro

- [ ] Existe `/registro`.
- [ ] Se solicita tipo de documento.
- [ ] DNI aparece por defecto.
- [ ] Se permite CE.
- [ ] Se solicita documento.
- [ ] Se solicitan nombres.
- [ ] Se solicitan apellidos.
- [ ] Se solicita correo.
- [ ] Se solicita celular.
- [ ] Se solicita cargo.
- [ ] Se solicita contraseña.
- [ ] Se solicita confirmación de contraseña.
- [ ] Se validan ambos valores.
- [ ] Se manejan campos opcionales.
- [ ] Los errores son comprensibles.

## Vinculación de persona

- [ ] El registro busca primero `people`.
- [ ] La búsqueda utiliza documento.
- [ ] Una persona existente se reutiliza.
- [ ] Una persona inexistente se crea.
- [ ] No se duplican personas por registrarse en Campus.
- [ ] Se crea `user_accounts`.
- [ ] `user_accounts.user_id` corresponde a Auth.
- [ ] `user_accounts.person_id` corresponde a `people`.
- [ ] Una persona no obtiene dos cuentas activas.
- [ ] Las participaciones anteriores permanecen relacionadas.

## Roles

- [ ] El registro público crea `student`.
- [ ] El usuario público no puede elegir `operator`.
- [ ] El usuario público no puede elegir `administrator`.
- [ ] Pueden existir cuentas `operator`.
- [ ] Pueden existir cuentas `administrator`.
- [ ] La asignación de roles internos se realiza mediante un mecanismo controlado.
- [ ] `is_active` se respeta.

## Login

- [ ] Existe `/login`.
- [ ] Se puede iniciar sesión.
- [ ] Las credenciales inválidas se manejan correctamente.
- [ ] Una cuenta inactiva no obtiene acceso normal.
- [ ] El usuario autenticado puede consultar su cuenta.
- [ ] Puede recuperarse su persona.
- [ ] Puede recuperarse su rol.

## Campus

- [ ] `/campus` está protegido.
- [ ] Un visitante es redirigido correctamente.
- [ ] Un estudiante autenticado puede ingresar.
- [ ] Existe layout del Campus funcional.
- [ ] Existe acceso básico al perfil.
- [ ] El usuario puede cerrar sesión.

## Administración

- [ ] `/admin` está protegido.
- [ ] Las rutas administrativas de hitos anteriores están protegidas.
- [ ] Un visitante no puede acceder.
- [ ] Un `student` no puede acceder.
- [ ] Un `operator` puede ser reconocido como usuario interno.
- [ ] Un `administrator` puede ser reconocido como usuario interno.
- [ ] La sesión administrativa se mantiene correctamente.

## Recuperación de contraseña

- [ ] Existe pantalla para solicitar recuperación.
- [ ] Se puede enviar/iniciar el proceso.
- [ ] Existe el flujo de restablecimiento.
- [ ] La nueva contraseña puede establecerse.
- [ ] El usuario puede volver a iniciar sesión.
- [ ] No se crea una nueva persona.
- [ ] No se crea una nueva cuenta.

## Perfil

- [ ] El estudiante puede consultar su perfil.
- [ ] Los datos provienen de `people`.
- [ ] El perfil corresponde a la cuenta autenticada.
- [ ] Las modificaciones permitidas persisten correctamente.
- [ ] No se puede modificar el rol desde el perfil.
- [ ] No se puede modificar arbitrariamente el `person_id`.

## Eventos y capacitaciones

- [ ] `/eventos` continúa siendo público.
- [ ] `/capacitaciones` continúa siendo público.
- [ ] El detalle de actividad continúa siendo público.
- [ ] La inscripción continúa funcionando sin cuenta.
- [ ] Un visitante no es obligado a registrarse para participar en una actividad.

## Arquitectura

- [ ] Existe separación entre lógica Auth y componentes visuales.
- [ ] Las mutations de autenticación están centralizadas.
- [ ] Los schemas están centralizados.
- [ ] La obtención del usuario actual está centralizada.
- [ ] Los componentes respetan Atomic Design.
- [ ] Los tipos están actualizados.
- [ ] No se implementó una API propia de autenticación innecesaria encima de Supabase Auth.
- [ ] Las políticas RLS relacionadas con autenticación, Campus y roles administrativos están implementadas y verificadas.

---

# 57. Pruebas funcionales obligatorias

## Caso 1 — Persona completamente nueva

```text id="3wt05q"
1. Documento no existe en people.
2. Abrir /registro.
3. Completar datos.
4. Crear Auth.
5. Crear people.
6. Crear user_accounts.
7. role = student.
8. Iniciar sesión.
9. Entrar a /campus.
10. Consultar perfil.
```

---

## Caso 2 — Participante anterior sin cuenta

```text id="cwcihx"
1. Persona se inscribió previamente a Evento A.
2. Ya existe en people.
3. No existe user_accounts.
4. Abrir /registro.
5. Utilizar el mismo documento.
6. No crear otra persona.
7. Crear Auth.
8. Crear user_accounts sobre person_id existente.
9. Entrar al Campus.
10. Comprobar que el historial anterior sigue asociado a esa persona.
```

Este es uno de los casos críticos del proyecto.

---

## Caso 3 — Persona con cuenta existente

```text id="ol1ut1"
1. Persona ya tiene user_accounts activa.
2. Intentar registrarse nuevamente con el mismo documento.
3. No crear otra persona.
4. No crear otra cuenta activa.
5. Informar que ya dispone de cuenta.
6. Facilitar acceso a login/recuperación según corresponda.
```

---

## Caso 4 — Login correcto

```text id="fvkt7x"
1. Abrir /login.
2. Introducir correo.
3. Introducir contraseña correcta.
4. Autenticar.
5. Recuperar user_accounts.
6. Recuperar people.
7. Recuperar role.
8. Redirigir al área correspondiente.
```

---

## Caso 5 — Login incorrecto

```text id="qcbgr5"
1. Introducir credenciales incorrectas.
2. Supabase rechaza autenticación.
3. No crear sesión.
4. Mostrar mensaje entendible.
5. No revelar detalles sensibles.
```

---

## Caso 6 — Campus sin sesión

```text id="bmmoza"
1. Cerrar sesión.
2. Abrir /campus directamente.
3. Impedir acceso.
4. Redirigir al login o comportamiento definido.
```

---

## Caso 7 — Administración como estudiante

```text id="g9zswg"
1. Iniciar sesión como student.
2. Abrir /admin.
3. Sistema comprueba rol.
4. Impedir acceso administrativo.
```

---

## Caso 8 — Administración como administrador

```text id="aib0k3"
1. Iniciar sesión como administrator.
2. Abrir /admin.
3. Validar sesión.
4. Validar cuenta activa.
5. Validar rol.
6. Permitir acceso.
```

---

## Caso 9 — Cuenta inactiva

```text id="rn7hk2"
1. Cuenta existe.
2. is_active = false.
3. Usuario intenta acceder.
4. No permitir acceso normal a áreas protegidas.
5. Mostrar comportamiento adecuado.
```

---

## Caso 10 — Logout

```text id="qmvfav"
1. Usuario autenticado.
2. Ejecutar Cerrar sesión.
3. Invalidar sesión.
4. Volver al portal público.
5. Intentar acceder nuevamente a /campus.
6. Requerir autenticación.
```

---

## Caso 11 — Recuperación de contraseña

```text id="9fwuxz"
1. Abrir recuperar contraseña.
2. Introducir correo registrado.
3. Iniciar proceso.
4. Acceder mediante mecanismo de recuperación.
5. Definir nueva contraseña.
6. Iniciar sesión con la nueva contraseña.
7. Mantener mismo person_id.
8. Mantener mismo user_account.
```

---

## Caso 12 — Eventos continúan sin cuenta

```text id="fml5zw"
1. Cerrar sesión.
2. Abrir /eventos.
3. Abrir un evento.
4. Seleccionar inscripción.
5. Completar formulario.
6. Inscribirse correctamente.
7. No requerir cuenta.
```

---

# 58. Validación final del hito

Antes de aprobar el Hito 6, el equipo deberá demostrar:

```text id="2pohor"
1. Registro de una persona nueva.
2. Creación correcta de Auth.
3. Creación correcta de people.
4. Creación correcta de user_accounts.
5. Login.
6. Sesión persistente.
7. Acceso al Campus.
8. Logout.
9. Recuperación de contraseña.
10. Registro de una persona que ya participó en un evento.
11. Reutilización del mismo person_id.
12. Protección de /campus.
13. Protección de /admin.
14. Bloqueo de student en administración.
15. Acceso de administrator.
16. Validación de cuenta inactiva.
17. Confirmación de que eventos/capacitaciones siguen funcionando sin login.
```

Todo deberá realizarse mediante los flujos normales de la aplicación.

---

# 59. Resultado final esperado del Hito 6

Al finalizar el Hito 6 deberán coexistir correctamente dos experiencias diferentes dentro del mismo sistema:

## Eventos y capacitaciones

```text id="8j6ez0"
VISITANTE
    │
    ▼
Actividad
    │
    ▼
Inscripción
    │
    ▼
SIN LOGIN
```

## Campus Virtual

```text id="x9hr45"
PERSONA
   │
   ▼
Registro / Login
   │
   ▼
Supabase Auth
   │
   ▼
user_accounts
   │
   ▼
people
   │
   ▼
CAMPUS
```

Y para administración:

```text id="dn87ox"
USUARIO INTERNO
      │
      ▼
LOGIN
      │
      ▼
user_accounts
      │
      ├── operator
      └── administrator
      │
      ▼
/admin
```

La plataforma deberá mantener siempre una identidad institucional única por persona.

Un participante que haya asistido anteriormente a eventos sin cuenta podrá crear posteriormente su usuario y continuar relacionado con la misma ficha institucional.

Con este hito queda preparada toda la infraestructura de autenticación necesaria para iniciar el desarrollo académico del Campus Virtual.

Una vez cumplido el Definition of Done, el proyecto podrá avanzar al:

**Hito 7 — Gestión de Cursos y Contenido del Campus.**
