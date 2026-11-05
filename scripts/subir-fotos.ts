// Copia las fotos de public/uploads al bucket (STORAGE_DRIVER=s3), con el mismo nombre.
// Como las noticias guardan /uploads/<archivo>, no hay que cambiar nada en la base de datos.
// No borra nada de tu computadora y se puede repetir: las fotos que ya están en el bucket se saltan.
//
// Uso:  npm run media:upload

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { bucketKey, LOCAL_UPLOADS_DIR } from "@/lib/storage";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
};

function env(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Falta la variable ${name} en .env`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const bucket = env("S3_BUCKET");
  const client = new S3Client({
    endpoint: env("S3_ENDPOINT"),
    region: process.env.S3_REGION?.trim() || "us-east-1",
    credentials: { accessKeyId: env("S3_ACCESS_KEY_ID"), secretAccessKey: env("S3_SECRET_ACCESS_KEY") },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  });

  const files = (await readdir(LOCAL_UPLOADS_DIR)).filter((name) => contentTypes[path.extname(name).toLowerCase()]);
  let uploaded = 0;
  let skipped = 0;

  for (const name of files) {
    const Key = bucketKey(name);
    const exists = await client
      .send(new HeadObjectCommand({ Bucket: bucket, Key }))
      .then(() => true)
      .catch((error) => {
        if (error?.$metadata?.httpStatusCode === 404) return false;
        throw error;
      });

    if (exists) {
      skipped += 1;
      continue;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key,
        Body: await readFile(path.join(LOCAL_UPLOADS_DIR, name)),
        ContentType: contentTypes[path.extname(name).toLowerCase()],
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    uploaded += 1;
    console.log(`Subida: ${name}`);
  }

  console.log(`Fotos: ${uploaded} subidas, ${skipped} ya estaban, ${files.length} en total.`);

  // Si el bucket ya tiene dirección pública, comprueba que cada foto responda.
  const media = process.env.MEDIA_PUBLIC_URL?.trim().replace(/\/+$/, "");
  if (media) {
    let failed = 0;
    for (const name of files) {
      const response = await fetch(`${media}/${bucketKey(name)}`, { method: "HEAD" });
      if (!response.ok) {
        failed += 1;
        console.log(`No responde (${response.status}): ${media}/${bucketKey(name)}`);
      }
    }
    console.log(failed === 0 ? `Todas responden en ${media}.` : `${failed} fotos no responden en la dirección pública.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
