import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/db";
import { env } from "./env";

/**
 * detectSessionInUrl を切っているのは HashRouter との衝突回避。
 * メール+パスワード方式なので URL 経由のセッション復元は使わない。
 */
export const supabase = createClient<Database>(
  env.supabaseUrl ?? "http://localhost:54321",
  env.supabaseAnonKey ?? "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
