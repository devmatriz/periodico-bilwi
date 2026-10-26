import type { Metadata } from "next";
import { SectionLanding, sectionMetadata } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return sectionMetadata("cultura");
}

export default function CulturaPage() {
  return <SectionLanding slug="cultura" />;
}
