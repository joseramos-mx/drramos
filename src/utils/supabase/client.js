import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase para Client Components.
 *
 * Uso:
 *   "use client";
 *   import { createClient } from "@/utils/supabase/client";
 *   const supabase = createClient();
 */
export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);
