import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { CampusPrivacyForm } from "@/features/privacy/components/CampusPrivacyForm";
import type { CampusPrivacyPageProps } from "@/features/privacy/types/privacy.types";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = buildNoIndexMetadata("Privacidad del Campus");

export default async function CampusPrivacyPage({ searchParams }: CampusPrivacyPageProps) {
  await requireActiveAccount();
  const { curso } = await searchParams;
  if (!z.uuid().safeParse(curso).success || !curso) notFound();
  const client = await createServerSupabaseClient();
  const [courseResult, consentResult] = await Promise.all([
    client.from("courses").select("id,title,slug").eq("id", curso).eq("status", "published").eq("is_free", true).is("deleted_at", null).maybeSingle(),
    client.rpc("has_current_campus_privacy"),
  ]);
  if (courseResult.error || consentResult.error) throw new Error("No fue posible consultar el curso y su autorización.");
  if (!courseResult.data) notFound();
  if (consentResult.data) redirect(`/cursos/${courseResult.data.slug}`);
  return <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
    <h1 className="text-2xl font-bold text-cci-950">Antes de empezar tu formación</h1>
    <p className="mt-3 leading-7 text-slate-600">Revisa cómo utilizamos tus datos en el Campus. Esta aceptación se guarda para tu cuenta y no tendrás que repetirla en cada curso mientras la versión siga vigente.</p>
    <h2 className="mt-5 font-semibold text-cci-950">{courseResult.data.title}</h2>
    <CampusPrivacyForm courseId={curso} />
  </section>;
}
