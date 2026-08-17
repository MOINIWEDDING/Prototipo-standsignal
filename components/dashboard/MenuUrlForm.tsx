// components/dashboard/MenuUrlForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check, Loader2, AlertCircle, Link2 } from "lucide-react";
import { T } from "@/lib/theme";

export default function MenuUrlForm({ restaurantId, currentUrl }: { restaurantId: string; currentUrl: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(currentUrl === "https://" ? "" : currentUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch("/api/restaurant/menu-url", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, menuUrl: draft.trim() }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "No se pudo actualizar el enlace.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="card" style={{ padding: 24, maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <Link2 size={15} color={T.teal} />
        <div className="jk" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Enlace del menú</div>
      </div>
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 18 }}>
        Todos tus stands redirigen aquí al instante — sin reprogramar ningún chip.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginBottom: 6 }}>URL ACTIVA</div>
        <input
          className="input-pill" type="url" required placeholder="https://tu-menu.com/carta.pdf"
          value={draft} onChange={(e) => setDraft(e.target.value)}
        />

        {error && (
          <div className="fade-up" style={{ marginTop: 10, fontSize: 12, color: "#B5493A", display: "flex", gap: 6, alignItems: "center" }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading} style={{
          width: "100%", marginTop: 12, padding: "10px", fontSize: 13, background: T.teal, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={13} />}
          {loading ? "Actualizando…" : "Actualizar en todos los stands"}
        </button>
      </form>

      {saved && (
        <div className="fade-up" style={{ marginTop: 10, fontSize: 12, color: T.teal, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <Check size={13} /> Enlace actualizado
        </div>
      )}
    </div>
  );
}
