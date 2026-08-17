// app/dashboard/scan-test/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { QrCode, Wifi, Server, Smartphone, ArrowRight, Check, Info } from "lucide-react";
import { T } from "@/lib/theme";
import { TopBar } from "@/components/dashboard/DashboardChrome";

// Herramienta de QA para tu equipo de ventas/soporte: enseña visualmente
// el flujo stand -> servidor -> menú SIN escribir en scan_events real.
// Los escaneos de verdad solo entran por /tap, tocando un chip físico.
const DEMO_TABLES = ["Mesa 1", "Mesa 2", "Terraza 1", "Barra"];

export default function ScanTestPage() {
  const [table, setTable] = useState(DEMO_TABLES[0]);
  const [medium, setMedium] = useState<"qr" | "nfc">("qr");
  const [stage, setStage] = useState(0);
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function run() {
    if (stage !== 0) return;
    timers.current.forEach(clearTimeout);
    setStage(1);
    timers.current.push(setTimeout(() => setStage(2), 550));
    timers.current.push(setTimeout(() => setStage(3), 1150));
    timers.current.push(setTimeout(() => setStage(0), 3000));
  }

  return (
    <>
      <TopBar title="Simulador de prueba" subtitle="Solo visual — no genera datos reales en tus analíticas" />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 28px 60px" }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-start", background: T.blueSoft, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 14, fontSize: 12.5, color: T.text, marginBottom: 20,
        }}>
          <Info size={15} color={T.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          Esta pantalla es una demo del recorrido técnico, útil para explicarle el producto a alguien.
          No escribe en tu base de datos — los escaneos reales solo entran cuando alguien toca un stand físico.
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 160px" }}>
              <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginBottom: 6 }}>MESA (DEMO)</div>
              <select className="select-pill" style={{ width: "100%" }} value={table} onChange={(e) => setTable(e.target.value)} disabled={stage !== 0}>
                {DEMO_TABLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginBottom: 6 }}>MEDIO</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn" disabled={stage !== 0} onClick={() => setMedium("qr")} style={{
                  flex: 1, padding: "9px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13,
                  background: medium === "qr" ? T.orangeSoft : T.bg, color: medium === "qr" ? T.orange : T.textDim,
                  border: `1.5px solid ${medium === "qr" ? T.orange : T.border}`,
                }}><QrCode size={14} /> QR</button>
                <button className="btn" disabled={stage !== 0} onClick={() => setMedium("nfc")} style={{
                  flex: 1, padding: "9px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13,
                  background: medium === "nfc" ? T.blueSoft : T.bg, color: medium === "nfc" ? T.blue : T.textDim,
                  border: `1.5px solid ${medium === "nfc" ? T.blue : T.border}`,
                }}><Wifi size={14} /> NFC</button>
              </div>
            </div>
          </div>

          <FlowDiagram stage={stage} medium={medium} table={table} />

          <button className="btn" onClick={run} disabled={stage !== 0} style={{
            width: "100%", marginTop: 20, padding: "13px", fontSize: 14,
            background: stage === 0 ? `linear-gradient(90deg, ${T.blue}, ${T.teal})` : T.bg,
            color: stage === 0 ? "#fff" : T.textFaint,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {stage === 0 && <>Simular toque / escaneo <ArrowRight size={16} /></>}
            {stage === 1 && "Stand enviando petición…"}
            {stage === 2 && "Servidor resolviendo URL…"}
            {stage === 3 && <><Check size={16} /> Redirigido</>}
          </button>
        </div>
      </div>
    </>
  );
}

function FlowDiagram({ stage, medium, table }: { stage: number; medium: "qr" | "nfc"; table: string }) {
  const accent = medium === "qr" ? T.orange : T.blue;
  const accentSoft = medium === "qr" ? T.orangeSoft : T.blueSoft;
  const node = (active: boolean) => ({
    width: 62, height: 62, borderRadius: 16, background: active ? accentSoft : T.bg,
    border: `1.5px solid ${active ? accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .3s ease",
  });
  const line = (on: boolean) => ({ flex: 1, height: 2.5, borderRadius: 2, background: on ? `linear-gradient(90deg, ${T.blue}, ${T.teal})` : T.border, transition: "background .3s ease" });

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ textAlign: "center" }}>
          <div style={node(stage >= 1)}>{medium === "qr" ? <QrCode size={24} color={stage >= 1 ? T.orange : T.textFaint} /> : <Wifi size={24} color={stage >= 1 ? T.blue : T.textFaint} />}</div>
          <div className="mono" style={{ fontSize: 10, color: T.textFaint, marginTop: 6 }}>{table.toUpperCase()}</div>
        </div>
        <div style={line(stage >= 1)} />
        <div style={{ textAlign: "center" }}>
          <div style={node(stage >= 2)}><Server size={22} color={stage >= 2 ? T.blue : T.textFaint} /></div>
          <div className="mono" style={{ fontSize: 10, color: T.textFaint, marginTop: 6 }}>/tap</div>
        </div>
        <div style={line(stage >= 3)} />
        <div style={{ textAlign: "center" }}>
          <div style={node(stage >= 3)}><Smartphone size={22} color={stage >= 3 ? T.orange : T.textFaint} /></div>
          <div className="mono" style={{ fontSize: 10, color: T.textFaint, marginTop: 6 }}>MENÚ</div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginTop: 16, textAlign: "center" }}>
        {stage === 0 && `tudominio.com/tap?${medium === "nfc" ? "uid=..." : "code=..."}`}
        {stage === 1 && "→ leyendo parámetros + user-agent…"}
        {stage === 2 && "→ resolviendo menu_url (cache-first)…"}
        {stage === 3 && "→ HTTP 302 disparado ✓ (demo, no se guardó nada)"}
      </div>
    </div>
  );
}
