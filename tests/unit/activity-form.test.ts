import assert from "node:assert/strict";
import test from "node:test";

import { activityFormSchema } from "../../src/features/activities/schemas/activity.schema";
import type { ActivityFormInput } from "../../src/features/activities/types/activity-form.types";

function validActivity(): ActivityFormInput {
  return {
    academic_hours: "",
    additional_info: "",
    banner_path: "",
    capacity: "",
    category_id: "",
    contact_id: "",
    dates: [{ ends_at: "2026-09-22T11:30", label: "Día 1", sort_order: 0, starts_at: "2026-09-22T10:00" }],
    description: "Descripción válida para el evento de prueba.",
    duration_text: "",
    general_price: "0",
    id: "",
    is_free: true,
    member_price: "0",
    members_only: false,
    modality: "in_person",
    objective: "",
    program: "",
    program_image_paths: [],
    registration_close_at: "",
    registration_open_at: "",
    registrations_closed_manually: false,
    short_description: "",
    slug: "",
    speakers: [],
    status: "draft",
    syllabus: "",
    target_audience: "",
    title: "Evento sin medios disponibles",
    type: "event",
    venue_id: "",
    virtual_url: "",
  };
}

test("permite crear un borrador sin banner ni programa", () => {
  assert.equal(activityFormSchema.safeParse(validActivity()).success, true);
});

test("permite títulos de actividades de hasta 300 caracteres", () => {
  const result = activityFormSchema.safeParse({ ...validActivity(), title: "x".repeat(300) });
  assert.equal(result.success, true);
});

test("identifica títulos de actividades que superan los 300 caracteres", () => {
  const result = activityFormSchema.safeParse({ ...validActivity(), title: "x".repeat(301) });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.flatten().fieldErrors.title?.length);
});
