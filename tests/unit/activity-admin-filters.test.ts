import assert from "node:assert/strict";
import test from "node:test";

import { parseAdminFilters } from "../../src/features/activities/types/activity-page.types";

test("la vista administrativa excluye archivados de forma predeterminada", () => {
  assert.deepEqual(parseAdminFilters({}, "event"), {
    page: 1,
    query: undefined,
    status: undefined,
    type: "event",
    view: "active",
  });
});

test("normaliza la vista explícita de archivados", () => {
  const filters = parseAdminFilters({ pagina: "2", q: "encuentro", vista: "archivados" }, "event");

  assert.equal(filters.page, 2);
  assert.equal(filters.query, "encuentro");
  assert.equal(filters.status, undefined);
  assert.equal(filters.view, "archived");
});

test("mantiene compatibilidad con enlaces antiguos de estado archivado", () => {
  const filters = parseAdminFilters({ estado: "archived" }, "training");

  assert.equal(filters.status, undefined);
  assert.equal(filters.view, "archived");
});
