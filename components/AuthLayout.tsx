// components/AuthLayout.tsx
"use client";

import React from "react";
import { Signal, QrCode, Wifi, Server, Smartphone, Radio, TrendingUp } from "lucide-react";

/* Mismo sistema de tokens que el dashboard — la identidad visual no
   cambia solo porque el usuario todavía no inició sesión. */
const T = {
  bg: "#F1F4FB",
  card: "#FFFFFF",
  border: "#EAEEF7",
  ink: "#1C2740",
  text: "#33405C",
  textDim: "#8892A6",
  textFaint: "#AEB6C6",
  blue: "#326199",
  blueSoft: "rgba(50,97,153,0.12)",
  teal: "#4FB1A1",
  orange: "#EB8D50",
  orangeSoft: "rgba(235,141,80,0.16)",
  coral: "#DF6E5B",
};

export const AUTH_TOKENS = T;

export function AuthGlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      .jk { font-family: 'Plus Jakarta Sans', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .auth-input {
        width: 100%;
        background: ${T.bg};
        border: 1.5px solid ${T.border};
        border-radius: 12px;
        padding: 12px 14px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: ${T.ink};
        outline: none;
        transition: border-color .15s ease;
      }
      .auth-input:focus { border-color: ${T.blue}; }
      .auth-input::placeholder { color: ${T.textFaint}; }
      .auth-btn {
        width: 100%;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 700;
        font-size: 14.5px;
        padding: 13px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(90deg, ${T.blue}, ${T.teal});
        box-shadow: 0 10px 24px -10px rgba(50,97,153,0.5);
        transition: filter .15s ease, transform .15s ease, opacity .15s ease;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .auth-btn:hover { filter: brightness(1.06); }
      .auth-btn:active { transform: scale(0.98); }
      .auth-btn:disabled { opacity: .6; cursor: not-allowed; }
      .auth-link { color: ${T.blue}; font-weight: 700; text-decoration: none; cursor: pointer; }
      .auth-link:hover { text-decoration: underline; }
      @keyframes auth-pulse {
        0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
        70% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
      }
      @keyframes auth-fade {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .auth-fade { animation: auth-fade .4s ease both; }
    `}</style>
  );
}

export default function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: "Inter, sans-serif" }}>
      <AuthGlobalStyles />

      {/* ---------------- Panel de marca (signature element) ---------------- */}
      <div
        style={{
          flex: "1 1 46%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px 48px",
          background: `linear-gradient(160deg, ${T.blue} 0%, #234a75 55%, #1a3a5c 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
        className="auth-hero"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Signal size={19} color="#fff" strokeWidth={2.5} />
          </div>
          <div className="jk" style={{ fontSize: 17, fontWeight: 800 }}>StandSignal</div>
        </div>

        <div style={{ zIndex: 1 }}>
          <div
            className="jk"
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              marginBottom: 18,
              letterSpacing: 0.3,
            }}
          >
            NFC + QR para restaurantes
          </div>
          <div className="jk" style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
            Cada mesa, cada toque,<br /> convertido en un dato.
          </div>
          <div style={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, maxWidth: 400 }}>
            Reemplaza la carta de papel con un stand inteligente y mira en tiempo real
            qué mesas están activas, a qué hora llega más gente, y si tus clientes
            prefieren tocar o escanear.
          </div>

          {/* mini diagrama de flujo — mismo motivo visual del producto */}
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 16,
              padding: "16px 18px",
              maxWidth: 380,
            }}
          >
            <FlowNode icon={<Wifi size={16} color="#fff" />} label="STAND" pulse />
            <FlowLine />
            <FlowNode icon={<Server size={16} color="#fff" />} label="/tap" />
            <FlowLine />
            <FlowNode icon={<Smartphone size={16} color="#fff" />} label="MENÚ" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 22, zIndex: 1 }}>
          <MiniStat icon={<Radio size={14} />} label="NFC y QR en un solo panel" />
          <MiniStat icon={<TrendingUp size={14} />} label="Analítica en tiempo real" />
        </div>

        {/* halo decorativo, sutil, no compite con el contenido */}
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,177,161,0.35), transparent 70%)",
            top: -140,
            right: -140,
          }}
        />
      </div>

      {/* ---------------- Panel del formulario ---------------- */}
      <div
        style={{
          flex: "1 1 54%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
        className="auth-form-panel"
      >
        <div className="auth-fade" style={{ width: "100%", maxWidth: 400 }}>
          <div
            className="jk"
            style={{ fontSize: 12, fontWeight: 700, color: T.orange, letterSpacing: 0.4, marginBottom: 8 }}
          >
            {eyebrow}
          </div>
          <div className="jk" style={{ fontSize: 26, fontWeight: 800, color: T.ink, marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 13.5, color: T.textDim, marginBottom: 28 }}>{subtitle}</div>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .auth-hero { display: none; }
          .auth-form-panel { flex: 1 1 100%; }
        }
      `}</style>
    </div>
  );
}

function FlowNode({ icon, label, pulse }: { icon: React.ReactNode; label: string; pulse?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: pulse ? "auth-pulse 2s infinite" : "none",
        }}
      >
        {icon}
      </div>
      <div className="mono" style={{ fontSize: 8.5, color: "rgba(255,255,255,0.65)", marginTop: 5 }}>
        {label}
      </div>
    </div>
  );
}
function FlowLine() {
  return <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.25)", borderRadius: 2 }} />;
}
function MiniStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
      {icon} {label}
    </div>
  );
}
