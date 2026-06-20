import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { relatedStories } from "@/lib/site-data";
import { getPublicNoticias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    periodo?: string;
  }>;
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function localDayKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Managua",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function formatLocalDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function dayKeyDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDayKey(date);
}

export default async function NoticiasPage({ searchParams }: Props) {
  const { q, categoria, periodo } = await searchParams;
  const stories = await getPublicNoticias();
  const query = normalizeSearch(q || "");
  const categoryFilter = normalizeSearch(categoria || "");
  const periodFilter = periodo || "";
  const todayKey = localDayKey(new Date());
  const weekKey = dayKeyDaysAgo(7);
  const monthKey = dayKeyDaysAgo(30);

  const categories = Array.from(new Set(stories.map((story) => story.category))).sort((a, b) =>
    a.localeCompare(b, "es"),
  );

  const filteredStories = stories.filter((story) => {
    const searchable = [story.title, story.excerpt, story.category, story.author, story.content]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const storyDay = localDayKey(new Date(story.publishedAt || story.createdAt || story.updatedAt));

    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory =
      !categoryFilter ||
      normalizeSearch(story.category).includes(categoryFilter) ||
      normalizeSearch(story.slug).includes(categoryFilter);
    const matchesPeriod =
      !periodFilter ||
      periodFilter === "all" ||
      (periodFilter === "today" && storyDay === todayKey) ||
      (periodFilter === "week" && storyDay >= weekKey) ||
      (periodFilter === "month" && storyDay >= monthKey);

    return matchesQuery && matchesCategory && matchesPeriod;
  });

  const activeFilters = [query, categoria, periodo].filter(Boolean).length;

  return (
    <PublicShell compact>
      <section className="news-page">
        <div className="content-heading">
          <span className="eyebrow">Noticias</span>
          <h1>{query ? `Resultados para "${q}"` : "Ultimas publicaciones"}</h1>
          <p className="muted">
            {query
              ? "Explora coincidencias relacionadas con tu busqueda dentro de la cobertura local."
              : "Un listado editorial para leer, filtrar y descubrir contenido relevante de Bilwi."}
          </p>
        </div>

        <form className="sidebar-card news-filters" action="/noticias" method="get">
          <div className="form-grid">
            <label>
              Buscar
              <input
                name="q"
                type="search"
                placeholder="Titulares, autores o temas..."
                defaultValue={q || ""}
              />
            </label>
            <label>
              Categoria
              <select name="categoria" defaultValue={categoria || ""}>
                <option value="">Todas</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Periodo
              <select name="periodo" defaultValue={periodo || ""}>
                <option value="">Cualquier fecha</option>
                <option value="today">Hoy</option>
                <option value="week">Ultimos 7 dias</option>
                <option value="month">Ultimos 30 dias</option>
                <option value="all">Todo</option>
              </select>
            </label>
          </div>

          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="button button-primary" type="submit">
              Aplicar filtros
            </button>
            <Link className="nav-link" href="/noticias">
              Limpiar
            </Link>
            <span className="article-meta">
              {filteredStories.length} resultado{filteredStories.length === 1 ? "" : "s"}
              {activeFilters > 0
                ? ` · ${activeFilters} filtro${activeFilters === 1 ? "" : "s"} activos`
                : ""}
            </span>
          </div>
        </form>

        <div className="article-layout">
          <section className="news-grid">
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
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
                      {formatLocalDate(story.publishedAt || story.createdAt || story.updatedAt)} ·{" "}
                      {story.author}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <article className="news-card">
                <div className="news-card-body">
                  <span className="eyebrow">Sin resultados</span>
                  <h3>No encontramos coincidencias</h3>
                  <p>Prueba con otro termino o limpia los filtros para ver toda la cobertura.</p>
                </div>
              </article>
            )}
          </section>

          <aside className="sidebar">
            <section className="sidebar-card">
              <h2>Relacionadas</h2>
              <div className="sidebar-list">
                {relatedStories.map((story) => (
                  <article key={story.title}>
                    <p className="eyebrow">{story.category}</p>
                    <h3 className="sidebar-article-title">{story.title}</h3>
                    <p className="article-meta">{story.time}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="sidebar-card newsletter-card">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Boletin
              </span>
              <h2>Suscribete para recibir lo ultimo de la Costa Caribe</h2>
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
