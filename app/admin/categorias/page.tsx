import { AdminCategoryManager } from "@/components/admin-category-manager";
import { getCategorias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const categories = await getCategorias();

  return <AdminCategoryManager items={categories} />;
}
