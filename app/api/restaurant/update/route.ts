// app/api/restaurant/update/route.ts
//
// Endpoint genérico para actualizar campos del restaurante: nombre, logo,
// zona horaria, y la personalización de la pantalla de redirección.
// Whitelist estricta de campos — nunca aceptamos columnas arbitrarias.

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const ALLOWED_FIELDS = [
  "name",
  "logo_url",
  "timezone",
  "redirect_bg_color",
  "redirect_bg_image_url",
  "redirect_bg_video_url",
] as const;

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { restaurantId, fields } = body as { restaurantId: string; fields: Record<string, unknown> };

  if (!restaurantId || !fields || typeof fields !== "object") {
    return NextResponse.json({ error: "Faltan restaurantId o fields" }, { status: 400 });
  }

  const safeFields: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in fields) safeFields[key] = fields[key];
  }

  if (Object.keys(safeFields).length === 0) {
    return NextResponse.json({ error: "Ningún campo válido para actualizar" }, { status: 400 });
  }

  if (typeof safeFields.name === "string" && safeFields.name.trim().length === 0) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  // RLS activo: si restaurantId no es del usuario, esto afecta 0 filas.
  const { data, error } = await supabase
    .from("restaurants")
    .update(safeFields)
    .eq("id", restaurantId)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "No se pudo actualizar" }, { status: 400 });
  }

  // Los cambios de marca/fondo afectan a TODAS las mesas de este restaurante
  // a la vez, así que invalidamos su cache en /tap sin esperar el TTL de 1h.
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const redis = Redis.fromEnv();
    const { data: tables } = await supabase.from("tables").select("id").eq("restaurant_id", restaurantId);
    const { data: stands } = await supabase.from("stands").select("physical_code").eq("restaurant_id", restaurantId);
    await Promise.all([
      ...(tables || []).map((t) => redis.del(`table:${t.id}`).catch(() => {})),
      ...(stands || []).map((s) => redis.del(`stand:${s.physical_code}`).catch(() => {})),
    ]);
  }

  return NextResponse.json({ success: true });
}
