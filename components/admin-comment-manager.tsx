"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
      { label: "Total", value: comments.length.toString() },
      { label: "Pendientes", value: pending.toString() },
      { label: "Aprobados", value: approved.toString() },
      { label: "Rechazados", value: `${rejected} / Spam ${spam}` },
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
    <div className="admin-comment-board">
      <div className="admin-comment-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-summary-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-news-board-top">
        <div>
          <span className="eyebrow">Moderacion</span>
          <h3>{filtered.length} comentarios visibles</h3>
        </div>
        <div className="admin-news-board-chips">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`admin-board-chip${filter === item ? " admin-board-chip--accent" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "Todos" : statusLabels[item]}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="admin-inline-error">{error}</div> : null}

      <div className="admin-comment-list">
        {filtered.length > 0 ? (
          filtered.map((comment) => (
            <article key={comment.id} className={`admin-comment-item admin-comment-item--${statusTones[comment.status]}`}>
              <div className="admin-comment-item-top">
                <div className="admin-comment-avatar avatar">{comment.name.slice(0, 1)}</div>
                <div className="admin-comment-main">
                  <div className="admin-comment-meta">
                    <strong>{comment.name}</strong>
                    <span>{displayTime(comment.createdAt)}</span>
                  </div>
                  <p className="article-meta">{comment.articleTitle}</p>
                  <p>{comment.message}</p>
                </div>
                <span className={`admin-status-pill admin-status-pill--${statusTones[comment.status]}`}>{statusLabels[comment.status]}</span>
              </div>

              <div className="admin-comment-foot">
                <div className="admin-comment-source">
                  <span>{comment.slug}</span>
                  {comment.email ? <span>{comment.email}</span> : null}
                </div>
                <div className="admin-news-actions">
                  <button
                    type="button"
                    className="admin-news-action"
                    disabled={busyId === comment.id}
                    onClick={() => mutateComment(comment.id, "PATCH", { status: "approved" })}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="admin-news-action"
                    disabled={busyId === comment.id}
                    onClick={() => mutateComment(comment.id, "PATCH", { status: "rejected" })}
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    className="admin-news-action"
                    disabled={busyId === comment.id}
                    onClick={() => mutateComment(comment.id, "PATCH", { status: "spam" })}
                  >
                    Spam
                  </button>
                  <button
                    type="button"
                    className="admin-news-action admin-news-action--danger"
                    disabled={busyId === comment.id}
                    onClick={() => mutateComment(comment.id, "DELETE")}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="editor-note">
            <p>No hay comentarios en este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
