import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { ActivityStudentRegistrationField } from "@/features/activities/components/ActivityStudentRegistrationField/ActivityStudentRegistrationField";
import { activityFormSchema } from "@/features/activities/schemas/activity.schema";
import { parseActivityFormData } from "@/features/activities/utils/form-data";
import { RegistrationProfileSelector } from "@/features/registrations/components/RegistrationProfileSelector";
import { REGISTRATION_ERROR_MESSAGES } from "@/features/registrations/constants/registration.constants";
import { getRegistrationErrorCode } from "@/features/registrations/utils/registration-errors";
import { isStudentRegistrationRestricted } from "@/features/registrations/utils/student-registration-policy";

function activityFormData() {
  const data = new FormData();
  for (const [name, value] of Object.entries({ type: "event", title: "Actividad de prueba", description: "Descripción para probar los perfiles.",
    modality: "in_person", status: "draft", is_free: "on", is_listed: "on", certificate_mode: "none",
    date_starts_at: "2026-10-10T10:00", date_ends_at: "2026-10-10T11:00" })) data.set(name, value);
  return data;
}

test("el guardado distingue true, false y omisión para conservar clientes antiguos", () => {
  const data = activityFormData();
  assert.equal(activityFormSchema.parse(parseActivityFormData(data)).allows_student_registration, undefined);
  for (const value of [true, false]) {
    data.set("allows_student_registration", String(value));
    assert.equal(activityFormSchema.parse(parseActivityFormData(data)).allows_student_registration, value);
    data.set("type", "training");
    assert.equal(activityFormSchema.parse(parseActivityFormData(data)).allows_student_registration, value);
  }
  assert.equal(activityFormSchema.safeParse({ ...parseActivityFormData(data), allows_student_registration: "false" }).success, false);
  assert.equal(activityFormSchema.safeParse({ ...parseActivityFormData(data), allows_student_registration: null }).success, false);
});

test("la opción administrativa transmite ambos valores y explica su alcance", () => {
  for (const allowed of [true, false]) {
    const html = renderToStaticMarkup(createElement(ActivityStudentRegistrationField, { allowed, onChange() {}, visible: true }));
    assert.match(html, /Permitir inscripciones de estudiantes/);
    assert.match(html, /solo se aceptarán inscripciones con perfil Profesional o empresario/);
    const hidden = html.match(/<input[^>]*type="hidden"[^>]*>/)?.[0] ?? "";
    assert.ok(hidden.includes('name="allows_student_registration"'));
    assert.ok(hidden.includes(`value="${allowed}"`));
    assert.equal(/type="checkbox"[^>]*checked/.test(html), allowed);
  }
});

test("ocultar el control para asociados conserva su valor sin ofrecer la opción estudiante", () => {
  for (const allowed of [true, false]) {
    const html = renderToStaticMarkup(createElement(ActivityStudentRegistrationField, { allowed, onChange() {}, visible: false }));
    assert.ok(html.includes(`value="${allowed}"`));
    assert.doesNotMatch(html, /type="checkbox"|Permitir inscripciones/);
  }
});

test("el selector restringido envía profesional y no ofrece estudiante", () => {
  const restricted = renderToStaticMarkup(createElement(RegistrationProfileSelector, { allowsStudentRegistration: false, value: "professional", onChange() {} }));
  assert.match(restricted, /Profesional o empresario/);
  assert.match(restricted, /name="participant_profile"[^>]*checked=""[^>]*value="professional"/);
  assert.doesNotMatch(restricted, /value="student"|Estudiante/);
  const unrestricted = renderToStaticMarkup(createElement(RegistrationProfileSelector, { value: "student", onChange() {} }));
  assert.match(unrestricted, /value="student"/);
  assert.match(unrestricted, /value="professional"/);
});

test("la política bloquea solo al estudiante declarado y conserva un error específico", () => {
  assert.equal(isStudentRegistrationRestricted(false, "student"), true);
  assert.equal(isStudentRegistrationRestricted(true, "student"), false);
  assert.equal(isStudentRegistrationRestricted(false, "professional"), false);
  const code = getRegistrationErrorCode("STUDENT_REGISTRATION_NOT_ALLOWED");
  assert.equal(code, "STUDENT_REGISTRATION_NOT_ALLOWED");
  assert.equal(REGISTRATION_ERROR_MESSAGES[code], "Esta actividad no admite inscripciones con perfil estudiante. Actualiza la página para revisar los requisitos");
});
