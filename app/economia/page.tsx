import type { Metadata } from "next";
import { SectionLanding, sectionMetadata } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return sectionMetadata("economia");
}

export default function EconomiaPage() {
  return <SectionLanding slug="economia" />;
}
