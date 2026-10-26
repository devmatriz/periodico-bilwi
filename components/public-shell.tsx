import Link from "next/link";
import { Logo } from "@/components/brand";
import { LiveTicker } from "@/components/live-ticker";
import { SectionNav } from "@/components/section-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconSearch } from "@/components/icons";
import { getRecentNoticias } from "@/lib/content-store";
import { intlLocale, localePath, localeShort, localeNames, locales } from "@/lib/i18n";
import { getCurrentPath, getI18n } from "@/lib/i18n-server";
import { categoryName, localizeSections, localizeStories } from "@/lib/localize";
import { formatLongDate } from "@/lib/sections";

/** Logo horizontal decorativo: el enlace que lo envuelve lleva la etiqueta accesible. */
export function Wordmark() {
  return <Logo title="" />;
}

export async function PublicShell({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const [{ locale, t }, current] = await Promise.all([getI18n(), getCurrentPath()]);
  const href = (path: string) => localePath(locale, path);

  const tickerItems = compact
    ? []
    : localizeStories(await getRecentNoticias(5), locale).map((story) => `${categoryName(story.category, locale)}: ${story.title}`);

  const longDate = formatLongDate(new Date(), locale);
  const today = longDate.charAt(0).toUpperCase() + longDate.slice(1);
  const year = new Date().getFullYear();
  const sections = localizeSections(locale);

  const navItems = [
    { path: "/", label: t.nav.home },
    { path: "/noticias", label: t.nav.latest },
    ...sections.map((section) => ({ path: section.path, label: section.label })),
    { path: "/categorias", label: t.nav.sections },
  ].map((item) => ({ ...item, href: href(item.path) }));

  return (
    <div className="site">
      <header className="masthead">
        <div className="masthead-utility wrap">
          <p className="masthead-date">
            <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
            <span className="masthead-place">
              <span aria-hidden="true"> · </span>
              {t.common.place}
            </span>
          </p>
          <div className="masthead-utility-end">
            <nav className="utility-links" aria-label={t.nav.institutional}>
              <Link href={href("/nosotros")}>{t.nav.about}</Link>
              <Link href={href("/contacto")}>{t.nav.contact}</Link>
              <Link href="/login">{t.nav.newsroom}</Link>
            </nav>
            <nav className="lang-switch" aria-label={t.common.language}>
              {locales.map((code) => (
                // Enlace normal (no Link): al cambiar de idioma se recarga la página completa.
                <a
                  key={code}
                  href={localePath(code, current)}
                  hrefLang={code}
                  lang={code}
                  title={localeNames[code]}
                  aria-current={code === locale ? "true" : undefined}
                >
                  {localeShort[code]}
                </a>
              ))}
            </nav>
            <ThemeToggle labels={t.theme} />
          </div>
        </div>

        <div className="masthead-main wrap">
          <Link className="masthead-brand" href={href("/")} aria-label={t.common.homeAria}>
            <Wordmark />
          </Link>

          <form className="masthead-search" action={href("/noticias")} method="get" role="search">
            <label htmlFor="masthead-q" className="visually-hidden">
              {t.common.searchNews}
            </label>
            <input id="masthead-q" name="q" type="search" placeholder={t.common.searchNews} autoComplete="off" />
            <button type="submit" aria-label={t.common.search}>
              <IconSearch size={18} />
            </button>
          </form>

          <Link className="masthead-search-link" href={`${href("/noticias")}#buscar`} aria-label={t.common.searchNews}>
            <IconSearch size={22} />
          </Link>
        </div>

        <div className="wrap">
          <SectionNav items={navItems} current={current} label={t.nav.sections} />
        </div>

        {!compact ? <LiveTicker items={tickerItems} labels={t.ticker} intl={intlLocale[locale]} /> : null}
      </header>

      <main id="contenido">{children}</main>

      <footer className="site-footer">
        <div className="wrap site-footer-grid">
          <div className="site-footer-brand">
            <Link href={href("/")} aria-label={t.common.homeAria}>
              <Wordmark />
            </Link>
            <p>{t.footer.tagline}</p>
            <p className="site-footer-address">{t.footer.address}</p>
          </div>

          <nav aria-label={t.footer.sectionsAria}>
            <h2>{t.footer.sectionsTitle}</h2>
            <ul>
              {sections.map((section) => (
                <li key={section.href}>
                  <Link href={section.href}>{section.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.paperTitle}>
            <h2>{t.footer.paperTitle}</h2>
            <ul>
              <li><Link href={href("/nosotros")}>{t.footer.aboutLink}</Link></li>
              <li><Link href={href("/contacto")}>{t.footer.contactLink}</Link></li>
              <li><Link href={href("/publicidad")}>{t.footer.ads}</Link></li>
              <li><Link href={href("/marca")}>{t.footer.identity}</Link></li>
              <li><Link href={href("/mapa")}>{t.footer.sitemap}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t.footer.legal}>
            <h2>{t.footer.legal}</h2>
            <ul>
              <li><Link href={href("/etica")}>{t.footer.ethics}</Link></li>
              <li><Link href={href("/politica-privacidad")}>{t.footer.privacy}</Link></li>
              <li><Link href={href("/terminos")}>{t.footer.terms}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="wrap site-footer-base">
          <span>© {year} Bilwi Noticias</span>
          <span>{t.footer.madeIn}</span>
        </div>
      </footer>
    </div>
  );
}
