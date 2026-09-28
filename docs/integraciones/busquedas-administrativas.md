# Búsquedas automáticas y filtros del administrador

## Recorrido y límites

Los buscadores administrativos aplican el texto 350 ms después de dejar de escribir. Enter adelanta la consulta; selectores, checkbox y fechas completas se aplican inmediatamente usando todos los controles actuales. Se usa `router.replace` sin desplazamiento, no recarga completa ni una entrada de historial por letra. Los controles se sincronizan con enlaces guardados y navegación atrás/adelante; una navegación histórica cancela el texto pendiente de debounce.

No se modifican el header, las búsquedas públicas ni las reglas de participación, pagos, pases, asistencia o certificados de los Hitos 14–16. Los formularios de operaciones mantienen sus botones de guardar; únicamente se retiran los botones de envío de filtros.

`features/admin-filters` concentra el formulario, el hook, las utilidades de URL, resultados pendientes, exportaciones y selección/borradores en memoria. Los tipos se mantienen separados y los componentes usan Tailwind. Las consultas se resuelven en servidor antes de paginar; los catálogos continúan siendo búsquedas locales inmediatas.

## Criterios por módulo

- Eventos/capacitaciones: título, estado, visibilidad listada/no listada en «Más filtros»; conservar contexto activo/archivado.
- Cursos: título y estado, también conservados al paginar; búsqueda automática de personas para matrícula por nombre completo y datos personales.
- Participación: periodo independiente de «Solo con pagos pendientes». Este último considera participación y certificados; sus contadores siguen separados. `periodo=payments` redirige a `periodo=all&pagos=1` conservando parámetros compatibles. No cambian las fechas del catálogo público.
- Inscripciones: estado, público y perfil profesional/estudiante independientes; certificados en «Más filtros». «Pendientes de confirmación» no significa necesariamente pago pendiente. Las combinaciones incompatibles se explican junto a los filtros.
- Directorio: datos personales, nombre completo, empresa, RUC, institución y carrera; perfil profesional/estudiante.
- Pagos: filtros de participación y certificados diferenciados. La búsqueda compartida y «Limpiar» reinician ambas páginas; el estado de certificado solo reinicia su sección. Los detalles abiertos permanecen seleccionados y se avisa cuando quedan fuera de los resultados. Completada significa sin saldo, no necesariamente un pago registrado: importes validados, historial sin referencia y cortesías continúan separados.
- Asistencia: confirmadas como valor inicial, estado, tipo, asistencia y nombre completo/documento/correo/celular/código.
- Certificados: candidatos Todos/Listos para emitir/Emitidos/Revocados, con elegibilidad real antes de paginar. El filtro no selecciona personas automáticamente.
- Notificaciones: correo, todos los estados operativos y tipo de notificación.
- Padrón: empresas activas, búsqueda por RUC/razón social y páginas de 50. El contador de la importación sigue reflejando todo el padrón, no los resultados de búsqueda. No cambia la importación ni su reemplazo.
- Catálogos: búsqueda local y activos/inactivos, con URL sincronizada mediante `history.replaceState` sin consultar de nuevo el servidor. Sugerencias: mismos criterios, ahora automáticos, conservados al exportar.

## Actualización, errores y exportaciones

«Actualizando resultados…» marca los anteriores como pendientes con `aria-busy` y menor opacidad; «Resultados actualizados» anuncia el conteo cuando está disponible. «Más filtros» indica cuántos secundarios están activos y se abre cuando corresponde. El resumen permite quitar filtros, y «Limpiar filtros» respeta valores predeterminados y contexto. Las fechas incompletas/inexistentes y rangos invertidos no se envían; se informa el problema y se marca el control para tecnologías de asistencia.

Next.js gestiona la sustitución de navegaciones concurrentes: no se introducen peticiones fetch paralelas independientes que puedan sobrescribir la última navegación. El hook evita enviar de nuevo una URL idéntica y captura todos los controles al ejecutar, no solamente el valor que inició el debounce. Ante un error de consulta, el error boundary administrativo no presenta datos antiguos como vigentes y ofrece «Reintentar».

Las exportaciones se bloquean mientras hay filtros pendientes o inválidos. Inscripciones y Sugerencias usan los mismos criterios que sus listados. Pagos añade `/admin/inscripciones/[activityId]/pagos/exportar`: una fila por solicitud individual/grupal con filtros aplicados, importes validados, saldo, cortesías e historial separados. Se exportan lotes de 100 hasta 5.000; superar el límite genera un error, no una truncación silenciosa. La antigua ruta de CSV grupal se conserva para compatibilidad. Las celdas CSV neutralizan fórmulas, incluidas las precedidas por espacios.

## Selecciones y borradores

Asistencia y candidatos conservan la selección entre filtros/páginas de la misma actividad. Se muestran total, visibles y fuera de la vista, con revisión de nombres, quitar y limpiar. Una operación masiva con seleccionados ocultos requiere confirmación explícita. No se selecciona automáticamente al filtrar.

La selección y las notas se mantienen solo en memoria; no se escriben en URL, almacenamiento local ni analítica. Al salir de la pantalla o cambiar de actividad se desmonta su workspace. Los IDs completos llegan al servidor: valida permiso, UUID, límite y pertenencia a la actividad; PostgreSQL vuelve a comprobar estado y elegibilidad. Límites existentes: 500 para asistencia y 100 para emisión, con rechazo explícito si se exceden. Asistencia sigue siendo atómica; emisión conserva su procesamiento parcial, retira únicamente los emitidos/ya existentes y mantiene identificados los rechazados o fallidos. No se envían correos de prueba en esta revisión.

## Persistencia y despliegue

- `202609280004_admin_dynamic_filters.sql`: búsqueda contextual generada en `people`, vista de inscripciones `security_invoker` y RPC `get_activity_certificate_candidates_filtered` con estado, conteos, paginación y permisos. La RPC anterior permanece compatible.
- `202609280005_admin_filter_literal_search.sql`: corrección de escape SQL literal, validación de estado nulo y búsqueda literal de títulos en resúmenes de certificados.

Ambas migraciones se revisaron mediante `supabase db push --linked --dry-run` y se aplicaron **sin seeds**. Se regeneraron tipos con `yarn types:db:linked`; el dry-run final confirmó la base al día. `%`, `_` y la barra invertida se tratan como texto en los patrones; las búsquedas por nombre completo no se limitan a las personas de la página descargada.

## Evidencia y pruebas pendientes

La matriz de aceptación registra las pruebas ejecutadas y las pendientes por separado. Se verificaron en la sesión administrativa local búsqueda combinada, Enter, limpieza, conservación de foco/texto, consulta de inscripciones con la vista nueva y selección/nota de asistencia conservadas al dejar al participante fuera de los resultados. No se guardaron cambios de asistencia ni se validaron pagos reales.

La comprobación de confirmación masiva encontró un bloqueo del navegador de automatización; se solicitó cancelar el aviso. La revisión completa de 390/768/1440, atrás/adelante, errores/red lenta y concurrencia real sigue pendiente hasta completarse y registrarse. Las pruebas unitarias/SQL no sustituyen esas comprobaciones ni constituyen un despliegue del frontend a producción.
