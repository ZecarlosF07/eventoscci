# Configuración de Supabase Auth

La aplicación utiliza correo y contraseña con sesiones SSR mediante `@supabase/ssr`.

## URL Configuration del proyecto alojado

En **Authentication → URL Configuration** se debe configurar:

- **Site URL:** la URL pública de la aplicación.
- **Redirect URLs:** la URL pública seguida de `/**` y las URLs locales autorizadas durante desarrollo.

Ejemplo local:

```text
http://localhost:3000/**
http://127.0.0.1:3000/**
```

La URL pública debe coincidir con `NEXT_PUBLIC_SITE_URL`.

## Plantillas de correo

Las plantillas versionadas para desarrollo local están en:

```text
supabase/templates/confirmation.html
supabase/templates/recovery.html
```

En un proyecto alojado, su contenido debe copiarse en **Authentication → Email Templates**. Ambos enlaces usan `token_hash`, de modo que la aplicación pueda verificar el OTP y persistir la sesión SSR.

## Proveedor de correo

Los correos de confirmación y recuperación pertenecen a Supabase Auth y deben configurarse con el SMTP seguro del proyecto. Esto es independiente del webhook de n8n usado por la cola de notificaciones transaccionales de actividades y certificados.

## Regla de identidad

El registro envía datos validados como metadatos de Auth. El trigger `handle_campus_user_registration` procesa únicamente altas con `registration_source = campus` y, dentro de la misma transacción:

1. normaliza y valida el documento;
2. bloquea concurrentemente esa identidad;
3. reutiliza la persona existente o crea una nueva;
4. crea una sola `user_account` activa con rol `student`.

Si cualquier paso falla, también se revierte la creación de `auth.users`.
