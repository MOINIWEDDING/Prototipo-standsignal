// app/onboarding/restaurant/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SetupRestaurantPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Tu sesión expiró. Inicia sesión de nuevo.");
      return;
    }

    const { error: insertError } = await supabase.from("restaurants").insert({
      owner_id: user.id,
      name: name.trim(),
      menu_url: menuUrl.trim() || "https://",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthLayout eyebrow="ÚLTIMO PASO" title="Configura tu restaurante" subtitle="Con esto ya puedes empezar a emparejar stands.">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, display: "block", marginBottom: 6 }}>Nombre del restaurante</label>
          <input className="auth-input" required placeholder="El Faro" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, display: "block", marginBottom: 6 }}>
            Enlace de tu menú <span style={{ fontWeight: 500, opacity: 0.7 }}>(puedes cambiarlo después)</span>
          </label>
          <input className="auth-input" type="url" placeholder="https://tu-menu.com" value={menuUrl} onChange={(e) => setMenuUrl(e.target.value)} />
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(223,110,91,0.1)",
            border: "1px solid rgba(223,110,91,0.3)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "#B5493A",
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
          {loading ? "Guardando…" : "Crear restaurante y entrar"}
        </button>
      </form>
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AuthLayout>
  );
}
