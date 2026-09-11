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

const virtualContext = {
  ...requestContext,
  activity_modality: "virtual",
  activity_sessions: [
    { label: "Sesión 1", starts_at: "2026-09-22T15:00:00-05:00" },
  ],
  virtual_access_url: "https://meet.example.test/sesion-segura",
};

test("la confirmación virtual conserva acceso y certificado como acciones separadas", () => {
  const email = prepareEmail("activity_free_registration_confirmed", virtualContext);

  assert.match(email.html, /background:#072c25/);
  assert.match(email.html, /background:#000000/);
  assert.match(email.html, /background:#b4d65c/);
  assert.match(email.html, /assets\/brand\/cci-logo-white\.webp/);
  assert.match(email.html, /class="action-cell"/);
  assert.match(email.html, /Ingresar a la actividad virtual/);
  assert.match(email.html, /meet\.example\.test\/sesion-segura/);
  assert.match(email.html, /Solicitar mi certificado/);
  assert.match(email.html, /Sesión 1/);
});

test("la preinscripción pagada nunca muestra el acceso virtual", () => {
  const email = prepareEmail("activity_paid_preregistration_created", virtualContext);

  assert.doesNotMatch(email.html, /meet\.example\.test\/sesion-segura/);
  assert.doesNotMatch(email.html, /Ingresar a la actividad virtual/);
});

test("el recordatorio identifica la sesión y entrega el enlace", () => {
  const email = prepareEmail("activity_virtual_session_reminder", {
    ...virtualContext,
    registration_request_token: requestContext.certificate_request_token,
    session_starts_at: "2026-09-22T15:00:00-05:00",
  });

  assert.match(email.subject, /comienza pronto/i);
  assert.match(email.html, /aproximadamente una hora/i);
  assert.match(email.html, /Ingresar a la actividad virtual/);
  assert.match(email.html, /Ver datos de acceso/);
});

test("la confirmación híbrida informa sede y acceso virtual", () => {
  const email = prepareEmail("activity_paid_registration_confirmed", {
    ...virtualContext,
    activity_modality: "hybrid",
    venue_address: "Av. Principal 123, Ica",
    venue_name: "Auditorio CCI",
  });

  assert.match(email.html, /Alternativa presencial/);
  assert.match(email.html, /Auditorio CCI/);
  assert.match(email.html, /Ingresar a la actividad virtual/);
});

test("una actividad híbrida heredada sin enlace no bloquea su confirmación", () => {
  const legacyHybridContext = {
    ...virtualContext,
    activity_modality: "hybrid",
    venue_name: "Auditorio CCI",
    virtual_access_url: undefined,
  };
  const email = prepareEmail("activity_free_registration_confirmed", legacyHybridContext);

  assert.match(email.html, /Tu inscripción está confirmada/);
  assert.doesNotMatch(email.html, /Ingresar a la actividad virtual/);
});
