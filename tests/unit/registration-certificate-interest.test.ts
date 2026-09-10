import assert from "node:assert/strict";
import test from "node:test";

import { registrationFormSchema } from "@/features/registrations/schemas/registration.schema";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";

function validRegistration() {
  return {
    address: "Ica",
    company: "",
    document_number: "12345678",
    document_type: "dni" as const,
    email: "persona@example.test",
    first_names: "Persona",
    job_title: "Analista",
    last_names: "Solicitante",
    phone: "914000001",
    registration_type: "general" as const,
    request_certificate: true,
    ruc: "",
  };
}

test("acepta el interés opcional como parte de la inscripción", () => {
  const result = registrationFormSchema.safeParse(validRegistration());

  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.request_certificate, true);
});

test("el checkbox desmarcado se interpreta como ausencia de solicitud", () => {
  const formData = new FormData();
  for (const [key, value] of Object.entries({
    ...validRegistration(),
    request_certificate: undefined,
  })) {
    if (typeof value === "string") formData.set(key, value);
  }

  const parsed = parseRegistrationFormData(formData);

  assert.equal(parsed.request_certificate, false);
});

test("el checkbox marcado se incorpora al payload público", () => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(validRegistration())) {
    if (typeof value === "string") formData.set(key, value);
  }
  formData.set("request_certificate", "on");

  const parsed = parseRegistrationFormData(formData);

  assert.equal(parsed.request_certificate, true);
});
