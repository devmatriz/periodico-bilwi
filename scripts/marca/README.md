# Identidad visual: generación de archivos

Los logos de `public/marca/`, los íconos de `app/` y `lib/brand-paths.ts` salen de estos dos scripts.
Las letras se convierten a trazos desde Archivo (licencia OFL), así los archivos no dependen de la fuente instalada.

1. Descarga la fuente variable junto a estos scripts:
   `curl -L -o scripts/marca/Archivo.ttf "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf"`
2. `pip install fonttools`
3. `python scripts/marca/make_brand.py public/marca` (escribe los SVG y `scripts/marca/brand-data.json`)
4. `node scripts/marca/rasterize.cjs . scripts/marca/brand-data.json` (PNG, íconos y la imagen para compartir)
5. Copia los trazos a `lib/brand-paths.ts` si cambió el diseño (claves `tilePath`, `isoB`, `isoBar`, `bilwi`, `noticias`, `wordWidth`, `capHeight`, `horizontal`).
