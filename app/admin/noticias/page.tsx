import { getNoticias } from "@/lib/content-store";
import { requireAdminPage } from "@/lib/admin-guard";
import { AdminNewsTable } from "@/components/admin-news-table";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ estado?: string }>;
};

export default async function AdminNoticiasPage({ searchParams }: Props) {
  await requireAdminPage("/admin/noticias");
  const { estado } = await searchParams;
  const posts = await getNoticias();

  return (
    <div className="admin-stack">
      <p className="admin-intro">
        {posts.length} {posts.length === 1 ? "noticia registrada" : "noticias registradas"}. Filtra por estado, busca y edita
        desde la tabla.
      </p>
      <AdminNewsTable key={estado ?? "all"} items={posts} initialFilter={estado} />
    </div>
  );
}
