import Link from "next/link";
import { Logo } from "@/components/brand";
import { LiveTicker } from "@/components/live-ticker";
import { SectionNav } from "@/components/section-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconSearch } from "@/components/icons";
import { publicNav } from "@/lib/site-data";
import { publicSections, formatLongDate } from "@/lib/sections";
import { getTickerItems } from "@/lib/content-store";

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
  const tickerItems = compact ? [] : await getTickerItems();
  const longDate = formatLongDate(new Date());
  const today = longDate.charAt(0).toUpperCase() + longDate.slice(1);
  const year = new Date().getFullYear();

  return (
    <div className="site">
      <header className="masthead">
        <div className="masthead-utility wrap">
          <p className="masthead-date">
            <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
            <span className="masthead-place">
              <span aria-hidden="true"> · </span>Bilwi, Costa Caribe Norte
            </span>
          </p>
          <div className="masthead-utility-end">
            <nav className="utility-links" aria-label="Institucional">
              <Link href="/nosotros">Nosotros</Link>
              <Link href="/contacto">Contacto</Link>
              <Link href="/login">Redacción</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>

        <div className="masthead-main wrap">
          <Link className="masthead-brand" href="/" aria-label="Bilwi Noticias, portada">
            <Wordmark />
          </Link>

          <form className="masthead-search" action="/noticias" method="get" role="search">
            <label htmlFor="masthead-q" className="visually-hidden">
              Buscar noticias
            </label>
            <input id="masthead-q" name="q" type="search" placeholder="Buscar noticias" autoComplete="off" />
            <button type="submit" aria-label="Buscar">
              <IconSearch size={18} />
            </button>
          </form>

          <Link className="masthead-search-link" href="/noticias#buscar" aria-label="Buscar noticias">
            <IconSearch size={22} />
          </Link>
        </div>

        <div className="wrap">
          <SectionNav items={publicNav} />
        </div>

        {!compact ? <LiveTicker items={tickerItems} /> : null}
      </header>

      <main id="contenido">{children}</main>

      <footer className="site-footer">
        <div className="wrap site-footer-grid">
          <div className="site-footer-brand">
            <Link href="/" aria-label="Bilwi Noticias, portada">
              <Wordmark />
            </Link>
            <p>Información local, cultural y social desde Bilwi para la Costa Caribe Norte de Nicaragua.</p>
            <p className="site-footer-address">Puerto Cabezas, Costa Caribe Norte, Nicaragua</p>
          </div>

          <nav aria-label="Secciones del periódico">
            <h2>Secciones</h2>
            <ul>
              {publicSections.map((section) => (
                <li key={section.href}>
                  <Link href={section.href}>{section.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="El periódico">
            <h2>El periódico</h2>
            <ul>
              <li><Link href="/nosotros">Sobre nosotros</Link></li>
              <li><Link href="/contacto">Contacto y envío de noticias</Link></li>
              <li><Link href="/publicidad">Publicidad</Link></li>
              <li><Link href="/marca">Identidad visual</Link></li>
              <li><Link href="/mapa">Mapa del sitio</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2>Legal</h2>
            <ul>
              <li><Link href="/etica">Ética periodística</Link></li>
              <li><Link href="/politica-privacidad">Política de privacidad</Link></li>
              <li><Link href="/terminos">Términos de servicio</Link></li>
            </ul>
          </nav>
        </div>

        <div className="wrap site-footer-base">
          <span>© {year} Bilwi Noticias</span>
          <span>Hecho en Bilwi, Puerto Cabezas</span>
        </div>
      </footer>
    </div>
  );
}
