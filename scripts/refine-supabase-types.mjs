import { readFileSync, writeFileSync } from "node:fs";

const path = "src/lib/supabase/database.types.ts";
let source = readFileSync(path, "utf8");
const certificateMode = '"none" | "included" | "optional_paid"';

for (const [field, expected] of [
  ["certificate_mode", 1],
  ["certificate_mode_snapshot", 2],
]) {
  const original = `${field}: string`;
  const count = source.split(original).length - 1;
  if (count !== expected) {
    throw new Error(`Expected ${expected} generated ${field} row type(s), found ${count}.`);
  }
  source = source.replaceAll(original, `${field}: ${certificateMode}`);
}

writeFileSync(path, source);
