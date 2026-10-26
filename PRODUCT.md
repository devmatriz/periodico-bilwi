# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary readers:** people in Bilwi (Puerto Cabezas) and the communities of the Costa Caribe Norte, reading mostly on phones over limited or unreliable mobile data, often outdoors. They come to find out what is happening locally: services, weather, culture, economy, sports, community life.
- **Editors / administrators:** the newsroom team that writes, publishes, features and archives stories, moderates reader comments and maintains sections and editorial users from `/admin`.

## Product Purpose

Bilwi Noticias is a digital newspaper that spreads local, cultural and social information about Bilwi and the Caribbean Coast of Nicaragua in a way that is accessible, organized and trustworthy. Success means readers can find and read today's local news quickly on a phone, and editors can publish and maintain the front page without friction.

## Positioning

A newspaper written from Bilwi, about Bilwi and the Costa Caribe Norte, rather than national coverage that mentions the coast occasionally. Its credibility comes from proximity: local authorship, local places, local issues.

## Operating Context

- Readers: phone-first, low bandwidth, bright outdoor light; arrive from shared links (WhatsApp, Facebook) straight to an article, or open the front page to scan.
- Editors: desktop or laptop in the newsroom; daily workflow of create → draft → publish → feature, plus moderation of the comment queue.

## Capabilities and Constraints

- Next.js 15 (App Router) + React 19, NextAuth credentials login for admins; content stored in JSON files under `data/` through `lib/*-store.ts`; uploads to `public/uploads`. Prisma schema exists but is not the active store.
- Public routes: `/`, `/noticias` (search `q`, filters `categoria`, `periodo`), `/noticias/[slug]` (article + moderated comments), `/categorias`, section pages (`/locales`, `/cultura`, `/deportes`, `/economia`, `/sociedad`, `/opinion`), `/nosotros`, `/contacto`, `/login`, `/registro`, legal/aux pages.
- Admin routes: `/admin` dashboard, `/admin/noticias` (+ `/nueva?slug=` editor with image upload), `/admin/categorias`, `/admin/usuarios`, `/admin/comentarios`.
- Story statuses: published, draft, scheduled, archived; stories can be featured.
- Must not change: database/storage structure, backend logic, API endpoints, authentication, CRUD operations.
- Not functional today (must not be presented as working): newsletter sending, user registration, contact form submission, share buttons beyond links.

## Brand Commitments

- Name: **Bilwi Noticias**. Region descriptor: Costa Caribe (Norte) de Nicaragua.
- Language: Spanish only. Miskitu or Creole English appear only when a story itself uses them; no invented translations.

## Evidence on Hand

- Real stories in `data/noticias.json` with uploaded photos in `public/uploads/`; some seed stories use Unsplash images.
- Real comments in `data/comments.json`; section settings in `data/admin-categories.json`; editorial users in `data/admin-users.json`.
- No real readership numbers, video content, advertisers or newsletter. Do not fabricate read counts, popular rankings, videos, ads, testimonials or metrics.

## Product Principles

1. Today's local news first: the newest real story leads; nothing decorative stands between a reader and a headline.
2. Light enough for the coast: every page must stay fast on weak mobile data.
3. Only real content: placeholder blocks are connected to the store or removed, never dressed up.
4. Editors move fast: admin screens favor scanning and clear status over decoration.

## Accessibility & Inclusion

- Phone-first, legible in bright sunlight: generous body size, strong contrast (WCAG AA minimum), large tap targets.
- Must work on low-end Android devices and slow connections.
