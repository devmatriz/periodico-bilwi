"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  articleTitle: string;
};

export function CommentForm({ slug, articleTitle }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          articleTitle,
          name,
          email,
          message,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo enviar el comentario.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setNotice(data?.message || "Comentario enviado correctamente.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar el comentario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-form-grid">
        <label className="admin-field">
          <span>Nombre</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        <label className="admin-field">
          <span>Correo electronico</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
          />
        </label>
      </div>

      <label className="admin-field">
        <span>Comentario</span>
        <textarea
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escribe tu opinion..."
        />
      </label>

      <div className="comment-form-foot">
        <p className="article-meta">Tu comentario pasará por moderación antes de publicarse.</p>
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Publicar comentario"}
        </button>
      </div>

      {notice ? <p className="comment-form-note comment-form-note--success">{notice}</p> : null}
      {error ? <p className="comment-form-note comment-form-note--error">{error}</p> : null}
    </form>
  );
}
