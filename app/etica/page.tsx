import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Ética periodística" };

export default function EticaPage() {
  return (
    <SimplePage
      title="Ética periodística"
      lede="Principios de veracidad, independencia y responsabilidad editorial."
    />
  );
}
