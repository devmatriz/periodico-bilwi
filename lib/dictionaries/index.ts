import type { Locale } from "@/lib/i18n";
import { en } from "./en";
import { es } from "./es";
import type { Dictionary } from "./es";

export const dictionaries: Record<Locale, Dictionary> = { es, en };
export type { Dictionary };
