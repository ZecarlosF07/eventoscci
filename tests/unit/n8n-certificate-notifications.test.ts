import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

type PreparedEmail = {
  html: string;
  notificationId: string;
  replyTo?: string;
  subject: string;
  to: string;
};

const templateSource = readFileSync(
  resolve(process.cwd(), "docs/integraciones/n8n-preparar-correo.js"),
  "utf8",
);
const executeTemplate = new Function("$json", templateSource) as (
  input: unknown,
) => Array<{ json: PreparedEmail }>;

function prepareEmail(eventType: string, payload: Record<string, unknown>): PreparedEmail {
  const result = executeTemplate({
    body: {
      event_type: eventType,
      notification_id: "9e000000-0000-4000-8000-000000000001",
      payload,
      recipient_email: "destino@example.test",
    },
  });
  assert.equal(result.length, 1);
  return result[0].json;
}

const requestContext = {
  activity_slug: "tributacion-en-ica",
  activity_title: "Tributación en Ica",
  activity_type: "training",
  certificate_mode: "optional_paid",
  certificate_price: 35,
  certificate_request_token: "7e000000-0000-4000-8000-000000000001",
  registration_code: "CCI-CAP-000123",
};

test("el correo de certificado incluido no incorpora una llamada comercial", () => {
  const email = prepareEmail("activity_free_registration_confirmed", {
    ...requestContext,
    certificate_mode: "included",
    contact_email: "responsable@example.test",
  });

  assert.match(email.html, /certificado está incluido sin pago adicional/i);
  assert.doesNotMatch(email.html, /Solicitar mi certificado/);
  assert.equal(email.replyTo, "responsable@example.test");
});

test("la confirmación opcional enlaza al resultado seguro", () => {
  const email = prepareEmail("activity_free_registration_confirmed", requestContext);

  assert.match(email.html, /Solicitar mi certificado/);
  assert.match(email.html, /solicitud=7e000000-0000-4000-8000-000000000001/);
  assert.match(email.html, /S\/\s35\.00/u);
});

test("la confirmación reconoce una solicitud creada durante la inscripción", () => {
  const email = prepareEmail("activity_free_registration_confirmed", {
    ...requestContext,
    certificate_requested: true,
    certificate_requested_at: "2026-09-10T16:30:00-05:00",
  });

  assert.match(email.html, /solicitud de certificado digital ya está registrada/i);
  assert.match(email.html, /Continuar solicitud/);
  assert.doesNotMatch(email.html, />Solicitar mi certificado</);
});

test("la oferta posterior conserva el enlace seguro y evita duplicar instrucciones", () => {
  const email = prepareEmail("activity_certificate_offer", requestContext);

  assert.match(email.subject, /Aún puedes solicitar tu certificado/);
  assert.match(email.html, /Si ya enviaste tu comprobante/);
  assert.match(email.html, /CCI-CAP-000123/);
});

test("el aviso interno contiene la referencia operativa y enlaza al filtro pendiente", () => {
  const email = prepareEmail("activity_certificate_request_created", {
    ...requestContext,
    activity_id: "6e000000-0000-4000-8000-000000000001",
    participant_name: "Persona Solicitante",
    participant_phone: "914000001",
  });

  assert.match(email.html, /Persona Solicitante/);
  assert.match(email.html, /914000001/);
  assert.match(email.html, /certificado=pending/);
  assert.equal(email.to, "destino@example.test");
});
