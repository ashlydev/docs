import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseConfig } from "@/lib/env";

// This project does not use generated Supabase types, so the admin client stays untyped.
// That keeps inserts, RPC calls, and ad hoc selects simple across the existing codebase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: any = null;

export function getSupabaseAdmin() {
  if (!hasSupabaseConfig() || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase server credentials.");
  }

  adminClient ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adminClient as any;
}
