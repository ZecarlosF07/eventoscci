import assert from "node:assert/strict";
import test from "node:test";

import { createClient } from "@supabase/supabase-js";

import { syncActivityMediaWithClient } from "@/features/activities/services/sync-activity-media";
import type { Database } from "@/lib/supabase/database.types";

test("reemplazar banner y programa conserva los archivos publicados anteriores", async () => {
  const requests: { method: string; path: string; body: string }[] = [];
  const client = createClient<Database>("https://storage.example.test", "test-key", {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (input, init) => {
        const path = new URL(String(input)).pathname;
        const method = init?.method ?? "GET";
        requests.push({ body: String(init?.body ?? ""), method, path });
        if (method === "GET") {
          return Response.json({ banner_path: "event/old-banner.png", program_image_paths: ["event/program/old.png"] });
        }
        return Response.json({});
      },
    },
  });

  await syncActivityMediaWithClient(client, {
    bannerStagedPath: "staging/00000000-0000-4000-8000-000000000001.png",
    programStagedPaths: ["staging/00000000-0000-4000-8000-000000000002.png"],
    retainedProgramPaths: [],
  }, "event");

  assert.equal(requests.filter((request) => request.path.endsWith("/move")).length, 2);
  const update = requests.find((request) => request.method === "PATCH");
  assert.ok(update);
  const payload = JSON.parse(update.body);
  assert.match(payload.banner_path, /^event\/[0-9a-f-]+\.png$/);
  assert.equal(payload.program_image_paths.length, 1);
  assert.equal(requests.some((request) => request.method === "DELETE"), false);
});

test("si falla la asociación solo limpia cargas nuevas, nunca los archivos anteriores", async () => {
  const deletedBodies: string[] = [];
  const client = createClient<Database>("https://storage.example.test", "test-key", {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (_input, init) => {
        if (init?.method === "GET") {
          return Response.json({ banner_path: "event/old-banner.png", program_image_paths: ["event/program/old.png"] });
        }
        if (init?.method === "PATCH") {
          return Response.json({ code: "42501", message: "update denied" }, { status: 403 });
        }
        if (init?.method === "DELETE") deletedBodies.push(String(init.body));
        return Response.json({});
      },
    },
  });

  await assert.rejects(syncActivityMediaWithClient(client, {
    bannerStagedPath: "staging/00000000-0000-4000-8000-000000000001.png",
    programStagedPaths: [],
    retainedProgramPaths: [],
  }, "event"), /las imágenes no pudieron asociarse/);

  assert.equal(deletedBodies.length, 1);
  const cleanup = JSON.parse(deletedBodies[0]);
  assert.equal(cleanup.prefixes.length, 2);
  assert.equal(cleanup.prefixes.includes("event/old-banner.png"), false);
  assert.equal(cleanup.prefixes.includes("event/program/old.png"), false);
});
