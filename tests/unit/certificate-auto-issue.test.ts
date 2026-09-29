import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("emisión rápida consulta listos de toda la actividad y limita cada lote", () => {
  const action = readFileSync("src/features/certificates/mutations/certificate-batch.actions.ts", "utf8");
  const constants = readFileSync("src/features/certificates/constants/certificate.constants.ts", "utf8");
  const migration = readFileSync("supabase/migrations/202609290002_resumable_certificate_batches.sql", "utf8");
  assert.match(constants, /CERTIFICATE_AUTO_ISSUE_BATCH_SIZE = 20/);
  assert.match(migration, /order by priority, r\.created_at, r\.id limit 20/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(action, /start_activity_certificate_batch/);
  assert.match(action, /processCertificateBatchItem/);
  assert.match(action, /await requireAdmin\(\)/);
});

test("el botón confirma el envío y la RPC comprueba pago opcional antes de preparar", () => {
  const control = readFileSync("src/features/certificates/components/CertificateBatchControl/CertificateBatchControl.tsx", "utf8");
  const migration = readFileSync("supabase/migrations/202609290001_certificate_bulk_eligibility.sql", "utf8");
  assert.match(control, /form\.reportValidity\(\)/);
  assert.match(control, /window\.confirm\(`/);
  assert.match(control, /Reanudar pendientes/);
  assert.match(control, /role="progressbar"/);
  assert.match(control, /elapsedSeconds/);
  assert.match(migration, /certificate_requested_at is not null/);
  assert.match(migration, /certificate_payment_verified_at is not null/);
  assert.match(migration, /for update of registrations, attendance/);
  assert.match(migration, /certificate_mode = 'none'/);
});

test("cada certificado se recupera con bloqueo y archivo por intento", () => {
  const service = readFileSync("src/features/certificates/services/process-certificate-batch-item.ts", "utf8");
  const migration = readFileSync("supabase/migrations/202609290002_resumable_certificate_batches.sql", "utf8");
  assert.match(service, /claim_activity_certificate_batch_item/);
  assert.match(service, /prepare_activity_certificates/);
  assert.match(service, /claim\.lease_token}\.pdf/);
  assert.match(service, /finalize_activity_certificate_batch_item/);
  assert.match(migration, /lease_until <= now\(\)/);
  assert.match(migration, /activity_certificate_batch_eligible\(v_item\.registration_id\)/);
});
