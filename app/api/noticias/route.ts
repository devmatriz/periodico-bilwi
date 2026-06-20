import { NextResponse } from "next/server";
import { createNoticia, getNoticias } from "@/lib/content-store";

export const runtime = "nodejs";

export async function GET() {
  const items = await getNoticias();

  return NextResponse.json({
    items,
    total: items.length,
  });
}

export async function POST(request: Request) {
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

