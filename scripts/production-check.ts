import { loadEnvConfig } from "@next/env";

import type { ProductionVariable } from "./types/production-check.types";

loadEnvConfig(process.cwd());

const VARIABLES: ProductionVariable[] = [
  { kind: "public", name: "NEXT_PUBLIC_SUPABASE_URL", url: true },
  { kind: "public", name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" },
  { kind: "public", name: "NEXT_PUBLIC_SITE_URL", url: true },
  { kind: "secret", name: "SUPABASE_SERVICE_ROLE_KEY" },
  { kind: "secret", name: "N8N_WEBHOOK_URL", url: true },
  { kind: "secret", name: "N8N_WEBHOOK_SECRET" },
];

function isPlaceholder(value: string): boolean {
  return /localhost|127\.0\.0\.1|example|replace-with|your-/i.test(value);
}

function validateVariable(variable: ProductionVariable): string | null {
  const value = process.env[variable.name]?.trim();
  if (!value) return `${variable.name}: ausente`;
  if (isPlaceholder(value)) return `${variable.name}: valor local o de ejemplo`;
  if (variable.url) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return `${variable.name}: debe usar HTTPS`;
    } catch {
      return `${variable.name}: URL inválida`;
    }
  } else if (value.length < 20) {
    return `${variable.name}: valor demasiado corto`;
  }
  return null;
}

const errors = VARIABLES.map(validateVariable).filter((error): error is string => Boolean(error));
if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  errors.push("Las claves pública y service_role no pueden ser iguales");
}

if (errors.length) {
  console.error("Configuración de producción incompleta:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Configuración validada: ${VARIABLES.filter((item) => item.kind === "public").length} variables públicas y ${VARIABLES.filter((item) => item.kind === "secret").length} secretos.`);
}
