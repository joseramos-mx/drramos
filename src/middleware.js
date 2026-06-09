import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Solo intercepta rutas de /crm. La landing y el resto del sitio
     * pasan sin tocar la sesión.
     */
    "/crm",
    "/crm/:path*",
  ],
};
