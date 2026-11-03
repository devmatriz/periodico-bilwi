import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { AdminLoginForm } from "@/components/admin-login-form";
import { auth } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acceso de la redacción",
  robots: { index: false },
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const params = (await searchParams) || {};
  const callbackUrl = params.callbackUrl || "/admin";

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <AuthLayout
      boardTitle="Panel de la redacción"
      boardText="Publica, edita y modera la cobertura diaria de Bilwi Noticias."
    >
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-lede">Usa tu cuenta de administrador para entrar al panel editorial.</p>

      <AdminLoginForm callbackUrl={callbackUrl} />

      <div className="demo-note">
        <p>
          Cuenta de prueba: <strong>admin@bilwi.ni</strong> · <strong>Bilwi2026!</strong>
        </p>
      </div>
    </AuthLayout>
  );
}
