// lib/theme.ts
// Único lugar donde vive la paleta — cámbiala aquí y se propaga a toda la app.
export const T = {
  bg: "#F1F4FB",
  card: "#FFFFFF",
  border: "#EAEEF7",
  borderSoft: "#F0F3FA",
  ink: "#1C2740",
  text: "#33405C",
  textDim: "#8892A6",
  textFaint: "#AEB6C6",

  blue: "#326199",
  blueSoft: "rgba(50,97,153,0.10)",
  teal: "#4FB1A1",
  tealSoft: "rgba(79,177,161,0.12)",
  yellow: "#FCC055",
  yellowSoft: "rgba(252,192,85,0.18)",
  orange: "#EB8D50",
  orangeSoft: "rgba(235,141,80,0.14)",
  coral: "#DF6E5B",
  coralSoft: "rgba(223,110,91,0.12)",

  shadow: "0 10px 30px -12px rgba(28,39,64,0.12)",
  shadowSm: "0 4px 14px -6px rgba(28,39,64,0.08)",
} as const;
