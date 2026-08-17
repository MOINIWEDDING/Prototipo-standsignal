// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveRestaurant } from "@/lib/queries";
import { Sidebar, DashboardGlobalStyles } from "@/components/dashboard/DashboardChrome";

// El middleware ya garantiza que hay sesión antes de llegar aquí — este
// layout se encarga de la siguiente capa: que ese usuario tenga un
// restaurante configurado. Si no, lo manda a terminar el setup.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const restaurant = await getActiveRestaurant(supabase);

  if (!restaurant) {
    redirect("/onboarding/restaurant");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F4FB" }}>
      <DashboardGlobalStyles />
      <Sidebar restaurantName={restaurant.name} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
