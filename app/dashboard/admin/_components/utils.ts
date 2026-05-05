// app/dashboard/admin/_components/constants.ts
//
// Энэ файл дотор STATUS_CFG-г олоод доорх кодоор солино.
// API, ORG_COLORS гэх мэт бусад export-уудыг ХӨНДӨХГҮЙ — хэвээр үлдээнэ!

export const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  new: {
    label: "Бүртгэл үүсгэж байна",
    color: "#0369a1",
    bg: "rgba(14,165,233,0.12)",
    dot: "#0ea5e9",
  },
  pending: {
    label: "Хүсэлт ирсэн",
    color: "#d97706",
    bg: "rgba(245,158,11,0.12)",
    dot: "#f59e0b",
  },
  active: {
    label: "Баталгаажсан",
    color: "#059669",
    bg: "rgba(16,185,129,0.12)",
    dot: "#10b981",
  },
  approved: {
    label: "Баталгаажсан",
    color: "#059669",
    bg: "rgba(16,185,129,0.12)",
    dot: "#10b981",
  },
  returned: {
    label: "Буцаагдсан",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.12)",
    dot: "#ef4444",
  },
  inactive: {
    label: "Идэвхгүй",
    color: "#64748b",
    bg: "rgba(100,116,139,0.12)",
    dot: "#94a3b8",
  },
  rejected: {
    label: "Татгалзсан",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.12)",
    dot: "#ef4444",
  },
};