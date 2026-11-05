"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_LENGTH = 12;

export function AdminPasswordForm({ pending }: { pending: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDone(false);

    if (newPassword.length < MIN_LENGTH) {
      setError(`La contraseña nueva debe tener al menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/cuenta/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || "No se pudo cambiar la contraseña.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setDone(true);
      if (pending) {
        router.push("/admin");
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cambiar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit} aria-busy={busy}>
      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="notice notice--success" role="status">
          Contraseña actualizada.
        </p>
      ) : null}

      <div className="field">
        <label htmlFor="password-current">{pending ? "Contraseña temporal" : "Contraseña actual"}</label>
        <input
          id="password-current"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password-new">Contraseña nueva</label>
        <input
          id="password-new"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          aria-describedby="password-new-hint"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <p className="form-hint" id="password-new-hint">
          Al menos {MIN_LENGTH} caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar.
        </p>
      </div>
      <div className="field">
        <label htmlFor="password-confirm">Repite la contraseña nueva</label>
        <input
          id="password-confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <div>
        <button className="button button--primary" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar contraseña"}
        </button>
      </div>
    </form>
  );
}
