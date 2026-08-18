// app/dashboard/settings/page.tsx
import { TopBar } from "@/components/dashboard/DashboardChrome";
import MenuUrlForm from "@/components/dashboard/MenuUrlForm";
import RestaurantProfileForm from "@/components/dashboard/RestaurantProfileForm";
import RedirectScreenForm from "@/components/dashboard/RedirectScreenForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getActiveRestaurant } from "@/lib/queries";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const restaurant = await getActiveRestaurant(supabase);

  return (
    <>
      <TopBar title="Menú y ajustes" subtitle="Tu marca, tu menú, y lo que ve el cliente al tocar un stand" />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 28px 60px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 18, alignItems: "start" }}>
          <MenuUrlForm restaurantId={restaurant!.id} currentUrl={restaurant!.menu_url} />
          <RestaurantProfileForm
            restaurantId={restaurant!.id}
            initialName={restaurant!.name}
            initialLogoUrl={restaurant!.logo_url}
            initialTimezone={restaurant!.timezone}
          />
        </div>
        <RedirectScreenForm
          restaurantId={restaurant!.id}
          initialColor={restaurant!.redirect_bg_color}
          initialImageUrl={restaurant!.redirect_bg_image_url}
          initialVideoUrl={restaurant!.redirect_bg_video_url}
        />
      </div>
    </>
  );
}
