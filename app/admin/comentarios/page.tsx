import { AdminCommentManager } from "@/components/admin-comment-manager";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAllComments } from "@/lib/comment-store";

export const dynamic = "force-dynamic";

export default async function AdminComentariosPage() {
  await requireAdminPage("/admin/comentarios");
  const comments = await getAllComments();

  return <AdminCommentManager items={comments} />;
}
