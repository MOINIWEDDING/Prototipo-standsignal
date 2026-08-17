// lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Úsalo dentro de Server Components / Server Actions del panel, ej:
//   const supabase = await createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   const { data: restaurant } = await supabase.from("restaurants").select("*").single();
//
// Como las tablas tienen RLS (owner_id = auth.uid()), este cliente con la
// anon key + cookies de sesión YA filtra automáticamente solo los datos
// del dueño logueado — no hace falta agregar .eq('owner_id', ...) a mano.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Se puede llamar desde un Server Component sin permiso de escritura
            // de cookies — el middleware ya se encarga de refrescar la sesión.
          }
        },
      },
    }
  );
}
