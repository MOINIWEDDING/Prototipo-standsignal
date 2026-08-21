// components/dashboard/about/HeroFlowIllustration.tsx
import React from "react";
import { Wifi, Server, BarChart3 } from "lucide-react";
import { T } from "@/lib/theme";

export default function HeroFlowIllustration() {
  return (
    <div style={{
      background: `linear-gradient(160deg, ${T.ink} 0%, #234a75 60%, #1a3a5c 100%)`,
      borderRadius: 24, padding: "40px 28px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,177,161,0.35), transparent 70%)",
        top: -140, right: -100,
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, position: "relative", zIndex: 1 }}>
        <Node icon={<Wifi size={20} color="#fff" />} label="MESA" />
        <Track />
        <Node icon={<Server size={20} color="#fff" />} label="STANDSIGNAL" />
        <Track />
        <Node icon={<BarChart3 size={20} color="#fff" />} label="TU TABLERO" />
      </div>

      <div style={{
        marginTop: 28, fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center",
        maxWidth: 380, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6, position: "relative", zIndex: 1,
      }}>
        Cada toque en la mesa viaja a StandSignal y aparece en tu tablero al instante —
        sin apps que descargar, sin fricción para el cliente.
      </div>
    </div>
  );
}

function Node({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 15, background: "rgba(255,255,255,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", marginTop: 8, fontWeight: 700, letterSpacing: 0.4, fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </div>
    </div>
  );
}

function Track() {
  return (
    <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.18)", borderRadius: 2, position: "relative", overflow: "hidden", minWidth: 20 }}>
      <div className="hero-pulse-dot" style={{
        position: "absolute", top: "50%", left: 0, width: 8, height: 8, borderRadius: "50%",
        background: T.teal, transform: "translateY(-50%)", boxShadow: `0 0 12px 2px ${T.teal}`,
      }} />
      <style>{`
        @keyframes hero-travel { 0% { left: -2%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 98%; opacity: 0; } }
        .hero-pulse-dot { animation: hero-travel 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
