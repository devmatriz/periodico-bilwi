import { AdminShell } from "@/components/admin-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <AdminShell userName={session.user?.name || "Administrador"} userEmail={session.user?.email || "admin@bilwi.ni"}>
      {children}
    </AdminShell>
  );
}
