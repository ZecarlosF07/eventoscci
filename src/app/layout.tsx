import type { Metadata } from "next";
import { Charis_SIL, Inter } from "next/font/google";

import { SITE_CONFIG } from "@/config/site";

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

export const metadata: Metadata = {
  description: SITE_CONFIG.description,
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${inter.variable} ${charis.variable}`} lang="es">
      <body className="bg-cci-50 font-sans text-cci-950 antialiased">
        {children}
      </body>
    </html>
  );
}
