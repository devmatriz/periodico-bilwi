"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/icons";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

type ThemeLabels = { toggle: string; toDark: string; toLight: string };

const defaultLabels: ThemeLabels = { toggle: "Cambiar tema", toDark: "Activar modo oscuro", toLight: "Activar modo claro" };

export function ThemeToggle({ labels = defaultLabels }: { labels?: ThemeLabels }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");

    // Mantiene sincronizadas otras pestañas abiertas del sitio.
    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Sin almacenamiento disponible: el cambio vale solo para esta visita.
    }
  }

  const isDark = theme === "dark";
  const label = theme === null ? labels.toggle : isDark ? labels.toLight : labels.toDark;

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label={label} title={label}>
      <span className="theme-toggle-moon">
        <IconMoon size={18} />
      </span>
      <span className="theme-toggle-sun">
        <IconSun size={18} />
      </span>
    </button>
  );
}
