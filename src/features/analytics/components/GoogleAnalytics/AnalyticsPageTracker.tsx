"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "next/navigation";

import { trackAnalyticsEvent } from "@/features/analytics/services/track-analytics-event.client";

function getContentType(pathname: string): string | null {
  if (/^\/eventos\/[^/]+$/.test(pathname)) return "event";
  if (/^\/capacitaciones\/[^/]+$/.test(pathname)) return "training";
  if (/^\/cursos\/[^/]+$/.test(pathname)) return "course";
  return null;
}

export function AnalyticsPageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!window.gtag || lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.gtag("event", "page_view", { page_location: window.location.href, page_path: pathname });
    const contentType = getContentType(pathname);
    if (contentType) {
      trackAnalyticsEvent("content_viewed", { content_path: pathname, content_type: contentType });
    }
  }, [pathname]);

  return null;
}
