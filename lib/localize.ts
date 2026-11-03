import type { NewsItem } from "@/lib/content-store";
import { defaultLocale, localePath } from "@/lib/i18n";
import type { Locale, TranslationLocale } from "@/lib/i18n";
import { dictionaries } from "@/lib/dictionaries";
import { displayCategory, publicSections } from "@/lib/sections";
import type { PublicSection } from "@/lib/sections";

/** Noticia lista para mostrarse en un idioma: con su traducción si existe, o en español con aviso. */
export type LocalizedStory = NewsItem & {
  locale: Locale;
  /** true cuando el idioma pedido no es español y la noticia todavía no tiene traducción. */
  untranslated: boolean;
  /** Dirección de la noticia en ese idioma. */
  href: string;
};

export function localizeStory(story: NewsItem, locale: Locale): LocalizedStory {
  const href = localePath(locale, `/noticias/${story.slug}`);
  if (locale === defaultLocale) {
    return { ...story, locale, untranslated: false, href };
  }

  const translation = story.translations?.[locale as TranslationLocale];
  if (translation?.title && translation.content) {
    return {
      ...story,
      title: translation.title,
      excerpt: translation.excerpt,
      content: translation.content,
      locale,
      untranslated: false,
      href,
    };
  }

  return { ...story, locale, untranslated: true, href };
}

export function localizeStories(stories: NewsItem[], locale: Locale) {
  return stories.map((story) => localizeStory(story, locale));
}

function key(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Nombre de una categoría en el idioma pedido (en español corrige tildes; en inglés traduce). */
export function categoryName(category: string, locale: Locale) {
  if (locale === defaultLocale) return displayCategory(category);
  return dictionaries[locale].categories[key(category)] ?? displayCategory(category);
}

type CategorySetting = { slug: string; label: string; title: string; description: string; active: boolean };

/** `path` es la dirección sin idioma (/cultura); `href`, la dirección en el idioma pedido (/en/cultura). */
export type LocalizedSection = PublicSection & { active: boolean; path: string };

/**
 * Secciones con sus textos en el idioma pedido. En español, los textos editados en el panel
 * tienen prioridad; en otros idiomas se usan los del diccionario.
 */
export function localizeSections(locale: Locale, settings: CategorySetting[] = []): LocalizedSection[] {
  const bySlug = new Map(settings.map((item) => [item.slug, item]));
  const texts = dictionaries[locale].sections as Record<string, { label: string; title: string; description: string }>;

  return publicSections.map((section) => {
    const setting = bySlug.get(section.slug);
    const own = texts[section.slug];
    const useSettings = locale === defaultLocale && setting;
    return {
      ...section,
      path: section.href,
      href: localePath(locale, section.href),
      label: useSettings ? displayCategory(setting.label) : own?.label ?? section.label,
      title: useSettings ? setting.title : own?.title ?? section.title,
      description: useSettings ? setting.description : own?.description ?? section.description,
      active: setting?.active ?? true,
    };
  });
}
