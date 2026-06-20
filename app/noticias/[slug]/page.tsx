import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { PublicShell } from "@/components/public-shell";
import { getCommentsForSlug } from "@/lib/comment-store";
import { relatedStories } from "@/lib/site-data";
import { getNoticiaBySlug } from "@/lib/content-store";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function NoticiaDetallePage({ params }: Props) {
  const { slug } = await params;
  const article = await getNoticiaBySlug(slug);
  const comments = await getCommentsForSlug(slug, { status: "approved" });

  if (!article) {
    notFound();
  }

  const paragraphs = article.content
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <PublicShell compact>
      <section className="article-page">
        <div className="article-layout">
          <article className="article-shell">
            <div
              className="article-hero"
              style={{
                backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.12)), url(${article.image})`,
              }}
            />

            <div className="article-content">
              <div className="article-meta-row">
                <span className="eyebrow">{article.category}</span>
                <span className="article-meta">Por {article.author}</span>
                <span className="article-meta">{article.time}</span>
                <span className="article-meta">{article.status === "published" ? "Publicado" : "Borrador"}</span>
              </div>

              <h1 className="article-title">{article.title}</h1>

              <div className="article-body">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${article.slug}-${index}`}>{paragraph}</p>
                ))}
              </div>

              <div className="share-row">
                <span className="article-meta">Compartir esta noticia:</span>
                <button className="share-btn" type="button">
                  Facebook
                </button>
                <button className="share-btn" type="button">
                  WhatsApp
                </button>
                <button className="share-btn" type="button">
                  X
                </button>
              </div>

              <section className="comment-box">
                <span className="eyebrow">Participacion</span>
                <h2>Comentarios ({comments.length})</h2>
                <p className="muted">Los aportes se revisan manualmente antes de publicarse.</p>

                <CommentForm slug={article.slug} articleTitle={article.title} />

                <div className="comment-list">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="avatar">{comment.name.slice(0, 1)}</div>
                        <div>
                          <strong>{comment.name}</strong>
                          <p className="article-meta">{new Intl.DateTimeFormat("es-NI", {
                            timeZone: "America/Managua",
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(comment.createdAt))}</p>
                          <p>{comment.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="editor-note">
                      <p>Aun no hay comentarios aprobados para esta noticia.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </article>

          <aside className="sidebar">
            <section className="sidebar-card">
              <h2>Noticias relacionadas</h2>
              <div className="sidebar-list">
                {relatedStories.map((story) => (
                  <article key={story.title}>
                    <p className="eyebrow">{story.category}</p>
                    <h3 className="sidebar-article-title">{story.title}</h3>
                    <p className="article-meta">{story.time}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="sidebar-card newsletter-card">
              <span className="eyebrow" style={{ color: "#fff" }}>
                Suscribete a nuestro boletin
              </span>
              <p className="muted" style={{ color: "rgba(255,255,255,.9)" }}>
                Recibe las noticias mas importantes de la Costa Caribe directamente en tu correo.
              </p>
              <label className="search-field" style={{ margin: "18px 0" }}>
                <input type="email" placeholder="Tu correo electronico" />
              </label>
              <button className="button" type="button">
                Suscribirme
              </button>
            </section>
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
