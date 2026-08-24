# Seguridad, RLS y control de acceso

Esta es la matriz efectiva del MVP después del Hito 11. La autorización se resuelve con
`auth.uid() → user_accounts → people`, y una cuenta solo es operativa cuando la cuenta y la
persona vinculada permanecen activas.

## Matriz de acceso

| Dominio | Visitante | Student | Operator | Administrator |
|---|---|---|---|---|
| Categorías | Lee activas | Lee activas | Lee y gestiona | Lee y gestiona |
| Expositores | Lee solo los vinculados a publicaciones | Igual que visitante | Lee y gestiona | Lee y gestiona |
| Actividades, fechas y expositores | Lee publicadas, finalizadas o canceladas | Igual que visitante | Gestión operativa | Gestión operativa |
| Personas | Sin acceso | Lee y edita su ficha mediante RPC | Lee participantes y actualiza mediante RPC | Igual que operator |
| Inscripciones | Crea mediante `register_activity()` y consulta un resultado por código | Sin listado general | Consulta, confirma y cancela | Igual que operator |
| Asistencia | Sin acceso | Sin acceso | Consulta y registra | Igual que operator |
| Cursos e instructores | Lee publicados | Lee catálogo publicado | Gestión operativa | Gestión operativa |
| Módulos comerciales | Lee los publicados de cursos publicados | Igual y accede al contenido matriculado | Gestión operativa | Gestión operativa |
| Clases y materiales | Sin acceso | Solo con matrícula activa o completada | Gestión operativa | Gestión operativa |
| Matrículas | Sin acceso | Lee únicamente las propias; alta gratuita por RPC | Consulta, concede y revoca por RPC | Igual que operator |
| Progreso | Sin acceso | Lee el propio y actualiza por RPC | Consulta | Consulta |
| Quizzes y preguntas | Sin acceso directo | RPC sin `is_correct`, solo cursos matriculados | Gestión por RPC | Gestión por RPC |
| Intentos y respuestas | Sin acceso directo | RPC limitada a sus intentos | Consulta administrativa mediante RPC prevista | Igual que operator |
| Certificados | Consulta por token aleatorio válido | RPC propia y archivo propio/por token | Emite, consulta y revoca | Igual que operator |
| Plantillas y firmantes | Sin acceso | Sin acceso | Gestión compartida en el MVP | Gestión compartida en el MVP |
| Valoraciones | Sin acceso | RPC propia tras completar el curso | Sin escritura directa | Sin escritura directa |
| Notificaciones | Sin acceso | Sin acceso | Consulta y reintento; proceso con secreto/service role | Igual que operator |
| Auditoría | Sin acceso | Sin acceso | Sin acceso | Solo lectura |

La diferencia entre `operator` y `administrator` se mantiene deliberadamente simple: ambos
gestionan el alcance operativo actual, mientras que la auditoría queda reservada al
`administrator`. La futura administración de usuarios y configuración deberá usar también
`is_administrator()`.

## Reglas de implementación

- `current_person_id()` y `current_user_role()` devuelven `NULL` para cuentas o personas
  inactivas/eliminadas.
- `is_internal_user()` reconoce `operator`, `administrator` y procesos confiables con
  `service_role`; `is_administrator()` reserva operaciones institucionales sensibles.
- La fila propia de `user_accounts` sigue siendo legible para detectar y comunicar una cuenta
  inactiva, pero no permite escritura ni habilita acceso a la persona o al Campus.
- Las tablas de quizzes y valoraciones no conceden acceso directo al cliente. Sus operaciones
  pasan por RPC con validación de ownership y estado académico.
- Las RPC se revocan por defecto para `public`, `anon` y `authenticated`, y luego se concede una
  lista explícita. Las funciones futuras tampoco heredan `EXECUTE` público.
- `service_role` está encapsulado en módulos `server-only` y solo se usa para generación de
  certificados y procesamiento de notificaciones.

## Storage

| Bucket | Tipo | Lectura | Escritura |
|---|---|---|---|
| `activity-images` | Público | Visitantes y autenticados | Usuarios internos |
| `course-banners` | Público | Visitantes y autenticados | Usuarios internos |
| `course-materials` | Privado | Matrícula válida y coincidencia con `course_materials.storage_path` | Usuarios internos |
| `course-videos` | Privado | Matrícula válida y coincidencia con una clase publicada | Usuarios internos |
| `certificates` | Privado | Internos, dueño del certificado emitido o backend por token | Usuarios internos/backend |

Los enlaces firmados duran diez minutos para materiales, una hora para videos y un minuto para
descargas públicas de certificados. El token público no concede listado ni acceso a otro archivo.

## Route Handlers revisados

- La exportación CSV verifica una cuenta interna activa.
- La generación de certificados de curso valida UUID, sesión y ownership antes de usar
  `service_role`.
- La entrega de notificaciones usa `N8N_WEBHOOK_SECRET` exclusivamente en el servidor.
- Las descargas de materiales dependen de RLS y matrícula; las de certificados resuelven un único
  archivo mediante token y generan una URL temporal.
- Los callbacks de autenticación limitan redirecciones a rutas internas seguras.

## Criterio para nuevas funcionalidades

Toda nueva tabla expuesta deberá habilitar RLS en su misma migración. Toda nueva Server Action o
Route Handler debe volver a validar identidad, rol, input y ownership aunque la página esté
protegida. Toda nueva función se considera no ejecutable por clientes hasta incluirla de forma
explícita en la lista de permisos.
