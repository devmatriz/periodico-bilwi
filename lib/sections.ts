import type { NewsItem } from "@/lib/content-store";
import { intlLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export type PublicSection = {
  slug: string;
  href: string;
  label: string;
  title: string;
  description: string;
  matchers: string[];
};

// Secciones públicas con su ruta propia. Las cuatro primeras también se
// editan desde /admin/categorias; los textos de allí tienen prioridad.
export const publicSections: PublicSection[] = [
  {
    slug: "locales",
    href: "/locales",
    label: "Locales",
    title: "La noticia que empieza en el barrio",
    description: "Servicios, calles, instituciones y la vida cotidiana de Bilwi.",
    matchers: ["locales", "desarrollo regional", "infraestructura", "medio ambiente"],
  },
  {
    slug: "cultura",
    href: "/cultura",
    label: "Cultura",
    title: "La memoria viva de Bilwi",
    description: "Arte, tradición, música e identidad de la Costa Caribe.",
    matchers: ["cultura", "tradiciones", "tradicion", "arte", "musica", "gastronomia"],
  },
  {
    slug: "sociedad",
    href: "/sociedad",
    label: "Sociedad",
    title: "La vida social que sostiene la comunidad",
    description: "Salud, educación, participación ciudadana y temas humanos.",
    matchers: ["sociedad", "salud", "educacion"],
  },
  {
    slug: "economia",
    href: "/economia",
    label: "Economía",
    title: "La actividad productiva de la región",
    description: "Empleo, comercio, pesca, energía y movimiento económico local.",
    matchers: ["economia", "mercado", "produccion", "comercio", "pesca"],
  },
  {
    slug: "deportes",
    href: "/deportes",
    label: "Deportes",
    title: "El pulso deportivo del Caribe",
    description: "Resultados, competencia y protagonistas de la comunidad.",
    matchers: ["deportes", "deporte", "futbol", "beisbol"],
  },
  {
    slug: "opinion",
    href: "/opinion",
    label: "Opinión",
    title: "La mirada editorial del periódico",
    description: "Columnas, análisis y reflexiones para ampliar el contexto de la información local.",
    matchers: ["opinion"],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function sectionForCategory(category: string): PublicSection {
  const normalized = normalize(category);
  return (
    publicSections.find((section) => section.matchers.some((matcher) => normalized.includes(matcher))) ??
    publicSections[0]
  );
}

export function storiesForSection(stories: NewsItem[], slug: string) {
  return stories.filter((story) => sectionForCategory(story.category).slug === slug);
}

const accentedNames: Record<string, string> = {
  opinion: "Opinión",
  economia: "Economía",
  tradicion: "Tradición",
  musica: "Música",
  educacion: "Educación",
  gastronomia: "Gastronomía",
  politica: "Política",
};

/** Nombre visible de una categoría: corrige tildes de los datos sin tocarlos. */
export function displayCategory(category: string) {
  return accentedNames[normalize(category)] ?? category;
}

export function storyDate(story: NewsItem) {
  return story.publishedAt || story.createdAt || story.updatedAt;
}

export function formatShortDate(value: string, locale: Locale = "es") {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: "America/Managua",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function formatLongDate(value: string | Date, locale: Locale = "es") {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: "America/Managua",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatArticleDate(value: string, locale: Locale = "es") {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: "America/Managua",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function tileNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function cleanAuthor(author: string) {
  return author.replace(/^por\s+/i, "");
}
