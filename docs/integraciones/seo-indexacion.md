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
