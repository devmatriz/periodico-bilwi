import type { Metadata } from "next";
import { SectionLanding, sectionMetadata } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return sectionMetadata("deportes");
}

export default function DeportesPage() {
  return <SectionLanding slug="deportes" />;
}
