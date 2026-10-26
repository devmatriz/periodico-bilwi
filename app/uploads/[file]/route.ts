import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";

// En producción Next solo sirve los archivos que estaban en public/ al compilar.
// Las imágenes y clips que la redacción sube después llegan aquí, con la misma URL /uploads/<archivo>.

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

  const filePath = path.join(process.cwd(), "public", "uploads", file);
  const info = await stat(filePath).catch(() => null);
  if (!info?.isFile()) {
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

  // Rangos: el reproductor del iPhone los exige y permiten adelantar el clip sin bajarlo entero.
  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
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
