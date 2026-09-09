import type { Metadata } from "next";

import { HomePageTemplate } from "@/components/templates/HomePageTemplate";
import { ROUTES } from "@/constants/routes";
import { getHomePageContent } from "@/features/home/queries/get-home-page-content";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildHomeJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export const metadata: Metadata = buildPageMetadata({
  description: "Descubre la agenda de eventos en Ica, capacitaciones empresariales y cursos virtuales de la Cámara de Comercio de Ica.",
  path: ROUTES.home,
  title: "Eventos, capacitaciones y cursos en Ica, Perú",
});

export default async function HomePage() {
  const content = await getHomePageContent();

  return (
    <>
      <JsonLd data={buildHomeJsonLd(getSiteUrl())} />
      <HomePageTemplate content={content} />
    </>
  );
}
