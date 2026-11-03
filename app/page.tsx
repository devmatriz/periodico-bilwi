import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryImage, StoryLabel, StoryRow, Tile, storyLang } from "@/components/story";
import { IconArrowRight } from "@/components/icons";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import type { NewsItem } from "@/lib/content-store";
import { intlLocale, localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";
import { localizeSections, localizeStories } from "@/lib/localize";
import { storiesForSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  return { alternates: localizedAlternates(locale, "/") };
}

function uniqueBySlug(items: NewsItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export default async function HomePage() {
  const [{ locale, t }, published, settings] = await Promise.all([getI18n(), getPublicNoticias(), getCategorias()]);
  const stories = localizeStories(published, locale);
  // Misma regla que getFeaturedNoticias, sin volver a leer el almacén.
  const marked = stories.filter((story) => story.featured);
  const featured = (marked.length > 0 ? marked : stories).slice(0, 3);

  // El orden del día: primero las destacadas, luego lo más reciente.
  const board = uniqueBySlug([...featured, ...stories]) as typeof stories;
  const [lead, ...rest] = board.slice(0, 5);
  const boardSlugs = new Set(board.slice(0, 5).map((story) => story.slug));
  const latest = stories.filter((story) => !boardSlugs.has(story.slug)).slice(0, 8);

  const sections = localizeSections(locale, settings)
    .filter((section) => section.active)
    .map((section) => ({ ...section, stories: storiesForSection(stories, section.slug) as typeof stories }));
  const filledSections = sections.filter((section) => section.stories.length > 0);

  const now = new Date();
  const day = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "America/Managua", day: "2-digit" }).format(now);
  const month = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "America/Managua", month: "short" })
    .format(now)
    .replace(".", "");

  return (
    <PublicShell>
      <section className="board" aria-labelledby="orden-del-dia">
        <div className="wrap">
          <div className="board-head">
            <h2 id="orden-del-dia" className="board-title">
              {t.home.board}
            </h2>
            <p className="board-date" aria-hidden="true">
              <span className="tile tile--sm">{day}</span>
              <span className="tile tile--sm tile--word">{month}</span>
            </p>
          </div>

          {lead ? (
            <div className="board-grid">
              <article className="board-lead" style={{ "--slot": 0 } as React.CSSProperties}>
                <Link className="board-lead-media" href={lead.href} tabIndex={-1} aria-hidden="true">
                  <StoryImage story={lead} priority sizes="(min-width: 1100px) 680px, 100vw" />
                </Link>
                <div className="board-lead-body">
                  <Tile index={0} size="lg" />
                  <div>
                    <h3 className="board-lead-headline" lang={storyLang(lead)}>
                      <Link href={lead.href}>{lead.title}</Link>
                    </h3>
                    {lead.excerpt ? (
                      <p className="board-lead-excerpt" lang={storyLang(lead)}>
                        {lead.excerpt}
                      </p>
                    ) : null}
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
                        <h3 className="board-item-headline" lang={storyLang(story)}>
                          <Link href={story.href}>{story.title}</Link>
                        </h3>
                        {story.excerpt ? (
                          <p className="board-item-excerpt" lang={storyLang(story)}>
                            {story.excerpt}
                          </p>
                        ) : null}
                        <StoryLabel story={story} />
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : (
            <div className="board-empty">
              <p>{t.home.empty}</p>
            </div>
          )}
        </div>
      </section>

      <nav className="section-index" aria-label={t.home.sectionIndex}>
        <div className="wrap">
          <ul>
            {sections.map((section) => (
              <li key={section.slug} className={section.stories.length === 0 ? "is-empty" : undefined}>
                <Link href={section.href}>
                  <span className="section-index-name">{section.label}</span>
                  <span className="section-index-count">
                    {section.stories.length === 0 ? t.home.noStories : t.home.storyCount(section.stories.length)}
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
                    {t.home.seeSection} <IconArrowRight size={16} />
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

        <aside className="front-aside" aria-label={t.home.aside}>
          {latest.length > 0 ? (
            <section className="latest" aria-labelledby="lo-ultimo">
              <h2 id="lo-ultimo" className="rail-title">
                {t.home.latest}
              </h2>
              <ol className="latest-list">
                {latest.map((story) => (
                  <li key={story.slug}>
                    <h3 lang={storyLang(story)}>
                      <Link href={story.href}>{story.title}</Link>
                    </h3>
                    <StoryLabel story={story} />
                  </li>
                ))}
              </ol>
              <Link className="text-link" href={localePath(locale, "/noticias")}>
                {t.home.allNews} <IconArrowRight size={16} />
              </Link>
            </section>
          ) : null}

          <section className="tip-box" aria-labelledby="envia-noticia">
            <h2 id="envia-noticia">{t.home.tipTitle}</h2>
            <p>{t.home.tipText}</p>
            <Link className="button button--primary" href={localePath(locale, "/contacto")}>
              {t.home.tipButton}
            </Link>
          </section>
        </aside>
      </div>
    </PublicShell>
  );
}
