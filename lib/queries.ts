// lib/queries.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type ScanEventRow = {
  id: number;
  table_id: string | null;
  medium: "nfc" | "qr";
  device_os: "ios" | "android" | "other" | null;
  scanned_at: string;
  tables: { label: string } | null;
};

export type RestaurantRow = {
  id: string;
  name: string;
  menu_url: string;
  is_active: boolean;
  created_at: string;
  timezone: string;
  logo_url: string | null;
  redirect_bg_color: string;
  redirect_bg_image_url: string | null;
  redirect_bg_video_url: string | null;
};

// El primer restaurante del dueño autenticado. Cuando soportes multi-local
// por cuenta, esto se vuelve un selector — por ahora un dueño = un restaurante.
export async function getActiveRestaurant(supabase: SupabaseClient): Promise<RestaurantRow | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, menu_url, is_active, created_at, timezone, logo_url, redirect_bg_color, redirect_bg_image_url, redirect_bg_video_url"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as RestaurantRow | null;
}

export async function getTables(supabase: SupabaseClient, restaurantId: string) {
  const { data, error } = await supabase
    .from("tables")
    .select("id, label, is_active")
    .eq("restaurant_id", restaurantId)
    .order("label", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getStandsWithTable(supabase: SupabaseClient, restaurantId: string) {
  const { data, error } = await supabase
    .from("stands")
    .select("id, physical_code, kind, paired_at, table_id, tables(label)")
    .eq("restaurant_id", restaurantId)
    .order("paired_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Trae los eventos de los últimos N días y deja que el llamador agregue
// en JS — a este volumen (miles de filas) es más simple y rápido de
// mantener que replicar cada GROUP BY como función de Postgres.
export async function getRecentScanEvents(supabase: SupabaseClient, restaurantId: string, days = 3) {
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await supabase
    .from("scan_events")
    .select("id, table_id, medium, device_os, scanned_at, tables(label)")
    .eq("restaurant_id", restaurantId)
    .gte("scanned_at", since)
    .order("scanned_at", { ascending: false })
    .limit(5000);

  if (error) throw error;
  return (data || []) as unknown as ScanEventRow[];
}

// ---------------------------------------------------------------------
// Fechas/horas en la zona horaria REAL del restaurante, no en la del
// servidor (Vercel corre en UTC). Sin esto, "hora pico" sale desfasada
// según dónde esté físicamente el datacenter.
// ---------------------------------------------------------------------
function localParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "0";
  return { hour: parseInt(get("hour"), 10) % 24, day: get("day"), month: get("month"), year: get("year") };
}

function isSameLocalDay(iso: string, refIso: string, timeZone: string) {
  const a = localParts(iso, timeZone);
  const b = localParts(refIso, timeZone);
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

export function buildDashboardAggregates(
  events: ScanEventRow[],
  tables: { id: string; label: string }[],
  timeZone: string = "America/Santo_Domingo"
) {
  const nowIso = new Date().toISOString();
  const yesterdayIso = new Date(Date.now() - 86400000).toISOString();

  const todayCount = events.filter((e) => isSameLocalDay(e.scanned_at, nowIso, timeZone)).length;
  const yestCount = events.filter((e) => isSameLocalDay(e.scanned_at, yesterdayIso, timeZone)).length;
  const delta = todayCount - yestCount;
  const deltaPct = yestCount ? Math.round((delta / yestCount) * 100) : 0;

  const tableMap: Record<string, number> = {};
  tables.forEach((t) => (tableMap[t.label] = 0));
  events.forEach((e) => {
    const label = e.tables?.label;
    if (label) tableMap[label] = (tableMap[label] || 0) + 1;
  });
  const tableStats = Object.entries(tableMap)
    .map(([table, count]) => ({ table, count }))
    .sort((a, b) => b.count - a.count);
  const maxTableCount = Math.max(1, ...tableStats.map((t) => t.count));

  const hourlyBuckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0, label: `${String(h).padStart(2, "0")}h` }));
  events.forEach((e) => {
    const { hour } = localParts(e.scanned_at, timeZone);
    hourlyBuckets[hour].count += 1;
  });
  const peakHour = hourlyBuckets.reduce((a, b) => (b.count > a.count ? b : a), hourlyBuckets[0]);

  const qrCount = events.filter((e) => e.medium === "qr").length;
  const nfcCount = events.filter((e) => e.medium === "nfc").length;
  const nfcSharePct = events.length ? Math.round((nfcCount / events.length) * 100) : 0;

  const iosCount = events.filter((e) => e.device_os === "ios").length;
  const androidCount = events.filter((e) => e.device_os === "android").length;

  const recentEvents = events.slice(0, 8).map((e) => ({
    id: e.id,
    table: e.tables?.label || "Mesa sin nombre",
    medium: e.medium,
    os: e.device_os || "other",
    ts: new Date(e.scanned_at).getTime(),
  }));

  return {
    todayCount, yestCount, delta, deltaPct,
    tableStats, maxTableCount,
    hourlyStats: hourlyBuckets, peakHour,
    mediumStats: [
      { name: "Código QR", value: qrCount, color: "#EB8D50" },
      { name: "NFC", value: nfcCount, color: "#326199" },
    ],
    osStats: [
      { name: "iOS", value: iosCount, color: "#4FB1A1" },
      { name: "Android", value: androidCount, color: "#DF6E5B" },
    ],
    nfcSharePct,
    totalEvents: events.length,
    recentEvents,
  };
}
