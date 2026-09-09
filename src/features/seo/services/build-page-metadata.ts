import type { Metadata } from "next";

import { SITE_CONFIG } from "@/config/site";
import type { PageMetadataInput } from "@/features/seo/types/seo.types";
import { buildSeoDescription, buildSeoTitle } from "@/features/seo/utils/seo-text";

const DEFAULT_SOCIAL_IMAGE = "/opengraph-image";

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const description = buildSeoDescription(input.description, SITE_CONFIG.description);
  const title = buildSeoTitle(input.title);
  const image = input.image || DEFAULT_SOCIAL_IMAGE;
  const index = input.index ?? true;
  const follow = input.follow ?? index;

  return {
    alternates: { canonical: input.path },
    description,
    openGraph: {
      description,
      images: [{ alt: title, url: image }],
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.name,
      title,
      type: "website",
      url: input.path,
    },
    robots: { follow, index },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
      title,
    },
  };
}

export function buildNoIndexMetadata(title: string, follow = false): Metadata {
  return {
    alternates: { canonical: null },
    description: SITE_CONFIG.description,
    robots: { follow, index: false },
    title: buildSeoTitle(title),
  };
}
