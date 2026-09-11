import assert from "node:assert/strict";
import test from "node:test";

import { getCertificateCommercialStatus } from "../../src/features/registrations/utils/certificate-commercial-status";

const baseInput = {
  attendanceStatus: "pending" as const,
  certificateMode: "optional_paid" as const,
  certificatePaymentVerifiedAt: null,
  certificateRequestedAt: null,
  currentMode: "optional_paid" as const,
  registrationStatus: "confirmed" as const,
};

test("recorre los estados comerciales del certificado opcional", () => {
  assert.equal(getCertificateCommercialStatus(baseInput), "not_requested");
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    certificateRequestedAt: "2026-09-11T12:00:00Z",
  }), "payment_pending");
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    certificatePaymentVerifiedAt: "2026-09-11T13:00:00Z",
    certificateRequestedAt: "2026-09-11T12:00:00Z",
  }), "payment_verified_pending_attendance");
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    attendanceStatus: "attended",
    certificatePaymentVerifiedAt: "2026-09-11T13:00:00Z",
    certificateRequestedAt: "2026-09-11T12:00:00Z",
  }), "ready_to_issue");
});

test("el certificado incluido solo depende de confirmación y asistencia", () => {
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    attendanceStatus: "attended",
    certificateMode: "included",
    currentMode: "included",
  }), "ready_to_issue");
});

test("la emisión tiene prioridad sobre el estado comercial", () => {
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    certificateStatus: "issued",
  }), "issued");
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    certificateStatus: "revoked",
  }), "revoked");
});

test("una actividad que ya no ofrece certificado queda indisponible", () => {
  assert.equal(getCertificateCommercialStatus({
    ...baseInput,
    currentMode: "none",
  }), "unavailable");
});
