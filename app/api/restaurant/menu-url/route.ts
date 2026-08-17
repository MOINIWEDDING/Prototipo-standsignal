// app/api/restaurant/menu-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { restaurantId, menuUrl } = await req.json();
  if (!restaurantId || !menuUrl) {
    return NextResponse.json({ error: "Faltan restaurantId o menuUrl" }, { status: 400 });
  }

  try {
    new URL(menuUrl);
  } catch {
    return NextResponse.json({ error: "La URL no es válida. Debe incluir https://" }, { status: 400 });
  }

  // RLS filtra automáticamente: si restaurantId no pertenece al usuario, 0 filas afectadas.
  const { data, error } = await supabase
    .from("restaurants")
    .update({ menu_url: menuUrl, menu_url_updated_at: new Date().toISOString() })
    .eq("id", restaurantId)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "No se pudo actualizar (¿es tuyo ese restaurante?)" }, { status: 400 });
  }

  // Todos los stands de este restaurante están cacheados por physical_code,
  // no por restaurant_id, así que no podemos invalidar uno por uno sin
  // listarlos. Como el TTL del cache es de 1h, el impacto es acotado —
  // pero si tienes Redis activo, invalidamos igual los que conocemos.
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const redis = Redis.fromEnv();
    const { data: stands } = await supabase.from("stands").select("physical_code").eq("restaurant_id", restaurantId);
    await Promise.all((stands || []).map((s) => redis.del(`stand:${s.physical_code}`).catch(() => {})));
  }

  return NextResponse.json({ success: true });
}
