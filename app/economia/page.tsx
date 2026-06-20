import { SectionLanding } from "@/components/section-landing";

const headlines = [
  {
    title: "Exportaciones pesqueras alcanzan cifras record",
    excerpt:
      "El sector mantiene dinamismo con nuevas oportunidades de comercio y empleo en la costa.",
    time: "Hace 1 hora",
  },
  {
    title: "Pequenos negocios locales fortalecen la economia de barrio",
    excerpt:
      "Emprendedores de Bilwi diversifican sus servicios y encuentran nuevos canales de venta.",
    time: "Hace 4 horas",
  },
  {
    title: "La energia solar reduce costos en comunidades remotas",
    excerpt:
      "La transicion energetica se traduce en ahorro familiar y mayor continuidad en el servicio.",
    time: "Hace 7 horas",
  },
];

const metrics = [
  { label: "Cobertura", value: "Bilwi" },
  { label: "Enfoque", value: "Economia real" },
  { label: "Datos", value: "Actualizados" },
];

export default function EconomiaPage() {
  return (
    <SectionLanding
      eyebrow="Economia"
      title="La actividad productiva de la region"
      intro="Una portada clara para seguir empleo, comercio, energia y movimiento economico local."
      pills={["Mercados", "Empleo", "Comercio"]}
      summaryTitle="La misma experiencia visual en cada seccion"
      summaryDescription="Mantener la estructura evita que el lector sienta que cambio de sitio cuando navega."
      metrics={metrics}
      featured={{
        title: "Las exportaciones pesqueras impulsan la region",
        badge: "Mercado",
        description:
          "El movimiento comercial vuelve a posicionar a Bilwi como un punto clave para la actividad economica del Caribe.",
        chips: ["Pesca", "Comercio", "Regional"],
        background: "linear-gradient(135deg, #d28a00 0%, #8c4d00 55%, #2e1c08 100%)",
      }}
      stories={headlines.map((item) => ({
        title: item.title,
        excerpt: item.excerpt,
        tag: item.time,
        chips: ["Economia", "Bilwi"],
        background:
          "linear-gradient(135deg, rgba(12,18,28,0.98) 0%, rgba(28,35,48,0.96) 100%)",
      }))}
      footerTitle="Podemos sumar indicadores, grafica y reportes semanales."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
