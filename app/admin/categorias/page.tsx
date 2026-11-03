import { AdminCategoryManager } from "@/components/admin-category-manager";
import { requireAdminPage } from "@/lib/admin-guard";
import { getCategorias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  await requireAdminPage("/admin/categorias");
  const categories = await getCategorias();

  return <AdminCategoryManager items={categories} />;
}
