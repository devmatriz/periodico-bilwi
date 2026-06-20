"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  callbackUrl: string;
};

export function AdminLoginForm({ callbackUrl }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bilwi.ni");
  const [password, setPassword] = useState("Bilwi2026!");
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
      setError("Credenciales incorrectas. Revisa el usuario y la contraseña.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form className="stack-form" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
      <label>
        Correo electronico
        <input
          type="email"
          placeholder="admin@bilwi.ni"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <div className="form-actions">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" />
          Recordarme
        </label>
        <span className="article-meta">Cuenta de prueba: admin@bilwi.ni / Bilwi2026!</span>
      </div>
      {error ? <p className="article-meta" style={{ color: "#d00" }}>{error}</p> : null}
      <button className="button button-primary" type="submit" style={{ minHeight: 52 }} disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar Sesion"}
      </button>
    </form>
  );
}
