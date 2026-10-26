import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { StoryLabel } from "@/components/story";
import { IconArrowRight } from "@/components/icons";
import { getCategorias, getPublicNoticias } from "@/lib/content-store";
import { displayCategory, publicSections, storiesForSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secciones",
  description: "Las secciones de Bilwi Noticias: locales, cultura, sociedad, economía, deportes y opinión.",
};

export default async function CategoriasPage() {
  const [stories, settings] = await Promise.all([getPublicNoticias(), getCategorias()]);
  const settingsBySlug = new Map(settings.map((item) => [item.slug, item]));

  const sections = publicSections
    .map((section) => {
      const setting = settingsBySlug.get(section.slug);
      return {
        ...section,
        label: displayCategory(setting?.label ?? section.label),
        title: setting?.title ?? section.title,
        description: setting?.description ?? section.description,
        active: setting?.active ?? true,
        stories: storiesForSection(stories, section.slug),
      };
    })
    .filter((section) => section.active);

  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>Secciones</h1>
          <p className="page-lede">
            {sections.length} secciones y {stories.length} {stories.length === 1 ? "noticia publicada" : "noticias publicadas"}. Elige por dónde empezar.
          </p>
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
                      <h3>
                        <Link href={`/noticias/${latest.slug}`}>{latest.title}</Link>
                      </h3>
                      <StoryLabel story={latest} />
                    </>
                  ) : (
                    <p className="section-directory-empty">Sin notas publicadas todavía.</p>
                  )}
                </div>
                <Link className="section-directory-go" href={section.href} aria-label={`Abrir ${section.label}`}>
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
