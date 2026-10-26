// Reglas de los clips de video, compartidas por el editor (navegador) y el servidor.

/** Duración máxima de un clip. Cámbiala a 30 si la redacción prefiere clips más cortos. */
export const MAX_CLIP_SECONDS = 60;
/** Margen para redondeos de la cámara (un clip de 60,4 s cuenta como 60). */
export const CLIP_TOLERANCE_SECONDS = 1;
export const MAX_CLIP_MB = 50;
export const MAX_CLIP_BYTES = MAX_CLIP_MB * 1024 * 1024;
export const ACCEPTED_CLIP_TYPES = ["video/mp4", "video/quicktime"];

/** Nombre de la red donde está el video completo, para el texto del enlace. */
export function platformName(url: string) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return "la fuente original";
  }
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
  if (host === "fb.watch" || host.endsWith("facebook.com")) return "Facebook";
  if (host.endsWith("instagram.com")) return "Instagram";
  if (host.endsWith("tiktok.com")) return "TikTok";
  if (host === "x.com" || host.endsWith("twitter.com")) return "X";
  if (host.endsWith("vimeo.com")) return "Vimeo";
  return host || "la fuente original";
}

export function isValidFullVideoUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function formatSeconds(seconds: number) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
