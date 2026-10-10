import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

let client;

export function getSupabase() {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SECRET_KEY } = getEnv();
    client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
