import { AdminUserManager } from "@/components/admin-user-manager";
import { requireAdminPage } from "@/lib/admin-guard";
import { getEditorialUsers } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const me = await requireAdminPage("/admin/usuarios");
  const users = await getEditorialUsers();

  return <AdminUserManager items={users} currentEmail={me.email} />;
}
