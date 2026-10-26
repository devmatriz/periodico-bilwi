import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryRow } from "@/components/story";
import { IconSearch, IconX } from "@/components/icons";
import { getPublicNoticias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Todas las noticias de Bilwi Noticias: busca por tema, sección o fecha.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    periodo?: string;
  }>;
};

const periodLabels: Record<string, string> = {
  today: "Hoy",
  week: "Últimos 7 días",
  month: "Últimos 30 días",
  all: "Todo",
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

function dayKeyDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDayKey(date);
}

function withoutParam(params: Record<string, string | undefined>, key: string) {
  const next = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (name !== key && value) next.set(name, value);
  }
  const query = next.toString();
  return query ? `/noticias?${query}` : "/noticias";
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
      .replace(/[̀-ͯ]/g, "");

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

  const params = { q, categoria, periodo };
  const activeFilters = [
    q ? { key: "q", label: `“${q}”` } : null,
    categoria ? { key: "categoria", label: categoria } : null,
    periodo ? { key: "periodo", label: periodLabels[periodo] ?? periodo } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;
  const count = filteredStories.length;

  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>{q ? `Resultados para “${q}”` : "Todas las noticias"}</h1>
          <p className="page-lede">
            {count} {count === 1 ? "noticia" : "noticias"}
            {activeFilters.length > 0 ? " con los filtros elegidos" : " publicadas, de la más reciente a la más antigua"}.
          </p>
        </header>

        <form id="buscar" className="filter-bar" action="/noticias" method="get" role="search">
          <div className="field field--search">
            <label htmlFor="filtro-q">Buscar</label>
            <div className="input-icon">
              <IconSearch size={18} />
              <input id="filtro-q" name="q" type="search" placeholder="Titulares, autores o temas" defaultValue={q || ""} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="filtro-categoria">Categoría</label>
            <select id="filtro-categoria" name="categoria" defaultValue={categoria || ""}>
              <option value="">Todas</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filtro-periodo">Fecha</label>
            <select id="filtro-periodo" name="periodo" defaultValue={periodo || ""}>
              <option value="">Cualquier fecha</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Últimos 30 días</option>
              <option value="all">Todo</option>
            </select>
          </div>
          <button className="button button--primary" type="submit">
            Buscar
          </button>
        </form>

        {activeFilters.length > 0 ? (
          <div className="active-filters" aria-label="Filtros activos">
            {activeFilters.map((filter) => (
              <Link key={filter.key} className="chip" href={withoutParam(params, filter.key)}>
                {filter.label}
                <IconX size={14} />
                <span className="visually-hidden">Quitar filtro</span>
              </Link>
            ))}
            <Link className="text-link" href="/noticias">
              Limpiar todo
            </Link>
          </div>
        ) : null}

        {count > 0 ? (
          <div className="results">
            {filteredStories.map((story) => (
              <StoryRow key={story.slug} story={story} headingLevel={2} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No encontramos noticias con esos filtros</h2>
            <p>Prueba con otra palabra, revisa la ortografía o amplía la fecha. También puedes ver todas las noticias.</p>
            <Link className="button button--secondary" href="/noticias">
              Ver todas las noticias
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
