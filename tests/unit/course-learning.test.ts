import assert from "node:assert/strict";
import test from "node:test";

import { getCourseLearningUrl, getInitialLearningSelection } from "../../src/features/courses/utils/course-learning";

const modules = [{ id: "module-1", sort_order: 0 }, { id: "module-2", sort_order: 1 }];
const lessons = [
  { id: "lesson-1", is_required: true, module_id: "module-1", sort_order: 0 },
  { id: "lesson-2", is_required: true, module_id: "module-2", sort_order: 0 },
];
const quizzes = [{ isPassed: false, moduleId: "module-1" }];

test("uses a valid deep-linked lesson", () => {
  assert.deepEqual(getInitialLearningSelection({ lessons, modules, progress: [], quizzes, requestedLessonId: "lesson-2" }), { kind: "lesson", lessonId: "lesson-2" });
});

test("ignores invalid parameters and chooses the first required pending lesson", () => {
  assert.deepEqual(getInitialLearningSelection({ lessons, modules, progress: [], quizzes, requestedLessonId: "missing" }), { kind: "lesson", lessonId: "lesson-1" });
});

test("chooses a pending quiz after all required lessons are complete", () => {
  const progress = lessons.map((lesson) => ({ is_completed: true, lesson_id: lesson.id }));
  assert.deepEqual(getInitialLearningSelection({ lessons, modules, progress, quizzes }), { kind: "quiz", moduleId: "module-1" });
});

test("falls back to the first published lesson when the course is complete", () => {
  const progress = lessons.map((lesson) => ({ is_completed: true, lesson_id: lesson.id }));
  assert.deepEqual(getInitialLearningSelection({ lessons, modules, progress, quizzes: [{ isPassed: true, moduleId: "module-1" }] }), { kind: "lesson", lessonId: "lesson-1" });
});

test("returns null for courses without lessons or pending quizzes", () => {
  assert.equal(getInitialLearningSelection({ lessons: [], modules, progress: [], quizzes: [] }), null);
});

test("builds mutually exclusive lesson and quiz deep links", () => {
  assert.equal(getCourseLearningUrl("course-1", { kind: "lesson", lessonId: "lesson-1" }), "/campus/cursos/course-1?clase=lesson-1");
  assert.equal(getCourseLearningUrl("course-1", { kind: "quiz", moduleId: "module-1" }, "resources"), "/campus/cursos/course-1?quiz=module-1&panel=recursos");
});
