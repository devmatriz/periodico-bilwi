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
