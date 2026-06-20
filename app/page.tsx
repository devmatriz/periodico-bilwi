import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { editorialSections, popularStories, videoStories } from "@/lib/site-data";
import { getFeaturedNoticias, getRecentNoticias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredStories = await getFeaturedNoticias();
  const recentStories = await getRecentNoticias(4);
  const topStory = featuredStories[0] ?? recentStories[0];

  return (
    <PublicShell>
      <section className="public-page">
        <div className="hero">
          <article className="hero-main">
            <div className="hero-main-content">
              <span className="eyebrow">{topStory?.category ?? "Noticias"} </span>
              <h1>{topStory?.title ?? "Bilwi Noticias sigue creciendo"}</h1>
              <p className="muted">
                {topStory?.excerpt ??
                  "La portada se actualiza desde el panel de administracion con la informacion mas reciente."}
              </p>
              <div className="hero-meta">
                <span>{topStory?.author ?? "Redaccion Bilwi"}</span>
                <span>{topStory?.time ?? "Actualizacion continua"}</span>
              </div>
            </div>
          </article>

          <div className="hero-stack">
            {(featuredStories.slice(1).length > 0 ? featuredStories.slice(1) : recentStories.slice(1)).map((story) => (
              <article
                key={story.slug}
                className="hero-side-card"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.72)), url(${story.image})` }}
              >
                <div className="hero-side-card-content">
                  <span className="eyebrow">{story.category}</span>
                  <h3>{story.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 28 }}>
          <div>
            <span className="eyebrow">Secciones</span>
            <h2>Portadas rapidas del periodico</h2>
          </div>
          <Link className="nav-link" href="/categorias">
            Ver todas las secciones
          </Link>
        </div>

        <div className="category-grid">
          {editorialSections.map((section, index) => (
            <Link
              key={section.href}
              href={section.href}
              className={`category-card${index === 0 ? " category-card--featured" : ""}`}
              style={{
                backgroundImage: `${section.background}, url(${section.image})`,
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="category-card-content">
                <div className="category-card-top">
                  <span className="eyebrow">{section.label}</span>
                  <span className="category-badge">{section.badge}</span>
                </div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
                <div className="category-note">
                  <span className="category-chip">Abrir seccion</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-title" style={{ marginTop: 8 }}>
          <div>
            <span className="eyebrow">Cobertura por seccion</span>
            <h2>Lo mas reciente ordenado por tema</h2>
          </div>
          <Link className="nav-link" href="/categorias">
            Explorar secciones
          </Link>
        </div>

        <div className="news-grid">
          {editorialSections.map((highlight, index) => (
            <Link
              key={highlight.label}
              href={highlight.href}
              className="news-card"
            >
              <div
                className="news-card-image"
                style={{
                  backgroundImage:
                    index === 0
                      ? "linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.72)), url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80)"
                      : index === 1
                        ? "linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.72)), url(https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1200&q=80)"
                        : index === 2
                          ? "linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.72)), url(https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80)"
                          : "linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.72)), url(https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80)",
                }}
              />
              <div className="news-card-body">
                <span className="eyebrow">{highlight.label}</span>
                <h3>{highlight.feature}</h3>
                <p>{highlight.intro}</p>
                <p className="article-meta">{highlight.meta}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="layout-grid">
          <section>
            <div className="section-title">
              <div>
                <span className="eyebrow">Noticias recientes</span>
                <h2>Contenido destacado para la audiencia local</h2>
              </div>
              <Link className="nav-link" href="/noticias">
                Ver todas
              </Link>
            </div>

            <div className="news-grid">
              {recentStories.map((story) => (
                <Link key={story.slug} href={`/noticias/${story.slug}`} className="news-card">
                  <div
                    className="news-card-image"
                    style={{ backgroundImage: `url(${story.image})` }}
                  />
                  <div className="news-card-body">
                    <span className="eyebrow">{story.category}</span>
                    <h3>{story.title}</h3>
                    <p>{story.excerpt}</p>
                    <p className="article-meta">
                      {story.time} · {story.author}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <section className="video-section">
              <div className="section-title">
                <div>
                  <span className="eyebrow">Ultimos Videos</span>
                  <h2>Recursos multimedia para historia y contexto</h2>
                </div>
              </div>

              <div className="video-row">
                {videoStories.map((video) => (
                  <article
                    key={video.title}
                    className="video-card"
                    style={{ backgroundImage: `url(${video.image})` }}
                  >
                    <span className="video-play" />
                    <span>{video.title}</span>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="sidebar">
            <section className="sidebar-card">
              <h2>Mas Populares</h2>
              <div className="popular-list">
                {popularStories.map((item, index) => (
                  <div key={item} className="popular-item">
                    <div className="popular-index">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <p>{item}</p>
                      <p className="article-meta">{1_245 - index * 263} Lecturas</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="ads-card sidebar-card">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Publicidad
              </span>
              <h2>Descubre el paraiso en Corn Island</h2>
              <Link className="button button-primary" href="/contacto">
                Reservar Ahora
              </Link>
            </section>

            <section className="sidebar-card newsletter-card">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Boletin Informativo
              </span>
              <h2>Recibe las noticias mas importantes de Bilwi por correo</h2>
              <label className="search-field" style={{ margin: "18px 0" }}>
                <input type="email" placeholder="Tu correo electronico" />
              </label>
              <button className="button" type="button">
                Suscribirme
              </button>
            </section>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
