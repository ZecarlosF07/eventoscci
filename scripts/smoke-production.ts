import { loadEnvConfig } from "@next/env";

import type { SmokeExpectation } from "./types/production-check.types";

loadEnvConfig(process.cwd());

const baseUrlValue = process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL;
if (!baseUrlValue) throw new Error("Indica la URL: yarn smoke:production https://dominio");
const baseUrl = new URL(baseUrlValue);

const PAGES: SmokeExpectation[] = [
  { contains: "¿Qué deseas encontrar?", path: "/", status: 200 },
  { path: "/eventos", status: 200 },
  { contains: "Reserva tu lugar", path: "/eventos/encuentro-empresarial-cci-2026", status: 200 },
  { path: "/capacitaciones", status: 200 },
  { path: "/cursos", status: 200 },
  { path: "/login", status: 200 },
  { path: "/registro", status: 200 },
  { path: "/ruta-inexistente-hito-12", status: 404 },
];

async function assertPage(expectation: SmokeExpectation): Promise<void> {
  const response = await fetch(new URL(expectation.path, baseUrl), { redirect: "manual" });
  if (response.status !== expectation.status) {
    throw new Error(`${expectation.path}: esperado ${expectation.status}, recibido ${response.status}`);
  }
  if (expectation.contains) {
    const body = await response.text();
    if (!body.includes(expectation.contains)) {
      throw new Error(`${expectation.path}: falta el contenido esperado`);
    }
  }
  console.log(`OK ${expectation.status} ${expectation.path}`);
}

async function assertProtectedRedirect(path: string, destination: string): Promise<void> {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  if (![302, 303, 307, 308].includes(response.status) || !location.includes(destination)) {
    throw new Error(`${path}: no redirigió de forma segura a ${destination}`);
  }
  console.log(`OK ${response.status} ${path} → ${destination}`);
}

async function run(): Promise<void> {
  await Promise.all(PAGES.map(assertPage));
  await assertProtectedRedirect("/admin", "/admin/login");
  await assertProtectedRedirect("/campus", "/login");

  const health = await fetch(new URL("/api/health", baseUrl), { cache: "no-store" });
  const body = await health.json() as { status?: string };
  if (!health.ok || body.status !== "ok") throw new Error("El health check no está saludable");

  const root = await fetch(baseUrl);
  for (const header of ["content-security-policy", "x-content-type-options", "x-frame-options"]) {
    if (!root.headers.has(header)) throw new Error(`Falta cabecera de seguridad ${header}`);
  }
  console.log("OK health check y cabeceras de seguridad");
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Smoke test fallido");
  process.exitCode = 1;
});
