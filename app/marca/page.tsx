import type { Metadata } from "next";
import { Logo } from "@/components/brand";
import { PublicShell } from "@/components/public-shell";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.brand.metaTitle, description: t.brand.metaDescription, alternates: localizedAlternates(locale, "/marca") };
}

type VersionKey = "positive" | "negative" | "color" | "monoBlack" | "monoWhite";
type UseKey = "light" | "dark" | "oneInkPrint" | "oneInkPhotos" | "oneInk" | "oneInkDark" | "institutional" | "knockout" | "knockoutPhotos";
type Version = { version: VersionKey; file: string; ground: "paper" | "board" | "wash"; use: UseKey };

const families: Array<{ key: "horizontal" | "vertical" | "isotipo" | "logotipo"; ratio: "square" | "wide" | "tall"; versions: Version[] }> = [
  {
    key: "horizontal",
    ratio: "wide",
    versions: [
      { version: "positive", file: "logo-horizontal-positivo", ground: "paper", use: "light" },
      { version: "negative", file: "logo-horizontal-negativo", ground: "board", use: "dark" },
      { version: "monoBlack", file: "logo-horizontal-monocromo-negro", ground: "wash", use: "oneInkPrint" },
      { version: "monoWhite", file: "logo-horizontal-monocromo-blanco", ground: "board", use: "oneInkPhotos" },
    ],
  },
  {
    key: "vertical",
    ratio: "tall",
    versions: [
      { version: "positive", file: "logo-vertical-positivo", ground: "paper", use: "light" },
      { version: "negative", file: "logo-vertical-negativo", ground: "board", use: "dark" },
      { version: "monoBlack", file: "logo-vertical-monocromo-negro", ground: "wash", use: "oneInk" },
      { version: "monoWhite", file: "logo-vertical-monocromo-blanco", ground: "board", use: "oneInkDark" },
    ],
  },
  {
    key: "isotipo",
    ratio: "square",
    versions: [
      { version: "positive", file: "isotipo-positivo", ground: "paper", use: "light" },
      { version: "negative", file: "isotipo-negativo", ground: "board", use: "dark" },
      { version: "color", file: "isotipo-color", ground: "paper", use: "institutional" },
      { version: "monoBlack", file: "isotipo-monocromo-negro", ground: "wash", use: "knockout" },
      { version: "monoWhite", file: "isotipo-monocromo-blanco", ground: "board", use: "knockoutPhotos" },
    ],
  },
  {
    key: "logotipo",
    ratio: "wide",
    versions: [
      { version: "positive", file: "logotipo-positivo", ground: "paper", use: "light" },
      { version: "negative", file: "logotipo-negativo", ground: "board", use: "dark" },
      { version: "monoBlack", file: "logotipo-monocromo-negro", ground: "wash", use: "oneInk" },
      { version: "monoWhite", file: "logotipo-monocromo-blanco", ground: "board", use: "oneInkDark" },
    ],
  },
];

const colorValues = [
  { hex: "#15171A", rgb: "21 23 26", dark: true },
  { hex: "#0A5F63", rgb: "10 95 99", dark: true },
  { hex: "#FFFFFF", rgb: "255 255 255", dark: false },
  { hex: "#5CC4BE", rgb: "92 196 190", dark: false },
];

/** Párrafo con **negritas**. */
function Rich({ text }: { text: string }) {
  return (
    <p>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
        part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
      )}
    </p>
  );
}

export default async function MarcaPage() {
  const { t } = await getI18n();
  const b = t.brand;

  return (
    <PublicShell compact>
      <section className="section-board" aria-labelledby="marca-title">
        <div className="wrap section-board-inner brand-hero">
          <div>
            <h1 id="marca-title" className="section-board-name">
              {b.title}
            </h1>
            <p className="section-board-title">{b.subtitle}</p>
            <p className="section-board-desc">{b.intro}</p>
          </div>
          <Logo variant="ficha" className="brand-hero-mark" title={b.markAlt} />
        </div>
      </section>

      <div className="wrap page brand">
        <section className="brand-concept" aria-labelledby="concepto">
          <h2 id="concepto" className="rail-title">
            {b.concept}
          </h2>
          <div className="brand-concept-grid">
            <div className="prose">
              {b.conceptParagraphs.map((text) => (
                <Rich key={text} text={text} />
              ))}
            </div>
            <div className="brand-anatomy" aria-hidden="true">
              <Logo variant="ficha" title="" />
              <ul>
                {b.anatomy.map((item, index) => (
                  <li key={item}>
                    <span className="tile tile--sm">{index + 1}</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {families.map((family) => {
          const text = b.families[family.key];
          return (
            <section key={family.key} className="brand-family" aria-labelledby={`fam-${family.key}`}>
              <header className="front-section-head">
                <h2 id={`fam-${family.key}`}>{text.title}</h2>
              </header>
              <p className="brand-family-text">{text.text}</p>
              <ul className={`brand-grid brand-grid--${family.ratio}`}>
                {family.versions.map((version) => (
                  <li key={version.file} className="brand-card">
                    <div className={`brand-swatch brand-swatch--${version.ground}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/marca/${version.file}.svg`} alt={b.versionAlt(text.title, b.versions[version.version])} loading="lazy" />
                    </div>
                    <div className="brand-card-body">
                      <h3>{b.versions[version.version]}</h3>
                      <p>{b.uses[version.use]}</p>
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
          );
        })}

        <section className="brand-family" aria-labelledby="colores">
          <header className="front-section-head">
            <h2 id="colores">{b.colorsTitle}</h2>
          </header>
          <ul className="brand-colors">
            {colorValues.map((color, index) => (
              <li key={color.hex}>
                <span className={`brand-color-chip${color.dark ? "" : " brand-color-chip--light"}`} style={{ background: color.hex }} />
                <h3>{b.colors[index].name}</h3>
                <p className="brand-color-code">
                  {color.hex} · RGB {color.rgb}
                </p>
                <p>{b.colors[index].use}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="brand-family" aria-labelledby="tipografia">
          <header className="front-section-head">
            <h2 id="tipografia">{b.typeTitle}</h2>
          </header>
          <div className="brand-type">
            <div>
              <p className="brand-type-sample brand-type-sample--display">{b.typeDisplay}</p>
              <p>{b.typeDisplayUse}</p>
            </div>
            <div>
              <p className="brand-type-sample brand-type-sample--serif">Source Serif 4</p>
              <p>{b.typeSerifUse}</p>
            </div>
          </div>
          <p className="form-hint">{b.typeLicense}</p>
        </section>

        <section className="brand-family" aria-labelledby="uso">
          <header className="front-section-head">
            <h2 id="uso">{b.usageTitle}</h2>
          </header>
          <div className="brand-rules">
            <div className="brand-rule">
              <div className="brand-clearspace" aria-hidden="true">
                <Logo title="" />
              </div>
              <h3>{b.clearSpace}</h3>
              <p>{b.clearSpaceText}</p>
            </div>
            <div className="brand-rule">
              <div className="brand-minsize" aria-hidden="true">
                <Logo title="" className="brand-min-logo" />
                <Logo variant="ficha" title="" className="brand-min-mark" />
              </div>
              <h3>{b.minSize}</h3>
              <p>{b.minSizeText}</p>
            </div>
            <div className="brand-rule">
              <h3>{b.avoid}</h3>
              <ul className="brand-misuse">
                {b.misuse.map((item) => (
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
