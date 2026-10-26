"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusPill, statusLabels } from "@/components/admin-status";
import { IconEye, IconPencil, IconSearch, IconTrash } from "@/components/icons";
import { SafeImage } from "@/components/story-image";
import { displayCategory } from "@/lib/sections";
import type { NewsItem, NewsStatus } from "@/lib/content-store";

type Filter = "all" | NewsStatus | "featured";

type Props = {
  items: NewsItem[];
  initialFilter?: string;
};

const filters: Filter[] = ["all", "published", "draft", "scheduled", "archived", "featured"];

function filterLabel(filter: Filter) {
  if (filter === "all") return "Todas";
  if (filter === "featured") return "En portada";
  return statusLabels[filter];
}

function matches(item: NewsItem, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "featured") return item.featured;
  return item.status === filter;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminNewsTable({ items, initialFilter }: Props) {
  const router = useRouter();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(
    filters.includes(initialFilter as Filter) ? (initialFilter as Filter) : "all",
  );

  const counts = useMemo(
    () => Object.fromEntries(filters.map((item) => [item, items.filter((post) => matches(post, item)).length])),
    [items],
  );

  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter(
      (post) =>
        matches(post, filter) &&
        (!needle || normalize(`${post.title} ${post.category} ${post.author}`).includes(needle)),
    );
  }, [items, filter, query]);

  async function handleDelete(slug: string, title: string) {
    const confirmed = window.confirm(`¿Eliminar “${title}”? Esta acción no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    setDeletingSlug(slug);
    setError("");
    try {
      const response = await fetch(`/api/noticias/${slug}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("No se pudo eliminar la noticia. Inténtalo de nuevo.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la noticia.");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Filtrar por estado">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {filterLabel(item)} <span className="segmented-count">{counts[item]}</span>
            </button>
          ))}
        </div>
        <div className="input-icon toolbar-search">
          <IconSearch size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, sección o autor"
            aria-label="Buscar noticias"
          />
        </div>
      </div>

      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}

      {visible.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table data-table--news">
            <thead>
              <tr>
                <th scope="col">Noticia</th>
                <th scope="col" className="col-status">Estado</th>
                <th scope="col" className="col-date">Fecha</th>
                <th scope="col" className="col-actions">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="table-story">
                      <span className="table-thumb">
                        <SafeImage src={post.image} label={displayCategory(post.category).slice(0, 1)} sizes="64px" />
                      </span>
                      <div>
                        <Link className="table-title" href={`/admin/noticias/nueva?slug=${post.slug}`}>
                          {post.title}
                        </Link>
                        <span className="table-sub">
                          {displayCategory(post.category)} · {post.author}
                          {post.featured ? <span className="flag">En portada</span> : null}
                        </span>
                        <span className="table-status-inline">
                          <StatusPill status={post.status} />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="col-status">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="col-date">{formatDate(post.publishedAt || post.updatedAt)}</td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <Link className="icon-button" href={`/noticias/${post.slug}`} title="Ver en el sitio" aria-label={`Ver “${post.title}”`}>
                        <IconEye size={18} />
                      </Link>
                      <Link
                        className="icon-button"
                        href={`/admin/noticias/nueva?slug=${post.slug}`}
                        title="Editar"
                        aria-label={`Editar “${post.title}”`}
                      >
                        <IconPencil size={18} />
                      </Link>
                      <button
                        className="icon-button icon-button--danger"
                        type="button"
                        title="Eliminar"
                        aria-label={`Eliminar “${post.title}”`}
                        onClick={() => void handleDelete(post.slug, post.title)}
                        disabled={deletingSlug === post.slug}
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <h3>No hay noticias en esta vista</h3>
          <p>{query ? "Ninguna noticia coincide con la búsqueda." : "Cambia el filtro o crea una noticia nueva."}</p>
          <Link className="button button--primary" href="/admin/noticias/nueva">
            Nueva noticia
          </Link>
        </div>
      )}
    </div>
  );
}
