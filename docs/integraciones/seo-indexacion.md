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
- Eventos y capacitaciones: `Event`, con fechas, modalidad, ubicación, estado, precio y organizador.
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
- Las actividades y cursos presentes en el sitemap se prerenderizan; nuevos slugs pueden resolverse bajo demanda.

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
