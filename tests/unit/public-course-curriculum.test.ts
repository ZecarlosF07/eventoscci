import assert from "node:assert/strict";
import test from "node:test";

import { publicCourseCurriculumSchema } from "../../src/features/courses/schemas/public-course-curriculum.schema";

const safeCurriculum = [{
  description: "Introducción",
  id: "6e000000-0000-4000-8000-000000000001",
  lessons: [{ duration_seconds: 300, is_required: true, sort_order: 0, title: "Bienvenida" }],
  sort_order: 0,
  title: "Fundamentos",
}];

test("accepts the public curriculum contract", () => {
  assert.equal(publicCourseCurriculumSchema.safeParse(safeCurriculum).success, true);
});

test("rejects unexpected video fields in the public curriculum", () => {
  const unsafe = structuredClone(safeCurriculum);
  const lesson = { ...unsafe[0].lessons[0], video_storage_path: "private/video.mp4" };
  unsafe[0].lessons[0] = lesson;
  assert.equal(publicCourseCurriculumSchema.safeParse(unsafe).success, false);
});
