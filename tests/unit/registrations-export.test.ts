import assert from "node:assert/strict";
import test from "node:test";

import type { RegistrationAdminItem } from "../../src/features/registrations/types/registration.types";
import { registrationsToTable } from "../../src/features/registrations/utils/registrations-export";

const REGISTRATION: RegistrationAdminItem = {
  member_group_request_id: null,
  is_complimentary: false,
  academic_institution_snapshot: null,
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
  career_snapshot: null,
  company_snapshot: "Empresa de prueba",
  confirmed_at: "2026-09-11T14:00:00Z",
  confirmed_by: "8a230000-0000-4000-8000-000000000001",
  created_at: "2026-09-11T13:00:00Z",
  future_topics_suggestion: "Gestión comercial con inteligencia artificial",
  id: "6a230000-0000-4000-8000-000000000001",
  job_title_snapshot: "Analista",
  participant_profile: "professional",
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
  const table = registrationsToTable([REGISTRATION]);
  assert.ok(table.headers.includes("Estado comercial"));
  assert.ok(table.headers.includes("Solicitud registrada por"));
  assert.ok(table.headers.includes("Pago verificado por"));
  assert.ok(table.headers.includes("Sugerencia de próximos temas"));
  assert.ok(table.rows[0].includes("Listo para emitir"));
  assert.ok(table.rows[0].includes("Administradora CCI"));
  assert.ok(table.rows[0].includes("Gestión comercial con inteligencia artificial"));
});
