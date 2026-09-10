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

const siteUrl = "https://eventosycursos.camaraica.org.pe";
const brand = "#072c25";
const accent = "#b4d65c";
const activityTitle = payload.activity_title ? escapeHtml(payload.activity_title) : "";
const registrationCode = payload.registration_code ? escapeHtml(payload.registration_code) : "";
const section = payload.activity_type === "event" ? "eventos" : "capacitaciones";
const certificateResultUrl = payload.activity_slug && payload.registration_code && payload.certificate_request_token
  ? `${siteUrl}/${section}/${encodeURIComponent(payload.activity_slug)}/inscripcion/resultado?codigo=${encodeURIComponent(payload.registration_code)}&solicitud=${encodeURIComponent(payload.certificate_request_token)}`
  : "";
const certificatePrice = Number(payload.certificate_price);
const certificatePriceText = Number.isFinite(certificatePrice)
  ? new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(certificatePrice)
  : "";
const certificateRequested = payload.certificate_requested === true
  || (typeof payload.certificate_requested_at === "string" && Boolean(payload.certificate_requested_at));

let subject = "";
let heading = "";
let message = "";
let actionUrl = "";
let actionLabel = "";

if (eventType === "activity_free_registration_confirmed") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Inscripción confirmada — ${payload.activity_title}`;
  heading = "Tu inscripción está confirmada";
  message = `Te registraste correctamente en <strong>${activityTitle}</strong>.<br><br>Tu código de inscripción es <strong>${registrationCode}</strong>.`;
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
  message = `El pago y la inscripción para <strong>${activityTitle}</strong> fueron confirmados.<br><br>Tu código de inscripción es <strong>${registrationCode}</strong>.`;
}

if (eventType.startsWith("activity_") && payload.activity_slug) {
  actionUrl = `${siteUrl}/${section}/${encodeURIComponent(payload.activity_slug)}`;
  actionLabel = "Ver actividad";
}

const isConfirmedRegistration = eventType === "activity_free_registration_confirmed"
  || eventType === "activity_paid_registration_confirmed";
if (isConfirmedRegistration && payload.certificate_mode === "included") {
  message += "<br><br><strong>Tu certificado está incluido sin pago adicional.</strong> Se emitirá cuando cumplas las condiciones de participación y asistencia.";
}
if (eventType === "activity_paid_preregistration_created" && payload.certificate_mode === "optional_paid") {
  message += certificateRequested
    ? `<br><br><strong>También registramos tu solicitud de certificado digital</strong> por ${escapeHtml(certificatePriceText)}. El responsable podrá contactarte y la emisión requerirá que tu participación y asistencia estén confirmadas.`
    : `<br><br>Esta actividad ofrece un certificado digital opcional por <strong>${escapeHtml(certificatePriceText)}</strong>. Podrás solicitarlo cuando confirmemos tu participación.`;
}
if (isConfirmedRegistration && payload.certificate_mode === "optional_paid" && certificateResultUrl) {
  message += certificateRequested
    ? `<br><br><strong>Tu solicitud de certificado digital ya está registrada.</strong> La tarifa aplicable es ${escapeHtml(certificatePriceText)} y la emisión requiere asistencia registrada.`
    : `<br><br>Si deseas el certificado digital opcional, puedes solicitarlo por <strong>${escapeHtml(certificatePriceText)}</strong>. La emisión requiere asistencia registrada.`;
  actionUrl = certificateResultUrl;
  actionLabel = certificateRequested ? "Continuar solicitud" : "Solicitar mi certificado";
}

if (eventType === "activity_certificate_offer") {
  requiredText("activity_title");
  requiredText("registration_code");
  if (!certificateResultUrl) throw new Error("No se pudo construir el enlace seguro de solicitud");
  subject = `Aún puedes solicitar tu certificado — ${payload.activity_title}`;
  heading = "¿Deseas obtener tu certificado?";
  message = `Gracias por participar en <strong>${activityTitle}</strong>. Puedes solicitar tu certificado digital por <strong>${escapeHtml(certificatePriceText)}</strong>.<br><br>Si ya enviaste tu comprobante, no necesitas realizar ninguna acción adicional.`;
  actionUrl = certificateResultUrl;
  actionLabel = "Solicitar mi certificado";
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
  actionUrl = `${siteUrl}/admin/inscripciones/${encodeURIComponent(activityId)}?certificado=pending`;
  actionLabel = "Atender solicitud";
}

if (eventType === "activity_certificate_issued") {
  const title = requiredText("activity_title");
  const participantName = requiredText("participant_name");
  const certificateCode = requiredText("certificate_code");
  const certificateUrl = requiredText("certificate_url");
  if (!certificateUrl.startsWith("https://")) throw new Error("payload.certificate_url debe usar HTTPS");
  subject = `Tu certificado ya está disponible — ${title}`;
  heading = `Felicitaciones, ${escapeHtml(participantName)}`;
  message = `Ya puedes consultar y descargar tu certificado de <strong>${escapeHtml(title)}</strong>.<br><br>Código: <strong>${escapeHtml(certificateCode)}</strong>.`;
  actionUrl = certificateUrl;
  actionLabel = "Ver certificado";
}

if (eventType === "course_certificate_issued") {
  const title = requiredText("course_title");
  const participantName = requiredText("participant_name");
  const certificateCode = requiredText("certificate_code");
  const certificateUrl = requiredText("certificate_url");
  if (!certificateUrl.startsWith("https://")) throw new Error("payload.certificate_url debe usar HTTPS");
  subject = `Tu certificado ya está disponible — ${title}`;
  heading = `Felicitaciones, ${escapeHtml(participantName)}`;
  message = `Completaste satisfactoriamente <strong>${escapeHtml(title)}</strong>. Ya puedes consultar y descargar tu certificado.<br><br>Código: <strong>${escapeHtml(certificateCode)}</strong>.`;
  actionUrl = certificateUrl;
  actionLabel = "Ver certificado";
}

const button = actionUrl
  ? `<p style="margin:28px 0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;padding:13px 22px;border-radius:8px;font-weight:700">${escapeHtml(actionLabel)}</a></p>`
  : "";
const html = `<!doctype html><html><body style="margin:0;background:#f4f6f5;font-family:Arial,sans-serif;color:#25302d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="height:10px;background:${accent}"></td></tr><tr><td style="padding:34px"><p style="margin:0 0 24px;color:${brand};font-size:18px;font-weight:800">CÁMARA DE COMERCIO DE ICA</p><h1 style="margin:0 0 20px;color:${brand};font-size:27px;line-height:1.25">${heading}</h1><p style="margin:0;font-size:16px;line-height:1.65">${message}</p>${button}<p style="margin:32px 0 0;border-top:1px solid #e5e9e7;padding-top:20px;color:#67736f;font-size:13px;line-height:1.5">Este es un mensaje automático. Si no reconoces esta operación, comunícate con la Cámara de Comercio de Ica.</p></td></tr></table></td></tr></table></body></html>`;

const replyTo = typeof payload.contact_email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email)
  ? payload.contact_email
  : undefined;

return [{ json: { html, notificationId, replyTo, subject, to: recipientEmail } }];
