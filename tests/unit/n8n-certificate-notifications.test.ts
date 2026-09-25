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
const workflow = JSON.parse(readFileSync(
  resolve(process.cwd(), "docs/integraciones/n8n-workflow-eventos-cci.json"),
  "utf8",
));
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

test("el workflow importable contiene la misma plantilla de correo", () => {
  const preparationNode = workflow.nodes.find((node: { name: string }) => node.name === "Preparar correo");
  assert.equal(preparationNode?.parameters.jsCode.trimEnd(), templateSource.trimEnd());
});

test("la solicitud grupal pagada informa total y espera validación, sin datos sensibles", () => {
  const email = prepareEmail("activity_group_request_received", {
    activity_slug: "encuentro-cci", activity_title: "Encuentro CCI", group_request_code: "CCI-GR-000123",
    group_access_token: "7e000000-0000-4000-8000-000000000010",
    group_attendees: ["Ana Pérez", "Bea Pérez"], group_total: 80,
  });
  assert.match(email.html, /CCI-GR-000123/);
  assert.match(email.html, /S\/\s80\.00/u);
  assert.match(email.html, /Coordina el pago manual/i);
  assert.match(email.html, /grupo=CCI-GR-000123&amp;acceso=7e000000-0000-4000-8000-000000000010/);
  assert.doesNotMatch(email.html, /DNI|20123456789/);
});

test("el resumen mixto distingue pases confirmados del importe pendiente", () => {
  const email = prepareEmail("activity_group_request_received", {
    activity_slug: "encuentro-cci", activity_title: "Encuentro CCI",
    group_request_code: "CCI-GR-000124", group_attendees: ["Ana", "Bea"],
    group_total: 40, group_complimentary_count: 1,
  });
  assert.match(email.html, /Pases gratuitos confirmados/);
  assert.match(email.html, /S\/\s40\.00/u);
});

test("la cancelación de una plaza gratuita avisa solo al titular", () => {
  const email = prepareEmail("activity_registration_cancelled", {
    activity_title: "Encuentro CCI", registration_code: "CCI-EV-000123",
  });
  assert.match(email.html, /Tu plaza fue cancelada/);
  assert.match(email.html, /CCI-EV-000123/);
  assert.doesNotMatch(email.html, /pago|otros asistentes/i);
});

test("la confirmación gratuita muestra el resumen solo al titular", () => {
  const email = prepareEmail("activity_free_registration_confirmed", {
    activity_title: "Encuentro CCI", registration_code: "CCI-EV-000123",
    group_request_code: "CCI-GR-000123", group_attendees: ["Ana Pérez", "Bea Pérez"],
  });
  assert.match(email.html, /Resumen de tu grupo/);
  assert.match(email.html, /Bea Pérez/);
});

test("la confirmación virtual conserva acceso y certificado como acciones separadas", () => {
  const email = prepareEmail("activity_free_registration_confirmed", virtualContext);

  assert.match(email.html, /background:#072c25/);
  assert.match(email.html, /background:#000000/);
  assert.match(email.html, /background:#b4d65c/);
  assert.match(email.html, /assets\/brand\/cci-logo-white\.webp/);
  assert.match(email.html, /class="action-cell"/);
  assert.match(email.html, /Ingresar a la actividad virtual/);
  assert.match(email.html, /meet\.example\.test\/sesion-segura/);
  assert.match(email.html, /Tu enlace de acceso/);
  assert.match(email.html, /copia este enlace y pégalo en tu navegador/);
  assert.match(email.html, />https:\/\/meet\.example\.test\/sesion-segura<\/a>/);
  assert.match(email.html, /Solicitar mi certificado/);
  assert.match(email.html, /Sesión 1/);
});

test("la preinscripción pagada nunca muestra el acceso virtual", () => {
  const email = prepareEmail("activity_paid_preregistration_created", virtualContext);

  assert.doesNotMatch(email.html, /meet\.example\.test\/sesion-segura/);
  assert.doesNotMatch(email.html, /Ingresar a la actividad virtual/);
  assert.doesNotMatch(email.html, /Tu enlace de acceso/);
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
  assert.match(email.html, />https:\/\/meet\.example\.test\/sesion-segura<\/a>/);
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
  assert.match(email.html, />https:\/\/meet\.example\.test\/sesion-segura<\/a>/);
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
  assert.doesNotMatch(email.html, /Tu enlace de acceso/);
});

test("el correo protege y ajusta enlaces virtuales extensos", () => {
  const virtualUrl = "https://meet.example.test/" + "sesion/".repeat(28) + "?token=uno&usuario=dos";
  const email = prepareEmail("activity_paid_registration_confirmed", {
    ...virtualContext,
    virtual_access_url: virtualUrl,
  });

  assert.match(email.html, /word-break:break-all;overflow-wrap:anywhere/);
  assert.match(email.html, /token=uno&amp;usuario=dos/);
  assert.doesNotMatch(email.html, /href="[^"]*&usuario=dos"/);
});
