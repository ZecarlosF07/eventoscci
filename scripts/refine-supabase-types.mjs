import { readFileSync, writeFileSync } from "node:fs";

const path = "src/lib/supabase/database.types.ts";
let source = readFileSync(path, "utf8");
const certificateMode = '"none" | "included" | "optional_paid"';

for (const [field, expected] of [
  ["certificate_mode", 1],
  ["certificate_mode_snapshot", 4],
]) {
  const original = `${field}: string`;
  const count = source.split(original).length - 1;
  if (count !== expected) {
    throw new Error(`Expected ${expected} generated ${field} row type(s), found ${count}.`);
  }
  source = source.replaceAll(original, `${field}: ${certificateMode}`);
}

// PostgreSQL permite NULL explícito en estos argumentos/resultados; el generador
// no distingue esa nulabilidad en las funciones SQL.
source = source.replace(
  /(prepare_speaker_certificates: \{[\s\S]*?p_template_id: )string/,
  "$1string | null",
);
source = source.replace(
  /(claim_speaker_certificate: \{[\s\S]*?Returns: )string/,
  "$1string | null",
);
source = source.replace(
  /(get_speaker_document_context: \{[\s\S]*?document_number: )string/,
  "$1string | null",
);

writeFileSync(path, source);
