import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { IconMail, IconMapPin, IconPhone } from "@/components/icons";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.contact.metaTitle, description: t.contact.metaDescription, alternates: localizedAlternates(locale, "/contacto") };
}

const email = "redaccion@bilwinoticias.com";

export default async function ContactoPage() {
  const { t } = await getI18n();

  return (
    <PublicShell compact>
      <div className="wrap page">
        <header className="page-head">
          <h1>{t.contact.title}</h1>
          <p className="page-lede">{t.contact.lede}</p>
        </header>

        <div className="contact">
          <ul className="contact-list">
            <li>
              <IconMapPin />
              <div>
                <h2>{t.contact.address}</h2>
                <p>{t.contact.addressValue}</p>
              </div>
            </li>
            <li>
              <IconPhone />
              <div>
                <h2>{t.contact.phone}</h2>
                <p>
                  <a href="tel:+50527921234">+505 2792 1234</a>
                </p>
              </div>
            </li>
            <li>
              <IconMail />
              <div>
                <h2>{t.contact.email}</h2>
                <p>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              </div>
            </li>
          </ul>

          <form className="panel contact-form" action={`mailto:${email}`} method="post" encType="text/plain">
            <h2 className="panel-title">{t.contact.formTitle}</h2>
            <p className="form-hint">{t.contact.formHint}</p>
            <div className="form-row">
              <div className="field">
                <label htmlFor="contact-name">{t.contact.fullName}</label>
                <input id="contact-name" name="nombre" type="text" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="contact-email">{t.contact.yourEmail}</label>
                <input id="contact-email" name="correo" type="email" autoComplete="email" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="contact-subject">{t.contact.subject}</label>
              <input id="contact-subject" name="asunto" type="text" placeholder={t.contact.subjectPlaceholder} />
            </div>
            <div className="field">
              <label htmlFor="contact-message">{t.contact.message}</label>
              <textarea id="contact-message" name="mensaje" rows={7} required />
            </div>
            <div className="form-foot">
              <span />
              <button className="button button--primary" type="submit">
                {t.contact.send}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}
