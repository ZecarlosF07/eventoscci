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

La aplicación consulta categorías y expositores directamente mediante `supabase-js`. Las tablas con datos personales permanecen cerradas por RLS.
