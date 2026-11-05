import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { Article } from "@prisma/client";
import { getEditorialCategorySettings } from "@/lib/editorial-admin-store";
import { translationLocales } from "@/lib/i18n";
import type { TranslationLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { editorialSections, featuredStories, recentStories } from "@/lib/site-data";

export type NewsStatus = "published" | "draft" | "scheduled" | "archived";

/** Versión de una noticia en otro idioma, escrita por la redacción. */
export type StoryTranslation = {
  title: string;
  excerpt: string;
  content: string;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  status: NewsStatus;
  featured: boolean;
  time: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  translations?: Partial<Record<TranslationLocale, StoryTranslation>>;
};

export type NewsInput = Partial<Omit<NewsItem, "id" | "createdAt" | "updatedAt">> & {
  title?: string;
  content?: string;
  status?: NewsStatus;
};

export type CategorySummary = {
  slug: string;
  href: string;
  label: string;
  badge: string;
  title: string;
  description: string;
  chips: string[];
  image: string;
  background: string;
  count: number;
  active: boolean;
};

// Imagen propia (identidad del periódico) para noticias sin foto.
const fallbackImage = "/marca/sin-imagen.jpg";

// Lo más reciente primero (el mismo orden que tenía el archivo JSON).
const newestFirst: Prisma.ArticleOrderByWithRelationInput[] = [{ updatedAt: "desc" }, { createdAt: "desc" }];

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

function slugify(value: string) {
  return stripTrailingSlash(
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );
}

function displayDate(date: Date) {
  return new Intl.DateTimeFormat("es-NI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function articleBody(excerpt: string, category: string, title: string) {
  return [
    excerpt,
    `La cobertura de ${category.toLowerCase()} se mantiene enfocada en contexto local, claridad editorial y lenguaje cercano para la audiencia de Bilwi.`,
    `Este articulo forma parte de la base inicial del periodico digital. Desde aqui podemos seguir ampliando la redaccion con nuevas notas, entrevistas y actualizaciones desde el panel de administracion.`,
    `Titular: ${title}.`,
  ].join("\n\n");
}

/** Noticias de ejemplo para una base de datos nueva (las carga `npm run db:seed`). */
export function seedArticles(): NewsItem[] {
  const baseStories = [...featuredStories, ...recentStories];
  const now = Date.now();

  return baseStories.map((story, index) => {
    const createdAt = new Date(now - index * 3_600_000);
    const featured = index < featuredStories.length;

    return {
      id: randomUUID(),
      slug: story.slug,
      title: story.title,
      category: story.category,
      excerpt: story.excerpt,
      content: articleBody(story.excerpt, story.category, story.title),
      image: story.image || fallbackImage,
      author: story.author,
      status: "published",
      featured,
      time: story.time || displayDate(createdAt),
      publishedAt: createdAt.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });
}

function fromRow(row: Article): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image || fallbackImage,
    author: row.author,
    status: row.status as NewsStatus,
    featured: row.featured,
    time: row.time,
    publishedAt: row.publishedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    translations: (row.translations as NewsItem["translations"] | null) ?? undefined,
  };
}

/** Convierte una noticia al formato de la tabla Article (también lo usa la importación desde JSON). */
export function articleToRow(item: NewsItem) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    excerpt: item.excerpt,
    content: item.content,
    image: item.image,
    author: item.author,
    status: item.status,
    featured: item.featured,
    time: item.time,
    publishedAt: new Date(item.publishedAt),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    translations: item.translations ? (item.translations as Prisma.InputJsonValue) : Prisma.DbNull,
  };
}

/** Si otra noticia ya usa ese slug, agrega -2, -3… en vez de chocar con ella. */
async function uniqueSlug(base: string, ownId?: string) {
  const root = base || "noticia";
  for (let n = 1; ; n += 1) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const taken = await prisma.article.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!taken || taken.id === ownId) return candidate;
  }
}

/** Conserva solo las traducciones con título y texto; las vacías se descartan. */
function cleanTranslations(value: unknown): NewsItem["translations"] {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, Partial<StoryTranslation> | undefined>;
  const out: Partial<Record<TranslationLocale, StoryTranslation>> = {};

  for (const locale of translationLocales) {
    const item = source[locale];
    const title = typeof item?.title === "string" ? item.title.trim() : "";
    const content = typeof item?.content === "string" ? item.content.trim() : "";
    const excerpt = typeof item?.excerpt === "string" ? item.excerpt.trim() : "";
    if (title && content) {
      out[locale] = { title, excerpt, content };
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeArticle(input: NewsInput, current?: NewsItem): NewsItem {
  const title = (input.title || current?.title || "Sin titulo").trim();
  const content = (input.content || current?.content || "").trim();
  const excerpt = (input.excerpt || current?.excerpt || content.split("\n\n")[0] || title).trim();
  const category = (input.category || current?.category || "Locales").trim();
  const author = (input.author || current?.author || "Redaccion Bilwi").trim();
  const status = (input.status || current?.status || "draft") as NewsStatus;
  const image = (input.image || current?.image || fallbackImage).trim();
  const slug = slugify(input.slug || current?.slug || title);
  const now = new Date();

  return {
    id: current?.id || randomUUID(),
    slug,
    title,
    category,
    excerpt,
    content: content || articleBody(excerpt, category, title),
    image,
    author,
    status,
    featured: input.featured ?? current?.featured ?? false,
    time:
      input.time ||
      current?.time ||
      (status === "published" ? displayDate(now) : "Borrador"),
    publishedAt: input.publishedAt || current?.publishedAt || now.toISOString(),
    createdAt: current?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    translations: cleanTranslations(input.translations !== undefined ? input.translations : current?.translations),
  };
}

export async function getNoticias() {
  const rows = await prisma.article.findMany({ orderBy: newestFirst });
  return rows.map(fromRow);
}

export async function getPublicNoticias() {
  const rows = await prisma.article.findMany({ where: { status: "published" }, orderBy: newestFirst });
  return rows.map(fromRow);
}

export async function getFeaturedNoticias() {
  const items = await getPublicNoticias();
  const featured = items.filter((item) => item.featured);
  return (featured.length > 0 ? featured : items).slice(0, 3);
}

export async function getRecentNoticias(limit = 4) {
  const rows = await prisma.article.findMany({ where: { status: "published" }, orderBy: newestFirst, take: limit });
  return rows.map(fromRow);
}

export async function getTickerItems(limit = 5) {
  const items = await getRecentNoticias(limit);

  if (items.length === 0) {
    return [
      "Sismos de baja intensidad registrados en la Costa Caribe",
      "Gobierno anuncia nuevos proyectos de infraestructura en Puerto Cabezas",
      "Bilwi se prepara para la agenda cultural de junio",
    ];
  }

  return items.map((item) => `${item.category}: ${item.title}`);
}

export async function getNoticiaBySlug(slug: string, options?: { includeUnpublished?: boolean }) {
  const row = await prisma.article.findUnique({ where: { slug } });

  if (!row) {
    return null;
  }

  if (!options?.includeUnpublished && row.status !== "published") {
    return null;
  }

  return fromRow(row);
}

export async function createNoticia(input: NewsInput) {
  const draft = normalizeArticle(input);
  const article = { ...draft, slug: await uniqueSlug(draft.slug) };
  await prisma.article.create({ data: articleToRow(article) });
  return article;
}

export async function updateNoticia(slug: string, input: NewsInput) {
  const row = await prisma.article.findUnique({ where: { slug } });

  if (!row) {
    return null;
  }

  const draft = normalizeArticle(input, fromRow(row));
  const article = { ...draft, slug: await uniqueSlug(draft.slug, row.id) };
  const { id, ...data } = articleToRow(article);
  await prisma.article.update({ where: { id }, data });
  return article;
}

export async function deleteNoticia(slug: string) {
  const { count } = await prisma.article.deleteMany({ where: { slug } });
  return count > 0;
}

export async function getCategorias(): Promise<CategorySummary[]> {
  const items = await getPublicNoticias();
  const counts = new Map<string, number>();
  const settings = await getEditorialCategorySettings();
  const settingsMap = new Map(settings.map((item) => [item.slug, item]));

  const sectionMatchers: Record<string, string[]> = {
    locales: ["locales", "desarrollo regional", "medio ambiente", "infraestructura", "sociedad"],
    cultura: ["cultura", "tradiciones", "tradicion", "arte", "musica"],
    deportes: ["deportes", "deporte", "futbol"],
    economia: ["economia", "economía", "mercado", "produccion", "producción", "comercio", "pesca"],
  };

  function resolveSection(category: string) {
    const normalized = category.toLowerCase();
    for (const [section, matchers] of Object.entries(sectionMatchers)) {
      if (matchers.some((matcher) => normalized.includes(matcher))) {
        return section;
      }
    }

    return "locales";
  }

  for (const item of items) {
    const section = resolveSection(item.category);
    counts.set(section, (counts.get(section) || 0) + 1);
  }

  return editorialSections.map((section) => {
    const slug = section.href.replace(/^\//, "");
    const setting = settingsMap.get(slug);
    const count = counts.get(section.label.toLowerCase()) || 0;

    return {
      slug,
      href: section.href,
      label: setting?.label || section.label,
      badge: setting?.badge || section.badge,
      title: setting?.title || section.title,
      description: setting?.description || section.description,
      chips: setting?.chips?.length ? setting.chips : section.chips,
      image: setting?.image || section.image,
      background: setting?.background || section.background,
      count,
      active: setting?.active ?? true,
    };
  });
}
