import assert from "node:assert/strict";
import test from "node:test";

import { normalizeVideoAssetId } from "../../src/features/courses/utils/video";

test("extracts YouTube identifiers from common links", () => {
  assert.equal(normalizeVideoAssetId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(normalizeVideoAssetId("https://youtu.be/dQw4w9WgXcQ?t=20"), "dQw4w9WgXcQ");
});

test("extracts Vimeo identifiers and preserves direct identifiers", () => {
  assert.equal(normalizeVideoAssetId("https://vimeo.com/76979871"), "76979871");
  assert.equal(normalizeVideoAssetId("76979871"), "76979871");
});
