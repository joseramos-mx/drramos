import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y aplica las reglas
 * de acceso de /crm:
 *   - /crm y /crm/* requieren sesión, sin ella redirigen a /crm/login.
 *   - /crm/login con sesión activa redirige a /crm.
 *
 * Usa anon key con RLS. Nunca service role en el browser ni en
 * middleware (este middleware corre en el edge y el response llega al
 * cliente).
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser valida el JWT contra Supabase, no solo lo decodifica.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/crm/login";
  const isProtected = pathname === "/crm" || pathname.startsWith("/crm/");

  if (isProtected && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
