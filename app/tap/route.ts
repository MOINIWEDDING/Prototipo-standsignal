// app/tap/route.ts
//
// ÚNICO endpoint que tus chips NFC y códigos QR deben apuntar.
//
// Cuando el enlace resuelve correctamente, en vez de un 302 instantáneo
// (pantalla en blanco/gris) se muestra una pequeña página de transición
// con el fondo personalizado del restaurante (color, imagen o video) y
// una animación de carga, y desde ahí se redirige por JS en ~450ms.
// Los eventos se siguen registrando de forma asíncrona sin bloquear.
//
// Cuando el enlace NO resuelve (código inválido, restaurante inactivo,
// menú sin configurar, stand nunca antes visto), se usa un 302 normal
// hacia la pantalla de error u onboarding — ahí no hace falta branding.
//
// DOS formas de identificar el stand (ambas soportadas):
//  A) RECOMENDADA — enlace directo por mesa: /tap?t=<table_id>&m=nfc|qr
//  B) AVANZADA — UID mirroring de hardware: /tap?uid={UID} o ?code=x7F2Q

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

const RESTAURANT_FIELDS = "menu_url, is_active, redirect_bg_color, redirect_bg_image_url, redirect_bg_video_url";

type RestaurantSettings = {
  menu_url: string;
  is_active: boolean;
  redirect_bg_color: string | null;
  redirect_bg_image_url: string | null;
  redirect_bg_video_url: string | null;
};

function detectOS(userAgent: string): "ios" | "android" | "other" {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

// Escapa lo mínimo necesario para insertar un string dentro de <script>
// como literal JSON — evita que una URL con caracteres raros rompa el HTML.
function jsonForScript(value: string) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function renderRedirectHtml(menuUrl: string, settings: RestaurantSettings) {
  const bgColor = settings.redirect_bg_color || "#111827";
  const hasVideo = !!settings.redirect_bg_video_url;
  const hasImage = !hasVideo && !!settings.redirect_bg_image_url;
  const mediaTag = hasVideo
    ? `<video class="bg-media" src="${settings.redirect_bg_video_url}" autoplay muted loop playsinline></video>`
    : hasImage
    ? `<img class="bg-media" src="${settings.redirect_bg_image_url}" alt="">`
    : "";
  const overlay = hasVideo || hasImage ? `<div class="overlay"></div>` : "";

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="2;url=${menuUrl}">
<title>Abriendo el menú…</title>
<style>
  html,body{margin:0;height:100%;background:${bgColor};overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,sans-serif;}
  .bg-media{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.28);z-index:1;}
  .wrap{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
  .spinner{width:38px;height:38px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:spin .7s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .label{color:#fff;font-size:13px;font-weight:600;letter-spacing:.3px;opacity:.92;}
</style>
</head>
<body>
${mediaTag}
${overlay}
<div class="wrap">
  <div class="spinner"></div>
  <div class="label">Abriendo el menú…</div>
</div>
<script>setTimeout(function(){ window.location.replace(${jsonForScript(menuUrl)}); }, 450);</script>
</body>
</html>`;

  return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function logEventAsync(
  req: NextRequest,
  params: { restaurantId: string; tableId: string | null; standId: string | null; medium: "nfc" | "qr" }
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

  // El builder de Supabase es "thenable" pero no una Promise real —
  // hay que envolverlo para poder usar .catch() sin que truene.
  // @ts-ignore — waitUntil disponible en el contexto Edge de Vercel/Cloudflare
  req.waitUntil?.(Promise.resolve(eventPromise).catch(() => {}));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // ---------- CAMINO A: enlace directo por mesa (recomendado) ----------
  const tableId = searchParams.get("t");
  const mediumParam = searchParams.get("m");
  const medium: "nfc" | "qr" = mediumParam === "nfc" ? "nfc" : "qr";

  if (tableId) {
    const cacheKey = `table:${tableId}`;
    let cached: { restaurant_id: string; settings: RestaurantSettings } | null = null;

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
        .select(`restaurant_id, restaurants(${RESTAURANT_FIELDS})`)
        .eq("id", tableId)
        .maybeSingle();

      const rest = data?.restaurants as unknown as RestaurantSettings | null;
      if (data && rest) {
        cached = { restaurant_id: data.restaurant_id, settings: rest };
        if (redis) await redis.set(cacheKey, JSON.stringify(cached), { ex: 3600 }).catch(() => {});
      }
    }

    const settings = cached?.settings;
    if (!cached || !settings || !settings.is_active || !settings.menu_url || settings.menu_url === "https://") {
      return NextResponse.redirect(FALLBACK_URL, 302);
    }

    await logEventAsync(req, { restaurantId: cached.restaurant_id, tableId, standId: null, medium });
    return renderRedirectHtml(settings.menu_url, settings);
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
    restaurants: RestaurantSettings | null;
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
      .select(`id, restaurant_id, table_id, restaurants(${RESTAURANT_FIELDS})`)
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

  const settings = stand.restaurants;
  if (!stand.restaurant_id || !settings || !settings.is_active || !settings.menu_url || settings.menu_url === "https://") {
    return NextResponse.redirect(FALLBACK_URL, 302);
  }

  await logEventAsync(req, {
    restaurantId: stand.restaurant_id,
    tableId: stand.table_id,
    standId: stand.id,
    medium: standMedium,
  });
  return renderRedirectHtml(settings.menu_url, settings);
}
