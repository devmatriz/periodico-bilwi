import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("locales");
  return {
    title: section?.label ?? "Locales",
    description: section?.description,
  };
}

export default function LocalesPage() {
  return <SectionLanding slug="locales" />;
}
