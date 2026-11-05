import Link from "next/link";
import { requireStaffPage } from "@/lib/admin-guard";
import { StatusPill } from "@/components/admin-status";
import { IconArrowRight } from "@/components/icons";
import { getCommentStats } from "@/lib/comment-store";
import { getNoticias } from "@/lib/content-store";
import { displayCategory, publicSections, storiesForSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Managua",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function AdminHomePage() {
  await requireStaffPage("/admin");
  const [posts, commentStats] = await Promise.all([getNoticias(), getCommentStats()]);
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const featured = published.filter((post) => post.featured);
  const todayKey = dayKey(new Date());
  const updatedToday = posts.filter((post) => dayKey(post.updatedAt) === todayKey);

  const latestPosts = posts.slice(0, 6);
  const coverage = publicSections
    .map((section) => ({ ...section, count: storiesForSection(published, section.slug).length }))
    .sort((left, right) => right.count - left.count);
  const maxCoverage = Math.max(1, ...coverage.map((item) => item.count));

  const counts = [
    { label: "Publicadas", value: published.length, href: "/admin/noticias?estado=published" },
    { label: "Borradores", value: drafts.length, href: "/admin/noticias?estado=draft" },
    { label: "Programadas", value: scheduled.length, href: "/admin/noticias?estado=scheduled" },
    { label: "En portada", value: featured.length, href: "/admin/noticias?estado=featured" },
    { label: "Comentarios por revisar", value: commentStats.pending, href: "/admin/comentarios" },
  ];

  return (
    <div className="admin-stack">
      <section className="admin-board" aria-label="Estado de la redacción">
        <ul>
          {counts.map((item) => (
            <li key={item.label}>
              <Link href={item.href}>
                <span className="tile tile--md">{String(item.value).padStart(2, "0")}</span>
                <span className="admin-board-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="admin-board-note">
          {updatedToday.length === 0
            ? "Hoy todavía no se ha actualizado ninguna noticia."
            : `${updatedToday.length} ${updatedToday.length === 1 ? "noticia actualizada" : "noticias actualizadas"} hoy.`}
        </p>
      </section>

      <div className="admin-columns">
        <section className="panel" aria-labelledby="ultimas">
          <header className="panel-head">
            <h2 id="ultimas" className="panel-title">Últimos cambios</h2>
            <Link className="text-link" href="/admin/noticias">
              Todas las noticias <IconArrowRight size={16} />
            </Link>
          </header>
          {latestPosts.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Título</th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="col-date">Actualizada</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link className="table-title" href={`/admin/noticias/nueva?slug=${post.slug}`}>
                          {post.title}
                        </Link>
                        <span className="table-sub">{displayCategory(post.category)}</span>
                      </td>
                      <td>
                        <StatusPill status={post.status} />
                      </td>
                      <td className="col-date">{formatAdminDate(post.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <h3>Sin noticias todavía</h3>
              <p>Crea la primera noticia y aparecerá aquí.</p>
              <Link className="button button--primary" href="/admin/noticias/nueva">
                Nueva noticia
              </Link>
            </div>
          )}
        </section>

        <section className="panel" aria-labelledby="cobertura">
          <header className="panel-head">
            <h2 id="cobertura" className="panel-title">Cobertura publicada</h2>
          </header>
          <ul className="coverage">
            {coverage.map((item) => (
              <li key={item.slug}>
                <span className="coverage-name">{item.label}</span>
                <span className="coverage-bar" aria-hidden="true">
                  <span style={{ width: `${(item.count / maxCoverage) * 100}%` }} />
                </span>
                <span className="coverage-count">{item.count}</span>
              </li>
            ))}
          </ul>
          <p className="panel-foot">
            {published.length} de {posts.length} noticias están publicadas.
          </p>
        </section>
      </div>
    </div>
  );
}
