export type StoryCard = {
  category: string;
  title: string;
  excerpt: string;
  image: string;
  time: string;
  author: string;
  slug: string;
};

export const publicNav = [
  { href: "/", label: "Portada" },
  { href: "/noticias", label: "Lo último" },
  { href: "/locales", label: "Locales" },
  { href: "/cultura", label: "Cultura" },
  { href: "/sociedad", label: "Sociedad" },
  { href: "/economia", label: "Economía" },
  { href: "/deportes", label: "Deportes" },
  { href: "/opinion", label: "Opinión" },
  { href: "/categorias", label: "Secciones" },
];

export type EditorialSection = {
  href: string;
  label: string;
  badge: string;
  title: string;
  description: string;
  chips: string[];
  feature: string;
  intro: string;
  meta: string;
  image: string;
  background: string;
};

export const editorialSections: EditorialSection[] = [
  {
    href: "/locales",
    label: "Locales",
    badge: "Barrio",
    title: "La noticia que empieza en la calle",
    description: "Servicios, movilidad y vida diaria de Bilwi con una lectura clara.",
    chips: ["Barrios", "Servicios", "Movilidad"],
    feature: "Avanzan obras de agua potable en sectores urbanos",
    intro: "Servicios y barrio",
    meta: "2 notas hoy",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    background: "linear-gradient(135deg, #0d6efd 0%, #0c2f67 55%, #081b39 100%)",
  },
  {
    href: "/cultura",
    label: "Cultura",
    badge: "Raiz",
    title: "Memoria viva, arte y tradicion",
    description: "Eventos, musica y expresiones culturales con identidad caribena.",
    chips: ["Arte", "Tradicion", "Eventos"],
    feature: "Bilwi se prepara para una nueva jornada cultural",
    intro: "Agenda cultural",
    meta: "3 eventos activos",
    image:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1200&q=80",
    background: "linear-gradient(135deg, #d28a00 0%, #8c4d00 58%, #362100 100%)",
  },
  {
    href: "/deportes",
    label: "Deportes",
    badge: "Marcador",
    title: "Resultados, torneos y protagonistas",
    description: "La cobertura deportiva local con ritmo, analisis y aficion.",
    chips: ["Futbol", "Aficion", "Regional"],
    feature: "Bilwi celebra el avance de su seleccion local",
    intro: "Competencia local",
    meta: "1 semifinal",
    image:
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80",
    background: "linear-gradient(135deg, #101826 0%, #132f58 58%, #07162f 100%)",
  },
  {
    href: "/economia",
    label: "Economia",
    badge: "Mercado",
    title: "Produccion, empleo y movimiento regional",
    description: "La actividad economica contada con contexto y claridad editorial.",
    chips: ["Pesca", "Comercio", "Regional"],
    feature: "Las exportaciones pesqueras impulsan la region",
    intro: "Mercado regional",
    meta: "Datos recientes",
    image:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
    background: "linear-gradient(135deg, #2f2107 0%, #8c4d00 58%, #1d1404 100%)",
  },
];

export const featuredStories: StoryCard[] = [
  {
    category: "Desarrollo Regional",
    title: "Inauguran nuevo sistema de electrificacion en Waspam",
    excerpt:
      "Una obra clave para fortalecer la infraestructura y el acceso a servicios basicos en la Costa Caribe.",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
    time: "24 Mayo, 2024",
    author: "Por Redaccion Bilwi",
    slug: "inauguran-nuevo-sistema-electrificacion-waspam",
  },
  {
    category: "Cultura",
    title: "Inicia el Festival de Mayo Ya 2024",
    excerpt:
      "Las calles de la ciudad se llenan de color, danza y memoria cultural.",
    image:
      "https://images.unsplash.com/photo-1516306580123-e6e52a6c5c3b?auto=format&fit=crop&w=1000&q=80",
    time: "23 Mayo, 2024",
    author: "Equipo Editorial",
    slug: "festival-de-mayo-ya-2024",
  },
  {
    category: "Economia",
    title: "Exportaciones pesqueras alcanzan cifras record",
    excerpt:
      "El sector pesquero mantiene dinamismo con nuevas oportunidades de comercio.",
    image:
      "https://images.unsplash.com/photo-1518544889284-8f4d3d0d3aa8?auto=format&fit=crop&w=1000&q=80",
    time: "22 Mayo, 2024",
    author: "Reporteria Local",
    slug: "exportaciones-pesqueras-cifras-record",
  },
];

export const recentStories: StoryCard[] = [
  {
    category: "Medio Ambiente",
    title: "Energia solar llega a comunidades remotas de Bilwi",
    excerpt:
      "Mas de 500 familias ahora cuentan con servicio electrico gracias a la instalacion de paneles solares.",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80",
    time: "Hace 2 horas",
    author: "Redaccion",
    slug: "energia-solar-comunidades-remotas-bilwi",
  },
  {
    category: "Deportes",
    title: "Serie del Caribe: seleccion local avanza a semifinales",
    excerpt:
      "El equipo de Bilwi mantiene una racha positiva en el torneo regional.",
    image:
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80",
    time: "Hace 5 horas",
    author: "Deportes Bilwi",
    slug: "serie-del-caribe-avanza-semifinales",
  },
  {
    category: "Infraestructura",
    title: "Avance del 80% en construccion del puente",
    excerpt:
      "La obra promete mejorar la conectividad y el comercio en la region.",
    image:
      "https://images.unsplash.com/photo-1503008873559-1a7b6f0c0b8b?auto=format&fit=crop&w=1000&q=80",
    time: "Hace 8 horas",
    author: "Cierre Local",
    slug: "avance-construccion-puente",
  },
  {
    category: "Tradiciones",
    title: "Feria gastronomica destaca sabores de la costa",
    excerpt:
      "El evento reunio a expositores que celebraron la cocina tradicional.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    time: "Ayer",
    author: "Cultura y Raiz",
    slug: "feria-gastronomica-sabores-costa",
  },
];
