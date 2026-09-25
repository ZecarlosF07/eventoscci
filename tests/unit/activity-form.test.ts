import assert from "node:assert/strict";
import test from "node:test";

import { activityFormSchema } from "../../src/features/activities/schemas/activity.schema";
import type { ActivityFormInput } from "../../src/features/activities/types/activity-form.types";
import { normalizeActivityCommercialFields } from "../../src/features/activities/utils/activity-commercial-fields";

function validActivity(): ActivityFormInput {
  return {
    academic_hours: "",
    additional_info: "",
    banner_path: "",
    capacity: "",
    certificate_general_price: "0",
    certificate_member_price: "0",
    certificate_mode: "none",
    category_id: "",
    contact_id: "",
    dates: [{ ends_at: "2026-09-22T11:30", label: "Día 1", sort_order: 0, starts_at: "2026-09-22T10:00" }],
    description: "Descripción válida para el evento de prueba.",
    duration_text: "",
    general_price: "0",
    id: "",
    is_free: true,
    is_listed: true,
    member_price: "0",
    member_free_passes_per_company: "0",
    members_only: false,
    modality: "in_person",
    objective: "",
    payment_note: "",
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

test("solo eventos pueden quedar no listados y los exclusivos pagados requieren precio", () => {
  assert.equal(activityFormSchema.safeParse({ ...validActivity(), is_listed: false }).success, true);
  assert.equal(activityFormSchema.safeParse({ ...validActivity(), type: "training", is_listed: false }).success, false);
  const exclusive = { ...validActivity(), members_only: true, is_free: false, status: "published" as const };
  assert.equal(activityFormSchema.safeParse({ ...exclusive, member_price: "0" }).success, false);
});

test("una actividad exclusiva no admite precio general y publica solo con precio de asociado positivo", () => {
  for (const type of ["event", "training"] as const) {
    const exclusive = {
      ...validActivity(), contact_id: "7e000000-0000-4000-8000-000000000001",
      general_price: "0", is_free: false, member_price: "30", members_only: true,
      payment_note: "Coordina el pago con la CCI.", status: "published" as const,
      type, venue_id: "7e000000-0000-4000-8000-000000000002",
    };
    assert.equal(activityFormSchema.safeParse(exclusive).success, true);
    assert.equal(activityFormSchema.safeParse({ ...exclusive, general_price: "40" }).success, false);
    assert.equal(activityFormSchema.safeParse({ ...exclusive, member_price: "0" }).success, false);
    assert.equal(activityFormSchema.safeParse({ ...exclusive, status: "draft", member_price: "0" }).success, true);
  }
});

test("una actividad abierta pagada requiere ambos precios positivos al publicar", () => {
  for (const type of ["event", "training"] as const) {
    const paid = {
      ...validActivity(), contact_id: "7e000000-0000-4000-8000-000000000001",
      general_price: "40", is_free: false, member_price: "30",
      payment_note: "Coordina el pago con la CCI.", status: "published" as const,
      type, venue_id: "7e000000-0000-4000-8000-000000000002",
    };
    assert.equal(activityFormSchema.safeParse(paid).success, true);
    assert.equal(activityFormSchema.safeParse({ ...paid, general_price: "0" }).success, false);
    assert.equal(activityFormSchema.safeParse({ ...paid, member_price: "0" }).success, false);
    assert.equal(activityFormSchema.safeParse({ ...paid, status: "draft", general_price: "0", member_price: "0" }).success, true);
  }
});

test("un certificado opcional exclusivo usa el mismo precio solo para asociados", () => {
  const exclusive = {
    ...validActivity(), certificate_general_price: "25", certificate_member_price: "25",
    certificate_mode: "optional_paid" as const, members_only: true,
  };
  assert.equal(activityFormSchema.safeParse(exclusive).success, true);
  assert.equal(activityFormSchema.safeParse({ ...exclusive, certificate_general_price: "40" }).success, false);
});

test("normaliza únicamente precios y horas aplicables al guardar", () => {
  const base = { ...validActivity(), is_free: false, general_price: "40", member_price: "30", payment_note: "Transferencia" };
  assert.deepEqual(normalizeActivityCommercialFields({ ...base, is_free: true }).general_price, "0");
  assert.deepEqual(normalizeActivityCommercialFields({ ...base, is_free: true }).member_price, "0");
  assert.equal(normalizeActivityCommercialFields({ ...base, is_free: true }).payment_note, null);

  const exclusive = normalizeActivityCommercialFields({
    ...base, members_only: true, certificate_mode: "optional_paid",
    certificate_general_price: "50", certificate_member_price: "25", academic_hours: "3",
  });
  assert.equal(exclusive.general_price, "0");
  assert.equal(exclusive.member_price, "30");
  assert.equal(exclusive.certificate_general_price, "25");
  assert.equal(exclusive.academic_hours, "3");

  assert.equal(normalizeActivityCommercialFields({ ...base, academic_hours: "3" }).academic_hours, null);
  assert.equal(normalizeActivityCommercialFields({ ...base, academic_hours: "3", status: "archived" }).academic_hours, "3");
});

test("los pases solo se guardan en eventos exclusivos pagados", () => {
  const exclusive = {
    ...validActivity(), is_free: false, members_only: true,
    member_price: "40", member_free_passes_per_company: "2",
  };
  assert.equal(activityFormSchema.safeParse(exclusive).success, true);
  assert.equal(normalizeActivityCommercialFields(exclusive).member_free_passes_per_company, "2");
  assert.equal(normalizeActivityCommercialFields({ ...exclusive, is_free: true }).member_free_passes_per_company, "0");
  assert.equal(normalizeActivityCommercialFields({ ...exclusive, members_only: false }).member_free_passes_per_company, "0");
  assert.equal(normalizeActivityCommercialFields({ ...exclusive, type: "training" }).member_free_passes_per_company, "0");
  assert.equal(activityFormSchema.safeParse({ ...exclusive, member_free_passes_per_company: "1.5" }).success, false);
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

test("acepta un certificado incluido sin precios adicionales", () => {
  const result = activityFormSchema.safeParse({ ...validActivity(), certificate_mode: "included" });
  assert.equal(result.success, true);
});

test("valida los precios de un certificado opcional", () => {
  const valid = activityFormSchema.safeParse({
    ...validActivity(),
    certificate_general_price: "50",
    certificate_member_price: "35",
    certificate_mode: "optional_paid",
  });
  const invalid = activityFormSchema.safeParse({
    ...validActivity(),
    certificate_general_price: "35",
    certificate_member_price: "50",
    certificate_mode: "optional_paid",
  });
  assert.equal(valid.success, true);
  assert.equal(invalid.success, false);
});

test("permite guardar borradores virtuales sin enlace", () => {
  const result = activityFormSchema.safeParse({
    ...validActivity(),
    modality: "virtual",
  });
  assert.equal(result.success, true);
});

test("exige enlace HTTPS al publicar actividades virtuales e híbridas", () => {
  for (const modality of ["virtual", "hybrid"] as const) {
    const withoutUrl = activityFormSchema.safeParse({
      ...validActivity(),
      contact_id: "7e000000-0000-4000-8000-000000000001",
      modality,
      status: "published",
      venue_id: modality === "hybrid" ? "7e000000-0000-4000-8000-000000000002" : "",
    });
    assert.equal(withoutUrl.success, false);

    const withUrl = activityFormSchema.safeParse({
      ...validActivity(),
      contact_id: "7e000000-0000-4000-8000-000000000001",
      modality,
      status: "published",
      venue_id: modality === "hybrid" ? "7e000000-0000-4000-8000-000000000002" : "",
      virtual_url: "https://meet.example.test/sesion",
    });
    assert.equal(withUrl.success, true);
  }
});

test("exige indicaciones de pago al publicar eventos y capacitaciones pagados", () => {
  for (const type of ["event", "training"] as const) {
    for (const membersOnly of [false, true]) {
      const paid = {
        ...validActivity(),
        contact_id: "7e000000-0000-4000-8000-000000000001",
        general_price: membersOnly ? "0" : "40",
        is_free: false,
        member_price: "30",
        members_only: membersOnly,
        status: "published" as const,
        type,
        venue_id: "7e000000-0000-4000-8000-000000000002",
      };
      const missing = activityFormSchema.safeParse(paid);
      assert.equal(missing.success, false);
      if (!missing.success) assert.ok(missing.error.flatten().fieldErrors.payment_note?.length);
      assert.equal(activityFormSchema.safeParse({ ...paid, payment_note: "Coordina el pago con la CCI." }).success, true);
      assert.equal(activityFormSchema.safeParse({ ...paid, status: "draft" }).success, true);
    }
  }
});

test("limita las indicaciones a 600 caracteres sin exigirlas en actividades gratuitas", () => {
  assert.equal(activityFormSchema.safeParse({ ...validActivity(), payment_note: "x".repeat(601) }).success, false);
  assert.equal(activityFormSchema.safeParse({ ...validActivity(), payment_note: "" }).success, true);
});
