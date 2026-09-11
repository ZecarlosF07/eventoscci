import "server-only";

import type {
  CertificateServerEnv,
  NotificationCronServerEnv,
  NotificationServerEnv,
} from "@/lib/env/types/server-env.types";
import { getPublicEnv } from "@/lib/env/public-env";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configura ${name} en el entorno del servidor.`);
  return value;
}

function validUrl(value: string, name: string): string {
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error(`${name} debe ser una URL válida.`, { cause: error });
  }
}

function canonicalSiteUrl(value: string): string {
  const url = new URL(validUrl(value, "NEXT_PUBLIC_SITE_URL"));
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!isLocal && url.protocol === "http:") url.protocol = "https:";
  return url.toString().replace(/\/$/, "");
}

export function getCertificateServerEnv(): CertificateServerEnv {
  const { supabaseUrl } = getPublicEnv();
  return {
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    siteUrl: getSiteUrl(),
    supabaseUrl,
  };
}

export function getSiteUrl(): string {
  const fallbackUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
  return canonicalSiteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackUrl);
}

export function getNotificationServerEnv(): NotificationServerEnv {
  return {
    ...getCertificateServerEnv(),
    n8nWebhookSecret: required("N8N_WEBHOOK_SECRET"),
    n8nWebhookUrl: validUrl(required("N8N_WEBHOOK_URL"), "N8N_WEBHOOK_URL"),
  };
}

export function getNotificationCronServerEnv(): NotificationCronServerEnv {
  return { notificationCronSecret: required("NOTIFICATION_CRON_SECRET") };
}
