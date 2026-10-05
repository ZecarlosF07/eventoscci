# SEO e indexación pública

## Objetivo

La plataforma posiciona su agenda empresarial presencial en Ica, Perú, y su oferta virtual para usuarios de todo el país y visitantes hispanohablantes. Todo el contenido se publica únicamente en español (`es-PE`).

## Política de indexación

- Se indexan inicio, catálogos, consulta general de certificados, cursos publicados y actividades publicadas o finalizadas.
- Las actividades canceladas continúan accesibles, pero usan `noindex, follow`.
- Las actividades archivadas o eliminadas no son públicas y responden como no encontradas.
- Búsquedas internas, autenticación, inscripciones, administración, campus y certificados con token no se indexan.
- `/sitemap.xml` incluye únicamente URLs canónicas que pueden aparecer en buscadores.
- `/robots.txt` anuncia el sitemap y bloquea las áreas privadas; las páginas públicas con `noindex` permanecen rastreables para que los buscadores lean esa directiva.

## Datos estructurados

- Inicio: `Organization` y `WebSite`.
- Catálogos y detalles: `BreadcrumbList`.
- Eventos y capacitaciones: `Event`, con fechas, modalidad, ubicación real y organizador. Se omite `eventStatus` para el estado interno `finished`: no existe `EventCompleted` en Schema.org. Las fechas pasadas describen el evento realizado.
- Las ofertas solo se publican dentro del período de inscripción de actividades vigentes. En eventos se consulta disponibilidad para distinguir cupos agotados de cierre administrativo; el precio y fin de preventa se calculan con el instante del servidor.
- La experiencia enriquecida de eventos de Google requiere eventos abiertos al público y con componente presencial. El marcado semántico de eventos exclusivos o totalmente virtuales no implica elegibilidad para esa experiencia.
- Cursos: `Course`; el catálogo añade `ItemList` desde tres cursos publicados.

Los datos JSON-LD se generan desde la información pública existente. No deben incluir enlaces privados de videoconferencia, datos de participantes ni tokens de certificados.

## Configuración y publicación

1. Configurar `NEXT_PUBLIC_SITE_URL` con `https://eventosycursos.camaraica.org.pe`.
2. Si Google Search Console entrega una etiqueta de verificación, guardar su contenido en `GOOGLE_SITE_VERIFICATION`.
3. Desplegar y comprobar `/robots.txt` y `/sitemap.xml`.
4. Validar una actividad presencial, una virtual y un curso con Rich Results Test.
5. Enviar `/sitemap.xml` desde Search Console y solicitar indexación de inicio y los tres catálogos.

Los cambios de indexación pueden tardar varios días. Search Console debe revisarse periódicamente para detectar URLs excluidas, errores de datos estructurados y métricas web esenciales.

## Caché, sesión e invalidación

- Inicio, detalles públicos, categorías, temarios y sitemap consultan Supabase con un cliente anónimo sin cookies.
- El contenido público usa caché de datos por 15 minutos. Disponibilidad y recomendaciones usan 30 segundos porque dependen de cupos y fechas.
- La cabecera obtiene la cuenta después de la hidratación mediante `/api/account`; esa respuesta es privada y `no-store`, por lo que no vuelve personal el HTML público.
- El detalle público del curso consulta la matrícula mediante `/api/courses/[courseId]/access`, también privado y `no-store`.
- Guardar, publicar, archivar o eliminar actividades, cursos y catálogos invalida las etiquetas públicas relacionadas y las rutas principales. Una inscripción invalida disponibilidad.
- El layout público y el sitemap usan `connection()` para renderizar por solicitud. No se conserva una segunda copia estática del HTML ni se enumeran slugs durante el build; la caché de datos etiquetada mantiene el rendimiento.
- El cliente anónimo de Supabase usa `fetch` con `cache: "no-store"`; el único dueño de la caché es cada consulta etiquetada. `updateTag` expira sus resultados inmediatamente tras una escritura exitosa, incluso si la asociación de imágenes falla después.
- La invalidación de layouts utiliza las rutas internas con el grupo `/(public)` e incluye ambos catálogos de actividades, detalles e inscripción, búsqueda y sitemap.
- Al sustituir banners o quitar páginas del programa se conserva el archivo publicado anterior en Storage para no romper pestañas abiertas ni URLs de imágenes cacheadas. No hay borrado automático de estos archivos históricos; cualquier futura limpieza requiere una política de retención y comprobar referencias. Las cargas fallidas se siguen limpiando.
- Las imágenes optimizadas con `next/image` usan `images.minimumCacheTTL` de 30 días (2.592.000 segundos). La vigencia efectiva considera también el encabezado del archivo original, tomando el mayor plazo. Sustituir un banner o una página del programa genera una URL nueva, por lo que la caché larga de la versión anterior no retrasa la actualización del contenido.

## Catálogos y URLs

- Eventos, capacitaciones y cursos muestran 12 resultados por página.
- `?pagina=N` genera una URL canónica propia y rastreable cuando no existen otros filtros.
- Búsquedas y combinaciones de filtros mantienen el canonical del catálogo y usan `noindex, follow`.
- Los slugs generados automáticamente para contenido nuevo se limitan a 96 caracteres y no modifican URLs históricas.
- Si se cambia manualmente un slug publicado en el futuro, debe añadirse una redirección permanente desde la URL anterior.

## Rendimiento y accesibilidad

- El hero rota automáticamente después del primer intervalo, conserva navegación manual anterior/siguiente, se detiene durante la interacción por puntero o teclado y desactiva la rotación cuando el dispositivo solicita movimiento reducido.
- Únicamente el primer banner se precarga; las imágenes conservan una relación de aspecto estable y texto alternativo descriptivo.
- El video del Campus usa `preload="none"`, reproducción automática silenciada al entrar en el viewport y un poster WebP. El MP4 no debe descargarse durante la carga inicial.
- Cada página indexable presenta un `h1` visible. Los títulos de tarjetas también están disponibles con teclado y en dispositivos sin hover.

## Analítica opcional y privacidad

Configurar `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX` únicamente después de aprobar Google Analytics. Sin esa variable no se carga ningún script.

Se miden vistas de página, vistas de contenido y el embudo `registration_cta_clicked` → `registration_started` → `registration_completed`. La capa de seguridad solo permite identificador/tipo de actividad, tipo de contenido, gratuidad y tipo de inscripción. No admite nombres, DNI/CE, RUC, correo, teléfono, tokens ni términos de búsqueda.

## Pendientes operativos del Hito 13

- repetir Lighthouse móvil y escritorio después del despliegue y conservar el informe antes/después;
- validar una actividad presencial, una híbrida y un curso en Rich Results Test;
- revisar Core Web Vitals y consultas reales cuando Search Console acumule datos;
- configurar la analítica aprobada y comprobar eventos en producción;
- añadir enlaces desde `camaraica.org.pe`, perfiles oficiales y aliados hacia las URLs canónicas;
- ejecutar revisión manual en móvil, tableta, Chromium y Safari/WebKit.

La especificación y Definition of Done se mantienen en `docs/hitos/HITO 13 — OPTIMIZACIÓN SEO, RENDIMIENTO Y ALCANCE ORGÁNICO.md`. Las dependencias externas no se consideran completadas por la implementación local.

## Inicio, agenda e historial de eventos (2026-10-05)

- Inicio tiene el H1 permanente «Eventos, capacitaciones y cursos en Ica, Perú», una introducción institucional y enlaces HTML a eventos, capacitaciones y cursos. «Próximos eventos» es H2. Los banners y la búsqueda conservan su recorrido visual.
- `/eventos` responde a búsquedas de agenda local, con el título SEO «Eventos en Ica: agenda y próximos encuentros» y contenido explicativo visible incluso cuando la agenda está vacía.
- La agenda de eventos muestra actividades publicadas o canceladas con alguna sesión pendiente o en curso. Los avisos de cancelación se conservan; sus detalles siguen siendo `noindex`.
- El catálogo muestra hasta seis realizados y enlaza a `/eventos/realizados`. El historial muestra doce por página, del fin real más reciente al más antiguo, sin límite de antigüedad.
- Solo entran al historial eventos publicados o finalizados, listados, no eliminados y cuya última sesión activa terminó. Borradores, cancelados, archivados, ocultos y capacitaciones quedan fuera. Un evento sin fechas activas no entra en ninguna lista.
- `get_public_event_page` es una RPC de lectura `security invoker`: agrupa sesiones, aplica filtros y pagina bajo RLS. Devuelve IDs ordenados y total; la consulta pública carga únicamente las fichas de esa página. Las categorías, modalidad, precio, fecha desde y búsqueda conservan sus filtros. La fecha desde compara el día de inicio en Lima.
- El slug `realizados` está reservado para eventos en la validación administrativa y en PostgreSQL. No se cambian slugs existentes ni se rellenan datos históricos.
- Historial y su paginación sin filtros son indexables, con canonical propio y breadcrumbs. Filtros y búsquedas son `noindex, follow`, con canonical del historial. Una página fuera de rango responde 404. El sitemap añade la ruta principal del historial; la paginación se descubre mediante enlaces.
- El proxy valida páginas posteriores a la primera con una lectura anónima antes de comenzar el streaming y reutiliza la pantalla 404 existente. Así se evita devolver HTTP 200 para páginas inexistentes. La ruta principal no añade esta consulta y las rutas privadas conservan su control de sesión.
- Las nuevas consultas usan la caché de actividades de 15 minutos y su invalidación por etiquetas. Guardar cambios administrativos invalida también el historial. El paso de agenda a historial por fecha puede reflejarse tras hasta 15 minutos; el bloqueo de inscripción existente se valida independientemente en servidor y SQL.
- En administración de eventos, «Programa en texto» complementa las imágenes. La ficha muestra programa y temario existentes también cuando tiene imágenes. No se deduce ni inventa texto a partir del banner.
- Las fichas de eventos muestran la dirección del lugar aunque falte un mapa válido; el JSON-LD no sustituye una ubicación desconocida por la sede institucional. Las fechas finales consideran todas las sesiones activas.
- El contenido, las rutas y el catálogo de capacitaciones se conservan. Las correcciones de vocabulario y fechas de JSON-LD se comparten para mantener datos estructurados válidos.
- `performer` incluye exclusivamente los ponentes vinculados a la actividad, tanto en el evento como en sus sesiones. El aviso de Search Console «Falta el campo performer» corresponde a una propiedad recomendada; si no hay ponentes registrados, se omite y puede permanecer la advertencia. No se usa el organizador como sustituto ni se inventan nombres. La captura recibida el 5 de octubre muestra un aviso del 26 de septiembre y no permite identificar las URLs afectadas; revisarlas en el informe de Eventos y validar después de publicar.

### Contenido editorial al publicar un evento

Escribir una descripción propia que explique qué se abordará, completar objetivo y público cuando corresponda y publicar el programa en texto con los datos reales. Confirmar lugar, fechas y condiciones de inscripción. Evitar que toda la información quede únicamente en imágenes y evitar repetir palabras clave artificialmente. No cambiar URLs publicadas para añadir palabras clave.

### Enlaces preparados para responsables de otros canales

Incorporar en la web institucional un enlace rastreable `<a href="https://eventosycursos.camaraica.org.pe/eventos">Agenda de eventos en Ica</a>` y otro al portal `<a href="https://eventosycursos.camaraica.org.pe/">Eventos, capacitaciones y cursos de la Cámara de Comercio de Ica</a>`. En publicaciones de una actividad, enlazar a su ficha canónica. Propuesta para redes: «Consulta la agenda de eventos de la Cámara de Comercio de Ica: fechas, lugares y requisitos de participación», con el enlace al catálogo. Estos enlaces están preparados; su publicación corresponde a los responsables de esos canales.

### Search Console y seguimiento después de publicar

1. Antes del despliegue, seleccionar la propiedad que incluye `eventosycursos.camaraica.org.pe` y exportar Rendimiento (tipo Web), últimos 28 días frente a los 28 anteriores. Registrar las fechas exactas de cobertura y filtros; comparar datos consolidados, no el día parcial.
2. Separar URL exacta de inicio, URL exacta `/eventos` y prefijo `/eventos/` para fichas. Tras publicar, excluir `/eventos/realizados` del grupo de fichas y medir el historial aparte. Registrar clics, impresiones, CTR, posición media, consultas y dispositivos; guardar capacitaciones como referencia de regresión.
3. Inspeccionar inicio y catálogo para registrar indexación y canonical elegido por Google. Tras el despliegue, inspeccionar también el historial, comprobar sitemap y solicitar indexación de esas tres páginas.
4. Validar una ficha de evento público presencial vigente en Rich Results Test. Los eventos exclusivos o totalmente virtuales no son candidatos a la experiencia enriquecida; no publicar ubicaciones ni disponibilidad falsas para volverlos elegibles.
5. A los 28 y 56 días desde el despliegue, repetir los mismos filtros y revisar consultas como «eventos en Ica», «agenda de eventos en Ica» y búsquedas de la Cámara. Separar crecimiento de impresiones de mejora de CTR y posición, considerando la cantidad de eventos publicados y estacionalidad.

La publicación del frontend, los cambios en canales externos y el seguimiento futuro no quedan completados por una validación local. No se crea una automatización de seguimiento mientras no se conozca la fecha de despliegue.
