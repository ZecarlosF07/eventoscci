import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { ProfessionalRegistrationFields } from "@/features/registrations/components/ProfessionalRegistrationFields";
import { participantFormSchema } from "@/features/participants/schemas/participant.schema";
import { registrationFormSchema } from "@/features/registrations/schemas/registration.schema";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";
import { copyBillingSource } from "@/features/billing/utils/billing-input";
import { getIndividualBillingSource } from "@/features/billing/utils/individual-billing-source";

function professionalData() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ document_type: "dni", document_number: "12345678",
    first_names: "Ana", last_names: "Pérez", email: "ana@example.test", phone: "900000001",
    registration_type: "general", participant_profile: "professional", job_title: "Analista",
    company: " Organización de prueba ", ruc: " 20123456789 ", address: " Ica " })) {
    data.set(key, value);
  }
  return data;
}

test("profesionales requieren organización y RUC y permiten provincia vacía", () => {
  const input = parseRegistrationFormData(professionalData());
  const parsed = registrationFormSchema.parse(input);
  assert.equal(parsed.company, "Organización de prueba");
  assert.equal(parsed.address, "Ica");
  assert.equal("province" in parsed, false);
  assert.equal(parsed.ruc, "20123456789");
  assert.equal(registrationFormSchema.safeParse({ ...input, address: "" }).success, true);
  for (const ruc of ["", "   ", "123", "201234567890", "2012345678a"]) {
    const result = registrationFormSchema.safeParse({ ...input, ruc });
    assert.equal(result.success, false);
    if (!result.success) assert.ok(result.error.issues.some((issue) => issue.path[0] === "ruc"));
  }
  for (const company of ["", "   ", "x", "x".repeat(251)]) {
    const result = registrationFormSchema.safeParse({ ...input, company });
    assert.equal(result.success, false);
    if (!result.success) assert.ok(result.error.issues.some((issue) => issue.path[0] === "company"));
  }
  assert.equal(registrationFormSchema.safeParse({ ...input, address: "x".repeat(251) }).success, false);
  assert.equal(registrationFormSchema.safeParse({ ...input, ruc: "123" }).success, false);
});

test("asociados conservan RUC obligatorio y provincia opcional", () => {
  const input = { ...parseRegistrationFormData(professionalData()), registration_type: "member", address: "" };
  assert.equal(registrationFormSchema.safeParse({ ...input, ruc: "" }).success, false);
  assert.equal(registrationFormSchema.safeParse({ ...input, ruc: "20123456789" }).success, true);
});

test("alternar a estudiante excluye datos profesionales sin modificar el borrador", () => {
  const data = professionalData();
  data.set("participant_profile", "student");
  data.set("academic_institution", "Universidad de Ica");
  data.set("career", "Administración");
  const student = parseRegistrationFormData(data);
  assert.equal(student.company, "");
  assert.equal(student.address, "");
  assert.equal(student.ruc, "");
  assert.equal(registrationFormSchema.safeParse(student).success, true);
  data.set("participant_profile", "professional");
  const professional = registrationFormSchema.parse(parseRegistrationFormData(data));
  assert.equal(professional.company, "Organización de prueba");
  assert.equal(professional.address, "Ica");
  assert.equal(professional.ruc, "20123456789");
});

test("el formulario conserva orden accesible y requisitos según tipo de inscripción", () => {
  for (const active of [false, true]) {
    const html = renderToStaticMarkup(createElement(ProfessionalRegistrationFields, { active, errors: {} }));
    const positions = ["company", "ruc", "job_title", "address"].map((name) => html.indexOf(`id="${name}"`));
    assert.ok(positions.every((position, index) => position >= 0 && (!index || position > positions[index - 1])));
    assert.match(html, /Empresa \/ Organización/);
    assert.equal(/id="company"[^>]*required/.test(html), active);
    assert.equal(/id="job_title"[^>]*required/.test(html), active);
    assert.doesNotMatch(html, /id="address"[^>]*required/);
    assert.equal(/id="ruc"[^>]*required/.test(html), active);
  }
});

test("copiar organización y RUC conserva dirección fiscal sin usar provincia ni dirección personal", () => {
  const data = professionalData();
  data.set("ruc", "20123456789");
  for (const address of ["", "Av. Fiscal 123"]) {
    const billing = { type: "factura" as const, name: "Destinatario", document: "20987654321", address };
    const copied = copyBillingSource("factura", getIndividualBillingSource(data, billing));
    assert.equal(copied.address, address);
    assert.equal(copied.document, "20123456789");
    assert.equal(copied.name, " Organización de prueba ");
  }
});

test("la edición de históricos permite empresa vacía y dirección omitida", () => {
  const input = parseRegistrationFormData(professionalData());
  const parsed = participantFormSchema.safeParse({ ...input, address: undefined, company: "" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.address, undefined);
  }
});
