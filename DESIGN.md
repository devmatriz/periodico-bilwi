---
name: Bilwi Noticias
description: Periódico digital de Bilwi y la Costa Caribe Norte de Nicaragua.
colors:
  paper: "#ffffff"
  wash: "#f3f1ec"
  wash-2: "#eae7e0"
  ink: "#15171a"
  ink-2: "#5b6168"
  rule: "#e3e0d9"
  field-border: "#868b91"
  board: "#15171a"
  board-ink: "#ffffff"
  rubric-teal: "#0a5f63"
  rubric-teal-strong: "#084a4d"
  rubric-teal-wash: "#e1efee"
  warn-bg: "#fbf0d9"
  warn-ink: "#734a00"
  info-bg: "#e6eef8"
  info-ink: "#1f4e8c"
  danger: "#b42318"
  danger-bg: "#fdecea"
  danger-ink: "#8f1d14"
  dark-paper: "#121416"
  dark-ink: "#ecedee"
  dark-ink-2: "#9aa1a8"
  dark-surface: "#1c1f22"
  dark-surface-2: "#24282b"
  dark-rule: "#2c3136"
  dark-field-border: "#6b737b"
  dark-rubric-teal: "#5cc4be"
  dark-rubric-teal-strong: "#7dd3ce"
  dark-rubric-teal-wash: "#173634"
  dark-on-teal: "#0b1f1e"
  dark-danger: "#f97066"
typography:
  wayfinding:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 3vw, 3.75rem)"
    fontWeight: 850
    lineHeight: 0.98
    fontVariation: "'wdth' 68"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(2.125rem, 1.4rem + 3.2vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.125rem, 1.08rem + 0.2vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.68
  ui:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
  tile:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 68"
    fontFeature: "'tnum'"
  scale-caption:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
  scale-small:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  scale-base:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  scale-lede:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  scale-reading:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  scale-rail:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  scale-deck:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 650
  scale-subhead:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 650
  scale-admin-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  scale-section:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  scale-wordmark-footer:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  scale-tile-board:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    fontVariation: "'wdth' 68"
  scale-tile-lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.875rem"
    fontWeight: 800
    fontVariation: "'wdth' 68"
  display-section-min:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  display-section-max:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  display-auth:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  display-wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 850
    fontVariation: "'wdth' 68"
  headline-board:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 650
    lineHeight: 1.08
  title-board-item:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.22
rounded:
  photo: "2px"
  tile: "3px"
  control: "4px"
  panel: "6px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.rubric-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.rubric-teal-strong}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  tile:
    backgroundColor: "{colors.board}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.tile}"
    typography: "{typography.tile}"
  tile-on-board:
    backgroundColor: "{colors.board-ink}"
    textColor: "{colors.board}"
    rounded: "{rounded.tile}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "46px"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: Bilwi Noticias

## Overview

**Creative North Star: "El Tablero"**

The front page is the community notice board posted at the hall door. It is a dark panel, and white numbered tiles slide into its slots to announce today's order. Everything else is plain white paper, printed in near-black ink, with one rubric teal that marks sections and links. The board is the only place the system spends colour and drama. Paper pages stay calm, so reading on a phone in bright coastal light is comfortable and fast on weak data.

Rank is told by number, not by size inflation. The 01 tile leads, and 02 to 05 follow in equal slots. Structure is the ornament: section names are set in condensed capitals over heavy 3px ink rules, counts are real, and every story carries the same label. The look comes from the rules, tiles and type, not from the grid of identical shadowed cards that the category usually ships.

The admin panel uses the same world for work. The sidebar is a board, active navigation is an inverted tile, and editorial counts sit in tiles. Tables, filters and forms stay standard and dense.

**Key Characteristics:**
- Two-value board (#15171a + white) as the single colour event per screen.
- White numbered tiles (3px corners, condensed tabular numerals) for rank and counts.
- Condensed Archivo capitals for wayfinding; Source Serif 4 for everything people read.
- Heavy 3px ink rules open sections; 1px hairlines separate items.
- Flat: no shadows, only rules, fills and focus rings.

## Colors

Restrained: paper and ink neutrals, one dark board, one rubric teal. Light mode is the default; a moon/sun button switches the whole site to dark and the choice is remembered for every page.

### Primary
- **Rubric Teal** (#0a5f63 light / #5cc4be dark): section names in story labels, links, the active nav item, primary buttons, focus rings and selection. Never on the board, where only the light value is allowed. Hover deepens to #084a4d in light and brightens to #7dd3ce in dark. In dark mode it lightens so it still reads on the near-black ground, and primary buttons switch to dark text (#0b1f1e).

### Neutral (light / dark)
- **Notice-Board Pitch** (#15171a / #1c1f22): the board, ticker, section headers, site footer, login panel and admin sidebar. In dark the board becomes the surface tone and gets a 1px #2c3136 edge to separate it from the ground.
- **Paper** (#ffffff / #121416): the ground of every page.
- **Press Ink** (#15171a / #ecedee): headlines, body copy and heavy section rules.
- **Secondary Ink** (#5b6168 / #9aa1a8): summaries, dates, meta, placeholders, table headers.
- **Surface** (#f3f1ec / #1c1f22): filter bar, related-stories band, image placeholders, admin work field.
- **Line** (#e3e0d9 / #2c3136): item dividers, panel borders, table rows.
- **Field Edge** (#868b91 / #6b737b): input borders, at 3:1 or better against the ground.
- **Tile on paper** (#15171a on white / #ecedee on #121416): tiles, avatars, pressed filters and coverage bars outside the board invert in dark.

### Status
- **Ok**, **Warn**, **Info**, **Danger** pills and notices have a light and a dark pair; Danger is #b42318 in light and #f97066 in dark.

### Named Rules
**The Two-Value Board Rule.** Inside the board there are exactly two values: panel and its light ink. That rules out grey text, translucent white and teal. Hierarchy comes from size and weight.

**The Bookend Rule.** Colour is spent on the board at the top and the footer at the bottom, both in the board tone with only its two values. Everything between stays ink, paper and rubric teal.

**The One Switch Rule.** Theme lives on `html[data-theme]` and is set before first paint from the saved preference; components only read tokens, never theme-specific literals.

## Typography

**Wayfinding Font:** Archivo variable, condensed to wdth 68 (with system-ui).
**Reading Font:** Source Serif 4 with optical sizes (with Georgia).

**Character:** a sign-painter's condensed gothic for the board, the masthead and section names, set against a sturdy contemporary text serif for headlines and body. Both are self-hosted through next/font.

### Hierarchy
- **Wordmark** (850, clamp(2rem → 3.25rem), lh 0.92, wdth 68, uppercase): "BILWI" in ink and "NOTICIAS" in rubric teal. Both are white on a board.
- **Wayfinding** (850, clamp(2.25rem → 3.75rem), wdth 68, uppercase): page titles, section names, the "Orden del día" title and admin page titles.
- **Headline** (700, clamp(2.125rem → 3.5rem), lh 1.06, -0.018em): article titles. The board lead uses 650 at up to 2.75rem.
- **Title** (600, 1.1875–1.625rem, lh 1.16–1.25): story headlines in lists and cards.
- **Body** (400, 18–20px, lh 1.68, max 66ch): article text, set on a fixed measure.
- **UI** (600, 15px): buttons, navigation and form labels (14px).
- **Label** (13px, tabular numerals): the story label, which reads section · date · author.
- **Tile numerals** (800, wdth 68, tabular): 20/32/46px at sizes sm/md/lg.

### Named Rules
**The Read-in-Serif Rule.** Anything a person reads as content (headlines, summaries, body, comments) is set in Source Serif 4. Archivo is for finding your way and operating controls.

**The No-Kicker Rule.** No label sits above a heading. The story label goes below the headline.

## Layout

The container is 1240px with gutters of 16, 24 and 40px at 0, 720 and 1200px. Spacing follows a 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64), with more space above a heading than below it. Layout is mobile-first. The board stacks the lead above 02–05, then splits 7fr/5fr from 980px, where 02–05 stretch into equal slots matching the lead's height. The front body splits 8fr/3.2fr from 1080px, and its right rail (latest and send-a-tip) is sticky. Section and related grids run 1, 2 and then 3 columns. The article column is centred at 820px, with body text capped at 66ch and the figure at 1100px. Navigation rows scroll horizontally on phones instead of collapsing into a hamburger menu. The admin panel uses a 256px board sidebar from 1024px and an off-canvas drawer below that. Admin tables stack into rows below 640px.

## Elevation & Depth

The system is flat. Depth comes from the board (a dark plane against paper), from rules (3px ink to open a section, 1px hairline between items) and from the faint admin wash under white panels. There is no box-shadow anywhere. The only halo is the 3px rubric-teal wash behind a focused field.

**The Flat Paper Rule.** Nothing floats. Separation comes from rules and grounds, never from shadows.

## Shapes

Corners are nearly square: 3px on tiles, 4px on controls, 6px on panels, and 2px on photos. Status pills and filter chips are the only fully rounded shapes. Photos keep fixed ratios: 16:10 for the board lead, 3:2 for stacked cards and section leads, 4:3 for list thumbnails and 16:9 for article figures. When an image fails to load, its box keeps the ratio and shows the section name in condensed capitals.

## Components

### Tiles (signature)
A tile is a white enamel block on the board, or a board-coloured block on paper. Its numerals are condensed and tabular. It shows rank on the board (01–05) and counts in Secciones and the admin panel. An empty count uses a dashed outline tile with "–", never "00". On load, board tiles slide down into their slots once over 620ms, staggered 80ms per slot with ease-out-expo. This is skipped when the reader prefers reduced motion.

### Buttons
- **Shape:** gently squared (4px), 44px tall, or 34px for the small size.
- **Primary:** rubric teal with white text. Hover deepens to #084a4d, and pressing nudges it down 1px.
- **Secondary:** paper with a 1px ink border, which inverts to ink on hover.
- **Ghost:** transparent, with a wash on hover.
- **Disabled:** 55% opacity and a not-allowed cursor.

### Story label and story row
The label reads Section (rubric teal, bold) · date · author, at 13px with tabular numerals. In a row, a 112px 4:3 thumbnail sits beside the headline; from 720px in result lists the thumbnail is 240px. The stacked variant puts a 3:2 image above a larger headline. On hover, images scale to 1.03 over 600ms and headlines get a 2px teal underline.

### Inputs
Inputs are 46px tall with 16px text, a 1px #868b91 border and 4px corners. Focus gives a teal border plus a 3px teal-wash halo. When invalid, the border turns red and a bold 14px message appears below. Labels always sit above the field, and optional hints follow in Ink 3.

### Logo and isotipo (signature)
The isotipo, **"La Ola"**, is a board tile (100×100, 7-unit corners) with a cut-out condensed **B**. Under the B a single gentle wave crosses the tile from edge to edge: the Caribbean horizon in front of Puerto Cabezas, drawn as one line rather than an illustration of the sea, so the mark stays sober and legible down to 16px. The logotipo is "BILWI NOTICIAS" in Archivo wdth 68 / wght 850, converted to paths: "BILWI" in ink and "NOTICIAS" in rubric teal. There are three lockups: horizontal (tile at 1.45× the cap height, gap of 0.28× the tile), vertical (tile on top, name in two centred lines) and the name alone. Each comes in five versions: positive, negative, black and white monochromes (the cut shows the ground) and a teal tile. Files are in `public/marca/` (SVG and PNG) and the guidelines live at `/marca`. In the UI, `components/brand.tsx` draws it with three tokens (`--logo-ink`, `--logo-accent`, `--logo-cut`). On paper they are ink, teal and paper. On board surfaces (footer, sidebar, login, section headers) all three switch to the board's two values. Clear space is half the tile height. The minimum size is 24px tall for the horizontal lockup and 16px for the isotipo.

### Video (YouTube / Facebook)
Videos are linked, never hosted: the editor pastes a YouTube or Facebook link (videos, Shorts, Reels) and it sits in the body like an image, at up to 760px. Until the reader taps play, only a facade renders. YouTube gets its thumbnail, proxied through the image optimizer, and Facebook gets a board-colour panel. Both show a 72px round play button on translucent ink, which turns teal on hover or focus, plus a small platform tag. Tapping swaps in the platform's player (YouTube in its no-cookie mode). Shorts and Reels use a 9:16 frame capped at 360px. The figcaption carries the caption in Secondary Ink and, aligned right, the teal "Ver en {red} ↗" link.

### Language switch and translations
The masthead utility row carries a compact segmented switch («ES | EN», Miskitu «MIQ» to come): 1px line border, 0.75rem bold labels, and the current language as an inverted tile. It is a plain link to the same page in the other language (`/en/…` prefix), so the whole page reloads with the right `lang`. Untranslated stories keep their Spanish text marked `lang="es"`; in lists their label ends with an italic «In Spanish», and the article opens with an Info notice above the headline. In the editor, language tabs sit at the top right of the text panel (wash track, selected tab on paper), each with its state in small print: Original, Traducida (ok ink), Incompleta (warn ink), Sin traducir (Secondary Ink).

### Theme toggle
A 36px square button (32px in the masthead utility row, also on the login screen and the admin bar): moon in light mode, sun in dark mode, 1px line border that darkens on hover. The preference is saved for the whole site and kept in sync across open tabs.

### Navigation
- **Masthead:** a utility row (date, Nosotros, Contacto, Redacción), then the wordmark and search, then the section row between a 1px ink rule and a hairline. The active section turns teal with a 3px underline. On hover, the underline scales in from the left.
- **Ticker:** a board strip with a white "Último minuto" tile and a marquee that pauses on hover and becomes static when the reader prefers reduced motion.
- **Admin sidebar:** a board drawer. The active item is an inverted tile, and a hovered item gets a 1px white outline.

### Status pills
Pills are fully rounded and 13px semibold, with a 7px dot. They come in ok, warn, info, neutral and danger. Story states use published / draft / scheduled / archived; comments use approved / pending / rejected / spam.

## Do's and Don'ts

### Do:
- **Do** keep the board to exactly #15171a and #ffffff.
- **Do** express rank with tile numbers and keep the headline sizes in a list equal.
- **Do** set reading text in Source Serif 4 at 18px or more, at most 66ch wide, on pure white paper.
- **Do** open every section with a 3px ink rule and a condensed uppercase name.
- **Do** show only real content, and show a clear empty state when there is none.
- **Do** use the surface tone (#f3f1ec / #1c1f22) only as the admin work field and quiet bands under content.
- **Do** read colours from tokens so both themes stay correct.

### Don't:
- **Don't** put teal, grey or translucent white on the board.
- **Don't** add shadows, gradients, glass or coloured side stripes on cards.
- **Don't** place a kicker or eyebrow label above a heading.
- **Don't** set reading text on the surface tone; reading grounds are paper (#ffffff / #121416).
- **Don't** invent read counts, popularity rankings, ads or placeholder stories.
