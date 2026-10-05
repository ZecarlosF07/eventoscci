import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ActivityInformation } from "@/features/activities/components/ActivityInformation";
import { ActivityLocationMap } from "@/features/activities/components/ActivityLocationMap";
import { getEventCatalogArguments } from "@/features/activities/utils/event-catalog-arguments";
import { isReservedEventSlug } from "@/features/activities/utils/slugify";
import { HomeIntroduction } from "@/features/home/components/HomeIntroduction/HomeIntroduction";
import { buildActivityJsonLd, serializeJsonLd } from "@/features/seo/utils/json-ld";
import { getActivityOffer } from "@/features/seo/utils/activity-structured-data";
import { seoActivity } from "./fixtures/seo-activity";

const pageUrl = "https://eventosycursos.camaraica.org.pe/eventos/encuentro";
const now = Date.parse("2026-10-05T15:00:00Z");
const structured = (activity = seoActivity()) => buildActivityJsonLd({ activity, image: null, now, pageUrl });

test("retira ofertas de eventos vencidos aunque sigan publicados y no inventa estados", () => {
  const past = seoActivity({ dates: [{ ...seoActivity().dates[0], starts_at: "2026-09-01T15:00:00Z", ends_at: "2026-09-01T18:00:00Z" }] });
  assert.equal(structured(past).offers, undefined);
  const finished = structured({ ...past, status: "finished" });
  assert.equal(finished.eventStatus, undefined);
  assert.equal(serializeJsonLd(finished).includes("EventCompleted"), false);
  assert.equal(finished.endDate, "2026-09-01T13:00:00-05:00");
});

test("ofertas coherentes con preventa, frontera de Lima y cupos reales", () => {
  const input = { activity: seoActivity(), image: null, pageUrl, now };
  assert.equal(getActivityOffer(input)?.price, 160);
  assert.equal(getActivityOffer(input)?.validThrough, "2026-10-20T23:59:59-05:00");
  assert.equal(getActivityOffer({ ...input, now: Date.parse("2026-10-21T05:00:00Z") })?.price, 170);
  assert.equal(getActivityOffer({ ...input, activity: seoActivity({ members_only: true }) })?.price, 140);
  assert.equal(getActivityOffer({ ...input, availability: { is_open: false, reason: "full", remaining_capacity: 0 } })?.availability, "https://schema.org/SoldOut");
  assert.equal(getActivityOffer({ ...input, activity: seoActivity({ registrations_closed_manually: true }) }), undefined);
  assert.equal(getActivityOffer({ ...input, activity: seoActivity({ registration_open_at: "2026-10-10T00:00:00Z" }) }), undefined);
  assert.equal(getActivityOffer({ ...input, availability: { is_open: false, reason: "closed", remaining_capacity: 5 } }), undefined);
});

test("calcula el fin usando todas las sesiones y excluye fechas eliminadas", () => {
  const date = seoActivity().dates[0];
  const activity = seoActivity({ dates: [
    { ...date, ends_at: "2026-11-10T22:00:00Z" },
    { ...date, starts_at: "2026-11-02T20:00:00Z", ends_at: "2026-11-02T22:00:00Z" },
    { ...date, starts_at: "2026-12-01T20:00:00Z", ends_at: "2026-12-01T22:00:00Z", deleted_at: "2026-10-01T00:00:00Z" },
  ] });
  assert.equal(structured(activity).endDate, "2026-11-10T17:00:00-05:00");
});

test("incluye ponentes reales en el evento y sus sesiones, sin inventarlos cuando faltan", () => {
  const activity = seoActivity();
  activity.dates.push({ ...activity.dates[0], id: "session-two", starts_at: "2026-11-02T20:00:00Z" });
  activity.speakers.push({
    id: "speaker", first_names: "Ana", last_names: "Pérez", bio: null,
    linkedin_url: null, organization: null, photo_path: null, professional_title: null,
    specialties: [], website_url: null, roleLabel: "Ponente", sortOrder: 0,
  });
  const markup = structured(activity);
  const expected = [{ "@type": "Person", name: "Ana Pérez" }];
  assert.deepEqual(markup.performer, expected);
  const sessions = markup.subEvent;
  assert.ok(Array.isArray(sessions));
  for (const session of sessions) assert.deepEqual(session.performer, expected);
  assert.equal(structured(seoActivity()).performer, undefined);
});

test("no atribuye la sede institucional a un evento sin ubicación y conserva modalidad virtual", () => {
  assert.equal(structured(seoActivity({ venue: null })).location, undefined);
  assert.deepEqual(structured(seoActivity({ modality: "virtual", venue: null })).location, { "@type": "VirtualLocation", url: pageUrl });
  assert.equal(structured(seoActivity({ members_only: true }))["@type"], "Event");
});

test("programa y dirección del evento permanecen en HTML sin depender de imágenes o mapa", () => {
  const activity = seoActivity();
  const html = renderToStaticMarkup(createElement(ActivityInformation, { activity }));
  assert.match(html, /09:00 Apertura/);
  const location = renderToStaticMarkup(createElement(ActivityLocationMap, { activity }));
  assert.match(location, /Calle Principal 100/);
  assert.equal(location.includes("<iframe"), false);
  const training = { ...activity, type: "training" as const };
  assert.equal(renderToStaticMarkup(createElement(ActivityInformation, { activity: training })).includes("09:00 Apertura"), false);
  assert.equal(renderToStaticMarkup(createElement(ActivityLocationMap, { activity: training })), "");
  assert.equal(structured(training)["@type"], "Event");
});

test("inicio conserva un H1 permanente al compactar el buscador", () => {
  const html = renderToStaticMarkup(createElement(HomeIntroduction));
  assert.equal((html.match(/<h1/g) ?? []).length, 1);
  assert.match(html, /Eventos, capacitaciones y cursos en Ica, Perú/);
});

test("reserva slug normalizado del historial", () => {
  assert.equal(isReservedEventSlug(" Realizados "), true);
  assert.equal(isReservedEventSlug("encuentro-realizado"), false);
});

test("valida argumentos públicos, conserva filtros vacíos y rechaza páginas o fechas inválidas", () => {
  assert.equal(getEventCatalogArguments("past", { page: 1, category: "", date: "" })?.p_page, 1);
  assert.equal(getEventCatalogArguments("past", { page: Infinity }), null);
  assert.equal(getEventCatalogArguments("past", { page: 1.5 }), null);
  assert.equal(getEventCatalogArguments("past", { page: 1, date: "2026-02-30" }), null);
  assert.equal(getEventCatalogArguments("past", { page: 1, category: "invalid" }), null);
  assert.equal(getEventCatalogArguments("past", { page: 1 }, 13), null);
  assert.equal(getEventCatalogArguments("past", { page: 1, price: "paid" })?.p_is_free, false);
});
