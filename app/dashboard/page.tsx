// app/dashboard/page.tsx
import { TopBar } from "@/components/dashboard/DashboardChrome";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveRestaurant, getTables, getRecentScanEvents, buildDashboardAggregates } from "@/lib/queries";

export const revalidate = 0; // siempre datos frescos — es un dashboard, no una página estática

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const restaurant = await getActiveRestaurant(supabase); // el layout ya garantiza que existe

  const [tables, events] = await Promise.all([
    getTables(supabase, restaurant!.id),
    getRecentScanEvents(supabase, restaurant!.id, 3),
  ]);

  const aggregates = buildDashboardAggregates(events, tables);

  return (
    <>
      <TopBar title={`Hola, ${restaurant!.name} 👋`} subtitle="Así se está moviendo tu negocio en los últimos 3 días" />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px 60px" }}>
        <DashboardCharts data={aggregates} />
      </div>
    </>
  );
}
