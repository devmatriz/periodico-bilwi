import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.about.metaTitle, description: t.about.metaDescription, alternates: localizedAlternates(locale, "/nosotros") };
}

export default async function NosotrosPage() {
  const { locale, t } = await getI18n();

  return (
    <PublicShell compact>
      <section className="section-board" aria-labelledby="nosotros-title">
        <div className="wrap section-board-inner">
          <div>
            <h1 id="nosotros-title" className="section-board-name">
              {t.about.name}
            </h1>
            <p className="section-board-title">{t.about.title}</p>
            <p className="section-board-desc">{t.about.intro}</p>
          </div>
        </div>
      </section>

      <div className="wrap page">
        <blockquote className="pull-quote">
          <p>{t.about.quote}</p>
        </blockquote>

        <ol className="pillars">
          {t.about.pillars.map((pillar) => (
            <li key={pillar.title}>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
            </li>
          ))}
        </ol>

        <p className="prose">
          {t.about.closingQuestion} <Link href={localePath(locale, "/contacto")}>{t.about.closingLink}</Link>.
        </p>
      </div>
    </PublicShell>
  );
}
