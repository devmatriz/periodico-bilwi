import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("deportes");
  return {
    title: section?.label ?? "Deportes",
    description: section?.description,
  };
}

export default function DeportesPage() {
  return <SectionLanding slug="deportes" />;
}
