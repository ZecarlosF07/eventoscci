"use client";

import { useState } from "react";

import { PRIVACY_POLICY, PRIVACY_ROUTE, PRIVACY_VERSION } from "@/features/privacy/constants/privacy.constants";
import type { PrivacyFieldsProps } from "@/features/privacy/types/privacy.types";

export function PrivacyFields({ context = "individual", errors = {}, idPrefix = "privacy", onChange, value }: PrivacyFieldsProps) {
  const [localAccepted, setAccepted] = useState(false);
  const [localMarketing, setMarketing] = useState(false);
  const accepted = value?.privacy_accepted ?? localAccepted;
  const marketing = value?.marketing_accepted ?? localMarketing;
  const privacyError = errors.privacy_accepted?.[0] ?? errors.privacy_version?.[0];
  const notice = PRIVACY_POLICY.notices[context];
  const marketingNotice = context === "group" ? PRIVACY_POLICY.notices.groupMarketing : PRIVACY_POLICY.notices.marketing;
  const [beforeLink, afterLink] = notice.split("Política de privacidad");
  return (
    <fieldset className="space-y-3 border-t border-cci-100 pt-5">
      <legend className="sr-only">Privacidad y comunicaciones</legend>
      <input name="privacy_version" type="hidden" value={PRIVACY_VERSION} />
      <div className="flex items-start gap-3 text-sm leading-6 text-cci-950">
        <input aria-describedby={privacyError ? `${idPrefix}-error` : undefined} aria-invalid={Boolean(privacyError)} checked={accepted} className="mt-1 size-5 shrink-0 accent-cci-800 focus-visible:outline-2 focus-visible:outline-offset-4" id={`${idPrefix}-accepted`} name="privacy_accepted" onChange={(event) => { setAccepted(event.target.checked); onChange?.({ privacy_accepted: event.target.checked, privacy_version: PRIVACY_VERSION, marketing_accepted: marketing }); }} required type="checkbox" />
        <label className="min-h-11 cursor-pointer" htmlFor={`${idPrefix}-accepted`}>{beforeLink}<a className="font-semibold underline underline-offset-4 hover:text-cci-600 focus-visible:outline-2" href={PRIVACY_ROUTE} rel="noopener noreferrer" target="_blank">Política de privacidad<span className="sr-only"> (se abre en otra pestaña)</span></a>{afterLink} <span aria-hidden="true" className="text-rose-600">*</span></label>
      </div>
      {privacyError ? <p className="text-sm font-medium text-rose-700" id={`${idPrefix}-error`} role="alert">{privacyError}</p> : null}
      <div className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input checked={marketing} className="mt-1 size-5 shrink-0 accent-cci-800 focus-visible:outline-2 focus-visible:outline-offset-4" id={`${idPrefix}-marketing`} name="marketing_accepted" onChange={(event) => { setMarketing(event.target.checked); onChange?.({ privacy_accepted: accepted, privacy_version: PRIVACY_VERSION, marketing_accepted: event.target.checked }); }} type="checkbox" />
        <label className="min-h-11 cursor-pointer" htmlFor={`${idPrefix}-marketing`}>{marketingNotice} <span className="font-medium">(Opcional)</span></label>
      </div>
    </fieldset>
  );
}
