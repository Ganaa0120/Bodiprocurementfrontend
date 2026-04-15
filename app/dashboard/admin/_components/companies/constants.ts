export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label:"Зөвшөөрсөн", color:"#10b981", bg:"rgba(16,185,129,0.12)" },
  pending:  { label:"Хүлээгдэж",  color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  rejected: { label:"Татгалзсан", color:"#ef4444", bg:"rgba(239,68,68,0.12)"  },
  active:   { label:"Идэвхтэй",   color:"#10b981", bg:"rgba(16,185,129,0.12)" },
  inactive: { label:"Идэвхгүй",   color:"#94a3b8", bg:"rgba(148,163,184,0.1)" },
  returned: { label:"Буцаагдсан", color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
};

export const STATUS_ACTIONS = [
  { status:"approved", label:"Зөвшөөрөх",      color:"#10b981", bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.3)"  },
  { status:"returned", label:"Буцаах",           color:"#f59e0b", bg:"rgba(245,158,11,0.10)", border:"rgba(245,158,11,0.28)" },
  { status:"active",   label:"Идэвхтэй болгох", color:"#3b82f6", bg:"rgba(59,130,246,0.10)", border:"rgba(59,130,246,0.28)" },
  { status:"inactive", label:"Идэвхгүй болгох", color:"#94a3b8", bg:"rgba(148,163,184,0.08)",border:"rgba(148,163,184,0.22)"},
];

export const ORG_COLORS = ["#34d399","#3b82f6","#a78bfa","#fbbf24","#fb923c"];