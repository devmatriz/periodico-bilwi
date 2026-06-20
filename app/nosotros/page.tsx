import { PublicShell } from "@/components/public-shell";

export default function NosotrosPage() {
  return (
    <PublicShell compact>
      <section className="content-page">
        <div className="split-hero">
          <div className="split-hero__panel split-hero__panel--content">
            <div className="split-hero__panel-content">
            <span className="eyebrow">Nuestra historia</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", marginTop: 12 }}>
              Voz del Caribe Nicaraguense
            </h1>
            <p>
              Fundado en el corazon de Puerto Cabezas, Bilwi Noticias nacio de la necesidad
              de contar las historias que definen nuestra identidad costeña.
            </p>
              <blockquote
                style={{
                  margin: "24px 0 0",
                  paddingLeft: 16,
                  borderLeft: "3px solid var(--primary)",
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                }}
              >
                Informando con integridad desde las costas de Bilwi para todo el mundo.
              </blockquote>
            </div>
          </div>

          <div
            className="split-hero__visual"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.18)), url("https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80")',
            }}
          />
        </div>

        <div className="about-grid">
          <article className="editor-card editor-card--soft about-card">
            <span className="eyebrow">Nuestra mision</span>
            <p>
              Proveer una plataforma informativa veraz, bilingue e intercultural que empodere
              a las comunidades de la Costa Caribe de Nicaragua.
            </p>
          </article>
          <article className="editor-card editor-card--soft about-card">
            <span className="eyebrow">Nuestra vision</span>
            <p>
              Ser el referente informativo lider del Caribe, conectando nuestras raices locales
              con una audiencia amplia mediante innovacion digital y rigor etico.
            </p>
          </article>
          <article className="editor-card editor-card--soft about-card">
            <span className="eyebrow">Compromiso</span>
            <p>
              Periodismo cercano, legible y util para la vida diaria de Bilwi y la Costa Caribe.
            </p>
          </article>
          <article className="editor-card editor-card--soft about-card">
            <span className="eyebrow">Equipo</span>
            <p>Redaccion, fotografia, edicion, analisis y cobertura comunitaria.</p>
          </article>
        </div>
      </section>
    </PublicShell>
  );
}
