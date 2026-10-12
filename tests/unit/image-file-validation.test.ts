import assert from "node:assert/strict";
import test from "node:test";

import { MAX_FORM_IMAGE_SIZE } from "../../src/features/media/constants/image-upload.constants";
import { validateFormImage } from "../../src/features/media/utils/image-file-validation";

test("acepta imágenes permitidas de hasta 5 MB", () => {
  assert.equal(validateFormImage({ size: MAX_FORM_IMAGE_SIZE, type: "image/png" }, "La fotografía"), null);
});

test("explica el tamaño real cuando una imagen supera 5 MB", () => {
  assert.equal(
    validateFormImage({ size: 6 * 1024 * 1024, type: "image/jpeg" }, "La fotografía"),
    "La fotografía pesa 6.0 MB. El máximo permitido es 5 MB.",
  );
});

test("rechaza formatos de imagen no admitidos", () => {
  assert.equal(
    validateFormImage({ size: 500_000, type: "image/gif" }, "La portada"),
    "La portada debe ser JPG, PNG o WebP.",
  );
});
