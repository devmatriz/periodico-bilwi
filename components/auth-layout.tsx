import Link from "next/link";
import { Wordmark } from "@/components/public-shell";
import { IconArrowLeft } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({
  boardTitle,
  boardText,
  children,
}: {
  boardTitle: string;
  boardText: string;
  children: React.ReactNode;
}) {
  return (
    <main id="contenido" className="auth">
      <section className="auth-board" aria-label="Bilwi Noticias">
        <Link className="auth-brand" href="/" aria-label="Bilwi Noticias, portada">
          <Wordmark />
        </Link>
        <div className="auth-board-copy">
          <p className="auth-board-title">{boardTitle}</p>
          <p className="auth-board-text">{boardText}</p>
        </div>
        <p className="auth-board-foot">Bilwi, Costa Caribe Norte de Nicaragua</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link className="text-link auth-back" href="/">
            <IconArrowLeft size={16} /> Volver a la portada
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}
