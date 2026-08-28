import assert from "node:assert/strict";
import test from "node:test";

import type {
  ActivityDetail,
  ActivityListItem,
} from "@/features/activities/types/activity.types";
import {
  getWhatsAppUrl,
  normalizeWhatsAppPhone,
} from "@/features/activities/utils/activity-contact";
import { isGoogleMapsEmbedUrl } from "@/features/activities/utils/activity-maps";
import { getLegacyActivityProgram } from "@/features/activities/utils/activity-program";
import { selectRelatedActivities } from "@/features/activities/utils/related-activities";
import { getCountdownParts } from "@/features/registrations/utils/registration-countdown";

test("normaliza números peruanos y conserva números internacionales válidos", () => {
  assert.equal(normalizeWhatsAppPhone("912 070 173"), "51912070173");
  assert.equal(normalizeWhatsAppPhone("+56 9 1234 5678"), "56912345678");
  assert.equal(normalizeWhatsAppPhone("123"), null);
  assert.equal(
    getWhatsAppUrl("912070173", "Encuentro CCI"),
    "https://wa.me/51912070173?text=Hola%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20%E2%80%9CEncuentro%20CCI%E2%80%9D.",
  );
});

test("acepta solamente URLs HTTPS de inserción de Google Maps", () => {
  assert.equal(isGoogleMapsEmbedUrl("https://www.google.com/maps/embed?pb=abc"), true);
  assert.equal(isGoogleMapsEmbedUrl("https://maps.google.com/maps?q=Ica&output=embed"), true);
  assert.equal(isGoogleMapsEmbedUrl("https://www.google.com/maps/place/Ica"), false);
  assert.equal(isGoogleMapsEmbedUrl("http://www.google.com/maps/embed?pb=abc"), false);
  assert.equal(isGoogleMapsEmbedUrl("https://example.com/maps/embed?pb=abc"), false);
});

test("unifica programa y temario heredados sin repetir el mismo texto", () => {
  assert.equal(getLegacyActivityProgram("Módulo 1", "Módulo 1"), "Módulo 1");
  assert.equal(getLegacyActivityProgram("Agenda", "Contenido"), "Agenda\n\nContenido");
  assert.equal(getLegacyActivityProgram(null, null), null);
});

test("calcula el conteo futuro, el último segundo y el vencimiento", () => {
  const now = Date.UTC(2026, 7, 28, 12);
  assert.deepEqual(getCountdownParts(now + 93_784_000, now), {
    days: 1,
    hours: 2,
    minutes: 3,
    seconds: 4,
  });
  assert.deepEqual(getCountdownParts(now + 1_000, now), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 1,
  });
  assert.equal(getCountdownParts(now, now), null);
});

function activity(
  id: string,
  options: Partial<ActivityListItem> = {},
): ActivityListItem {
  return {
    banner_path: null,
    capacity: null,
    category: { id: "category-other", name: "Otra", slug: "otra" },
    dates: [{ deleted_at: null, starts_at: "2026-09-20T14:00:00Z" }] as ActivityListItem["dates"],
    general_price: 0,
    id,
    is_free: true,
    member_price: 0,
    members_only: false,
    modality: "virtual",
    published_at: "2026-08-01T00:00:00Z",
    registration_close_at: "2026-09-19T00:00:00Z",
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

test("prioriza recomendaciones relevantes y excluye actividades cerradas", () => {
  const current = {
    ...activity("current", {
      category: { id: "category-cci", name: "Gestión", slug: "gestion" },
      modality: "hybrid",
      type: "event",
    }),
    speakers: [],
  } as unknown as ActivityDetail;
  const sameCategory = activity("same-category", {
    category: current.category,
    dates: [{ deleted_at: null, starts_at: "2026-10-20T14:00:00Z" }] as ActivityListItem["dates"],
  });
  const sameType = activity("same-type", {
    dates: [{ deleted_at: null, starts_at: "2026-09-01T14:00:00Z" }] as ActivityListItem["dates"],
    type: "event",
  });
  const closed = activity("closed", { registrations_closed_manually: true });
  const selected = selectRelatedActivities(
    [sameType, closed, sameCategory, current],
    current,
    new Date("2026-08-28T12:00:00Z"),
  );

  assert.deepEqual(selected.map(({ id }) => id), ["same-category", "same-type"]);
});
