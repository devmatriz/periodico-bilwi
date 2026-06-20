import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { AdminLoginForm } from "@/components/admin-login-form";
import { auth } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const params = (await searchParams) || {};
  const callbackUrl = params.callbackUrl || "/admin";

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <PublicShell compact>
      <section className="content-page">
        <div className="split-hero">
          <div
            className="split-hero__visual split-hero__visual--content editor-card--hero"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.48)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80")',
            }}
          >
            <div className="split-hero__panel-content">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Voz de la Costa Caribe
              </span>
              <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)", marginTop: 12 }}>
                Accede al panel editorial con tu cuenta de administrador.
              </h1>
            </div>
          </div>

          <div className="editor-card editor-card--soft" style={{ alignContent: "center" }}>
            <Link className="nav-link" href="/">
              Volver al inicio
            </Link>
            <h1 style={{ marginTop: 18 }}>Bienvenido de nuevo</h1>
            <p className="muted">
              Inicia sesion para crear noticias, editar contenidos y administrar el periodico.
            </p>

            <AdminLoginForm callbackUrl={callbackUrl} />

            <div style={{ textAlign: "center", margin: "26px 0 12px", color: "var(--text-muted)" }}>
              Acceso rapido
            </div>
            <div className="editor-note">
              <p className="article-meta" style={{ margin: 0 }}>
                Usuario de prueba: <strong>admin@bilwi.ni</strong>
              </p>
              <p className="article-meta" style={{ margin: "6px 0 0" }}>
                Contraseña de prueba: <strong>Bilwi2026!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
