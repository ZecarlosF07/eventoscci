import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationResult } from "@/features/registrations/components/RegistrationResult";
import { getRegistrationResult } from "@/features/registrations/queries/get-registration-result";
import type { RegistrationResultPageProps } from "@/features/registrations/types/registration.types";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Resultado de inscripción");

export default async function TrainingRegistrationResultPage({ params, searchParams }: RegistrationResultPageProps) {
  const codeValue = (await searchParams).codigo;
  const requestTokenValue = (await searchParams).solicitud;
  const code = Array.isArray(codeValue) ? codeValue[0] : codeValue;
  const requestToken = Array.isArray(requestTokenValue) ? requestTokenValue[0] : requestTokenValue;
  if (!code) notFound();
  const result = await getRegistrationResult(code, requestToken);
  if (!result || result.activity_type !== "training" || result.activity_slug !== (await params).slug) notFound();
  return <RegistrationResult result={result} />;
}
