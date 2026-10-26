import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("cultura");
  return {
    title: section?.label ?? "Cultura",
    description: section?.description,
  };
}

export default function CulturaPage() {
  return <SectionLanding slug="cultura" />;
}
