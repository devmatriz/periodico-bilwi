import { NextResponse } from "next/server";
import { isAdmin, rejectUnlessAdmin } from "@/lib/admin-guard";
import { deleteNoticia, getNoticiaBySlug, updateNoticia } from "@/lib/content-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return Promise.resolve(context.params);
}

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await resolveParams(context);
  const item = await getNoticiaBySlug(slug, { includeUnpublished: await isAdmin() });

  if (!item) {
    return NextResponse.json({ message: "Noticia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { slug } = await resolveParams(context);
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  const item = await updateNoticia(slug, body);

  if (!item) {
    return NextResponse.json({ message: "Noticia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ item, message: "Noticia actualizada correctamente." });
}

export async function PATCH(request: Request, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(_: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { slug } = await resolveParams(context);
  const removed = await deleteNoticia(slug);

  if (!removed) {
    return NextResponse.json({ message: "Noticia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ message: "Noticia eliminada correctamente." });
}

