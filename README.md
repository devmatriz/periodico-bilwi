# Periodico Bilwi

Base inicial para un periodico digital en Next.js.

## Estructura recomendada

- `app/layout.tsx`: layout raiz y metadata global
- `app/page.tsx`: portada
- `app/noticias/page.tsx`: listado de noticias
- `app/noticias/[slug]/page.tsx`: detalle de noticia
- `app/categorias/page.tsx`: categorias
- `app/nosotros/page.tsx`: pagina institucional
- `app/contacto/page.tsx`: contacto
- `app/admin/page.tsx`: panel de administracion
- `app/admin/noticias/page.tsx`: gestion de noticias
- `app/admin/noticias/nueva/page.tsx`: crear noticia
- `app/api/noticias/route.ts`: API de noticias
- `app/api/categorias/route.ts`: API de categorias
- `app/api/auth/[...nextauth]/route.ts`: autenticacion
- `components/`: componentes reutilizables
- `lib/`: prisma, auth y utilidades
- `prisma/schema.prisma`: modelo de datos
- `public/`: imagenes y recursos estaticos

## Modelo minimo

1. `User`
2. `Category`
3. `Post`

## Siguiente paso

1. instalar dependencias de Next.js
2. conectar PostgreSQL con Prisma
3. agregar autenticacion de administradores

## Comandos base

```bash
npm install
npm run dev
```

## Base de datos

Noticias, comentarios, secciones y cuentas del panel viven en PostgreSQL (Prisma).
En producción se usa Neon; para desarrollo sirve una rama de Neon o un Postgres local.

1. Copia `.env.example` como `.env` y completa `DATABASE_URL` y `DIRECT_URL`
   (en Neon: la dirección "pooled" y la directa; en local, la misma en las dos).
2. Crea las tablas:

```bash
npm run db:deploy
```

3. Carga los datos. Si existen los antiguos `data/*.json`, se copian tal cual
   (también las contraseñas, ya cifradas); si no, se cargan noticias de ejemplo.
   Se puede repetir: no duplica nada.

```bash
npm run db:seed
```

La primera cuenta de administración sale de `ADMIN_EMAIL` / `ADMIN_PASSWORD`
la primera vez que alguien inicia sesión con la base vacía. Desde el panel
(Equipo) esa cuenta crea las demás, con contraseñas temporales.

Para cambiar el esquema: edita `prisma/schema.prisma` y ejecuta `npm run db:migrate`.
En Vercel, `vercel-build` aplica las migraciones pendientes antes de compilar.
