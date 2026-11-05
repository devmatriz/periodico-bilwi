import { NextResponse } from "next/server";
import { rejectUnlessStaff } from "@/lib/admin-guard";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { saveUpload, storageDriver } from "@/lib/storage";

export const runtime = "nodejs";

// Vercel no acepta peticiones de más de 4,5 MB; el panel ya achica las fotos antes de subirlas.
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

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
  const denied = await rejectUnlessStaff();
  if (denied) return denied;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Debes enviar un archivo." }, { status: 400 });
  }

  // Sin SVG: puede llevar código, y la foto se sirve desde el dominio del periódico.
  const extensionForType = ALLOWED_TYPES[file.type];
  if (!extensionForType) {
    return NextResponse.json({ message: "La imagen debe ser JPG, PNG, WebP, GIF o AVIF." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "La imagen pesa más de 4 MB. Redúcela e inténtalo de nuevo." }, { status: 413 });
  }

  // En Vercel el disco se borra en cada despliegue: ahí la foto se perdería.
  if (process.env.VERCEL && storageDriver() === "local") {
    return NextResponse.json(
      { message: "El almacenamiento de fotos no está configurado (STORAGE_DRIVER=s3)." },
      { status: 500 },
    );
  }

  const originalName = slugifyFileName(file.name || "imagen");
  const extension = extensionForType;
  const baseName = path.basename(originalName, path.extname(originalName)) || "imagen";
  const fileName = `${Date.now()}-${randomUUID()}-${baseName}${extension}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await saveUpload(fileName, bytes, file.type);

  return NextResponse.json({
    url,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}

