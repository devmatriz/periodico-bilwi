import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { publicSections } from "@/lib/sections";

export const metadata: Metadata = { title: "Mapa del sitio" };

const groups = [
  {
    title: "Noticias",
    links: [
      { href: "/", label: "Portada" },
      { href: "/noticias", label: "Todas las noticias y búsqueda" },
      { href: "/categorias", label: "Secciones" },
    ],
  },
  {
    title: "Secciones",
    links: publicSections.map((section) => ({ href: section.href, label: section.label })),
  },
  {
    title: "El periódico",
    links: [
      { href: "/nosotros", label: "Sobre nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/publicidad", label: "Publicidad" },
      { href: "/marca", label: "Identidad visual" },
      { href: "/etica", label: "Ética periodística" },
      { href: "/politica-privacidad", label: "Política de privacidad" },
      { href: "/terminos", label: "Términos de servicio" },
      { href: "/login", label: "Acceso de la redacción" },
    ],
  },
];

export default function MapaPage() {
  return (
    <SimplePage title="Mapa del sitio" lede="Todas las páginas de Bilwi Noticias en un solo lugar.">
      <div className="sitemap">
        {groups.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SimplePage>
  );
}
