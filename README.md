# Eventos CCI

Fundación técnica de la Plataforma Digital de Eventos, Capacitaciones y Cursos de la Cámara de Comercio de Ica.

## Requisitos

- Node.js compatible con Next.js 16
- Yarn 1.x
- Supabase CLI
- Docker Desktop para el entorno local de Supabase

## Configuración local

1. Instalar dependencias:

   ```bash
   yarn install
   ```

2. Iniciar Supabase:

   ```bash
   yarn db:start
   ```

3. Copiar `.env.example` como `.env.local` y reemplazar sus valores con la salida de `supabase status`.

4. Reconstruir la base de datos y ejecutar el seed:

   ```bash
   yarn db:reset
   ```

5. Generar los tipos desde el esquema local:

   ```bash
   yarn types:db
   ```

6. Iniciar Next.js:

   ```bash
   yarn dev
   ```

## Validaciones

```bash
yarn lint
yarn typecheck
yarn build
yarn db:test
yarn db:test:linked
```

## Activación en Supabase alojado

Cuando exista el proyecto remoto:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push --include-seed
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

Después, configurar `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`.

La aplicación consulta categorías, expositores y actividades directamente mediante `supabase-js`. Las tablas con datos personales permanecen cerradas por RLS y las mutaciones de actividades requieren una cuenta interna autorizada.

## Acceso administrativo

El panel se encuentra en `/admin/login`. Para habilitar una cuenta interna:

1. Crear el usuario en Supabase Auth.
2. Vincular su `auth.users.id` con una persona existente mediante `user_accounts`.
3. Asignar el rol `operator` o `administrator` y mantener la cuenta activa.

No se incluyen contraseñas ni usuarios administrativos predeterminados en seeds.
