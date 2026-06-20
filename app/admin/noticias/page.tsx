import Link from "next/link";
import { getNoticias } from "@/lib/content-store";
import { AdminNewsTable } from "@/components/admin-news-table";

export const dynamic = "force-dynamic";

export default async function AdminNoticiasPage() {
  const posts = await getNoticias();
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;

  return (
    <div className="admin-grid">
      <section className="admin-news-hero panel-card">
        <div className="section-title">
          <div>
            <span className="eyebrow">Panel editorial</span>
            <h2>Gestion de noticias</h2>
            <p className="muted">
              Lista interna para crear, editar, publicar o archivar articulos con una vista más limpia.
            </p>
          </div>
          <Link className="button button-primary" href="/admin/noticias/nueva">
            Crear noticia
          </Link>
        </div>

        <div className="admin-news-summary">
          <div className="admin-summary-card">
            <span>Publicadas</span>
            <strong>{published}</strong>
          </div>
          <div className="admin-summary-card">
            <span>Borradores</span>
            <strong>{drafts}</strong>
          </div>
          <div className="admin-summary-card">
            <span>Programadas</span>
            <strong>{scheduled}</strong>
          </div>
        </div>

        <AdminNewsTable items={posts} />
      </section>
    </div>
  );
}
