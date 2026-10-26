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
        throw new Error(data?.message || "No se pudo enviar el comentario. Revisa tu conexión e inténtalo de nuevo.");
      }

      setName("");
      setEmail("");
      setMessage("");
      setNotice(data?.message || "Gracias. Tu comentario se publicará cuando la redacción lo revise.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar el comentario. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit} aria-busy={loading}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="comment-name">Nombre</label>
          <input
            id="comment-name"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="comment-email">
            Correo electrónico <span className="field-optional">opcional, no se publica</span>
          </label>
          <input
            id="comment-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="comment-message">Comentario</label>
        <textarea
          id="comment-message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <div className="form-foot">
        <p className="form-hint">La redacción revisa cada comentario antes de publicarlo.</p>
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? "Enviando…" : "Enviar comentario"}
        </button>
      </div>

      <div aria-live="polite">
        {notice ? <p className="notice notice--success">{notice}</p> : null}
        {error ? <p className="notice notice--error" role="alert">{error}</p> : null}
      </div>
    </form>
  );
}
