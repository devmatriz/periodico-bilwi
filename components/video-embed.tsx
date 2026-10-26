"use client";

import { useState } from "react";
import { SafeImage } from "@/components/story-image";
import { IconExternal } from "@/components/icons";
import { parseVideoUrl } from "@/lib/video";

type Props = {
  url: string;
  caption: string;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * Video de YouTube o Facebook dentro de la noticia. Hasta que el lector toca «reproducir»
 * solo se muestra la portada: no se descarga el reproductor de la red ni se cargan sus cookies.
 */
export function VideoEmbed({ url, caption }: Props) {
  const [playing, setPlaying] = useState(false);
  const source = parseVideoUrl(url);

  if (!source) {
    return (
      <p className="article-video-fallback">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Ver el video {caption ? `«${caption}»` : ""} <IconExternal size={14} />
        </a>
      </p>
    );
  }

  const title = caption ? `${caption} (video de ${source.platform})` : `Video de ${source.platform}`;

  return (
    <figure className={`article-video${source.vertical ? " article-video--vertical" : ""}`}>
      <div className="article-video-frame">
        {playing ? (
          <iframe
            src={source.embedUrl}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button className="article-video-facade" type="button" onClick={() => setPlaying(true)} aria-label={`Reproducir: ${title}`}>
            {source.thumbnail ? (
              <SafeImage src={source.thumbnail} label={source.platform} sizes="(min-width: 860px) 760px, 100vw" />
            ) : (
              <span className="article-video-placeholder" aria-hidden="true">
                Video de {source.platform}
              </span>
            )}
            <span className="article-video-play" aria-hidden="true">
              <PlayIcon />
            </span>
            <span className="article-video-provider" aria-hidden="true">
              {source.platform}
            </span>
          </button>
        )}
      </div>
      <figcaption>
        {caption ? <span className="article-video-caption">{caption}</span> : null}
        <a className="article-video-link" href={source.url} target="_blank" rel="noopener noreferrer">
          Ver en {source.platform} <IconExternal size={14} />
        </a>
      </figcaption>
    </figure>
  );
}
