import type { Metadata } from "next";
import { SectionLanding, getSectionMeta } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionMeta("opinion");
  return {
    title: section?.label ?? "Opinión",
    description: section?.description,
  };
}

export default function OpinionPage() {
  return <SectionLanding slug="opinion" />;
}
