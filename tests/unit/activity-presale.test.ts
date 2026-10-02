import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ActivityParticipationPrices } from "@/features/activities/components/ActivityParticipationPrices/ActivityParticipationPrices";
import { activityFormSchema } from "@/features/activities/schemas/activity.schema";
import type { ActivityFormInput } from "@/features/activities/types/activity-form.types";
import { normalizeActivityCommercialFields } from "@/features/activities/utils/activity-commercial-fields";
import { formatPresaleDeadline, getActivityPrice, matchesExpectedPrice, presaleDateToTimestamp, timestampToPresaleDate } from "@/features/activities/utils/activity-pricing";
import { parseActivityFormData } from "@/features/activities/utils/form-data";
import { reuseSubmittedGroup } from "@/features/member-groups/utils/member-group-submission";
import type { MemberGroupInput } from "@/features/member-groups/types/member-group.types";

const cutoff = "2026-10-21T05:00:00.000Z";
const pricing = { type: "event" as const, isFree: false, generalPrice: 170, memberPrice: 150, presaleGeneralPrice: 160, presaleMemberPrice: 140, presaleEndsAt: cutoff };
const form: ActivityFormInput = {
  academic_hours: "", additional_info: "", banner_path: "", capacity: "", category_id: "", certificate_general_price: "0", certificate_member_price: "0", certificate_mode: "none", contact_id: "7e000000-0000-4000-8000-000000000001",
  dates: [{ ends_at: "2026-11-01T12:00", label: "", sort_order: 0, starts_at: "2026-11-01T10:00" }], description: "Descripción para pruebas de preventa.", duration_text: "", general_price: "170", id: "", is_free: false, is_listed: true,
  member_price: "150", member_free_passes_per_company: "0", members_only: false, modality: "virtual", objective: "", payment_note: "Coordina el pago", program: "", program_image_paths: [], registration_close_at: "", registration_open_at: "", registrations_closed_manually: false, short_description: "", slug: "", speakers: [], status: "published", syllabus: "", target_audience: "", title: "Evento de preventa", type: "event", venue_id: "", virtual_url: "https://example.test/reunion",
};

test("la fecha incluye el último día completo de preventa en Lima", () => {
  assert.equal(presaleDateToTimestamp("2026-10-20"), cutoff);
  assert.equal(timestampToPresaleDate(cutoff), "2026-10-20");
  assert.equal(formatPresaleDeadline(cutoff), "20 de octubre");
  for (const invalid of ["2026-02-30", "2026-13-01", "20/10/2026", ""]) assert.equal(presaleDateToTimestamp(invalid), null);
});

test("aplica preventa antes del corte y regular desde el instante exacto", () => {
  assert.equal(getActivityPrice(pricing, "general", Date.parse(cutoff) - 1).amount, 160);
  assert.equal(getActivityPrice(pricing, "member", Date.parse(cutoff) - 1).amount, 140);
  assert.equal(getActivityPrice(pricing, "general", Date.parse(cutoff)).amount, 170);
  assert.equal(getActivityPrice(pricing, "member", Date.parse(cutoff) + 1).amount, 150);
});

test("el público sin preventa usa regular y gratuitos/capacitaciones conservan sus tarifas", () => {
  const now = Date.parse(cutoff) - 1;
  assert.equal(getActivityPrice({ ...pricing, presaleMemberPrice: null }, "member", now).amount, 150);
  assert.equal(getActivityPrice({ ...pricing, presaleEndsAt: null }, "general", now).amount, 170);
  assert.equal(getActivityPrice({ ...pricing, type: "training" }, "general", now).amount, 170);
  assert.equal(getActivityPrice({ ...pricing, isFree: true }, "general", now).amount, 0);
});

test("preventa es opcional; exige configuración completa solo al publicar", () => {
  assert.ok(activityFormSchema.safeParse(form).success);
  const presale = { ...form, presale_general_price: "160", presale_ends_at: "2026-10-20" };
  assert.ok(activityFormSchema.safeParse(presale).success);
  assert.ok(activityFormSchema.safeParse({ ...presale, presale_ends_at: "", status: "draft" }).success);
  assert.equal(activityFormSchema.safeParse({ ...presale, presale_ends_at: "" }).success, false);
  assert.equal(activityFormSchema.safeParse({ ...presale, presale_ends_at: "2026-02-30" }).success, false);
  for (const price of ["0", "-1", "170", "180", "1.005", "NaN", "Infinity", "100000000"]) {
    assert.equal(activityFormSchema.safeParse({ ...presale, presale_general_price: price }).success, false, price);
  }
});

test("exclusivos admiten solo preventa para asociados; capacitaciones no la admiten", () => {
  const exclusive = { ...form, general_price: "0", members_only: true, presale_member_price: "140", presale_ends_at: "2026-10-20" };
  assert.ok(activityFormSchema.safeParse(exclusive).success);
  assert.equal(activityFormSchema.safeParse({ ...exclusive, presale_general_price: "100" }).success, false);
  assert.equal(activityFormSchema.safeParse({ ...form, type: "training", presale_general_price: "160", presale_ends_at: "2026-10-20" }).success, false);
});

test("normaliza campos activos y diferencia omisión antigua de limpieza explícita", () => {
  const input = { ...form, presale_general_price: "160", presale_member_price: "140", presale_ends_at: "2026-10-20" };
  assert.equal(normalizeActivityCommercialFields(input).presale_ends_at, cutoff);
  assert.equal(normalizeActivityCommercialFields({ ...input, members_only: true }).presale_general_price, null);
  for (const inactive of [{ ...input, is_free: true }, { ...input, type: "training" as const }]) {
    const normalized = normalizeActivityCommercialFields(inactive);
    assert.equal(normalized.presale_member_price, null);
    assert.equal(normalized.presale_ends_at, null);
  }
  const legacy = parseActivityFormData(new FormData());
  assert.equal(legacy.presale_ends_at, undefined);
  assert.equal(Object.hasOwn(normalizeActivityCommercialFields(form), "presale_ends_at"), false);
  assert.equal(normalizeActivityCommercialFields({ ...input, presale_general_price: "", presale_member_price: "" }).presale_ends_at, null);
});

test("cotización antigua exige recarga cuando hay preventa y detecta cambio de precio", () => {
  assert.equal(matchesExpectedPrice(undefined, 160, pricing), false);
  assert.equal(matchesExpectedPrice(160, 170, pricing), false);
  assert.equal(matchesExpectedPrice(160, 160, pricing), true);
  assert.equal(matchesExpectedPrice(undefined, 170, { ...pricing, presaleGeneralPrice: null, presaleMemberPrice: null }), true);
});

test("la tarjeta muestra preventa, fecha y regular, y retira la oferta al vencer", () => {
  const props = { pricing, membersOnly: false };
  const before = renderToStaticMarkup(createElement(ActivityParticipationPrices, { ...props, initialNow: Date.parse(cutoff) - 1 }));
  assert.match(before, /preventa/);
  assert.match(before, /20 de octubre/);
  assert.match(before, /160/);
  assert.match(before, /170/);
  const after = renderToStaticMarkup(createElement(ActivityParticipationPrices, { ...props, initialNow: Date.parse(cutoff) }));
  assert.doesNotMatch(after, /preventa|160|140/);
  assert.match(after, /precio regular/);
});

test("un reintento grupal conserva la cotización anterior si solo cambió el reloj", () => {
  const submitted: MemberGroupInput = { attendees: [], billing: null, expected_free_count: 0, expected_unit_price: 140, future_topics_suggestion: "", ruc: "20123456789" };
  assert.equal(reuseSubmittedGroup({ ...submitted, expected_unit_price: 150 }, submitted), submitted);
  const edited = { ...submitted, future_topics_suggestion: "Otro tema" };
  assert.equal(reuseSubmittedGroup(edited, submitted), edited);
});
