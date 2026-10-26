import type { Metadata } from "next";
import { Logo } from "@/components/brand";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Identidad visual",
  description: "Logotipo, isotipo, versiones, colores y tipografía de Bilwi Noticias, con archivos para descargar.",
};

type Version = {
  name: string;
  file: string;
  ground: "paper" | "board" | "wash";
  use: string;
};

const families: Array<{ title: string; text: string; ratio: "square" | "wide" | "tall"; versions: Version[] }> = [
  {
    title: "Logo horizontal",
    text: "La versión principal. Se usa en la cabecera del sitio, documentos, membretes y firmas.",
    ratio: "wide",
    versions: [
      { name: "Positivo", file: "logo-horizontal-positivo", ground: "paper", use: "Sobre fondos claros" },
      { name: "Negativo", file: "logo-horizontal-negativo", ground: "board", use: "Sobre fondos oscuros" },
      { name: "Monocromo negro", file: "logo-horizontal-monocromo-negro", ground: "wash", use: "Una tinta: sellos, impresión a una tinta" },
      { name: "Monocromo blanco", file: "logo-horizontal-monocromo-blanco", ground: "board", use: "Una tinta sobre fotos u oscuros" },
    ],
  },
  {
    title: "Logo vertical",
    text: "Para espacios cuadrados o altos: portadas de redes, carteles, camisetas, credenciales.",
    ratio: "tall",
    versions: [
      { name: "Positivo", file: "logo-vertical-positivo", ground: "paper", use: "Sobre fondos claros" },
      { name: "Negativo", file: "logo-vertical-negativo", ground: "board", use: "Sobre fondos oscuros" },
      { name: "Monocromo negro", file: "logo-vertical-monocromo-negro", ground: "wash", use: "Una tinta" },
      { name: "Monocromo blanco", file: "logo-vertical-monocromo-blanco", ground: "board", use: "Una tinta sobre oscuros" },
    ],
  },
  {
    title: "Isotipo",
    text: "La ficha sola. Para perfiles de redes, ícono de la app, favicon y marcas de agua en fotos.",
    ratio: "square",
    versions: [
      { name: "Positivo", file: "isotipo-positivo", ground: "paper", use: "Sobre fondos claros" },
      { name: "Negativo", file: "isotipo-negativo", ground: "board", use: "Sobre fondos oscuros" },
      { name: "Color", file: "isotipo-color", ground: "paper", use: "Perfiles y piezas institucionales" },
      { name: "Monocromo negro", file: "isotipo-monocromo-negro", ground: "wash", use: "Calado: deja ver el fondo" },
      { name: "Monocromo blanco", file: "isotipo-monocromo-blanco", ground: "board", use: "Calado sobre fotos u oscuros" },
    ],
  },
  {
    title: "Logotipo",
    text: "Solo el nombre, cuando el isotipo ya aparece cerca o el espacio es muy angosto.",
    ratio: "wide",
    versions: [
      { name: "Positivo", file: "logotipo-positivo", ground: "paper", use: "Sobre fondos claros" },
      { name: "Negativo", file: "logotipo-negativo", ground: "board", use: "Sobre fondos oscuros" },
      { name: "Monocromo negro", file: "logotipo-monocromo-negro", ground: "wash", use: "Una tinta" },
      { name: "Monocromo blanco", file: "logotipo-monocromo-blanco", ground: "board", use: "Una tinta sobre oscuros" },
    ],
  },
];

const colors = [
  { name: "Tinta del tablero", hex: "#15171A", rgb: "21 23 26", use: "Isotipo, “BILWI”, tablero y pie del sitio", dark: true },
  { name: "Petróleo de rúbrica", hex: "#0A5F63", rgb: "10 95 99", use: "“NOTICIAS”, enlaces y botones", dark: true },
  { name: "Papel", hex: "#FFFFFF", rgb: "255 255 255", use: "Fondo y versiones en negativo", dark: false },
  { name: "Petróleo claro", hex: "#5CC4BE", rgb: "92 196 190", use: "Acento en el modo oscuro del sitio", dark: false },
];

const misuse = [
  "Cambiar los colores fuera de las versiones de esta página.",
  "Estirar, inclinar o girar el logo.",
  "Quitar la línea del horizonte o separar la B de la ficha.",
  "Escribir el nombre con otra letra en lugar de usar el archivo.",
  "Poner la versión positiva sobre fondos oscuros o fotos recargadas.",
  "Agregar sombras, contornos o efectos.",
];

export default function MarcaPage() {
  return (
    <PublicShell compact>
      <section className="section-board" aria-labelledby="marca-title">
        <div className="wrap section-board-inner brand-hero">
          <div>
            <h1 id="marca-title" className="section-board-name">
              Identidad visual
            </h1>
            <p className="section-board-title">La ficha del tablero</p>
            <p className="section-board-desc">
              Logotipo, isotipo, versiones y colores de Bilwi Noticias, con los archivos listos para usar.
            </p>
          </div>
          <Logo variant="ficha" className="brand-hero-mark" title="Isotipo de Bilwi Noticias" />
        </div>
      </section>

      <div className="wrap page brand">
        <section className="brand-concept" aria-labelledby="concepto">
          <h2 id="concepto" className="rail-title">
            Concepto
          </h2>
          <div className="brand-concept-grid">
            <div className="prose">
              <p>
                El isotipo es una ficha del tablero de avisos que cuelga en la entrada de los salones comunales de la
                costa: un cuadro oscuro con la <strong>B</strong> de Bilwi calada.
              </p>
              <p>
                La línea que cruza la ficha de lado a lado cumple dos papeles. Es la regla gruesa que abre cada sección del
                periódico y es el horizonte del Caribe frente a Puerto Cabezas, sobre el que se apoya la B.
              </p>
              <p>
                El nombre usa Archivo condensada en su peso más fuerte, la misma letra de los titulares de sección del
                sitio, convertida a trazos para que se vea igual en cualquier programa.
              </p>
            </div>
            <div className="brand-anatomy" aria-hidden="true">
              <Logo variant="ficha" title="" />
              <ul>
                <li>
                  <span className="tile tile--sm">1</span> La ficha: el tablero de avisos
                </li>
                <li>
                  <span className="tile tile--sm">2</span> La B calada de Bilwi
                </li>
                <li>
                  <span className="tile tile--sm">3</span> La línea: regla de sección y horizonte
                </li>
              </ul>
            </div>
          </div>
        </section>

        {families.map((family) => (
          <section key={family.title} className="brand-family" aria-labelledby={`fam-${family.versions[0].file}`}>
            <header className="front-section-head">
              <h2 id={`fam-${family.versions[0].file}`}>{family.title}</h2>
            </header>
            <p className="brand-family-text">{family.text}</p>
            <ul className={`brand-grid brand-grid--${family.ratio}`}>
              {family.versions.map((version) => (
                <li key={version.file} className="brand-card">
                  <div className={`brand-swatch brand-swatch--${version.ground}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/marca/${version.file}.svg`} alt={`${family.title}, versión ${version.name.toLowerCase()}`} loading="lazy" />
                  </div>
                  <div className="brand-card-body">
                    <h3>{version.name}</h3>
                    <p>{version.use}</p>
                    <p className="brand-downloads">
                      <a href={`/marca/${version.file}.svg`} download>
                        SVG
                      </a>
                      <a href={`/marca/png/${version.file}.png`} download>
                        PNG
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="brand-family" aria-labelledby="colores">
          <header className="front-section-head">
            <h2 id="colores">Colores</h2>
          </header>
          <ul className="brand-colors">
            {colors.map((color) => (
              <li key={color.hex}>
                <span className={`brand-color-chip${color.dark ? "" : " brand-color-chip--light"}`} style={{ background: color.hex }} />
                <h3>{color.name}</h3>
                <p className="brand-color-code">
                  {color.hex} · RGB {color.rgb}
                </p>
                <p>{color.use}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="brand-family" aria-labelledby="tipografia">
          <header className="front-section-head">
            <h2 id="tipografia">Tipografía</h2>
          </header>
          <div className="brand-type">
            <div>
              <p className="brand-type-sample brand-type-sample--display">Archivo condensada</p>
              <p>Logotipo, titulares de sección, navegación y rótulos. Pesos 600 a 850.</p>
            </div>
            <div>
              <p className="brand-type-sample brand-type-sample--serif">Source Serif 4</p>
              <p>Titulares de noticias y textos de lectura. Pesos 400 a 700.</p>
            </div>
          </div>
          <p className="form-hint">Ambas son tipografías libres (licencia OFL) disponibles en Google Fonts.</p>
        </section>

        <section className="brand-family" aria-labelledby="uso">
          <header className="front-section-head">
            <h2 id="uso">Uso correcto</h2>
          </header>
          <div className="brand-rules">
            <div className="brand-rule">
              <div className="brand-clearspace" aria-hidden="true">
                <Logo title="" />
              </div>
              <h3>Área de protección</h3>
              <p>Deja alrededor del logo un espacio libre igual a la mitad del alto de la ficha.</p>
            </div>
            <div className="brand-rule">
              <div className="brand-minsize" aria-hidden="true">
                <Logo title="" className="brand-min-logo" />
                <Logo variant="ficha" title="" className="brand-min-mark" />
              </div>
              <h3>Tamaño mínimo</h3>
              <p>Logo horizontal: 24 px de alto en pantalla o 8 mm impreso. Isotipo: 16 px o 5 mm.</p>
            </div>
            <div className="brand-rule">
              <h3>Evita</h3>
              <ul className="brand-misuse">
                {misuse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
