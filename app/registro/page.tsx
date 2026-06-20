import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function RegistroPage() {
  return (
    <PublicShell compact>
      <section className="content-page">
        <div className="split-hero">
          <div
            className="split-hero__visual split-hero__visual--content editor-card--hero"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.52)), url("https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80")',
            }}
          >
            <div className="split-hero__panel-content">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Comunidad editorial
              </span>
              <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)", marginTop: 12 }}>
                Crea tu cuenta para colaborar, comentar y participar.
              </h1>
            </div>
          </div>

          <div className="editor-card editor-card--soft" style={{ alignContent: "center" }}>
            <Link className="nav-link" href="/">
              Volver al inicio
            </Link>
            <h1 style={{ marginTop: 18 }}>Crear cuenta</h1>
            <p className="muted">Registra tu informacion para acceder al portal.</p>

            <form className="stack-form" style={{ marginTop: 20 }}>
              <div className="form-grid">
                <label>
                  Nombre
                  <input type="text" placeholder="Tu nombre" />
                </label>
                <label>
                  Apellido
                  <input type="text" placeholder="Tu apellido" />
                </label>
              </div>
              <label>
                Correo electronico
                <input type="email" placeholder="nombre@ejemplo.com" />
              </label>
              <label>
                Contraseña
                <input type="password" placeholder="Crea una contraseña" />
              </label>
              <button className="button button-primary" type="button" style={{ minHeight: 52 }}>
                Registrarme
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
