import "server-only";

import { prisma } from "@/lib/prisma";
import { editorialSections } from "@/lib/site-data";

export type EditorialCategorySetting = {
  slug: string;
  active: boolean;
  label: string;
  badge: string;
  title: string;
  description: string;
  chips: string[];
  image: string;
  background: string;
};

// Las secciones existen siempre (vienen del código); la base solo guarda lo que la redacción cambió.
const defaultCategories: EditorialCategorySetting[] = editorialSections.map((section) => ({
  slug: section.href.replace(/^\//, ""),
  active: true,
  label: section.label,
  badge: section.badge,
  title: section.title,
  description: section.description,
  chips: [...section.chips],
  image: section.image,
  background: section.background,
}));

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function getEditorialCategorySettings() {
  const stored = await prisma.categorySetting.findMany();
  const map = new Map(stored.map((item) => [item.slug, item]));

  return defaultCategories.map((item) => {
    const current = map.get(item.slug);
    if (!current) {
      return { ...item, chips: [...item.chips] };
    }

    return {
      ...item,
      ...current,
      chips: current.chips.length > 0 ? [...current.chips] : [...item.chips],
      slug: item.slug,
    };
  });
}

export async function updateEditorialCategory(
  slug: string,
  patch: Partial<Omit<EditorialCategorySetting, "slug">>,
) {
  const categories = await getEditorialCategorySettings();
  const current = categories.find((item) => item.slug === slug);

  if (!current) {
    return null;
  }

  // Campo por campo: lo que llegue de más en la petición no se guarda.
  const next: EditorialCategorySetting = {
    slug: current.slug,
    label: patch.label?.trim() || current.label,
    badge: patch.badge?.trim() || current.badge,
    title: patch.title?.trim() || current.title,
    description: patch.description?.trim() || current.description,
    image: patch.image?.trim() || current.image,
    background: patch.background?.trim() || current.background,
    chips:
      patch.chips && patch.chips.length > 0
        ? patch.chips.map((chip) => chip.trim()).filter(Boolean)
        : current.chips,
    active: typeof patch.active === "boolean" ? patch.active : current.active,
  };

  const { slug: key, ...data } = next;
  await prisma.categorySetting.upsert({ where: { slug: key }, create: next, update: data });
  return next;
}

export async function toggleEditorialCategory(slug: string, active: boolean) {
  return updateEditorialCategory(slug, { active });
}

export function editorialCategorySlugFromHref(href: string) {
  return slugifyCategory(href.replace(/^\//, ""));
}
