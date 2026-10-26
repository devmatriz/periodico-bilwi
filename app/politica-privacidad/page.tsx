import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PoliticaPrivacidadPage() {
  return <SimplePage title="Política de privacidad" lede="Texto legal base para la operación del sitio." />;
}
