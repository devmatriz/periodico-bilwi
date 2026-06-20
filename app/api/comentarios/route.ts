import { NextResponse } from "next/server";
import { createComment, getCommentsForSlug } from "@/lib/comment-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ message: "Falta el slug de la noticia." }, { status: 400 });
  }

  const comments = await getCommentsForSlug(slug, { status: "approved" });
  return NextResponse.json({ items: comments });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const slug = typeof data.slug === "string" ? data.slug : "";
  const name = typeof data.name === "string" ? data.name : "";
  const email = typeof data.email === "string" ? data.email : "";
  const message = typeof data.message === "string" ? data.message : "";

  const result = await createComment({ slug, name, email, message });

  if (!result.item) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ item: result.item, message: result.message }, { status: 201 });
}
