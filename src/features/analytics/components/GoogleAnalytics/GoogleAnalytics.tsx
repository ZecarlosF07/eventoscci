"use client";

import { Suspense } from "react";

import Script from "next/script";

import { AnalyticsPageTracker } from "@/features/analytics/components/GoogleAnalytics/AnalyticsPageTracker";
import type { GoogleAnalyticsProps } from "@/features/analytics/types/analytics.types";

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false});`}
      </Script>
      <Suspense fallback={null}><AnalyticsPageTracker /></Suspense>
    </>
  );
}
