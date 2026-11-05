import { AdminCommentManager } from "@/components/admin-comment-manager";
import { requireStaffPage } from "@/lib/admin-guard";
import { getAllComments } from "@/lib/comment-store";

export const dynamic = "force-dynamic";

export default async function AdminComentariosPage() {
  await requireStaffPage("/admin/comentarios");
  const comments = await getAllComments();

  return <AdminCommentManager items={comments} />;
}
