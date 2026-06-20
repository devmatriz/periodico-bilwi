import { SectionLanding } from "@/components/section-landing";

const stories = [
  {
    title: "Festival, danza y memoria en la agenda cultural",
    excerpt:
      "La cultura local se presenta como una columna viva de identidad y participacion comunitaria.",
    tag: "Festivales",
  },
  {
    title: "Talleres infantiles fortalecen lengua y tradicion",
    excerpt:
      "Los espacios formativos ayudan a preservar la memoria y el patrimonio de la costa.",
    tag: "Infancia",
  },
  {
    title: "Artesanos y musicos preparan nuevas presentaciones",
    excerpt:
      "La escena cultural se dinamiza con propuestas que combinan creacion y raiz comunitaria.",
    tag: "Arte",
  },
];

const metrics = [
  { label: "Enfoque", value: "Identidad" },
  { label: "Formato", value: "Reporte" },
  { label: "Cobertura", value: "Cultural" },
];

export default function CulturaPage() {
  return (
    <SectionLanding
      eyebrow="Cultura"
      title="La memoria viva de Bilwi"
      intro="Arte, tradicion, musica e identidad contadas con una experiencia visual coherente."
      pills={["Tradicion", "Mision cultural", "Arte local"]}
      summaryTitle="Un lenguaje editorial que celebra la identidad"
      summaryDescription="Mantener la misma jerarquia ayuda a que la experiencia se sienta unificada."
      metrics={metrics}
      featured={{
        title: "Bilwi se prepara para una nueva jornada cultural",
        badge: "Festival",
        description:
          "La agenda artistica reune expresiones populares, memoria local y participacion ciudadana.",
        chips: ["Música", "Danza", "Tradicion"],
        background: "linear-gradient(135deg, #d28a00 0%, #8c4d00 55%, #3b2204 100%)",
      }}
      stories={stories.map((story) => ({
        ...story,
        chips: ["Cultura", "Bilwi"],
        background:
          "linear-gradient(135deg, rgba(15,16,20,0.98) 0%, rgba(42,31,18,0.96) 100%)",
      }))}
      footerTitle="Podemos sumar galerias, agenda de eventos y perfiles de artistas."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
