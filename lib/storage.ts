import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Dónde se guardan las fotos que sube la redacción. Se elige con STORAGE_DRIVER:
// - "local" (por defecto): la carpeta public/uploads, para tu computadora o un servidor propio (VPS).
// - "s3": cualquier almacenamiento compatible con S3 (Contabo Object Storage, Cloudflare R2, AWS…).
// En los dos casos la noticia guarda la misma dirección, /uploads/<archivo>: cambiar de
// almacenamiento no obliga a tocar la base de datos.

export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/** Carpeta dentro del bucket; así el bucket puede guardar otras cosas sin mezclarse. */
const BUCKET_PREFIX = "uploads/";

export function storageDriver(): "local" | "s3" {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[BilwiNoticias] STORAGE_DRIVER=s3 necesita la variable ${name}.`);
  }
  return value;
}

let client: S3Client | null = null;

function s3() {
  if (!client) {
    client = new S3Client({
      endpoint: required("S3_ENDPOINT"),
      region: process.env.S3_REGION?.trim() || "us-east-1",
      credentials: {
        accessKeyId: required("S3_ACCESS_KEY_ID"),
        secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
      },
      // Contabo y la mayoría de servicios compatibles usan https://servidor/bucket/archivo.
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    });
  }
  return client;
}

function bucket() {
  return required("S3_BUCKET");
}

export function bucketKey(fileName: string) {
  return `${BUCKET_PREFIX}${fileName}`;
}

/** Guarda una foto y devuelve la dirección que se guarda en la noticia. */
export async function saveUpload(fileName: string, bytes: Buffer, contentType: string) {
  if (storageDriver() === "s3") {
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: bucketKey(fileName),
        Body: bytes,
        ContentType: contentType,
        // El nombre lleva fecha y UUID: el archivo nunca cambia.
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } else {
    await mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_UPLOADS_DIR, fileName), bytes);
  }

  return `/uploads/${fileName}`;
}

/** Lee una foto del bucket (solo modo s3). Devuelve null si no existe. */
export async function readRemoteUpload(fileName: string, range?: string) {
  try {
    const result = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: bucketKey(fileName), Range: range }));
    if (!result.Body) return null;
    return {
      body: result.Body.transformToWebStream(),
      contentLength: result.ContentLength,
      contentRange: result.ContentRange,
    };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    // 404: no existe. Un 403 no se oculta: significa claves o permisos mal configurados.
    if (status === 404 || (error as { name?: string }).name === "NoSuchKey") return null;
    if (status === 416) return "invalid-range" as const;
    throw error;
  }
}
