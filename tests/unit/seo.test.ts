import assert from "node:assert/strict";
import test from "node:test";

import type { ActivityDetail } from "@/features/activities/types/activity.types";
import { createContentSlug } from "@/features/activities/utils/slugify";
import { buildSafeAnalyticsEvent } from "@/features/analytics/utils/analytics-event";
import type { CourseListItem } from "@/features/courses/types/course.types";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import {
  buildActivityJsonLd,
  buildBreadcrumbJsonLd,
  buildCourseListJsonLd,
  serializeJsonLd,
} from "@/features/seo/utils/json-ld";
import { toLimaDateTime } from "@/features/seo/utils/seo-date";
import { buildSeoDescription, buildSeoTitle } from "@/features/seo/utils/seo-text";
import { sanitizePostgrestSearchTerm } from "@/features/seo/utils/postgrest-search";

const SITE_URL = "https://eventosycursos.camaraica.org.pe";

test("normaliza y limita textos SEO sin cortar palabras innecesariamente", () => {
  assert.equal(buildSeoTitle("  Evento   empresarial  "), "Evento empresarial");
  assert.equal(buildSeoDescription("<p>Agenda   empresarial</p>", "Otro"), "Agenda empresarial");
  assert.ok(buildSeoTitle("Una ".repeat(30)).length <= 68);
});

test("añade Ica a la descripción presencial dentro del límite", () => {
  const description = buildSeoDescription("Encuentro para empresas", "", "En Ica, Perú.");
  assert.equal(description, "Encuentro para empresas En Ica, Perú.");
  assert.ok(description.length <= 160);
});

test("publica fechas de actividades con la zona horaria de Lima", () => {
  assert.equal(toLimaDateTime("2026-09-20T20:00:00Z"), "2026-09-20T15:00:00-05:00");
  assert.equal(toLimaDateTime("fecha inválida"), undefined);
});

test("construye canonicales y política de robots coherentes", () => {
  const metadata = buildPageMetadata({
    description: "Evento empresarial en Ica.",
    follow: true,
    index: false,
    path: "/eventos/cancelado",
    title: "Evento cancelado",
  });
  assert.equal(metadata.alternates?.canonical, "/eventos/cancelado");
  assert.deepEqual(metadata.robots, { follow: true, index: false });
});

test("escapa JSON-LD y genera breadcrumbs con URLs absolutas", () => {
  assert.ok(serializeJsonLd({ name: "<script>" }).includes("\\u003cscript>"));
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Eventos", path: "/eventos" },
  ], SITE_URL);
  const elements = breadcrumbs.itemListElement as Array<Record<string, unknown>>;
  assert.equal(elements[1]?.item, `${SITE_URL}/eventos`);
});

test("describe la ubicación de actividades presenciales como Ica, Perú", () => {
  const activity = {
    address: null,
    banner_path: null,
    dates: [{ deleted_at: null, ends_at: "2026-09-20T17:00:00-05:00", starts_at: "2026-09-20T15:00:00-05:00" }],
    description: "Encuentro empresarial abierto al público.",
    general_price: 50,
    is_free: false,
    location_name: null,
    member_price: 30,
    members_only: false,
    modality: "in_person",
    published_at: "2026-08-01T10:00:00-05:00",
    registration_open_at: "2026-08-01T10:00:00-05:00",
    registrations_closed_manually: false,
    short_description: null,
    speakers: [],
    status: "published",
    title: "Encuentro empresarial",
    venue: { address: "Calle Principal 100", id: "venue", maps_embed_url: "https://www.google.com/maps/embed?pb=x", name: "Auditorio", reference: null },
  } as unknown as ActivityDetail;
  const data = buildActivityJsonLd({ activity, image: null, pageUrl: `${SITE_URL}/eventos/encuentro` });
  const location = data.location as Record<string, unknown>;
  const address = location.address as Record<string, unknown>;
  assert.equal(address.addressLocality, "Ica");
  assert.equal(address.addressCountry, "PE");
  assert.equal(data.eventAttendanceMode, "https://schema.org/OfflineEventAttendanceMode");
});

test("publica el listado estructurado únicamente desde tres cursos", () => {
  const course = (slug: string): CourseListItem => ({
    academic_hours: null,
    banner_path: null,
    duration_text: null,
    general_price: 0,
    id: slug,
    instructors: [],
    is_free: true,
    member_price: 0,
    published_at: "2026-08-01T00:00:00Z",
    short_description: "Curso para profesionales",
    slug,
    status: "published",
    title: `Curso ${slug}`,
    updated_at: "2026-08-01T00:00:00Z",
  });
  assert.equal(buildCourseListJsonLd({ courses: [course("uno")], siteUrl: SITE_URL }), null);
  const list = buildCourseListJsonLd({
    courses: [course("uno"), course("dos"), course("tres")],
    siteUrl: SITE_URL,
  });
  assert.equal(list?.["@type"], "ItemList");
});

test("genera slugs editoriales cortos y estables para títulos extensos", () => {
  const slug = createContentSlug("Seminario internacional sobre competitividad empresarial y transformación digital para organizaciones de la región Ica");
  assert.ok(slug.length <= 96);
  assert.equal(slug.endsWith("-"), false);
  assert.equal(createContentSlug("Curso corto"), "curso-corto");
});

test("neutraliza operadores de PostgREST en búsquedas públicas", () => {
  assert.equal(sanitizePostgrestSearchTerm("Ica),status.eq.draft"), "Ica status eq draft");
  assert.equal(sanitizePostgrestSearchTerm("  gestión   empresarial  "), "gestión empresarial");
});

test("la analítica conserva solo parámetros aprobados y descarta PII", () => {
  const event = buildSafeAnalyticsEvent("registration_started", {
    activity_id: "activity-1",
    activity_type: "event",
    email: "persona@example.com",
    document_number: "12345678",
  });
  assert.deepEqual(event.parameters, {
    activity_id: "activity-1",
    activity_type: "event",
  });
});

test("representa sesiones separadas y audiencia restringida en JSON-LD", () => {
  const activity = {
    address: null,
    dates: [
      { deleted_at: null, ends_at: "2026-09-20T17:00:00-05:00", label: "Módulo 1", starts_at: "2026-09-20T15:00:00-05:00" },
      { deleted_at: null, ends_at: "2026-09-27T17:00:00-05:00", label: "Módulo 2", starts_at: "2026-09-27T15:00:00-05:00" },
    ],
    description: "Programa especializado para asociados.",
    general_price: 100,
    is_free: false,
    location_name: null,
    member_price: 50,
    members_only: true,
    modality: "hybrid",
    published_at: "2026-08-01T10:00:00-05:00",
    registration_open_at: "2026-08-01T10:00:00-05:00",
    registrations_closed_manually: false,
    short_description: null,
    speakers: [],
    status: "published",
    title: "Programa para asociados",
    venue: { address: "Calle Principal 100", id: "venue", maps_embed_url: null, name: "Auditorio", reference: null },
  } as unknown as ActivityDetail;
  const data = buildActivityJsonLd({ activity, image: null, pageUrl: `${SITE_URL}/capacitaciones/programa` });
  assert.equal((data.audience as Record<string, unknown>).audienceType, "Asociados de la Cámara de Comercio de Ica");
  assert.equal((data.subEvent as Array<Record<string, unknown>>).length, 2);
  assert.equal(data.eventAttendanceMode, "https://schema.org/MixedEventAttendanceMode");
});
