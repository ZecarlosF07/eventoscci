# Checklist de salida a producción

## Código y datos

- [ ] `yarn release:check` aprobado.
- [ ] `supabase db push --linked --dry-run` revisado.
- [ ] `yarn db:test:linked` aprobado sin residuos.
- [ ] Tipos Supabase regenerados después de la última migración.
- [ ] `supabase/seed.sql` no fue aplicado a producción.
- [ ] Migración, commit y deployment registrados.

## Vercel y dominio

- [ ] Proyecto Vercel conectado al repositorio correcto.
- [ ] Preview y Production usan proyectos Supabase separados.
- [ ] `yarn production:check` aprobado con variables de Production.
- [ ] Dominio definitivo y HTTPS activos.
- [ ] `/api/health` responde `200` y `status: ok`.
- [ ] Cabeceras CSP, `nosniff` y anti-framing presentes.

## Supabase

- [ ] RLS y permisos validados por la suite 011.
- [ ] Buckets públicos y privados tienen las políticas previstas.
- [ ] Site URL y redirects de Auth usan HTTPS productivo.
- [ ] SMTP de Auth envía confirmación y recuperación.
- [ ] Existe un administrador real, activo y sin contraseña temporal.
- [ ] Backups/PITR revisados y recuperación documentada.

## n8n y certificados

- [ ] Webhook valida `N8N_WEBHOOK_SECRET`.
- [ ] Cada uno de los cinco eventos invoca inmediatamente el webhook.
- [ ] Correo de prueba llega con remitente, enlaces y acentos correctos.
- [ ] Falla controlada queda registrada y el envío manual funciona.
- [ ] PDF fue revisado con nombre largo, tildes y título largo.
- [ ] Certificado de curso virtual omite fechas.
- [ ] Token público descarga únicamente el certificado correspondiente.
- [ ] Corrección de nombre regenera actividades y cursos conservando código y enlace.
- [ ] El PDF anterior se retira y la regeneración no envía un nuevo correo.

## Aceptación

- [ ] Actividad gratuita completa aprobada.
- [ ] Actividad pagada completa aprobada.
- [ ] Curso gratuito completo aprobado.
- [ ] Curso pagado completo aprobado.
- [ ] Revisión móvil, tableta y escritorio aprobada.
- [ ] Chromium y Safari/WebKit aprobados.
- [ ] Smoke `yarn smoke:production https://<dominio>` aprobado.
- [ ] No hay incidencias críticas o altas abiertas.
- [ ] Responsable de monitoreo y decisión de rollback identificado.

## SEO, rendimiento y medición

- [ ] Inicio, catálogos y detalles exponen un H1 visible y una canonical correcta.
- [ ] `/robots.txt` y `/sitemap.xml` responden correctamente y no exponen rutas privadas.
- [ ] Filtros y búsquedas públicas usan `noindex, follow`; la paginación sin filtros es rastreable.
- [ ] El hero inicia detenido y el video del Campus no descarga el MP4 en la carga inicial.
- [ ] Rich Results Test aprobado para actividad presencial, híbrida y curso.
- [ ] Lighthouse antes/después registrado en móvil y escritorio.
- [ ] Google Analytics, si fue aprobado, recibe conversiones sin PII.
- [ ] Search Console procesó el sitemap y no reporta errores críticos.
- [ ] Enlaces desde el dominio institucional y aliados registrados o asignados a un responsable.
