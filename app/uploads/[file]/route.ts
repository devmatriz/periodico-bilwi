import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { LOCAL_UPLOADS_DIR, readRemoteUpload, storageDriver } from "@/lib/storage";

export const runtime = "nodejs";

// En producción Next solo sirve los archivos que estaban en public/ al compilar.
// Las imágenes y clips que la redacción sube después llegan aquí, con la misma URL /uploads/<archivo>.
// Con STORAGE_DRIVER=s3 se leen del bucket. Si además existe MEDIA_PUBLIC_URL, next.config.ts
// manda /uploads/… directo a esa dirección y esta ruta ni siquiera se ejecuta.

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

type Context = {
  params: Promise<{ file: string }>;
};

function notFound() {
  return new Response("No encontrado", { status: 404 });
}

function stream(filePath: string, start?: number, end?: number) {
  return Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream<Uint8Array>;
}

export async function GET(request: Request, context: Context) {
  const { file } = await context.params;

  // Solo nombres planos como los que generan las subidas: nada de rutas ni "..".
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(file) || file.includes("..")) {
    return notFound();
  }

  const type = contentTypes[path.extname(file).toLowerCase()];
  if (!type) {
    return notFound();
  }

  const headers: Record<string, string> = {
    "Content-Type": type,
    // Los nombres llevan fecha y UUID: el archivo nunca cambia.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  if (type === "image/svg+xml") {
    // Un SVG subido no puede ejecutar código en el sitio.
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }

  const rangeHeader = request.headers.get("range") ?? undefined;

  if (storageDriver() === "s3") {
    const remote = await readRemoteUpload(file, rangeHeader?.match(/^bytes=\d*-\d*$/) ? rangeHeader : undefined);
    if (remote === "invalid-range") {
      return new Response(null, { status: 416 });
    }
    if (!remote) {
      return notFound();
    }
    const extra: Record<string, string> = {};
    if (remote.contentLength !== undefined) extra["Content-Length"] = String(remote.contentLength);
    if (remote.contentRange) extra["Content-Range"] = remote.contentRange;
    return new Response(remote.body, { status: remote.contentRange ? 206 : 200, headers: { ...headers, ...extra } });
  }

  const filePath = path.join(LOCAL_UPLOADS_DIR, file);
  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
    return notFound();
  }

  // Rangos: el reproductor del iPhone los exige y permiten adelantar el clip sin bajarlo entero.
  const range = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const size = info.size;
    let start = range[1] ? Number(range[1]) : NaN;
    let end = range[2] ? Number(range[2]) : NaN;
    if (Number.isNaN(start)) {
      // bytes=-N: los últimos N bytes.
      start = Math.max(0, size - (Number.isNaN(end) ? 0 : end));
      end = size - 1;
    } else if (Number.isNaN(end) || end >= size) {
      end = size - 1;
    }

    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }

    return new Response(stream(filePath, start, end), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  return new Response(stream(filePath), { headers: { ...headers, "Content-Length": String(info.size) } });
}
