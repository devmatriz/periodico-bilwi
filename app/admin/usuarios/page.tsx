import { AdminUserManager } from "@/components/admin-user-manager";
import { getEditorialUsers } from "@/lib/editorial-admin-store";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const users = await getEditorialUsers();

  return <AdminUserManager items={users} />;
}
