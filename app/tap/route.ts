// app/tap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redisEnabled = !!process.env.UPSTASH_REDIS_REST_URL;
const redis = redisEnabled ? Redis.fromEnv() : null;

function detectOS(userAgent: string): "ios" | "android" | "other" {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

// Construye una URL 100% válida para NextResponse.redirect
function resolveTargetUrl(targetUrl: string | null | undefined, req: NextRequest): URL {
  const defaultFallback = new URL("/", req.nextUrl.origin);

  const rawUrl = targetUrl?.trim() || process.env.FALLBACK_URL?.trim();

  if (!rawUrl || rawUrl === "https://") {
    return defaultFallback;
  }

  try {
    // Si es una ruta relativa (/onboarding, /menu)
    if (rawUrl.startsWith("/")) {
      return new URL(rawUrl, req.nextUrl.origin);
    }
    // Si es una URL absoluta con o sin protocolo
    const formatted = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    return new URL(formatted);
  } catch (error) {
    console.error("Error al parsear URL de redirección:", rawUrl, error);
    return defaultFallback;
  }
}

async function logEventAndRedirect(
  req: NextRequest,
  params: { restaurantId: string; tableId: string | null; standId: string | null; medium: "nfc" | "qr" },
  rawMenuUrl: string
) {
  const userAgent = req.headers.get("user-agent") || "";

  // 1. Guardado síncrono en Supabase
  try {
    const { error } = await supabase.from("scan_events").insert({
      restaurant_id: params.restaurantId,
      table_id: params.tableId,
      stand_id: params.standId,
      medium: params.medium,
      device_os: detectOS(userAgent),
      user_agent_raw: userAgent,
    });

    if (error) {
      console.error("Error Supabase scan_events:", error);
    }
  } catch (err) {
    console.error("Excepción en Supabase insert:", err);
  }

  // 2. Redirección garantizada
  const target = resolveTargetUrl(rawMenuUrl, req);
  return NextResponse.redirect(target, 302);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ---------- CAMINO A: enlace directo por mesa ----------
    const tableId = searchParams.get("t");
    const mediumParam = searchParams.get("m");
    const medium: "nfc" | "qr" = mediumParam === "nfc" ? "nfc" : "qr";

    if (tableId) {
      const cacheKey = `table:${tableId}`;
      let cached: { restaurant_id: string; menu_url: string; is_active: boolean } | null = null;

      if (redis) {
        try {
          const raw = await redis.get<string>(cacheKey);
          if (raw) cached = typeof raw === "string" ? JSON.parse(raw) : raw;
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

        // Extraer relación restaurants soportando Objetos o Arreglos
        const rawRest = data?.restaurants;
        const rest = (Array.isArray(rawRest) ? rawRest[0] : rawRest) as { menu_url: string; is_active: boolean } | null;

        if (data && rest) {
          cached = { restaurant_id: data.restaurant_id, menu_url: rest.menu_url, is_active: rest.is_active };
          if (redis) await redis.set(cacheKey, JSON.stringify(cached), { ex: 3600 }).catch(() => {});
        }
      }

      if (!cached || !cached.is_active || !cached.menu_url || cached.menu_url === "https://") {
        return NextResponse.redirect(resolveTargetUrl(process.env.FALLBACK_URL, req), 302);
      }

      return logEventAndRedirect(
        req,
        { restaurantId: cached.restaurant_id, tableId, standId: null, medium },
        cached.menu_url
      );
    }

    // ---------- CAMINO B: UID mirroring / code ----------
    const uid = searchParams.get("uid");
    const code = searchParams.get("code");
    const physicalCode = (uid || code || "").trim();

    if (!physicalCode) {
      return NextResponse.redirect(resolveTargetUrl(process.env.FALLBACK_URL, req), 302);
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
        if (raw) stand = typeof raw === "string" ? JSON.parse(raw) : raw;
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

      if (data) {
        const rawRest = data.restaurants;
        const rest = Array.isArray(rawRest) ? rawRest[0] : rawRest;
        stand = {
          id: data.id,
          restaurant_id: data.restaurant_id,
          table_id: data.table_id,
          restaurants: rest as { menu_url: string; is_active: boolean } | null,
        };
        if (redis) await redis.set(standCacheKey, JSON.stringify(stand), { ex: 3600 }).catch(() => {});
      }
    }

    if (!stand) {
      await supabase.from("stands").upsert(
        { physical_code: physicalCode, kind: standMedium },
        { onConflict: "physical_code", ignoreDuplicates: true }
      );
      const onboardingBase = process.env.ONBOARDING_BASE_URL || "/onboarding";
      const onboardingUrl = `${onboardingBase}?code=${encodeURIComponent(physicalCode)}`;
      return NextResponse.redirect(resolveTargetUrl(onboardingUrl, req), 302);
    }

    if (!stand.restaurant_id || !stand.restaurants || !stand.restaurants.is_active || !stand.restaurants.menu_url) {
      return NextResponse.redirect(resolveTargetUrl(process.env.FALLBACK_URL, req), 302);
    }

    return logEventAndRedirect(
      req,
      { restaurantId: stand.restaurant_id, tableId: stand.table_id, standId: stand.id, medium: standMedium },
      stand.restaurants.menu_url
    );
  } catch (fatalError) {
    console.error("Error crítico en GET /tap:", fatalError);
    return NextResponse.redirect(resolveTargetUrl(process.env.FALLBACK_URL, req), 302);
  }
}
