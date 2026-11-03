import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";
import { localizeSections } from "@/lib/localize";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.simple.sitemapTitle, alternates: localizedAlternates(locale, "/mapa") };
}

export default async function MapaPage() {
  const { locale, t } = await getI18n();
  const href = (path: string) => localePath(locale, path);

  const groups = [
    {
      title: t.simple.sitemapNews,
      links: [
        { href: href("/"), label: t.nav.home },
        { href: href("/noticias"), label: t.simple.sitemapAllNews },
        { href: href("/categorias"), label: t.nav.sections },
      ],
    },
    {
      title: t.footer.sectionsTitle,
      links: localizeSections(locale).map((section) => ({ href: section.href, label: section.label })),
    },
    {
      title: t.simple.sitemapPaper,
      links: [
        { href: href("/nosotros"), label: t.footer.aboutLink },
        { href: href("/contacto"), label: t.nav.contact },
        { href: href("/publicidad"), label: t.footer.ads },
        { href: href("/marca"), label: t.footer.identity },
        { href: href("/etica"), label: t.footer.ethics },
        { href: href("/politica-privacidad"), label: t.footer.privacy },
        { href: href("/terminos"), label: t.footer.terms },
        { href: "/login", label: t.simple.sitemapNewsroom },
      ],
    },
  ];

  return (
    <SimplePage title={t.simple.sitemapTitle} lede={t.simple.sitemapLede}>
      <div className="sitemap">
        {groups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SimplePage>
  );
}
