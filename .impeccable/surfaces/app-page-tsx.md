---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/noticias/page.tsx","app/noticias/[slug]/page.tsx","app/categorias/page.tsx","app/admin/page.tsx","components/public-shell.tsx","components/admin-shell.tsx"]
---

# Bilwi Noticias: whole-site redesign

Scope: every public route (portada, noticias/búsqueda, detalle, categorías y secciones, institucionales, login/registro) and the admin panel. Visitor mode: Read for public pages; Operate for /admin (inherits the world, optimized for productivity).

Audience/job: Bilwi readers on phones over weak data want today's local news fast; editors publish and moderate on desktop. Constraints: keep all logic, routes, APIs, auth, CRUD; real data only (placeholder blocks connected to the store or removed); light mode primary.

## Direction contract

THESIS: The front page is the community notice board posted at the hall door: a dark panel whose white numbered tiles announce today's order (01–05). Refuses the stock portal: full-bleed hero carousel over a grid of identical shadowed cards.

OWN-WORLD: White paper ground (#fff, not cream), near-black ink, one dark board (#1d1916) carrying only two values (board + white tile, no greys); rubric green #0d6b4e for section labels and links. Archivo condensed caps for masthead, tiles, labels, nav; Source Serif 4 for headlines and body. Hairline rules, 3px tile radius, no shadows except focus. Every card carries one label: sección · número · fecha. Rank = tile number, not size inflation. All colour per screen is spent on the board.

STORY: The reader sees the date and today's ordered list, taps the story that matters, reads it in a calm fixed column (~66ch), then moves to related stories or a section; editors see the same board as counts and act from tables.

FIRST VIEWPORT: White masthead: date line left, condensed wordmark centre-left, search right; section nav row below. Then the board: strip with "Último minuto" ticker; tile 01 lead story (real photo, serif headline ~40px on board, excerpt); tiles 02–05 as a numbered list at right (stacked under the lead on mobile). Primary action: tapping a headline.

FORM: Grounded candidate 6 of 7 (community notice board with slide-in numerals + two-ink bulletin). seed:88324a6d7dc59717. Raises: two-value board (ikeda-datamatics); rank by number not size (cutting-bench); fixed reading measure (botteghe quarterly); all colour on one object (civic prospectus); one label grid per card (sneaker stacks); structure as ornament, section index with real counts (coptic binding). Signature interaction: tiles slide into their slots once on load, staggered; off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
