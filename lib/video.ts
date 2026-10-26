// Videos enlazados desde YouTube o Facebook: el sitio no aloja video, solo muestra
// una portada liviana y carga el reproductor de la red cuando el lector toca «reproducir».

export type VideoProvider = "youtube" | "facebook";

export type VideoSource = {
  provider: VideoProvider;
  /** Nombre visible de la red. */
  platform: string;
  /** Enlace original, para «Ver en YouTube/Facebook». */
  url: string;
  /** Dirección del reproductor que se carga al tocar «reproducir». */
  embedUrl: string;
  /** Miniatura pública (solo YouTube); Facebook no la expone sin credenciales. */
  thumbnail: string;
  /** Shorts y reels son verticales. */
  vertical: boolean;
};

function parseUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** "1m30s", "90s" o "90" a segundos, para empezar el video donde indica el enlace. */
function startSeconds(value: string | null) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function youtube(url: URL): VideoSource | null {
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id = "";
  let vertical = false;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first === "watch") id = url.searchParams.get("v") || "";
    else if (first === "shorts") {
      id = second || "";
      vertical = true;
    } else if (first === "embed" || first === "live" || first === "v") id = second || "";
  } else {
    return null;
  }

  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;

  const params = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" });
  const start = startSeconds(url.searchParams.get("t") || url.searchParams.get("start"));
  if (start > 0) params.set("start", String(start));

  return {
    provider: "youtube",
    platform: "YouTube",
    url: url.toString(),
    // Modo sin cookies de seguimiento hasta que el lector reproduce.
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${params}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    vertical,
  };
}

function facebook(url: URL): VideoSource | null {
  const host = url.hostname.replace(/^(www|m|web|mbasic)\./, "");
  if (host !== "facebook.com" && host !== "fb.watch") return null;

  const path = url.pathname;
  const isVideo =
    host === "fb.watch" ||
    /\/videos\//.test(path) ||
    path.startsWith("/watch") ||
    path.startsWith("/reel/") ||
    path.startsWith("/share/v/") ||
    path.startsWith("/share/r/");
  if (!isVideo) return null;

  const vertical = path.startsWith("/reel/") || path.startsWith("/share/r/");
  const canonical = new URL(url.toString());
  canonical.hostname = host === "fb.watch" ? "fb.watch" : "www.facebook.com";
  const params = new URLSearchParams({ href: canonical.toString(), show_text: "false", autoplay: "1" });

  return {
    provider: "facebook",
    platform: "Facebook",
    url: canonical.toString(),
    embedUrl: `https://www.facebook.com/plugins/video.php?${params}`,
    thumbnail: "",
    vertical,
  };
}

/** Reconoce un enlace de YouTube o Facebook; null si no es un video de esas redes. */
export function parseVideoUrl(raw: string): VideoSource | null {
  const url = parseUrl(raw);
  if (!url) return null;
  return youtube(url) ?? facebook(url);
}
