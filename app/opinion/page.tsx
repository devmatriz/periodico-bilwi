import { SectionLanding } from "@/components/section-landing";

const stories = [
  {
    title: "Editorial: la informacion local necesita continuidad",
    excerpt:
      "Una opinion con contexto ayuda a entender los cambios de la region y su impacto real.",
    tag: "Editorial",
  },
  {
    title: "Columnas sobre economia, ciudad y desarrollo",
    excerpt:
      "Las voces de analisis enriquecen la conversacion publica y el enfoque del periodico.",
    tag: "Analisis",
  },
  {
    title: "Reflexiones sobre participacion y democracia local",
    excerpt:
      "El debate editorial suma perspectivas sobre comunidad, instituciones y futuro regional.",
    tag: "Debate",
  },
];

const metrics = [
  { label: "Enfoque", value: "Analitico" },
  { label: "Formato", value: "Opinion" },
  { label: "Cobertura", value: "Editorial" },
];

export default function OpinionPage() {
  return (
    <SectionLanding
      eyebrow="Opinion"
      title="La mirada editorial del periodico"
      intro="Columnas, analisis y reflexiones para ampliar el contexto de la informacion local."
      pills={["Editorial", "Analisis", "Debate"]}
      summaryTitle="Argumentos claros con una presencia visual sobria"
      summaryDescription="La composicion mantiene el tono periodistico, evitando que la opinion rompa el ritmo del sitio."
      metrics={metrics}
      featured={{
        title: "La prensa local y el valor de la claridad editorial",
        badge: "Opinion",
        description:
          "Una opinion bien construida ayuda al lector a interpretar la agenda publica con mayor profundidad.",
        chips: ["Editorial", "Analisis", "Contexto"],
        background: "linear-gradient(135deg, #2b313f 0%, #4f1f2b 58%, #1d0d15 100%)",
      }}
      stories={stories.map((story) => ({
        ...story,
        chips: ["Opinion", "Bilwi"],
        background:
          "linear-gradient(135deg, rgba(12,14,18,0.98) 0%, rgba(32,21,27,0.96) 100%)",
      }))}
      footerTitle="Podemos sumar columnas fijas, autoras invitadas y debates semanales."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
