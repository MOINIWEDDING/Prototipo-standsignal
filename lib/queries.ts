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

// El primer restaurante del dueño autenticado. Cuando soportes multi-local
// por cuenta, esto se vuelve un selector — por ahora un dueño = un restaurante.
export async function getActiveRestaurant(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, menu_url, is_active, created_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
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

function isSameLocalDay(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getDate() === ref.getDate() && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

export function buildDashboardAggregates(events: ScanEventRow[], tables: { id: string; label: string }[]) {
  const now = new Date();
  const yesterday = new Date(Date.now() - 86400000);

  const todayCount = events.filter((e) => isSameLocalDay(e.scanned_at, now)).length;
  const yestCount = events.filter((e) => isSameLocalDay(e.scanned_at, yesterday)).length;
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
    hourlyBuckets[new Date(e.scanned_at).getHours()].count += 1;
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
