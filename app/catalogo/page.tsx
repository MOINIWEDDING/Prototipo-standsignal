// app/catalogo/page.tsx
import Link from "next/link";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import LandingNav from "@/components/landing/LandingNav";
import LandingGlobalStyles from "@/components/landing/LandingGlobalStyles";
import Reveal from "@/components/dashboard/Reveal";
import ProductModel3D from "@/components/catalog/ProductModel3D";
import { PRODUCTS } from "@/lib/nfc3d/builders";
import { T } from "@/lib/theme";

export const metadata = { title: "Catálogo de productos — StandSignal" };

export default function CatalogoPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <LandingGlobalStyles />
      <div style={{ background: "#0F1420" }}>
        <LandingNav />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 56px", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.6)", textDecoration: "none", marginBottom: 20 }}>
            <ArrowLeft size={13} /> Volver al inicio
          </Link>
          <div className="jk pill" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: 16 }}>
            Catálogo de productos · 2026
          </div>
          <h1 className="jk" style={{ fontSize: "clamp(28px, 4.5vw, 40px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
            Línea NFC completa
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Ocho formatos de contacto sin contacto. Un toque del teléfono abre menú, perfil, reseña o
            promoción — sin app y sin escanear nada.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.key} delay={i * 60}>
              <div className="card catalog-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 220, background: `linear-gradient(160deg, ${T.bg} 0%, #E7EBF5 100%)`, position: "relative" }}>
                  <ProductModel3D productKey={p.key} />
                  <div className="mono" style={{
                    position: "absolute", top: 12, left: 14, fontSize: 10, color: T.textFaint, letterSpacing: 0.5,
                  }}>
                    {String(i + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}
                  </div>
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <div className="jk" style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, marginBottom: 5 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5 }}>{p.spec}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderRadius: 14,
              background: T.blueSoft, fontSize: 12.5, color: T.text, flexWrap: "wrap", justifyContent: "center",
            }}>
              <span>¿Cuál conviene para tu negocio?</span>
              <a href="tel:+18297737231" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: T.blue, fontWeight: 700, textDecoration: "none" }}>
                <Phone size={13} /> +1 (829) 773-7231
              </a>
              <span style={{ color: T.textFaint }}>·</span>
              <a href="mailto:rosariosanchezc066@gmail.com" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: T.blue, fontWeight: 700, textDecoration: "none" }}>
                <Mail size={13} /> Escríbenos
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "24px", textAlign: "center", fontSize: 12, color: T.textFaint }}>
        © {new Date().getFullYear()} StandSignal — <Link href="/" style={{ color: T.textFaint }}>Inicio</Link>
      </div>

      <style>{`.catalog-card { transition: transform .25s ease, box-shadow .25s ease; } .catalog-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -14px rgba(28,39,64,0.18); }`}</style>
    </div>
  );
}
