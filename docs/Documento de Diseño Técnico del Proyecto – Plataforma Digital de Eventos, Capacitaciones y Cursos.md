# DOCUMENTO DE DISEÑO TÉCNICO DEL PROYECTO

## Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica

**Estado del documento:** Diseño técnico inicial del MVP  
**Etapa:** Diseño técnico y arquitectura de software  
**Frontend:** Next.js  
**Backend y base de datos:** Supabase  
**Enfoque arquitectónico:** Frontend-first con acceso directo a Supabase  
**Metodología de componentes:** Atomic Design obligatorio  

---

# 1. Propósito del documento

El presente documento define el diseño técnico inicial de la Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica.

Su finalidad es transformar las decisiones establecidas durante el análisis funcional en una arquitectura técnica concreta que sirva como base para:

- diseño de la base de datos;
- organización del proyecto Next.js;
- integración con Supabase;
- autenticación;
- gestión de usuarios;
- administración;
- gestión de eventos y capacitaciones;
- campus virtual;
- progreso académico;
- quizzes;
- certificados;
- almacenamiento de archivos;
- automatizaciones;
- seguridad;
- pruebas;
- despliegue;
- mantenimiento y futura evolución.

El diseño técnico deberá mantenerse alineado con el carácter de **Producto Mínimo Viable (MVP)** ya establecido.

El análisis funcional define una única plataforma institucional con dos experiencias principales: eventos y capacitaciones con inscripción rápida sin cuenta, y cursos grabados mediante una cuenta permanente de usuario.

---

# 2. Principios técnicos obligatorios

El desarrollo se regirá por cuatro decisiones principales.

## 2.1 Next.js como frontend principal

Toda la aplicación web se desarrollará utilizando **Next.js con App Router**.

Next.js utilizará su sistema de rutas basado en archivos, layouts y componentes para organizar las diferentes áreas del sistema. App Router es actualmente el router orientado a las capacidades modernas de React dentro de Next.js.

La aplicación será una sola solución Next.js, aunque internamente existan tres grandes experiencias:

- portal público;
- campus virtual;
- panel administrativo.

No se crearán aplicaciones independientes para cada una.

---

## 2.2 Supabase como backend principal

Supabase concentrará principalmente:

- PostgreSQL;
- autenticación;
- almacenamiento de archivos;
- consultas;
- operaciones de escritura;
- funciones PostgreSQL cuando sean necesarias;
- administración de sesiones;
- infraestructura backend relacionada.

Supabase proporciona una base PostgreSQL completa y un cliente JavaScript capaz de interactuar directamente con la base de datos, autenticación, almacenamiento y otras capacidades de la plataforma.

---

# 3. Principio fundamental de acceso a datos

## 3.1 Consulta directa a Supabase como Plan A

La estrategia predeterminada será:

**Componente / lógica del frontend → supabase-js → Supabase**

No se desarrollará una API intermedia para cada operación CRUD.

Ejemplos de operaciones que normalmente deberán ejecutarse directamente mediante Supabase:

- consultar actividades;
- consultar categorías;
- consultar expositores;
- registrar una inscripción;
- consultar cursos;
- consultar módulos;
- consultar clases;
- actualizar información permitida;
- consultar progreso;
- registrar progreso;
- consultar quizzes;
- registrar valoraciones;
- consultar participantes desde administración;
- actualizar estados administrativos cuando técnicamente resulte apropiado.

La librería `supabase-js` permite realizar directamente operaciones de lectura y escritura contra las APIs de Supabase.

Este principio busca reducir:

- código backend innecesario;
- duplicidad de lógica;
- endpoints CRUD repetitivos;
- mantenimiento;
- complejidad arquitectónica.

---

# 4. Uso excepcional de Route Handlers / API

Los endpoints propios de Next.js **no serán la vía normal para consultar la base de datos**.

En App Router se utilizarán técnicamente **Route Handlers**, equivalentes funcionalmente a las API Routes tradicionales de Pages Router.

Solo deberán introducirse cuando exista una necesidad real.

Ejemplos:

### Operaciones con claves secretas

Cuando sea necesario utilizar:

- API keys privadas;
- claves de proveedores;
- credenciales administrativas;
- `service_role`;
- secretos de sistemas externos.

Estas credenciales nunca deberán incorporarse al código ejecutado por el navegador. Supabase establece específicamente que las claves secretas o `service_role` no deben exponerse en clientes web.

### Integraciones externas

Ejemplos futuros:

- proveedor de correo;
- generación externa de documentos;
- webhooks;
- n8n;
- servicios de terceros;
- pagos en etapas posteriores.

### Operaciones exclusivamente administrativas

Si determinada acción requiere privilegios que ningún cliente debe poseer, podrá ejecutarse del lado servidor.

### Procesamiento sensible

Por ejemplo:

- generación segura de tokens;
- firma de documentos;
- operaciones que involucren claves privadas.

La regla será:

> **No crear una API porque sea costumbre. Crear un endpoint únicamente cuando exista una razón técnica para que la operación no pueda ejecutarse directamente mediante Supabase.**

---

# 5. Funciones PostgreSQL como alternativa a crear APIs

Cuando una operación necesite modificar varias tablas de forma controlada, no será obligatorio crear una API propia.

Podrán utilizarse **funciones PostgreSQL invocadas mediante RPC desde Supabase**.

Supabase permite ejecutar funciones PostgreSQL directamente desde `supabase-js` utilizando RPC.

Por ejemplo:

```text
Frontend
   ↓
supabase.rpc()
   ↓
Función PostgreSQL
   ↓
Transacción sobre varias tablas
```

Esto será especialmente útil para:

- inscripciones con control de cupos;
- generación de códigos;
- evitar registros duplicados;
- registrar intentos de quiz;
- determinar finalización de cursos;
- operaciones que necesiten consistencia transaccional.

De esta forma se mantiene el principio de acceso directo a Supabase sin introducir una capa API propia innecesaria.

---

# 6. Arquitectura general

Conceptualmente la plataforma tendrá la siguiente arquitectura:

```text
                    USUARIO
                       │
                       ▼
                  NEXT.JS
                       │
         ┌─────────────┼──────────────┐
         │             │              │
         ▼             ▼              ▼
 Portal público    Campus virtual   Administración
         │             │              │
         └─────────────┼──────────────┘
                       │
                       ▼
                 supabase-js
                       │
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
    PostgreSQL       Supabase Auth   Supabase Storage
        │
        ▼
Funciones SQL / Triggers cuando correspondan
```

Solo para necesidades especiales:

```text
Next.js
   │
   ▼
Route Handler
   │
   ├── API externa
   ├── clave privada
   ├── servicio administrativo
   └── integración externa
```

---

# 7. Áreas principales de la aplicación

La aplicación Next.js deberá organizarse conceptualmente en tres grandes espacios.

## 7.1 Portal público

Permitirá:

- página principal;
- catálogo de eventos;
- catálogo de capacitaciones;
- catálogo de cursos;
- buscador;
- filtros;
- ficha de actividad;
- ficha de curso;
- ficha de expositor cuando corresponda;
- inscripción en actividades;
- inicio de sesión;
- creación de cuenta.

---

## 7.2 Campus virtual

Disponible únicamente para usuarios autenticados.

Incluirá:

- inicio del campus;
- Mis cursos;
- detalle del curso;
- módulos;
- clases;
- reproductor;
- materiales;
- quizzes;
- progreso;
- cursos completados;
- certificados;
- perfil.

El análisis funcional determina que los cursos grabados requieren cuenta permanente porque deben conservar progreso, evaluaciones, cursos y certificados.

---

## 7.3 Administración

Permitirá gestionar:

- actividades;
- fechas;
- participantes;
- inscripciones;
- confirmaciones;
- asistencia;
- certificados;
- cursos;
- módulos;
- clases;
- materiales;
- quizzes;
- usuarios;
- habilitación de cursos;
- progreso;
- expositores;
- exportaciones;
- configuraciones funcionales.

La administración será parte de la misma aplicación Next.js.

---

# 8. Organización de rutas Next.js

Se propone utilizar Route Groups.

Ejemplo conceptual:

```text
src/app/

(public)/
    page.tsx
    eventos/
    capacitaciones/
    cursos/
    expositores/
    login/
    registro/

(campus)/
    campus/
        page.tsx
        cursos/
        certificados/
        perfil/

(admin)/
    admin/
        login/
        (protected)/
            layout.tsx
            page.tsx
            actividades/
            participantes/
            inscripciones/
            asistencia/
            certificados/
            cursos/
            usuarios/
            expositores/

api/
    ... únicamente endpoints estrictamente necesarios
```

Los Route Groups permiten mantener diferentes layouts sin convertirlos necesariamente en partes visibles de la URL.

El subgrupo `(protected)` no modifica las URLs. Su layout aplica la estructura visual y las comprobaciones de acceso exclusivamente a las rutas internas, dejando `/admin/login` fuera del layout protegido.

---

# 9. Atomic Design como requisito obligatorio

**Atomic Design será una regla estructural del proyecto y no solamente una recomendación.**

Los componentes deberán diseñarse buscando el mayor nivel razonable de reutilización.

La jerarquía utilizada será:

```text
Atoms
   ↓
Molecules
   ↓
Organisms
   ↓
Templates
   ↓
Pages
```

---

# 10. Átomos

Serán los elementos visuales más pequeños reutilizables.

Ejemplos:

```text
Button
Input
Textarea
Select
Checkbox
Radio
Badge
Icon
Avatar
Image
Heading
Text
Label
Separator
Spinner
Skeleton
Price
StatusBadge
DateLabel
```

Un átomo:

- no debe conocer reglas de negocio;
- no debe realizar consultas a Supabase;
- no debe conocer una actividad específica;
- debe ser reutilizable;
- debe recibir comportamiento y datos mediante props.

---

# 11. Moléculas

Combinarán varios átomos.

Ejemplos:

```text
SearchInput
FormField
DateRange
PriceDisplay
PersonIdentity
ActivityDate
CourseProgress
RatingStars
DocumentField
ContactData
RegistrationTypeSelector
AttendanceSelector
QuizOption
```

Una molécula deberá resolver una pequeña responsabilidad concreta.

---

# 12. Organismos

Representarán bloques funcionales mayores.

Ejemplos:

```text
Header
Footer
ActivityCard
CourseCard
SpeakerCard
ActivityFilters
RegistrationForm
ActivityInformation
ActivitySchedule
CourseModule
VideoLesson
QuizForm
ParticipantTable
AttendanceTable
AdminSidebar
CourseSidebar
CertificateCard
```

Los organismos podrán conocer información funcional del dominio, pero deberán seguir evitando mezclar excesivamente presentación, acceso a datos y reglas de negocio.

---

# 13. Templates

Definirán estructuras completas de interfaz.

Ejemplos:

```text
PublicLayoutTemplate
ActivityDetailTemplate
CourseDetailTemplate
CampusTemplate
CoursePlayerTemplate
AdminTemplate
ParticipantsManagementTemplate
```

Las páginas de Next.js deberán principalmente:

1. obtener o preparar datos;
2. seleccionar el template apropiado;
3. componer la interfaz.

---

# 14. Regla de atomicidad

Antes de crear un componente se deberá evaluar si una parte puede separarse y reutilizarse.

Se evitarán componentes gigantes como:

```text
ActivityDetailEverything.tsx
AdminDashboardFull.tsx
CoursePageComplete.tsx
```

que concentren cientos o miles de líneas.

La prioridad será:

> muchos componentes pequeños y claros antes que pocos componentes monolíticos.

Sin embargo, la atomicidad no deberá llevar a trasladar reglas de negocio arbitrariamente a componentes visuales.

---

# 15. Separación entre interfaz y dominio

Además de Atomic Design, se deberán separar:

```text
components/
features/
hooks/
services/
lib/
types/
validations/
utils/
constants/
```

Una estructura inicial podría ser:

```text
src/

app/

components/
    atoms/
    molecules/
    organisms/
    templates/

features/
    activities/
    registrations/
    participants/
    attendance/
    certificates/
    speakers/
    courses/
    lessons/
    quizzes/
    progress/
    ratings/
    users/

hooks/

lib/
    supabase/
    auth/

services/

types/

validations/

utils/

constants/
```

---

# 16. Cliente Supabase

Deberá centralizarse la creación del cliente de Supabase.

No deberán existir múltiples configuraciones copiadas arbitrariamente por el proyecto.

Conceptualmente:

```text
lib/supabase/
    client.ts
    server.ts
```

El cliente de navegador será el principal para las consultas directas.

También podrá existir un cliente compatible con el servidor cuando sea necesario para SSR o comprobaciones de sesión.

Supabase dispone de soporte específico para sesiones SSR con Next.js mediante `@supabase/ssr`.

---

# 17. Modelo de identidad central

Esta es una de las decisiones técnicas más importantes del proyecto.

Se distinguirán los conceptos:

```text
PERSONA
≠
CUENTA
```

Una persona puede existir sin poseer una cuenta.

Ejemplo:

```text
Persona
  ├── Evento A
  ├── Evento B
  └── Capacitación C
```

Posteriormente:

```text
Persona
  ├── Evento A
  ├── Evento B
  ├── Capacitación C
  └── Cuenta de Supabase Auth
          ├── Curso 1
          └── Curso 2
```

La creación de una cuenta **no deberá crear una segunda persona**.

Esta condición está establecida explícitamente en el análisis funcional.

---

# 18. Tabla conceptual de personas

Se propone una entidad central similar a:

```text
people
```

Campos conceptuales:

- id;
- document_type;
- document_number;
- first_names;
- last_names;
- email;
- phone;
- job_title;
- company;
- ruc;
- address;
- created_at;
- updated_at.

La combinación:

```text
document_type + document_number
```

deberá funcionar como uno de los principales mecanismos de identidad institucional.

---

# 19. Vinculación con Supabase Auth

Supabase Auth será responsable de:

- email;
- contraseña;
- recuperación de contraseña;
- sesión;
- autenticación.

La información de negocio de la persona permanecerá en tablas de la aplicación.

Se propone una relación conceptual:

```text
auth.users
      │
      │ 1:1
      ▼
user_accounts
      │
      │
      ▼
people
```

`user_accounts` permitirá relacionar la identidad autenticada de Supabase con la ficha institucional.

---

# 20. Proceso de creación de cuenta

Cuando una persona cree una cuenta:

1. proporciona documento;
2. el sistema busca una persona existente;
3. si existe, se vincula la nueva cuenta;
4. si no existe, se crea la persona;
5. se crea la relación con `auth.users`.

De esta manera se conserva el historial previo.

---

# 21. Roles del sistema

Inicialmente se considerarán:

```text
student
operator
administrator
```

Los visitantes no requerirán un rol almacenado porque son usuarios anónimos.

Los roles internos deberán estar asociados a cuentas autenticadas.

Se deberá evitar implementar inicialmente un sistema extremadamente granular de permisos, ya que el análisis funcional tampoco establece la gestión avanzada de permisos como prioridad del MVP.

---

# 22. RLS

Row Level Security será una protección obligatoria e incremental desde la primera migración.

Toda tabla ubicada en un esquema expuesto mediante la Data API deberá habilitar RLS al momento de ser creada. Sin una política explícita, el acceso permanecerá denegado por defecto.

La estrategia será:

### En cada hito

- habilitar RLS en las tablas y vistas expuestas nuevas;
- crear solamente las políticas necesarias para los casos de uso entregados;
- mantener cerrados los datos y operaciones que todavía no tengan un flujo autorizado;
- probar los roles `anon` y `authenticated` correspondientes;
- evitar acceso anónimo directo a información personal.

### En el Hito 11

Se completará:

- matriz completa de RLS;
- auditoría de políticas por tabla y rol;
- políticas definitivas de Storage;
- pruebas exhaustivas de acceso no autorizado;
- endurecimiento previo a producción.

El Hito 11 no será el momento en que RLS se active por primera vez, sino la revisión integral de una seguridad construida progresivamente.

---

# 23. Modelo conceptual de actividades

Eventos y capacitaciones compartirán una entidad principal:

```text
activities
```

Con un campo:

```text
type
```

Valores iniciales:

```text
event
training
```

Esta estrategia evita duplicar estructuras que funcionalmente son prácticamente equivalentes.

El análisis funcional define expresamente un modelo común denominado Actividad para eventos y capacitaciones.

---

# 24. Tablas principales de actividades

Modelo preliminar:

```text
activities
activity_dates
activity_speakers
speakers
registrations
attendance
certificates
categories
```

---

# 25. Actividades

`activities` almacenará principalmente:

- título;
- slug;
- descripción;
- objetivo;
- público objetivo;
- categoría;
- tipo;
- modalidad;
- ubicación;
- dirección;
- enlace virtual;
- duración;
- horas académicas;
- programa;
- temario;
- banner;
- precio general;
- precio asociado;
- gratuita;
- exclusiva para asociados;
- cupos;
- fecha de apertura de inscripción;
- fecha de cierre;
- estado;
- contacto;
- información adicional.

---

# 26. Fechas de actividad

Las fechas deberán manejarse en una tabla independiente:

```text
activity_dates
```

porque una actividad puede tener múltiples fechas y horarios.

Relación:

```text
activities
    │
    ├── activity_date 1
    ├── activity_date 2
    └── activity_date 3
```

Esto permitirá representar correctamente congresos, capacitaciones y eventos de varios días.

---

# 27. Estados de actividad

Se implementarán los estados definidos funcionalmente:

```text
draft
published
finished
archived
cancelled
```

No se implementará workflow interno de aprobación durante el MVP.

---

# 28. Inscripciones

Tabla conceptual:

```text
registrations
```

Campos relevantes:

- id;
- registration_code;
- activity_id;
- person_id;
- registration_type;
- registration_status;
- declared_member;
- company;
- ruc;
- created_at;
- confirmed_at;
- confirmed_by.

---

# 29. Prevención de inscripciones duplicadas

La regla funcional establece que una misma persona no puede inscribirse dos veces en la misma actividad utilizando el mismo documento.

La protección no dependerá únicamente del frontend.

Deberá existir una restricción de base de datos equivalente a:

```text
UNIQUE(activity_id, person_id)
```

De esta forma se evita una duplicación incluso si dos solicitudes ocurren simultáneamente.

---

# 30. Código de inscripción

Cada inscripción tendrá un identificador interno UUID y, adicionalmente, un código humano.

Ejemplo:

```text
CCI-EV-000124
```

El UUID será la identidad técnica.

El código CCI será una referencia administrativa y pública.

No deberá utilizarse un contador calculado exclusivamente desde el navegador, porque podrían generarse colisiones.

---

# 31. Actividades gratuitas

Flujo:

```text
Usuario
   ↓
Formulario
   ↓
Validación
   ↓
Persona
   ↓
Inscripción
   ↓
Estado CONFIRMED
   ↓
Código
   ↓
Notificación
```

La confirmación será automática porque así lo establece el análisis funcional.

---

# 32. Actividades con costo

Flujo:

```text
Usuario
   ↓
Formulario
   ↓
Persona
   ↓
Preinscripción
   ↓
Estado PENDING
   ↓
Código
   ↓
Coordinación externa
   ↓
Administrador confirma
   ↓
Estado CONFIRMED
```

No habrá pasarela de pagos durante el MVP.

---

# 33. Asociados

No se integrará todavía el padrón institucional.

El usuario declarará:

```text
Público general
o
Asociado CCI
```

Si selecciona asociado:

```text
company = obligatorio
ruc = obligatorio
```

La validación continuará siendo administrativa y manual durante el MVP.

---

# 34. Cupos y concurrencia

Si existe un límite de cupos, la comprobación deberá ejecutarse de manera transaccional.

No es suficiente:

```text
1. frontend consulta cupos
2. frontend decide
3. frontend inserta
```

porque dos usuarios podrían observar simultáneamente el último cupo.

Para estas operaciones se recomienda una función PostgreSQL:

```text
register_activity(...)
```

que:

1. compruebe duplicidad;
2. compruebe periodo de inscripción;
3. compruebe cupos;
4. cree o reutilice a la persona;
5. genere la inscripción;
6. genere el código;
7. confirme o deje pendiente según el tipo de actividad;
8. devuelva el resultado.

La función podrá invocarse directamente mediante `supabase.rpc()` desde el frontend. Supabase admite precisamente este patrón mediante funciones PostgreSQL expuestas a través de RPC.

---

# 35. Asistencia

La asistencia será general por actividad.

No existirá asistencia por sesión durante el MVP.

Modelo conceptual:

```text
attendance
```

Estados:

```text
pending
attended
absent
```

Relación:

```text
registration 1 ─── 1 attendance
```

También podría implementarse técnicamente como datos asociados a la inscripción, pero mantener una entidad específica facilita futuras ampliaciones, auditoría y asistencia por sesión.

---

# 36. Expositores

Tabla:

```text
speakers
```

Datos principales:

- fotografía;
- nombres;
- apellidos;
- cargo;
- profesión;
- institución;
- reseña.

Relación muchos a muchos:

```text
activities
    │
activity_speakers
    │
speakers
```

Esto permitirá reutilizar expositores y mantener historial, tal como requiere el análisis funcional.

---

# 37. Cursos

Los cursos no se modelarán como una variante de `activities`.

Tendrán su propio dominio.

Tablas principales:

```text
courses
course_instructors
course_modules
lessons
course_materials
course_enrollments
lesson_progress
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
course_ratings
```

---

# 38. Estructura académica

Jerarquía:

```text
Course
   │
   ├── Module
   │      ├── Lesson
   │      ├── Lesson
   │      └── Quiz
   │
   └── Module
          ├── Lesson
          └── Quiz
```

Los módulos deberán tener un campo de orden.

Las clases también.

No se implementará desbloqueo secuencial obligatorio durante el MVP. El alumno podrá acceder libremente a los módulos habilitados.

---

# 39. Habilitación de cursos

Se utilizará:

```text
course_enrollments
```

Relación:

```text
person
   │
   └── course_enrollment
            │
            └── course
```

Estados posibles:

```text
active
completed
revoked
```

Podría existir también:

```text
pending
```

si posteriormente resulta conveniente para cursos con costo.

---

# 40. Cursos gratuitos

Flujo:

```text
Usuario autenticado
      ↓
Curso gratuito
      ↓
Inscribirse
      ↓
course_enrollment
      ↓
ACTIVE
```

La habilitación será inmediata.

---

# 41. Cursos con costo

Flujo:

```text
Usuario
   ↓
Curso
   ↓
Coordinación externa
   ↓
Validación CCI
   ↓
Administrador
   ↓
course_enrollment ACTIVE
```

No se desarrollará pago integrado durante el MVP.

---

# 42. Progreso de video

Cada usuario deberá conservar progreso individual por clase.

Entidad:

```text
lesson_progress
```

Datos conceptuales:

- enrollment_id;
- lesson_id;
- watched_seconds;
- video_duration;
- percentage;
- completed;
- completed_at;
- last_position;
- updated_at.

---

# 43. Seguimiento de reproducción

El frontend escuchará periódicamente el progreso del reproductor.

No se enviará una actualización a la base de datos en cada segundo.

Se recomienda persistir cuando ocurra alguno de los siguientes casos:

- cada intervalo razonable de reproducción;
- pausa;
- cambio de clase;
- cierre del reproductor;
- salida de la página;
- avance significativo.

Esto reduce operaciones innecesarias.

---

# 44. Regla del 90 %

El análisis funcional establece:

```text
watched_percentage >= 90 %
```

Entonces:

```text
completed = true
```



La decisión final de completado no deberá depender únicamente de un estado visual del frontend.

Deberá quedar persistida en base de datos.

---

# 45. Posición del video

Además del porcentaje, deberá conservarse:

```text
last_position
```

Esto permitirá que un alumno vuelva posteriormente y continúe aproximadamente desde el punto anterior.

---

# 46. Proveedor y almacenamiento de video

No se asumirá automáticamente que todos los videos deberán almacenarse directamente en Supabase Storage.

Supabase Storage puede almacenar y servir archivos y dispone de mecanismos de control de acceso.

Sin embargo, el video tiene necesidades adicionales:

- tamaño;
- ancho de banda;
- streaming;
- experiencia de reproducción;
- costos;
- protección del contenido.

Por tanto, antes de implementar el campus se tomará una decisión específica entre:

- Supabase Storage;
- plataforma especializada de video;
- almacenamiento externo compatible.

Esta decisión queda **pendiente del diseño de infraestructura multimedia**.

---

# 47. Materiales

Los materiales podrán almacenarse en Supabase Storage.

Ejemplos:

- PDF;
- DOCX;
- PPTX;
- hojas de cálculo;
- imágenes;
- recursos complementarios.

Los materiales serán generales del curso y estarán disponibles en un apartado independiente. No pertenecerán individualmente a módulos o clases.

Entidad:

```text
course_materials
```

El análisis funcional establece que la descarga o lectura de estos materiales no condicionará la finalización del curso.

---

# 48. Quizzes

Modelo:

```text
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_attempt_answers
```

Cada pregunta tendrá:

- enunciado;
- opciones;
- respuesta correcta;
- explicación opcional.

---

# 49. Intentos

Los intentos serán ilimitados.

Cada ejecución creará:

```text
quiz_attempt
```

y cada respuesta:

```text
quiz_attempt_answer
```

No se deberá sobrescribir el intento anterior.

Esto permitirá conservar historial académico.

---

# 50. Cálculo de nota

El cálculo puede realizarse mediante una función PostgreSQL.

Ejemplo conceptual:

```text
submit_quiz_attempt(...)
```

La función:

1. recibe respuestas;
2. consulta soluciones;
3. calcula puntuación;
4. registra intento;
5. registra respuestas;
6. determina aprobado/no aprobado;
7. devuelve resultado.

La respuesta correcta no deberá depender exclusivamente de datos descargados previamente por el navegador.

---

# 51. Aprobación

Regla:

```text
score >= 80 %
```

Entonces:

```text
passed = true
```

Los intentos serán ilimitados.

---

# 52. Finalización automática de un curso

Un curso se considerará completado cuando:

```text
todas las clases obligatorias = completed
AND
todos los quizzes existentes = passed
```

Si no existen quizzes:

```text
todas las clases obligatorias = completed
```

Esta regla deriva directamente del análisis funcional.

---

# 53. Detección de finalización

Se deberá crear una función central equivalente a:

```text
check_course_completion(enrollment_id)
```

Podrá ejecutarse después de:

- completar una clase;
- aprobar un quiz.

Si se cumplen las condiciones:

```text
course_enrollment.status = completed
completed_at = now()
```

y se iniciará la generación o habilitación del certificado correspondiente.

---

# 54. Valoraciones

Tabla:

```text
course_ratings
```

Restricción:

```text
UNIQUE(course_id, person_id)
```

Datos:

- rating de 1 a 5;
- comentario opcional;
- created_at;
- updated_at.

Solo podrá valorarse un curso completado.

La valoración podrá modificarse posteriormente, según lo establecido funcionalmente.

---

# 55. Certificados

Se utilizará una entidad central:

```text
certificates
```

Campos conceptuales:

- id;
- code;
- person_id;
- certificate_type;
- registration_id;
- course_enrollment_id;
- file_path;
- issued_at;
- issued_by;
- created_at.

Tipos iniciales:

```text
activity
course
```

---

# 56. Certificados de actividades

Regla:

```text
registration.confirmed
AND
attendance.attended
AND
administrador habilita
```

Entonces se genera o habilita el certificado.

La asistencia por sí sola no generará automáticamente el certificado.

---

# 57. Certificados de cursos

En cursos:

```text
course completed
      ↓
certificado automático
```

No se requerirá intervención del administrador.

---

# 58. Generación del documento

Los certificados deberán generarse a partir de una plantilla institucional.

El proceso deberá recibir:

- nombre completo;
- actividad o curso;
- condición;
- fechas;
- horas;
- firmantes;
- código.

La tecnología exacta para la generación PDF se definirá durante la implementación del módulo.

Al involucrar generación de documentos y potencial almacenamiento privado, podrá ser uno de los casos donde resulte conveniente procesamiento del lado servidor.

---

# 59. Acceso a certificados sin cuenta

Los participantes de actividades no tendrán cuenta obligatoria.

Por ello deberá existir un mecanismo de acceso seguro mediante token.

Conceptualmente:

```text
/certificados/[token]
```

El token deberá:

- ser suficientemente aleatorio;
- no revelar IDs internos;
- identificar el certificado;
- permitir únicamente consultar el documento correspondiente.

Supabase Storage permite servir archivos privados mediante URLs firmadas con duración determinada, por lo que podrá utilizarse como parte de esta estrategia.

---

# 60. Storage

Se propone separar archivos por finalidad.

Ejemplo:

```text
activity-images
speaker-images
course-images
course-materials
certificates
```

Los videos podrán tener almacenamiento independiente según la decisión posterior.

---

# 61. Archivos públicos

Podrán ser públicos:

- banners de actividades;
- fotografías de expositores;
- portadas de cursos;
- determinados recursos promocionales.

---

# 62. Archivos privados

Deberán considerarse privados:

- certificados;
- materiales restringidos del campus;
- archivos internos;
- contenido que solo corresponda a alumnos habilitados.

Las políticas de Storage se incorporarán con el dominio que cree cada bucket. El Hito 11 realizará su auditoría integral y endurecimiento final.

---

# 63. Correos automáticos

Se contemplarán eventos internos como:

```text
ACTIVITY_FREE_REGISTRATION_CONFIRMED
ACTIVITY_PAID_PREREGISTRATION_CREATED
ACTIVITY_PAID_REGISTRATION_CONFIRMED
ACTIVITY_CERTIFICATE_ENABLED
COURSE_CERTIFICATE_CREATED
```

Esto permitirá desacoplar la lógica de negocio del contenido concreto del correo.

---

# 64. Integración con correo

El proveedor exacto se definirá posteriormente.

Podrá utilizarse:

- servicio especializado;
- automatización n8n;
- integración externa.

Si se requiere una API key privada, el envío deberá ejecutarse desde:

```text
Route Handler
```

o desde una función segura del backend.

Nunca directamente exponiendo la clave al navegador.

---

# 65. Diseño de estados

Las entidades con procesos importantes deberán utilizar estados explícitos.

## Actividad

```text
draft
published
finished
archived
cancelled
```

## Inscripción

```text
pending
confirmed
cancelled
```

## Asistencia

```text
pending
attended
absent
```

## Curso habilitado

```text
active
completed
revoked
```

## Certificado

```text
pending
enabled
generated
revoked
```

El conjunto final podrá ajustarse durante el diseño físico de base de datos.

---

# 66. Validación de formularios

Toda entrada deberá validarse.

Existirán dos niveles:

```text
Frontend
+
Base de datos
```

El frontend brindará experiencia inmediata.

La base de datos protegerá reglas críticas.

Ejemplo:

```text
Frontend:
"DNI requerido"

Database:
UNIQUE(activity_id, person_id)
```

Las reglas importantes nunca dependerán exclusivamente del navegador.

---

# 67. Esquemas de validación

Se recomienda centralizar validaciones compartidas en:

```text
src/validations/
```

Ejemplos:

```text
activity.schema
registration.schema
person.schema
course.schema
quiz.schema
```

Esto evitará duplicar reglas en múltiples formularios.

---

# 68. TypeScript

El proyecto deberá desarrollarse con TypeScript.

Los tipos principales deberán reflejar:

- entidades;
- estados;
- formularios;
- respuestas de funciones;
- estructuras de dominio.

Siempre que sea posible, los tipos relacionados con la base de datos deberán generarse a partir del esquema de Supabase para reducir diferencias entre TypeScript y PostgreSQL.

---

# 69. Hooks

Los hooks deberán encapsular comportamiento reutilizable.

Ejemplos:

```text
useActivities
useActivity
useRegistration
useCourses
useCourse
useCourseProgress
useVideoProgress
useQuiz
useParticipants
useAttendance
```

El objetivo será evitar que cada componente implemente directamente la misma lógica de consulta.

Aunque internamente el hook utilice `supabase-js`, el componente visual no deberá preocuparse por detalles repetitivos de acceso.

---

# 70. Servicios de dominio

Para procesos mayores podrá existir:

```text
services/
```

Ejemplos:

```text
registrationService
courseService
certificateService
participantService
```

Estos servicios no representan una API backend.

Son módulos TypeScript del frontend que organizan operaciones contra Supabase y evitan duplicidad de código.

---

# 71. Estrategia de consultas

Se aplicarán principios como:

- seleccionar solo columnas necesarias;
- evitar consultas `select *` en pantallas grandes;
- paginar listas administrativas;
- filtrar en base de datos;
- utilizar índices adecuados;
- evitar N+1 queries;
- centralizar consultas complejas.

---

# 72. Búsqueda y filtros

El catálogo deberá permitir:

- texto;
- modalidad;
- tipo;
- categoría;
- fecha;
- gratuita;
- con costo.

Inicialmente estas consultas podrán realizarse directamente contra Supabase.

A medida que crezca el número de registros podrán incorporarse:

- índices;
- búsqueda PostgreSQL;
- vistas;
- funciones especializadas.

No se requiere un motor de búsqueda externo para el MVP.

---

# 73. Renderizado y SEO

El portal público deberá favorecer indexación y rendimiento.

Las páginas de:

- eventos;
- capacitaciones;
- cursos;
- detalle de actividad;
- detalle de curso;

deberán tener metadata adecuada.

Next.js permite construir estas rutas mediante App Router y combinar rendering del servidor y cliente.

La preferencia general del proyecto seguirá siendo consultar Supabase directamente.

Cuando una página pública se beneficie especialmente de SSR para SEO, podrá realizarse una consulta directa Supabase desde el entorno servidor de Next.js sin introducir una API personalizada.

---

# 74. Componentes de servidor y cliente

No todo deberá convertirse automáticamente en `"use client"`.

Se utilizarán componentes de cliente cuando exista:

- interacción;
- formularios;
- estado;
- reproductores;
- hooks;
- acciones de usuario.

Y componentes de servidor cuando resulte conveniente para:

- estructura;
- contenido estático;
- metadata;
- renderizado inicial.

La selección deberá realizarse según responsabilidad, manteniendo el principio de simplicidad.

---

# 75. Auditoría

Se recomienda incorporar desde el MVP una tabla:

```text
audit_logs
```

para operaciones administrativas relevantes.

Campos conceptuales:

- id;
- actor_user_id;
- action;
- entity_type;
- entity_id;
- previous_data;
- new_data;
- created_at.

---

# 76. Acciones auditables

Especialmente:

- confirmar participante;
- cancelar inscripción;
- cambiar asistencia;
- habilitar certificado;
- habilitar curso;
- retirar curso;
- modificar datos de persona;
- modificar actividad;
- cancelar actividad;
- modificar certificado.

No es necesario auditar cada lectura.

---

# 77. Concurrencia

Se prestará especial atención a:

- último cupo;
- inscripciones simultáneas;
- doble envío de formularios;
- generación de códigos;
- habilitación doble;
- creación duplicada de personas;
- envío repetido de quizzes.

Las restricciones y transacciones PostgreSQL deberán actuar como protección final.

---

# 78. Idempotencia

Las operaciones críticas deberán diseñarse para soportar repeticiones accidentales.

Ejemplo:

Si el usuario pulsa dos veces:

```text
Confirmar
```

el sistema no deberá:

- crear dos inscripciones;
- generar dos certificados;
- enviar estados inconsistentes.

---

# 79. Manejo de errores

Los errores deberán clasificarse.

Ejemplo:

```text
VALIDATION_ERROR
DUPLICATE_REGISTRATION
REGISTRATION_CLOSED
NO_AVAILABLE_CAPACITY
UNAUTHORIZED
NOT_FOUND
DATABASE_ERROR
EXTERNAL_SERVICE_ERROR
```

La interfaz deberá transformar errores técnicos en mensajes comprensibles.

---

# 80. Notificaciones visuales

Las operaciones deberán mostrar claramente:

```text
loading
success
error
empty
```

Cada módulo deberá contemplar estos cuatro estados desde su diseño.

---

# 81. Seguridad general

Desde la implementación inicial deberán cumplirse los siguientes principios básicos:

- nunca subir claves privadas al repositorio;
- nunca exponer `service_role`;
- validar entradas;
- limitar operaciones administrativas;
- proteger secretos mediante variables de entorno;
- evitar confiar en valores enviados por el navegador para reglas críticas;
- utilizar HTTPS en producción;
- mantener dependencias actualizadas.

---

# 82. Prevención de abuso en formularios públicos

Los formularios de inscripción no requieren login.

Por ello deberán evaluarse medidas contra:

- bots;
- spam;
- envíos masivos;
- abuso del endpoint de inscripción.

Inicialmente podrán aplicarse controles sencillos.

Si se detecta abuso real, podrán agregarse mecanismos como CAPTCHA o rate limiting.

No se introducirá complejidad preventiva innecesaria antes de validar la necesidad.

---

# 83. Administración

El panel administrativo deberá diseñarse orientado a operaciones.

No deberá convertirse en un CMS genérico.

Las pantallas principales deberán estar directamente relacionadas con los procesos definidos funcionalmente.

Ejemplo:

```text
Dashboard

Actividades
    Eventos
    Capacitaciones

Participantes

Inscripciones
    Preinscritos
    Confirmados

Asistencia

Certificados

Campus
    Cursos
    Módulos
    Clases
    Quizzes
    Usuarios
    Habilitaciones

Expositores
```

---

# 84. Tablas administrativas

Las tablas deberán incorporar cuando corresponda:

- paginación;
- búsqueda;
- filtros;
- ordenamiento;
- selección múltiple;
- acciones masivas;
- estados visuales;
- exportación.

La selección múltiple será especialmente importante para asistencia y certificados.

---

# 85. Exportaciones

La exportación de participantes forma parte del MVP.

Deberá ser posible generar al menos archivos compatibles con hojas de cálculo, como CSV.

Campos:

- documento;
- nombres;
- correo;
- celular;
- cargo;
- empresa;
- RUC;
- inscripción;
- estado;
- asistencia.

Para volúmenes normales del MVP podrá generarse desde el propio cliente.

Si posteriormente el volumen aumenta significativamente, podrá trasladarse al servidor.

---

# 86. Historial institucional

`people` funcionará como núcleo del historial.

Conceptualmente:

```text
people
  │
  ├── registrations
  │      └── activities
  │
  ├── attendance
  │
  ├── certificates
  │
  └── course_enrollments
          ├── lessons
          ├── quizzes
          └── certificates
```

Esto permitirá construir una vista institucional unificada.

---

# 87. Base de datos relacional

El diseño aprovechará PostgreSQL de forma relacional.

No deberán guardarse estructuras críticas completas dentro de JSON cuando exista una relación clara que deba ser consultada.

Ejemplo:

Incorrecto:

```text
course.modules = JSON gigante
```

Preferido:

```text
courses
course_modules
lessons
```

JSON podrá utilizarse únicamente cuando la naturaleza del dato realmente lo justifique.

---

# 88. Identificadores

Se recomienda UUID para las claves primarias.

Ejemplo:

```text
people.id UUID
activities.id UUID
courses.id UUID
registrations.id UUID
```

Los códigos públicos serán campos separados.

---

# 89. Fechas

Todas las fechas técnicas deberán almacenarse de forma consistente.

Ejemplos:

```text
created_at
updated_at
confirmed_at
completed_at
issued_at
```

Los horarios de actividades deberán diseñarse considerando explícitamente la zona horaria institucional correspondiente.

---

# 90. Eliminación de registros

No todos los registros deberán eliminarse físicamente.

Especialmente:

- personas;
- inscripciones;
- cursos realizados;
- certificados;
- historial.

Para muchas entidades se preferirán estados como:

```text
archived
cancelled
revoked
inactive
```

Esto evita perder información institucional.

---

# 91. Migraciones

La base de datos no deberá modificarse manualmente únicamente desde el dashboard sin mantener historial.

Los cambios importantes deberán registrarse mediante migraciones.

Ejemplo:

```text
supabase/migrations/
```

Esto permitirá:

- reproducir ambientes;
- revisar cambios;
- mantener control de versiones;
- desplegar correctamente.

---

# 92. Datos iniciales

Se deberán mantener seeds para información base cuando corresponda.

Por ejemplo:

- roles;
- categorías iniciales;
- configuraciones;
- estados que no sean enums;
- usuario administrativo inicial, mediante procedimiento seguro.

---

# 93. Ambientes

Como mínimo:

```text
Development
Production
```

Idealmente:

```text
Development
Staging
Production
```

Cada uno deberá utilizar:

- proyecto Supabase correspondiente;
- variables de entorno independientes;
- claves independientes;
- datos independientes.

Nunca se deberá probar desarrollo directamente contra información productiva.

---

# 94. Variables de entorno

Se diferenciarán variables públicas y secretas.

Variables necesarias en navegador podrán utilizar configuración pública.

Ejemplo conceptual:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Las claves con privilegios elevados deberán existir únicamente en contexto servidor.

Supabase diferencia precisamente entre claves publicables para clientes y claves secretas con privilegios elevados que no deben exponerse al navegador.

---

# 95. Despliegue

La aplicación Next.js deberá desplegarse en una infraestructura compatible con las capacidades utilizadas.

El proveedor concreto podrá definirse posteriormente.

La arquitectura no deberá depender innecesariamente de características propietarias que impidan migraciones futuras.

Supabase funcionará como plataforma backend independiente del proveedor utilizado para desplegar Next.js.

---

# 96. Pruebas

El MVP deberá tener pruebas sobre los recorridos realmente críticos.

## Pruebas unitarias

Para:

- validaciones;
- cálculos;
- utilidades;
- reglas de progreso;
- reglas de quizzes.

## Pruebas de integración

Para:

- Supabase;
- creación de personas;
- inscripciones;
- habilitaciones;
- certificados.

## Pruebas E2E

Como mínimo:

### Evento gratuito

```text
Consultar
→ Inscribirse
→ Confirmación
→ Asistencia
→ Certificado
```

### Evento con costo

```text
Preinscripción
→ Confirmación administrativa
→ Asistencia
→ Certificado
```

### Curso gratuito

```text
Crear cuenta
→ Inscribirse
→ Ver videos
→ Quiz
→ Completar
→ Certificado
```

### Curso con costo

```text
Cuenta
→ Habilitación administrativa
→ Curso
→ Finalización
→ Certificado
```

Estos recorridos coinciden con los criterios funcionales de éxito definidos para el MVP.

---

# 97. Pruebas de concurrencia

Se deberán probar especialmente:

- dos usuarios tomando el último cupo;
- dos formularios con el mismo DNI;
- doble clic de inscripción;
- múltiples actualizaciones de progreso;
- envío duplicado de quiz;
- generación duplicada de certificado.

---

# 98. Performance

Inicialmente se priorizará simplicidad.

Se incorporarán desde el inicio:

- índices sobre claves foráneas;
- índices sobre documentos;
- índices sobre estados;
- índices sobre fechas;
- paginación administrativa;
- selección limitada de columnas.

Optimizaciones avanzadas deberán responder a problemas reales observados.

---

# 99. Índices previsibles

Ejemplos conceptuales:

```text
people(document_type, document_number)

registrations(activity_id, person_id)

activities(status)

activities(type)

activity_dates(start_date)

course_enrollments(person_id)

course_enrollments(course_id)

lesson_progress(enrollment_id, lesson_id)
```

El diseño final será determinado durante el modelado físico.

---

# 100. Observabilidad

Deberán poder investigarse errores de producción.

Se deberá disponer de:

- logs;
- errores de consultas;
- errores del frontend;
- trazabilidad de procesos administrativos;
- auditoría.

Supabase dispone de herramientas para inspeccionar rendimiento y comportamiento de PostgreSQL que podrán utilizarse durante operación y optimización.

---

# 101. Funcionalidades expresamente fuera del MVP

El diseño técnico no deberá incorporar anticipadamente:

- pasarela de pagos;
- facturación electrónica;
- validación automática de asociados;
- lista de espera;
- QR avanzado;
- asistencia por sesión;
- aplicación móvil;
- WhatsApp masivo;
- videoconferencia propia;
- streaming propio;
- tareas académicas;
- rúbricas;
- evaluación manual;
- secuencia obligatoria;
- vencimiento de cursos;
- verificación pública de certificados;
- portal de expositores;
- workflow de aprobación;
- BI avanzado;
- CRM completo.

Estas exclusiones corresponden al alcance funcional establecido.

---

# 102. Preparación para evolución futura

Aunque las funcionalidades anteriores no se implementen, el diseño no deberá impedir agregarlas posteriormente.

Ejemplo:

```text
registration
```

deberá poder relacionarse en el futuro con:

```text
payment
```

sin que sea necesario reconstruir todo el sistema.

Igualmente:

```text
people
```

podrá integrarse posteriormente con:

- asociados;
- CRM;
- beneficios;
- directorio empresarial.

---

# 103. Decisiones técnicas pendientes

Existen algunas decisiones que no deben tomarse arbitrariamente todavía.

## 103.1 Plataforma de video

Evaluar:

- Supabase Storage;
- proveedor especializado;
- almacenamiento externo.

## 103.2 Generación de certificados

Definir:

- librería;
- plantilla;
- proceso servidor;
- almacenamiento.

## 103.3 Servicio de correos

Definir:

- proveedor;
- n8n;
- integración directa.

## 103.4 Protección antispam

Evaluar según pruebas reales.

## 103.5 Matriz final de RLS

Las políticas mínimas se implementarán con cada dominio. La matriz global definitiva y su auditoría cruzada se completarán en el Hito 11 antes de exposición productiva.

---

# 104. Orden recomendado de implementación

La construcción deberá realizarse por capas.

## Fase 1 — Base técnica

- crear proyecto Next.js;
- configurar TypeScript;
- estructura Atomic Design;
- configurar Supabase;
- clientes Supabase;
- variables de entorno;
- estructura de rutas;
- layout público;
- layout campus;
- layout administrativo.

## Fase 2 — Modelo central

- personas;
- usuarios;
- roles;
- categorías;
- expositores.

## Fase 3 — Eventos y capacitaciones

- actividades;
- fechas;
- catálogo;
- detalle;
- filtros;
- inscripción;
- preinscripción;
- confirmación;
- cupos;
- participantes.

## Fase 4 — Operaciones

- asistencia;
- certificados;
- exportaciones;
- correos.

## Fase 5 — Campus

- Auth;
- perfil;
- cursos;
- módulos;
- clases;
- materiales;
- habilitación.

## Fase 6 — Progreso

- reproductor;
- progreso;
- 90 %;
- persistencia.

## Fase 7 — Evaluaciones

- quizzes;
- preguntas;
- opciones;
- intentos;
- 80 %;
- finalización.

## Fase 8 — Certificados de curso

- finalización automática;
- generación;
- Mis certificados.

## Fase 9 — Seguridad

- permisos;
- RLS;
- Storage;
- revisión de exposición;
- pruebas de autorización.

## Fase 10 — Calidad y producción

- pruebas E2E;
- concurrencia;
- rendimiento;
- auditoría;
- optimización;
- despliegue.

---

# 105. Resumen de arquitectura adoptada

La arquitectura final propuesta puede resumirse de la siguiente manera:

```text
                         NEXT.JS
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     Portal público       Campus           Admin
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
                       supabase-js
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
       PostgreSQL          Auth           Storage
            │
            ▼
        Functions/RPC
       cuando se necesite
       atomicidad compleja
```

Y excepcionalmente:

```text
Next.js
   │
   ▼
Route Handler
   │
   ▼
Servicios que requieren
secretos o ejecución servidor
```

---

# 106. Decisiones arquitectónicas definitivas

Para esta etapa quedan establecidas las siguientes decisiones:

**1. Next.js será el framework principal de frontend.**

**2. Se utilizará App Router.**

**3. Supabase será backend y base PostgreSQL.**

**4. `supabase-js` será el mecanismo principal de acceso a datos.**

**5. Las consultas directas desde el frontend serán el Plan A.**

**6. No se construirá una API CRUD propia innecesaria.**

**7. Route Handlers se utilizarán únicamente cuando una operación requiera realmente ejecución servidor, secretos o integración externa.**

**8. Las operaciones transaccionales complejas podrán resolverse mediante funciones PostgreSQL/RPC antes de introducir endpoints adicionales.**

**9. RLS se habilitará desde la creación de cada tabla expuesta y sus políticas se incorporarán incrementalmente.**

**10. El Hito 11 completará y auditará la matriz de RLS antes de producción.**

**11. Atomic Design será obligatorio.**

**12. Los componentes deberán mantenerse tan atómicos y reutilizables como resulte razonablemente posible.**

**13. La interfaz visual se separará de lógica de dominio, consultas y validaciones.**

**14. Persona y cuenta serán entidades conceptualmente diferentes.**

**15. Una misma persona conservará su historial antes y después de crear una cuenta.**

**16. Eventos y capacitaciones compartirán el modelo `Activity`.**

**17. Cursos utilizarán un dominio separado.**

**18. Las reglas importantes deberán protegerse también a nivel de PostgreSQL y no únicamente en el navegador.**

**19. Se utilizarán UUID como identificadores técnicos y códigos independientes como referencias administrativas.**

**20. El diseño mantendrá estrictamente el alcance del MVP establecido en el análisis funcional.**

---

# 107. Conclusión

La Plataforma Digital de Eventos, Capacitaciones y Cursos se desarrollará bajo una arquitectura deliberadamente sencilla, evitando construir capas técnicas que Supabase ya proporciona.

Next.js funcionará como aplicación principal de presentación y experiencia de usuario, mientras Supabase concentrará PostgreSQL, autenticación y almacenamiento.

El acceso directo desde el frontend hacia Supabase será el mecanismo predominante, evitando implementar una API CRUD intermedia. Cuando una operación requiera consistencia transaccional compleja se priorizarán funciones PostgreSQL invocables mediante RPC. Solo cuando sea imprescindible ocultar secretos, integrar servicios externos o ejecutar lógica exclusivamente del lado servidor se utilizarán Route Handlers.

Atomic Design será una regla estructural del frontend. La plataforma deberá construirse mediante átomos, moléculas, organismos y templates pequeños, reutilizables y desacoplados, evitando componentes monolíticos.

El núcleo de datos será la entidad Persona, permitiendo conservar una identidad institucional única incluso cuando alguien participe inicialmente en eventos sin poseer una cuenta y posteriormente se registre en el campus virtual.

El modelo técnico separará los dominios de actividades y cursos, pero mantendrá ambos relacionados mediante la persona, posibilitando construir progresivamente el historial institucional definido en el análisis funcional.

RLS se aplicará desde las primeras migraciones y evolucionará junto con cada dominio. Debido al modelo de consultas directas desde frontend, su matriz completa deberá auditarse antes de la exposición productiva del sistema.

Con estas decisiones queda establecida una base técnica suficientemente definida para avanzar a la siguiente etapa del proyecto:

**diseño físico de la base de datos y modelo entidad-relación completo de Supabase**, incluyendo tablas, campos, relaciones, claves, restricciones, índices y funciones PostgreSQL requeridas para el MVP.
