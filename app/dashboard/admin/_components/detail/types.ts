export type DetailProps = {
  person: any;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  loading: boolean;
  returnReason: string;
  setReturnReason: (v: string) => void;
};

export const ACTIONS = [
  { status:"active",   label:"Зөвшөөрөх",        color:"#34d399", border:"rgba(52,211,153,0.3)",  bg:"rgba(52,211,153,0.08)"  },
  { status:"returned", label:"Буцаах",             color:"#fbbf24", border:"rgba(251,191,36,0.3)",  bg:"rgba(251,191,36,0.08)"  },
  { status:"inactive", label:"Түдгэлзүүлэх",      color:"#64748b", border:"rgba(100,116,139,0.3)", bg:"rgba(100,116,139,0.08)" },
  { status:"pending",  label:"Хүлээгдэж болгох",  color:"#fbbf24", border:"rgba(251,191,36,0.2)",  bg:"rgba(251,191,36,0.05)"  },
];

export const fmtDate = (v?: string | null) => {
  if (!v) return null;
  try {
    return new Date(v).toLocaleDateString("mn-MN", {
      year:"numeric", month:"2-digit", day:"2-digit",
    });
  } catch { return v; }
};