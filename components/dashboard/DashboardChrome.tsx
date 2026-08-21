// components/dashboard/DashboardChrome.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Signal, LayoutDashboard, Table2, Utensils, Settings,
  Search, Bell, Calendar, ChevronDown, FlaskConical, Info,
} from "lucide-react";
import { T } from "@/lib/theme";
import SignOutButton from "@/components/SignOutButton";

export function DashboardGlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      .jk { font-family: 'Plus Jakarta Sans', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 20px; box-shadow: ${T.shadowSm}; }
      .btn {
        font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; border-radius: 12px; cursor: pointer;
        border: none; transition: transform .15s ease, filter .15s ease, opacity .15s ease;
      }
      .btn:hover { filter: brightness(1.05); }
      .btn:active { transform: scale(0.97); }
      .btn:disabled { opacity: .5; cursor: not-allowed; }
      .pill { border-radius: 999px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 12px; padding: 6px 13px; display: inline-flex; align-items: center; gap: 5px; }
      .nav-item {
        display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 13px; cursor: pointer;
        font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 13.5px; color: ${T.textDim};
        transition: all .15s ease; text-decoration: none;
      }
      .nav-item:hover { background: ${T.blueSoft}; color: ${T.blue}; }
      .nav-item.active { background: ${T.blue}; color: #fff; box-shadow: 0 8px 18px -8px rgba(50,97,153,0.55); }
      .input-pill { background: ${T.bg}; border: 1px solid ${T.border}; border-radius: 12px; color: ${T.ink}; padding: 10px 13px; font-family: 'JetBrains Mono', monospace; font-size: 13px; width: 100%; outline: none; }
      .input-pill:focus { border-color: ${T.blue}; }
      .select-pill { background: ${T.bg}; border: 1px solid ${T.border}; color: ${T.ink}; border-radius: 12px; padding: 9px 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13px; outline: none; }
      @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(79,177,161,0.5); } 70% { box-shadow: 0 0 0 12px rgba(79,177,161,0); } 100% { box-shadow: 0 0 0 0 rgba(79,177,161,0); } }
      @keyframes fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .fade-up { animation: fade-up .35s ease both; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .spin { animation: spin .8s linear infinite; }
      .scroll::-webkit-scrollbar { width: 6px; }
      .scroll::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
    `}</style>
  );
}

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/tables", label: "Mesas y stands", icon: Table2 },
  { href: "/dashboard/settings", label: "Menú y ajustes", icon: Utensils },
];

export function Sidebar({ restaurantName, logoUrl }: { restaurantName: string; logoUrl?: string | null }) {
  const pathname = usePathname();

  return (
    <div style={{
      width: 232, flexShrink: 0, background: T.card, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", padding: "22px 16px", position: "sticky", top: 0, height: "100vh",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 30 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0, overflow: "hidden",
          background: logoUrl ? T.bg : `linear-gradient(135deg, ${T.blue}, ${T.teal})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {logoUrl ? (
            // Tamaño correcto garantizado: el contenedor es fijo (36x36) y la
            // imagen siempre se recorta a cubrirlo, sin importar su proporción original.
            <img src={logoUrl} alt={restaurantName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Signal size={18} color="#fff" strokeWidth={2.5} />
          )}
        </div>
        <div className="jk" style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {restaurantName}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="mono" style={{ fontSize: 10, color: T.textFaint, padding: "0 12px", marginBottom: 4, letterSpacing: 0.6 }}>PANEL</div>
        {NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <Icon size={17} /> {item.label}
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="mono" style={{ fontSize: 10, color: T.textFaint, padding: "0 12px", marginBottom: 4, letterSpacing: 0.6 }}>HERRAMIENTAS</div>
        <Link href="/dashboard/scan-test" className={`nav-item ${pathname.startsWith("/dashboard/scan-test") ? "active" : ""}`}>
          <FlaskConical size={17} /> Simulador de prueba
        </Link>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        <Link href="/dashboard/about" className={`nav-item ${pathname.startsWith("/dashboard/about") ? "active" : ""}`}>
          <Info size={17} /> Sobre nuestro servicio
        </Link>
        <div style={{ height: 1, background: T.border, margin: "10px 12px" }} />
        <SignOutButton />
      </div>
    </div>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ padding: "24px 28px 0", maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="jk" style={{ fontSize: 24, fontWeight: 800, color: T.ink }}>{title}</div>
          <div style={{ fontSize: 13, color: T.textDim, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 12, boxShadow: "none" }}>
            <Search size={15} color={T.textFaint} />
            <span style={{ fontSize: 13, color: T.textFaint }}>Buscar…</span>
          </div>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 12, boxShadow: "none", fontSize: 13, fontWeight: 600 }}>
            <Calendar size={14} color={T.blue} /> Últimos 3 días <ChevronDown size={13} color={T.textFaint} />
          </div>
          <div className="card" style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none", position: "relative" }}>
            <Bell size={16} color={T.textDim} />
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: T.border, margin: "20px 0 0" }} />
    </div>
  );
}
