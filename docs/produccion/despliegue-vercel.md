# Despliegue y operación en Vercel

## Arquitectura productiva

- Vercel ejecuta la aplicación Next.js y sus Route Handlers.
- Supabase alojado provee PostgreSQL, Auth y Storage.
- La aplicación llama inmediatamente a n8n y este entrega los correos mediante Gmail.
- `/api/health` confirma que la aplicación puede consultar Supabase sin exponer secretos.

Los previews de Vercel deben apuntar a un Supabase de pruebas. Solo el ambiente `Production` puede recibir las credenciales y URLs productivas.

## Variables de Vercel

| Variable | Visibilidad | Ambientes | Uso |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Preview/Production con valores distintos | API de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Preview/Production con valores distintos | Cliente con RLS |
| `NEXT_PUBLIC_SITE_URL` | Pública | Production | URL HTTPS canónica |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreta | Production | PDF, Storage privado y entrega de notificaciones |
| `N8N_WEBHOOK_URL` | Secreta | Production | Entrega de mensajes a n8n |
| `N8N_WEBHOOK_SECRET` | Secreta | Production | Autenticación de webhook |
| `APP_VERSION` | Interna/opcional | Production | Identificación explícita en logs |

Ejecutar `yarn production:check` con el entorno productivo descargado mediante Vercel CLI antes de promover el despliegue. Nunca copiar `SUPABASE_SERVICE_ROLE_KEY` a una variable `NEXT_PUBLIC_*`.

## Preparación de Supabase

1. Confirmar el proyecto vinculado con `supabase projects list` y `supabase migration list --linked`.
2. Revisar con `supabase db push --linked --dry-run`.
3. Aplicar solo migraciones con `yarn db:push`; no usar `--include-seed`.
4. Ejecutar `yarn db:seed:production` una vez, tras revisar las categorías.
5. Regenerar tipos con `yarn types:db:linked` y confirmar que no existe una diferencia inesperada.
6. Ejecutar `yarn db:test:linked`.

`supabase/seed.sql` es exclusivamente local y contiene datos demostrativos. `supabase/seed.production.sql` no crea usuarios, personas, actividades ni credenciales.

### Registro de migraciones aplicadas manualmente

- `202609010005_fix_catalog_policy_recursion.sql` fue aplicada manualmente mediante Supabase SQL Editor el 1 de septiembre de 2026. Para alinear el historial de Supabase CLI sin volver a ejecutar el SQL, registrar una sola vez:

  ```bash
  supabase migration repair --status applied 202609010005
  ```

Después del registro, confirmar con `supabase migration list --linked` que la versión aparece aplicada tanto local como remotamente.

## Auth y dominio

En Supabase Auth configurar:

- Site URL: el dominio HTTPS definitivo;
- Redirect URLs: `https://<dominio>/auth/**` y el dominio de producción de Vercel durante la transición;
- plantillas de confirmación y recuperación con enlaces del dominio definitivo;
- SMTP productivo para los mensajes propios de Supabase Auth.

En Vercel agregar el dominio, esperar la validación DNS y comprobar HTTPS antes de cambiar la Site URL de Supabase.

## Configuración de n8n

Importar el workflow de notificaciones, conectar la cuenta institucional de Gmail y activar su URL de producción. La aplicación invoca el webhook inmediatamente después de crear cada notificación. Una entrega fallida queda registrada y puede ejecutarse manualmente desde `/admin/notificaciones`; no se utiliza Vercel Cron ni un Schedule Trigger de n8n.

## Despliegue

1. Importar `ZecarlosF07/eventoscci` en Vercel y seleccionar Next.js.
2. Configurar las variables por ambiente.
3. Confirmar que el comando de instalación es `yarn install --frozen-lockfile` y el build es `yarn build`.
4. Desplegar primero como Preview y ejecutar la revisión visual.
5. Ejecutar `yarn release:check` localmente o en CI.
6. Promover a Production.
7. Ejecutar `yarn smoke:production https://<dominio>`.
8. Completar los cuatro escenarios de la matriz con datos controlados y retirarlos al finalizar.

## Monitoreo y recuperación

- Vercel Logs permite filtrar los eventos JSON por `event`, `level` y `version`.
- Supervisar `/api/health` desde un monitor HTTPS externo.
- Revisar errores de Functions y la tabla `notification_outbox`.
- Habilitar la estrategia de backups/PITR disponible en el plan de Supabase y documentar al responsable.
- Conservar el commit y la última migración aplicada en cada liberación.

Para revertir código, usar Instant Rollback de Vercel al deployment anterior. Las migraciones ya aplicadas no se revierten borrando archivos: se crea una migración correctiva compatible hacia adelante. Antes de cambios destructivos se toma backup y se ensaya la recuperación.
