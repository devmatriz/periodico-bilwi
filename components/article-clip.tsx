"use client";

import { useRef, useState } from "react";
import { IconExternal } from "@/components/icons";
import { platformName } from "@/lib/video";

type Props = {
  src: string;
  poster: string;
  full: string;
  caption: string;
};

function posterUrl(poster: string) {
  // La portada pasa por el optimizador de imágenes: llega liviana en AVIF o WebP.
  return poster.startsWith("/") ? `/_next/image?url=${encodeURIComponent(poster)}&w=1080&q=75` : poster;
}

/** Clip corto alojado en el sitio, con enlace al video completo en la red donde se publicó. */
export function ArticleClip({ src, poster, full, caption }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const platform = full ? platformName(full) : "";

  function replay() {
    setEnded(false);
    if (video.current) {
      video.current.currentTime = 0;
      void video.current.play();
    }
  }

  return (
    <figure className="article-clip">
      <div className="article-clip-frame">
        <video
          ref={video}
          src={src}
          poster={poster ? posterUrl(poster) : undefined}
          // Sin portada se pide solo el inicio del archivo para mostrar un cuadro.
          preload={poster ? "none" : "metadata"}
          controls
          playsInline
          onEnded={() => setEnded(true)}
          onPlay={() => setEnded(false)}
          aria-label={caption ? `Clip: ${caption}` : "Clip de video"}
        />
        {ended && full ? (
          <div className="article-clip-end">
            <p>Este es un fragmento. El video completo está en {platform}.</p>
            <a className="button button--primary" href={full} target="_blank" rel="noopener noreferrer">
              Ver el video completo <IconExternal size={16} />
            </a>
            <button className="button button--ghost article-clip-replay" type="button" onClick={replay}>
              Repetir clip
            </button>
          </div>
        ) : null}
      </div>
      <figcaption>
        <span className="article-clip-badge">Clip</span>
        {caption ? <span className="article-clip-caption">{caption}</span> : null}
        {full ? (
          <a className="article-clip-link" href={full} target="_blank" rel="noopener noreferrer">
            Ver el video completo en {platform} <IconExternal size={14} />
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
