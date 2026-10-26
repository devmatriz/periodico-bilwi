import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { StoryImage, StoryLabel, StoryRow, Tile } from "@/components/story";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import { displayCategory, publicSections, storiesForSection } from "@/lib/sections";

export async function getSectionMeta(slug: string) {
  const section = publicSections.find((item) => item.slug === slug);
  if (!section) return null;

  const settings = (await getCategorias()).find((item) => item.slug === slug);
  return {
    ...section,
    label: displayCategory(settings?.label ?? section.label),
    title: settings?.title ?? section.title,
    description: settings?.description ?? section.description,
    active: settings?.active ?? true,
  };
}

export async function SectionLanding({ slug }: { slug: string }) {
  const section = await getSectionMeta(slug);

  if (!section || !section.active) {
    notFound();
  }

  const stories = storiesForSection(await getPublicNoticias(), slug);
  const [lead, ...rest] = stories;
  const others = publicSections.filter((item) => item.slug !== slug);

  return (
    <PublicShell compact>
      <section className="section-board" aria-labelledby="section-title">
        <div className="wrap section-board-inner">
          <div>
            <h1 id="section-title" className="section-board-name">
              {section.label}
            </h1>
            <p className="section-board-title">{section.title}</p>
            <p className="section-board-desc">{section.description}</p>
          </div>
          <p className="section-board-count">
            <span className="tile tile--md">{String(stories.length).padStart(2, "0")}</span>
            <span>{stories.length === 1 ? "nota publicada" : "notas publicadas"}</span>
          </p>
        </div>
      </section>

      <div className="wrap page">
        {lead ? (
          <>
            <article className="section-lead">
              <Link className="section-lead-media" href={`/noticias/${lead.slug}`} tabIndex={-1} aria-hidden="true">
                <StoryImage story={lead} priority sizes="(min-width: 900px) 640px, 100vw" />
              </Link>
              <div className="section-lead-body">
                <Tile index={0} size="lg" />
                <h2 className="section-lead-headline">
                  <Link href={`/noticias/${lead.slug}`}>{lead.title}</Link>
                </h2>
                {lead.excerpt ? <p className="story-excerpt">{lead.excerpt}</p> : null}
                <StoryLabel story={lead} author />
              </div>
            </article>

            {rest.length > 0 ? (
              <div className="results results--grid">
                {rest.map((story) => (
                  <StoryRow key={story.slug} story={story} stacked />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <h2>Aún no hay notas en {section.label}</h2>
            <p>Cuando la redacción publique en esta sección, aparecerán aquí. Mientras tanto, revisa lo último de Bilwi.</p>
            <Link className="button button--secondary" href="/noticias">
              Ver todas las noticias
            </Link>
          </div>
        )}

        <nav className="other-sections" aria-label="Otras secciones">
          <h2 className="rail-title">Otras secciones</h2>
          <ul>
            {others.map((item) => (
              <li key={item.slug}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PublicShell>
  );
}
