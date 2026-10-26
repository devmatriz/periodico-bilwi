import type { Metadata } from "next";
import { SectionLanding, sectionMetadata } from "@/components/section-landing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return sectionMetadata("locales");
}

export default function LocalesPage() {
  return <SectionLanding slug="locales" />;
}
