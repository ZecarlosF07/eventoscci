import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationPageTemplate } from "@/components/templates/RegistrationPageTemplate";
import { getRegistrationPageData } from "@/features/registrations/services/get-registration-page-data";
import type { RegistrationRoutePageProps } from "@/features/registrations/types/registration.types";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Inscripción a evento");

export default async function EventRegistrationPage({ params }: RegistrationRoutePageProps) {
  const data = await getRegistrationPageData("event", (await params).slug);
  if (!data) notFound();
  return <RegistrationPageTemplate {...data} />;
}
