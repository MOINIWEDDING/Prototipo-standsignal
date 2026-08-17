// app/tap/route.ts
//
// ÚNICO endpoint que tus chips NFC y códigos QR deben apuntar.
// Recibe la petición, identifica la mesa, registra el evento SIN
// bloquear, y responde con un 302 en milisegundos. No renderiza nada:
// el cliente nunca ve "tu app", solo el salto.
//
// DOS formas de identificar el stand (ambas soportadas):
//
//  A) RECOMENDADA — enlace directo por mesa (lo que genera el panel en
//     "Mesas y stands"). No requiere programar nada especial en el chip,
//     solo escribir la URL tal cual:
//       https://tudominio.com/tap?t=<table_id>&m=nfc
//       https://tudominio.com/tap?t=<table_id>&m=qr
//
//  B) AVANZADA — UID mirroring de hardware, para quien programa muchos
//     chips con NXP TagWriter y quiere que el chip autocomplete su UID:
//       https://tudominio.com/tap?uid={UID}&ctr={COUNTER}   (NFC)
//       https://tudominio.com/tap?code=x7F2Q                (QR)
//     Este camino pasa primero por /onboarding para emparejar el stand
//     con una mesa la primera vez que se toca.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redisEnabled = !!process.env.UPSTASH_REDIS_REST_URL;
const redis = redisEnabled ? Redis.fromEnv() : null;

const FALLBACK_URL = process.env.FALLBACK_URL || "https://tudominio.com/menu-no-disponible";
const ONBOARDING_URL = process.env.ONBOARDING_BASE_URL || "https://tudominio.com/onboarding";

function detectOS(userAgent: string): "ios" | "android" | "other" {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

async function logEventAndRedirect(
  req: NextRequest,
  params: { restaurantId: string; tableId: string | null; standId: string | null; medium: "nfc" | "qr" },
  menuUrl: string
) {
  const userAgent = req.headers.get("user-agent") || "";
  const eventPromise = supabase.from("scan_events").insert({
    restaurant_id: params.restaurantId,
    table_id: params.tableId,
    stand_id: params.standId,
    medium: params.medium,
    device_os: detectOS(userAgent),
    user_agent_raw: userAgent,
  });

  // SOLUCIÓN: Usamos Promise.resolve() para convertir el 'thenable' 
  // de Supabase en una Promesa nativa y poder utilizar .catch().
  // @ts-ignore — waitUntil disponible en el contexto Edge de Vercel/Cloudflare
  req.waitUntil?.(Promise.resolve(eventPromise).catch(() => {}));

  return NextResponse.redirect(menuUrl, 302);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ---------- CAMINO A: enlace directo por mesa (recomendado) ----------
  const tableId = searchParams.get("t");
  const mediumParam = searchParams.get("m");
  const medium: "nfc" | "qr" = mediumParam === "nfc" ? "nfc" : "qr";

  if (tableId) {
    const cacheKey = `table:${tableId}`;
    let cached: { restaurant_id: string; menu_url: string; is_active: boolean } | null = null;

    if (redis) {
      try {
        const raw = await redis.get<string>(cacheKey);
        if (raw) cached = JSON.parse(raw);
      } catch {
        /* cache best-effort */
      }
    }

    if (!cached) {
      const { data } = await supabase
        .from("tables")
        .select("restaurant_id, restaurants(menu_url, is_active)")
        .eq("id", tableId)
        .maybeSingle();

      const rest = data?.restaurants as unknown as { menu_url: string; is_active: boolean } | null;
      if (data && rest) {
        cached = { restaurant_id: data.restaurant_id, menu_url: rest.menu_url, is_active: rest.is_active };
        if (redis) await redis.set(cacheKey, JSON.stringify(cached), { ex: 3600 }).catch(() => {});
      }
    }

    if (!cached || !cached.is_active || !cached.menu_url || cached.menu_url === "https://") {
      return NextResponse.redirect(FALLBACK_URL, 302);
    }

    return logEventAndRedirect(
      req,
      { restaurantId: cached.restaurant_id, tableId, standId: null, medium },
      cached.menu_url
    );
  }

  // ---------- CAMINO B: UID mirroring / code (avanzado) ----------
  const uid = searchParams.get("uid");
  const code = searchParams.get("code");
  const physicalCode = (uid || code || "").trim();

  if (!physicalCode) {
    return NextResponse.redirect(FALLBACK_URL, 302);
  }

  const standMedium = uid ? "nfc" : "qr";
  const standCacheKey = `stand:${physicalCode}`;

  type StandRecord = {
    id: string;
    restaurant_id: string | null;
    table_id: string | null;
    restaurants: { menu_url: string; is_active: boolean } | null;
  };

  let stand: StandRecord | null = null;
  if (redis) {
    try {
      const raw = await redis.get<string>(standCacheKey);
      if (raw) stand = JSON.parse(raw);
    } catch {
      /* cache best-effort */
    }
  }

  if (!stand) {
    const { data } = await supabase
      .from("stands")
      .select("id, restaurant_id, table_id, restaurants(menu_url, is_active)")
      .eq("physical_code", physicalCode)
      .maybeSingle();

    stand = (data as unknown as StandRecord) || null;
    if (stand && redis) await redis.set(standCacheKey, JSON.stringify(stand), { ex: 3600 }).catch(() => {});
  }

  if (!stand) {
    await supabase.from("stands").upsert(
      { physical_code: physicalCode, kind: standMedium },
      { onConflict: "physical_code", ignoreDuplicates: true }
    );
    return NextResponse.redirect(`${ONBOARDING_URL}?code=${encodeURIComponent(physicalCode)}`, 302);
  }

  if (!stand.restaurant_id || !stand.restaurants || !stand.restaurants.is_active || !stand.restaurants.menu_url) {
    return NextResponse.redirect(FALLBACK_URL, 302);
  }

  return logEventAndRedirect(
    req,
    { restaurantId: stand.restaurant_id, tableId: stand.table_id, standId: stand.id, medium: standMedium },
    stand.restaurants.menu_url
  );
}