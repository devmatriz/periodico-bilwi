import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getEditorialCategorySettings } from "@/lib/editorial-admin-store";
import { translationLocales } from "@/lib/i18n";
import type { TranslationLocale } from "@/lib/i18n";
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

type StorageShape = {
  items: NewsItem[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "noticias.json");
// Imagen propia (identidad del periódico) para noticias sin foto.
const fallbackImage = "/marca/sin-imagen.jpg";
let contentCache: NewsItem[] | null = null;

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/g, "");
}

function slugify(value: string) {
  return stripTrailingSlash(
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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

function seedArticles(): NewsItem[] {
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

function sortArticles(items: NewsItem[]) {
  return [...items].sort((left, right) => {
    const updated = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    if (updated !== 0) {
      return updated;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

async function readStorage(): Promise<StorageShape> {
  if (contentCache) {
    return { items: contentCache.map((item) => ({ ...item })) };
  }

  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as StorageShape;
    if (!parsed || !Array.isArray(parsed.items)) {
      contentCache = seedArticles();
      return { items: contentCache.map((item) => ({ ...item })) };
    }

    const items = parsed.items.map((item) => ({
        ...item,
        featured: Boolean(item.featured),
        status: item.status ?? "published",
        image: item.image || fallbackImage,
        author: item.author || "Redaccion Bilwi",
        excerpt: item.excerpt || item.content?.split("\n\n")[0] || "",
        content: item.content || item.excerpt || "",
        time: item.time || displayDate(new Date(item.publishedAt || item.updatedAt || Date.now())),
        publishedAt: item.publishedAt || item.createdAt || item.updatedAt || new Date().toISOString(),
        createdAt: item.createdAt || item.publishedAt || item.updatedAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.createdAt || item.publishedAt || new Date().toISOString(),
        id: item.id || randomUUID(),
        slug: item.slug || slugify(item.title),
      }));
    contentCache = items;
    return { items: items.map((item) => ({ ...item })) };
  } catch {
    contentCache = seedArticles();
    return { items: contentCache.map((item) => ({ ...item })) };
  }
}

async function writeStorage(items: NewsItem[]) {
  await mkdir(dataDir, { recursive: true });
  const payload: StorageShape = { items: sortArticles(items) };
  contentCache = payload.items.map((item) => ({ ...item }));
  await writeFile(dataFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function publicItems(items: NewsItem[]) {
  return items.filter((item) => item.status === "published");
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
  const storage = await readStorage();
  return sortArticles(storage.items);
}

export async function getPublicNoticias() {
  return publicItems(await getNoticias());
}

export async function getFeaturedNoticias() {
  const items = await getPublicNoticias();
  const featured = items.filter((item) => item.featured);
  return (featured.length > 0 ? featured : items).slice(0, 3);
}

export async function getRecentNoticias(limit = 4) {
  const items = await getPublicNoticias();
  return items.slice(0, limit);
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
  const items = await getNoticias();
  const article = items.find((item) => item.slug === slug);

  if (!article) {
    return null;
  }

  if (!options?.includeUnpublished && article.status !== "published") {
    return null;
  }

  return article;
}

export async function createNoticia(input: NewsInput) {
  const storage = await readStorage();
  const article = normalizeArticle(input);
  const items = sortArticles([...storage.items, article]);
  await writeStorage(items);
  return article;
}

export async function updateNoticia(slug: string, input: NewsInput) {
  const storage = await readStorage();
  const index = storage.items.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return null;
  }

  const article = normalizeArticle(input, storage.items[index]);
  const items = [...storage.items];
  items[index] = article;
  await writeStorage(items);
  return article;
}

export async function deleteNoticia(slug: string) {
  const storage = await readStorage();
  const nextItems = storage.items.filter((item) => item.slug !== slug);

  if (nextItems.length === storage.items.length) {
    return false;
  }

  await writeStorage(nextItems);
  return true;
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
