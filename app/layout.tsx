import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Bilwi Noticias",
    template: "%s | Bilwi Noticias",
  },
  description:
    "Periodico digital para informacion local, cultural y social en Bilwi, Puerto Cabezas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={inter.variable}>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
