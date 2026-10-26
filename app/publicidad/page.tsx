import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Publicidad" };

export default function PublicidadPage() {
  return (
    <SimplePage title="Espacios publicitarios" lede="Pauta, patrocinio y contacto comercial.">
      <p>
        Para anunciar en Bilwi Noticias o patrocinar una sección, escríbenos desde la página de{" "}
        <Link href="/contacto">contacto</Link> indicando “Publicidad” en el asunto.
      </p>
    </SimplePage>
  );
}
