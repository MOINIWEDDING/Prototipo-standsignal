// app/auth/callback/route.ts
//
// Todos los links que Supabase envía por correo (confirmación de signup,
// recuperación de contraseña) deben apuntar aquí — configúralo en
// Supabase Dashboard -> Authentication -> URL Configuration ->
// Redirect URLs como: https://tudominio.com/auth/callback
//
// Este handler intercambia el ?code= de un solo uso por una sesión real
// (cookies httpOnly), y luego manda al usuario a donde corresponda.

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  const type = searchParams.get("type"); // 'recovery' cuando viene de "olvidé mi contraseña"

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = type === "recovery" ? "/reset-password/confirm" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
