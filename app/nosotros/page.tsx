import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Bilwi Noticias nació en Puerto Cabezas para contar las historias de la Costa Caribe nicaragüense.",
};

const pillars = [
  {
    title: "Misión",
    text: "Proveer una plataforma informativa veraz, bilingüe e intercultural que empodere a las comunidades de la Costa Caribe de Nicaragua.",
  },
  {
    title: "Visión",
    text: "Ser el referente informativo líder del Caribe, conectando nuestras raíces locales con una audiencia amplia mediante innovación digital y rigor ético.",
  },
  {
    title: "Compromiso",
    text: "Periodismo cercano, legible y útil para la vida diaria de Bilwi y la Costa Caribe.",
  },
  {
    title: "Equipo",
    text: "Redacción, fotografía, edición, análisis y cobertura comunitaria.",
  },
];

export default function NosotrosPage() {
  return (
    <PublicShell compact>
      <section className="section-board" aria-labelledby="nosotros-title">
        <div className="wrap section-board-inner">
          <div>
            <h1 id="nosotros-title" className="section-board-name">
              Nosotros
            </h1>
            <p className="section-board-title">Voz del Caribe nicaragüense</p>
            <p className="section-board-desc">
              Fundado en el corazón de Puerto Cabezas, Bilwi Noticias nació de la necesidad de contar las historias
              que definen nuestra identidad costeña.
            </p>
          </div>
        </div>
      </section>

      <div className="wrap page">
        <blockquote className="pull-quote">
          <p>Informando con integridad desde las costas de Bilwi para todo el mundo.</p>
        </blockquote>

        <ol className="pillars">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
            </li>
          ))}
        </ol>

        <p className="prose">
          ¿Quieres proponer una historia o corregir un dato? <Link href="/contacto">Escribe a la redacción</Link>.
        </p>
      </div>
    </PublicShell>
  );
}
