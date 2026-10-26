import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryImage, StoryLabel, StoryRow, Tile } from "@/components/story";
import { IconArrowRight } from "@/components/icons";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import type { NewsItem } from "@/lib/content-store";
import { displayCategory, publicSections, storiesForSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

function uniqueBySlug(items: NewsItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export default async function HomePage() {
  const [stories, settings] = await Promise.all([getPublicNoticias(), getCategorias()]);
  // Misma regla que getFeaturedNoticias, sin volver a leer el almacén.
  const marked = stories.filter((story) => story.featured);
  const featured = (marked.length > 0 ? marked : stories).slice(0, 3);

  // El orden del día: primero las destacadas, luego lo más reciente.
  const board = uniqueBySlug([...featured, ...stories]).slice(0, 5);
  const [lead, ...rest] = board;
  const boardSlugs = new Set(board.map((story) => story.slug));
  const latest = stories.filter((story) => !boardSlugs.has(story.slug)).slice(0, 8);

  const settingsBySlug = new Map(settings.map((item) => [item.slug, item]));
  const sections = publicSections
    .filter((section) => settingsBySlug.get(section.slug)?.active ?? true)
    .map((section) => ({
      ...section,
      label: displayCategory(settingsBySlug.get(section.slug)?.label ?? section.label),
      stories: storiesForSection(stories, section.slug),
    }));
  const filledSections = sections.filter((section) => section.stories.length > 0);

  const now = new Date();
  const day = new Intl.DateTimeFormat("es-NI", { timeZone: "America/Managua", day: "2-digit" }).format(now);
  const month = new Intl.DateTimeFormat("es-NI", { timeZone: "America/Managua", month: "short" })
    .format(now)
    .replace(".", "");

  return (
    <PublicShell>
      <section className="board" aria-labelledby="orden-del-dia">
        <div className="wrap">
          <div className="board-head">
            <h2 id="orden-del-dia" className="board-title">Orden del día</h2>
            <p className="board-date" aria-hidden="true">
              <span className="tile tile--sm">{day}</span>
              <span className="tile tile--sm tile--word">{month}</span>
            </p>
          </div>

          {lead ? (
            <div className="board-grid">
              <article className="board-lead" style={{ "--slot": 0 } as React.CSSProperties}>
                <Link className="board-lead-media" href={`/noticias/${lead.slug}`} tabIndex={-1} aria-hidden="true">
                  <StoryImage story={lead} priority sizes="(min-width: 1100px) 680px, 100vw" />
                </Link>
                <div className="board-lead-body">
                  <Tile index={0} size="lg" />
                  <div>
                    <h3 className="board-lead-headline">
                      <Link href={`/noticias/${lead.slug}`}>{lead.title}</Link>
                    </h3>
                    {lead.excerpt ? <p className="board-lead-excerpt">{lead.excerpt}</p> : null}
                    <StoryLabel story={lead} author />
                  </div>
                </div>
              </article>

              {rest.length > 0 ? (
                <ol className="board-list">
                  {rest.map((story, index) => (
                    <li key={story.slug} className="board-item" style={{ "--slot": index + 1 } as React.CSSProperties}>
                      <Tile index={index + 1} />
                      <div>
                        <h3 className="board-item-headline">
                          <Link href={`/noticias/${story.slug}`}>{story.title}</Link>
                        </h3>
                        {story.excerpt ? <p className="board-item-excerpt">{story.excerpt}</p> : null}
                        <StoryLabel story={story} />
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : (
            <div className="board-empty">
              <p>Todavía no hay noticias publicadas. La portada se llena sola cuando la redacción publica desde el panel.</p>
            </div>
          )}
        </div>
      </section>

      <nav className="section-index" aria-label="Índice de secciones">
        <div className="wrap">
          <ul>
            {sections.map((section) => (
              <li key={section.slug} className={section.stories.length === 0 ? "is-empty" : undefined}>
                <Link href={section.href}>
                  <span className="section-index-name">{section.label}</span>
                  <span className="section-index-count">
                    {section.stories.length === 0
                      ? "Sin notas aún"
                      : `${section.stories.length} ${section.stories.length === 1 ? "nota" : "notas"}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="wrap front-body">
        <div className="front-sections">
          {filledSections.map((section) => {
            const [first, ...others] = section.stories;
            return (
              <section key={section.slug} className="front-section" aria-labelledby={`sec-${section.slug}`}>
                <header className="front-section-head">
                  <h2 id={`sec-${section.slug}`}>
                    <Link href={section.href}>{section.label}</Link>
                  </h2>
                  <Link className="text-link" href={section.href}>
                    Ver sección <IconArrowRight size={16} />
                  </Link>
                </header>
                <div className={`front-section-grid${others.length === 0 ? " front-section-grid--single" : ""}`}>
                  <StoryRow story={first} stacked />
                  {others.length > 0 ? (
                    <div className="front-section-more">
                      {others.slice(0, 3).map((story) => (
                        <StoryRow key={story.slug} story={story} excerpt={false} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="front-aside" aria-label="Complementos">
          {latest.length > 0 ? (
            <section className="latest" aria-labelledby="lo-ultimo">
              <h2 id="lo-ultimo" className="rail-title">Lo último</h2>
              <ol className="latest-list">
                {latest.map((story) => (
                  <li key={story.slug}>
                    <h3>
                      <Link href={`/noticias/${story.slug}`}>{story.title}</Link>
                    </h3>
                    <StoryLabel story={story} />
                  </li>
                ))}
              </ol>
              <Link className="text-link" href="/noticias">
                Todas las noticias <IconArrowRight size={16} />
              </Link>
            </section>
          ) : null}

          <section className="tip-box" aria-labelledby="envia-noticia">
            <h2 id="envia-noticia">¿Pasó algo en tu barrio?</h2>
            <p>Cuéntaselo a la redacción. Las noticias de Bilwi empiezan con alguien que avisa.</p>
            <Link className="button button--primary" href="/contacto">
              Enviar una noticia
            </Link>
          </section>
        </aside>
      </div>
    </PublicShell>
  );
}
