import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Términos de servicio" };

export default function TerminosPage() {
  return (
    <SimplePage
      title="Términos de servicio"
      lede="Condiciones básicas de uso del sitio y del contenido editorial."
    />
  );
}
