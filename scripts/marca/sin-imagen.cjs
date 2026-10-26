// node scripts/marca/sin-imagen.cjs . scripts/marca/brand-data.json
// Imagen por defecto para noticias sin foto: el tablero con el logo horizontal en negativo.
const path = require("node:path");
const fs = require("node:fs");
const root = process.argv[2];
const sharp = require(path.join(root, "node_modules", "sharp"));
const d = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));

const W = 1600;
const H = 1000;
const INK = "#15171A";
const tileH = 150;
const scaleWord = tileH / d.horizontal.tileH;
const groupW = d.horizontal.width * scaleWord;
const x0 = (W - groupW) / 2;
const y0 = (H - tileH) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${INK}"/>
<g transform="translate(${x0} ${y0}) scale(${scaleWord})">
  <g transform="scale(${d.horizontal.tileH / d.tile})"><path d="${d.tilePath}" fill="#fff"/><path d="${d.isoB}" fill="${INK}"/><path d="${d.isoBar}" fill="${INK}"/></g>
  <g transform="translate(${d.horizontal.tileH + d.horizontal.gap} ${(d.horizontal.tileH + d.capHeight) / 2})"><path d="${d.bilwi}" fill="#fff"/><path d="${d.noticias}" fill="#fff"/></g>
</g>
</svg>`;

sharp(Buffer.from(svg))
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(root, "public", "marca", "sin-imagen.jpg"))
  .then(() => console.log("ok"));
