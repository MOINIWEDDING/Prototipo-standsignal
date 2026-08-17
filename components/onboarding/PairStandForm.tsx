// components/onboarding/PairStandForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle, QrCode, Wifi } from "lucide-react";
import { T } from "@/lib/theme";

type TableOption = { id: string; label: string };

export default function PairStandForm({
  physicalCode,
  kind,
  tables,
}: {
  physicalCode: string;
  kind: "nfc" | "qr";
  tables: TableOption[];
}) {
  const router = useRouter();
  const [tableId, setTableId] = useState(tables[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePair(e: React.FormEvent) {
    e.preventDefault();
    if (!tableId) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stands/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ physicalCode, tableId }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "No se pudo emparejar el stand.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard/tables"), 1400);
  }

  if (tables.length === 0) {
    return (
      <div style={{ fontSize: 13.5, color: T.textDim, lineHeight: 1.6 }}>
        Todavía no tienes mesas creadas.{" "}
        <a href="/dashboard/tables" className="auth-link">Crea una primero</a> y vuelve a tocar este stand.
      </div>
    );
  }

  if (done) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: "rgba(79,177,161,0.12)",
        border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, color: T.teal, fontWeight: 700, fontSize: 13.5,
      }}>
        <Check size={18} /> Stand emparejado. Redirigiendo…
      </div>
    );
  }

  return (
    <form onSubmit={handlePair} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "12px 14px",
      }}>
        {kind === "nfc" ? <Wifi size={16} color={T.blue} /> : <QrCode size={16} color={T.orange} />}
        <div>
          <div style={{ fontSize: 12, color: T.textDim }}>Código físico detectado</div>
          <div className="mono" style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>{physicalCode}</div>
        </div>
      </div>

      <div>
        <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
          Asignar a la mesa
        </label>
        <select
          className="auth-input"
          style={{ width: "100%" }}
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
        >
          {tables.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
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
        {loading ? "Emparejando…" : "Emparejar este stand"}
      </button>
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </form>
  );
}
