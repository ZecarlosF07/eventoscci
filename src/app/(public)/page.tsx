import type { Metadata } from "next";

import { HomePageTemplate } from "@/components/templates/HomePageTemplate";
import { getHomePageContent } from "@/features/home/queries/get-home-page-content";

export const metadata: Metadata = {
  description: "Eventos, capacitaciones y cursos de la Cámara de Comercio de Ica para impulsar tu crecimiento profesional y empresarial.",
  title: "Eventos y formación empresarial",
};

export default async function HomePage() {
  const content = await getHomePageContent();

  return <HomePageTemplate content={content} />;
}
