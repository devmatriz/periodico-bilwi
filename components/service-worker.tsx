"use client";

import { useEffect } from "react";

// Registra el service worker que muestra la página sin conexión. Solo en producción:
// en `next dev` chocaría con la recarga automática.
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Sin service worker el sitio funciona igual; solo falta la página sin conexión.
    });
  }, []);

  return null;
}
