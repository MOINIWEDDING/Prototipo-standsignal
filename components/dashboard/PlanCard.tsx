// components/dashboard/PlanCard.tsx
import Link from "next/link";
import { Check, ArrowRight, Layers } from "lucide-react";
import { T } from "@/lib/theme";
import { PRICING_TIERS, formatRD, getTierForStandCount } from "@/lib/pricing";

const INCLUDED = ["Capacitación inicial", "Soporte continuo", "Reposición sin costo", "Crecimiento dentro del rango"];

export default function PlanCard({ standCount }: { standCount: number }) {
  const tier = getTierForStandCount(standCount);
  const usedPct = Math.min(100, Math.round(((standCount - tier.minStands + 1) / (tier.maxStands - tier.minStands + 1)) * 100));
  const remaining = tier.maxStands - standCount;

  return (
    <div className="card" style={{ padding: 24, background: `linear-gradient(135deg, ${T.card} 0%, ${T.card} 60%, ${tier.color}08 100%)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Layers size={15} color={tier.color} />
          <div className="jk" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Tu plan</div>
        </div>
        <span className="pill" style={{ background: `${tier.color}18`, color: tier.color }}>
          Nivel {tier.name}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
        <div className="jk" style={{ fontSize: 32, fontWeight: 800, color: T.ink }}>{formatRD(tier.monthlyPriceRD)}</div>
        <div style={{ fontSize: 13, color: T.textFaint, marginBottom: 6 }}>/ mes</div>
      </div>
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 18 }}>
        Cuota fija mientras te mantengas en el rango de {tier.minStands}–{tier.maxStands} stands.
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.textDim, marginBottom: 6 }}>
          <span className="mono">{standCount} de {tier.maxStands} stands usados</span>
          <span className="mono">{remaining > 0 ? `${remaining} disponibles` : "en el tope"}</span>
        </div>
        <div style={{ height: 8, background: T.bg, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${usedPct}%`, height: "100%", borderRadius: 999, background: tier.color, transition: "width .6s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
        {INCLUDED.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.text }}>
            <Check size={13} color={tier.color} /> {item}
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/about#planes"
        style={{
          fontSize: 12.5, fontWeight: 700, color: tier.color, textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 5,
        }}
        className="jk"
      >
        Ver todos los planes <ArrowRight size={13} />
      </Link>
    </div>
  );
}
