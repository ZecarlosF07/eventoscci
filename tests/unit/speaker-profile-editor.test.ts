import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CatalogFormFields } from "../../src/features/catalogs/components/CatalogForm/CatalogFormFields";
import { speakerSchema } from "../../src/features/catalogs/schemas/catalog.schema";
import { SpeakerProfileEditor } from "../../src/features/certificates/components/SpeakerCertificateTable/SpeakerProfileEditor";
import type { SpeakerCertificateCandidate } from "../../src/features/certificates/types/speaker-certificate.types";
import { getSpeakerCertificateNames } from "../../src/features/certificates/utils/speaker-certificate-names";

const candidate: SpeakerCertificateCandidate = {
  accessToken: null, certificateCode: null, certificateId: null, certificateName: null,
  certificateStatus: null, documentContext: { canCorrect: true, documentNumber: null, hasCertificates: false },
  email: null, filePath: null, firstNames: "Ana", lastNames: "Pérez", organization: null,
  photoPath: null, roleLabel: "Ponente", speakerId: "d4000000-0000-4000-8000-000000000001",
};
const activityId = "c4000000-0000-4000-8000-000000000001";

test("datos del ponente indica correo obligatorio y ofrece completar sin navegar", () => {
  const html = renderToStaticMarkup(createElement(SpeakerProfileEditor, { activityId, candidate, disabled: false }));
  assert.match(html, /DNI pendiente/);
  assert.match(html, /Correo pendiente/);
  assert.match(html, /necesario para emitir/);
  assert.match(html, /Completar datos/);
  assert.doesNotMatch(html, /Entrega manual|Identidad privada|href=/);
});

test("con DNI y correo muestra edición y envío por correo, sin prometer una entrega ya realizada", () => {
  const complete = { ...candidate, email: "ponente@example.test", documentContext: { ...candidate.documentContext, documentNumber: "04180001" } };
  const html = renderToStaticMarkup(createElement(SpeakerProfileEditor, { activityId, candidate: complete, disabled: false }));
  assert.match(html, /Editar datos/);
  assert.match(html, /Envío por correo/);
  assert.match(html, /ponente@example.test/);
  assert.doesNotMatch(html, /Entrega manual|Correo enviado/);
});

test("una actividad de solo lectura no ofrece editar el perfil", () => {
  const html = renderToStaticMarkup(createElement(SpeakerProfileEditor, { activityId, candidate, disabled: true }));
  assert.doesNotMatch(html, /<button|Completar datos|Editar datos/);
});

test("el formulario reutilizado prioriza correo y teléfono y mantiene todos los campos y límites de fotografía", () => {
  const html = renderToStaticMarkup(createElement(CatalogFormFields, { kind: "speakers", contactFirst: true }));
  for (const name of ["first_names", "last_names", "email", "phone", "organization", "professional_title", "bio", "specialties", "notes", "photo", "linkedin_url", "website_url"]) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.ok(html.indexOf('name="email"') < html.indexOf('name="bio"'));
  assert.equal((html.match(/name="email"/g) ?? []).length, 1);
  assert.match(html, /Máximo 5 MB/);
  assert.match(html, /image\/jpeg,image\/png,image\/webp/);
});

test("se conservan validaciones de correo y de campos completos del catálogo", () => {
  const base = { bio: "", email: "ponente@example.test", first_names: "Ana", id: candidate.speakerId, is_active: true,
    last_names: "Pérez", linkedin_url: "", notes: "", organization: "CCI", phone: "999999999", professional_title: "",
    specialties: [], website_url: "" };
  assert.equal(speakerSchema.safeParse(base).success, true);
  assert.equal(speakerSchema.safeParse({ ...base, email: "no-es-correo" }).success, false);
  assert.equal(speakerSchema.safeParse({ ...base, first_names: "" }).success, false);
});

test("editar el catálogo actualiza nombres por defecto pero conserva texto personalizado y snapshots", () => {
  assert.equal(getSpeakerCertificateNames([candidate], {})[candidate.speakerId], "Ana Pérez");
  const updated = { ...candidate, firstNames: "Ana María" };
  assert.equal(getSpeakerCertificateNames([updated], {})[candidate.speakerId], "Ana María Pérez");
  assert.equal(getSpeakerCertificateNames([updated], { [candidate.speakerId]: "Dra. Ana Pérez" })[candidate.speakerId], "Dra. Ana Pérez");
  assert.equal(getSpeakerCertificateNames([{ ...updated, certificateName: "Nombre congelado" }], { [candidate.speakerId]: "Otro" })[candidate.speakerId], "Nombre congelado");
});

test("el diálogo carga bajo demanda, conserva el foco, evita formularios anidados y bloquea cierre al guardar", () => {
  const source = readFileSync("src/features/certificates/components/SpeakerCertificateTable/SpeakerProfileDialog.tsx", "utf8");
  assert.match(source, /showModal\(\)/);
  assert.match(source, /previousFocus.focus\(\)/);
  assert.match(source, /overflow-y-auto/);
  assert.match(source, /disabled=\{busy\}/);
  assert.match(source, /if \(!busy\) onClose\(\)/);
  assert.match(source, /getSpeakerProfileForCertificatesAction/);
  assert.match(source, /inlineDocument/);
  const form = readFileSync("src/features/catalogs/components/CatalogForm/CatalogForm.tsx", "utf8");
  assert.match(form, /event.stopPropagation\(\)/);
  assert.ok(form.indexOf("<SpeakerDocumentEditor") < form.indexOf("<form"));
});

test("las acciones de lectura y guardado verifican sesión, actividad, archivo y relación del ponente", () => {
  const reader = readFileSync("src/features/certificates/mutations/speaker-profile.actions.ts", "utf8");
  const writer = readFileSync("src/features/catalogs/mutations/catalog.actions.ts", "utf8").split("export async function saveSpeakerProfileFromCertificatesAction")[1].split("export async function setCatalogActiveAction")[0];
  for (const action of [reader, writer]) {
    assert.match(action, /await requireAdmin\(\)/);
    assert.match(action, /await getSpeakerProfileScopeError/);
  }
  assert.match(writer, /text\(formData, "id"\) !== speakerId/);
  assert.match(writer, /persistCatalogResult\("speakers", formData\)/);
  const scope = readFileSync("src/features/certificates/services/get-speaker-profile-scope.ts", "utf8");
  assert.match(scope, /z.uuid\(\).safeParse/);
  assert.match(scope, /status === "archived"/);
  assert.match(scope, /!assignment.data && !certificate.data/);
  assert.doesNotMatch(writer, /from\("certificates"\).*update|redirect\(/);
});
