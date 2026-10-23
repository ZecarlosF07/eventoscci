import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { z } from "zod";

import { canIssueSpeakerCertificate, hasValidSpeakerCertificateEmail } from "../../src/features/certificates/utils/speaker-certificate-eligibility";
import type { SpeakerCertificateCandidate } from "../../src/features/certificates/types/speaker-certificate.types";

const candidate: SpeakerCertificateCandidate = {
  accessToken: null, certificateCode: null, certificateId: null, certificateName: null,
  certificateStatus: null, documentContext: { canCorrect: true, documentNumber: "04180001", hasCertificates: false },
  email: "ponente@example.test", filePath: null, firstNames: "Ana", lastNames: "Pérez", organization: null,
  photoPath: null, roleLabel: "Ponente", speakerId: "d4000000-0000-4000-8000-000000000001",
};

test("el correo requerido rechaza nulos, vacíos y formatos inválidos", () => {
  for (const email of [null, undefined, "", " ", "sin-correo", "persona@example.c", ".persona@example.test", "persona..correo@example.test"]) {
    assert.equal(hasValidSpeakerCertificateEmail(email), false, String(email));
  }
  assert.equal(hasValidSpeakerCertificateEmail(" persona+certificado@example.test "), true);
});

test("seleccionar para emitir exige DNI y correo válido, incluso al recuperar pendientes", () => {
  assert.equal(canIssueSpeakerCertificate(candidate), true);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, email: null }), false);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, email: "inválido" }), false);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, documentContext: { ...candidate.documentContext, documentNumber: null } }), false);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, certificateId: candidate.speakerId, email: null, certificateStatus: "issued" }), false);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, certificateId: candidate.speakerId, certificateStatus: "issued" }), true);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, certificateId: candidate.speakerId, certificateStatus: "revoked" }), false);
  assert.equal(canIssueSpeakerCertificate({ ...candidate, certificateId: candidate.speakerId, filePath: "issued/file.pdf" }), false);
  assert.equal(canIssueSpeakerCertificate(candidate, true), false);
});

test("la selección visible y el envío excluyen seleccionados que perdieron su correo al editar el perfil", () => {
  const source = readFileSync("src/features/certificates/components/SpeakerCertificateTable/SpeakerCertificateTable.tsx", "utf8");
  assert.match(source, /canIssueSpeakerCertificate\(candidate, readOnly\)/);
  assert.match(source, /selectedForEmission.map/);
  assert.match(source, /!selectedForEmission.length/);
  assert.doesNotMatch(source, /entrega manual|manualDelivery/i);
  const action = readFileSync("src/features/certificates/mutations/speaker-certificate.actions.ts", "utf8");
  assert.match(action, /hasValidSpeakerCertificateEmail\(emails.get\(id\)\)/);
  assert.match(action, /from\("speaker_private_details"\)/);
});

test("la migración conserva el mismo patrón de validación de correo que Zod", () => {
  const migration = readFileSync("supabase/migrations/202610230003_speaker_certificate_email_required.sql", "utf8");
  const pattern = migration.match(/\$email\$([\s\S]*?)\$email\$/)?.[1];
  assert.equal(pattern, z.regexes.email.source);
  assert.match(migration, /for update/);
  assert.match(migration, /SPEAKER_EMAIL_REQUIRED/);
});
