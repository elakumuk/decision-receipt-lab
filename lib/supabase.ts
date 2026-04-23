import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig, hasSupabaseServerConfig } from "@/lib/env";

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: { persistSession: false },
  });
}

export function createServerSupabaseClient() {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { persistSession: false },
  });
}

export function getServerSupabaseClient() {
  return createServerSupabaseClient() ?? getSupabaseClient();
}
