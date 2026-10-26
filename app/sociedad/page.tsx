import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("sociedad");
  return {
    title: section?.label ?? "Sociedad",
    description: section?.description,
  };
}

export default function SociedadPage() {
  return <SectionLanding slug="sociedad" />;
}
