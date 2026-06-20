import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getNoticiaBySlug } from "@/lib/content-store";

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export type ArticleComment = {
  id: string;
  slug: string;
  articleTitle: string;
  name: string;
  email: string;
  message: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  moderatedAt?: string;
  moderator?: string;
};

export type CommentInput = {
  slug: string;
  name: string;
  email?: string;
  message: string;
};

const dataDir = path.join(process.cwd(), "data");
const commentsFile = path.join(dataDir, "comments.json");
let commentsCache: ArticleComment[] | null = null;

const seedComments: ArticleComment[] = [
  {
    id: randomUUID(),
    slug: "festival-de-mayo-ya-2024",
    articleTitle: "Inicia el Festival de Mayo Ya 2024",
    name: "Lourdes Garcia",
    email: "lourdes@example.com",
    message: "Muy bonita cobertura, gracias por compartir la agenda cultural.",
    status: "approved",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
    moderatedAt: new Date(Date.now() - 86_300_000).toISOString(),
    moderator: "Sistema",
  },
  {
    id: randomUUID(),
    slug: "inauguran-nuevo-sistema-electrificacion-waspam",
    articleTitle: "Inauguran nuevo sistema de electrificacion en Waspam",
    name: "Jose Ramon",
    email: "jose@example.com",
    message: "Excelente noticia para la comunidad. Ojala se amplie a mas barrios.",
    status: "approved",
    createdAt: new Date(Date.now() - 43_200_000).toISOString(),
    updatedAt: new Date(Date.now() - 43_200_000).toISOString(),
    moderatedAt: new Date(Date.now() - 43_100_000).toISOString(),
    moderator: "Sistema",
  },
  {
    id: randomUUID(),
    slug: "exportaciones-pesqueras-cifras-record",
    articleTitle: "Exportaciones pesqueras alcanzan cifras record",
    name: "Marta Lopez",
    email: "marta@example.com",
    message: "Interesante analisis. Me gustaria ver tambien el impacto en empleo local.",
    status: "pending",
    createdAt: new Date(Date.now() - 18_000_000).toISOString(),
    updatedAt: new Date(Date.now() - 18_000_000).toISOString(),
  },
  {
    id: randomUUID(),
    slug: "energia-solar-comunidades-remotas-bilwi",
    articleTitle: "Energia solar llega a comunidades remotas de Bilwi",
    name: "Nelson Perez",
    email: "nelson@example.com",
    message: "Muy bien por esas comunidades. La energia renovable cambia vidas.",
    status: "approved",
    createdAt: new Date(Date.now() - 9_000_000).toISOString(),
    updatedAt: new Date(Date.now() - 9_000_000).toISOString(),
    moderatedAt: new Date(Date.now() - 8_900_000).toISOString(),
    moderator: "Sistema",
  },
];

type CommentStorageShape = {
  items: ArticleComment[];
};

function nowIso() {
  return new Date().toISOString();
}

function sortNewest(items: ArticleComment[]) {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function sortForModeration(items: ArticleComment[]) {
  const order: Record<CommentStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
    spam: 3,
  };

  return [...items].sort((left, right) => {
    const state = order[left.status] - order[right.status];
    if (state !== 0) {
      return state;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
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

async function readStorage(): Promise<CommentStorageShape> {
  if (commentsCache) {
    return { items: commentsCache.map((item) => ({ ...item })) };
  }

  const fallback = { items: seedComments };
  const stored = await readJsonFile<CommentStorageShape>(commentsFile, fallback);

  if (!stored || !Array.isArray(stored.items) || stored.items.length === 0) {
    await writeJsonFile(commentsFile, fallback);
    commentsCache = fallback.items.map((item) => ({ ...item }));
    return fallback;
  }

  const items = stored.items.map((comment) => ({
    id: comment.id || randomUUID(),
    slug: comment.slug,
    articleTitle: comment.articleTitle || comment.slug,
    name: comment.name || "Visitante",
    email: comment.email || "",
    message: comment.message || "",
    status: (comment.status || "pending") as CommentStatus,
    createdAt: comment.createdAt || nowIso(),
    updatedAt: comment.updatedAt || comment.createdAt || nowIso(),
    moderatedAt: comment.moderatedAt,
    moderator: comment.moderator,
  }));

  const shouldPersist = JSON.stringify(items) !== JSON.stringify(stored.items);
  if (shouldPersist) {
    await writeJsonFile(commentsFile, { items });
  }

  commentsCache = items.map((item) => ({ ...item }));
  return { items };
}

async function writeStorage(items: ArticleComment[]) {
  const sorted = sortNewest(items);
  commentsCache = sorted.map((item) => ({ ...item }));
  await writeJsonFile(commentsFile, { items: sorted });
}

function normalizeText(value: string) {
  return value.trim();
}

export async function getAllComments() {
  const storage = await readStorage();
  return sortForModeration(storage.items);
}

export async function getCommentsForSlug(slug: string, options?: { status?: CommentStatus }) {
  const storage = await readStorage();
  const filtered = storage.items.filter((comment) => comment.slug === slug && (!options?.status || comment.status === options.status));
  return sortNewest(filtered);
}

export async function getCommentStats() {
  const comments = await getAllComments();
  const pending = comments.filter((comment) => comment.status === "pending").length;
  const approved = comments.filter((comment) => comment.status === "approved").length;
  const rejected = comments.filter((comment) => comment.status === "rejected").length;
  const spam = comments.filter((comment) => comment.status === "spam").length;

  return {
    total: comments.length,
    pending,
    approved,
    rejected,
    spam,
  };
}

export async function createComment(input: CommentInput) {
  const slug = normalizeText(input.slug);
  const name = normalizeText(input.name);
  const message = normalizeText(input.message);
  const email = normalizeText(input.email || "");

  if (!slug || !name || !message) {
    return { item: null, message: "Faltan datos para enviar el comentario." };
  }

  const article = await getNoticiaBySlug(slug, { includeUnpublished: true });
  if (!article) {
    return { item: null, message: "La noticia no existe." };
  }

  const storage = await readStorage();
  const item: ArticleComment = {
    id: randomUUID(),
    slug: article.slug,
    articleTitle: article.title,
    name,
    email,
    message,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  storage.items.unshift(item);
  await writeStorage(storage.items);

  return { item, message: "Comentario enviado y pendiente de moderacion." };
}

export async function updateCommentStatus(id: string, status: CommentStatus, moderator = "Admin Bilwi") {
  const storage = await readStorage();
  const index = storage.items.findIndex((comment) => comment.id === id);

  if (index === -1) {
    return null;
  }

  const current = storage.items[index];
  const item: ArticleComment = {
    ...current,
    status,
    updatedAt: nowIso(),
    moderatedAt: nowIso(),
    moderator,
  };

  storage.items[index] = item;
  await writeStorage(storage.items);
  return item;
}

export async function deleteComment(id: string) {
  const storage = await readStorage();
  const next = storage.items.filter((comment) => comment.id !== id);

  if (next.length === storage.items.length) {
    return false;
  }

  await writeStorage(next);
  return true;
}
