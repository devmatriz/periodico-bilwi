import { NextResponse } from "next/server";
import { isStaff, rejectUnlessStaff } from "@/lib/admin-guard";
import { createNoticia, getNoticias, getPublicNoticias } from "@/lib/content-store";

export const runtime = "nodejs";

export async function GET() {
  const items = (await isStaff()) ? await getNoticias() : await getPublicNoticias();

  return NextResponse.json({
    items,
    total: items.length,
  });
}

export async function POST(request: Request) {
  const denied = await rejectUnlessStaff();
  if (denied) return denied;

  const body = await request.json().catch(() => null);

  if (!body || !body.title) {
    return NextResponse.json(
      {
        message: "El titulo es obligatorio.",
      },
      { status: 400 },
    );
  }

  const item = await createNoticia(body);

  return NextResponse.json(
    {
      item,
      message: "Noticia creada correctamente.",
    },
    { status: 201 },
  );
}

