import assert from "node:assert/strict";
import test from "node:test";

import { MAX_COURSE_MATERIAL_SIZE } from "../../src/features/courses/constants/course.constants";
import { validateCourseMaterialFile } from "../../src/features/courses/utils/course-material-file-validation";

test("acepta imágenes permitidas como materiales de hasta 50 MB", () => {
  assert.equal(
    validateCourseMaterialFile({ size: MAX_COURSE_MATERIAL_SIZE, type: "image/webp" }),
    null,
  );
});

test("explica el tamaño real de una imagen que supera el límite de materiales", () => {
  assert.equal(
    validateCourseMaterialFile({ size: 52 * 1024 * 1024, type: "image/png" }),
    "La imagen pesa 52.0 MB. El máximo permitido es 50 MB.",
  );
});

test("rechaza imágenes con formatos no admitidos como material", () => {
  assert.equal(
    validateCourseMaterialFile({ size: 500_000, type: "image/gif" }),
    "La imagen debe ser JPG, PNG o WebP.",
  );
});
