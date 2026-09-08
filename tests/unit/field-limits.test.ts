import assert from "node:assert/strict";
import test from "node:test";

import { FIELD_LIMITS } from "../../src/constants/field-limits";
import { categorySchema, venueSchema } from "../../src/features/catalogs/schemas/catalog.schema";
import { certificateTemplateFormSchema } from "../../src/features/certificates/schemas/certificate.schema";
import { moduleFormSchema } from "../../src/features/courses/schemas/course-content.schema";
import { courseFormSchema } from "../../src/features/courses/schemas/course.schema";
import { quizSaveFormSchema } from "../../src/features/quizzes/schemas/quiz.schema";

const uuid = "10000000-0000-4000-8000-000000000001";

test("rechaza títulos extensos antes de escribir en la base", () => {
  const course = courseFormSchema.safeParse({
    academic_hours: "",
    banner_path: "",
    contents_overview: "",
    description: "Descripción válida para el curso.",
    duration_text: "",
    general_price: "0",
    id: "",
    instructors: [],
    is_free: true,
    member_price: "0",
    objectives: "",
    short_description: "",
    slug: "",
    status: "draft",
    title: "x".repeat(FIELD_LIMITS.courseTitle + 1),
  });
  const moduleResult = moduleFormSchema.safeParse({
    courseId: uuid,
    description: "",
    id: "",
    isPublished: false,
    sortOrder: 0,
    title: "x".repeat(FIELD_LIMITS.contentTitle + 1),
  });
  const quiz = quizSaveFormSchema.safeParse({
    courseId: uuid,
    description: "",
    id: "",
    isPublished: false,
    moduleId: uuid,
    questions: [],
    title: "x".repeat(FIELD_LIMITS.contentTitle + 1),
  });

  assert.equal(course.success, false);
  assert.equal(moduleResult.success, false);
  assert.equal(quiz.success, false);
});

test("aplica los límites de catálogos y plantillas", () => {
  const category = categorySchema.safeParse({
    description: "",
    id: "",
    is_active: true,
    name: "x".repeat(FIELD_LIMITS.categoryName + 1),
    slug: "",
    sort_order: 0,
  });
  const venue = venueSchema.safeParse({
    address: "Av. Principal 123",
    id: "",
    is_active: true,
    maps_embed_url: "https://www.google.com/maps/embed?pb=test",
    name: "x".repeat(FIELD_LIMITS.venueName + 1),
    reference: "",
  });
  const template = certificateTemplateFormSchema.safeParse({
    id: "",
    is_active: true,
    is_default: false,
    name: "x".repeat(FIELD_LIMITS.certificateTemplateName + 1),
    scope: "activity",
    show_date: true,
  });

  assert.equal(category.success, false);
  assert.equal(venue.success, false);
  assert.equal(template.success, false);
});
