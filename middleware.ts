// middleware.ts
// Vive en la raíz del proyecto (junto a app/, no dentro de app/).
//
// Qué hace:
//  - Si alguien entra a /dashboard sin sesión -> lo manda a /login,
//    recordando a dónde iba (?next=...) para regresarlo ahí después.
//  - Si alguien YA logueado entra a /login o /signup -> lo manda directo
//    a /dashboard (no tiene sentido mostrarle el formulario otra vez).
//  - No toca /tap ni /api/stands/pair — esas rutas manejan su propia
//    autenticación/anonimato internamente, según vimos antes.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refresca la sesión si el access token expiró — necesario en middleware
  // porque aquí no hay acceso al localStorage del navegador.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/dashboard");

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
};
