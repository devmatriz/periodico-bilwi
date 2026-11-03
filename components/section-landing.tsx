import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { StoryImage, StoryLabel, StoryRow, Tile, storyLang } from "@/components/story";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import { localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";
import { localizeSections, localizeStories } from "@/lib/localize";
import { storiesForSection } from "@/lib/sections";

async function getSection(slug: string) {
  const [{ locale, t }, settings] = await Promise.all([getI18n(), getCategorias()]);
  const sections = localizeSections(locale, settings);
  return { locale, t, sections, section: sections.find((item) => item.slug === slug) ?? null };
}

/** Metadatos de una página de sección, en el idioma de la página. */
export async function sectionMetadata(slug: string): Promise<Metadata> {
  const { locale, section } = await getSection(slug);
  return {
    title: section?.label,
    description: section?.description,
    alternates: localizedAlternates(locale, `/${slug}`),
  };
}

export async function SectionLanding({ slug }: { slug: string }) {
  const { locale, t, sections, section } = await getSection(slug);

  if (!section || !section.active) {
    notFound();
  }

  const stories = storiesForSection(localizeStories(await getPublicNoticias(), locale), slug) as ReturnType<typeof localizeStories>;
  const [lead, ...rest] = stories;
  const others = sections.filter((item) => item.slug !== slug);

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
            <span>{t.section.published(stories.length)}</span>
          </p>
        </div>
      </section>

      <div className="wrap page">
        {lead ? (
          <>
            <article className="section-lead">
              <Link className="section-lead-media" href={lead.href} tabIndex={-1} aria-hidden="true">
                <StoryImage story={lead} priority sizes="(min-width: 900px) 640px, 100vw" />
              </Link>
              <div className="section-lead-body">
                <Tile index={0} size="lg" />
                <h2 className="section-lead-headline" lang={storyLang(lead)}>
                  <Link href={lead.href}>{lead.title}</Link>
                </h2>
                {lead.excerpt ? (
                  <p className="story-excerpt" lang={storyLang(lead)}>
                    {lead.excerpt}
                  </p>
                ) : null}
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
            <h2>{t.section.emptyTitle(section.label)}</h2>
            <p>{t.section.emptyText}</p>
            <Link className="button button--secondary" href={localePath(locale, "/noticias")}>
              {t.section.emptyButton}
            </Link>
          </div>
        )}

        <nav className="other-sections" aria-label={t.section.others}>
          <h2 className="rail-title">{t.section.others}</h2>
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
