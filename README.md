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

## Base de datos local

Si quieres levantar PostgreSQL con Docker:

```bash
docker compose up -d
```

Luego usa esta URL en `.env` o `.env.local`:

```bash
DATABASE_URL="postgresql://periodico:periodico@localhost:5432/periodico_bilwi"
```

Después ejecuta:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```
