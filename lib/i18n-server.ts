import "server-only";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { defaultLocale, isLocale, localePath, locales } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/dictionaries";

// middleware.ts quita el prefijo de idioma y deja el idioma y la dirección original en cabeceras.

export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get("x-locale");
  return isLocale(value) ? value : defaultLocale;
}

/** Dirección actual sin prefijo de idioma (incluye la búsqueda ?q=…), para el selector de idioma. */
export async function getCurrentPath() {
  return (await headers()).get("x-pathname") || "/";
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

/** Enlaces hreflang para que los buscadores relacionen las versiones de una misma página. */
export function languageAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    languages: Object.fromEntries(locales.map((locale) => [locale, localePath(locale, path)])),
  };
}

export function localizedAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return { ...languageAlternates(path), canonical: localePath(locale, path) };
}

export { defaultLocale };
