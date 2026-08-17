// app/dashboard/settings/page.tsx
import { TopBar } from "@/components/dashboard/DashboardChrome";
import MenuUrlForm from "@/components/dashboard/MenuUrlForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveRestaurant } from "@/lib/queries";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const restaurant = await getActiveRestaurant(supabase);

  return (
    <>
      <TopBar title="Menú y ajustes" subtitle="Configura hacia dónde apuntan tus stands" />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 28px 60px" }}>
        <MenuUrlForm restaurantId={restaurant!.id} currentUrl={restaurant!.menu_url} />
      </div>
    </>
  );
}
