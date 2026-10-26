// Utilidades del navegador para subir imágenes desde el editor.

const MAX_SIDE = 2000;
const SKIP_BELOW_BYTES = 400_000;

/**
 * Reduce fotos grandes (por ejemplo las de un teléfono) antes de subirlas:
 * lado mayor de 2000px y compresión 0.85. Si el resultado no es más liviano, se usa el original.
 */
export async function prepareImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < SKIP_BELOW_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) {
    return file;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // El PNG puede tener transparencia: WebP la conserva. Las fotos van en JPEG.
  const targetType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetType, 0.85));

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}

/** Sube una imagen al endpoint existente /api/uploads y devuelve su URL pública. */
export async function uploadImage(file: File): Promise<string> {
  const prepared = await prepareImage(file);
  const form = new FormData();
  form.append("file", prepared);

  const response = await fetch("/api/uploads", { method: "POST", body: form });
  const data = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.message || `No se pudo subir “${file.name}”.`);
  }

  return data.url;
}
