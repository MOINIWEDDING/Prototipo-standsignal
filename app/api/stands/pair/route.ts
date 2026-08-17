// app/api/stands/pair/route.ts
//
// Endpoint PRIVADO. Requiere sesión del dueño autenticado.
// Se usa UNA vez por stand físico, desde el panel de negocio, para decirle
// "este UID/code es la Mesa 5". Después de esto, /tap ya no vuelve a
// preguntar — el emparejamiento vive en la base de datos.
//
// Nota de seguridad: la tabla `stands` a propósito NO tiene política de
// INSERT/UPDATE para usuarios normales (ver db/schema.sql) — un stand sin
// emparejar tiene restaurant_id NULL, así que RLS no puede decidir de quién
// es todavía. Por eso esta ruta verifica la sesión y la propiedad de la
// mesa con el cliente normal (RLS activo), y solo usa el cliente admin
// para el UPDATE puntual, nunca para leer datos de otros dueños.

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { physicalCode, tableId } = await req.json();
  if (!physicalCode || !tableId) {
    return NextResponse.json({ error: "Faltan physicalCode o tableId" }, { status: 400 });
  }

  // RLS activo: esta consulta solo puede ver la mesa si pertenece a un
  // restaurante del usuario autenticado. Si no es suya, `table` sale null.
  const { data: table, error: tableError } = await supabase
    .from("tables")
    .select("id, restaurant_id")
    .eq("id", tableId)
    .single();

  if (tableError || !table) {
    return NextResponse.json({ error: "Mesa no encontrada o no te pertenece" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("stands")
    .update({
      table_id: tableId,
      restaurant_id: table.restaurant_id,
      paired_at: new Date().toISOString(),
    })
    .eq("physical_code", physicalCode);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Invalida el cache del endpoint público -> el próximo escaneo ya
  // resuelve con el nuevo emparejamiento, sin esperar el TTL de 1h.
  if (process.env.UPSTASH_REDIS_REST_URL) {
    await Redis.fromEnv().del(`stand:${physicalCode}`).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
