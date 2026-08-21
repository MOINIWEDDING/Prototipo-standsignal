// lib/pricing.ts
// Única fuente de verdad para los rangos de precio — la usan tanto
// "Tu plan" (Ajustes) como "Sobre nuestro servicio", para que nunca queden
// desincronizados si el precio cambia.

export type PricingTier = {
  id: string;
  name: string;
  minStands: number;
  maxStands: number;
  monthlyPriceRD: number;
  color: string;
};

export const PRICING_TIERS: PricingTier[] = [
  { id: "starter", name: "Starter", minStands: 1, maxStands: 25, monthlyPriceRD: 15000, color: "#4FB1A1" },
  { id: "growth", name: "Growth", minStands: 26, maxStands: 50, monthlyPriceRD: 20000, color: "#326199" },
  { id: "business", name: "Business", minStands: 51, maxStands: 100, monthlyPriceRD: 25000, color: "#EB8D50" },
  { id: "enterprise", name: "Enterprise", minStands: 101, maxStands: 150, monthlyPriceRD: 32500, color: "#DF6E5B" },
  { id: "enterprise-plus", name: "Enterprise+", minStands: 151, maxStands: 250, monthlyPriceRD: 42500, color: "#1F3F63" },
  { id: "corporate", name: "Corporate", minStands: 251, maxStands: 400, monthlyPriceRD: 55000, color: "#1C2740" },
];

export const INSTALLATION_FEE_RD = 15000;

export function formatRD(amount: number) {
  return "RD$" + amount.toLocaleString("es-DO");
}

export function getTierForStandCount(count: number): PricingTier {
  const found = PRICING_TIERS.find((t) => count >= t.minStands && count <= t.maxStands);
  return found || PRICING_TIERS[PRICING_TIERS.length - 1];
}
