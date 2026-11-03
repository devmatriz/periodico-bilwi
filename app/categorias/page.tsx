import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryLabel, storyLang } from "@/components/story";
import { IconArrowRight } from "@/components/icons";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";
import { localizeSections, localizeStories } from "@/lib/localize";
import { storiesForSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.sectionsPage.metaTitle,
    description: t.sectionsPage.metaDescription,
    alternates: localizedAlternates(locale, "/categorias"),
  };
}

export default async function CategoriasPage() {
  const [{ locale, t }, published, settings] = await Promise.all([getI18n(), getPublicNoticias(), getCategorias()]);
  const stories = localizeStories(published, locale);

  const sections = localizeSections(locale, settings)
    .filter((section) => section.active)
    .map((section) => ({ ...section, stories: storiesForSection(stories, section.slug) as typeof stories }));

  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>{t.sectionsPage.title}</h1>
          <p className="page-lede">{t.sectionsPage.lede(sections.length, stories.length)}</p>
        </header>

        <ol className="section-directory">
          {sections.map((section) => {
            const latest = section.stories[0];
            return (
              <li key={section.slug} className="section-directory-item">
                <span className={`tile tile--md${section.stories.length === 0 ? " tile--empty" : ""}`} aria-hidden="true">
                  {section.stories.length === 0 ? "–" : String(section.stories.length).padStart(2, "0")}
                </span>
                <div className="section-directory-main">
                  <h2>
                    <Link href={section.href}>{section.label}</Link>
                  </h2>
                  <p className="section-directory-title">{section.title}</p>
                  <p className="section-directory-desc">{section.description}</p>
                </div>
                <div className="section-directory-latest">
                  {latest ? (
                    <>
                      <h3 lang={storyLang(latest)}>
                        <Link href={latest.href}>{latest.title}</Link>
                      </h3>
                      <StoryLabel story={latest} />
                    </>
                  ) : (
                    <p className="section-directory-empty">{t.sectionsPage.empty}</p>
                  )}
                </div>
                <Link className="section-directory-go" href={section.href} aria-label={t.sectionsPage.open(section.label)}>
                  <IconArrowRight size={20} />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </PublicShell>
  );
}
