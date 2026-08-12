import type { PublicEnv } from "@/lib/env/types/public-env.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function validateUrl(value: string): void {
  try {
    new URL(value);
  } catch (error) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida.", {
      cause: error,
    });
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl?.trim() && supabasePublishableKey?.trim());
}

export function getPublicEnv(): PublicEnv {
  if (!supabaseUrl?.trim() || !supabasePublishableKey?.trim()) {
    throw new Error(
      "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  validateUrl(supabaseUrl);

  return {
    supabasePublishableKey,
    supabaseUrl,
  };
}
