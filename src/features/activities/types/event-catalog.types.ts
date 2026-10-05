import type { Database } from "@/lib/supabase/database.types";

export type EventCatalogView = "upcoming" | "past";

export type EventCatalogArguments = Database["public"]["Functions"]["get_public_event_page"]["Args"];
