"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9 4h7v3h-7v-3Zm0-3h7v1h-7v-1Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h8l4 4v16H6V2Zm8 1.5V7h3.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-3.86-5H10a3 3 0 1 0-5.02 0H2v2h2.98A3 3 0 0 0 10 11h6Zm-4 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

const menu = [
  { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/admin/noticias", label: "News", icon: <FileIcon /> },
  { href: "/admin/categorias", label: "Categories", icon: <DashboardIcon /> },
  { href: "/admin/usuarios", label: "Users", icon: <UsersIcon /> },
  { href: "/admin/comentarios", label: "Comments", icon: <FileIcon /> },
];

export function AdminShell({
  children,
  title = "Dashboard",
  userName = "Admin User",
  userEmail = "admin@bilwi.ni",
}: {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const routeTitleMap: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/noticias": "Noticias",
    "/admin/noticias/nueva": "Editor",
    "/admin/categorias": "Categorias",
    "/admin/usuarios": "Usuarios",
    "/admin/comentarios": "Comentarios",
  };
  const currentTitle = title === "Dashboard" ? routeTitleMap[pathname] || title : title;

  return (
    <div className="admin-shell">
      <input
        className="admin-sidebar-toggle"
        type="checkbox"
        id="admin-sidebar-toggle"
        aria-hidden="true"
      />
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <div className="admin-brand">
            <div className="admin-brand-mark">B</div>
            <div>
              <strong>Bilwi Admin</strong>
              <span>Editorial Panel</span>
            </div>
          </div>

          <label className="icon-button admin-sidebar-close" htmlFor="admin-sidebar-toggle" aria-label="Cerrar menu">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.3 19.71 2.88 18.29 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3 1.42 1.42Z" />
            </svg>
          </label>
        </div>

        <div className="admin-sidebar-brief">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,.84)" }}>
            Centro editorial
          </span>
          <h2>Bilwi Noticias</h2>
          <p>Publica, organiza y monitorea la cobertura diaria desde un solo lugar.</p>

          <div className="admin-sidebar-brief-grid">
            <div>
              <strong>4</strong>
              <span>Secciones</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>Actualizacion</span>
            </div>
          </div>
        </div>

        <div className="admin-sidebar-group">
          <span className="admin-sidebar-label">Workspace</span>
          <nav className="admin-nav" aria-label="Administracion">
            {menu.map((item) => (
              <Link key={item.href} href={item.href} className="admin-nav-link">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-group admin-sidebar-group--bottom">
          <span className="admin-sidebar-label">Sesion</span>
          <div className="admin-user-card">
            <div className="avatar" />
            <div>
              <strong>{userName}</strong>
              <span>{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-title-row">
            <label className="icon-button admin-menu-toggle" htmlFor="admin-sidebar-toggle" aria-label="Menu">
              <span />
              <span />
              <span />
            </label>
            <h1>{currentTitle}</h1>
          </div>

          <div className="admin-top-actions">
            <label className="search-field admin-search" aria-label="Buscar noticias y usuarios">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 4a6.5 6.5 0 1 0 4.43 11.26l4.4 4.4 1.42-1.42-4.4-4.4A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
              </svg>
              <input type="search" placeholder="Buscar noticias, usuarios..." />
            </label>
            <AdminLogoutButton />
            <button className="icon-button" type="button" aria-label="Notificaciones">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6V11a8 8 0 1 0-16 0v5l-2 2v1h20v-1l-2-2Z" />
              </svg>
            </button>
            <button className="icon-button" type="button" aria-label="Perfil">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
              </svg>
            </button>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </section>
    </div>
  );
}
