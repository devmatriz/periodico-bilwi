import { SectionLanding } from "@/components/section-landing";

const stories = [
  {
    title: "Barrio por barrio: mejoras de agua y drenaje",
    excerpt:
      "La cobertura local sigue el avance de servicios basicos en sectores urbanos y perifericos de Bilwi.",
    tag: "Servicios",
  },
  {
    title: "Vecinos coordinan jornadas de limpieza comunitaria",
    excerpt:
      "Las iniciativas barriales suman participacion ciudadana y refuerzan el sentido de comunidad.",
    tag: "Comunidad",
  },
  {
    title: "Transporte y movilidad, entre las principales demandas",
    excerpt:
      "La conectividad cotidiana sigue marcando la agenda de los barrios y las rutas locales.",
    tag: "Movilidad",
  },
];

const metrics = [
  { label: "Enfoque", value: "Vida diaria" },
  { label: "Formato", value: "Cronica" },
  { label: "Cobertura", value: "Barrial" },
];

export default function LocalesPage() {
  return (
    <SectionLanding
      eyebrow="Locales"
      title="La noticia que empieza en el barrio"
      intro="Una seccion para seguir servicios, calles, instituciones y la vida cotidiana de Bilwi."
      pills={["Barrio", "Servicios", "Comunidad"]}
      summaryTitle="Informacion cercana, util y directa"
      summaryDescription="El mismo estilo visual para mantener una experiencia consistente en toda la web."
      metrics={metrics}
      featured={{
        title: "Avanzan obras de agua potable en sectores urbanos",
        badge: "Prioridad",
        description:
          "La mejora de servicios basicos sigue al centro de la agenda local y de las demandas vecinales.",
        chips: ["Agua", "Servicios", "Bilwi"],
        background: "linear-gradient(135deg, #0d6efd 0%, #0c2f67 55%, #081b39 100%)",
      }}
      stories={stories.map((story) => ({
        ...story,
        chips: ["Locales", "Bilwi"],
        background: "linear-gradient(135deg, rgba(10,18,32,0.98) 0%, rgba(21,36,60,0.96) 100%)",
      }))}
      footerTitle="Podemos vincular esta seccion con reportes por barrio y mapa de servicios."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
