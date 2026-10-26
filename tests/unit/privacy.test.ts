import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PrivacyPage, { metadata } from "@/app/(public)/privacidad/page";
import { memberGroupInputSchema } from "@/features/member-groups/schemas/member-group.schema";
import { PrivacyFields } from "@/features/privacy/components/PrivacyFields";
import { PRIVACY_POLICY, PRIVACY_VERSION } from "@/features/privacy/constants/privacy.constants";
import { privacyInputSchema } from "@/features/privacy/schemas/privacy.schema";
import { getPrivacyError } from "@/features/privacy/utils/privacy-error";
import { parsePrivacyFormData } from "@/features/privacy/utils/privacy-form-data";
import { registrationFormSchema } from "@/features/registrations/schemas/registration.schema";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";

const ACCEPTED = { privacy_accepted: true, privacy_version: PRIVACY_VERSION, marketing_accepted: false };

test("la aceptación debe ser explícita y vigente; publicidad es opcional", () => {
  for (const privacy_accepted of [false, undefined, "true", "false", 1]) assert.equal(privacyInputSchema.safeParse({ ...ACCEPTED, privacy_accepted }).success, false);
  assert.equal(privacyInputSchema.safeParse({ ...ACCEPTED, privacy_version: "anterior" }).success, false);
  assert.equal(privacyInputSchema.safeParse({ ...ACCEPTED, marketing_accepted: "false" }).success, false);
  assert.deepEqual(privacyInputSchema.parse({ privacy_accepted: true, privacy_version: PRIVACY_VERSION }), ACCEPTED);
  assert.equal(privacyInputSchema.parse({ ...ACCEPTED, marketing_accepted: true }).marketing_accepted, true);
});

test("FormData no atribuye aceptación a valores falsos ni a campos ausentes", () => {
  const data = new FormData();
  assert.equal(parsePrivacyFormData(data).privacy_accepted, false);
  data.set("privacy_accepted", "false");
  assert.equal(parsePrivacyFormData(data).privacy_accepted, false);
  data.set("privacy_accepted", "on");
  data.set("privacy_version", PRIVACY_VERSION);
  assert.deepEqual(parsePrivacyFormData(data), ACCEPTED);
  assert.equal(parseRegistrationFormData(data).privacy_accepted, true);
  assert.equal(parseRegistrationFormData(data).marketing_accepted, false);
});

test("casillas separadas, desmarcadas y con política que abre sin perder el formulario", () => {
  for (const context of ["individual", "campus", "group"] as const) {
    const html = renderToStaticMarkup(createElement(PrivacyFields, { context }));
    const checkboxes = html.match(/<input[^>]+type="checkbox"[^>]*>/g) ?? [];
    assert.equal(checkboxes.length, 2);
    assert.doesNotMatch(checkboxes.join(""), /checked=""/);
    assert.match(checkboxes[0], /required=""/);
    assert.doesNotMatch(checkboxes[1], /required=""/);
    assert.match(html, /href="\/privacidad"/);
    assert.match(html, /target="_blank"/);
    assert.doesNotMatch(html, /Puedo retirar|comercial@camaraica.org.pe/);
    if (context === "group") assert.match(html, /todos los asistentes/);
  }
});

test("el grupo conserva su declaración al volver al resumen y expone el error junto a ella", () => {
  const html = renderToStaticMarkup(createElement(PrivacyFields, { context: "group", idPrefix: "group-privacy", value: { ...ACCEPTED, marketing_accepted: true }, errors: { privacy_version: ["Actualiza la política"] } }));
  assert.equal((html.match(/checked=""/g) ?? []).length, 2);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="group-privacy-error"/);
  assert.match(html, /Actualiza la política/);
});

test("los esquemas de negocio conservan los campos enviados para que lleguen a SQL", () => {
  assert.ok("privacy_version" in registrationFormSchema.shape);
  const input = { ...ACCEPTED, ruc: "20123456789", attendees: [{ document_type: "dni", document_number: "12345678", first_names: "Ana", last_names: "Pérez", email: "ana@example.test", phone: "900000001", job_title: "Gerente", request_certificate: false }], expected_free_count: 0, billing: null, future_topics_suggestion: "" };
  assert.equal(memberGroupInputSchema.parse(input).privacy_accepted, true);
  assert.equal(memberGroupInputSchema.parse(input).marketing_accepted, false);
});

test("política pública y copia SQL coinciden; no atribuyen aceptación de Analytics", () => {
  const html = renderToStaticMarkup(createElement(PrivacyPage));
  assert.match(html, /<h1[^>]*>Política de privacidad/);
  assert.equal(metadata.alternates?.canonical, "/privacidad");
  const migration = readFileSync("supabase/migrations/202610260002_privacy_short_notices.sql", "utf8");
  const content = migration.split("$policy$")[1];
  assert.deepEqual(JSON.parse(content), PRIVACY_POLICY);
  assert.match(html, /no se registra como consentimiento de Analytics/);
  assert.match(getPrivacyError("error PRIVACY_POLICY_CHANGED") ?? "", /Actualiza/);
  assert.equal(getPrivacyError("unrelated"), undefined);
});
