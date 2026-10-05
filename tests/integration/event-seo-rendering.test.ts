import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.SEO_TEST_BASE_URL ?? "http://127.0.0.1:3101";

async function page(path: string) {
  const response = await fetch(new URL(path, baseUrl), { headers: { "User-Agent": "Googlebot" } });
  return { html: await response.text(), status: response.status };
}

function jsonLd(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap((match) => JSON.parse(match[1]));
}

test("inicio renderiza un único H1 permanente antes de las secciones y conserva canonical", async () => {
  const { html, status } = await page("/");
  assert.equal(status, 200);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.match(html, /<h1[^>]*>Eventos, capacitaciones y cursos en Ica, Perú<\/h1>/);
  assert.match(html, /<h2[^>]*>Próximos eventos en Ica, Perú<\/h2>/);
  assert.match(html, /rel="canonical"/);
});

test("catálogo e historial conservan contenido HTML, enlaces rastreables y breadcrumbs", async () => {
  const catalog = await page("/eventos");
  const history = await page("/eventos/realizados");
  assert.equal(catalog.status, 200);
  assert.equal(history.status, 200);
  assert.match(catalog.html, /Eventos en Ica: agenda y próximos encuentros/);
  assert.match(catalog.html, /Consulta la agenda de eventos en Ica/);
  assert.match(catalog.html, /href="\/eventos\/realizados"/);
  assert.match(history.html, /<h1[^>]*>Eventos realizados en Ica<\/h1>/);
  assert.match(history.html, /rel="canonical" href="https?:\/\/[^\"]+\/eventos\/realizados"/);
  assert.equal((history.html.match(/<main[ >]/g) ?? []).length, 1);
  assert.equal(jsonLd(history.html).some((item) => item["@type"] === "BreadcrumbList"), true);
  assert.equal(jsonLd(catalog.html).some((item) => item["@type"] === "Event"), false);
  assert.equal(jsonLd(history.html).some((item) => item["@type"] === "Event"), false);
});

test("filtros mantienen noindex y el contenido institucional aun con cero resultados", async () => {
  for (const path of ["/eventos", "/eventos/realizados"]) {
    const { html, status } = await page(`${path}?q=SEO_NO_MATCH_20261005`);
    assert.equal(status, 200);
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.match(html, new RegExp(`rel="canonical" href="https?://[^\"]+${path}"`));
    assert.match(html, path.endsWith("realizados") ? /Encuentros anteriores/ : /Consulta la agenda de eventos en Ica/);
  }
});

test("historial fuera de rango responde 404 y sitemap anuncia su ruta", async () => {
  assert.equal((await page("/eventos/realizados?pagina=2147483647")).status, 404);
  const { html, status } = await page("/sitemap.xml");
  assert.equal(status, 200);
  assert.match(html, /<loc>https?:\/\/[^<]+\/eventos\/realizados<\/loc>/);
});

test("capacitaciones mantiene su título y canonical", async () => {
  const { html, status } = await page("/capacitaciones");
  assert.equal(status, 200);
  assert.match(html, /Capacitaciones empresariales en Ica y virtuales/);
  assert.match(html, /rel="canonical" href="https?:\/\/[^\"]+\/capacitaciones"/);
});
