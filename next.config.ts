import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF primero, WebP como respaldo: fotos mucho más livianas para datos móviles.
    formats: ["image/avif", "image/webp"],
    // Anchos pensados para teléfonos, tabletas y la columna de 1240px del sitio.
    deviceSizes: [390, 640, 828, 1080, 1280, 1600],
    imageSizes: [64, 128, 240, 360],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Portadas de videos de YouTube: pasan por el optimizador y no exponen al lector a Google antes de reproducir.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
