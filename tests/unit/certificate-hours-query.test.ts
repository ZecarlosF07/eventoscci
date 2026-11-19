import assert from "node:assert/strict";
import test from "node:test";

import { createClient } from "@supabase/supabase-js";

import { countOutdatedActivityCertificateHours, getOutdatedActivityCertificateHoursQuery } from "@/features/certificates/queries/get-outdated-activity-certificate-hours";
import { certificateGenerationSchema } from "@/features/certificates/schemas/certificate-query.schema";
import type { Database } from "@/lib/supabase/database.types";

test("la consulta de corrección devuelve todos los campos que exige el generador PDF", async () => {
  const activityId = crypto.randomUUID();
  const certificate = {
    id: crypto.randomUUID(), access_token: crypto.randomUUID(),
    academic_hours_snapshot: 8, certificate_code: "CCI-CERT-2026-000522",
    certificate_type: "activity", recipient_type: "participant",
    condition_snapshot: "Participó", date_text_snapshot: "19/11/2026",
    file_path: "issued/example/certificate.pdf", participant_name_snapshot: "Participante de prueba",
    status: "issued", template_id: crypto.randomUUID(), template_snapshot: null,
    title_snapshot: "Actividad de prueba",
  };
  const client = createClient<Database>("https://database.example.test", "test-key", {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (request) => {
        const url = new URL(String(request));
        assert.equal(url.searchParams.get("registration.activity_id"), `eq.${activityId}`);
        assert.equal(url.searchParams.get("status"), "eq.issued");
        assert.equal(url.searchParams.get("certificate_type"), "eq.activity");
        assert.equal(url.searchParams.get("file_path"), "not.is.null");
        assert.equal(url.searchParams.get("or"), "(academic_hours_snapshot.is.null,academic_hours_snapshot.neq.125)");
        const columns = url.searchParams.get("select")?.split(",") ?? [];
        const projected = Object.fromEntries(Object.entries(certificate).filter(([key]) => columns.includes(key)));
        return Response.json([projected], { headers: { "Content-Range": "0-0/1" } });
      },
    },
  });
  const result = await getOutdatedActivityCertificateHoursQuery(client, activityId, 125);
  assert.equal(result.error, null);
  assert.equal(result.count, 1);
  const parsed = certificateGenerationSchema.parse(result.data?.[0]);
  assert.equal(parsed.recipient_type, "participant");
  assert.equal(parsed.academic_hours_snapshot, 8);
  assert.equal(parsed.certificate_code, certificate.certificate_code);
});

test("el conteo de pendientes consulta solo cabeceras y conserva las horas objetivo", async () => {
  const client = createClient<Database>("https://database.example.test", "test-key", {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (request, init) => {
        assert.equal(init?.method, "HEAD");
        assert.equal(new URL(String(request)).searchParams.get("or"), "(academic_hours_snapshot.is.null,academic_hours_snapshot.neq.125)");
        return new Response(null, { headers: { "Content-Range": "0-7/8" } });
      },
    },
  });
  assert.equal(await countOutdatedActivityCertificateHours(client, crypto.randomUUID(), 125), 8);
});

test("detecta cambios de título aunque las horas coincidan y protege títulos con comas y comillas", async () => {
  const title = 'Gestión, liderazgo y "transformación" (2026)';
  let requests = 0;
  const client = createClient<Database>("https://database.example.test", "test-key", {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (request, init) => {
        requests++;
        const filter = new URL(String(request)).searchParams.get("or");
        assert.equal(filter, `(academic_hours_snapshot.is.null,academic_hours_snapshot.neq.125,title_snapshot.neq.${JSON.stringify(title)})`);
        if (init?.method === "HEAD") return new Response(null, { headers: { "Content-Range": "0-0/1" } });
        return Response.json([{ academic_hours_snapshot: 125, title_snapshot: "Título anterior" }], {
          headers: { "Content-Range": "0-0/1" },
        });
      },
    },
  });
  const rows = await getOutdatedActivityCertificateHoursQuery(client, crypto.randomUUID(), 125, false, title);
  assert.equal(rows.data?.length, 1);
  assert.equal(rows.data[0].academic_hours_snapshot, 125);
  assert.notEqual(rows.data[0].title_snapshot, title);
  assert.equal(await countOutdatedActivityCertificateHours(client, crypto.randomUUID(), 125, title), 1);
  assert.equal(requests, 2);
});
