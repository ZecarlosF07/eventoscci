# HITO 12 — PRUEBAS INTEGRALES, ESTABILIZACIÓN Y DESPLIEGUE A PRODUCCIÓN

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 12 constituye la etapa final de implementación del MVP.

En los Hitos 1 al 11 la plataforma ya deberá disponer de:

- arquitectura Next.js + Supabase;
- modelo de datos completo;
- eventos y capacitaciones;
- inscripción pública sin cuenta;
- gestión de participantes;
- confirmaciones;
- asistencia;
- certificados;
- notificaciones;
- autenticación;
- Campus Virtual;
- cursos;
- módulos;
- clases;
- materiales;
- progreso automático;
- quizzes;
- finalización de cursos;
- certificados académicos;
- valoraciones;
- roles;
- Row Level Security;
- políticas de Storage;
- protección de datos y operaciones.

El objetivo del Hito 12 no será incorporar nuevos módulos funcionales importantes, sino **comprobar que el producto completo funciona correctamente como una única solución, corregir los problemas detectados y preparar el entorno definitivo de producción**.

Este hito deberá validar los dos grandes recorridos del MVP:

### Eventos y capacitaciones

**Crear → Publicar → Inscribir → Confirmar → Asistencia → Certificado**

### Cursos

**Registro/Login → Habilitación → Clases → Progreso → Quizzes → Finalización → Certificado → Valoración**

La plataforma solo deberá considerarse lista para producción cuando estos recorridos puedan ejecutarse de principio a fin sin intervención manual sobre la base de datos.

---

# 2. Objetivo del hito

Validar, estabilizar y desplegar el MVP de la Plataforma Digital de Eventos, Capacitaciones y Cursos en un entorno productivo, garantizando que:

- los requisitos funcionales principales se cumplen;
- las reglas de negocio funcionan correctamente;
- los módulos se encuentran correctamente integrados;
- la seguridad implementada en el Hito 11 no rompe los flujos legítimos;
- la plataforma soporta los escenarios de concurrencia previstos;
- los errores son manejados correctamente;
- la experiencia es utilizable en dispositivos habituales;
- las migraciones pueden ejecutarse de manera reproducible;
- el entorno productivo está correctamente configurado;
- existe capacidad básica de diagnóstico ante incidentes.

Al terminar este hito, el MVP deberá estar preparado para utilización real por parte de la Cámara de Comercio de Ica.

---

# 3. Alcance del hito

El Hito 12 comprende:

- pruebas funcionales integrales;
- pruebas end-to-end;
- pruebas de integración;
- pruebas de concurrencia;
- pruebas de regresión;
- revisión de seguridad posterior a RLS;
- pruebas de Storage;
- pruebas de autenticación;
- validación de certificados;
- validación de correos/notificaciones;
- revisión de responsive;
- revisión de estados de carga;
- revisión de estados vacíos;
- revisión de errores;
- revisión de rendimiento;
- revisión de consultas;
- revisión de índices;
- revisión de logs;
- corrección de errores;
- preparación del entorno productivo;
- ejecución de migraciones;
- configuración de variables;
- configuración de dominio;
- despliegue;
- smoke tests posteriores al despliegue.

No deberá utilizarse este hito para incorporar funcionalidades de gran alcance no contempladas en el MVP.

---

# 4. Principio de cierre del proyecto

Durante este hito deberá aplicarse la siguiente regla:

**Corregir antes de ampliar.**

Si durante las pruebas se detectan:

- inconsistencias;
- errores;
- flujos incompletos;
- problemas de seguridad;
- consultas excesivamente costosas;

deberán corregirse antes de incorporar funcionalidades adicionales.

No deberá convertirse el Hito 12 en una nueva fase de desarrollo funcional.

---

# 5. Tareas del hito

## 5.1 Preparar estrategia de pruebas

El equipo deberá crear una matriz que relacione:

```text
Requerimiento
→ Flujo
→ Caso de prueba
→ Resultado esperado
→ Resultado obtenido
→ Estado
```

Los casos deberán clasificarse como mínimo en:

- crítico;
- alto;
- medio;
- bajo.

Los recorridos centrales del MVP deberán considerarse críticos.

---

# 6. Preparar ambientes

Deberán distinguirse claramente al menos:

```text
Desarrollo
Producción
```

Si el equipo utiliza un ambiente adicional de pruebas/staging, podrá incorporarlo.

Cada ambiente deberá tener sus propias:

- variables;
- URLs;
- proyecto Supabase cuando corresponda;
- credenciales;
- Storage;
- configuración.

No deberán compartirse accidentalmente datos productivos con desarrollo.

---

# 7. Validar migraciones desde cero

Deberá probarse la reconstrucción completa del esquema mediante:

```text
supabase/migrations/
```

La prueba deberá demostrar que una base limpia puede llegar al esquema actual ejecutando exclusivamente las migraciones versionadas.

No deberá ser necesario recordar modificaciones realizadas manualmente en el Dashboard.

---

# 8. Revisar orden de migraciones

Deberá comprobarse:

- creación de enums;
- tablas;
- foreign keys;
- constraints;
- índices;
- triggers;
- funciones;
- RPC;
- RLS;
- políticas;
- Storage relacionado cuando corresponda.

No deberán existir migraciones dependientes de objetos que todavía no han sido creados.

---

# 9. Revisar `seed.sql`

El seed deberá utilizarse únicamente cuando sea necesario para preparar información base o de desarrollo.

Deberá verificarse que:

- no contenga credenciales reales;
- no incluya secretos;
- no cree usuarios administrativos inseguros en producción;
- no dependa de IDs arbitrarios incompatibles con migraciones.

---

# 10. Pruebas del Hito 1 — Fundación

Validar nuevamente:

- aplicación Next.js;
- conexión Supabase;
- clientes browser/server;
- variables de entorno;
- tipos TypeScript;
- estructura de rutas;
- componentes base;
- soft delete;
- `set_updated_at()`;
- `people`;
- `user_accounts`;
- `categories`;
- `speakers`.

---

# 11. Pruebas del Hito 2 — Actividades

Validar:

- crear evento;
- crear capacitación;
- editar;
- publicar;
- cancelar;
- finalizar;
- archivar;
- múltiples fechas;
- expositores;
- modalidad;
- precios;
- cupos;
- periodo de inscripción;
- catálogo público;
- búsqueda;
- filtros;
- detalle mediante slug.

---

# 12. Pruebas del Hito 3 — Inscripciones

Validar especialmente:

- inscripción sin login;
- persona nueva;
- persona existente;
- público general;
- asociado;
- RUC;
- actividad gratuita;
- actividad con costo;
- código único;
- duplicados;
- cupos;
- inscripción cerrada;
- cierre manual;
- `register_activity()`.

---

# 13. Pruebas del Hito 4 — Operación

Validar:

- listado de participantes;
- ficha;
- historial;
- búsqueda;
- edición;
- confirmación manual;
- cancelación;
- asistencia;
- corrección de asistencia;
- selección múltiple;
- exportación.

---

# 14. Pruebas del Hito 5 — Certificados de actividades

Validar:

- plantillas;
- firmantes;
- elegibilidad;
- emisión individual;
- emisión múltiple;
- código;
- token;
- PDF;
- Storage;
- descarga;
- revocación;
- notificaciones.

---

# 15. Pruebas del Hito 6 — Autenticación

Validar:

- registro;
- persona nueva;
- participante anterior sin cuenta;
- login;
- logout;
- sesión;
- recuperación de contraseña;
- cuenta inactiva;
- estudiante;
- operador;
- administrador;
- protección de `/campus`;
- protección de `/admin`.

---

# 16. Pruebas del Hito 7 — Cursos

Validar:

- crear curso;
- instructor;
- módulos;
- clases;
- video;
- materiales;
- publicación;
- matrícula gratuita;
- habilitación manual;
- revocación;
- Mis cursos;
- acceso al contenido;
- navegación libre.

---

# 17. Pruebas del Hito 8 — Progreso

Validar:

- creación de `lesson_progress`;
- persistencia;
- última posición;
- reproducción posterior;
- 89 % no completa;
- 90 % sí completa;
- no regresión;
- múltiples dispositivos;
- matrícula revocada;
- progreso general.

---

# 18. Pruebas del Hito 9 — Quizzes

Validar:

- administración;
- preguntas;
- opciones;
- respuesta correcta;
- protección de `is_correct`;
- intentos;
- nota;
- 80 %;
- intentos ilimitados;
- historial;
- intento posterior inferior;
- `submit_quiz_attempt()`.

---

# 19. Pruebas del Hito 10 — Finalización

Validar:

- curso sin quiz;
- curso con quiz;
- clases opcionales;
- `check_course_completion()`;
- `completed`;
- `completed_at`;
- progreso 100 %;
- certificado automático;
- certificado único;
- Mis certificados;
- valoración;
- edición de valoración.

---

# 20. Pruebas del Hito 11 — Seguridad

Ejecutar nuevamente los principales casos negativos:

- acceso a datos de otro usuario;
- progreso ajeno;
- matrícula ajena;
- certificado ajeno;
- materiales privados;
- respuestas correctas;
- administración como student;
- endpoints privilegiados;
- RPC;
- Storage;
- `service_role`.

La seguridad deberá probarse después de integrar todo el sistema, no únicamente cuando cada política fue creada.

---

# 21. Pruebas end-to-end de actividad gratuita

Ejecutar obligatoriamente:

```text
1. Administrator inicia sesión.
2. Crea evento gratuito.
3. Configura fechas.
4. Configura cupos.
5. Publica.
6. Visitante consulta evento.
7. Se inscribe sin cuenta.
8. Sistema crea/reutiliza people.
9. registration = confirmed.
10. attendance = pending.
11. Administración visualiza participante.
12. Actividad se realiza.
13. Administrator marca attended.
14. Habilita certificado.
15. Se genera certificado.
16. Se genera token.
17. Participante accede sin cuenta.
18. Descarga certificado.
```

El recorrido completo deberá funcionar sin editar directamente la base.

---

# 22. Pruebas end-to-end de actividad con costo

Ejecutar:

```text
1. Crear actividad con costo.
2. Publicar.
3. Visitante realiza inscripción.
4. registration = pending.
5. Se muestra mensaje de preinscripción.
6. Administración revisa.
7. Valida externamente condición/pago.
8. Confirma.
9. registration = confirmed.
10. Participante aparece confirmado.
11. Registrar asistencia.
12. Emitir certificado.
13. Descargar certificado.
```

---

# 23. Prueba end-to-end de curso gratuito

Ejecutar:

```text
1. Administrator crea curso gratuito.
2. Crea módulos.
3. Crea clases.
4. Configura videos.
5. Agrega materiales.
6. Crea quizzes cuando corresponda.
7. Publica.
8. Usuario crea cuenta.
9. Inicia sesión.
10. Se inscribe gratuitamente.
11. Curso aparece en Mis cursos.
12. Visualiza clases.
13. Registra progreso.
14. Completa clases al 90 %.
15. Resuelve quizzes.
16. Obtiene >= 80 %.
17. Curso pasa a completed.
18. Progreso = 100 %.
19. Se genera certificado.
20. Lo descarga.
21. Valora curso.
```

---

# 24. Prueba end-to-end de curso con costo

Ejecutar:

```text
1. Crear curso con costo.
2. Publicar.
3. Usuario inicia sesión.
4. Consulta curso.
5. No se matricula automáticamente.
6. CCI realiza proceso externo.
7. Administrador habilita curso.
8. Curso aparece en Mis cursos.
9. Alumno consume contenido.
10. Completa requisitos.
11. Curso se completa.
12. Certificado se genera.
13. Alumno valora.
```

---

# 25. Pruebas de concurrencia

Deberán ejecutarse pruebas específicas para condiciones de carrera.

---

# 26. Último cupo

Preparar:

```text
capacity = N
inscripciones confirmadas/ocupadas = N - 1
```

Ejecutar al menos dos solicitudes prácticamente simultáneas.

Resultado esperado:

- no superar `capacity`;
- una operación obtiene el último cupo;
- las demás reciben respuesta de disponibilidad agotada.

---

# 27. Inscripción duplicada simultánea

Enviar dos solicitudes concurrentes de:

```text
misma persona
+
misma actividad
```

Resultado:

- una única inscripción activa;
- un único código válido;
- respuesta controlada para la segunda operación.

---

# 28. Matrícula gratuita duplicada

Ejecutar simultáneamente:

`enroll_free_course()`

para la misma persona/curso.

Resultado:

- una única matrícula activa.

---

# 29. Progreso concurrente

Simular actualizaciones próximas desde:

- dos pestañas;
- dos dispositivos.

Resultado:

- no crear múltiples `lesson_progress`;
- no perder progreso reconocido;
- no descompletar una clase ya completada.

---

# 30. Quiz concurrente

Simular doble envío de intento.

El sistema deberá mantener consistencia y evitar estados parciales.

Si se generan dos intentos válidos por dos envíos efectivamente procesados, deberán permanecer coherentemente numerados y registrados; si el diseño incorpora protección contra doble clic/idempotencia, deberá comportarse conforme a ella.

---

# 31. Certificado duplicado

Ejecutar repetidamente el proceso que genera el mismo certificado.

Resultado:

**un único certificado equivalente por origen.**

---

# 32. Finalización duplicada

Ejecutar múltiples veces:

`check_course_completion()`.

Resultado:

- una sola finalización;
- mismo `completed_at`;
- un solo certificado.

---

# 33. Pruebas de regresión

Después de cada corrección importante deberá comprobarse que no se haya roto:

- portal público;
- inscripción;
- administración;
- Campus;
- certificados;
- seguridad.

Los recorridos principales deberán formar una suite de regresión mínima.

---

# 34. Automatización de pruebas

Cuando sea razonable, deberán automatizarse especialmente los escenarios críticos.

Se recomienda priorizar pruebas automatizadas para:

- autenticación;
- inscripción;
- cupos;
- matrícula;
- progreso;
- quizzes;
- finalización;
- permisos.

La herramienta concreta de E2E podrá seleccionarse de acuerdo con el stack del proyecto.

El diseño técnico no fija una herramienta específica de testing.

---

# 35. Pruebas de validación de formularios

Revisar todos los formularios críticos.

## Actividades

- títulos;
- precios;
- fechas;
- cupos.

## Inscripción

- documento;
- correo;
- RUC;
- asociado.

## Auth

- correo;
- contraseña.

## Cursos

- precios;
- duración;
- estructura.

## Quiz

- preguntas;
- opciones.

## Valoración

- estrellas.

---

# 36. Estados de carga

Todas las operaciones asíncronas importantes deberán mostrar un estado adecuado.

Ejemplos:

- guardando;
- cargando;
- generando;
- enviando;
- procesando.

No deberá parecer que una acción no hizo nada.

---

# 37. Prevención de doble clic

Revisar acciones críticas como:

- inscribirse;
- confirmar;
- emitir certificado;
- matricular;
- enviar quiz;
- valorar.

La interfaz deberá impedir envíos accidentales repetidos mientras la operación se procesa.

La base de datos continuará siendo la protección definitiva.

---

# 38. Estados vacíos

Deberán existir estados claros en:

- actividades;
- participantes;
- inscripciones;
- asistencia;
- cursos;
- Mis cursos;
- materiales;
- certificados;
- quizzes.

Ejemplos:

**No hay eventos publicados actualmente.**

**Aún no tienes cursos habilitados.**

---

# 39. Estados de error

La interfaz deberá manejar errores de:

- red;
- validación;
- autenticación;
- autorización;
- base de datos;
- Storage;
- PDF;
- correo;
- video.

Los mensajes deberán ser comprensibles.

---

# 40. Error inesperado

Los errores técnicos no controlados deberán:

- registrarse cuando corresponda;
- mostrar una interfaz segura;
- no revelar stack traces o SQL al usuario.

---

# 41. Pruebas responsive

Deberán probarse las principales interfaces en tamaños equivalentes a:

- móvil;
- tablet;
- desktop.

Priorizar especialmente:

- portal público;
- formulario de inscripción;
- login;
- Campus;
- reproductor;
- quiz.

---

# 42. Navegadores

Deberá verificarse el funcionamiento en navegadores modernos utilizados por el público objetivo.

La lista exacta deberá definirse según las necesidades de la Cámara.

Como mínimo deberán probarse navegadores Chromium y Safari/WebKit cuando sea razonable.

---

# 43. Formularios móviles

Revisar especialmente:

- teclado adecuado;
- inputs de documento;
- teléfono;
- correo;
- botones;
- scroll;
- mensajes de error.

El flujo de inscripción pública deberá ser fácil de completar desde teléfono.

---

# 44. Reproductor móvil

Verificar:

- reproducción;
- controles;
- rotación;
- reanudación;
- persistencia;
- navegación entre clases.

---

# 45. Quiz móvil

Verificar que:

- preguntas sean legibles;
- opciones sean seleccionables;
- botones sean accesibles;
- resultado sea comprensible.

---

# 46. Revisión de accesibilidad básica

Dentro del alcance razonable del MVP deberán revisarse:

- labels en formularios;
- navegación mediante teclado;
- contraste;
- estados focus;
- textos alternativos en imágenes relevantes;
- jerarquía de títulos;
- mensajes de error asociados a campos.

---

# 47. Revisión de rendimiento

Identificar páginas o consultas excesivamente lentas.

Revisar especialmente:

- catálogo de actividades;
- listados administrativos;
- participantes;
- cursos;
- Mis cursos;
- progreso;
- quizzes.

---

# 48. Queries N+1

Deberán revisarse consultas que puedan generar múltiples requests innecesarios.

Ejemplo problemático:

```text
Consultar 100 actividades
↓
100 consultas adicionales para fechas
↓
100 consultas para expositor
```

Cuando resulte adecuado deberán usarse relaciones o consultas consolidadas.

---

# 49. Paginación

Confirmar paginación funcional en listados que puedan crecer:

- participantes;
- inscripciones;
- actividades administrativas;
- cursos;
- notificaciones;
- auditoría cuando corresponda.

---

# 50. Índices

Revisar índices utilizados por consultas frecuentes.

Especialmente los asociados a:

- documentos;
- slugs;
- estados;
- actividad;
- persona;
- matrícula;
- progreso;
- quizzes;
- certificados.

El diccionario físico ya define índices base que deberán mantenerse.

---

# 51. Consultas innecesarias

Evitar:

`select *`

cuando una pantalla solo requiere unas pocas columnas.

Esto será especialmente importante en tablas que contengan información personal.

---

# 52. Imágenes

Revisar:

- tamaño de banners;
- dimensiones;
- optimización;
- carga;
- responsive.

Next.js deberá utilizar sus mecanismos apropiados cuando corresponda.

---

# 53. Archivos

Verificar:

- subida;
- descarga;
- MIME types;
- tamaño;
- errores;
- materiales eliminados;
- URLs firmadas.

---

# 54. Certificados PDF

Verificar generación con:

- nombres largos;
- nombres con tildes;
- apellidos compuestos;
- títulos de actividades largos;
- distintas horas académicas;
- varios firmantes.

El documento no deberá romper visualmente ante datos reales razonables.

---

# 55. Caracteres especiales

Probar datos en español:

```text
á
é
í
ó
ú
ñ
Ñ
```

y nombres institucionales con caracteres especiales.

La plataforma deberá utilizar correctamente UTF-8.

---

# 56. Fechas y zona horaria

Deberá verificarse que las fechas y horas utilizadas para actividades se muestren correctamente en el contexto operativo de la Cámara de Comercio de Ica.

El sistema deberá mantener una convención consistente entre:

- PostgreSQL;
- Supabase;
- Next.js;
- interfaz.

---

# 57. Moneda

Los precios deberán visualizarse correctamente en la moneda definida para el proyecto.

Los snapshots históricos deberán mantenerse sin cambios cuando el precio del producto cambie posteriormente.

---

# 58. Correos

Probar los eventos de notificación definidos.

Como mínimo:

- inscripción gratuita;
- preinscripción con costo;
- confirmación;
- certificado.

Verificar:

- destinatario;
- datos;
- enlaces;
- errores;
- reintentos.

---

# 59. Falla de correo

Simular falla del proveedor.

Resultado esperado:

- negocio completado;
- outbox registra error;
- se mantiene posibilidad de reintento;
- no se duplica la inscripción/certificado.

---

# 60. Storage

Comprobar:

## Público

- banners;
- imágenes públicas.

## Privado

- materiales;
- certificados;
- recursos protegidos.

Las políticas del Hito 11 deberán mantenerse funcionando correctamente.

---

# 61. Revisión de autenticación

Probar:

- expiración de sesión;
- sesión inválida;
- logout;
- recuperación;
- cuenta inactiva;
- intentos de navegación directa.

---

# 62. URLs directas

Probar abrir directamente:

```text
/admin/...
/campus/...
/campus/cursos/[id]
/certificados/[token]
```

con diferentes roles.

La autorización deberá mantenerse independientemente de la navegación previa.

---

# 63. Not Found

Crear comportamiento adecuado para:

- actividad inexistente;
- curso inexistente;
- módulo inexistente;
- clase inexistente;
- certificado inexistente;
- token inválido.

---

# 64. Soft delete

Realizar pruebas generales para confirmar que registros con:

`deleted_at IS NOT NULL`

no aparezcan en los flujos normales.

---

# 65. Estados cancelados/revocados

Verificar correctamente:

- actividad cancelada;
- inscripción cancelada;
- matrícula revocada;
- certificado revocado.

Estos estados no deberán confundirse con soft delete.

---

# 66. Auditoría

Revisar que las operaciones administrativas definidas como auditables produzcan información suficiente.

Como mínimo revisar:

- actor;
- acción;
- entidad;
- fecha.

Los `audit_logs` deberán conservarse como append-only.

---

# 67. Revisión de variables de entorno

Antes de producción revisar todas las variables.

Clasificarlas como:

```text
Públicas
Privadas
```

Confirmar especialmente que:

`service_role`

permanezca exclusivamente en servidor.

---

# 68. Preparar Supabase de producción

El proyecto productivo deberá configurar:

- PostgreSQL;
- Auth;
- Storage;
- variables;
- URLs permitidas;
- callbacks;
- correos;
- políticas RLS.

No deberán copiarse configuraciones de desarrollo sin revisarlas.

---

# 69. Ejecutar migraciones en producción

El esquema productivo deberá crearse mediante las migraciones versionadas.

No deberá recrearse manualmente tabla por tabla.

El equipo deberá registrar la versión desplegada.

---

# 70. Generar tipos finales

Después de validar el esquema productivo, deberán mantenerse sincronizados los tipos TypeScript correspondientes.

No deberá desplegarse una aplicación con tipos significativamente desfasados respecto de la base.

---

# 71. Configurar dominio

Configurar el dominio productivo definido para la plataforma.

Validar:

- HTTPS;
- redirecciones;
- URLs de Auth;
- links enviados por correo;
- links de certificados.

---

# 72. HTTPS

La aplicación productiva deberá utilizar HTTPS.

No deberán transmitirse credenciales o tokens por HTTP sin cifrado.

---

# 73. Configurar Auth productivo

Revisar:

- Site URL;
- Redirect URLs;
- recuperación de contraseña;
- confirmaciones;
- callbacks.

Los enlaces no deberán continuar apuntando a:

`localhost`.

---

# 74. Configurar proveedor de correo

El proveedor utilizado deberá configurarse con credenciales productivas.

Verificar:

- remitente;
- dominio;
- enlaces;
- manejo de errores.

---

# 75. Configurar Storage productivo

Crear/configurar los buckets requeridos.

Por ejemplo:

```text
activity-banners
course-banners
course-materials
certificates
signatures
```

Los nombres exactos dependerán de la implementación definitiva.

Aplicar las políticas correspondientes.

---

# 76. Monitoreo básico

Antes de producción deberá existir capacidad de consultar:

- errores de aplicación;
- errores de servidor;
- logs relevantes;
- errores de notificaciones;
- errores de funciones.

No se requiere implementar una plataforma empresarial de observabilidad si no forma parte del MVP, pero el equipo deberá poder diagnosticar incidentes.

---

# 77. Backups

Deberá revisarse la estrategia disponible de respaldo de la base de datos y los recursos importantes según las capacidades del servicio contratado.

El equipo deberá conocer cómo recuperar información ante un incidente.

---

# 78. Datos iniciales de producción

Crear únicamente los datos necesarios para comenzar.

Ejemplos:

- categorías reales;
- plantilla institucional;
- firmantes;
- cuenta administrativa inicial.

No deberán copiarse masivamente datos ficticios del entorno de desarrollo.

---

# 79. Administrador inicial

La cuenta administrativa inicial deberá crearse mediante un proceso controlado.

Deberá:

- utilizar credenciales seguras;
- estar vinculada a `people`;
- tener `user_accounts.role = administrator`;
- no utilizar contraseñas de ejemplo.

---

# 80. Smoke test de producción

Inmediatamente después del despliegue deberán probarse las funciones esenciales.

Como mínimo:

```text
1. Abrir página principal.
2. Consultar evento.
3. Consultar curso.
4. Login administrativo.
5. Login estudiante.
6. Inscripción de prueba controlada.
7. Acceso Campus.
8. Storage.
9. RPC.
10. Certificado/token.
```

No será necesario completar toda la suite E2E en producción con datos reales, pero sí confirmar que los servicios principales responden.

---

# 81. Plan de reversión

Antes de una migración o despliegue relevante, el equipo deberá disponer de un procedimiento para actuar si la versión produce un error crítico.

Como mínimo deberá conocerse:

- versión desplegada;
- migraciones aplicadas;
- commit correspondiente;
- estrategia para revertir aplicación;
- estrategia para corregir migración si fuera necesaria.

---

# 82. Requerimientos técnicos

## RT-01 — Migraciones reproducibles

El esquema deberá reconstruirse completamente mediante migraciones.

---

## RT-02 — TypeScript

El proyecto no deberá contener errores críticos de TypeScript antes del despliegue.

---

## RT-03 — Build

El build de producción deberá completarse correctamente.

---

## RT-04 — Lint

Los errores relevantes de lint deberán resolverse.

---

## RT-05 — Pruebas críticas

Los principales recorridos deberán disponer de pruebas manuales o automatizadas verificadas.

---

## RT-06 — E2E

Los recorridos críticos deberán probarse de extremo a extremo.

---

## RT-07 — Concurrencia

Las operaciones sensibles deberán probarse bajo solicitudes simultáneas.

---

## RT-08 — RLS

Las políticas del Hito 11 deberán permanecer activas y verificadas.

---

## RT-09 — Storage

Las políticas de Storage deberán comprobarse.

---

## RT-10 — Secretos

Ningún secreto deberá estar incluido en el bundle cliente.

---

## RT-11 — Variables

Las variables de producción deberán estar correctamente configuradas.

---

## RT-12 — HTTPS

El entorno productivo deberá utilizar HTTPS.

---

## RT-13 — Auth URLs

Las URLs productivas de autenticación deberán estar correctamente configuradas.

---

## RT-14 — RPC

Todas las RPC críticas deberán funcionar en producción.

---

## RT-15 — Índices

Las consultas frecuentes deberán disponer de índices adecuados.

---

## RT-16 — Paginación

Los listados de crecimiento potencial deberán usar paginación.

---

## RT-17 — Performance

No deberán existir problemas críticos de rendimiento detectados antes del lanzamiento.

---

## RT-18 — Responsive

Las pantallas esenciales deberán funcionar en móvil y escritorio.

---

## RT-19 — Errores

Los usuarios no deberán recibir stack traces ni errores SQL.

---

## RT-20 — Logs

El equipo deberá disponer de capacidad mínima de diagnóstico.

---

## RT-21 — Certificados

La generación y descarga deberán funcionar en producción.

---

## RT-22 — Notificaciones

Los correos definidos deberán poder procesarse correctamente.

---

## RT-23 — Idempotencia

Las operaciones críticas deberán mantener las garantías diseñadas.

---

## RT-24 — Soft delete

Los registros eliminados lógicamente deberán seguir excluidos correctamente.

---

## RT-25 — Snapshots

Los datos históricos deberán preservarse ante modificaciones posteriores.

---

## RT-26 — Código versionado

La versión desplegada deberá estar identificada en el sistema de control de versiones.

---

## RT-27 — Base productiva separada

La aplicación productiva no deberá utilizar accidentalmente la base de desarrollo.

---

## RT-28 — Storage productivo separado

Los archivos productivos no deberán depender accidentalmente de buckets de desarrollo.

---

## RT-29 — Sin modificaciones manuales necesarias

Los flujos del producto deberán poder completarse sin editar directamente PostgreSQL.

---

## RT-30 — Preparación de recuperación

El equipo deberá conocer el procedimiento básico de recuperación/reversión.

---

# 83. Requerimientos funcionales

## RF-01 — Actividad completa

Deberá poder ejecutarse completamente el flujo de una actividad gratuita.

---

## RF-02 — Actividad con costo

Deberá poder ejecutarse completamente el flujo de una actividad con costo.

---

## RF-03 — Curso gratuito

Deberá poder completarse el recorrido de un curso gratuito.

---

## RF-04 — Curso con costo

Deberá poder completarse el recorrido de un curso habilitado manualmente.

---

## RF-05 — Inscripción pública

Deberá continuar funcionando sin cuenta.

---

## RF-06 — Autenticación

Registro, login, logout y recuperación deberán funcionar.

---

## RF-07 — Participantes

La administración deberá gestionar correctamente las personas.

---

## RF-08 — Confirmaciones

Las preinscripciones deberán poder confirmarse.

---

## RF-09 — Asistencia

Deberá registrarse y corregirse correctamente.

---

## RF-10 — Certificados de actividad

Deberán generarse y descargarse.

---

## RF-11 — Cursos

Deberán crearse, publicarse y habilitarse.

---

## RF-12 — Contenido

Módulos, clases y materiales deberán funcionar.

---

## RF-13 — Progreso

Deberá persistir correctamente.

---

## RF-14 — Regla 90 %

La finalización de clases deberá funcionar.

---

## RF-15 — Quizzes

Deberán corregirse automáticamente.

---

## RF-16 — Regla 80 %

La aprobación deberá funcionar.

---

## RF-17 — Intentos ilimitados

El historial deberá conservarse.

---

## RF-18 — Finalización

Los cursos deberán completarse automáticamente al cumplir requisitos.

---

## RF-19 — Certificado de curso

Deberá generarse automáticamente.

---

## RF-20 — Valoración

Un alumno que completó el curso deberá poder valorar.

---

## RF-21 — Seguridad

Cada usuario deberá acceder únicamente a la información correspondiente.

---

## RF-22 — Responsive

Los recorridos principales deberán poder utilizarse desde dispositivos móviles.

---

## RF-23 — Errores comprensibles

Los errores del usuario deberán mostrarse de forma clara.

---

## RF-24 — Estados vacíos

Las páginas deberán manejar correctamente la ausencia de información.

---

## RF-25 — Sin intervención técnica

Los operadores de la Cámara no deberán necesitar modificar Supabase directamente para realizar las operaciones normales.

---

# 84. Fuera del alcance del Hito 12

No deberá incorporarse como requisito de cierre:

- aplicación móvil nativa;
- WhatsApp Business integrado;
- pasarela de pago;
- facturación electrónica;
- CRM;
- ERP;
- gamificación;
- streaming en vivo;
- videoconferencias;
- marketplace;
- multiempresa;
- multitenancy;
- IA;
- recomendaciones automáticas;
- BI avanzado;
- app offline;
- certificación ISO 27001;
- infraestructura multirregión;
- pentesting profesional externo.

Estas funcionalidades podrán evaluarse posteriormente como evoluciones del producto.

---

# 85. Definition of Done

El Hito 12 se considerará **TERMINADO** y el MVP podrá considerarse listo para uso productivo únicamente cuando se cumplan los siguientes criterios.

## Código

- [ ] El proyecto compila correctamente.
- [ ] El build de producción termina sin errores críticos.
- [ ] No existen errores críticos de TypeScript.
- [ ] No existen errores críticos de lint.
- [ ] La versión de producción está identificada en control de versiones.

## Base de datos

- [ ] Todas las migraciones están versionadas.
- [ ] Una base limpia puede reconstruirse con las migraciones.
- [ ] Las foreign keys funcionan.
- [ ] Los constraints funcionan.
- [ ] Los triggers funcionan.
- [ ] Las RPC funcionan.
- [ ] Los índices críticos existen.
- [ ] RLS está implementado.
- [ ] Las políticas están versionadas.

## Eventos y capacitaciones

- [ ] Se puede crear evento.
- [ ] Se puede crear capacitación.
- [ ] Se puede publicar.
- [ ] Se muestra públicamente.
- [ ] Se puede realizar inscripción gratuita.
- [ ] Se puede realizar preinscripción con costo.
- [ ] Se controlan duplicados.
- [ ] Se controlan cupos.
- [ ] Se respetan periodos de inscripción.
- [ ] Se puede confirmar.
- [ ] Se puede cancelar inscripción.
- [ ] Se puede registrar asistencia.
- [ ] Se puede exportar participantes.
- [ ] Se puede emitir certificado.
- [ ] Se puede descargar mediante token.

## Autenticación

- [ ] Se puede registrar una cuenta.
- [ ] Se reutiliza `people` cuando corresponde.
- [ ] Se puede iniciar sesión.
- [ ] Se puede cerrar sesión.
- [ ] Se puede recuperar contraseña.
- [ ] Se respetan roles.
- [ ] Se respeta `is_active`.
- [ ] `/campus` está protegido.
- [ ] `/admin` está protegido.

## Campus

- [ ] Existe catálogo público de cursos.
- [ ] Existe detalle público.
- [ ] Se puede crear un curso.
- [ ] Se pueden crear módulos.
- [ ] Se pueden crear clases.
- [ ] Se pueden configurar videos.
- [ ] Se pueden agregar materiales.
- [ ] Se puede habilitar alumno.
- [ ] Se puede revocar acceso.
- [ ] Existe Mis cursos.
- [ ] Se puede acceder al contenido habilitado.

## Progreso

- [ ] Se guarda progreso.
- [ ] Se recupera última posición.
- [ ] No se escribe innecesariamente cada segundo.
- [ ] 89 % no completa.
- [ ] 90 % completa.
- [ ] Una clase completada no regresa arbitrariamente.
- [ ] Se calcula progreso general.
- [ ] Los materiales no afectan progreso.

## Quizzes

- [ ] Se pueden crear.
- [ ] Se pueden publicar.
- [ ] Las respuestas correctas están protegidas.
- [ ] Se pueden realizar intentos.
- [ ] Se calcula la nota en lógica confiable.
- [ ] 80 % aprueba.
- [ ] Menos de 80 % no aprueba.
- [ ] Los intentos son ilimitados.
- [ ] Los intentos se conservan.
- [ ] Una aprobación anterior no se pierde.

## Finalización

- [ ] Un curso sin quizzes puede completarse por clases obligatorias.
- [ ] Un curso con quizzes exige aprobación.
- [ ] Las clases opcionales no bloquean.
- [ ] `course_enrollment.status = completed`.
- [ ] Se registra `completed_at`.
- [ ] Se establece progreso 100 %.
- [ ] La operación es idempotente.

## Certificados de cursos

- [ ] Se generan automáticamente.
- [ ] No se duplican.
- [ ] Utilizan plantilla institucional.
- [ ] Contienen snapshots.
- [ ] Pueden descargarse.
- [ ] Aparecen en Mis certificados.
- [ ] Pueden revocarse sin descompletar curso.

## Valoraciones

- [ ] Solo cursos completados pueden valorarse.
- [ ] Se admiten 1–5 estrellas.
- [ ] El comentario es opcional.
- [ ] Existe una valoración activa por persona/curso.
- [ ] Se puede editar.

## Seguridad

- [ ] El visitante solo accede a información pública.
- [ ] El Student solo accede a información propia.
- [ ] Un Student no accede a administración.
- [ ] Un usuario no matriculado no accede a contenido privado.
- [ ] Un alumno no modifica progreso ajeno.
- [ ] `is_correct` no está expuesto.
- [ ] Certificados privados están protegidos.
- [ ] Materiales privados están protegidos.
- [ ] `service_role` no está expuesto.
- [ ] Las RPC críticas verifican las reglas correspondientes.

## Concurrencia

- [ ] Se probó el último cupo.
- [ ] Se probó inscripción duplicada.
- [ ] Se probó matrícula duplicada.
- [ ] Se probó progreso concurrente.
- [ ] Se probó doble envío de quiz.
- [ ] Se probó certificado duplicado.
- [ ] Se probó finalización múltiple.
- [ ] No se detectaron inconsistencias críticas.

## UI/UX

- [ ] Los recorridos principales funcionan en móvil.
- [ ] Funcionan en desktop.
- [ ] Los formularios muestran validaciones.
- [ ] Existen estados loading.
- [ ] Existen estados empty.
- [ ] Existen estados error.
- [ ] Las acciones críticas evitan doble clic accidental.
- [ ] No se muestran errores técnicos al usuario.

## Performance

- [ ] Los listados grandes usan paginación.
- [ ] Las consultas críticas fueron revisadas.
- [ ] Los índices principales están presentes.
- [ ] No existen problemas críticos N+1 identificados.
- [ ] Las páginas principales tienen tiempos de respuesta aceptables para el MVP.

## Producción

- [ ] Existe proyecto/entorno productivo.
- [ ] Las variables productivas están configuradas.
- [ ] Las migraciones se ejecutaron correctamente.
- [ ] RLS está activo.
- [ ] Storage está configurado.
- [ ] Auth utiliza URLs productivas.
- [ ] HTTPS funciona.
- [ ] El dominio funciona.
- [ ] El proveedor de correo está configurado.
- [ ] Existe administrador inicial.
- [ ] Se ejecutaron smoke tests.
- [ ] Existe una estrategia básica de logs/diagnóstico.
- [ ] El equipo conoce el procedimiento de reversión.

---

# 86. Criterios de severidad para bugs

Antes del lanzamiento deberán clasificarse los errores encontrados.

## Bloqueante / crítico

Ejemplos:

- pérdida de datos;
- acceso no autorizado;
- inscripción imposible;
- login imposible;
- sobrepasar cupos;
- nota manipulable;
- certificado de otra persona;
- Campus inaccesible;
- migración fallida.

**No deberá desplegarse con bugs críticos conocidos.**

---

## Alto

Problemas que afectan significativamente un flujo principal pero poseen alguna alternativa temporal.

Deberán corregirse preferentemente antes del lanzamiento.

---

## Medio

Problemas que no impiden completar el recorrido principal.

Podrán evaluarse individualmente para determinar si bloquean lanzamiento.

---

## Bajo

Problemas principalmente visuales o de conveniencia sin impacto relevante en el negocio.

Podrán incorporarse posteriormente al backlog.

---

# 87. Pruebas obligatorias de aceptación del MVP

Antes de declarar terminado el desarrollo, deberán superarse como mínimo los siguientes cuatro escenarios.

## Escenario A — Evento gratuito

```text
Administrador crea
→ Publica
→ Persona se inscribe sin cuenta
→ Queda confirmada
→ Administración la encuentra
→ Marca asistencia
→ Emite certificado
→ Persona descarga sin cuenta
```

**Resultado esperado: APROBADO**

---

## Escenario B — Evento con costo

```text
Administrador crea
→ Publica
→ Persona se preinscribe
→ Queda pending
→ CCI verifica externamente
→ Administrador confirma
→ Registra asistencia
→ Emite certificado
→ Persona descarga
```

**Resultado esperado: APROBADO**

---

## Escenario C — Curso gratuito

```text
Administrador crea
→ Publica
→ Usuario se registra/login
→ Se matricula gratuitamente
→ Accede al Campus
→ Visualiza videos
→ Se registra progreso
→ Completa >= 90 %
→ Aprueba quizzes >= 80 %
→ Curso se completa
→ Certificado automático
→ Valora
```

**Resultado esperado: APROBADO**

---

## Escenario D — Curso con costo

```text
Administrador crea
→ Publica
→ Alumno tiene cuenta
→ CCI valida externamente
→ Administrador habilita
→ Alumno accede
→ Completa contenido
→ Aprueba evaluaciones
→ Curso completed
→ Certificado automático
→ Valoración
```

**Resultado esperado: APROBADO**

---

# 88. Criterio final de aceptación

El MVP no deberá considerarse terminado simplemente porque:

- todas las páginas existen;
- todas las tablas existen;
- el código compila;
- cada desarrollador terminó sus tareas.

Se considerará terminado cuando los recorridos completos puedan ejecutarse correctamente desde la interfaz hasta PostgreSQL y regresar al usuario con el resultado esperado.

La validación final será:

```text
REQUERIMIENTO
      ↓
INTERFAZ
      ↓
VALIDACIÓN
      ↓
SUPABASE
      ↓
POSTGRESQL / RPC
      ↓
RLS
      ↓
RESULTADO
      ↓
USUARIO
```

Todas las capas deberán trabajar de forma integrada.

---

# 89. Resultado final esperado del Hito 12

Al finalizar este hito, la Cámara de Comercio de Ica deberá disponer de un MVP productivo capaz de soportar los dos grandes dominios del proyecto.

## Eventos y capacitaciones

```text
ADMIN
  │
  ▼
Crear actividad
  │
  ▼
Publicar
  │
  ▼
VISITANTE
  │
  ▼
Inscripción sin login
  │
  ▼
Confirmación / Preinscripción
  │
  ▼
Gestión administrativa
  │
  ▼
Asistencia
  │
  ▼
Certificado
  │
  ▼
Descarga sin cuenta
```

## Campus Virtual

```text
ADMIN
  │
  ▼
Crear curso
  │
  ├── Módulos
  ├── Clases
  ├── Videos
  ├── Materiales
  └── Quizzes
  │
  ▼
Publicar / Habilitar
  │
  ▼
ALUMNO
  │
  ▼
Login
  │
  ▼
Mis cursos
  │
  ▼
Clases >= 90 %
  │
  ▼
Quizzes >= 80 %
  │
  ▼
Curso completado
  │
  ▼
Certificado automático
  │
  ▼
Valoración
```

Todo el sistema estará protegido mediante:

```text
Supabase Auth
+
Roles
+
RLS
+
Storage Policies
+
Constraints
+
RPC
+
Validaciones
```

El **Hito 12 quedará aprobado cuando el MVP pueda utilizarse en condiciones reales sin requerir intervención técnica directa en la base de datos para ejecutar los procesos normales del negocio**.

Con la aprobación de este hito quedan completados los **12 hitos de implementación del MVP** de la Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica.