import { SectionLanding } from "@/components/section-landing";

const stories = [
  {
    title: "Salud publica y participacion, al centro de la agenda",
    excerpt:
      "La seccion destaca acciones comunitarias, educacion, salud y acompanamiento ciudadano.",
    tag: "Salud",
  },
  {
    title: "Escuelas y familias impulsan nuevas jornadas educativas",
    excerpt:
      "La vinculacion entre escuela y hogar sigue fortaleciendo el tejido social de la region.",
    tag: "Educacion",
  },
  {
    title: "Jornadas de apoyo vecinal mejoran la convivencia",
    excerpt:
      "La participacion de organizaciones y liderazgos locales marca la vida cotidiana.",
    tag: "Ciudadania",
  },
];

const metrics = [
  { label: "Enfoque", value: "Personas" },
  { label: "Formato", value: "Contexto" },
  { label: "Cobertura", value: "Social" },
];

export default function SociedadPage() {
  return (
    <SectionLanding
      eyebrow="Sociedad"
      title="La vida social que sostiene la comunidad"
      intro="Una seccion pensada para salud, educacion, participacion ciudadana y temas humanos."
      pills={["Salud", "Educacion", "Ciudadania"]}
      summaryTitle="Historias humanas con una portada clara"
      summaryDescription="La misma grilla y la misma fuente conservan la continuidad visual entre secciones."
      metrics={metrics}
      featured={{
        title: "Acciones comunitarias fortalecen salud y bienestar",
        badge: "Impacto",
        description: "Iniciativas de apoyo social y acompanamiento local marcan la agenda de la semana.",
        chips: ["Salud", "Bienestar", "Comunidad"],
        background: "linear-gradient(135deg, #0ea5a4 0%, #0a5f69 55%, #072f39 100%)",
      }}
      stories={stories.map((story) => ({
        ...story,
        chips: ["Sociedad", "Bilwi"],
        background:
          "linear-gradient(135deg, rgba(11,16,23,0.98) 0%, rgba(15,35,42,0.96) 100%)",
      }))}
      footerTitle="Podemos sumar testimonios, notas de servicio y cronicas humanas."
      footerDescription=""
      footerHref="/noticias"
      footerLabel="Ver noticias"
    />
  );
}
