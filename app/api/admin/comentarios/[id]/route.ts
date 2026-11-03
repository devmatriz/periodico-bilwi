import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { deleteComment, updateCommentStatus, type CommentStatus } from "@/lib/comment-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return Promise.resolve(context.params);
}

function normalizeStatus(value: unknown): CommentStatus | null {
  if (value === "pending" || value === "approved" || value === "rejected" || value === "spam") {
    return value;
  }

  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { id } = await resolveParams(context);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  const status = normalizeStatus((body as Record<string, unknown>).status);
  if (!status) {
    return NextResponse.json({ message: "Estado de comentario invalido." }, { status: 400 });
  }

  const item = await updateCommentStatus(id, status);

  if (!item) {
    return NextResponse.json({ message: "Comentario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ item, message: "Comentario actualizado correctamente." });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { id } = await resolveParams(context);
  const removed = await deleteComment(id);

  if (!removed) {
    return NextResponse.json({ message: "Comentario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ message: "Comentario eliminado correctamente." });
}
