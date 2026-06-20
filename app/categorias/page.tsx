import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getCategorias } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categories = await getCategorias();
  const visibleCategories = categories.filter((category) => category.active);
  const totalStories = visibleCategories.reduce((sum, category) => sum + category.count, 0);

  return (
    <PublicShell compact>
      <section className="content-page categories-page">
        <div className="categories-hero">
          <div className="categories-intro">
            <span className="eyebrow">Categorias</span>
            <h1>Secciones del periodico</h1>
            <p className="muted">
              Una estructura editorial más clara para navegar noticias locales, cultura, sociedad y opinion.
            </p>
            <div className="pill-row categories-pills">
              <span className="pill">Lectura rapida</span>
              <span className="pill">Diseño editorial</span>
              <span className="pill">Cobertura local</span>
            </div>
          </div>

          <aside className="categories-summary">
            <span className="eyebrow">Lectura rapida</span>
            <h2>Una portada pensada para orientar al lector</h2>
            <p>
              La jerarquia visual ayuda a separar lo urgente, lo comunitario y lo analitico sin perder continuidad.
            </p>

            <div className="categories-metrics">
              <div className="category-metric">
                <span>Secciones</span>
              <strong>{visibleCategories.length}</strong>
              </div>
              <div className="category-metric">
                <span>Notas publicadas</span>
                <strong>{totalStories}</strong>
              </div>
              <div className="category-metric">
                <span>Cobertura</span>
                <strong>Bilwi</strong>
              </div>
            </div>
          </aside>
        </div>

        <div className="category-grid">
          {visibleCategories.map((category, index) => (
            <Link
              href={category.href}
              key={category.href}
              className={`category-card${index === 0 ? " category-card--featured" : ""}`}
              style={{
                backgroundImage: `${category.background}, url(${category.image})`,
                backgroundBlendMode: "overlay",
              }}
            >
              <div className="category-card-content">
                <div className="category-card-top">
                  <span className="eyebrow">{category.label}</span>
                  <span className="category-badge">{category.badge}</span>
                </div>

                <h2>{category.title}</h2>
                <p>{category.description}</p>

                <div className="category-note">
                  {category.chips.map((chip) => (
                    <span key={chip} className="category-chip">
                      {chip}
                    </span>
                  ))}
                  <span className="category-chip">{category.count} notas</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="categories-foot">
          <div>
            <span className="eyebrow">Cobertura editorial</span>
            <strong>Diseño preparado para crecer con nuevas secciones.</strong>
          </div>
          <p className="muted">
            Luego podremos sumar deportes, economia o ultimo minuto sin romper la jerarquia visual.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
