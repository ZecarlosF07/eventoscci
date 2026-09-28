import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";

import { AutoFilterForm } from "../../src/features/admin-filters/components/AutoFilterForm";
import { ADMIN_SEARCH_DELAY_MS, buildFilterUrl, filterDateError } from "../../src/features/admin-filters/utils/filter-url";
import { parseParticipationFilters } from "../../src/features/participation/utils/participation-filters";
import { parseParticipantFilters } from "../../src/features/participants/utils/participant-filters";
import { parseActivityRegistrationFilters } from "../../src/features/registrations/utils/admin-registration-filters";
import { parseCertificateCandidateFilters } from "../../src/features/certificates/utils/certificate-admin-filters";
import { parseNotificationFilters } from "../../src/features/notifications/utils/notification-filters";
import { escapePostgrestSearch } from "../../src/utils/postgrest-search";
import { csvCell } from "../../src/utils/csv-cell";
import { removeProcessedSelections, toggleWorkspaceSelection } from "../../src/features/admin-filters/utils/workspace-selection";
import { applyRegistrationFilters } from "../../src/features/registrations/queries/apply-registration-filters";
import { renderAdminFilters } from "./fixtures/admin-router";

test("automatic filters debounce 350ms and preserve context while resetting pagination", () => {
  assert.equal(ADMIN_SEARCH_DELAY_MS, 350);
  assert.equal(buildFilterUrl("/admin/actividades/eventos", "vista=archivados&pagina=8&resultado=ok", { q: " Ana María ", estado: "" }), "/admin/actividades/eventos?vista=archivados&q=Ana+Mar%C3%ADa");
});
test("payment filters preserve open detail and reset only the relevant section", () => {
  const url = buildFilterUrl("/admin/inscripciones/evento/pagos", "pagina=3&pagina_certificados=8&solicitud=123", { estado_certificado: "complete" }, ["pagina_certificados"]);
  assert.match(url, /pagina=3/); assert.match(url, /solicitud=123/); assert.doesNotMatch(url, /pagina_certificados/);
});
test("query-log outcome is a filter, not a transient action result", () => {
  assert.match(buildFilterUrl("/admin/certificados/consultas", "resultado=found", { resultado: "found", desde: "2026-09-01" }), /resultado=found/);
});
test("invalid date range is explained instead of submitting", () => {
  assert.match(filterDateError({ desde: "2026-10-02", hasta: "2026-10-01" }), /posterior/);
  assert.equal(filterDateError({ desde: "2026-10-01", hasta: "2026-10-02" }), "");
  assert.match(filterDateError({ desde: "2026-02-30" }), /Desde/);
  assert.match(filterDateError({ hasta: "2026-0" }), /Hasta/);
});

test("selection is deduplicated, unaffected by visibility, and only successful IDs are removed", () => {
  const first = { id: "one", name: "Primera" }, second = { id: "two", name: "Segunda" };
  const selected = toggleWorkspaceSelection(toggleWorkspaceSelection([], first, true), second, true);
  assert.deepEqual(toggleWorkspaceSelection(selected, first, true), selected);
  assert.deepEqual(removeProcessedSelections(selected, ["one"]), [second]);
  assert.deepEqual(selected, [first, second]);
  assert.deepEqual(removeProcessedSelections(selected), []);
});
test("CSV cells cannot execute formulas, even after whitespace", () => {
  assert.equal(csvCell(" =SUM(A1:A2)"), '"\' =SUM(A1:A2)"');
  assert.equal(csvCell("CCI-123"), '"CCI-123"');
});
test("registration list and export share profile and full-name literal criteria", () => {
  const calls: unknown[][] = [];
  const query = { eq: (column: string, value: string) => { calls.push(["eq", column, value]); return query; },
    in: (column: string, values: string[]) => { calls.push(["in", column, values]); return query; },
    is: () => query, not: () => query, or: () => query,
    ilike: (column: string, value: string) => { calls.push(["ilike", column, value]); return query; } };
  applyRegistrationFilters(query, { profile: "student", query: "Ana María%_", statusScope: "active" });
  assert.ok(calls.some((call) => call[1] === "participant_profile" && call[2] === "student"));
  assert.ok(calls.some((call) => call[1] === "search_text" && call[2] === "%Ana María\\%\\_%"));
});
test("period and unpaid filter combine; legacy links stay compatible", async () => {
  const current = await parseParticipationFilters(Promise.resolve({ periodo: "upcoming", pagos: "1" }));
  assert.equal(current.period, "upcoming"); assert.equal(current.paymentsOnly, true);
  const legacy = await parseParticipationFilters(Promise.resolve({ periodo: "payments" }));
  assert.equal(legacy.period, "all"); assert.equal(legacy.paymentsOnly, true);
});
test("profiles are independent from membership", async () => {
  assert.equal((await parseParticipantFilters(Promise.resolve({ perfil: "student" }))).profile, "student");
  assert.equal((await parseParticipantFilters(Promise.resolve({ perfil: "member" }))).profile, undefined);
  const filters = await parseActivityRegistrationFilters(Promise.resolve({ perfil: "professional", tipo: "member" }), "activity");
  assert.equal(filters.profile, "professional"); assert.equal(filters.registrationType, "member");
});
test("certificate and notification filters validate states", () => {
  assert.equal(parseCertificateCandidateFilters({ emision: "ready" }).emissionState, "ready");
  assert.equal(parseCertificateCandidateFilters({ emision: "bad" }).emissionState, "all");
  assert.equal(parseNotificationFilters({ estado: "failed" }).status, "failed");
  assert.equal(parseNotificationFilters({ evento: "bad" }).eventType, undefined);
});
test("wildcards, backslashes and punctuation remain literal", () => {
  assert.equal(escapePostgrestSearch("  Empresa 100%_X "), "Empresa 100\\%\\_X");
  assert.equal(escapePostgrestSearch("A,B (C)"), "A,B (C)");
  assert.equal(escapePostgrestSearch("A\\B"), "A\\\\B");
});
test("filter UI has accessible status and clear action without apply button", () => {
  const markup = renderAdminFilters(createElement(AutoFilterForm, {}, createElement("input", { name: "q" })));
  assert.match(markup, /aria-live="polite"/); assert.match(markup, /Limpiar filtros/); assert.doesNotMatch(markup, /type="submit"/);
});
test("compact filters share one toolbar and retain secondary controls when collapsed", () => {
  const markup = renderAdminFilters(createElement(AutoFilterForm, {
    moreFilters: { names: ["perfil"], children: createElement("select", { name: "perfil", defaultValue: "" }, createElement("option", { value: "" }, "Todos")) },
  }, createElement("input", { name: "q" })));
  assert.match(markup, /gap-x-3 gap-y-2 rounded-2xl/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /aria-controls="[^"]+"/);
  assert.match(markup, /name="perfil"/);
  assert.match(markup, /class="hidden gap-3/);
  assert.equal((markup.match(/Limpiar filtros/g) ?? []).length, 1);
  assert.doesNotMatch(markup, /<details|border-t border-cci-100 pt-3/);
});
test("secondary filters are visible on saved links with active criteria", () => {
  const markup = renderAdminFilters(createElement(AutoFilterForm, {
    moreFilters: { names: ["perfil"], children: createElement("select", { name: "perfil" }) },
  }), "perfil=student");
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /Más filtros · 1 activo/);
  assert.match(markup, /Quitar filtro Perfil/);
});
