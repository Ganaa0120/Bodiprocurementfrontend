export const TYPE_CFG = {
  open: {
    label: "Нээлттэй",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    emoji: "🌐",
  },
  targeted: {
    label: "Хаалттай",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    emoji: "🔒",
  },
  rfq: {
    label: "Үнийн санал",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    emoji: "📊",
  },
};

export type AnnTypeCfgKey = keyof typeof TYPE_CFG;

// ✅ Энэ функцийг ашиглавал бүх газар any алдаа гарахгүй
export function getTypeCfg(annType: string) {
  return TYPE_CFG[annType as AnnTypeCfgKey] ?? TYPE_CFG.open;
}

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";