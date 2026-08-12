import { notFound } from "next/navigation";

import { RegistrationResult } from "@/features/registrations/components/RegistrationResult";
import { getRegistrationResult } from "@/features/registrations/queries/get-registration-result";
import type { RegistrationResultPageProps } from "@/features/registrations/types/registration.types";

export default async function TrainingRegistrationResultPage({ params, searchParams }: RegistrationResultPageProps) {
  const codeValue = (await searchParams).codigo;
  const code = Array.isArray(codeValue) ? codeValue[0] : codeValue;
  if (!code) notFound();
  const result = await getRegistrationResult(code);
  if (!result || result.activity_type !== "training" || result.activity_slug !== (await params).slug) notFound();
  return <RegistrationResult result={result} />;
}
