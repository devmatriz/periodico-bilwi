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
      <p className="auth-lede">Usa la cuenta que te dio la administración del periódico.</p>

      <AdminLoginForm callbackUrl={callbackUrl} />
    </AuthLayout>
  );
}
