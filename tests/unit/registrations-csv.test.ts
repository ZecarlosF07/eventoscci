import assert from "node:assert/strict";
import test from "node:test";

import type { RegistrationAdminItem } from "../../src/features/registrations/types/registration.types";
import { registrationsToCsv } from "../../src/features/registrations/utils/registrations-csv";

const REGISTRATION: RegistrationAdminItem = {
  activity: {
    certificate_mode: "optional_paid",
    id: "7a230000-0000-4000-8000-000000000001",
    slug: "capacitacion-prueba",
    status: "finished",
    title: "Capacitación de prueba",
    type: "training",
  },
  attendance: [{ id: "5a230000-0000-4000-8000-000000000001", status: "attended" }],
  cancellation_reason: null,
  cancelled_at: null,
  certificate: [],
  certificate_mode_snapshot: "optional_paid",
  certificate_payment_verified_at: "2026-09-11T16:00:00Z",
  certificate_payment_verified_by: "8a230000-0000-4000-8000-000000000001",
  certificate_price_snapshot: 35,
  certificate_requested_at: "2026-09-11T15:00:00Z",
  certificate_requested_by: "8a230000-0000-4000-8000-000000000001",
  certificatePaymentVerifiedByName: "Administradora CCI",
  certificateRequestedByName: "Administradora CCI",
  company_snapshot: "Empresa de prueba",
  confirmed_at: "2026-09-11T14:00:00Z",
  confirmed_by: "8a230000-0000-4000-8000-000000000001",
  created_at: "2026-09-11T13:00:00Z",
  id: "6a230000-0000-4000-8000-000000000001",
  person: {
    document_number: "23000001",
    document_type: "dni",
    email: "participante@example.test",
    first_names: "Persona",
    id: "3a230000-0000-4000-8000-000000000001",
    job_title: "Analista",
    last_names: "Confirmada",
    phone: "923000001",
  },
  price_snapshot: 0,
  registration_code: "CCI-23-000001",
  registration_type: "general",
  ruc_snapshot: "20123456789",
  status: "confirmed",
};

test("exporta el estado comercial y sus responsables", () => {
  const csv = registrationsToCsv([REGISTRATION]);

  assert.match(csv, /"Estado comercial"/);
  assert.match(csv, /"Listo para emitir"/);
  assert.match(csv, /"Solicitud registrada por"/);
  assert.match(csv, /"Pago verificado por"/);
  assert.match(csv, /"Administradora CCI"/);
});
