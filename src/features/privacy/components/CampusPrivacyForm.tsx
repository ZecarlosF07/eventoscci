"use client";

import { Button } from "@/components/atoms/Button";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { PrivacyFields } from "@/features/privacy/components/PrivacyFields";
import { acceptCampusPrivacy } from "@/features/privacy/mutations/campus-privacy.actions";
import type { CampusPrivacyFormProps, PrivacyFormState } from "@/features/privacy/types/privacy.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: PrivacyFormState = {};

export function CampusPrivacyForm({ courseId }: CampusPrivacyFormProps) {
  const { onSubmit, pending, state } = usePersistentAction(acceptCampusPrivacy.bind(null, courseId), INITIAL_STATE);
  return <form className="mt-6 space-y-5" noValidate onSubmit={onSubmit}>
    <PrivacyFields context="campus" errors={state.errors} idPrefix="course-privacy" />
    <FormActionNotice message={state.message} success={state.success} />
    <Button disabled={pending} type="submit">{pending ? "Guardando…" : "Aceptar e inscribirme"}</Button>
  </form>;
}
