// Idiomas del sitio público. El español es el idioma principal y vive en las direcciones de siempre;
// los demás llevan un prefijo (/en/…). Para sumar Miskitu: agregar "miq" aquí, su diccionario
// en lib/dictionaries y su pestaña en el editor.

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/** Idiomas a los que la redacción puede traducir una noticia (todos menos el principal). */
export const translationLocales = locales.filter((locale) => locale !== defaultLocale) as Exclude<Locale, "es">[];
export type TranslationLocale = (typeof translationLocales)[number];

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

/** Nombre de cada idioma dicho en español, para los mensajes del panel (que está en español). */
export const localeNamesInSpanish: Record<Locale, string> = {
  es: "español",
  en: "inglés",
};

/** Etiqueta corta para el selector de idioma. */
export const localeShort: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

/** Configuración regional para fechas y números. */
export const intlLocale: Record<Locale, string> = {
  es: "es-NI",
  en: "en-US",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Dirección de una página en un idioma: localePath("en", "/noticias") → "/en/noticias". */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Quita el prefijo de idioma de una dirección: "/en/noticias" → { locale: "en", path: "/noticias" }. */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}`) return { locale, path: "/" };
    if (pathname.startsWith(`/${locale}/`)) return { locale, path: pathname.slice(locale.length + 1) };
  }
  return { locale: defaultLocale, path: pathname };
}
