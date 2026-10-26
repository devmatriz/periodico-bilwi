import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { toggleEditorialCategory, updateEditorialCategory } from "@/lib/editorial-admin-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return Promise.resolve(context.params);
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const { slug } = await resolveParams(context);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Cuerpo de solicitud invalido." }, { status: 400 });
  }

  const normalizedBody = body as Record<string, unknown>;
  const item =
    typeof normalizedBody.active === "boolean" && Object.keys(normalizedBody).length === 1
      ? await toggleEditorialCategory(slug, normalizedBody.active)
      : await updateEditorialCategory(
          slug,
          normalizedBody as Parameters<typeof updateEditorialCategory>[1],
        );

  if (!item) {
    return NextResponse.json({ message: "Categoria no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ item, message: "Categoria actualizada correctamente." });
}
