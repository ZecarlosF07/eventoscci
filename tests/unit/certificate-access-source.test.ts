import assert from "node:assert/strict";
import test from "node:test";

import { getCertificateAccessSource } from "../../src/features/certificates/utils/certificate-access-source";

test("identifies links explicitly marked as email", () => {
  assert.equal(getCertificateAccessSource("?origen=correo", "", "https://cci.test"), "email");
});

test("identifies navigation from the public DNI search", () => {
  assert.equal(getCertificateAccessSource("", "https://cci.test/certificados", "https://cci.test"), "public_search");
});

test("does not attribute another site's referrer to the DNI search", () => {
  assert.equal(getCertificateAccessSource("", "https://example.com/certificados", "https://cci.test"), "direct");
});

test("identifies an email marker retained in the certificate referrer", () => {
  assert.equal(getCertificateAccessSource("", "https://cci.test/certificados/token?origen=correo", "https://cci.test"), "email");
});
