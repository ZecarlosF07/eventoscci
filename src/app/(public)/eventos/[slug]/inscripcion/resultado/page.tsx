import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationResult } from "@/features/registrations/components/RegistrationResult";
import { MemberGroupResult } from "@/features/member-groups/components/MemberGroupResult/MemberGroupResult";
import { getMemberGroupResult } from "@/features/member-groups/queries/get-member-group-result";
import { getRegistrationResult } from "@/features/registrations/queries/get-registration-result";
import type { RegistrationResultPageProps } from "@/features/registrations/types/registration.types";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Resultado de inscripción");

export default async function EventRegistrationResultPage({ params, searchParams }: RegistrationResultPageProps) {
  const query = await searchParams;
  const groupCode = Array.isArray(query.grupo) ? query.grupo[0] : query.grupo;
  const groupToken = Array.isArray(query.acceso) ? query.acceso[0] : query.acceso;
  if (groupCode && groupToken) {
    const group = await getMemberGroupResult(groupCode, groupToken);
    if (!group || group.activity_slug !== (await params).slug) notFound();
    return <MemberGroupResult result={group} />;
  }
  const codeValue = query.codigo;
  const requestTokenValue = query.solicitud;
  const code = Array.isArray(codeValue) ? codeValue[0] : codeValue;
  const requestToken = Array.isArray(requestTokenValue) ? requestTokenValue[0] : requestTokenValue;
  if (!code) notFound();
  const result = await getRegistrationResult(code, requestToken);
  if (!result || result.activity_type !== "event" || result.activity_slug !== (await params).slug) notFound();
  return <RegistrationResult result={result} />;
}
