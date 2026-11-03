"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Logo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconExternal,
  IconFile,
  IconFolder,
  IconLayout,
  IconMenu,
  IconMessage,
  IconPlus,
  IconUsers,
  IconX,
} from "@/components/icons";

const menu = [
  { href: "/admin", label: "Resumen", icon: <IconLayout /> },
  { href: "/admin/noticias", label: "Noticias", icon: <IconFile /> },
  { href: "/admin/categorias", label: "Secciones", icon: <IconFolder /> },
  { href: "/admin/comentarios", label: "Comentarios", icon: <IconMessage /> },
  { href: "/admin/usuarios", label: "Equipo", icon: <IconUsers /> },
];

const routeTitleMap: Record<string, string> = {
  "/admin": "Resumen",
  "/admin/noticias": "Noticias",
  "/admin/noticias/nueva": "Editor de noticia",
  "/admin/categorias": "Secciones",
  "/admin/usuarios": "Equipo editorial",
  "/admin/comentarios": "Comentarios",
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({
  children,
  userName = "Administrador",
  userEmail = "admin@bilwi.ni",
}: {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentTitle = routeTitleMap[pathname] || "Panel";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={`admin${open ? " admin--menu-open" : ""}`}>
      <aside className="admin-sidebar" id="admin-sidebar" aria-label="Menú del panel">
        <div className="admin-sidebar-head">
          <Link className="admin-brand" href="/admin">
            <Logo title="Bilwi Noticias" />
            <span className="admin-brand-sub">Redacción</span>
          </Link>
          <button className="icon-button admin-sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <IconX />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Administración">
          <ul>
            {menu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-user">
          <span className="admin-user-avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <div className="admin-user-text">
            <strong>{userName}</strong>
            <span>{userEmail}</span>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <button className="admin-scrim" type="button" aria-label="Cerrar menú" tabIndex={-1} onClick={() => setOpen(false)} />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="icon-button admin-menu-toggle"
            type="button"
            aria-label="Abrir menú"
            aria-controls="admin-sidebar"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <IconMenu />
          </button>
          <h1 className="admin-title">{currentTitle}</h1>
          <div className="admin-top-actions">
            <ThemeToggle />
            <Link className="button button--ghost" href="/" target="_blank">
              <IconExternal size={16} />
              <span>Ver sitio</span>
            </Link>
            {pathname !== "/admin/noticias/nueva" ? (
              <Link className="button button--primary" href="/admin/noticias/nueva">
                <IconPlus size={16} />
                <span>Nueva noticia</span>
              </Link>
            ) : null}
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
