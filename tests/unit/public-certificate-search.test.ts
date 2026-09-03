import assert from "node:assert/strict";
import test from "node:test";

import type { ActivityListItem } from "@/features/activities/types/activity.types";
import { publicCertificateDniSchema } from "@/features/certificates/schemas/public-certificate-search.schema";
import { selectCertificateRecommendationCandidates } from "@/features/certificates/utils/select-certificate-recommendations";

function activity(id: string, options: Partial<ActivityListItem> = {}): ActivityListItem {
  return {
    banner_path: null,
    capacity: null,
    category: { id: "other", name: "Otra", slug: "otra" },
    dates: [{ deleted_at: null, starts_at: "2026-10-01T14:00:00Z" }] as ActivityListItem["dates"],
    general_price: 0,
    id,
    is_free: true,
    member_price: 0,
    members_only: false,
    modality: "virtual",
    published_at: "2026-08-01T00:00:00Z",
    registration_close_at: "2026-09-30T00:00:00Z",
    registration_open_at: "2026-08-01T00:00:00Z",
    registrations_closed_manually: false,
    short_description: null,
    slug: id,
    status: "published",
    title: id,
    type: "training",
    ...options,
  };
}

test("acepta únicamente DNI peruanos de ocho dígitos", () => {
  assert.equal(publicCertificateDniSchema.safeParse("12345678").success, true);
  assert.equal(publicCertificateDniSchema.safeParse("1234567").success, false);
  assert.equal(publicCertificateDniSchema.safeParse("1234567A").success, false);
});

test("prioriza la categoría certificada y completa con próximas actividades", () => {
  const related = activity("related", {
    category: { id: "management", name: "Gestión", slug: "gestion" },
    dates: [{ deleted_at: null, starts_at: "2026-10-20T14:00:00Z" }] as ActivityListItem["dates"],
  });
  const upcoming = activity("upcoming", {
    dates: [{ deleted_at: null, starts_at: "2026-09-10T14:00:00Z" }] as ActivityListItem["dates"],
  });
  const selected = selectCertificateRecommendationCandidates({
    activities: [upcoming, related],
    context: { source_activity_id: "source", source_activity_type: "training", source_category_id: "management" },
    now: new Date("2026-09-01T12:00:00Z"),
  });
  assert.deepEqual(selected.map(({ id }) => id), ["related", "upcoming"]);
});

test("excluye la actividad original, cerradas y sin fecha futura", () => {
  const source = activity("source");
  const closed = activity("closed", { registrations_closed_manually: true });
  const past = activity("past", { dates: [{ deleted_at: null, starts_at: "2026-08-01T14:00:00Z" }] as ActivityListItem["dates"] });
  const selected = selectCertificateRecommendationCandidates({
    activities: [source, closed, past],
    context: { source_activity_id: "source", source_activity_type: "training", source_category_id: null },
    now: new Date("2026-09-01T12:00:00Z"),
  });
  assert.deepEqual(selected, []);
});
