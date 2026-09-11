import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

import type { Database, Json } from "../src/lib/supabase/database.types";

const RESEND_ENTITY_TYPE = "registration_confirmation_resend";
const CONFIRMATION_EVENTS = [
  "activity_free_registration_confirmed",
  "activity_paid_registration_confirmed",
] as const;

type SummaryItem = {
  activityId: string;
  activityTitle: string;
  failed: number;
  sent: number;
  skipped: number;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configura ${name} antes de ejecutar el reenvío.`);
  return value;
}

function parseArguments(): { activityIds: string[]; execute: boolean } {
  const execute = process.argv.includes("--execute");
  const activityIds = process.argv
    .filter((argument) => argument.startsWith("--activity="))
    .map((argument) => argument.slice("--activity=".length).trim())
    .filter(Boolean);

  if (!activityIds.length) {
    throw new Error("Indica al menos un --activity=<uuid>.");
  }
  return { activityIds: [...new Set(activityIds)], execute };
}

function asObject(value: Json): Record<string, Json | undefined> {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  return value;
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { activityIds, execute } = parseArguments();
  const client = createClient<Database>(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
  const n8nWebhookUrl = required("N8N_WEBHOOK_URL");
  const n8nWebhookSecret = required("N8N_WEBHOOK_SECRET");

  const { data: activities, error: activitiesError } = await client
    .from("activities")
    .select("id,title,type,status,modality")
    .in("id", activityIds)
    .is("deleted_at", null);
  if (activitiesError) throw activitiesError;
  if (activities.length !== activityIds.length) {
    throw new Error("No se encontraron todas las actividades solicitadas.");
  }

  for (const activity of activities) {
    if (activity.type !== "training" || !["virtual", "hybrid"].includes(activity.modality)) {
      throw new Error(`${activity.title} no es una capacitación virtual o híbrida.`);
    }
    if (activity.status !== "published") {
      throw new Error(`${activity.title} no está publicada.`);
    }
  }

  const { data: accessRows, error: accessError } = await client
    .from("activity_virtual_access")
    .select("activity_id,virtual_url")
    .in("activity_id", activityIds);
  if (accessError) throw accessError;
  if (accessRows.length !== activityIds.length) {
    throw new Error("Alguna capacitación no tiene acceso virtual configurado.");
  }

  const { data: registrations, error: registrationsError } = await client
    .from("registrations")
    .select("id,activity_id")
    .in("activity_id", activityIds)
    .eq("status", "confirmed")
    .is("deleted_at", null);
  if (registrationsError) throw registrationsError;

  const registrationIds = registrations.map((registration) => registration.id);
  const { data: originalNotifications, error: notificationsError } = await client
    .from("notification_outbox")
    .select("id,event_type,person_id,recipient_email,related_entity_id,payload,status")
    .in("related_entity_id", registrationIds)
    .eq("related_entity_type", "registration")
    .in("event_type", [...CONFIRMATION_EVENTS])
    .eq("status", "sent")
    .is("deleted_at", null);
  if (notificationsError) throw notificationsError;

  const originalsByRegistration = new Map(
    originalNotifications
      .filter((notification) => !Object.hasOwn(asObject(notification.payload), "virtual_access_url"))
      .map((notification) => [notification.related_entity_id, notification]),
  );
  const targets = registrations.filter((registration) => originalsByRegistration.has(registration.id));
  const summaries = new Map<string, SummaryItem>(activities.map((activity) => [activity.id, {
    activityId: activity.id,
    activityTitle: activity.title,
    failed: 0,
    sent: 0,
    skipped: 0,
  }]));

  if (!execute) {
    for (const target of targets) summaries.get(target.activity_id)!.sent += 1;
    console.log(JSON.stringify({ mode: "dry-run", recipients: targets.length, activities: [...summaries.values()] }, null, 2));
    return;
  }

  for (const registration of targets) {
    const summary = summaries.get(registration.activity_id)!;
    const original = originalsByRegistration.get(registration.id)!;
    const { data: currentPayload, error: payloadError } = await client.rpc(
      "build_activity_virtual_notification_payload",
      { p_registration_id: registration.id, p_session_starts_at: undefined },
    );
    if (payloadError) throw payloadError;

    const payload: Record<string, Json | undefined> = {
      ...asObject(original.payload),
      ...asObject(currentPayload),
      original_notification_id: original.id,
      resend_reason: "missing_virtual_access",
    };
    if (typeof payload.virtual_access_url !== "string" || !payload.virtual_access_url.startsWith("https://")) {
      throw new Error(`La inscripción ${registration.id} no tiene un enlace virtual válido.`);
    }

    const { data: existing, error: existingError } = await client
      .from("notification_outbox")
      .select("id,status,attempts")
      .eq("event_type", original.event_type)
      .eq("related_entity_type", RESEND_ENTITY_TYPE)
      .eq("related_entity_id", registration.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing?.status === "sent" || existing?.status === "processing") {
      summary.skipped += 1;
      continue;
    }

    let notificationId = existing?.id;
    if (existing) {
      const { error } = await client.from("notification_outbox").update({
        attempts: existing.attempts + 1,
        last_error: null,
        next_attempt_at: null,
        payload,
        status: "processing",
      }).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { data, error } = await client.from("notification_outbox").insert({
        attempts: 1,
        event_type: original.event_type,
        payload,
        person_id: original.person_id,
        recipient_email: original.recipient_email,
        related_entity_id: registration.id,
        related_entity_type: RESEND_ENTITY_TYPE,
        status: "processing",
      }).select("id").single();
      if (error) throw error;
      notificationId = data.id;
    }
    if (!notificationId) throw new Error("No se pudo determinar la notificación de reenvío.");

    try {
      const response = await fetch(n8nWebhookUrl, {
        body: JSON.stringify({
          event_type: original.event_type,
          notification_id: notificationId,
          payload,
          recipient_email: original.recipient_email,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": n8nWebhookSecret,
        },
        method: "POST",
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`n8n respondió ${response.status}.`);

      const { error } = await client.from("notification_outbox").update({
        last_error: null,
        sent_at: new Date().toISOString(),
        status: "sent",
      }).eq("id", notificationId).eq("status", "processing");
      if (error) throw error;
      summary.sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error no especificado";
      await client.from("notification_outbox").update({
        last_error: message.slice(0, 2_000),
        sent_at: null,
        status: "failed",
      }).eq("id", notificationId).eq("status", "processing");
      summary.failed += 1;
    }
  }

  console.log(JSON.stringify({ mode: "execute", recipients: targets.length, activities: [...summaries.values()] }, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
