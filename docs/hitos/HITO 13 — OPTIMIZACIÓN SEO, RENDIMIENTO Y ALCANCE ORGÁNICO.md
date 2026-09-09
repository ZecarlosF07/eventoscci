# HITO 13 — OPTIMIZACIÓN SEO, RENDIMIENTO Y ALCANCE ORGÁNICO

## Plataforma Digital de Eventos, Capacitaciones y Cursos  
**Cámara de Comercio de Ica**

---

# 1. Descripción del hito

El Hito 13 constituye una evolución posterior a la publicación del MVP. Su propósito es transformar la base de SEO técnico ya implementada en una plataforma con mejores condiciones de descubrimiento, carga, comprensión y conversión orgánica.

Antes de iniciar este hito, la plataforma ya dispone de:

- dominio productivo con HTTPS;
- contenido público en español `es-PE`;
- metadata diferenciada por ruta;
- URLs canónicas;
- Open Graph y Twitter Cards;
- `/robots.txt`;
- `/sitemap.xml` dinámico;
- políticas de indexación para contenido público y privado;
- datos estructurados `Organization`, `WebSite`, `BreadcrumbList`, `Event`, `Course` e `ItemList`;
- verificación de la propiedad en Google Search Console;
- sitemap enviado a Google Search Console.

Este hito no deberá repetir esa implementación. Deberá optimizarla a partir de evidencia de producción y preparar el portal para crecer sin degradar su experiencia ni su rastreabilidad.

El alcance geográfico continuará siendo:

```text
Ica, Perú
  +
usuarios de todo el Perú
  +
visitantes extranjeros hispanohablantes interesados en actividades en Ica
```

No se incorporarán traducciones al inglés en este hito.

---

# 2. Objetivo del hito

Mejorar el alcance orgánico de la plataforma mediante:

- reducción de los tiempos de carga de las páginas públicas;
- contenido inicial cacheable y rastreable;
- títulos y contexto visibles para personas y buscadores;
- datos estructurados fieles a la actividad publicada;
- mayor precisión de la ubicación `Ica, Perú`;
- mejor descubrimiento de imágenes y banners;
- arquitectura preparada para cientos o miles de actividades;
- medición del tráfico orgánico y de las inscripciones obtenidas;
- enlaces institucionales y de aliados hacia las URLs canónicas.

El resultado no deberá evaluarse únicamente mediante un puntaje automático. El hito deberá comprobar que el contenido es rápido, comprensible, indexable, útil y medible.

---

# 3. Línea base de la auditoría

La auditoría realizada el 9 de septiembre de 2026 registró la siguiente línea base móvil en producción:

| Página | Performance | Accesibilidad | Buenas prácticas | SEO | LCP aproximado |
|---|---:|---:|---:|---:|---:|
| Inicio | 52 | 100 | 100 | 100 | 7.5 s |
| Detalle de actividad | 58 | 98 | 100 | 92 | 7.4 s |
| Catálogo de cursos | 80 | 100 | 100 | 100 | 2.6 s |

También se detectó:

- aproximadamente 3.4 MB transferidos al cargar el inicio;
- un video del Campus de aproximadamente 2.18 MB;
- un poster del video de aproximadamente 865 KB;
- rotación automática del hero a los 6.5 segundos;
- páginas públicas servidas con `private, no-cache, no-store`;
- respuestas públicas sin aprovechamiento de caché CDN;
- títulos principales presentes únicamente como `sr-only` en determinadas vistas con banner;
- títulos de contenido destacado dependientes de hover en escritorio;
- ausencia de una integración de analítica de conversiones en el código;
- cuatro actividades y un curso incluidos en el sitemap al momento de la auditoría.

Las métricas de Lighthouse constituyen datos de laboratorio. Las métricas de campo deberán obtenerse posteriormente desde Search Console, CrUX o una integración de Web Vitals.

---

# 4. Principios de implementación

Durante el hito deberán respetarse los siguientes principios:

1. **Contenido para personas antes que repetición de palabras clave.**
2. **Una URL canónica por contenido institucional.**
3. **La ubicación deberá ser real y visible.**
4. **Los datos estructurados deberán representar lo que aparece en la página.**
5. **El contenido público no deberá depender innecesariamente de la sesión.**
6. **Las imágenes relevantes deberán conservar contexto textual y accesibilidad.**
7. **La medición no deberá capturar DNI, CE, correo, teléfono, nombre ni tokens.**
8. **La optimización no deberá romper inscripción, autenticación ni administración.**
9. **Los componentes interactivos deberán funcionar con mouse, teclado y pantalla táctil.**
10. **La solución deberá seguir las reglas de `.agents/rules.md`.**

La implementación deberá mantener:

- TypeScript estricto;
- componentes de máximo 170 líneas;
- interfaces y tipos en archivos separados;
- lógica SEO, de caché y medición en utilidades o servicios reutilizables;
- constantes centralizadas;
- estilos mediante Tailwind;
- manejo explícito de errores;
- uso de Server Components cuando no se requiera interacción;
- consulta de la documentación instalada de Next.js 16 antes de modificar renderizado, caché o metadata.

---

# 5. Alcance del hito

El Hito 13 comprende:

- optimización del hero público;
- optimización del video promocional del Campus;
- estrategia de caché para contenido público;
- revisión de consultas públicas y TTFB;
- títulos visibles y jerarquía semántica;
- accesibilidad de tarjetas y carruseles;
- textos alternativos y contexto de banners;
- revisión de datos estructurados de eventos;
- validación de fechas, sesiones, modalidad y sede;
- estrategia de URLs breves para contenido futuro;
- paginación pública rastreable;
- mejora del contenido visible en actividades y cursos;
- enlazado interno y externo institucional;
- medición de adquisición orgánica y conversión;
- monitoreo de Search Console y Core Web Vitals;
- pruebas responsive, accesibles y de regresión.

---

# 6. Fuera del alcance

No forman parte del Hito 13:

- traducción al inglés;
- rutas `/en`;
- `hreflang` para otros idiomas;
- páginas turísticas sin contenido institucional real;
- blog general;
- generación masiva de contenido con IA;
- compra de enlaces;
- repetición artificial de “eventos en Ica”;
- etiqueta `meta keywords`;
- cambio del dominio canónico;
- aplicación móvil;
- rediseño total del portal;
- migración obligatoria a un proveedor distinto de hosting;
- campañas pagadas de Google Ads o redes sociales;
- garantía de una posición específica en Google.

El posicionamiento dependerá también de competencia, demanda, antigüedad, enlaces y calidad editorial. El hito deberá mejorar las condiciones técnicas y de contenido, pero no prometer posiciones orgánicas.

---

# 7. Optimización del hero público

## 7.1 Evitar que el carrusel perjudique el LCP

El banner principal podrá rotar después del primer intervalo, una vez estabilizado el elemento LCP de la página.

Se deberá:

- iniciar la rotación después del primer intervalo, sin sustituir el banner durante la carga inicial;
- conservar controles anterior y siguiente;
- permitir navegación mediante teclado;
- mantener foco visible;
- informar la diapositiva activa mediante atributos accesibles;
- evitar timers activos cuando el carrusel no esté visible;
- conservar una altura estable para impedir cambios de layout.

Los carruseles de contenido ubicados debajo del primer viewport podrán mantener animaciones únicamente si no descargan recursos pesados anticipadamente y respetan `prefers-reduced-motion`.

## 7.2 Priorizar el primer banner

El primer banner visible deberá:

- estar presente en el HTML inicial;
- utilizar el mecanismo de prioridad recomendado por Next.js 16;
- declarar `sizes` acorde a los breakpoints reales;
- mantener dimensiones o relación de aspecto estable;
- evitar cargar en prioridad alta banners que todavía no se muestran;
- utilizar una imagen institucional optimizada cuando no exista banner.

La prioridad deberá aplicarse únicamente al recurso LCP esperado.

---

# 8. Optimización del video del Campus

El video promocional no deberá descargarse completamente durante la carga inicial del inicio cuando se encuentre fuera del primer viewport.

Se deberá implementar una estrategia de carga diferida:

```text
Poster liviano
→ usuario acerca el contenido al viewport o solicita reproducir
→ se prepara el reproductor
→ se descarga el video
```

Como mínimo:

- retirar el autoplay que provoca la descarga inmediata;
- conservar controles comprensibles;
- usar un poster WebP o AVIF optimizado;
- mantener dimensiones estables;
- ofrecer una acción de reproducción accesible;
- evitar reproducción automática cuando `prefers-reduced-motion` esté activo;
- verificar que el contenido continúe funcionando sin JavaScript avanzado cuando resulte razonable.

El poster optimizado deberá buscar un equilibrio entre calidad visual y peso. No se deberá degradar el material institucional hasta hacerlo ilegible.

---

# 9. Caché y renderizado del contenido público

## 9.1 Separar contenido público de sesión

Las páginas públicas no deberán convertirse completamente en dinámicas solo para mostrar el estado de la cuenta en el encabezado.

Se deberá revisar la composición para separar:

```text
Contenido público cacheable
├── actividades
├── cursos
├── sedes
├── banners
└── metadata

Estado personalizado
├── sesión
├── nombre del usuario
└── acceso administrativo o Campus
```

La solución deberá seguir las APIs vigentes de Next.js 16. No se deberán asumir comportamientos de versiones anteriores.

## 9.2 Estrategia de revalidación

Se deberá definir una política explícita para:

- inicio;
- catálogos;
- detalles de actividades;
- detalles de cursos;
- sitemap;
- datos auxiliares públicos.

Cuando una actividad o curso sea creado, editado, publicado, cancelado, finalizado o archivado, se deberá invalidar la información pública relacionada sin esperar indefinidamente una expiración temporal.

La caché nunca deberá incluir:

- datos de participantes;
- sesión de usuario;
- enlaces privados;
- certificados con token;
- contenido del Campus;
- información administrativa.

## 9.3 Consultas públicas

Las consultas deberán:

- seleccionar únicamente las columnas necesarias;
- evitar relaciones N+1;
- conservar filtros de `deleted_at` y estado;
- mantener el orden determinista;
- disponer de índices para filtros frecuentes;
- fallar con estados públicos comprensibles sin exponer mensajes SQL.

---

# 10. Semántica y contenido visible

## 10.1 Título principal

Cada página pública indexable deberá tener un único propósito y un título principal claramente identificable.

Cuando exista un banner que ya contiene texto gráfico:

- no se superpondrá nuevamente el título sobre la imagen;
- se mostrará un H1 visible inmediatamente después del hero o dentro de un bloque textual relacionado;
- se mostrará junto al título el contexto mínimo útil: fecha, modalidad y ubicación cuando corresponda.

Ejemplo:

```text
La corrupción como fenómeno multidimensional
17 de septiembre de 2026 · Presencial · Ica, Perú
```

## 10.2 Jerarquía de encabezados

Se deberá revisar:

- un H1 por vista indexable;
- H2 para secciones principales;
- H3 únicamente dentro de una sección encabezada por H2;
- ausencia de encabezados usados solo por tamaño visual;
- títulos comprensibles sin depender del banner.

## 10.3 Tarjetas y hover

La tarjeta completa podrá continuar siendo un enlace.

La animación que revela información al pasar el mouse podrá conservarse, pero:

- el nombre de la actividad deberá estar disponible en el DOM;
- deberá poder descubrirse con teclado;
- en dispositivos sin hover deberá existir una presentación equivalente;
- el nombre accesible del enlace deberá contener o coincidir con su texto visible;
- la fecha y el estado no deberán depender exclusivamente del color;
- no se crearán enlaces anidados dentro de la tarjeta.

## 10.4 Textos alternativos

Se deberá diferenciar entre:

- imagen decorativa: `alt=""`;
- banner que aporta contenido: texto alternativo breve y descriptivo;
- logo institucional: nombre de la institución;
- programa visual: actividad y número de página.

No se deberá copiar el título completo de 300 caracteres como texto alternativo. Se utilizará una descripción breve y útil.

---

# 11. Datos estructurados de actividades

## 11.1 Fidelidad del marcado

El JSON-LD deberá coincidir con el contenido visible respecto a:

- nombre;
- descripción;
- fecha de inicio;
- fecha de fin;
- zona horaria;
- estado;
- modalidad;
- sede;
- dirección;
- precio;
- disponibilidad;
- organizador;
- ponentes;
- URL canónica;
- imagen pública.

No se deberá inventar una sede física para una actividad virtual.

## 11.2 Elegibilidad para resultados enriquecidos

Se distinguirán:

- actividades presenciales públicas;
- actividades híbridas públicas;
- actividades exclusivamente virtuales;
- actividades exclusivas para asociados o por invitación.

Las dos primeras podrán aspirar a la experiencia enriquecida de eventos de Google cuando cumplan todos sus requisitos.

Las actividades virtuales o restringidas podrán conservar marcado semántico correcto, pero las pruebas y reportes no deberán declararlas elegibles si Google no admite esa modalidad.

## 11.3 Fechas múltiples

Se deberá documentar y probar la diferencia entre:

- una actividad continua de varios días;
- varias sesiones que forman una única capacitación;
- presentaciones independientes con inscripción o entrada propia.

Cuando existan presentaciones independientes, cada una deberá representarse mediante un elemento `Event` propio. No se deberá convertir automáticamente la primera y última fecha en un rango si eso modifica el significado real.

## 11.4 Ubicación

Mientras todas las sedes físicas pertenezcan a Ica, se utilizará la configuración institucional para completar:

```text
addressLocality: Ica
addressRegion: Ica
addressCountry: PE
```

La dirección visible deberá terminar en `Ica, Perú` cuando esa información no forme parte del texto original.

Si posteriormente se publican actividades fuera de Ica, deberá crearse antes un cambio de modelo para guardar ciudad, región y país por sede. No se deberá reutilizar el valor predeterminado de Ica para otra ciudad.

---

# 12. Contenido orientado a alcance orgánico

## 12.1 Actividades

Cada actividad publicada deberá ofrecer, cuando la información exista:

- resumen original;
- objetivo;
- público objetivo;
- agenda o temas;
- ponentes y experiencia relevante;
- fecha y hora local;
- modalidad;
- sede y dirección;
- mapa y referencia;
- precio;
- disponibilidad;
- estado de inscripción;
- contacto institucional;
- actividades relacionadas.

La información para visitantes de otras regiones o países deberá ser práctica. No se utilizarán términos turísticos si la actividad no tiene relación real con turismo.

## 12.2 Actividades finalizadas

Las actividades finalizadas continuarán indexables cuando mantengan valor informativo.

Se deberá mostrar:

- estado “Actividad finalizada”;
- información histórica correcta;
- resumen o resultados cuando se publiquen;
- materiales, fotografías o grabación pública cuando estén disponibles;
- enlaces hacia próximas actividades relacionadas.

No se deberá mostrar una llamada a inscripción activa en actividades finalizadas.

## 12.3 Cursos

Cada curso publicado deberá disponer de contenido propio sobre:

- resultados de aprendizaje;
- público recomendado;
- temario;
- duración o carga estimada;
- instructor;
- modalidad;
- requisitos;
- precio y disponibilidad.

El catálogo solo deberá emitir `ItemList` cuando cumpla la condición documentada y disponga de cursos públicos suficientes.

## 12.4 Enlazado interno

Se deberá reforzar la relación entre:

- inicio y catálogos;
- catálogos y detalles;
- actividades relacionadas;
- actividades finalizadas y próximas actividades;
- cursos y contenidos formativos relacionados.

Los enlaces deberán usar textos descriptivos. No se utilizarán de forma generalizada frases como “haz clic aquí”.

---

# 13. URLs, filtros y paginación

## 13.1 Slugs futuros

Los nuevos slugs deberán ser:

- estables;
- legibles;
- descriptivos;
- más breves que el título completo cuando este sea excesivo;
- únicos dentro de su catálogo.

No se deberán cambiar URLs públicas existentes sin:

- conservar una redirección permanente 301;
- actualizar sitemap;
- actualizar enlaces internos;
- actualizar canonical;
- comprobar que no se forme una cadena de redirecciones.

## 13.2 Filtros y búsquedas

- Los catálogos con filtros conservarán la canonical definida para su contenido principal.
- La búsqueda interna continuará con `noindex, follow`.
- No se generarán combinaciones indexables ilimitadas por query string.
- Los filtros no deberán bloquear el acceso al catálogo sin parámetros.

## 13.3 Paginación pública

Antes de que un catálogo pueda crecer a cientos de registros, deberá incorporar paginación del lado del servidor.

La paginación deberá:

- usar enlaces HTML rastreables;
- tener orden estable;
- conservar filtros válidos;
- evitar cargar todos los registros en una sola respuesta;
- definir canonical coherente para cada página con contenido distinto;
- mostrar estados vacíos y límites inválidos de forma segura;
- mantener el sitemap enfocado en detalles canónicos, no en combinaciones de filtros.

---

# 14. Autoridad institucional y distribución

El código por sí solo no será suficiente para obtener alcance orgánico.

La Cámara deberá enlazar la plataforma desde propiedades institucionales ya reconocidas, especialmente:

- página principal de `camaraica.org.pe`;
- sección institucional de cursos y capacitaciones;
- noticias relacionadas;
- páginas de proyectos o comités relacionados;
- perfiles sociales oficiales;
- comunicaciones y boletines institucionales.

Los enlaces deberán apuntar a la URL canónica exacta del contenido y utilizar textos descriptivos.

También se deberá coordinar, cuando corresponda, con:

- expositores;
- empresas auspiciadoras;
- instituciones aliadas;
- gremios;
- universidades;
- organizadores asociados.

No se comprarán enlaces ni se intercambiarán enlaces masivos sin relación temática.

Si una actividad o curso existe tanto en el dominio institucional como en la nueva plataforma, deberá definirse cuál es la versión principal. La alternativa deberá resumir y enlazar, redirigir o canonicalizar según corresponda; no deberá competir con una copia íntegra.

---

# 15. Analítica y protección de datos

## 15.1 Medición mínima

Se deberá integrar una solución de analítica aprobada por la Cámara y configurar, como mínimo:

- vista de catálogo;
- vista de actividad;
- vista de curso;
- clic en “Inscríbete”;
- inicio de inscripción;
- inscripción completada;
- origen orgánico;
- página de entrada;
- Core Web Vitals reales cuando la solución lo permita.

## 15.2 Datos prohibidos

Los eventos de analítica no deberán enviar:

- nombres;
- apellidos;
- DNI o CE;
- correo;
- teléfono;
- RUC;
- dirección;
- código de inscripción;
- código de certificado;
- token de acceso;
- URLs privadas;
- texto libre escrito por el participante.

Se podrán utilizar identificadores públicos de actividad o curso, tipo de catálogo y modalidad.

## 15.3 Search Console

Se deberá revisar periódicamente:

- páginas indexadas;
- páginas excluidas;
- sitemap;
- resultados enriquecidos;
- métricas web esenciales;
- consultas;
- impresiones;
- clics;
- CTR;
- posición promedio;
- errores de rastreo.

La revisión deberá comparar periodos equivalentes y registrar la fecha de cada cambio relevante.

---

# 16. Requerimientos técnicos

## RT-01 — Next.js 16

Las decisiones de caché, revalidación, metadata e imágenes deberán basarse en la documentación instalada de la versión actual.

## RT-02 — Separación de sesión

El contenido público cacheable no deberá depender innecesariamente de cookies de autenticación.

## RT-03 — Invalidación

Los cambios administrativos deberán invalidar las rutas públicas afectadas.

## RT-04 — LCP

El hero deberá esperar el primer intervalo antes de rotar y no deberá reemplazar el elemento LCP durante la carga inicial.

## RT-05 — Recursos prioritarios

Solo el primer recurso visual esencial deberá recibir prioridad alta.

## RT-06 — Video diferido

El video fuera del primer viewport no deberá descargarse completamente durante la carga inicial.

## RT-07 — Layout estable

Banners, posters, tarjetas y mapas deberán reservar sus dimensiones para evitar CLS.

## RT-08 — Metadata

Las páginas indexables deberán conservar título, descripción, canonical, robots y previews sociales correctos.

## RT-09 — JSON-LD seguro

La serialización deberá impedir inyección de etiquetas y no incluir información privada.

## RT-10 — Contenido semántico

Cada vista indexable deberá disponer de un H1 visible y una jerarquía comprensible.

## RT-11 — Imágenes

Las imágenes relevantes deberán utilizar elementos HTML descubribles, tamaños responsive y textos alternativos apropiados.

## RT-12 — Paginación

Los catálogos deberán poder crecer sin recuperar todos los registros en una sola consulta.

## RT-13 — Analítica sin PII

Ningún evento de medición deberá contener datos personales o tokens.

## RT-14 — TypeScript

No se utilizará `any` para metadata, JSON-LD, eventos analíticos ni resultados de consultas.

## RT-15 — Componentes

Ningún componente nuevo o modificado deberá superar 170 líneas.

## RT-16 — Estilos

Los cambios visuales deberán implementarse con Tailwind y tokens compartidos.

## RT-17 — Errores

Una falla de analítica o medición de Web Vitals no deberá impedir navegar ni inscribirse.

## RT-18 — Sin migración innecesaria

No se crearán campos ni migraciones si la información requerida ya puede derivarse de configuración o datos existentes.

---

# 17. Pruebas automatizadas

Se deberán incorporar o actualizar pruebas para:

- construcción de canonicales;
- generación de títulos y descripciones;
- recorte de textos SEO extensos;
- resolución de imágenes sociales;
- serialización segura de JSON-LD;
- modalidad y ubicación de `Event`;
- actividades canceladas, finalizadas y archivadas;
- sesiones múltiples;
- robots de rutas públicas y privadas;
- contenido del sitemap;
- paginación y filtros públicos;
- invalidación de contenido al publicar o editar;
- ausencia de PII en eventos analíticos;
- preferencia de movimiento reducido cuando corresponda.

Las pruebas deberán cubrir al menos:

```text
actividad presencial pública
actividad híbrida pública
actividad exclusivamente virtual
actividad exclusiva para asociados
actividad finalizada
actividad cancelada
actividad archivada
curso publicado
curso no publicado
contenido sin banner
contenido con título extenso
```

---

# 18. Pruebas manuales y herramientas

## 18.1 Lighthouse

Ejecutar Lighthouse móvil al menos en:

- inicio;
- catálogo de eventos;
- catálogo de capacitaciones;
- catálogo de cursos;
- detalle presencial con banner;
- detalle virtual;
- consulta pública de certificados.

Registrar:

- commit;
- fecha;
- URL;
- ambiente;
- Performance;
- Accessibility;
- Best Practices;
- SEO;
- LCP;
- TBT;
- CLS;
- peso transferido.

## 18.2 Validación de datos estructurados

Validar mediante Rich Results Test y Schema Markup Validator:

- organización;
- breadcrumb;
- actividad presencial pública;
- actividad híbrida pública;
- actividad virtual como caso semántico no elegible;
- curso;
- catálogo con `ItemList` cuando corresponda.

## 18.3 Responsive y accesibilidad

Probar:

- 390 × 844;
- 768 × 1024;
- 1440 × 900;
- Chromium estable;
- Safari/WebKit estable;
- teclado sin mouse;
- dispositivo o emulación sin hover;
- `prefers-reduced-motion`.

## 18.4 Producción

Comprobar:

- `/robots.txt` responde 200;
- `/sitemap.xml` responde 200 y XML válido;
- canonicales usan HTTPS y dominio productivo;
- las rutas privadas no aparecen en sitemap;
- Googlebot puede obtener HTML, CSS, JavaScript e imágenes públicas;
- la primera respuesta contiene el contenido principal;
- las páginas públicas aprovechan la estrategia de caché prevista;
- publicar o editar refresca la información visible dentro del tiempo acordado.

---

# 19. Objetivos de aceptación

Los siguientes objetivos deberán utilizarse como criterio de salida, reconociendo que Lighthouse puede variar entre ejecuciones:

| Métrica | Objetivo |
|---|---:|
| SEO Lighthouse | 100 en páginas representativas |
| Accessibility Lighthouse | 95 o más |
| Best Practices Lighthouse | 100 |
| Performance móvil | 85 o más como objetivo inicial |
| LCP de laboratorio | 2.5 s o menos en páginas representativas |
| CLS | 0.1 o menos |
| TBT | 200 ms o menos cuando aplique |
| Errores críticos de datos estructurados | 0 |
| URLs privadas en sitemap | 0 |
| Eventos de analítica con PII | 0 |

Cuando exista suficiente información de campo, se buscará que LCP, INP y CLS cumplan sus umbrales recomendados en el percentil 75 de móvil y escritorio.

Si una página no alcanza Performance 85 por una dependencia externa justificada, se deberá registrar:

- causa;
- evidencia;
- impacto;
- alternativa evaluada;
- decisión aprobada.

No deberá marcarse el hito como aprobado ocultando o eliminando funcionalidad esencial únicamente para aumentar un puntaje.

---

# 20. Matriz de aceptación

| Escenario | Resultado esperado |
|---|---|
| Inicio sin sesión | HTML público útil, banner prioritario y contenido cacheable |
| Inicio con sesión | Mantiene navegación personalizada sin invalidar toda la caché pública |
| Hero con varios banners | No rota automáticamente; controles manuales accesibles |
| Video fuera del viewport | No descarga el MP4 completo durante la carga inicial |
| Actividad con banner | Banner completo y H1 visible fuera de la imagen |
| Actividad sin banner | Fallback estable, título visible y metadata institucional |
| Tarjeta en escritorio | Toda la tarjeta navega y la animación hover funciona |
| Tarjeta en móvil | El título y la acción son comprensibles sin hover |
| Tarjeta con teclado | Foco visible y nombre accesible coherente |
| Actividad presencial pública | Dirección `Ica, Perú` visible y `Event` válido |
| Actividad virtual | No inventa sede física ni se declara elegible para rich result presencial |
| Actividad exclusiva | Indica la restricción y no se declara elegible para experiencia pública de Google |
| Actividad finalizada | Permanece útil, sin CTA de inscripción activa |
| Actividad cancelada | Continúa con `noindex, follow` y estado visible |
| Actividad archivada | Responde como no encontrada y no aparece en sitemap |
| Búsqueda interna | Continúa con `noindex, follow` |
| Filtros del catálogo | Mantienen canonical coherente y no generan infinitas URLs indexables |
| Paginación | Enlaces rastreables, orden estable y consultas limitadas |
| Inscripción orgánica | Registra conversión sin enviar datos personales |
| Edición administrativa | Invalida únicamente el contenido público relacionado |
| Falla de analítica | La inscripción y navegación continúan funcionando |

---

# 21. Comandos de verificación

Antes de declarar terminado el hito se deberá ejecutar:

```bash
yarn test:unit
yarn lint
yarn typecheck
yarn build
```

También se deberán ejecutar las pruebas SQL vinculadas cuando una modificación afecte consultas, índices, funciones o políticas de acceso.

Si se incorpora una migración, será obligatorio:

```text
crear migración versionada
→ probar en base limpia o entorno controlado
→ ejecutar suite SQL relacionada
→ regenerar tipos de Supabase
→ actualizar documentación
```

---

# 22. Entregables

El Hito 13 deberá entregar:

- optimización de hero y banners;
- carga diferida del video promocional;
- estrategia documentada de caché e invalidación;
- consultas públicas revisadas;
- títulos visibles y semántica corregida;
- tarjetas accesibles en hover, teclado y touch;
- JSON-LD validado por modalidad y audiencia;
- paginación pública preparada para crecimiento;
- estrategia de slugs y redirecciones;
- medición orgánica sin PII;
- enlaces institucionales coordinados o registrados como dependencia externa;
- reporte Lighthouse antes/después;
- evidencias de Rich Results Test;
- actualización de `docs/integraciones/seo-indexacion.md`;
- actualización de la matriz de pruebas y checklist de producción cuando corresponda.

---

# 23. Dependencias externas

Requieren coordinación fuera del repositorio:

- acceso a Google Search Console;
- aprobación de la herramienta de analítica;
- acceso al sitio institucional `camaraica.org.pe`;
- acceso a perfiles sociales oficiales;
- coordinación con expositores y aliados para enlaces;
- definición editorial de resúmenes y resultados posteriores a cada evento.

Una dependencia externa bloqueada no deberá ocultarse. Se registrará como `BLOQUEADO` con responsable y siguiente acción.

---

# 24. Definition of Done

El Hito 13 se considerará **TERMINADO** cuando:

## Rendimiento

- [ ] El hero rota automáticamente, conserva controles accesibles anterior/siguiente y respeta movimiento reducido.
- [ ] El primer banner tiene prioridad y dimensiones estables.
- [ ] Los banners secundarios no compiten por prioridad.
- [ ] El video promocional se carga de forma diferida.
- [ ] El poster está optimizado.
- [ ] Las páginas públicas utilizan la estrategia de caché aprobada.
- [ ] La invalidación administrativa fue probada.
- [ ] No se detectan consultas públicas N+1 críticas.

## SEO técnico

- [ ] Metadata, canonical, robots y previews sociales permanecen correctos.
- [ ] Sitemap y robots responden correctamente en producción.
- [ ] No existen rutas privadas en el sitemap.
- [ ] Las actividades canceladas y archivadas mantienen su política.
- [ ] Los filtros no generan contenido duplicado indexable.
- [ ] La paginación es rastreable.
- [ ] Los slugs nuevos siguen la política acordada.

## Semántica y accesibilidad

- [ ] Cada página indexable tiene un H1 visible.
- [ ] Los encabezados mantienen una jerarquía comprensible.
- [ ] Las tarjetas funcionan mediante mouse, teclado y touch.
- [ ] Los nombres accesibles coinciden con el contenido visible.
- [ ] Las imágenes relevantes tienen texto alternativo adecuado.
- [ ] `prefers-reduced-motion` fue verificado.

## Datos estructurados

- [ ] Organization y WebSite son válidos.
- [ ] BreadcrumbList es válido.
- [ ] Una actividad presencial pública supera Rich Results Test.
- [ ] Una actividad híbrida pública fue validada.
- [ ] Las actividades virtuales no inventan ubicaciones físicas.
- [ ] Las restricciones de audiencia se representan fielmente.
- [ ] Las fechas múltiples no se convierten en rangos incorrectos.
- [ ] Course e ItemList son válidos cuando corresponde.

## Contenido y alcance

- [ ] `Ica, Perú` aparece de manera natural y visible en actividades físicas.
- [ ] Las actividades publicadas muestran información suficiente para decidir e inscribirse.
- [ ] Las actividades finalizadas no conservan CTA activo.
- [ ] Existen enlaces internos hacia contenido relacionado.
- [ ] El dominio institucional enlaza los catálogos principales o la dependencia está formalmente registrada.
- [ ] No existe contenido turístico artificial ni repetición de palabras clave.

## Medición

- [ ] Search Console continúa verificado.
- [ ] El sitemap fue procesado o su estado fue documentado.
- [ ] La analítica aprobada registra vistas y conversiones.
- [ ] Ningún evento analítico contiene PII.
- [ ] Existe reporte antes/después de Lighthouse.
- [ ] Existe una línea base de consultas, impresiones, clics y CTR cuando Google disponga de datos.

## Calidad

- [ ] `yarn test:unit` aprobado.
- [ ] `yarn lint` aprobado.
- [ ] `yarn typecheck` aprobado.
- [ ] `yarn build` aprobado.
- [ ] Revisión móvil, tableta y escritorio aprobada.
- [ ] Chromium y Safari/WebKit aprobados.
- [ ] No existen defectos críticos o altos abiertos relacionados con el hito.
- [ ] La documentación fue actualizada.

---

# 25. Resultado final esperado

Al completar el Hito 13, la plataforma deberá ofrecer el siguiente recorrido orgánico:

```text
Google / enlace institucional / red social
                    ↓
        URL pública canónica y rápida
                    ↓
     Título, banner y ubicación comprensibles
                    ↓
         Detalle útil de la actividad
                    ↓
               Inscripción
                    ↓
       Conversión anónima y medible
```

La Cámara de Comercio de Ica deberá disponer de una plataforma preparada para aumentar su presencia en búsquedas en español relacionadas con eventos, capacitaciones y cursos en Ica, Perú, sin sacrificar rendimiento, accesibilidad, privacidad ni exactitud institucional.

El hito quedará aprobado cuando las mejoras estén demostradas mediante pruebas técnicas, evidencia visual, validación estructurada y medición de producción, no únicamente por la presencia de etiquetas SEO.

---

# 26. Estado de implementación — 9 de septiembre de 2026

## Implementado en el repositorio

- cliente anónimo y caché etiquetada para consultas públicas;
- sesión de cabecera y acceso personalizado a cursos cargados mediante endpoints privados `no-store`;
- invalidación desde acciones administrativas e inscripciones;
- inicio y sitemap regenerables cada 15 minutos y detalles actuales prerenderizados;
- paginación de 12 elementos con canonical propio para páginas y `noindex, follow` para filtros;
- hero con rotación automática controlable, prioridad limitada al primer banner, movimiento reducido y dimensiones estables;
- video del Campus bajo demanda con poster WebP reducido de 865 KB a aproximadamente 22 KB;
- H1 visibles, jerarquía de encabezados corregida y textos alternativos descriptivos;
- tarjetas utilizables con mouse, teclado y dispositivos sin hover;
- JSON-LD con audiencia restringida, modalidad y sesiones múltiples explícitas;
- slugs automáticos nuevos limitados a 96 caracteres;
- Google Analytics opcional con eventos de conversión y lista permitida sin PII;
- pruebas unitarias, lint, TypeScript y build aprobados localmente.

## Pendiente de validación o coordinación externa

- desplegar la versión y repetir Lighthouse para obtener la comparación posterior;
- validar ejemplos reales con Rich Results Test y Schema Markup Validator;
- observar Core Web Vitals, consultas, impresiones, clics y CTR cuando Google disponga de datos;
- definir y configurar el identificador de analítica si la institución aprueba Google Analytics;
- coordinar enlaces desde el dominio institucional, redes oficiales, expositores y aliados;
- completar pruebas manuales responsive, teclado, Chromium y Safari/WebKit.

Por estas dependencias, la implementación de código está lista, pero la Definition of Done completa del hito permanece sujeta a comprobación en producción.
