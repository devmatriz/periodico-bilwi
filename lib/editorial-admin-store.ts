import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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

export type EditorialUserSetting = {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  status: string;
  active: boolean;
  lastSeen: string;
};

const dataDir = path.join(process.cwd(), "data");
const categoryFile = path.join(dataDir, "admin-categories.json");
const userFile = path.join(dataDir, "admin-users.json");
let categorySettingsCache: EditorialCategorySetting[] | null = null;
let userSettingsCache: EditorialUserSetting[] | null = null;

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

const defaultUsers: EditorialUserSetting[] = [
  {
    id: "admin-bilwi",
    name: "Administrador Bilwi",
    email: "admin@bilwi.ni",
    role: "Editor en Jefe",
    scope: "Publicacion general",
    status: "Activo",
    active: true,
    lastSeen: "Hace 5 min",
  },
  {
    id: "ana-lopez",
    name: "Ana Lopez",
    email: "ana@bilwi.ni",
    role: "Redaccion",
    scope: "Locales y comunidad",
    status: "Activo",
    active: true,
    lastSeen: "Hace 20 min",
  },
  {
    id: "carlos-morales",
    name: "Carlos Morales",
    email: "carlos@bilwi.ni",
    role: "Fotografia",
    scope: "Cobertura visual",
    status: "En turno",
    active: true,
    lastSeen: "Ahora",
  },
  {
    id: "marta-perez",
    name: "Marta Perez",
    email: "marta@bilwi.ni",
    role: "Edicion digital",
    scope: "Revision y portada",
    status: "Activo",
    active: true,
    lastSeen: "Hace 1 h",
  },
];

function cloneCategories() {
  return defaultCategories.map((item) => ({ ...item, chips: [...item.chips] }));
}

function cloneUsers() {
  return defaultUsers.map((item) => ({ ...item }));
}

async function readJsonFile<T>(file: string, fallback: T) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(file: string, value: T) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugifyCategory(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function getEditorialCategorySettings() {
  if (categorySettingsCache) {
    return categorySettingsCache.map((item) => ({ ...item, chips: [...item.chips] }));
  }

  const stored = await readJsonFile<EditorialCategorySetting[]>(categoryFile, cloneCategories());
  const map = new Map(stored.map((item) => [item.slug, item]));

  return defaultCategories.map((item) => {
    const current = map.get(item.slug);
    if (!current) {
      return item;
    }

    return {
      ...item,
      ...current,
      chips: Array.isArray(current.chips) && current.chips.length > 0 ? current.chips : item.chips,
      slug: item.slug,
    };
  });

  categorySettingsCache = categories.map((item) => ({ ...item, chips: [...item.chips] }));
  return categorySettingsCache.map((item) => ({ ...item, chips: [...item.chips] }));
}

export async function updateEditorialCategory(
  slug: string,
  patch: Partial<Omit<EditorialCategorySetting, "slug">>,
) {
  const categories = await getEditorialCategorySettings();
  const index = categories.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return null;
  }

  const current = categories[index];
  const next: EditorialCategorySetting = {
    ...current,
    ...patch,
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
  };

  categories[index] = next;
  await writeJsonFile(categoryFile, categories);
  categorySettingsCache = categories.map((item) => ({ ...item, chips: [...item.chips] }));
  return next;
}

export async function toggleEditorialCategory(slug: string, active: boolean) {
  return updateEditorialCategory(slug, { active });
}

export async function getEditorialUsers() {
  if (userSettingsCache) {
    return userSettingsCache.map((item) => ({ ...item }));
  }

  const stored = await readJsonFile<EditorialUserSetting[]>(userFile, cloneUsers());
  const map = new Map(stored.map((item) => [item.email.toLowerCase(), item]));

  return defaultUsers.map((item) => {
    const current = map.get(item.email.toLowerCase());
    if (!current) {
      return item;
    }

    return {
      ...item,
      ...current,
      id: item.id,
      email: item.email,
    };
  });

  userSettingsCache = users.map((item) => ({ ...item }));
  return userSettingsCache.map((item) => ({ ...item }));
}

export async function updateEditorialUser(
  email: string,
  patch: Partial<Omit<EditorialUserSetting, "id" | "email">>,
) {
  const users = await getEditorialUsers();
  const normalizedEmail = email.toLowerCase();
  const index = users.findIndex((item) => item.email.toLowerCase() === normalizedEmail);

  if (index === -1) {
    return null;
  }

  const current = users[index];
  const next: EditorialUserSetting = {
    ...current,
    ...patch,
    name: patch.name?.trim() || current.name,
    role: patch.role?.trim() || current.role,
    scope: patch.scope?.trim() || current.scope,
    status: patch.status?.trim() || current.status,
    lastSeen: patch.lastSeen?.trim() || current.lastSeen,
    active: typeof patch.active === "boolean" ? patch.active : current.active,
    id: current.id,
    email: current.email,
  };

  if (typeof patch.active === "boolean" && patch.status === undefined) {
    next.status = patch.active
      ? current.status === "Inactivo"
        ? "Activo"
        : current.status
      : "Inactivo";
  }

  users[index] = next;
  await writeJsonFile(userFile, users);
  userSettingsCache = users.map((item) => ({ ...item }));
  return next;
}

export async function toggleEditorialUser(email: string, active: boolean) {
  return updateEditorialUser(email, { active });
}

export function editorialCategorySlugFromHref(href: string) {
  return slugifyCategory(href.replace(/^\//, ""));
}
