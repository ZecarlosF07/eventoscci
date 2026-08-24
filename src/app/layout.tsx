import type { Metadata } from "next";

import { SITE_CONFIG } from "@/config/site";

import "./globals.css";

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
    <html lang="es">
      <body className="bg-slate-50 font-sans text-slate-950 antialiased">
        {children}
      </body>
    </html>
  );
}
