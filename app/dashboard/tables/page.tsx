// app/dashboard/tables/page.tsx
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/dashboard/DashboardChrome";
import TablesManager from "@/components/dashboard/TablesManager";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveRestaurant, getTables, getStandsWithTable } from "@/lib/queries";
import { T } from "@/lib/theme";

export default async function TablesPage() {
  const supabase = await createSupabaseServerClient();
  const restaurant = await getActiveRestaurant(supabase);

  const [tables, stands] = await Promise.all([
    getTables(supabase, restaurant!.id),
    getStandsWithTable(supabase, restaurant!.id),
  ]);

  const menuNotConfigured = !restaurant!.menu_url || restaurant!.menu_url === "https://";

  return (
    <>
      <TopBar title="Mesas y stands" subtitle="El enlace exacto para programar cada chip NFC o imprimir cada QR" />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 28px 60px" }}>
        {menuNotConfigured && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: T.orangeSoft,
            border: `1px solid rgba(235,141,80,0.35)`, borderRadius: 12, padding: "12px 16px",
            fontSize: 13, color: "#8A5426", marginBottom: 18,
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              Todavía no configuras el enlace de tu menú — los códigos que generes abajo van a mandar a tus
              clientes a una pantalla de "no disponible" hasta que lo hagas.{" "}
              <Link href="/dashboard/settings" style={{ color: "#8A5426", fontWeight: 700, textDecoration: "underline" }}>
                Configúralo aquí →
              </Link>
            </span>
          </div>
        )}
        <TablesManager restaurantId={restaurant!.id} initialTables={tables} initialStands={stands as any} />
      </div>
    </>
  );
}
