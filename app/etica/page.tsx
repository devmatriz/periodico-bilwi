import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.simple.ethicsTitle, alternates: localizedAlternates(locale, "/etica") };
}

export default async function EticaPage() {
  const { t } = await getI18n();
  return <SimplePage title={t.simple.ethicsTitle} lede={t.simple.ethicsLede} />;
}
