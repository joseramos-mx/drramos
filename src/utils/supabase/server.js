import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente Supabase para Server Components / Route Handlers / Server Actions.
 * Mantiene la sesión del usuario sincronizada con cookies.
 *
 * Uso:
 *   import { cookies } from "next/headers";
 *   import { createClient } from "@/utils/supabase/server";
 *
 *   const supabase = createClient(await cookies());
 *   const { data } = await supabase.from("tabla").select();
 */
export const createClient = (cookieStore) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll fue llamado desde un Server Component sin permisos
          // de mutar cookies. Se ignora si el middleware ya refresca
          // las sesiones.
        }
      },
    },
  });
};
