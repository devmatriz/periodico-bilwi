import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

// En producción Next solo sirve los archivos que estaban en public/ al compilar.
// Las imágenes que la redacción sube después llegan aquí, con la misma URL /uploads/<archivo>.

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

type Context = {
  params: Promise<{ file: string }>;
};

export async function GET(_request: Request, context: Context) {
  const { file } = await context.params;

  // Solo nombres planos como los que genera /api/uploads: nada de rutas ni "..".
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(file) || file.includes("..")) {
    return new Response("No encontrado", { status: 404 });
  }

  const type = contentTypes[path.extname(file).toLowerCase()];
  if (!type) {
    return new Response("No encontrado", { status: 404 });
  }

  try {
    const data = await readFile(path.join(process.cwd(), "public", "uploads", file));
    const headers: Record<string, string> = {
      "Content-Type": type,
      // Los nombres llevan fecha y UUID: el archivo nunca cambia.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };
    if (type === "image/svg+xml") {
      // Un SVG subido no puede ejecutar código en el sitio.
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }
    return new Response(new Uint8Array(data), { headers });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
