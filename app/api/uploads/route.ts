import { NextResponse } from "next/server";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Debes enviar un archivo." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "El archivo debe ser una imagen." }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const originalName = slugifyFileName(file.name || "imagen");
  const extension = path.extname(originalName) || `.${file.type.split("/")[1] || "jpg"}`;
  const baseName = path.basename(originalName, path.extname(originalName)) || "imagen";
  const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  await mkdir(uploadsDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}

