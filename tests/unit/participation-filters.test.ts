import assert from "node:assert/strict";
import test from "node:test";

import { parseParticipationFilters } from "../../src/features/participation/utils/participation-filters";
import { parseActivityRegistrationFilters } from "../../src/features/registrations/utils/admin-registration-filters";

test("la vista de participación inicia con actividades próximas", async () => {
  const filters = await parseParticipationFilters(Promise.resolve({}));
  assert.deepEqual(filters, { activityType: undefined, page: 1, period: "upcoming", query: undefined });
});

test("el detalle inicia mostrando inscripciones activas", async () => {
  const filters = await parseActivityRegistrationFilters(Promise.resolve({}), "activity-id");
  assert.equal(filters.status, undefined);
  assert.equal(filters.statusScope, "active");
  assert.equal(filters.activityId, "activity-id");
});

test("el historial completo se distingue de las inscripciones activas", async () => {
  const filters = await parseActivityRegistrationFilters(
    Promise.resolve({ estado: "all", pagina: "2", tipo: "member" }),
    "activity-id",
  );
  assert.equal(filters.statusScope, "all");
  assert.equal(filters.registrationType, "member");
  assert.equal(filters.page, 2);
});
