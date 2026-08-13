import "server-only";

import type { CertificateServerEnv, NotificationServerEnv } from "@/lib/env/types/server-env.types";
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
  return validUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackUrl, "NEXT_PUBLIC_SITE_URL");
}

export function getNotificationServerEnv(): NotificationServerEnv {
  return {
    ...getCertificateServerEnv(),
    cronSecret: required("CRON_SECRET"),
    n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET?.trim() || undefined,
    n8nWebhookUrl: validUrl(required("N8N_WEBHOOK_URL"), "N8N_WEBHOOK_URL"),
  };
}
