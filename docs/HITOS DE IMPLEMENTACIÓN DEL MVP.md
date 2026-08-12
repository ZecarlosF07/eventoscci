# HITOS DE IMPLEMENTACIÓN DEL MVP

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

## 1. Objetivo del documento

El presente documento establece los hitos de implementación para el desarrollo del MVP de la Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica.

Los hitos están organizados de forma incremental. Cada uno deberá entregar un resultado funcional verificable antes de continuar con el siguiente.

La estrategia de desarrollo será:

**Base técnica mínima → funcionalidad completa → pruebas → siguiente funcionalidad.**

No se desarrollará toda la base de datos primero para después construir la aplicación. Las migraciones, servicios, componentes y páginas se incorporarán progresivamente según las necesidades de cada hito.

---

# Hito 1 — Preparación técnica y núcleo del sistema

## Objetivo

Dejar preparada la infraestructura inicial del proyecto y las entidades básicas que serán utilizadas transversalmente por los demás módulos.

## Actividades

- Crear el proyecto con Next.js.
- Configurar TypeScript.
- Crear y configurar el proyecto Supabase.
- Conectar Next.js con Supabase.
- Configurar variables de entorno.
- Configurar los clientes de Supabase para navegador y servidor.
- Configurar el sistema de migraciones.
- Crear la estructura base de carpetas.
- Implementar la organización mediante Atomic Design.
- Crear los grupos principales de rutas:
  - portal público;
  - campus virtual;
  - administración.
- Crear layouts básicos.
- Crear componentes visuales reutilizables iniciales:
  - botones;
  - inputs;
  - selects;
  - textareas;
  - badges;
  - loaders;
  - elementos tipográficos.
- Crear los enums generales requeridos.
- Crear la tabla `people`.
- Crear la tabla `user_accounts`.
- Crear la tabla `categories`.
- Crear la tabla `speakers`.
- Configurar campos estándar:
  - `created_at`;
  - `updated_at`;
  - `deleted_at`;
  - `deleted_by`.
- Implementar soft delete.
- Crear función común para actualización de `updated_at`.
- Crear restricciones e índices iniciales.
- Habilitar RLS en todas las tablas expuestas del núcleo.
- Crear políticas mínimas de lectura pública únicamente para catálogos no sensibles.
- Generar los tipos TypeScript desde Supabase.

## Resultado esperado

La aplicación debe ejecutar correctamente, estar conectada a Supabase y disponer de una estructura técnica estable sobre la cual desarrollar los módulos funcionales.

---

# Hito 2 — Gestión y publicación de eventos y capacitaciones

## Objetivo

Permitir que el personal administrativo cree actividades y que estas puedan mostrarse posteriormente en el portal público.

Eventos y capacitaciones utilizarán la misma entidad `activities`, diferenciándose mediante el campo `type`.

## Base de datos

Crear:

- `activities`;
- `activity_dates`;
- `activity_speakers`.

Implementar:

- relaciones;
- restricciones;
- índices;
- estados;
- slugs;
- fechas de inscripción;
- precios;
- cupos;
- modalidades.

## Administración

Antes de habilitar operaciones administrativas, implementar el acceso interno mínimo con Supabase Auth para cuentas `operator` y `administrator`, sesión basada en cookies y protección de rutas. El registro público, recuperación de contraseña y experiencia completa de autenticación del Campus permanecen en el Hito 6.

Desarrollar:

- listado de actividades;
- creación de eventos;
- creación de capacitaciones;
- edición;
- publicación;
- archivado;
- cancelación;
- selección de categoría;
- selección de expositores;
- administración de fechas y horarios;
- configuración de modalidad;
- ubicación;
- precios;
- cupos;
- periodo de inscripción;
- información de contacto.

## Portal público

Desarrollar:

- catálogo de eventos;
- catálogo de capacitaciones;
- buscador;
- filtros;
- tarjetas de actividades;
- detalle de evento;
- detalle de capacitación;
- información de fechas;
- precios;
- modalidad;
- expositor;
- disponibilidad.

## Resultado esperado

El administrador podrá crear una actividad desde el panel administrativo, publicarla y verla inmediatamente disponible desde el portal público.

---

# Hito 3 — Inscripción a eventos y capacitaciones

## Objetivo

Permitir que cualquier persona pueda inscribirse en un evento o capacitación sin necesidad de crear una cuenta.

## Base de datos

Crear:

- `registrations`;
- `attendance`.

Crear restricciones para:

- evitar inscripciones duplicadas;
- mantener códigos únicos;
- controlar una asistencia por inscripción.

## Función PostgreSQL

Crear:

`register_activity()`

La función deberá encargarse de:

- localizar una persona existente;
- crear una persona cuando no exista;
- comprobar actividad;
- comprobar periodo de inscripción;
- comprobar duplicidad;
- comprobar disponibilidad de cupos;
- determinar tipo de inscripción;
- determinar precio;
- generar código;
- registrar inscripción;
- establecer estado;
- crear asistencia pendiente;
- registrar la notificación correspondiente.

## Portal público

Crear formulario de inscripción con:

- tipo de documento;
- DNI o CE;
- nombres;
- apellidos;
- correo;
- celular;
- cargo;
- dirección opcional;
- empresa;
- RUC;
- selección de público general o asociado CCI.

Implementar:

- validaciones;
- mensajes de error;
- inscripción gratuita;
- preinscripción de actividades con costo;
- aviso de inscripción duplicada;
- aviso de actividad cerrada;
- aviso de falta de cupos;
- página de resultado;
- código de inscripción.

## Administración

Mostrar:

- todas las inscripciones;
- preinscritos;
- confirmados;
- información del participante;
- código;
- tipo de inscripción;
- precio registrado.

## Resultado esperado

Una persona deberá poder completar correctamente el siguiente recorrido:

**Actividad → Inscripción → Validación → Código → Confirmación o preinscripción → Visualización administrativa.**

En este punto todavía no se requiere login para el participante.

---

# Hito 4 — Gestión de participantes, confirmaciones y asistencia

## Objetivo

Permitir al personal de la Cámara operar las inscripciones recibidas y realizar el control administrativo de los participantes.

## Gestión de participantes

Desarrollar:

- listado general;
- búsqueda por documento;
- búsqueda por nombre;
- búsqueda por correo;
- búsqueda por teléfono;
- ficha individual;
- modificación de información permitida;
- historial de participaciones.

## Inscripciones

Permitir:

- consultar preinscritos;
- consultar confirmados;
- confirmar manualmente una preinscripción;
- cancelar una inscripción;
- registrar motivo de cancelación;
- filtrar participantes.

## Asistencia

Permitir:

- marcar pendiente;
- marcar asistió;
- marcar no asistió;
- registrar asistencia individual;
- registrar asistencia mediante selección múltiple.

## Exportaciones

Permitir exportar información administrativa como mínimo con:

- documento;
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

## Resultado esperado

La Cámara podrá gestionar operativamente la lista completa de participantes de una actividad desde la plataforma.

---

# Hito 5 — Certificados y notificaciones de eventos y capacitaciones

## Objetivo

Completar el ciclo funcional de eventos y capacitaciones.

## Base de datos

Crear:

- `certificate_templates`;
- `certificate_template_signers`;
- `certificates`;
- `notification_outbox`.

## Certificados

Implementar:

- plantilla institucional;
- configuración de firmantes;
- código único;
- datos históricos mediante snapshots;
- almacenamiento del certificado;
- token de acceso público.

## Administración

Permitir:

- consultar asistentes;
- seleccionar uno o varios asistentes;
- habilitar certificados;
- generar certificados;
- consultar certificados emitidos;
- revocar certificados cuando corresponda.

Solo participantes marcados como asistentes podrán recibir certificado.

## Portal público

Crear:

`/certificados/[token]`

Permitir:

- acceder sin cuenta;
- consultar certificado;
- descargar certificado.

## Notificaciones

Preparar eventos para:

- inscripción gratuita confirmada;
- preinscripción creada;
- inscripción con costo confirmada;
- certificado habilitado.

## Resultado esperado

Se deberá completar el flujo:

**Crear actividad → Publicar → Inscripción → Confirmación → Asistencia → Certificado.**

Con este hito queda funcionalmente completado el módulo principal de eventos y capacitaciones.

---

# Hito 6 — Registro, login y autenticación

## Objetivo

Completar las cuentas y flujos de autenticación del Campus Virtual, reutilizando la base de acceso administrativo introducida en el Hito 2.

**El registro, login y recuperación de cuenta del estudiante se desarrollan en este hito.**

Los eventos y capacitaciones anteriores no requieren login para sus participantes.

## Supabase Auth

Configurar:

- registro;
- inicio de sesión;
- cierre de sesión;
- recuperación de contraseña;
- restablecimiento de contraseña;
- manejo de sesión.

## Páginas

Crear:

- `/login`;
- `/registro`;
- `/recuperar-contrasena`;
- flujo de restablecimiento.

## Vinculación de identidad

Implementar la relación:

`auth.users → user_accounts → people`

Durante el registro:

- solicitar documento;
- buscar si la persona ya existe;
- reutilizar la persona existente;
- evitar duplicados;
- crear una nueva persona solamente cuando corresponda;
- vincular la cuenta.

La creación de una cuenta nunca deberá crear una segunda identidad para una persona que ya participó anteriormente.

## Roles

Implementar inicialmente:

- estudiante;
- operador;
- administrador.

## Protección de rutas

Preparar acceso controlado para:

- campus;
- administración.

## Resultado esperado

El usuario podrá:

**Registrarse → Iniciar sesión → Mantener sesión → Acceder al Campus.**

Además, si anteriormente participó en actividades sin cuenta, continuará asociado a la misma persona institucional.

---

# Hito 7 — Gestión de cursos y contenido del Campus

## Objetivo

Implementar la estructura académica básica de los cursos grabados.

## Base de datos

Crear:

- `courses`;
- `course_instructors`;
- `course_modules`;
- `lessons`;
- `course_materials`;
- `course_enrollments`.

## Estructura académica

Implementar:

**Curso → Módulos → Clases → Video**

Cada clase tendrá su video correspondiente.

Los materiales serán generales del curso:

**Curso → Materiales**

No existirán materiales individuales por clase en el MVP.

## Administración

Permitir:

- crear curso;
- editar curso;
- publicar curso;
- archivar curso;
- asignar instructores;
- crear módulos;
- ordenar módulos;
- crear clases;
- ordenar clases;
- configurar videos;
- publicar clases;
- agregar materiales;
- gestionar estudiantes;
- habilitar acceso a cursos;
- revocar acceso.

## Portal público

Crear:

- catálogo de cursos;
- ficha pública del curso;
- descripción;
- objetivos;
- instructor;
- contenido;
- duración;
- precio.

## Campus

Crear:

- inicio del campus;
- Mis cursos;
- detalle interno del curso;
- navegación por módulos;
- clases;
- apartado independiente de materiales.

## Cursos gratuitos

Permitir habilitación inmediata después de la inscripción del usuario autenticado.

## Cursos con costo

La habilitación será realizada administrativamente después de la validación externa correspondiente.

## Resultado esperado

El administrador podrá crear un curso completo y habilitárselo a un alumno.

El alumno podrá iniciar sesión y acceder al contenido disponible.

---

# Hito 8 — Reproducción y progreso de clases

## Objetivo

Implementar el seguimiento automático del avance académico.

## Base de datos

Crear:

- `lesson_progress`.

## Función PostgreSQL

Crear:

`update_lesson_progress()`

## Reproductor

Implementar:

- reproducción del video;
- persistencia periódica;
- guardado al pausar;
- guardado al cambiar de clase;
- última posición;
- segundos visualizados;
- porcentaje alcanzado.

No se enviará una actualización a la base de datos cada segundo.

## Regla de finalización de clase

Una clase obligatoria deberá marcarse como completada cuando el usuario visualice al menos:

**90 % del video.**

## Progreso general

Mostrar:

- progreso de clase;
- clases completadas;
- progreso general del curso.

## Función adicional

Crear:

`check_course_completion()`

para comprobar posteriormente las condiciones necesarias para completar el curso.

## Resultado esperado

El estudiante podrá salir del curso, volver posteriormente y continuar aproximadamente desde su última posición, manteniendo su progreso registrado.

---

# Hito 9 — Quizzes y evaluaciones

## Objetivo

Implementar las evaluaciones del Campus Virtual.

## Base de datos

Crear:

- `quizzes`;
- `quiz_questions`;
- `quiz_options`;
- `quiz_attempts`;
- `quiz_attempt_answers`.

## Administración

Permitir:

- crear quiz para un módulo;
- crear preguntas;
- crear alternativas;
- indicar respuesta correcta;
- agregar explicación;
- ordenar preguntas;
- publicar quiz.

En el MVP existirá como máximo un quiz activo por módulo.

## Campus

Permitir:

- iniciar quiz;
- seleccionar respuestas;
- enviar intento;
- mostrar resultado;
- mostrar respuestas correctas;
- mostrar explicaciones cuando existan.

## Función PostgreSQL

Crear:

`submit_quiz_attempt()`

Esta función deberá:

- recibir respuestas;
- consultar internamente las respuestas correctas;
- calcular puntuación;
- guardar intento;
- guardar respuestas;
- determinar aprobación;
- comprobar finalización del curso.

Las respuestas correctas no deberán depender del navegador.

## Reglas

- Nota mínima: 80 %.
- Intentos: ilimitados.
- Los intentos anteriores deberán conservarse.

## Resultado esperado

El alumno podrá realizar quizzes y el sistema determinará automáticamente si obtuvo la nota mínima requerida.

---

# Hito 10 — Finalización de cursos, certificados y valoraciones

## Objetivo

Completar el recorrido funcional completo del Campus Virtual.

## Finalización

Un curso se considerará terminado cuando:

- todas las clases obligatorias estén completadas al 90 %;
- todos los quizzes existentes estén aprobados.

Si el curso no tiene quizzes, únicamente se requerirán las clases obligatorias.

## Al completar el curso

El sistema deberá:

- marcar la matrícula como completada;
- establecer progreso en 100 %;
- registrar fecha de finalización;
- generar o habilitar automáticamente el certificado.

## Certificados

Crear dentro del Campus:

- Mis certificados;
- detalle del certificado;
- descarga.

Los certificados de cursos no requerirán aprobación administrativa después de completar el curso.

## Valoraciones

Crear:

- puntuación de 1 a 5 estrellas;
- comentario opcional;
- edición posterior de valoración.

Solamente deberá poder valorar el curso quien lo haya completado.

## Resultado esperado

El alumno podrá completar:

**Login → Curso → Clases → Progreso → Quiz → Finalización → Certificado → Valoración.**

Con este hito queda terminado el recorrido funcional principal del Campus Virtual.

---

# Hito 11 — Seguridad y RLS

## Objetivo

Preparar la aplicación para una exposición segura en producción.

RLS habrá sido habilitado y ampliado incrementalmente desde el Hito 1. Este hito completará, auditará y endurecerá la matriz de autorización antes de la salida productiva debido al uso directo de Supabase desde Next.js.

## Actividades

- Diseñar matriz de permisos.
- Verificar que RLS esté activo en cada tabla y vista expuesta.
- Crear políticas para tablas.
- Definir acceso anónimo.
- Definir acceso autenticado.
- Definir permisos de estudiantes.
- Definir permisos de operadores.
- Definir permisos de administradores.
- Configurar políticas de Supabase Storage.
- Proteger materiales privados.
- Proteger certificados.
- Proteger información personal.
- Revisar consultas públicas.
- Revisar operaciones administrativas.
- Verificar protección de secretos.
- Confirmar que `service_role` nunca llegue al navegador.
- Probar intentos de acceso no autorizado.
- Revisar rutas protegidas.

## Resultado esperado

Cada usuario únicamente podrá consultar o modificar la información que le corresponda.

---

# Hito 12 — Pruebas, estabilización y despliegue

## Objetivo

Validar el MVP completo antes de ponerlo en producción.

## Pruebas funcionales

Probar completamente:

### Evento gratuito

**Publicar → Inscribir → Confirmar → Asistencia → Certificado**

### Evento con costo

**Publicar → Preinscripción → Confirmación administrativa → Asistencia → Certificado**

### Curso gratuito

**Registro → Login → Inscripción → Curso → Videos → Quiz → Certificado**

### Curso con costo

**Registro/Login → Validación CCI → Habilitación → Curso → Finalización → Certificado**

## Pruebas de concurrencia

Probar:

- dos personas tomando el último cupo;
- inscripción duplicada;
- dos formularios enviados simultáneamente;
- doble clic;
- creación duplicada de persona;
- múltiples actualizaciones de progreso;
- envío duplicado de quiz;
- generación duplicada de certificado.

## Pruebas técnicas

Revisar:

- errores;
- logs;
- índices;
- rendimiento;
- paginación;
- auditoría;
- manejo de estados vacíos;
- estados loading;
- errores de red;
- responsive;
- navegadores principales.

## Producción

- Crear ambiente productivo.
- Configurar variables de entorno.
- Configurar Supabase Productivo.
- Ejecutar migraciones.
- Configurar Storage.
- Verificar y aplicar la matriz de RLS correspondiente al ambiente productivo.
- Configurar dominio.
- Ejecutar pruebas finales.
- Publicar aplicación.
- Verificar monitoreo y logs.

## Resultado esperado

El MVP quedará disponible para utilización real por la Cámara de Comercio de Ica.

---

# Orden resumido del desarrollo

## Etapa A — Eventos y capacitaciones

**Hito 1 → Hito 2 → Hito 3 → Hito 4 → Hito 5**

Resultado:

**Actividad → Publicación → Inscripción → Gestión → Asistencia → Certificado**

---

## Etapa B — Campus Virtual

**Hito 6 → Hito 7 → Hito 8 → Hito 9 → Hito 10**

Resultado:

**Registro/Login → Curso → Contenido → Progreso → Quiz → Finalización → Certificado**

---

## Etapa C — Salida a producción

**Hito 11 → Hito 12**

Resultado:

**Seguridad → Pruebas → Producción**

---

# Criterio general de avance

Cada hito deberá considerarse terminado únicamente cuando el recorrido funcional definido para dicho hito pueda ejecutarse correctamente.

No será suficiente con:

- crear las tablas;
- crear las pantallas;
- crear componentes;
- desarrollar consultas de manera aislada.

La funcionalidad deberá encontrarse integrada desde la interfaz hasta PostgreSQL.

El ciclo de desarrollo recomendado para cada funcionalidad será:

**Requerimiento → Migración → Restricciones/RPC → Tipos → Validaciones → Queries/Mutations → Componentes → Página → Pruebas.**

Este criterio permitirá que cada avance del proyecto represente una funcionalidad realmente operativa y reduzca problemas de integración al final del desarrollo.
