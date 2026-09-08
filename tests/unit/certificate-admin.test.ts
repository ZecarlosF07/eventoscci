import assert from "node:assert/strict";
import test from "node:test";

import { parseCertificateActivityFilters, parseCertificateCandidateFilters } from "../../src/features/certificates/utils/certificate-admin-filters";
import { selectOutdatedCertificates } from "../../src/features/certificates/utils/select-outdated-certificates";
import type { ParticipantCertificateItem } from "../../src/features/participants/types/participant.types";

function certificate(overrides: Partial<ParticipantCertificateItem> = {}): ParticipantCertificateItem {
  return {
    certificate_code: "CCI-CERT-2026-000001",
    certificate_type: "activity",
    id: crypto.randomUUID(),
    issued_at: "2026-09-08T12:00:00Z",
    participant_name_snapshot: "Nombre Anterior",
    revocation_reason: null,
    status: "issued",
    title_snapshot: "Actividad de prueba",
    ...overrides,
  };
}

test("normaliza filtros administrativos de certificados", () => {
  assert.deepEqual(parseCertificateActivityFilters({ pagina: "2", q: "  Ventas  ", tipo: "training" }), {
    page: 2,
    query: "Ventas",
    type: "training",
  });
  assert.deepEqual(parseCertificateCandidateFilters({ pagina: "no válida", q: "  12345678 " }), {
    page: 1,
    query: "12345678",
  });
});

test("selecciona solo certificados vigentes con nombre desactualizado", () => {
  const outdated = certificate();
  const current = certificate({ participant_name_snapshot: "Nombre Correcto" });
  const revoked = certificate({ status: "revoked" });
  assert.deepEqual(selectOutdatedCertificates([outdated, current, revoked], " Nombre Correcto "), [outdated]);
});
