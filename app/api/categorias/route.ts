import { NextResponse } from "next/server";
import { getCategorias } from "@/lib/content-store";

export const runtime = "nodejs";

export async function GET() {
  const items = await getCategorias();

  return NextResponse.json({
    items,
    total: items.length,
  });
}

