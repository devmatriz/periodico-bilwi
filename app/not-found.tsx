import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export default function NotFound() {
  return (
    <PublicShell compact>
      <div className="wrap page">
        <div className="empty-state empty-state--page">
          <p className="tile tile--lg" aria-hidden="true">404</p>
          <h1>No encontramos esta página</h1>
          <p>Puede que la noticia se haya movido o que el enlace esté incompleto. Busca el tema o vuelve a la portada.</p>
          <form className="masthead-search masthead-search--inline" action="/noticias" method="get" role="search">
            <label htmlFor="nf-q" className="visually-hidden">
              Buscar noticias
            </label>
            <input id="nf-q" name="q" type="search" placeholder="Buscar noticias" />
            <button type="submit" className="button button--primary">
              Buscar
            </button>
          </form>
          <Link className="text-link" href="/">
            Volver a la portada
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
