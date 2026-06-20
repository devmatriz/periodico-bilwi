"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { NewsItem } from "@/lib/content-store";

type Props = {
  items: NewsItem[];
};

function statusLabel(status: NewsItem["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  if (status === "scheduled") return "Programado";
  return "Archivado";
}

function statusTone(status: NewsItem["status"]) {
  if (status === "published") return "green";
  if (status === "draft") return "gold";
  if (status === "scheduled") return "blue";
  return "gray";
}

export function AdminNewsTable({ items }: Props) {
  const router = useRouter();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta noticia?");
    if (!confirmed) {
      return;
    }

    setDeletingSlug(slug);
    try {
      const response = await fetch(`/api/noticias/${slug}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo eliminar la noticia.");
      }

      router.refresh();
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="admin-news-board">
      <div className="admin-news-board-top">
        <div>
          <span className="eyebrow">Cobertura editorial</span>
          <h3>{items.length} noticias registradas</h3>
        </div>
        <div className="admin-news-board-chips">
          <span className="admin-board-chip">Publicadas</span>
          <span className="admin-board-chip">Borradores</span>
          <span className="admin-board-chip">Programadas</span>
        </div>
      </div>

      <div className="admin-news-grid">
        {items.map((post) => (
          <article key={post.id} className="admin-news-card">
            <div
              className="admin-news-card-image"
              style={{ backgroundImage: `url(${post.image})` }}
              aria-hidden="true"
            />

            <div className="admin-news-card-body">
              <div className="admin-news-card-top">
                <span className={`admin-status-pill admin-status-pill--${statusTone(post.status)}`}>
                  {statusLabel(post.status)}
                </span>
                {post.featured ? <span className="admin-board-chip admin-board-chip--accent">Destacada</span> : null}
              </div>

              <h4>{post.title}</h4>
              <p>{post.excerpt || post.content.slice(0, 120)}</p>

              <div className="admin-news-meta">
                <span>{post.category}</span>
                <span>{post.time}</span>
              </div>

              <div className="admin-news-actions">
                <Link className="admin-news-action" href={`/noticias/${post.slug}`}>
                  Ver
                </Link>
                <Link className="admin-news-action" href={`/admin/noticias/nueva?slug=${post.slug}`}>
                  Editar
                </Link>
                <button
                  className="admin-news-action admin-news-action--danger"
                  type="button"
                  onClick={() => void handleDelete(post.slug)}
                  disabled={deletingSlug === post.slug}
                >
                  {deletingSlug === post.slug ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

