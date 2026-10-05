# Entrega SEO de inicio y eventos — 05/10/2026

## Cambios incluidos

Inicio incorpora un H1 permanente y accesos a los catálogos. Eventos mantiene su H1 y adopta el título SEO «Eventos en Ica: agenda y próximos encuentros», con contenido visible aunque no haya agenda próxima. El catálogo muestra hasta seis realizados y enlaza al historial público, paginado de doce en doce y ordenado en PostgreSQL por el fin de todas las sesiones activas.

Se conservan las URLs de las fichas, los banners y animaciones. Los realizados presentan «Ver detalles» y mantienen cerrado el registro. El historial tiene canonical, breadcrumbs, sitemap y filtros `noindex, follow`. Las páginas inexistentes devuelven HTTP 404 antes del streaming. El slug `realizados` queda reservado para eventos.

El programa de eventos puede publicarse también en texto. Las fichas mantienen dirección legible sin depender del mapa. JSON-LD retira `EventCompleted`, ofertas vencidas y ubicaciones supuestas; considera preventa, cupos y todas las sesiones. Los ponentes reales aparecen en `performer` del evento y sus sesiones. La falta de ponentes puede conservar la advertencia no crítica de Google; no se inventan participantes.

En la ficha pública local compilada de «A Otro Nivel» se comprobó que actualmente no aparecen ponentes y se omite `performer`. Deben vincularse sus ponentes reales desde la edición administrativa si se desea completar esa propiedad. Esto no identifica las URLs del correo de Search Console: el aviso debe revisarse en su informe.

## Base de datos

Migración `202610050001_public_event_history.sql` aplicada al proyecto vinculado de Supabase, después de comprobar que no había un evento con el slug reservado. Tipos regenerados con `yarn types:db:linked`. La RPC pública es de lectura y `security invoker`, respetando RLS. No se aplicaron seeds ni se rellenaron históricos.

Las pruebas SQL `039_public_event_history_test.sql` y `019_activity_public_lifecycle_test.sql` finalizaron correctamente: 20 comprobaciones de consulta/paginación/exclusión y 4 de bloqueo por ciclo de vida. Los fixtures se ejecutaron en transacciones con rollback.

## Verificación local

- 243 pruebas unitarias aprobadas, incluidas normalización de argumentos, fechas, preventa, ponentes, renderizado del programa y regresión de capacitaciones.
- Revisión visual en anchos de 375, 768 y 1440 px: sin desbordamiento horizontal, un H1, un elemento principal y controles accesibles con teclado. Se conservan los banners y la búsqueda.
- `yarn lint`, `yarn typecheck` y `yarn build` aprobados mediante `yarn release:check`. Se detuvo el servidor de desarrollo durante el cierre para evitar escrituras simultáneas en los tipos generados de `.next`.
- Cinco pruebas HTTP/HTML aprobadas contra la compilación de producción: H1/H2 y canonical de inicio, catálogo e historial, breadcrumbs, ausencia de Event en catálogos, filtros y cero resultados, 404 fuera de rango, sitemap y metadatos de capacitaciones.

## Medición de laboratorio

Lighthouse 13.5.0, perfil móvil predeterminado, ejecutado el 05/10/2026. El frontend aún no está desplegado. «Antes» corresponde al sitio publicado; «local» corresponde a una compilación de producción con el cambio. Las condiciones de origen, red y caché son diferentes, por lo que esta tabla no demuestra una mejora o regresión en producción.

| Página y entorno | Rendimiento | SEO técnico | LCP | CLS |
|---|---:|---:|---:|---:|
| Inicio publicado, antes | 81 | 100 | 2,85 s | 0 |
| Eventos publicado, antes | 66 | 100 | 2,81 s | 0 |
| Eventos, compilación local | 86 | 100 | 3,95 s | 0 |
| Inicio, compilación local | 88 | 100 | 3,65 s | 0 |

La medición de eventos publicada advirtió que la CPU del equipo era más lenta que la calibración esperada. SEO 100 en Lighthouse es una comprobación técnica; no mide la posición en Google ni sustituye Search Console. Repetir las mediciones sobre el mismo origen publicado después del despliegue.

## Pendientes externos

La publicación del frontend corresponde al usuario. El cambio de perfil de Chrome dejó desconectada la integración del navegador, por lo que no se registraron todavía clics, impresiones, CTR, posición, consultas ni indexación de Search Console. La captura aportada muestra una advertencia sobre `performer` del 26/09/2026; no incluye las URLs afectadas ni el informe de rendimiento.

Antes de publicar, guardar últimos 28 días frente a los 28 anteriores en la propiedad del portal. Después, comprobar inicio, eventos e historial, sitemap y canonical; solicitar indexación y validar una ficha pública presencial con Rich Results Test. El aviso `performer` puede mantenerse en actividades sin ponentes registrados. Revisar las URLs afectadas antes de solicitar validación.

Los enlaces y textos para responsables de la web institucional y redes están preparados en [SEO e indexación](../integraciones/seo-indexacion.md), junto con el protocolo de comparación a los 28 y 56 días desde el despliegue. No se publicaron mensajes externos ni se configuraron automatizaciones.
