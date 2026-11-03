import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";
import { localePath } from "@/lib/i18n";
import { getI18n, localizedAlternates } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.simple.adsMetaTitle, alternates: localizedAlternates(locale, "/publicidad") };
}

export default async function PublicidadPage() {
  const { locale, t } = await getI18n();
  return (
    <SimplePage title={t.simple.adsTitle} lede={t.simple.adsLede}>
      <p>
        {t.simple.adsBodyBefore} <Link href={localePath(locale, "/contacto")}>{t.simple.adsBodyLink}</Link>{" "}
        {t.simple.adsBodyAfter}
      </p>
    </SimplePage>
  );
}
