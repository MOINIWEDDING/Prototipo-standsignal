// components/landing/LandingGlobalStyles.tsx
import { T } from "@/lib/theme";

export default function LandingGlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      .jk { font-family: 'Plus Jakarta Sans', sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
      .card { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 20px; box-shadow: ${T.shadowSm}; }
      .pill { border-radius: 999px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 12px; padding: 6px 13px; display: inline-flex; align-items: center; gap: 5px; }
      .btn { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; border-radius: 12px; cursor: pointer; border: none; transition: transform .15s ease, filter .15s ease, opacity .15s ease; }
      .btn:hover { filter: brightness(1.05); }
      .btn:active { transform: scale(0.97); }
      @keyframes fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .fade-up { animation: fade-up .35s ease both; }
    `}</style>
  );
}
