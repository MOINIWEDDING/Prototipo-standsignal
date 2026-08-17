// components/dashboard/TablesManager.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle, Wifi, QrCode, Check, ChevronDown, ChevronUp } from "lucide-react";
import { T } from "@/lib/theme";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import TableLinksPanel from "@/components/dashboard/TableLinksPanel";

type TableRow = { id: string; label: string; is_active: boolean };
type StandRow = {
  id: string;
  physical_code: string;
  kind: "nfc" | "qr";
  paired_at: string | null;
  table_id: string | null;
  tables: { label: string } | null;
};

export default function TablesManager({
  restaurantId,
  initialTables,
  initialStands,
}: {
  restaurantId: string;
  initialTables: TableRow[];
  initialStands: StandRow[]; // solo relevantes para el método avanzado (UID mirroring)
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [tables, setTables] = useState(initialTables);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [pairCode, setPairCode] = useState("");
  const [pairTableId, setPairTableId] = useState(initialTables[0]?.id || "");
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairSuccess, setPairSuccess] = useState(false);

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    setTableError(null);

    const { data, error } = await supabase
      .from("tables")
      .insert({ restaurant_id: restaurantId, label: newLabel.trim() })
      .select("id, label, is_active")
      .single();

    setAdding(false);

    if (error) {
      setTableError(error.code === "23505" ? "Ya existe una mesa con ese nombre." : error.message);
      return;
    }
    setTables((prev) => [...prev, data]);
    if (!pairTableId) setPairTableId(data.id);
    setNewLabel("");
    router.refresh();
  }

  async function pairStand(e: React.FormEvent) {
    e.preventDefault();
    if (!pairCode.trim() || !pairTableId) return;
    setPairing(true);
    setPairError(null);
    setPairSuccess(false);

    const res = await fetch("/api/stands/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ physicalCode: pairCode.trim(), tableId: pairTableId }),
    });
    const json = await res.json();
    setPairing(false);

    if (!res.ok) {
      setPairError(json.error || "No se pudo emparejar. Verifica el código.");
      return;
    }
    setPairSuccess(true);
    setPairCode("");
    router.refresh();
    setTimeout(() => setPairSuccess(false), 2500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ------------------------- mesas + enlaces (flujo principal) ------------------------- */}
      <div className="card" style={{ padding: 24 }}>
        <div className="jk" style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 4 }}>Tus mesas</div>
        <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 16 }}>
          Crea una mesa y de inmediato tienes su enlace NFC y su código QR listos — no hace falta ningún paso extra.
        </div>

        <form onSubmit={addTable} style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <input className="input-pill" placeholder="Ej. Terraza 3" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <button type="submit" className="btn" disabled={adding} style={{
            padding: "0 16px", background: T.blue, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap",
          }}>
            {adding ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Agregar
          </button>
        </form>

        {tableError && (
          <div style={{ marginBottom: 12, fontSize: 12, color: "#B5493A", display: "flex", gap: 6, alignItems: "center" }}>
            <AlertCircle size={13} /> {tableError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tables.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint, padding: "10px 0" }}>Aún no tienes mesas — agrega la primera arriba.</div>}
          {tables.map((t) => (
            <TableLinksPanel key={t.id} tableId={t.id} tableLabel={t.label} />
          ))}
        </div>
      </div>

      {/* ------------------------- avanzado: UID mirroring ------------------------- */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="jk"
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: T.text,
          }}
        >
          <span>Avanzado: emparejar por UID de hardware (opcional)</span>
          {showAdvanced ? <ChevronUp size={16} color={T.textFaint} /> : <ChevronDown size={16} color={T.textFaint} />}
        </button>

        {showAdvanced && (
          <div className="fade-up" style={{ padding: "0 24px 24px" }}>
            <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 16, lineHeight: 1.6 }}>
              Solo necesitas esto si programaste tus chips con la técnica de <b>UID mirroring</b> (NXP TagWriter),
              donde el chip autocompleta su propio identificador. Si usaste el enlace directo de arriba, ignora esta sección.
            </div>

            <form onSubmit={pairStand} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <input className="input-pill" placeholder="UID del chip, ej. 04A22C91B84D80" value={pairCode} onChange={(e) => setPairCode(e.target.value)} />
              <div style={{ display: "flex", gap: 8 }}>
                <select className="select-pill" style={{ flex: 1 }} value={pairTableId} onChange={(e) => setPairTableId(e.target.value)}>
                  {tables.length === 0 && <option value="">Crea una mesa primero</option>}
                  {tables.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button type="submit" className="btn" disabled={pairing || tables.length === 0} style={{
                  padding: "0 16px", background: T.teal, color: "#fff", display: "flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap",
                }}>
                  {pairing ? <Loader2 size={14} className="spin" /> : <Check size={14} />} Emparejar
                </button>
              </div>
              {pairError && (
                <div style={{ fontSize: 12, color: "#B5493A", display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertCircle size={13} /> {pairError}
                </div>
              )}
              {pairSuccess && (
                <div className="fade-up" style={{ fontSize: 12, color: T.teal, display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
                  <Check size={13} /> Stand emparejado correctamente
                </div>
              )}
            </form>

            <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginBottom: 8, letterSpacing: 0.4 }}>
              EMPAREJADOS ({initialStands.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {initialStands.length === 0 && <div style={{ fontSize: 12.5, color: T.textFaint }}>Ninguno todavía.</div>}
              {initialStands.map((s) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`,
                }}>
                  {s.kind === "nfc" ? <Wifi size={14} color={T.blue} /> : <QrCode size={14} color={T.orange} />}
                  <span className="mono" style={{ fontSize: 11.5, color: T.ink, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.physical_code}</span>
                  <span className="jk" style={{ fontSize: 12, fontWeight: 700, color: T.text, flexShrink: 0 }}>{s.tables?.label}</span>
                  <Check size={13} color={T.teal} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
