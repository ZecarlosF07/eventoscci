import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AttendanceFilters } from "@/features/attendance/components/AttendanceFilters";
import { parseAttendanceFilters } from "@/features/attendance/utils/attendance-filters";
import { ActivityParticipationMetrics } from "@/features/participation/components/ActivityParticipationMetrics/ActivityParticipationMetrics";
import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";
import { renderAdminFilters } from "./fixtures/admin-router";

test("asistencia deja búsqueda y estado principales, con filtros secundarios plegados", async () => {
  const filters = await parseAttendanceFilters(Promise.resolve({}));
  const markup = renderAdminFilters(createElement(AttendanceFilters, { filters, total: 7 }));
  assert.match(markup, /aria-label="Buscar participante"/);
  assert.match(markup, /aria-label="Filtrar por asistencia"/);
  assert.match(markup, /Más filtros/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /class="hidden gap-3/);
  assert.match(markup, /name="estado"/);
  assert.match(markup, /name="tipo"/);
  assert.match(markup, /Confirmadas \(operables\)/);
  assert.doesNotMatch(markup, />Buscar<|>Aplicar<|>Filtrar</);
});

test("confirmadas no cuenta como filtro extra; históricos y pendientes sí se mantienen visibles", async () => {
  const normal = renderAdminFilters(createElement(AttendanceFilters, { filters: await parseAttendanceFilters(Promise.resolve({ estado: "confirmed" })) }), "estado=confirmed");
  assert.match(normal, /aria-expanded="false"/);
  assert.doesNotMatch(normal, /Más filtros · 1 activo/);
  for (const estado of ["all", "pending", "cancelled"]) {
    const query = `estado=${estado}&tipo=member`;
    const filters = await parseAttendanceFilters(Promise.resolve({ estado, tipo: "member" }));
    const markup = renderAdminFilters(createElement(AttendanceFilters, { filters }), query);
    assert.match(markup, /aria-expanded="true"/);
    assert.match(markup, /Más filtros · 2 activos/);
    assert.match(markup, /Quitar filtro Estado/);
    assert.match(markup, /Quitar filtro Tipo/);
  }
});

test("el resumen compacto conserva sus cuatro cifras sin cambiar la vista de inscripciones", () => {
  const activity: ParticipationActivitySummary = { activityId: "test", title: "Prueba", slug: "prueba", type: "event", status: "published", isFree: true,
    lastDate: null, nextDate: null, operationalEndsAt: null, isOperationalUpcoming: false, totalCount: 8, capacity: null, activeCount: 7, pendingCount: 2,
    confirmedCount: 5, cancelledCount: 1, attendedCount: 3, absentCount: 1, attendancePendingCount: 1,
    paymentPendingRequests: 0, paymentPendingSeats: 0, certificatePendingCount: 0 };
  const compact = renderToStaticMarkup(createElement(ActivityParticipationMetrics, { activity, mode: "attendance", compact: true }));
  for (const label of ["Confirmadas", "Sin marcar", "Asistieron", "No asistieron"]) assert.match(compact, new RegExp(label));
  assert.match(compact, /Resumen de asistencia/);
  assert.match(compact, /sm:grid-cols-4/);
  assert.match(compact, /sm:justify-center/);
  assert.doesNotMatch(compact, /text-2xl|bg-white p-4/);
  const regular = renderToStaticMarkup(createElement(ActivityParticipationMetrics, { activity }));
  assert.match(regular, /Resumen de inscripciones/);
  assert.match(regular, /text-2xl/);
});

test("la selección y acciones masivas comparten un bloque y no ocupan espacio sin seleccionados", () => {
  const table = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceTable.tsx", "utf8");
  assert.doesNotMatch(table, /SelectionSummary/);
  const bulk = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceBulkForm.tsx", "utf8");
  assert.match(bulk, /if \(!selected.length\) return message \?/);
  assert.match(bulk, /<SelectionSummary visibleIds=\{visibleIds\} compact/);
  assert.match(bulk, /Añadir nota \(opcional\)/);
  assert.match(bulk, /draftKey="bulk-notes"/);
  assert.match(bulk, /draftKey="bulk-status"/);
  assert.match(bulk, /<SelectedInputs name="attendance_ids"/);
  assert.match(bulk, /disabled=\{pending \|\| busy\}/);
});

test("compactar no quita revisión, protección de ocultos, límites ni guardas del servidor", () => {
  const selection = readFileSync("src/features/admin-filters/components/SelectionWorkspace.tsx", "utf8");
  for (const text of ["Revisar seleccionados", "Limpiar selección", "Quitar", "fuera de esta vista"]) assert.match(selection, new RegExp(text));
  const bulk = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceBulkForm.tsx", "utf8");
  assert.match(bulk, /selected.length > 500/);
  assert.match(bulk, /if \(hidden && !window.confirm/);
  assert.match(bulk, /if \(result.success\) clear\(ids\)/);
  const action = readFileSync("src/features/attendance/mutations/attendance.actions.ts", "utf8");
  assert.match(action, /await requireAdmin\(\)/);
  assert.match(action, /scope.data.length !== parsed.data.attendanceIds.length/);
  assert.match(action, /set_attendance_status/);
});

test("tabla concentra datos en cinco columnas y pliega notas sin quitar el guardado individual", () => {
  const table = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceTable.tsx", "utf8");
  assert.equal((table.match(/<th className/g) ?? []).length, 5);
  assert.match(table, /min-w-\[980px\]/);
  assert.match(table, /Inscripción \/ certificado/);
  assert.match(table, /item.marked_at \? formatRegistrationDate/);
  assert.match(table, /CertificateRequestAdminStatus/);
  const row = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceRowForm.tsx", "utf8");
  assert.match(row, /<details/);
  assert.match(row, /item.notes \? "Ver nota" : "Nota opcional"/);
  assert.match(row, /draftKey=\{`\$\{item.id\}-notes`\}/);
  assert.match(row, /defaultValue=\{item.notes \?\? ""\}/);
  assert.match(row, /updateAttendanceAction.bind\(null, activityId, returnTo\)/);
  assert.match(row, /item.registration.status !== "confirmed"/);
});

test("laptop distribuye selección y acciones en todo el ancho sin agrandar las barras", () => {
  const selection = readFileSync("src/features/admin-filters/components/SelectionWorkspace.tsx", "utf8");
  assert.match(selection, /flex-1 basis-full text-sm font-semibold sm:basis-auto/);
  assert.match(selection, /aria-controls=\{listId\} aria-expanded=\{expanded\}/);
  assert.match(selection, /expanded \? "grid" : "hidden"/);
  assert.doesNotMatch(selection, /compact \? "contents"/);
  const bulk = readFileSync("src/features/attendance/components/AttendanceTable/AttendanceBulkForm.tsx", "utf8");
  assert.match(bulk, /sm:grid-cols-\[minmax\(180px,260px\)_minmax\(0,1fr\)_auto\]/);
  assert.match(bulk, /sm:justify-self-end/);
  assert.match(bulk, /order-3 min-w-0 w-full sm:order-none/);
  assert.doesNotMatch(bulk, /sm:min-w-64|sm:max-w-64/);
});
