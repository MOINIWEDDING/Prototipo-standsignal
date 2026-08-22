// components/landing/CatalogTeaser.tsx
import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import { T } from "@/lib/theme";
import ProductModel3D from "@/components/catalog/ProductModel3D";

export default function CatalogTeaser() {
  return (
    <div style={{
      background: `linear-gradient(160deg, ${T.ink} 0%, #234a75 60%, #1a3a5c 100%)`,
      borderRadius: 24, padding: "40px 28px", position: "relative", overflow: "hidden",
      display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(220px, 340px)", gap: 28, alignItems: "center",
    }}>
      <div style={{
        position: "absolute", width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,177,161,0.35), transparent 70%)",
        top: -140, right: -100,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="jk pill" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: 16 }}>
          <Boxes size={12} /> Línea NFC completa
        </div>
        <div className="jk" style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>
          Conoce nuestro catálogo
        </div>
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: 22, maxWidth: 380 }}>
          Ocho formatos de contacto sin contacto — stand de mostrador, tarjeta, tag, llavero, pulsera y más.
          Cada modelo, en 3D real, con sus medidas exactas.
        </div>
        <Link
          href="/catalogo"
          className="btn jk"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", fontSize: 13.5,
            background: "#fff", color: T.ink, textDecoration: "none",
          }}
        >
          Ver catálogo completo <ArrowRight size={15} />
        </Link>
      </div>

      <div style={{
        position: "relative", zIndex: 1, height: 260, borderRadius: 16,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <ProductModel3D productKey="stand" />
      </div>
    </div>
  );
}
