import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env/server-env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    host: siteUrl,
    rules: {
      allow: "/",
      disallow: [
        "/admin",
        "/auth",
        "/campus",
      ],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
