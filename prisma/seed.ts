// Llena una base de datos nueva.
// - Si existen los antiguos archivos data/*.json, los copia tal cual (noticias, comentarios,
//   secciones y equipo, con las contraseñas ya cifradas).
// - Si no existen, carga las noticias y comentarios de ejemplo.
// Se puede repetir sin miedo: lo que ya está en la base no se toca ni se duplica.
//
// Uso:  npm run db:seed

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { articleToRow, seedArticles } from "@/lib/content-store";
import type { NewsItem } from "@/lib/content-store";
import { commentToRow, seedComments } from "@/lib/comment-store";
import type { ArticleComment } from "@/lib/comment-store";
import type { EditorialCategorySetting } from "@/lib/editorial-admin-store";
import { prisma } from "@/lib/prisma";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(name: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(dataDir, name), "utf8")) as T;
  } catch {
    return null;
  }
}

function displayDate(date: Date) {
  return new Intl.DateTimeFormat("es-NI", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Completa los campos que las noticias antiguas podían no tener (igual que hacía el sitio al leer el JSON). */
function normalizeStoredArticle(item: Partial<NewsItem>): NewsItem {
  const now = new Date().toISOString();
  return {
    ...item,
    id: item.id || randomUUID(),
    slug: item.slug || randomUUID(),
    title: item.title || "Sin titulo",
    category: item.category || "Locales",
    featured: Boolean(item.featured),
    status: item.status ?? "published",
    image: item.image || "/marca/sin-imagen.jpg",
    author: item.author || "Redaccion Bilwi",
    excerpt: item.excerpt || item.content?.split("\n\n")[0] || "",
    content: item.content || item.excerpt || "",
    time: item.time || displayDate(new Date(item.publishedAt || item.updatedAt || Date.now())),
    publishedAt: item.publishedAt || item.createdAt || item.updatedAt || now,
    createdAt: item.createdAt || item.publishedAt || item.updatedAt || now,
    updatedAt: item.updatedAt || item.createdAt || item.publishedAt || now,
  };
}

async function seedArticlesTable() {
  const stored = await readJson<{ items?: Partial<NewsItem>[] }>("noticias.json");
  const source = Array.isArray(stored?.items) ? "data/noticias.json" : "ejemplos";
  const items = Array.isArray(stored?.items) ? stored.items.map(normalizeStoredArticle) : seedArticles();

  // En el JSON dos noticias podían compartir slug; en la base cada una necesita el suyo.
  const seen = new Set<string>();
  for (const item of items) {
    let slug = item.slug;
    for (let n = 2; seen.has(slug); n += 1) slug = `${item.slug}-${n}`;
    item.slug = slug;
    seen.add(slug);
  }

  const { count } = await prisma.article.createMany({ data: items.map(articleToRow), skipDuplicates: true });
  console.log(`Noticias: ${count} nuevas de ${items.length} (${source}).`);
}

async function seedCommentsTable() {
  const stored = await readJson<{ items?: ArticleComment[] }>("comments.json");
  const source = Array.isArray(stored?.items) ? "data/comments.json" : "ejemplos";
  const items = Array.isArray(stored?.items) ? stored.items : seedComments;

  // Los ejemplos reciben ids nuevos en cada ejecución: solo se cargan en una base sin comentarios.
  if (!Array.isArray(stored?.items) && (await prisma.comment.count()) > 0) {
    console.log("Comentarios: la base ya tiene comentarios; no se agregan ejemplos.");
    return;
  }

  const { count } = await prisma.comment.createMany({ data: items.filter((item) => item.slug).map(commentToRow), skipDuplicates: true });
  console.log(`Comentarios: ${count} nuevos de ${items.length} (${source}).`);
}

async function seedCategoriesTable() {
  const stored = await readJson<EditorialCategorySetting[]>("admin-categories.json");
  if (!Array.isArray(stored)) {
    console.log("Secciones: sin cambios guardados; se usan las del código.");
    return;
  }

  const { count } = await prisma.categorySetting.createMany({
    data: stored.map((item) => ({
      slug: item.slug,
      active: item.active ?? true,
      label: item.label,
      badge: item.badge,
      title: item.title,
      description: item.description,
      chips: Array.isArray(item.chips) ? item.chips : [],
      image: item.image,
      background: item.background,
    })),
    skipDuplicates: true,
  });
  console.log(`Secciones: ${count} nuevas de ${stored.length} (data/admin-categories.json).`);
}

type StoredProfile = { id?: string; name?: string; email?: string; role?: string; scope?: string; status?: string; active?: boolean };
type StoredCredential = { id?: string; name?: string; email?: string; passwordSalt?: string; passwordHash?: string; active?: boolean };

async function seedUsersTable() {
  const profiles = (await readJson<StoredProfile[]>("admin-users.json")) ?? [];
  const credentials = (await readJson<StoredCredential[]>("admin-auth.json")) ?? [];

  if (profiles.length === 0 && credentials.length === 0) {
    console.log("Equipo: no hay archivos; la primera cuenta se creará con ADMIN_EMAIL / ADMIN_PASSWORD al iniciar sesión.");
    return;
  }

  const byEmail = new Map<string, { profile?: StoredProfile; credential?: StoredCredential }>();
  for (const profile of profiles) {
    if (profile.email) byEmail.set(profile.email.trim().toLowerCase(), { profile });
  }
  for (const credential of credentials) {
    if (!credential.email) continue;
    const email = credential.email.trim().toLowerCase();
    byEmail.set(email, { ...byEmail.get(email), credential });
  }

  const data = [...byEmail.entries()].map(([email, { profile, credential }]) => {
    const hasPassword = Boolean(credential?.passwordSalt && credential?.passwordHash);
    return {
      id: profile?.id || credential?.id || randomUUID(),
      name: profile?.name || credential?.name || email,
      email,
      role: profile?.role || "Redacción",
      scope: profile?.scope || "",
      status: profile?.status || "Activo",
      active: (profile?.active ?? true) && (credential?.active ?? true),
      // Antes solo existía una cuenta que podía entrar, y era de administración.
      isAdmin: hasPassword,
      passwordSalt: hasPassword ? credential!.passwordSalt! : null,
      passwordHash: hasPassword ? credential!.passwordHash! : null,
    };
  });

  const { count } = await prisma.user.createMany({ data, skipDuplicates: true });
  const withPassword = data.filter((user) => user.passwordHash).length;
  console.log(`Equipo: ${count} cuentas nuevas de ${data.length}; ${withPassword} con contraseña (el resto necesita que le den una desde el panel).`);
}

async function main() {
  await seedArticlesTable();
  await seedCommentsTable();
  await seedCategoriesTable();
  await seedUsersTable();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
