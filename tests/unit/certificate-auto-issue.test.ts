import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("emisión rápida consulta listos de toda la actividad y limita cada lote", () => {
  const action = readFileSync("src/features/certificates/mutations/certificate.actions.ts", "utf8");
  const constants = readFileSync("src/features/certificates/constants/certificate.constants.ts", "utf8");
  assert.match(constants, /CERTIFICATE_AUTO_ISSUE_BATCH_SIZE = 20/);
  assert.match(action, /formData\.get\("issue_mode"\) === "ready"/);
  assert.match(action, /p_emission_state: "ready"/);
  assert.match(action, /p_limit: CERTIFICATE_AUTO_ISSUE_BATCH_SIZE/);
  assert.match(action, /p_offset: 0/);
  assert.match(action, /await requireAdmin\(\)/);
  assert.match(action, /eq\("activity_id", activityId\)/);
});

test("el botón confirma el envío y la RPC comprueba pago opcional antes de preparar", () => {
  const table = readFileSync("src/features/certificates/components/CertificateCandidatesTable/CertificateCandidatesTable.tsx", "utf8");
  const migration = readFileSync("supabase/migrations/202609290001_certificate_bulk_eligibility.sql", "utf8");
  assert.match(table, /form\.reportValidity\(\)/);
  assert.match(table, /window\.confirm\(`/);
  assert.match(table, /values\.set\("issue_mode", "ready"\)/);
  assert.match(table, /sin depender de la página o los filtros/);
  assert.match(migration, /certificate_requested_at is not null/);
  assert.match(migration, /certificate_payment_verified_at is not null/);
  assert.match(migration, /for update of registrations, attendance/);
  assert.match(migration, /certificate_mode = 'none'/);
});
