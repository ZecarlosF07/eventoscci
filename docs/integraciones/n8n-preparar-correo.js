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
const headerBackground = "#000000";
const accent = "#b4d65c";
const ink = "#172b27";
const muted = "#5c6f69";
const surface = "#f2f7f4";
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
const paragraph = (content) => `<p style="margin:0 0 18px;color:${ink};font-size:16px;line-height:1.65">${content}</p>`;
const detailPanel = (label, content) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border:1px solid #d7e4de;border-radius:12px;background:${surface}"><tr><td style="padding:16px 18px"><p style="margin:0 0 6px;color:${muted};font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">${escapeHtml(label)}</p><p style="margin:0;color:${brand};font-size:17px;font-weight:700;line-height:1.45">${content}</p></td></tr></table>`;
const notice = (title, content) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;border-left:4px solid ${accent};border-radius:0 12px 12px 0;background:#f6faee"><tr><td style="padding:15px 18px"><p style="margin:0 0 5px;color:${brand};font-size:15px;font-weight:800;line-height:1.4">${escapeHtml(title)}</p><p style="margin:0;color:${ink};font-size:14px;line-height:1.6">${content}</p></td></tr></table>`;
const sessions = Array.isArray(payload.activity_sessions) ? payload.activity_sessions : [];
const sessionList = sessions.length
  ? detailPanel(sessions.length === 1 ? "Fecha y hora" : "Fechas y horarios", sessions.map((session, index) => {
    const label = session?.label ? escapeHtml(session.label) : `Sesión ${index + 1}`;
    const separator = index < sessions.length - 1 ? "border-bottom:1px solid #d7e4de;" : "";
    return `<span style="display:block;${separator}padding:${index ? "11px" : "0"} 0 ${index < sessions.length - 1 ? "11px" : "0"}"><span style="display:block;color:${muted};font-size:12px;font-weight:700">${label}</span><span style="display:block;margin-top:3px">${escapeHtml(formatDate(session.starts_at))}</span></span>`;
  }).join(""))
  : "";

let subject = "";
let heading = "";
let eyebrow = "INFORMACIÓN DE TU ACTIVIDAD";
let message = "";
const actions = [];
const highlights = [];
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
  eyebrow = "INSCRIPCIÓN CONFIRMADA";
  message = `${paragraph(`Te registraste correctamente en <strong>${activityTitle}</strong>.`)}${detailPanel("Código de inscripción", registrationCode)}${sessionList}`;
}

if (eventType === "activity_paid_preregistration_created") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Preinscripción recibida — ${payload.activity_title}`;
  heading = "Recibimos tu preinscripción";
  eyebrow = "PREINSCRIPCIÓN RECIBIDA";
  message = `${paragraph(`Registramos tu solicitud para <strong>${activityTitle}</strong>.`)}${detailPanel("Código de preinscripción", registrationCode)}${notice("¿Qué sigue?", "La Cámara de Comercio de Ica verificará el pago y te enviaremos una nueva confirmación cuando el proceso esté completo.")}`;
}

if (eventType === "activity_paid_registration_confirmed") {
  requiredText("activity_title");
  requiredText("registration_code");
  subject = `Inscripción confirmada — ${payload.activity_title}`;
  heading = "Tu inscripción está confirmada";
  eyebrow = "PAGO E INSCRIPCIÓN CONFIRMADOS";
  message = `${paragraph(`El pago y la inscripción para <strong>${activityTitle}</strong> fueron confirmados.`)}${detailPanel("Código de inscripción", registrationCode)}${sessionList}`;
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
    ? notice("Alternativa presencial", `${escapeHtml(payload.venue_name)}${payload.venue_address ? ` · ${escapeHtml(payload.venue_address)}` : ""}${payload.venue_reference ? `<br>${escapeHtml(payload.venue_reference)}` : ""}`)
    : "";
  message += location;
  highlights.push({
    content: "Usa el botón principal para ingresar. Conserva este correo porque contiene tus datos personales de acceso.",
    title: "Tu acceso virtual está listo",
  });
  addAction("Ingresar a la actividad virtual", virtualAccessUrl, true);
  addAction("Ver fechas y datos de acceso", registrationResultUrl);
}

if (isConfirmedRegistration && payload.certificate_mode === "included") {
  highlights.push({
    content: "Se emitirá cuando cumplas las condiciones de participación y asistencia.",
    title: "Tu certificado está incluido sin pago adicional",
  });
}
if (eventType === "activity_paid_preregistration_created" && payload.certificate_mode === "optional_paid") {
  message += certificateRequested
    ? notice("Solicitud de certificado registrada", `La tarifa es <strong>${escapeHtml(certificatePriceText)}</strong>. El responsable podrá contactarte y la emisión requerirá participación y asistencia confirmadas.`)
    : notice("Certificado digital opcional", `Puedes solicitarlo por <strong>${escapeHtml(certificatePriceText)}</strong> cuando confirmemos tu participación.`);
}
if (isConfirmedRegistration && payload.certificate_mode === "optional_paid" && registrationResultUrl) {
  highlights.push(certificateRequested
    ? {
      content: `La tarifa aplicable es <strong>${escapeHtml(certificatePriceText)}</strong>. La emisión requiere asistencia registrada.`,
      title: "Tu solicitud de certificado digital ya está registrada",
    }
    : {
      content: `Puedes solicitarlo por <strong>${escapeHtml(certificatePriceText)}</strong>. La emisión requiere asistencia registrada.`,
      title: "Certificado digital opcional",
    });
  addAction(certificateRequested ? "Continuar solicitud" : "Solicitar mi certificado", registrationResultUrl);
}

if (eventType === "activity_virtual_session_reminder") {
  requiredText("activity_title");
  requiredText("registration_code");
  const startsAt = requiredText("session_starts_at");
  const virtualAccessUrl = secureUrl(payload.virtual_access_url, "virtual_access_url");
  subject = `Tu actividad comienza pronto — ${payload.activity_title}`;
  heading = "Tu sesión comienza en aproximadamente una hora";
  eyebrow = "RECORDATORIO DE SESIÓN";
  message = `${paragraph(`<strong>${activityTitle}</strong>`)}${detailPanel("Inicio de la sesión", escapeHtml(formatDate(startsAt)))}${paragraph(`Código de inscripción: <strong>${registrationCode}</strong>.`)}`;
  if (payload.activity_modality === "hybrid" && payload.venue_name) {
    message += notice("Asistencia presencial", `${escapeHtml(payload.venue_name)}${payload.venue_address ? ` · ${escapeHtml(payload.venue_address)}` : ""}.`);
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
  eyebrow = "CERTIFICADO DIGITAL";
  message = `${paragraph(`Gracias por participar en <strong>${activityTitle}</strong>.`)}${detailPanel("Tarifa del certificado", escapeHtml(certificatePriceText))}${paragraph("Si ya enviaste tu comprobante, no necesitas realizar ninguna acción adicional.")}`;
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
  eyebrow = "GESTIÓN DE CERTIFICADOS";
  message = `${paragraph(`<strong>${escapeHtml(participantName)}</strong> solicitó el certificado de <strong>${activityTitle}</strong>.`)}${detailPanel("Datos para la atención", `Código: ${registrationCode}<br>Celular: ${escapeHtml(participantPhone)}<br>Tarifa: ${escapeHtml(certificatePriceText)}`)}${paragraph("Contáctalo si no completa la coordinación por WhatsApp.")}`;
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
  eyebrow = "CERTIFICADO DISPONIBLE";
  message = eventType === "course_certificate_issued"
    ? `${paragraph(`Completaste satisfactoriamente <strong>${escapeHtml(title)}</strong>. Ya puedes consultar y descargar tu certificado.`)}${detailPanel("Código del certificado", escapeHtml(certificateCode))}`
    : `${paragraph(`Ya puedes consultar y descargar tu certificado de <strong>${escapeHtml(title)}</strong>.`)}${detailPanel("Código del certificado", escapeHtml(certificateCode))}`;
  actions.length = 0;
  addAction("Ver certificado", certificateUrl, true);
}

const primaryAction = actions.find((action) => action.primary) ?? actions[0];
const secondaryActions = primaryAction ? actions.filter((action) => action !== primaryAction) : [];
const highlightGrid = highlights.length
  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0;table-layout:fixed"><tr>${highlights.map((highlight, index) => `<td class="notice-cell" width="${100 / highlights.length}%" valign="top" style="padding:${index ? "0 0 0 6px" : "0 6px 0 0"}"><table role="presentation" width="100%" height="100%" cellspacing="0" cellpadding="0" style="height:100%;border-top:4px solid ${accent};border-radius:0 0 12px 12px;background:#f6faee"><tr><td valign="top" style="padding:16px 17px"><p style="margin:0 0 7px;color:${brand};font-size:14px;font-weight:800;line-height:1.4">${escapeHtml(highlight.title)}</p><p style="margin:0;color:${ink};font-size:13px;line-height:1.55">${highlight.content}</p></td></tr></table></td>`).join("")}</tr></table>`
  : "";
const actionLink = (action, primary) => `<a href="${escapeHtml(action.url)}" style="box-sizing:border-box;display:block;width:100%;border:${primary ? `1px solid ${brand}` : "1px solid #9cb4aa"};border-radius:10px;background:${primary ? brand : "#ffffff"};color:${primary ? "#ffffff" : brand};font-size:14px;font-weight:800;line-height:20px;padding:14px 18px;text-align:center;text-decoration:none">${escapeHtml(action.label)}${primary ? `&nbsp;&nbsp;<span style="color:${accent}">→</span>` : ""}</a>`;
const secondaryButtons = secondaryActions.length
  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px"><tr>${secondaryActions.map((action, index) => `<td class="action-cell" width="${100 / secondaryActions.length}%" style="padding:${index ? "0 0 0 5px" : "0 5px 0 0"}">${actionLink(action, false)}</td>`).join("")}</tr></table>`
  : "";
const buttons = primaryAction
  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0 4px"><tr><td>${actionLink(primaryAction, true)}</td></tr></table>${secondaryButtons}`
  : "";
const preheader = escapeHtml(subject);
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title><style>@media only screen and (max-width:600px){.email-shell{padding:16px 10px!important}.email-header{padding:22px 20px!important}.email-content{padding:28px 20px!important}.email-title{font-size:27px!important;line-height:1.2!important}.action-cell,.notice-cell{display:block!important;width:100%!important;padding:5px 0!important}.brand-logo{width:172px!important}.portal-label{display:none!important}}</style></head><body style="margin:0;background:#edf3f0;font-family:Arial,Helvetica,sans-serif;color:${ink}"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf3f0"><tr><td class="email-shell" align="center" style="padding:38px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;border:1px solid #d8e4de;border-radius:18px;background:#ffffff;box-shadow:0 12px 30px rgba(7,44,37,.08);overflow:hidden"><tr><td class="email-header" style="padding:25px 34px;background:${headerBackground}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td valign="middle"><img class="brand-logo" src="${siteUrl}/assets/brand/cci-logo-white.webp" width="190" alt="Cámara de Comercio de Ica" style="display:block;width:190px;max-width:100%;height:auto;border:0"></td><td class="portal-label" align="right" valign="middle"><p style="margin:0;color:#c5d0cc;font-size:11px;font-weight:700;letter-spacing:1.1px;line-height:1.4;text-transform:uppercase">Portal de actividades</p></td></tr></table></td></tr><tr><td style="height:6px;background:${accent};font-size:0;line-height:0">&nbsp;</td></tr><tr><td class="email-content" style="padding:38px 40px 36px"><p style="margin:0 0 11px;color:#507065;font-size:11px;font-weight:800;letter-spacing:1.5px;line-height:1.4;text-transform:uppercase">${escapeHtml(eyebrow)}</p><h1 class="email-title" style="margin:0 0 24px;color:${brand};font-size:32px;font-weight:800;letter-spacing:-.5px;line-height:1.22">${heading}</h1><div>${message}</div>${highlightGrid}${buttons}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:34px;border-top:1px solid #dce6e1"><tr><td style="padding-top:22px"><p style="margin:0 0 8px;color:${muted};font-size:12px;line-height:1.55">Este es un mensaje automático enviado por la Cámara de Comercio de Ica.</p><p style="margin:0;color:${muted};font-size:12px;line-height:1.55">Si no reconoces esta operación, responde a este correo para recibir ayuda.</p></td></tr></table></td></tr><tr><td style="padding:19px 34px;background:${surface};text-align:center"><a href="${siteUrl}" style="color:${brand};font-size:12px;font-weight:700;text-decoration:none">eventosycursos.camaraica.org.pe</a></td></tr></table></td></tr></table></body></html>`;

const replyTo = typeof payload.contact_email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact_email)
  ? payload.contact_email
  : undefined;

return [{ json: { html, notificationId, replyTo, subject, to: recipientEmail } }];
