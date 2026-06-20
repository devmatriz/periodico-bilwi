import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

type Metric = {
  label: string;
  value: string;
};

type SectionStory = {
  title: string;
  excerpt: string;
  tag: string;
  background?: string;
  chips: string[];
};

type SectionLandingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  pills: string[];
  summaryTitle: string;
  summaryDescription: string;
  metrics: Metric[];
  featured: {
    title: string;
    badge: string;
    description: string;
    chips: string[];
    background: string;
  };
  stories: SectionStory[];
  footerTitle: string;
  footerDescription: string;
  footerHref?: string;
  footerLabel?: string;
};

export function SectionLanding({
  eyebrow,
  title,
  intro,
  pills,
  summaryTitle,
  summaryDescription,
  metrics,
  featured,
  stories,
  footerTitle,
  footerDescription,
  footerHref = "/noticias",
  footerLabel = "Ver noticias",
}: SectionLandingProps) {
  return (
    <PublicShell compact>
      <section className="content-page categories-page">
        <div className="categories-hero">
          <div className="categories-intro">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="muted">{intro}</p>
            <div className="pill-row categories-pills">
              {pills.map((pill) => (
                <span key={pill} className="pill">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <aside className="categories-summary">
            <span className="eyebrow">Lectura rapida</span>
            <h2>{summaryTitle}</h2>
            <p>{summaryDescription}</p>

            <div className="categories-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="category-metric">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="category-grid">
          <article
            className="category-card category-card--featured"
            style={{ background: featured.background }}
          >
            <div className="category-card-content">
              <div className="category-card-top">
                <span className="eyebrow">Titular principal</span>
                <span className="category-badge">{featured.badge}</span>
              </div>
              <h2>{featured.title}</h2>
              <p>{featured.description}</p>
              <div className="category-note">
                {featured.chips.map((chip) => (
                  <span key={chip} className="category-chip">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {stories.map((story) => (
            <article
              key={story.title}
              className="category-card"
              style={{
                background:
                  story.background ?? "linear-gradient(135deg, rgba(12,18,28,0.98) 0%, rgba(28,35,48,0.96) 100%)",
              }}
            >
              <div className="category-card-content">
                <div className="category-card-top">
                  <span className="eyebrow">Actualidad</span>
                  <span className="category-badge">{story.tag}</span>
                </div>
                <h2>{story.title}</h2>
                <p>{story.excerpt}</p>
                <div className="category-note">
                  {story.chips.map((chip) => (
                    <span key={chip} className="category-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="categories-foot">
          <div>
            <span className="eyebrow">Mas cobertura</span>
            <strong>{footerTitle}</strong>
            {footerDescription ? <p className="muted">{footerDescription}</p> : null}
          </div>
          <Link className="button button-primary" href={footerHref}>
            {footerLabel}
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
