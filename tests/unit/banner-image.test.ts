import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { BannerFrame, BannerImage } from "@/components/molecules/BannerImage";
import { VisualContentCard } from "@/components/molecules/VisualContentCard";
import { PublicFooter } from "@/components/organisms/PublicFooter/PublicFooter";
import { CatalogCard } from "@/features/catalog/components/CatalogCard/CatalogCard";

const BANNER_PROPS = {
  alt: "Banner de actividad CCI",
  sizes: "(min-width: 1024px) 33vw, 100vw",
  src: "/assets/brand/cci-logo-dark.webp",
};

test("el banner completo permanece centrado y estático sobre el fondo decorativo", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  const images = markup.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 1);
  assert.match(markup, /aria-hidden="true" class="pointer-events-none/);
  assert.match(images[0], /alt="Banner de actividad CCI"/);
  assert.match(images[0], /object-contain object-center/);
  assert.doesNotMatch(images[0], /object-cover|blur-|scale-|animate-|px-/);
  assert.ok(images[0].includes(`sizes="${BANNER_PROPS.sizes}"`));
  assert.match(images[0], /loading="lazy"/);
  assert.ok(markup.indexOf("data-banner-backdrop") < markup.indexOf("<img"));
  assert.ok(markup.indexOf("data-banner-led-edges") > markup.indexOf("<img"));
  assert.equal((markup.match(/data-banner-led=/g) ?? []).length, 2);
});

test("el hero precarga una sola imagen sin alterar su encuadre", () => {
  const markup = renderToStaticMarkup(BannerImage({ ...BANNER_PROPS, className: "transition group-hover:brightness-90", preload: true, backdropIntensity: "prominent" }));
  const images = markup.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 1);
  assert.doesNotMatch(images[0], /loading="lazy"/);
  assert.match(images[0], /object-contain object-center transition group-hover:brightness-90/);
  assert.equal((markup.match(/rel="preload"/g) ?? []).length, 1);
  assert.match(markup, /data-banner-backdrop="prominent"/);
});

test("los dos halos conservan luz estática sin CSS manual de componentes", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  assert.equal((markup.match(/data-banner-halo=/g) ?? []).length, 2);
  assert.match(markup, /data-banner-backdrop="subtle"/);
  assert.match(markup, /data-motion-state="static"/);
  assert.doesNotMatch(markup, /opacity-0|<svg|<circle|animate-ping/);
  const styles = readFileSync("src/app/globals.css", "utf8");
  assert.match(styles, /@import "tailwindcss"/);
  assert.match(styles, /@theme inline/);
  assert.doesNotMatch(styles, /@keyframes|@media|\.whatsapp-community-floating|--animate-/);
});

test("el marco conserva 5:2 y la tarjeta destacada no estira el banner según su texto", () => {
  const frame = renderToStaticMarkup(BannerFrame({ children: BannerImage(BANNER_PROPS) }));
  assert.match(frame, /aspect-\[5\/2\]/);
  assert.match(frame, /self-start/);
  const card = renderToStaticMarkup(CatalogCard({ action: "Ver detalles", bannerUrl: BANNER_PROPS.src, featured: true, href: "/eventos/prueba", id: "prueba", labels: "Presencial", metadata: "Fecha", price: "Gratuito", title: "Un título largo que ocupa varias líneas en una tarjeta destacada" }));
  assert.match(card, /data-banner-frame=""/);
  assert.doesNotMatch(card, /aspect-auto|min-h-60/);
  assert.ok(card.indexOf("<img") < card.indexOf("<h3"));
});

test("las actividades relacionadas muestran el texto después de la imagen", () => {
  const card = renderToStaticMarkup(VisualContentCard({ bannerUrl: BANNER_PROPS.src, href: "/eventos/prueba", meta: "Próxima fecha", title: "Evento relacionado" }));
  assert.match(card, /data-banner-frame=""/);
  assert.doesNotMatch(card, /translate-y-full|backdrop-blur/);
  assert.ok(card.indexOf("<img") < card.indexOf("<h3"));
  assert.match(card, /Evento relacionado/);
});

test("el pie conserva la pausa nativa fuera de los enlaces de banners", () => {
  const markup = renderToStaticMarkup(PublicFooter());
  assert.match(markup, /id="pause-banner-motion"/);
  assert.match(markup, /type="checkbox"/);
  assert.match(markup, /Pausar animaciones de banners/);
});
