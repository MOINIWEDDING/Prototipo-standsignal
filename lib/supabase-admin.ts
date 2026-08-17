// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

// PELIGRO: este cliente ignora RLS por completo. Nunca lo importes desde
// un componente de cliente ni lo expongas en una API pública. Solo se usa
// en Server Actions/Route Handlers DESPUÉS de verificar la sesión del
// usuario con supabase-server.ts, y solo para las pocas operaciones que
// RLS no puede resolver por sí sola — como emparejar un stand cuyo
// restaurant_id todavía es NULL (por lo tanto invisible bajo las
// políticas normales, que solo dejan ver "lo tuyo").
export function createSupabaseAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
