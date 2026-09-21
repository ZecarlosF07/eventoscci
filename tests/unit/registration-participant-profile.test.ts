import assert from "node:assert/strict";
import test from "node:test";

import { registrationFormSchema } from "@/features/registrations/schemas/registration.schema";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";

function commonFormData(): FormData {
  const formData = new FormData();
  formData.set("document_type", "dni");
  formData.set("document_number", "12345678");
  formData.set("first_names", "Ana");
  formData.set("last_names", "Estudiante");
  formData.set("email", "ana@example.test");
  formData.set("phone", "900000001");
  formData.set("registration_type", "general");
  return formData;
}

test("acepta estudiante con institución y carrera usando público general", () => {
  const formData = commonFormData();
  formData.set("participant_profile", "student");
  formData.set("academic_institution", "Universidad Nacional San Luis Gonzaga");
  formData.set("career", "Administración");
  formData.set("job_title", "Este cargo no debe enviarse");
  formData.set("company", "Empresa anterior");

  const parsed = parseRegistrationFormData(formData);
  const result = registrationFormSchema.safeParse(parsed);

  assert.equal(result.success, true);
  assert.equal(parsed.job_title, "");
  assert.equal(parsed.company, "");
  assert.equal(parsed.participant_profile, "student");
});

test("exige institución y carrera al estudiante", () => {
  const formData = commonFormData();
  formData.set("participant_profile", "student");

  const result = registrationFormSchema.safeParse(parseRegistrationFormData(formData));

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.flatten().fieldErrors.academic_institution);
    assert.ok(result.error.flatten().fieldErrors.career);
  }
});

test("un asociado siempre se procesa como profesional", () => {
  const formData = commonFormData();
  formData.set("registration_type", "member");
  formData.set("participant_profile", "student");
  formData.set("job_title", "Gerente");
  formData.set("company", "Empresa Asociada SAC");
  formData.set("ruc", "20123456789");

  const parsed = parseRegistrationFormData(formData);

  assert.equal(parsed.participant_profile, "professional");
  assert.equal(registrationFormSchema.safeParse(parsed).success, true);
});

test("limita la sugerencia a quinientos caracteres", () => {
  const formData = commonFormData();
  formData.set("participant_profile", "professional");
  formData.set("job_title", "Analista");
  formData.set("future_topics_suggestion", "x".repeat(501));

  const result = registrationFormSchema.safeParse(parseRegistrationFormData(formData));

  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.flatten().fieldErrors.future_topics_suggestion);
});
