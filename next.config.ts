import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite compilar una copia de prueba (NEXT_DIST_DIR=next-dist) sin pisar la de `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
  async rewrites() {
    // Con las fotos en un bucket público (Contabo Object Storage, R2…), /uploads/<archivo> se pide
    // directo a esa dirección. Las noticias guardan siempre /uploads/…, sin importar dónde viva la foto.
    const media = process.env.MEDIA_PUBLIC_URL?.trim().replace(/\/+$/, "");
    if (!media) return [];
    return {
      beforeFiles: [{ source: "/uploads/:file", destination: `${media}/uploads/:file` }],
    };
  },
  async headers() {
    return [
      {
        // El navegador debe pedir siempre la última versión del service worker.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        // Android comprueba aquí que la app ni.bilwinoticias.app pertenece al sitio.
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
