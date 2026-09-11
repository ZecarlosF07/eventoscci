const request = $json.body ?? $json;
const {
  event_type: eventType,
  notification_id: notificationId,
  payload = {},
  recipient_email: recipientEmail,
} = request;

const allowedEvents = new Set([
  "activity_free_registration_confirmed",
  "activity_paid_preregistration_created",
  "activity_paid_registration_confirmed",
  "activity_virtual_session_reminder",
  "activity_certificate_issued",
  "activity_certificate_offer",
  "activity_certificate_request_created",
  "course_certificate_issued",
]);

if (!allowedEvents.has(eventType)) throw new Error(`Evento no soportado: ${eventType ?? "vacío"}`);
if (typeof notificationId !== "string" || !notificationId) throw new Error("notification_id es obligatorio");
if (typeof recipientEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
  throw new Error("recipient_email no es válido");
}

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll("\"", "&quot;")
  .replaceAll("'", "&#039;");
const requiredText = (key) => {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`payload.${key} es obligatorio para ${eventType}`);
  }
  return value.trim();
};
const secureUrl = (value, key) => {
  if (typeof value !== "string" || !value.startsWith("https://")) {
    throw new Error(`payload.${key} debe usar HTTPS`);
  }
  return value;
};
const formatDate = (value) => new Intl.DateTimeFormat("es-PE", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Lima",
}).format(new Date(value));

const siteUrl = "https://eventosycursos.camaraica.org.pe";
const brand = "#072c25";
const accent = "#b4d65c";
const activityTitle = payload.activity_title ? escapeHtml(payload.activity_title) : "";
const registrationCode = payload.registration_code ? escapeHtml(payload.registration_code) : "";
const section = payload.activity_type === "event" ? "eventos" : "capacitaciones";
const requestToken = payload.registration_request_token ?? payload.certificate_request_token;
const registrationResultUrl = payload.activity_slug && payload.registration_code && requestToken
  ? `${siteUrl}/${section}/${encodeURIComponent(payload.activity_slug)}/inscripcion/resultado?codigo=${encodeURIComponent(payload.registration_code)}&solicitud=${encodeURIComponent(requestToken)}`
  : "";
const certificatePrice = Number(payload.certificate_price);
const certificatePriceText = Number.isFinite(certificatePrice)
  ? new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(certificatePrice)
  : "";
const certificateRequested = payload.certificate_requested === true
  || (typeof payload.certificate_requested_at === "string" && Boolean(payload.certificate_requested_at));
const sessions = Array.isArray(payload.activity_sessions) ? payload.activity_sessions : [];
const sessionList = sessions.length
  ? `<ul style="margin:16px 0 0;padding-left:20px">${sessions.map((session) => {
    const label = session?.label ? `<strong>${escapeHtml(session.label)}:</strong> ` : "";
    return `<li style="margin:7px 0">${label}${escapeHtml(formatDate(session.starts_at))}</li>`;
  }).join("")}</ul>`
  : "";

let subject = "";
let heading = "";
let message = "";
const actions = [];
const addAction = (label, url, primary = false) => {
  if (url && !actions.some((action) => action.url === url && action.label === label)) {
    actions.push({ label, primary, url });
  }
};

if (eventType === "activity_free_registration_confirmed") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Inscripción confirmada — ${payload.activity_title}`;
  heading = "Tu inscripción está confirmada";
  message = `Te registraste correctamente en <strong>${activityTitle}</strong>.<br><br>Tu código de inscripción es <strong>${registrationCode}</strong>.${sessionList}`;
}

if (eventType === "activity_paid_preregistration_created") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Preinscripción recibida — ${payload.activity_title}`;
  heading = "Recibimos tu preinscripción";
  message = `Registramos tu solicitud para <strong>${activityTitle}</strong>.<br><br>Tu código es <strong>${registrationCode}</strong>. La Cámara de Comercio de Ica verificará el pago y te enviará una confirmación.`;
}

if (eventType === "activity_paid_registration_confirmed") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Inscripción confirmada — ${payload.activity_title}`;
  heading = "Tu inscripción está confirmada";
  message = `El pago y la inscripción para <strong>${activityTitle}</strong> fueron confirmados.<br><br>Tu código de inscripción es <strong>${registrationCode}</strong>.${sessionList}`;
}

const isConfirmedRegistration = eventType === "activity_free_registration_confirmed"
  || eventType === "activity_paid_registration_confirmed";
if (
  isConfirmedRegistration
  && ["virtual", "hybrid"].includes(payload.activity_modality)
  && payload.virtual_access_url
) {
  const virtualAccessUrl = secureUrl(payload.virtual_access_url, "virtual_access_url");
  const location = payload.activity_modality === "hybrid" && payload.venue_name
    ? `<br><br><strong>Alternativa presencial:</strong> ${escapeHtml(payload.venue_name)}${payload.venue_address ? ` · ${escapeHtml(payload.venue_address)}` : ""}${payload.venue_reference ? `<br>${escapeHtml(payload.venue_reference)}` : ""}`
    : "";
  message += `${location}<br><br>Conserva este correo: contiene tu acceso personal a la actividad.`;
  addAction("Ingresar a la actividad virtual", virtualAccessUrl, true);
  addAction("Ver fechas y datos de acceso", registrationResultUrl);
}

if (isConfirmedRegistration && payload.certificate_mode === "included") {
  message += "<br><br><strong>Tu certificado está incluido sin pago adicional.</strong> Se emitirá cuando cumplas las condiciones de participación y asistencia.";
}
if (eventType === "activity_paid_preregistration_created" && payload.certificate_mode === "optional_paid") {
  message += certificateRequested
    ? `<br><br><strong>También registramos tu solicitud de certificado digital</strong> por ${escapeHtml(certificatePriceText)}. El responsable podrá contactarte y la emisión requerirá que tu participación y asistencia estén confirmadas.`
    : `<br><br>Esta actividad ofrece un certificado digital opcional por <strong>${escapeHtml(certificatePriceText)}</strong>. Podrás solicitarlo cuando confirmemos tu participación.`;
}
if (isConfirmedRegistration && payload.certificate_mode === "optional_paid" && registrationResultUrl) {
  message += certificateRequested
    ? `<br><br><strong>Tu solicitud de certificado digital ya está registrada.</strong> La tarifa aplicable es ${escapeHtml(certificatePriceText)} y la emisión requiere asistencia registrada.`
    : `<br><br>Si deseas el certificado digital opcional, puedes solicitarlo por <strong>${escapeHtml(certificatePriceText)}</strong>. La emisión requiere asistencia registrada.`;
  addAction(certificateRequested ? "Continuar solicitud" : "Solicitar mi certificado", registrationResultUrl);
}

if (eventType === "activity_virtual_session_reminder") {
  requiredText("activity_title");
  requiredText("registration_code");
  const startsAt = requiredText("session_starts_at");
  const virtualAccessUrl = secureUrl(payload.virtual_access_url, "virtual_access_url");
  subject = `Tu actividad comienza pronto — ${payload.activity_title}`;
  heading = "Tu sesión comienza en aproximadamente una hora";
  message = `<strong>${activityTitle}</strong><br><br>Inicio: <strong>${escapeHtml(formatDate(startsAt))}</strong>.<br>Código de inscripción: <strong>${registrationCode}</strong>.`;
  if (payload.activity_modality === "hybrid" && payload.venue_name) {
    message += `<br><br><strong>Asistencia presencial:</strong> ${escapeHtml(payload.venue_name)}${payload.venue_address ? ` · ${escapeHtml(payload.venue_address)}` : ""}.`;
  }
  addAction("Ingresar a la actividad virtual", virtualAccessUrl, true);
  addAction("Ver datos de acceso", registrationResultUrl);
}

if (eventType.startsWith("activity_") && payload.activity_slug && !actions.length) {
  addAction("Ver actividad", `${siteUrl}/${section}/${encodeURIComponent(payload.activity_slug)}`, true);
}

if (eventType === "activity_certificate_offer") {
  requiredText("activity_title");
  requiredText("registration_code");
  if (!registrationResultUrl) throw new Error("No se pudo construir el enlace seguro de solicitud");
  subject = `Aún puedes solicitar tu certificado — ${payload.activity_title}`;
  heading = "¿Deseas obtener tu certificado?";
  message = `Gracias por participar en <strong>${activityTitle}</strong>. Puedes solicitar tu certificado digital por <strong>${escapeHtml(certificatePriceText)}</strong>.<br><br>Si ya enviaste tu comprobante, no necesitas realizar ninguna acción adicional.`;
  actions.length = 0;
  addAction("Solicitar mi certificado", registrationResultUrl, true);
}

if (eventType === "activity_certificate_request_created") {
  const participantName = requiredText("participant_name");
  const participantPhone = requiredText("participant_phone");
  const activityId = requiredText("activity_id");
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Solicitud de certificado pendiente — ${payload.activity_title}`;
  heading = "Nueva solicitud de certificado";
  message = `<strong>${escapeHtml(participantName)}</strong> solicitó el certificado de <strong>${activityTitle}</strong>.<br><br>Código: <strong>${registrationCode}</strong><br>Celular: <strong>${escapeHtml(participantPhone)}</strong><br>Tarifa: <strong>${escapeHtml(certificatePriceText)}</strong>.<br><br>Contáctalo si no completa la coordinación por WhatsApp.`;
  actions.length = 0;
  addAction("Atender solicitud", `${siteUrl}/admin/inscripciones/${encodeURIComponent(activityId)}?certificado=pending`, true);
}

if (eventType === "activity_certificate_issued" || eventType === "course_certificate_issued") {
  const titleKey = eventType === "course_certificate_issued" ? "course_title" : "activity_title";
  const title = requiredText(titleKey);
  const participantName = requiredText("participant_name");
  const certificateCode = requiredText("certificate_code");
  const certificateUrl = secureUrl(payload.certificate_url, "certificate_url");
  subject = `Tu certificado ya está disponible — ${title}`;
  heading = `Felicitaciones, ${escapeHtml(participantName)}`;
  message = eventType === "course_certificate_issued"
    ? `Completaste satisfactoriamente <strong>${escapeHtml(title)}</strong>. Ya puedes consultar y descargar tu certificado.<br><br>Código: <strong>${escapeHtml(certificateCode)}</strong>.`
    : `Ya puedes consultar y descargar tu certificado de <strong>${escapeHtml(title)}</strong>.<br><br>Código: <strong>${escapeHtml(certificateCode)}</strong>.`;
  actions.length = 0;
  addAction("Ver certificado", certificateUrl, true);
}

const buttons = actions.length
  ? `<div style="margin:28px 0">${actions.map((action) => `<a href="${escapeHtml(action.url)}" style="display:inline-block;margin:0 8px 8px 0;background:${action.primary ? brand : "#fff"};color:${action.primary ? "#fff" : brand};border:1px solid ${brand};text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">${escapeHtml(action.label)}</a>`).join("")}</div>`
  : "";
const html = `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Arial,sans-serif;color:#25302d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="height:10px;background:${accent}"></td></tr><tr><td style="padding:34px"><p style="margin:0 0 24px;color:${brand};font-size:18px;font-weight:800">CÁMARA DE COMERCIO DE ICA</p><h1 style="margin:0 0 20px;color:${brand};font-size:27px;line-height:1.25">${heading}</h1><p style="margin:0;font-size:16px;line-height:1.65">${message}</p>${buttons}<p style="margin:32px 0 0;border-top:1px solid #e5e9e7;padding-top:20px;color:#67736f;font-size:13px;line-height:1.5">Este es un mensaje automático. Si no reconoces esta operación, comunícate con la Cámara de Comercio de Ica.</p></td></tr></table></td></tr></table></body></html>`;

const replyTo = typeof payload.contact_email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email)
  ? payload.contact_email
  : undefined;

return [{ json: { html, notificationId, replyTo, subject, to: recipientEmail } }];
