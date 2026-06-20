import Link from "next/link";
import { getCategorias, getNoticias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", {
    timeZone: "America/Managua",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPercent(value: number, total: number) {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export default async function AdminHomePage() {
  const posts = await getNoticias();
  const categories = await getCategorias();
  const published = posts.filter((post) => post.status === "published");
  const drafts = posts.filter((post) => post.status === "draft");
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const featured = posts.filter((post) => post.featured);

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Managua",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const updatedToday = posts.filter((post) => {
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Managua",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(post.updatedAt));

    return key === todayKey;
  });

  const latestPosts = posts.slice(0, 5);
  const topCategories = [...categories]
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);
  const totalPosts = posts.length;
  const heroMetrics = [
    { label: "Publicadas", value: published.length },
    { label: "Borradores", value: drafts.length },
    { label: "Destacadas", value: featured.length },
    { label: "Secciones", value: categories.length },
  ];

  const stats = [
    {
      label: "Noticias publicadas",
      value: published.length.toString(),
      trend: `${formatPercent(published.length, totalPosts)} del total`,
    },
    {
      label: "Borradores",
      value: drafts.length.toString(),
      trend: `${formatPercent(drafts.length, totalPosts)} en cola`,
    },
    {
      label: "Destacadas",
      value: featured.length.toString(),
      trend: "Portadas visibles",
    },
    {
      label: "Actualizadas hoy",
      value: updatedToday.length.toString(),
      trend: "Actividad reciente",
    },
  ];

  return (
    <div className="admin-grid">
      <section className="admin-hero">
        <div className="admin-hero-copy">
          <span className="eyebrow" style={{ color: "#fff" }}>
            Centro editorial
          </span>
          <h1>Dashboard de administracion</h1>
          <p>
            Monitorea la redaccion, publica noticias y revisa la cobertura del periodico con una vista
            clara, moderna y centrada en la edicion diaria.
          </p>
          <div className="admin-hero-actions">
            <Link className="button button-primary" href="/admin/noticias/nueva">
              Nueva noticia
            </Link>
            <Link className="button button-secondary" href="/noticias">
              Ver sitio publico
            </Link>
          </div>
        </div>

        <div className="admin-hero-panel">
          <div className="admin-hero-panel-top">
            <span>Estado editorial</span>
            <strong>Activo</strong>
          </div>

          <div className="admin-hero-metrics">
            {heroMetrics.map((item) => (
              <div key={item.label} className="admin-mini-metric">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="admin-hero-note">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.82)" }}>
              Ultima actividad
            </span>
            <p>Actualizado hoy con contenidos listos para publicar y seguimiento de portada.</p>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((metric) => (
          <article key={metric.label} className="stat-card">
            <span className="eyebrow">{metric.trend}</span>
            <h2 style={{ margin: "18px 0 10px" }}>{metric.label}</h2>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel-card chart-card">
          <div className="section-title">
            <div>
              <h2>Cobertura editorial</h2>
              <p className="muted">Distribucion real por seccion dentro del periodico</p>
            </div>
            <Link className="button button-secondary" href="/admin/noticias">
              Ver noticias
            </Link>
          </div>

          <div className="category-progress">
            {topCategories.map((item) => (
              <div key={item.label} className="progress-row">
                <span>
                  <strong>{item.label}</strong>
                  <strong>{item.count}</strong>
                </span>
                <div className="progress-track">
                  <div
                    className="progress-fill blue"
                    style={{ width: `${Math.max(8, (item.count / Math.max(totalPosts, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-title">
            <div>
              <h2>Estado del flujo</h2>
            </div>
          </div>

          <div className="category-progress">
            <div className="progress-row">
              <span>
                <strong>Publicadas</strong>
                <strong>{published.length}</strong>
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill blue"
                  style={{ width: `${Math.max(8, (published.length / Math.max(totalPosts, 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="progress-row">
              <span>
                <strong>Borradores</strong>
                <strong>{drafts.length}</strong>
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill gold"
                  style={{ width: `${Math.max(8, (drafts.length / Math.max(totalPosts, 1)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="progress-row">
              <span>
                <strong>Programadas</strong>
                <strong>{scheduled.length}</strong>
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill gray"
                  style={{ width: `${Math.max(8, (scheduled.length / Math.max(totalPosts, 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <p className="article-meta" style={{ marginTop: 22 }}>
            {totalPosts} total de noticias registradas en el sistema.
          </p>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <h2>Ultimas noticias</h2>
            <p className="muted">Actividad reciente extraida de los contenidos guardados</p>
          </div>
          <div className="nav-actions">
            <Link className="button button-secondary" href="/admin/noticias/nueva">
              Nueva noticia
            </Link>
            <Link className="button button-primary" href="/noticias">
              Ver publico
            </Link>
          </div>
        </div>

        <div className="admin-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {latestPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <div className="article-meta">
                      <Link href={`/noticias/${post.slug}`}>Abrir noticia</Link>
                    </div>
                  </td>
                  <td>{post.category}</td>
                  <td>{post.status === "published" ? "Publicado" : post.status === "draft" ? "Borrador" : post.status === "scheduled" ? "Programado" : "Archivado"}</td>
                  <td>{formatAdminDate(post.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-title">
          <div>
            <h2>Actividad reciente</h2>
            <p className="muted">Resumen rapido para tomar decisiones editoriales</p>
          </div>
        </div>

        <div className="news-grid">
          <article className="news-card">
            <div className="news-card-body">
              <span className="eyebrow">Ultima actualizacion</span>
              <h3>{latestPosts[0]?.title || "Sin noticias recientes"}</h3>
              <p>{latestPosts[0]?.excerpt || "Publica una noticia para verla aqui."}</p>
              <p className="article-meta">
                {latestPosts[0] ? formatAdminDate(latestPosts[0].updatedAt) : "Sin fecha"}
              </p>
            </div>
          </article>

          <article className="news-card">
            <div className="news-card-body">
              <span className="eyebrow">Seccion dominante</span>
              <h3>{topCategories[0]?.label || "Sin datos"}</h3>
              <p>
                {topCategories[0]
                  ? `${topCategories[0].count} notas en la seccion principal`
                  : "Todavia no hay datos suficientes para calcular secciones."}
              </p>
              <p className="article-meta">
                {topCategories[0] ? `${topCategories[0].count} entradas` : "0 entradas"}
              </p>
            </div>
          </article>

          <article className="news-card">
            <div className="news-card-body">
              <span className="eyebrow">Destacadas</span>
              <h3>{featured.length}</h3>
              <p>Articulos marcados para portada o cobertura principal.</p>
              <p className="article-meta">
                {featured.length > 0 ? "Listas para promoción" : "Sin destacadas activas"}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
