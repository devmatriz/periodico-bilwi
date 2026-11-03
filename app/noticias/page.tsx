import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryRow } from "@/components/story";
import { IconSearch, IconX } from "@/components/icons";
import { getPublicNoticias } from "@/lib/content-store";
import { localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";
import { categoryName, localizeStories } from "@/lib/localize";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.list.metaTitle,
    description: t.list.metaDescription,
    alternates: localizedAlternates(locale, "/noticias"),
  };
}

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

export default async function NoticiasPage({ searchParams }: Props) {
  const [{ q, categoria, periodo }, { locale, t }, published] = await Promise.all([searchParams, getI18n(), getPublicNoticias()]);
  const stories = localizeStories(published, locale);
  const base = localePath(locale, "/noticias");
  const query = normalizeSearch(q || "");
  const categoryFilter = normalizeSearch(categoria || "");
  const periodFilter = periodo || "";
  const todayKey = localDayKey(new Date());
  const weekKey = dayKeyDaysAgo(7);
  const monthKey = dayKeyDaysAgo(30);

  const periodLabels: Record<string, string> = {
    today: t.list.today,
    week: t.list.week,
    month: t.list.month,
    all: t.list.allTime,
  };

  // El valor del filtro es la categoría tal como está guardada; el texto visible va en el idioma de la página.
  const categories = Array.from(new Set(stories.map((story) => story.category))).sort((a, b) =>
    categoryName(a, locale).localeCompare(categoryName(b, locale), locale),
  );

  const filteredStories = stories.filter((story) => {
    const original = published.find((item) => item.slug === story.slug);
    // En otros idiomas se busca en la traducción y también en el texto original en español.
    const searchable = normalizeSearch(
      [
        story.title,
        story.excerpt,
        story.category,
        categoryName(story.category, locale),
        story.author,
        story.content,
        original && original.title !== story.title ? `${original.title} ${original.excerpt} ${original.content}` : "",
      ].join(" "),
    );

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
  function withoutParam(key: string) {
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (name !== key && value) next.set(name, value);
    }
    const queryString = next.toString();
    return queryString ? `${base}?${queryString}` : base;
  }

  const activeFilters = [
    q ? { key: "q", label: `“${q}”` } : null,
    categoria ? { key: "categoria", label: categoryName(categoria, locale) } : null,
    periodo ? { key: "periodo", label: periodLabels[periodo] ?? periodo } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;
  const count = filteredStories.length;

  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>{q ? t.list.resultsFor(q) : t.list.title}</h1>
          <p className="page-lede">{t.list.count(count, activeFilters.length > 0)}</p>
        </header>

        <form id="buscar" className="filter-bar" action={base} method="get" role="search">
          <div className="field field--search">
            <label htmlFor="filtro-q">{t.list.searchLabel}</label>
            <div className="input-icon">
              <IconSearch size={18} />
              <input id="filtro-q" name="q" type="search" placeholder={t.list.searchPlaceholder} defaultValue={q || ""} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="filtro-categoria">{t.list.category}</label>
            <select id="filtro-categoria" name="categoria" defaultValue={categoria || ""}>
              <option value="">{t.list.allCategories}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {categoryName(item, locale)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filtro-periodo">{t.list.date}</label>
            <select id="filtro-periodo" name="periodo" defaultValue={periodo || ""}>
              <option value="">{t.list.anyDate}</option>
              <option value="today">{t.list.today}</option>
              <option value="week">{t.list.week}</option>
              <option value="month">{t.list.month}</option>
              <option value="all">{t.list.allTime}</option>
            </select>
          </div>
          <button className="button button--primary" type="submit">
            {t.common.search}
          </button>
        </form>

        {activeFilters.length > 0 ? (
          <div className="active-filters" aria-label={t.list.activeFilters}>
            {activeFilters.map((filter) => (
              <Link key={filter.key} className="chip" href={withoutParam(filter.key)}>
                {filter.label}
                <IconX size={14} />
                <span className="visually-hidden">{t.list.removeFilter}</span>
              </Link>
            ))}
            <Link className="text-link" href={base}>
              {t.list.clearAll}
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
            <h2>{t.list.emptyTitle}</h2>
            <p>{t.list.emptyText}</p>
            <Link className="button button--secondary" href={base}>
              {t.list.emptyButton}
            </Link>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
