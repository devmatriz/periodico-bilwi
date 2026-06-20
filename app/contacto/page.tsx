import { PublicShell } from "@/components/public-shell";

export default function ContactoPage() {
  return (
    <PublicShell compact>
      <section className="content-page">
        <div className="content-heading">
          <span className="eyebrow">Contacto</span>
          <h1>Escribe a la redaccion</h1>
          <p className="muted">
            Si tienes una nota de prensa, sugerencia o consulta publicitaria, este es el lugar.
          </p>
        </div>

        <div className="contact-grid">
          <div className="sidebar-card">
            <h2>Contáctanos</h2>
            <p>Estamos aqui para escucharte y atender propuestas de la comunidad.</p>
            <div className="sidebar-list" style={{ marginTop: 20 }}>
              <div>
                <span className="eyebrow">Direccion</span>
                <p>Barrio El Muelle, calle principal, Puerto Cabezas, Nicaragua.</p>
              </div>
              <div>
                <span className="eyebrow">Telefono</span>
                <p>+505 2792 1234</p>
              </div>
              <div>
                <span className="eyebrow">Correo</span>
                <p>redaccion@bilwinoticias.com</p>
              </div>
            </div>
            <div className="map-card" style={{ marginTop: 20 }} />
          </div>

          <div className="form-card">
            <form className="stack-form">
              <div className="form-grid">
                <label>
                  Nombre completo
                  <input type="text" placeholder="Tu nombre" />
                </label>
                <label>
                  Correo electronico
                  <input type="email" placeholder="tu@correo.com" />
                </label>
              </div>
              <label>
                Asunto
                <input type="text" placeholder="Motivo de contacto" />
              </label>
              <label>
                Mensaje
                <textarea rows={9} placeholder="Escribe tu mensaje" />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="button">
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
