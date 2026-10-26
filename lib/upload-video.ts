// Utilidades del navegador para los clips de video del editor.
import { uploadImage } from "@/lib/upload-image";
import {
  ACCEPTED_CLIP_TYPES,
  CLIP_TOLERANCE_SECONDS,
  MAX_CLIP_BYTES,
  MAX_CLIP_MB,
  MAX_CLIP_SECONDS,
} from "@/lib/video";

function loadVideo(file: File) {
  return new Promise<{ video: HTMLVideoElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadeddata = () => resolve({ video, url });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    video.src = url;
  });
}

/** Revisa tipo, peso y duración antes de subir. Devuelve un mensaje de error o null. */
export async function checkClip(file: File): Promise<string | null> {
  if (!ACCEPTED_CLIP_TYPES.includes(file.type)) {
    return "El clip debe ser un video MP4 o MOV.";
  }
  if (file.size > MAX_CLIP_BYTES) {
    return `El clip pesa ${(file.size / 1024 / 1024).toFixed(0)} MB; el máximo es ${MAX_CLIP_MB} MB. Envíatelo por WhatsApp (lo comprime) o expórtalo en 720p.`;
  }

  // Si este navegador no puede abrirlo, el servidor revisa la duración de todas formas.
  const loaded = await loadVideo(file).catch(() => null);
  if (!loaded) return null;
  const { video, url } = loaded;
  const duration = video.duration;
  URL.revokeObjectURL(url);

  if (Number.isFinite(duration) && duration > MAX_CLIP_SECONDS + CLIP_TOLERANCE_SECONDS) {
    return `El clip dura ${Math.round(duration)} segundos; el máximo es ${MAX_CLIP_SECONDS}. Recórtalo y súbelo de nuevo.`;
  }
  return null;
}

/** Toma un cuadro del clip como portada: el lector ve esta imagen y no descarga el video hasta dar play. */
export async function capturePoster(file: File): Promise<string> {
  const loaded = await loadVideo(file).catch(() => null);
  if (!loaded) return "";
  const { video, url } = loaded;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("seek"));
      video.currentTime = Math.min(0.8, (video.duration || 1) / 2);
    });

    const scale = Math.min(1, 1280 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context || !canvas.width) return "";
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return "";
    const name = file.name.replace(/\.[^.]+$/, "") || "clip";
    return await uploadImage(new File([blob], `${name}-portada.jpg`, { type: "image/jpeg" }));
  } catch {
    return "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Sube el clip con progreso (0 a 1). Usa XHR porque fetch no informa el avance de la subida. */
export function uploadClip(file: File, onProgress: (fraction: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "/api/uploads/video");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let data: { url?: string; message?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) {
        resolve(data.url);
      } else {
        reject(new Error(data?.message || "No se pudo subir el clip."));
      }
    };
    xhr.onerror = () => reject(new Error("Se cortó la subida del clip. Revisa la conexión e inténtalo de nuevo."));
    xhr.send(file);
  });
}
