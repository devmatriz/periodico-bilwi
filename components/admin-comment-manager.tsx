"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/admin-status";
import { IconTrash } from "@/components/icons";
import type { ArticleComment, CommentStatus } from "@/lib/comment-store";

type Props = {
  items: ArticleComment[];
};

const statusLabels: Record<CommentStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  spam: "Spam",
};

const statusTones: Record<CommentStatus, string> = {
  pending: "gold",
  approved: "green",
  rejected: "gray",
  spam: "red",
};

const filters: Array<"all" | CommentStatus> = ["all", "pending", "approved", "rejected", "spam"];

export function AdminCommentManager({ items }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState(items);
  const [filter, setFilter] = useState<"all" | CommentStatus>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const stats = useMemo(() => {
    const pending = comments.filter((item) => item.status === "pending").length;
    const approved = comments.filter((item) => item.status === "approved").length;
    const rejected = comments.filter((item) => item.status === "rejected").length;
    const spam = comments.filter((item) => item.status === "spam").length;
    return [
      { label: "Por revisar", value: pending.toString() },
      { label: "Aprobados", value: approved.toString() },
      { label: "Rechazados", value: rejected.toString() },
      { label: "Spam", value: spam.toString() },
      { label: "Total", value: comments.length.toString() },
    ];
  }, [comments]);

  const filtered = filter === "all" ? comments : comments.filter((item) => item.status === filter);

  async function mutateComment(id: string, method: "PATCH" | "DELETE", payload?: Record<string, unknown>) {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/comentarios/${encodeURIComponent(id)}`, {
        method,
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const data = (await response.json().catch(() => null)) as { item?: ArticleComment; message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo actualizar el comentario.");
      }

      startTransition(() => {
        if (method === "DELETE") {
          setComments((current) => current.filter((item) => item.id !== id));
        } else if (data?.item) {
          setComments((current) => current.map((item) => (item.id === id ? data.item! : item)));
        }
        router.refresh();
      });
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo actualizar el comentario.");
    } finally {
      setBusyId(null);
    }
  }

  function displayTime(value: string) {
    return new Intl.DateTimeFormat("es-NI", {
      timeZone: "America/Managua",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  return (
    <div className="admin-stack">
      <section className="admin-board admin-board--compact" aria-label="Resumen de comentarios">
        <ul>
          {stats.map((stat) => (
            <li key={stat.label}>
              <span className="tile tile--sm">{stat.value}</span>
              <span className="admin-board-label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="panel">
        <div className="toolbar">
          <div className="segmented" role="group" aria-label="Filtrar comentarios">
            {filters.map((item) => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {item === "all" ? "Todos" : statusLabels[item]}{" "}
                <span className="segmented-count">
                  {item === "all" ? comments.length : comments.filter((comment) => comment.status === item).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        ) : null}

        {filtered.length > 0 ? (
          <ul className="queue">
            {filtered.map((comment) => {
              const busy = busyId === comment.id;
              return (
                <li key={comment.id} className="queue-item">
                  <span className="comment-avatar" aria-hidden="true">
                    {comment.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="queue-main">
                    <p className="queue-meta">
                      <strong>{comment.name}</strong>
                      {comment.email ? <span>{comment.email}</span> : null}
                      <time dateTime={comment.createdAt}>{displayTime(comment.createdAt)}</time>
                      <StatusPill status={statusTones[comment.status]} label={statusLabels[comment.status]} />
                    </p>
                    <p className="queue-text">{comment.message}</p>
                    <p className="queue-source">
                      En <a href={`/noticias/${comment.slug}`}>{comment.articleTitle}</a>
                    </p>
                  </div>
                  <div className="queue-actions">
                    {comment.status !== "approved" ? (
                      <button
                        type="button"
                        className="button button--primary button--small"
                        disabled={busy}
                        onClick={() => mutateComment(comment.id, "PATCH", { status: "approved" })}
                      >
                        Aprobar
                      </button>
                    ) : null}
                    {comment.status !== "rejected" ? (
                      <button
                        type="button"
                        className="button button--secondary button--small"
                        disabled={busy}
                        onClick={() => mutateComment(comment.id, "PATCH", { status: "rejected" })}
                      >
                        Rechazar
                      </button>
                    ) : null}
                    {comment.status !== "spam" ? (
                      <button
                        type="button"
                        className="button button--ghost button--small"
                        disabled={busy}
                        onClick={() => mutateComment(comment.id, "PATCH", { status: "spam" })}
                      >
                        Spam
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      disabled={busy}
                      title="Eliminar"
                      aria-label={`Eliminar comentario de ${comment.name}`}
                      onClick={() => {
                        if (window.confirm("¿Eliminar este comentario? Esta acción no se puede deshacer.")) {
                          void mutateComment(comment.id, "DELETE");
                        }
                      }}
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state empty-state--compact">
            <h3>{filter === "pending" ? "No hay comentarios por revisar" : "No hay comentarios en este filtro"}</h3>
            <p>{filter === "pending" ? "La cola de moderación está al día." : "Prueba con otro filtro."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
