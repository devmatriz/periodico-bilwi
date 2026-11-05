"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  callbackUrl: string;
};

export function AdminLoginForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit} aria-busy={loading}>
      <div className="field">
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          aria-invalid={error ? true : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <label className="check">
        <input type="checkbox" />
        <span>Recordarme en este equipo</span>
      </label>
      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button button--primary button--block" type="submit" disabled={loading}>
        {loading ? "Entrando…" : "Entrar al panel"}
      </button>
    </form>
  );
}
