"use client";

import Image from "next/image";
import { useState } from "react";

// Solo se optimizan las fuentes que next.config.ts permite; el resto se sirve tal cual.
function canOptimize(src: string) {
  return src.startsWith("/") || src.startsWith("https://images.unsplash.com/");
}

type SafeImageProps = {
  src: string;
  label: string;
  alt?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  /** Sin `fill`, la imagen toma el ancho de su contenedor y conserva su proporción real. */
  fill?: boolean;
};

/** Imagen de nota optimizada, con reemplazo sobrio cuando la URL ya no responde. */
export function SafeImage({ src, label, alt = "", className, sizes, priority = false, fill = true }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span className={`image-fallback${className ? ` ${className}` : ""}`} aria-hidden={alt ? undefined : true}>
        <span>{label}</span>
      </span>
    );
  }

  const shared = {
    src,
    alt,
    className,
    sizes,
    priority,
    unoptimized: !canOptimize(src),
    onError: () => setFailed(true),
    // La imagen pudo fallar antes de hidratar.
    ref: (node: HTMLImageElement | null) => {
      if (node && node.complete && node.naturalWidth === 0) setFailed(true);
    },
  };

  if (fill) {
    return <Image {...shared} fill />;
  }

  return <Image {...shared} width={1600} height={1067} style={{ width: "100%", height: "auto" }} />;
}
