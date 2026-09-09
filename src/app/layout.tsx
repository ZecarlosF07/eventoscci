import type { Metadata } from "next";
import { Charis_SIL, Inter } from "next/font/google";

import { SITE_CONFIG } from "@/config/site";
import { GoogleAnalytics } from "@/features/analytics/components/GoogleAnalytics";
import { getSiteUrl } from "@/lib/env/server-env";

import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const charis = Charis_SIL({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-charis",
  weight: ["400", "700"],
});

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()
  || "Kpu31CAp9R0wougV06WgzGF1HzSNvEY27gekzFojB4o";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.organization, url: "https://camaraica.org.pe/" }],
  category: "Educación y eventos empresariales",
  creator: SITE_CONFIG.organization,
  description: SITE_CONFIG.description,
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    description: SITE_CONFIG.description,
    images: [{ alt: SITE_CONFIG.description, height: 630, url: "/opengraph-image", width: 1200 }],
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    title: "Eventos, capacitaciones y cursos en Ica, Perú",
    type: "website",
    url: "/",
  },
  publisher: SITE_CONFIG.organization,
  robots: { follow: true, index: true },
  title: {
    default: "Eventos, capacitaciones y cursos en Ica | Cámara de Comercio de Ica",
    template: `%s | ${SITE_CONFIG.organization}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE_CONFIG.description,
    images: ["/opengraph-image"],
    title: "Eventos, capacitaciones y cursos en Ica, Perú",
  },
  verification: { google: googleSiteVerification },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${inter.variable} ${charis.variable}`} lang={SITE_CONFIG.language}>
      <body className="bg-cci-50 font-sans text-cci-950 antialiased">
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim()} />
      </body>
    </html>
  );
}
