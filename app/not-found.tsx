import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { localePath } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n-server";

export default async function NotFound() {
  const { locale, t } = await getI18n();

  return (
    <PublicShell compact>
      <div className="wrap page">
        <div className="empty-state empty-state--page">
          <p className="tile tile--lg" aria-hidden="true">404</p>
          <h1>{t.notFound.title}</h1>
          <p>{t.notFound.text}</p>
          <form className="masthead-search masthead-search--inline" action={localePath(locale, "/noticias")} method="get" role="search">
            <label htmlFor="nf-q" className="visually-hidden">
              {t.common.searchNews}
            </label>
            <input id="nf-q" name="q" type="search" placeholder={t.common.searchNews} />
            <button type="submit" className="button button--primary">
              {t.common.search}
            </button>
          </form>
          <Link className="text-link" href={localePath(locale, "/")}>
            {t.notFound.back}
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
