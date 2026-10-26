// node rasterize.cjs <projectRoot> <brandDataJson>
const path = require("node:path");
const fs = require("node:fs");
const root = process.argv[2];
const sharp = require(path.join(root, "node_modules", "sharp"));
const d = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const marca = path.join(root, "public", "marca");
const png = path.join(marca, "png");
fs.mkdirSync(png, { recursive: true });

const INK = "#15171A";

async function toPng(svgFile, outFile, width) {
  const svg = fs.readFileSync(path.join(marca, svgFile));
  await sharp(svg, { density: 600 }).resize({ width }).png({ compressionLevel: 9 }).toFile(outFile);
}

// Pieza a medida: el isotipo a sangre (sin esquinas) con margen opcional, para íconos de app.
function iconSvg(size, inset) {
  const s = (size - inset * 2) / d.tile;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<rect width="${size}" height="${size}" fill="${INK}"/>` +
      `<g transform="translate(${inset} ${inset}) scale(${s})"><path d="${d.isoB}" fill="#fff"/><path d="${d.isoBar}" fill="#fff"/></g></svg>`,
  );
}

// Imagen para compartir (1200x630): tablero con el logo vertical en negativo y la región.
function ogSvg() {
  const W = 1200, H = 630;
  const tileH = 190, cap = d.capHeight, scaleWord = 1.28;
  const wordW = d.wordWidth * scaleWord;
  const groupW = tileH + 48 + wordW;
  const x0 = (W - groupW) / 2;
  const y0 = 205;
  const tagScale = 0.26;
  const tagW = d.taglineWidth * tagScale;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<rect width="${W}" height="${H}" fill="${INK}"/>` +
      `<g transform="translate(${x0} ${y0}) scale(${tileH / d.tile})"><path d="${d.tilePath}" fill="#fff"/><path d="${d.isoB}" fill="${INK}"/><path d="${d.isoBar}" fill="${INK}"/></g>` +
      `<g transform="translate(${x0 + tileH + 48} ${y0 + (tileH + cap * scaleWord) / 2}) scale(${scaleWord})"><path d="${d.bilwi}" fill="#fff"/><path d="${d.noticias}" fill="#fff"/></g>` +
      `<rect x="${(W - groupW) / 2}" y="${y0 + tileH + 56}" width="${groupW}" height="3" fill="#fff"/>` +
      `<g transform="translate(${(W - tagW) / 2} ${y0 + tileH + 56 + 44}) scale(${tagScale})"><path d="${d.tagline}" fill="#fff"/></g>` +
      `</svg>`,
  );
}

(async () => {
  const exports = [
    ["isotipo-positivo.svg", 1024],
    ["isotipo-negativo.svg", 1024],
    ["isotipo-color.svg", 1024],
    ["isotipo-monocromo-negro.svg", 1024],
    ["isotipo-monocromo-blanco.svg", 1024],
    ["logotipo-positivo.svg", 2000],
    ["logotipo-negativo.svg", 2000],
    ["logotipo-monocromo-negro.svg", 2000],
    ["logotipo-monocromo-blanco.svg", 2000],
    ["logo-horizontal-positivo.svg", 2000],
    ["logo-horizontal-negativo.svg", 2000],
    ["logo-horizontal-monocromo-negro.svg", 2000],
    ["logo-horizontal-monocromo-blanco.svg", 2000],
    ["logo-vertical-positivo.svg", 1200],
    ["logo-vertical-negativo.svg", 1200],
    ["logo-vertical-monocromo-negro.svg", 1200],
    ["logo-vertical-monocromo-blanco.svg", 1200],
  ];
  for (const [file, width] of exports) {
    await toPng(file, path.join(png, file.replace(".svg", ".png")), width);
  }

  // Íconos de la app: Apple (180), PWA (192, 512) y "maskable" con zona segura.
  const app = path.join(root, "app");
  await sharp(iconSvg(180, 0)).png().toFile(path.join(app, "apple-icon.png"));
  await sharp(iconSvg(192, 0)).png().toFile(path.join(marca, "icon-192.png"));
  await sharp(iconSvg(512, 0)).png().toFile(path.join(marca, "icon-512.png"));
  await sharp(iconSvg(512, 80)).png().toFile(path.join(marca, "icon-maskable-512.png"));

  // Imagen al compartir el sitio (las noticias usan su propia foto).
  await sharp(ogSvg()).png({ compressionLevel: 9 }).toFile(path.join(app, "opengraph-image.png"));
  await sharp(ogSvg()).png({ compressionLevel: 9 }).toFile(path.join(app, "twitter-image.png"));
  fs.writeFileSync(path.join(app, "opengraph-image.alt.txt"), "Bilwi Noticias, Costa Caribe Norte de Nicaragua");
  fs.writeFileSync(path.join(app, "twitter-image.alt.txt"), "Bilwi Noticias, Costa Caribe Norte de Nicaragua");

  // Favicon SVG = isotipo positivo.
  fs.copyFileSync(path.join(marca, "isotipo-positivo.svg"), path.join(app, "icon.svg"));
  console.log("ok");
})();
