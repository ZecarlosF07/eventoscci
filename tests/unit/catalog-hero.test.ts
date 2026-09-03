import assert from "node:assert/strict";
import test from "node:test";

import type { ActivityListItem } from "@/features/activities/types/activity.types";
import { createActivityCarouselSlides, createCourseCarouselSlides } from "@/features/catalog/utils/catalog-carousel";
import type { CourseListItem } from "@/features/courses/types/course.types";

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const activity: ActivityListItem = {
  banner_path: null, capacity: null, category: null, general_price: 80,
  id: "event", is_free: false, member_price: 50, members_only: false,
  modality: "virtual", published_at: FUTURE_DATE, registration_close_at: null,
  registration_open_at: null, registrations_closed_manually: false,
  short_description: "Una oportunidad para aprender.", slug: "evento", status: "published",
  title: "Encuentro empresarial", type: "event",
  dates: [{
    activity_id: "event", created_at: FUTURE_DATE, deleted_at: null, deleted_by: null,
    ends_at: null, id: "date", label: null, sort_order: 0,
    starts_at: FUTURE_DATE, updated_at: FUTURE_DATE,
  }],
};

const course: CourseListItem = {
  academic_hours: 20, banner_path: null, duration_text: null, general_price: 120,
  id: "course", instructors: [], is_free: false, member_price: 90,
  published_at: FUTURE_DATE, short_description: null, slug: "curso",
  status: "published", title: "Curso empresarial", updated_at: FUTURE_DATE,
};

test("el banner de eventos conserva la tarifa general y lleva al detalle correcto", () => {
  const [slide] = createActivityCarouselSlides([activity]);
  assert.equal(slide.href, "/eventos/evento");
  assert.equal(slide.ctaLabel, "Conocer el evento");
  assert.match(slide.priceLabel, /80[.,]00/);
  assert.equal(slide.bannerUrl, null);
});

test("las capacitaciones gratuitas tienen su propia acción y precio", () => {
  const [slide] = createActivityCarouselSlides([{ ...activity, type: "training", is_free: true }]);
  assert.equal(slide.href, "/capacitaciones/evento");
  assert.equal(slide.ctaLabel, "Ver la capacitación");
  assert.equal(slide.kindLabel, "Capacitación destacada");
  assert.equal(slide.priceLabel, "Participación gratuita");
});

test("los banners omiten borradores y actividades sin próximas fechas", () => {
  assert.deepEqual(createActivityCarouselSlides([
    { ...activity, status: "draft" },
    { ...activity, dates: [] },
    { ...activity, dates: [{ ...activity.dates[0], deleted_at: FUTURE_DATE }] },
  ]), []);
  assert.deepEqual(createCourseCarouselSlides([{ ...course, status: "draft" }]), []);
});

test("los cursos muestran el acceso, duración y precio sin prometer matrícula directa", () => {
  const [paid] = createCourseCarouselSlides([course]);
  const [free] = createCourseCarouselSlides([{ ...course, is_free: true }]);
  assert.equal(paid.href, "/cursos/curso");
  assert.equal(paid.ctaLabel, "Ver curso y acceso");
  assert.equal(paid.meta, "20 horas académicas");
  assert.match(paid.priceLabel, /120[.,]00/);
  assert.equal(free.priceLabel, "Acceso gratuito");
});

test("el inicio combina eventos y capacitaciones por fecha, con un máximo de cinco destacados", () => {
  const activities: ActivityListItem[] = Array.from({ length: 7 }, (_, index) => ({
    ...activity,
    id: String(index),
    type: index % 2 ? "training" : "event",
    dates: [{
      ...activity.dates[0],
      starts_at: new Date(new Date(FUTURE_DATE).getTime() + index * 86400000).toISOString(),
    }],
  }));
  const slides = createActivityCarouselSlides(activities.toReversed());
  assert.deepEqual(slides.map(({ id }) => id), ["0", "1", "2", "3", "4"]);
  assert.equal(slides[0].kindLabel, "Evento destacado");
  assert.equal(slides[1].kindLabel, "Capacitación destacada");
  assert.deepEqual(createActivityCarouselSlides([]), []);
  assert.equal(createActivityCarouselSlides([activity]).length, 1);
});
