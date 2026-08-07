import { createClient } from "@supabase/supabase-js";

// Server-side Supabase instance (Bypasses Row Level Security)
// Ensure these variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getServerSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase URL or Service Role Key is missing. Check your .env.local file.");
    }
    return createClient("https://placeholder.supabase.co", "placeholder_key");
  }

  // Uses the service role key to bypass RLS policies for server-side administrative actions
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
