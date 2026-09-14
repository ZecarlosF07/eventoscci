import assert from "node:assert/strict";
import test from "node:test";

import { fetchUncached } from "@/lib/supabase/utils/fetch-uncached";

test("las consultas Supabase omiten caché HTTP sin perder headers, método o señal", async (context) => {
  const controller = new AbortController();
  const mockedFetch = context.mock.method(globalThis, "fetch", async () => new Response("ok"));
  const headers = { Authorization: "Bearer test-key" };
  await fetchUncached("https://example.test/rest/v1/activities", {
    cache: "force-cache",
    headers,
    method: "POST",
    signal: controller.signal,
  });
  const [url, init] = mockedFetch.mock.calls[0].arguments;
  assert.equal(url, "https://example.test/rest/v1/activities");
  assert.equal(init?.cache, "no-store");
  assert.deepEqual(init?.headers, headers);
  assert.equal(init?.method, "POST");
  assert.equal(init?.signal, controller.signal);
});
