import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BillingCompanies } from "@/features/billing/components/BillingCompanies";
import { BillingPagination } from "@/features/billing/components/BillingPagination";
import { billingListUrl, billingUrl, parseBillingFilters } from "@/features/billing/utils/billing-filters";

const activityId = "30000000-0000-4000-8000-000000000001";
const requestId = "30000000-0000-4000-8000-000000000002";
const ruc = "20111111111";
const filters = parseBillingFilters({ solicitud: requestId, empresa: ruc, q: "Empresa", comprobante: "factura", estado: "pending", pagina: "2", pagina_solicitudes: "3" });

test("navegación del listado elimina solo el detalle sin mutar filtros ni enlaces directos", () => {
  const url = new URL(billingListUrl(activityId, filters), "http://local.invalid");
  assert.equal(url.searchParams.has("solicitud"), false);
  assert.equal(url.searchParams.get("empresa"), ruc);
  assert.equal(url.searchParams.get("q"), "Empresa");
  assert.equal(url.searchParams.get("comprobante"), "factura");
  assert.equal(url.searchParams.get("estado"), "pending");
  assert.equal(url.searchParams.get("pagina"), "2");
  assert.equal(url.searchParams.get("pagina_solicitudes"), "3");
  assert.equal(filters.requestId, requestId);
  assert.equal(new URL(billingUrl(activityId, filters), "http://local.invalid").searchParams.get("solicitud"), requestId);
});

test("Ver solicitudes y Cerrar empresa nunca reabren el comprobante anterior", () => {
  const companies = [{ company_key: ruc, company_ruc: ruc, company_name: "Empresa", request_count: 2, pending_amount: 600, validated_amount: 0, participation_amount: 600, total_count: 1 }];
  for (const company of [undefined, ruc]) {
    const markup = renderToStaticMarkup(createElement(BillingCompanies, { activityId, companies, filters: { ...filters, company } }, createElement("p", {}, "Listado de solicitudes")));
    assert.doesNotMatch(markup, /solicitud=/);
    assert.match(markup, company ? /Cerrar −/ : /Ver solicitudes \+/);
    assert.match(markup, /pagina_solicitudes=1/);
    assert.equal(markup.includes("Listado de solicitudes"), Boolean(company));
    assert.equal(markup.includes(`empresa=${ruc}`), !company);
  }
});

test("paginación de empresas y solicitudes conserva filtros pero no arrastra un popup cerrado", () => {
  for (const company of [false, true]) {
    const markup = renderToStaticMarkup(createElement(BillingPagination, { activityId, filters, page: 2, pageCount: 3, company }));
    assert.doesNotMatch(markup, /solicitud=/);
    assert.match(markup, /q=Empresa/);
    assert.match(markup, /comprobante=factura/);
    assert.match(markup, /Anterior/);
    assert.match(markup, /Siguiente/);
    assert.match(markup, company ? /pagina_solicitudes=1/ : /pagina=1/);
  }
});
