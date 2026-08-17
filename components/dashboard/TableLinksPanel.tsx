// components/dashboard/TableLinksPanel.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Download, Wifi, QrCode as QrIcon, ChevronDown, ChevronUp } from "lucide-react";
import { T } from "@/lib/theme";

export default function TableLinksPanel({ tableId, tableLabel }: { tableId: string; tableLabel: string }) {
  const [open, setOpen] = useState(false);
  const [copiedWhich, setCopiedWhich] = useState<"nfc" | "qr" | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseUrl =
    (typeof window !== "undefined" && window.location.origin) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://tudominio.com";

  const nfcLink = `${baseUrl}/tap?t=${tableId}&m=nfc`;
  const qrLink = `${baseUrl}/tap?t=${tableId}&m=qr`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(qrLink, {
      width: 400,
      margin: 1,
      color: { dark: "#1C2740", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [open, qrLink]);

  function copy(text: string, which: "nfc" | "qr") {
    navigator.clipboard.writeText(text);
    setCopiedWhich(which);
    setTimeout(() => setCopiedWhich(null), 1800);
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${tableLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="jk"
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px", background: T.bg, border: "none", cursor: "pointer",
          fontSize: 12.5, fontWeight: 700, color: T.ink,
        }}
      >
        <span>{tableLabel} — enlace NFC / código QR</span>
        {open ? <ChevronUp size={15} color={T.textFaint} /> : <ChevronDown size={15} color={T.textFaint} />}
      </button>

      {open && (
        <div className="fade-up" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* -------- enlace NFC -------- */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Wifi size={13} color={T.blue} />
              <span className="jk" style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>
                Enlace para programar el chip NFC
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div className="mono" style={{
                flex: 1, fontSize: 11.5, color: T.text, background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "8px 10px", overflowX: "auto", whiteSpace: "nowrap",
              }}>
                {nfcLink}
              </div>
              <button onClick={() => copy(nfcLink, "nfc")} className="btn" style={{
                padding: "0 12px", background: copiedWhich === "nfc" ? T.teal : T.blue, color: "#fff",
                display: "flex", alignItems: "center", gap: 5, fontSize: 12, flexShrink: 0,
              }}>
                {copiedWhich === "nfc" ? <Check size={13} /> : <Copy size={13} />}
                {copiedWhich === "nfc" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5 }}>
              Escribe esta URL tal cual, con cualquier app de escritura NFC (ej. NFC Tools).
            </div>
          </div>

          {/* -------- codigo QR -------- */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <QrIcon size={13} color={T.orange} />
              <span className="jk" style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>
                Código QR para imprimir
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR de ${tableLabel}`} style={{ width: 96, height: 96, borderRadius: 8, border: `1px solid ${T.border}` }} />
              ) : (
                <div style={{ width: 96, height: 96, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}` }} />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
                <div className="mono" style={{
                  fontSize: 11, color: T.text, background: T.bg, border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "7px 9px", overflowX: "auto", whiteSpace: "nowrap",
                }}>
                  {qrLink}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copy(qrLink, "qr")} className="btn" style={{
                    flex: 1, padding: "8px", background: copiedWhich === "qr" ? T.teal : T.bg, color: copiedWhich === "qr" ? "#fff" : T.text,
                    border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11.5,
                  }}>
                    {copiedWhich === "qr" ? <Check size={12} /> : <Copy size={12} />} Copiar link
                  </button>
                  <button onClick={downloadQr} className="btn" style={{
                    flex: 1, padding: "8px", background: T.orange, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11.5,
                  }}>
                    <Download size={12} /> Descargar PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
