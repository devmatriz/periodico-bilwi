import { SectionLanding } from "@/components/section-landing";

const headlines = [
  {
    title: "Serie del Caribe: la seleccion local avanza a semifinales",
    excerpt:
      "El conjunto de Bilwi mantiene el ritmo competitivo y suma respaldo de la aficion en cada jornada.",
    time: "Hace 2 horas",
  },
  {
    title: "Juegos juveniles impulsan nuevos talentos en Puerto Cabezas",
    excerpt:
      "La agenda deportiva de la semana integra formacion, competencia y acompanamiento comunitario.",
    time: "Hace 5 horas",
  },
  {
    title: "La costa se prepara para una carrera atletica solidaria",
    excerpt:
      "Organizaciones locales coordinan un evento que combinara deporte, salud y recaudacion social.",
    time: "Hace 8 horas",
  },
];

const metrics = [
  { label: "Cobertura", value: "Regional" },
  { label: "Formato", value: "Resultados" },
  { label: "Momento", value: "Hoy" },
];

export default function DeportesPage() {
  return (
    <SectionLanding
      eyebrow="Deportes"
      title="El pulso deportivo del Caribe"
      intro="Una portada pensada para resultados, competencia y protagonistas de la comunidad."
      pills={["Resultados", "Cancha local", "Juventud"]}
      summaryTitle="Diseño uniforme para no perder la identidad editorial"
      summaryDescription="Esta seccion conserva la misma tipografia, espaciado y jerarquia visual del resto del sitio."
      metrics={metrics}
      featured={{
        title: "Bilwi celebra el avance de su seleccion local",
        badge: "Semifinal",
        description: "Un partido intenso, un cierre ajustado y la alegria de la aficion marcan la jornada.",
        chips: ["Futbol", "Aficion", "Regional"],
        background: "linear-gradient(135deg, #0d6efd 0%, #123769 52%, #07162f 100%)",
      }}
      stories={headlines.map((item) => ({
        title: item.title,
        excerpt: item.excerpt,
        tag: item.time,
        chips: ["Deportes", "Bilwi"],
        background:
          "linear-gradient(135deg, rgba(9,14,24,0.98) 0%, rgba(17,29,48,0.96) 100%)",
      }))}
      footerTitle="Podemos sumar tablas, calendario y perfiles de atletas."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
