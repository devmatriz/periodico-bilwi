import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.simple.termsTitle, alternates: localizedAlternates(locale, "/terminos") };
}

export default async function TerminosPage() {
  const { t } = await getI18n();
  return <SimplePage title={t.simple.termsTitle} lede={t.simple.termsLede} />;
}
