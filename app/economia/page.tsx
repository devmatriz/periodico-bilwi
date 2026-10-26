import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("economia");
  return {
    title: section?.label ?? "Economía",
    description: section?.description,
  };
}

export default function EconomiaPage() {
  return <SectionLanding slug="economia" />;
}
