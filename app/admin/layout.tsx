import { AdminShell } from "@/components/admin-shell";
import { getPanelUser } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getPanelUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <AdminShell userName={user.name} userEmail={user.email} isAdmin={user.isAdmin}>
      {children}
    </AdminShell>
  );
}
