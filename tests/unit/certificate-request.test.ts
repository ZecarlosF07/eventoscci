import assert from "node:assert/strict";
import test from "node:test";

import { getCertificateRequestWhatsAppUrl } from "../../src/features/registrations/utils/certificate-request-whatsapp";

test("construye el enlace al WhatsApp del responsable con la referencia operativa", () => {
  const url = getCertificateRequestWhatsAppUrl({
    activityTitle: "Seminario tributario",
    certificatePrice: 35,
    phone: "987 654 321",
    registrationCode: "CCI-2026-000123",
    registrationType: "member",
  });
  assert.ok(url?.startsWith("https://wa.me/51987654321?text="));
  const message = decodeURIComponent(url?.split("text=")[1] ?? "");
  assert.match(message, /CCI-2026-000123/);
  assert.match(message, /S\/\s*35/);
  assert.doesNotMatch(message, /DNI|correo|nombre completo/i);
});

test("rechaza un teléfono de contacto inválido", () => {
  assert.equal(getCertificateRequestWhatsAppUrl({
    activityTitle: "Actividad",
    certificatePrice: 50,
    phone: "123",
    registrationCode: "CCI-2026-000123",
    registrationType: "general",
  }), null);
});
