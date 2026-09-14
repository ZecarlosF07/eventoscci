import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { BannerImage } from "@/components/molecules/BannerImage";
import { BANNER_ARC_COUNT, BANNER_ARC_GAP, BANNER_ARC_RADII } from "@/components/molecules/BannerImage/constants/banner-arcs.constants";
import { PublicFooter } from "@/components/organisms/PublicFooter/PublicFooter";
import { CATALOG_CAROUSEL_INTERVAL_MS } from "@/features/catalog/components/CatalogHeroCarousel/constants/carousel-timing";

const BANNER_PROPS = {
  alt: "Banner de actividad CCI",
  sizes: "(min-width: 1024px) 33vw, 100vw",
  src: "/assets/brand/cci-logo-dark.webp",
};

test("el banner completo permanece estático sobre un fondo institucional decorativo", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  const images = markup.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(images.length, 1);
  assert.match(markup, /aria-hidden="true" class="pointer-events-none/);
  assert.match(markup, /from-cci-800 via-cci-900 to-cci-950/);
  assert.match(images[0], /alt="Banner de actividad CCI"/);
  assert.match(images[0], /object-contain/);
  assert.doesNotMatch(images[0], /object-cover|blur-|scale-|animate-/);
  for (const image of images) {
    assert.ok(image.includes(`sizes="${BANNER_PROPS.sizes}"`));
    assert.match(image, /loading="lazy"/);
  }
  assert.match(markup, /^<div class="absolute inset-0 isolate overflow-hidden">/);
});

test("el hero precarga el banner sin duplicar precargas y conserva los estados visuales", () => {
  const markup = renderToStaticMarkup(BannerImage({
    ...BANNER_PROPS,
    className: "transition group-hover:brightness-110",
    preload: true,
  }));
  const images = markup.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(images[0]);
  assert.equal(images.length, 1);
  assert.doesNotMatch(images[0], /loading="lazy"/);
  assert.match(images[0], /object-contain transition group-hover:brightness-110/);
  assert.equal((markup.match(/rel="preload"/g) ?? []).length, 1);
});

test("las animaciones son continuas, respetan movimiento reducido y permiten pausa global", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  const animatedElements = markup.match(/class="[^"]*animate-[^"]*"/g) ?? [];
  assert.equal(animatedElements.length, 5);
  for (const element of animatedElements) {
    assert.match(element, /motion-safe:animate-/);
    assert.doesNotMatch(element, /animation-iteration-count/);
  }
  assert.match(markup, /html:has\(#pause-banner-motion:checked\)/);
  assert.match(markup, /animation-play-state:paused/);
});

test("el fondo usa arcos concéntricos muy próximos a ambos costados, sin rayas rectas", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  assert.match(markup, /-scale-x-100/);
  assert.equal((markup.match(/<svg\b/g) ?? []).length, 4);
  assert.equal((markup.match(/<circle\b/g) ?? []).length, BANNER_ARC_COUNT * 4);
  assert.match(markup, /text-cci-lime/);
  assert.doesNotMatch(markup, /repeating-linear-gradient|animate-banner-light|animate-ping/);
  for (let index = 1; index < BANNER_ARC_RADII.length; index += 1) {
    assert.equal(BANNER_ARC_RADII[index - 1] - BANNER_ARC_RADII[index], BANNER_ARC_GAP);
  }
});

test("una sola cascada ilumina todos los arcos juntos y dura lo mismo que una diapositiva", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  assert.equal((markup.match(/data-banner-cascade=""/g) ?? []).length, 1);
  assert.match(markup, /motion-safe:animate-banner-cascade/);
  assert.match(markup, /mask-size:100%_300%/);
  assert.doesNotMatch(markup, /animate-spin|stroke-dasharray|stroke-dashoffset|animation-delay/);
  const styles = readFileSync("src/app/globals.css", "utf8");
  const cycleSeconds = Number(styles.match(/--animate-banner-cascade:\s*banner-cascade\s*([\d.]+)s/)?.[1]);
  assert.equal(cycleSeconds * 1_000, CATALOG_CAROUSEL_INTERVAL_MS);
  assert.match(styles, /from\s*\{\s*mask-position: 0 100%;\s*\}/);
  assert.match(styles, /to\s*\{\s*mask-position: 0 0%;\s*\}/);
});

test("el pie de página ofrece una pausa nativa, fuera de los enlaces de los banners", () => {
  const markup = renderToStaticMarkup(PublicFooter());
  assert.match(markup, /id="pause-banner-motion"/);
  assert.match(markup, /type="checkbox"/);
  assert.match(markup, /Pausar animaciones de banners/);
});

test("dos luces arriba y dos abajo salen del centro hacia los extremos, sincronizadas y con el mismo ancho", () => {
  const markup = renderToStaticMarkup(BannerImage(BANNER_PROPS));
  assert.equal((markup.match(/data-banner-edge-glow=""/g) ?? []).length, 1);
  assert.equal((markup.match(/data-banner-half-glow=""/g) ?? []).length, 4);
  assert.equal((markup.match(/motion-safe:animate-banner-edge-glow/g) ?? []).length, 4);
  for (const edge of ["top-0", "bottom-0"]) {
    assert.ok(markup.includes(`w-1/2 overflow-hidden ${edge} left-0 -scale-x-100`));
    assert.ok(markup.includes(`w-1/2 overflow-hidden ${edge} right-0`));
  }
  assert.match(markup, /motion-safe:animate-banner-edge-glow/);
  assert.equal((markup.match(/top-0 h-2\.5 w-1\/2 rounded-full/g) ?? []).length, 4);
  assert.match(markup, /via-cci-lime via-75% to-transparent/);
  assert.match(markup, /top-0/);
  assert.match(markup, /bottom-0/);
  assert.ok(markup.indexOf("data-banner-edge-glow") < markup.indexOf("<img"));
  const styles = readFileSync("src/app/globals.css", "utf8");
  const seconds = Number(styles.match(/--animate-banner-edge-glow:\s*banner-edge-glow\s*([\d.]+)s/)?.[1]);
  assert.equal(seconds * 1_000, CATALOG_CAROUSEL_INTERVAL_MS);
  assert.match(styles, /from\s*\{\s*transform: translateX\(-110%\);\s*\}/);
  assert.match(styles, /85%,\s*to\s*\{\s*transform: translateX\(210%\);\s*\}/);
});
