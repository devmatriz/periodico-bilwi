import "server-only";

import { randomUUID } from "node:crypto";
import type { Comment as CommentRow } from "@prisma/client";
import { getNoticiaBySlug } from "@/lib/content-store";
import { prisma } from "@/lib/prisma";

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

/** Comentarios de ejemplo para una base de datos nueva (los carga `npm run db:seed`). */
export const seedComments: ArticleComment[] = [
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

function fromRow(row: CommentRow): ArticleComment {
  return {
    id: row.id,
    slug: row.articleSlug,
    articleTitle: row.articleTitle,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status as CommentStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    moderatedAt: row.moderatedAt?.toISOString(),
    moderator: row.moderator ?? undefined,
  };
}

/** Convierte un comentario al formato de la tabla Comment (también lo usa la importación desde JSON). */
export function commentToRow(comment: ArticleComment) {
  return {
    id: comment.id || randomUUID(),
    articleSlug: comment.slug,
    articleTitle: comment.articleTitle || comment.slug,
    name: comment.name || "Visitante",
    email: comment.email || "",
    message: comment.message || "",
    status: comment.status || "pending",
    createdAt: new Date(comment.createdAt || Date.now()),
    updatedAt: new Date(comment.updatedAt || comment.createdAt || Date.now()),
    moderatedAt: comment.moderatedAt ? new Date(comment.moderatedAt) : null,
    moderator: comment.moderator ?? null,
  };
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

function normalizeText(value: string) {
  return value.trim();
}

export async function getAllComments() {
  const rows = await prisma.comment.findMany();
  return sortForModeration(rows.map(fromRow));
}

export async function getCommentsForSlug(slug: string, options?: { status?: CommentStatus }) {
  const rows = await prisma.comment.findMany({
    where: { articleSlug: slug, ...(options?.status ? { status: options.status } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(fromRow);
}

export async function getCommentStats() {
  const groups = await prisma.comment.groupBy({ by: ["status"], _count: { _all: true } });
  const count = (status: CommentStatus) => groups.find((group) => group.status === status)?._count._all ?? 0;
  const pending = count("pending");
  const approved = count("approved");
  const rejected = count("rejected");
  const spam = count("spam");

  return {
    total: groups.reduce((sum, group) => sum + group._count._all, 0),
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

  const now = new Date().toISOString();
  const item: ArticleComment = {
    id: randomUUID(),
    slug: article.slug,
    articleTitle: article.title,
    name,
    email,
    message,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await prisma.comment.create({ data: commentToRow(item) });

  return { item, message: "Comentario enviado y pendiente de moderacion." };
}

export async function updateCommentStatus(id: string, status: CommentStatus, moderator = "Admin Bilwi") {
  const now = new Date();
  const { count } = await prisma.comment.updateMany({
    where: { id },
    data: { status, updatedAt: now, moderatedAt: now, moderator },
  });

  if (count === 0) {
    return null;
  }

  const row = await prisma.comment.findUnique({ where: { id } });
  return row ? fromRow(row) : null;
}

export async function deleteComment(id: string) {
  const { count } = await prisma.comment.deleteMany({ where: { id } });
  return count > 0;
}
