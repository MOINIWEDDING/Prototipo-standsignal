// app/onboarding/page.tsx
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import AuthLayout, { AUTH_TOKENS as T } from "@/components/AuthLayout";
import PairStandForm from "@/components/onboarding/PairStandForm";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveRestaurant, getTables } from "@/lib/queries";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <AuthLayout eyebrow="STANDSIGNAL" title="Falta el código del stand" subtitle="Este enlace no trae la información que necesitamos.">
        <div style={{
          display: "flex", gap: 10, background: "rgba(223,110,91,0.1)", border: "1px solid rgba(223,110,91,0.3)",
          borderRadius: 12, padding: 16, fontSize: 13, color: "#B5493A",
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          Vuelve a tocar el stand físico o escanea el QR de nuevo — la URL debe incluir <code>?code=</code> o <code>?uid=</code>.
        </div>
      </AuthLayout>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthLayout
        eyebrow="STAND NUEVO DETECTADO"
        title="Inicia sesión para configurarlo"
        subtitle="Este stand todavía no está asignado a ninguna mesa."
      >
        <div style={{
          background: T.blueSoft, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14,
          fontSize: 12.5, color: T.text, marginBottom: 18,
        }}>
          Código detectado: <span className="mono" style={{ fontWeight: 700 }}>{code}</span>
        </div>
        <Link href={`/login?next=${encodeURIComponent(`/onboarding?code=${code}`)}`} className="auth-btn" style={{ textDecoration: "none" }}>
          Iniciar sesión y asignar mesa
        </Link>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: T.textDim }}>
          ¿Eres cliente y llegaste aquí por error? Avísale al personal del restaurante.
        </div>
      </AuthLayout>
    );
  }

  // Usuario logueado: trae su restaurante y mesas (RLS ya filtra solo lo suyo)
  const restaurant = await getActiveRestaurant(supabase);

  if (!restaurant) {
    return (
      <AuthLayout eyebrow="CASI LISTO" title="Configura tu restaurante primero" subtitle="Antes de emparejar stands, necesitas un restaurante activo.">
        <Link href="/onboarding/restaurant" className="auth-btn" style={{ textDecoration: "none" }}>
          Configurar mi restaurante
        </Link>
      </AuthLayout>
    );
  }

  const tables = await getTables(supabase, restaurant.id);

  // El `kind` (nfc/qr) del stand vive en una fila con restaurant_id todavía
  // NULL — RLS normal no la deja ver, así que se lee con el cliente admin.
  // Es una lectura mínima y de solo un campo no sensible.
  const admin = createSupabaseAdminClient();
  const { data: stand } = await admin
    .from("stands")
    .select("kind, restaurant_id")
    .eq("physical_code", code)
    .maybeSingle();

  if (stand?.restaurant_id) {
    return (
      <AuthLayout eyebrow="YA CONFIGURADO" title="Este stand ya está emparejado" subtitle="No necesitas hacer nada más.">
        <Link href="/dashboard/tables" className="auth-link">Ver mesas y stands →</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={`RESTAURANTE: ${restaurant.name.toUpperCase()}`}
      title="Stand nuevo detectado"
      subtitle="Dile a qué mesa pertenece — solo tienes que hacerlo una vez."
    >
      <PairStandForm physicalCode={code} kind={(stand?.kind as "nfc" | "qr") || "qr"} tables={tables} />
    </AuthLayout>
  );
}
