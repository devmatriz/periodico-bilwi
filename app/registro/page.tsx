import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false },
};

export default function RegistroPage() {
  return (
    <AuthLayout
      boardTitle="Comunidad de lectores"
      boardText="Crea tu cuenta para colaborar, comentar y participar."
    >
      <h1 className="auth-title">Crear cuenta</h1>
      <p className="auth-lede">El registro de lectores todavía no está habilitado. Mientras tanto puedes comentar las noticias sin cuenta.</p>

      <form className="stack-form" aria-describedby="registro-estado">
        <fieldset disabled className="stack-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="reg-nombre">Nombre</label>
              <input id="reg-nombre" type="text" autoComplete="given-name" />
            </div>
            <div className="field">
              <label htmlFor="reg-apellido">Apellido</label>
              <input id="reg-apellido" type="text" autoComplete="family-name" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input id="reg-email" type="email" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Contraseña</label>
            <input id="reg-password" type="password" autoComplete="new-password" />
          </div>
          <button className="button button--primary button--block" type="button">
            Registrarme
          </button>
        </fieldset>
        <p id="registro-estado" className="form-hint">
          ¿Eres parte de la redacción? <Link href="/login">Inicia sesión aquí</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
