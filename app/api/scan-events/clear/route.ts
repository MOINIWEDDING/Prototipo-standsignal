// app/api/scan-events/clear/route.ts
//
// Vacía el historial de escaneos de un restaurante. Requiere sesión.
//
// Nota: `scan_events` a propósito NO tiene política de DELETE para
// usuarios normales en db/schema.sql (solo SELECT) — por eso este borrado
// necesita el cliente admin. La seguridad real está en que primero
// verificamos, con el cliente normal (RLS activo), que el restaurantId
// pertenece al usuario autenticado; solo entonces usamos el admin.

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { restaurantId } = await req.json();
  if (!restaurantId) {
    return NextResponse.json({ error: "Falta restaurantId" }, { status: 400 });
  }

  // RLS activo: si este restaurante no es del usuario, esto sale null.
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurante no encontrado o no te pertenece" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("scan_events").delete().eq("restaurant_id", restaurantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
