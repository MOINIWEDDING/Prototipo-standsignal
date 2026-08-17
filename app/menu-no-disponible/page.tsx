// app/menu-no-disponible/page.tsx
import { UtensilsCrossed } from "lucide-react";

const T = { bg: "#F1F4FB", ink: "#1C2740", textDim: "#8892A6", blue: "#326199" };

export default function MenuUnavailablePage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg, fontFamily: "Inter, sans-serif", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: "rgba(50,97,153,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
        }}>
          <UtensilsCrossed size={26} color={T.blue} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          El menú no está disponible ahora mismo
        </div>
        <div style={{ fontSize: 14, color: T.textDim, lineHeight: 1.6 }}>
          Puede ser algo momentáneo. Avísale al personal del restaurante y con gusto te atienden directamente.
        </div>
      </div>
    </div>
  );
}
