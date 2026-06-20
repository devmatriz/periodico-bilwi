import { AdminCommentManager } from "@/components/admin-comment-manager";
import { getAllComments, getCommentStats } from "@/lib/comment-store";

export const dynamic = "force-dynamic";

export default async function AdminComentariosPage() {
  const comments = await getAllComments();
  const stats = await getCommentStats();

  return (
    <div className="admin-grid">
      <section className="admin-hero">
        <div className="admin-hero-copy">
          <span className="eyebrow" style={{ color: "#fff" }}>
            Moderacion
          </span>
          <h1>Comentarios y comunidad</h1>
          <p>
            Revisa aportes de lectores, aprueba respuestas útiles y filtra contenido antes de que aparezca en la portada pública.
          </p>
          <div className="admin-hero-actions">
            <div className="admin-summary-card">
              <span>Total</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="admin-summary-card">
              <span>Pendientes</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>
        </div>

        <div className="admin-hero-panel">
          <div className="admin-hero-panel-top">
            <span>Estado de la comunidad</span>
            <strong>{stats.pending > 0 ? "Requiere revision" : "Al dia"}</strong>
          </div>

          <div className="admin-hero-metrics">
            <div className="admin-mini-metric">
              <span>Aprobados</span>
              <strong>{stats.approved}</strong>
            </div>
            <div className="admin-mini-metric">
              <span>Spam</span>
              <strong>{stats.spam}</strong>
            </div>
            <div className="admin-mini-metric">
              <span>Rechazados</span>
              <strong>{stats.rejected}</strong>
            </div>
            <div className="admin-mini-metric">
              <span>En cola</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="admin-hero-note">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.82)" }}>
              Flujo editorial
            </span>
            <p>Los comentarios se publican primero como pendientes y luego se aprueban manualmente.</p>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <h2>Moderacion de comentarios</h2>
            <p className="muted">Aprobacion, rechazo, marcaje como spam y eliminacion.</p>
          </div>
        </div>

        <AdminCommentManager items={comments} />
      </section>
    </div>
  );
}
