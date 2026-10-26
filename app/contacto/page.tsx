import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { IconMail, IconMapPin, IconPhone } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribe a la redacción de Bilwi Noticias: notas de prensa, sugerencias y consultas publicitarias.",
};

const email = "redaccion@bilwinoticias.com";

export default function ContactoPage() {
  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>Escribe a la redacción</h1>
          <p className="page-lede">
            Si tienes una nota de prensa, una sugerencia o una consulta publicitaria, este es el lugar.
          </p>
        </header>

        <div className="contact">
          <ul className="contact-list">
            <li>
              <IconMapPin />
              <div>
                <h2>Dirección</h2>
                <p>Barrio El Muelle, calle principal, Puerto Cabezas, Nicaragua.</p>
              </div>
            </li>
            <li>
              <IconPhone />
              <div>
                <h2>Teléfono</h2>
                <p>
                  <a href="tel:+50527921234">+505 2792 1234</a>
                </p>
              </div>
            </li>
            <li>
              <IconMail />
              <div>
                <h2>Correo</h2>
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              </div>
            </li>
          </ul>

          <form className="panel contact-form" action={`mailto:${email}`} method="post" encType="text/plain">
            <h2 className="panel-title">Enviar un mensaje</h2>
            <p className="form-hint">El mensaje se abrirá en tu aplicación de correo para que lo envíes.</p>
            <div className="form-row">
              <div className="field">
                <label htmlFor="contact-name">Nombre completo</label>
                <input id="contact-name" name="nombre" type="text" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="contact-email">Correo electrónico</label>
                <input id="contact-email" name="correo" type="email" autoComplete="email" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="contact-subject">Asunto</label>
              <input id="contact-subject" name="asunto" type="text" placeholder="Noticia, sugerencia, publicidad…" />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Mensaje</label>
              <textarea id="contact-message" name="mensaje" rows={7} required />
            </div>
            <div className="form-foot">
              <span />
              <button className="button button--primary" type="submit">
                Enviar mensaje
              </button>
            </div>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}
