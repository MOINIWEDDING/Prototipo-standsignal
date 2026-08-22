// components/landing/LandingNav.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Signal } from "lucide-react";
import { T } from "@/lib/theme";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled ? "#0F1420" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        transition: "background .25s ease, border-color .25s ease",
      }}
    >
      <div style={{
        maxWidth: 1180, margin: "0 auto", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${T.blue}, ${T.teal})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Signal size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="jk" style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>StandSignal</span>
        </div>

        <Link
          href="/login"
          className="jk"
          style={{
            background: "#fff", color: "#0F1420", fontSize: 13.5, fontWeight: 700,
            padding: "10px 20px", borderRadius: 999, textDecoration: "none",
            transition: "transform .15s ease, filter .15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
