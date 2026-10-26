import { NextResponse } from "next/server";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rejectUnlessAdmin } from "@/lib/admin-guard";
import { inspectMp4 } from "@/lib/mp4-inspect";
import {
  ACCEPTED_CLIP_TYPES,
  CLIP_TOLERANCE_SECONDS,
  MAX_CLIP_BYTES,
  MAX_CLIP_MB,
  MAX_CLIP_SECONDS,
} from "@/lib/video";

export const runtime = "nodejs";

function slugifyFileName(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .slice(0, 60) || "clip"
  );
}

function fail(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * Sube un clip de video. El cuerpo de la petición es el archivo tal cual (PUT), y se escribe
 * al disco por partes: nunca se carga el video completo en memoria.
 */
export async function PUT(request: Request) {
  const denied = await rejectUnlessAdmin();
  if (denied) return denied;

  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  if (!ACCEPTED_CLIP_TYPES.includes(type)) {
    return fail("El clip debe ser un video MP4 o MOV.", 415);
  }

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_CLIP_BYTES) {
    return fail(`El clip pesa más de ${MAX_CLIP_MB} MB.`, 413);
  }

  if (!request.body) {
    return fail("No llegó ningún archivo.", 400);
  }

  const originalName = decodeURIComponent(request.headers.get("x-file-name") || "clip");
  // H.264 en MOV se reproduce como MP4: se guarda siempre con extensión .mp4.
  const fileName = `${Date.now()}-${randomUUID()}-${slugifyFileName(originalName)}.mp4`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, fileName);
  await mkdir(uploadsDir, { recursive: true });

  const out = createWriteStream(filePath);
  const reader = request.body.getReader();
  let received = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_CLIP_BYTES) {
        throw Object.assign(new Error("too-large"), { tooLarge: true });
      }
      if (!out.write(value)) {
        await new Promise<void>((resolve) => out.once("drain", () => resolve()));
      }
    }
    await new Promise<void>((resolve, reject) => out.end((error?: Error | null) => (error ? reject(error) : resolve())));
  } catch (error) {
    out.destroy();
    await reader.cancel().catch(() => undefined);
    await unlink(filePath).catch(() => undefined);
    if ((error as { tooLarge?: boolean }).tooLarge) {
      return fail(`El clip pesa más de ${MAX_CLIP_MB} MB.`, 413);
    }
    return fail("Se cortó la subida del clip. Revisa la conexión e inténtalo de nuevo.", 400);
  }

  const info = await inspectMp4(filePath).catch(() => null);

  if (!info) {
    await unlink(filePath).catch(() => undefined);
    return fail("No se pudo leer el video. Asegúrate de que sea un MP4 o MOV válido.", 422);
  }

  if (info.durationSeconds > MAX_CLIP_SECONDS + CLIP_TOLERANCE_SECONDS) {
    await unlink(filePath).catch(() => undefined);
    return fail(
      `El clip dura ${Math.round(info.durationSeconds)} segundos; el máximo es ${MAX_CLIP_SECONDS}. Recórtalo y súbelo de nuevo.`,
      422,
    );
  }

  if (info.codec !== "h264") {
    await unlink(filePath).catch(() => undefined);
    return fail(
      info.codec === "hevc"
        ? "El clip está en formato HEVC, que muchos teléfonos Android no reproducen. En iPhone: Ajustes › Cámara › Formatos › «Más compatible», o envíatelo por WhatsApp y súbelo desde ahí."
        : "El clip usa un formato de video poco compatible. Expórtalo en MP4 (H.264) y súbelo de nuevo.",
      422,
    );
  }

  return NextResponse.json({
    url: `/uploads/${fileName}`,
    duration: Math.round(info.durationSeconds * 10) / 10,
    size: received,
  });
}
