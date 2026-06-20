import Link from "next/link";

export function Header() {
  return (
    <header className="site-header compact">
      <div className="navbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            BN
          </span>
          <span>
            <strong>Periodico Bilwi</strong>
            <small>Costa Caribe de Nicaragua</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          <Link href="/noticias">Noticias</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
      </div>
    </header>
  );
}
