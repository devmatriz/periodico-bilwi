import Link from "next/link";
import { LiveTicker } from "@/components/live-ticker";
import { publicNav } from "@/lib/site-data";
import { getTickerItems } from "@/lib/content-store";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 4a6.5 6.5 0 1 0 4.43 11.26l4.4 4.4 1.42-1.42-4.4-4.4A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
    </svg>
  );
}

export async function PublicShell({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const tickerItems = compact ? [] : await getTickerItems();

  return (
    <div className="site-page">
      <header className={compact ? "site-header compact" : "site-header"}>
        {!compact ? (
          <LiveTicker items={tickerItems} />
        ) : null}

        <div className="navbar">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              BN
            </span>
            <span>
              <strong>Bilwi Noticias</strong>
              <small>Costa Caribe de Nicaragua</small>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Principal">
            {publicNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <form className="search-form" action="/noticias" method="get">
              <label className="search-field" aria-label="Buscar noticias">
                <IconSearch />
                <input name="q" type="search" placeholder="Buscar noticias..." />
              </label>
            </form>
            <Link className="nav-link" href="/login">
              Login
            </Link>
            <Link className="button button-primary" href="/registro">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-brand">
          <Link className="footer-logo" href="/">
            Bilwi Noticias
          </Link>
          <p>
            El portal de noticias lider en la region autonoma de la Costa Caribe Norte.
          </p>
          <div className="social-row">
            <span>f</span>
            <span>t</span>
            <span>ig</span>
          </div>
        </div>

        <div>
          <h3>Categorias</h3>
          <Link href="/locales">Noticias Locales</Link>
          <Link href="/cultura">Cultura y Tradicion</Link>
          <Link href="/deportes">Deportes Caribe</Link>
          <Link href="/economia">Economia Regional</Link>
        </div>

        <div>
          <h3>Institucional</h3>
          <Link href="/nosotros">Sobre Nosotros</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/mapa">Mapa del Sitio</Link>
          <Link href="/publicidad">Publicidad</Link>
        </div>

        <div>
          <h3>Legal</h3>
          <Link href="/politica-privacidad">Politica de Privacidad</Link>
          <Link href="/terminos">Terminos de Servicio</Link>
          <Link href="/etica">Etica Periodistica</Link>
          <p className="footer-small">Direccion: Puerto Cabezas, Costa Caribe Norte, Nicaragua.</p>
        </div>
      </footer>

      <div className="footer-bottom">
        <span>© 2024 Bilwi Noticias. Caribbean Coast, Nicaragua.</span>
        <span>Desarrollado con orgullo en el Caribe</span>
      </div>
    </div>
  );
}
