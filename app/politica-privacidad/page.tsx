import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.simple.privacyTitle, alternates: localizedAlternates(locale, "/politica-privacidad") };
}

export default async function PoliticaPrivacidadPage() {
  const { t } = await getI18n();
  return <SimplePage title={t.simple.privacyTitle} lede={t.simple.privacyLede} />;
}
