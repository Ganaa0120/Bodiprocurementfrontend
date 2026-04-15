import { Globe, Lock, BarChart2 } from "lucide-react";
import type { AnnType } from "./types";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const tok   = () => localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";
export const authH = () => ({ Authorization: `Bearer ${tok()}` });
export const jsonH = () => ({ "Content-Type": "application/json", ...authH() });

export const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label:"Ноорог",      color:"#94a3b8", bg:"rgba(148,163,184,0.1)"  },
  published: { label:"Нийтлэгдсэн", color:"#10b981", bg:"rgba(16,185,129,0.12)" },
  closed:    { label:"Хаагдсан",    color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  cancelled: { label:"Цуцлагдсан",  color:"#ef4444", bg:"rgba(239,68,68,0.12)"  },
};

export const TYPE: Record<AnnType, { label:string; color:string; bg:string; icon:any; desc:string }> = {
  open:     { label:"Нээлттэй",    color:"#3b82f6", bg:"rgba(59,130,246,0.12)",  icon:Globe,     desc:"Бүх нийлүүлэгч харж, хариу өгч болно" },
  targeted: { label:"Хаалттай",    color:"#a78bfa", bg:"rgba(167,139,250,0.12)", icon:Lock,      desc:"Сонгосон нийлүүлэгчдэд л харагдана" },
  rfq:      { label:"Үнийн санал", color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  icon:BarChart2, desc:"Тодорхой бараа/үйлчилгээний үнийн санал" },
};

export const BID_STATUS: Record<string, { label:string; color:string; bg:string }> = {
  submitted: { label:"Хүлээгдэж",  color:"#f59e0b", bg:"rgba(245,158,11,0.12)"  },
  accepted:  { label:"Зөвшөөрсөн", color:"#10b981", bg:"rgba(16,185,129,0.12)"  },
  rejected:  { label:"Татгалзсан", color:"#ef4444", bg:"rgba(239,68,68,0.12)"   },
};

export const inp: React.CSSProperties = {
  width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:9,padding:"9px 12px",fontSize:13,color:"rgba(255,255,255,0.85)",
  outline:"none",fontFamily:"inherit",
};
export const lbl: React.CSSProperties = {
  fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,
  color:"rgba(148,163,184,0.45)",display:"block" as const,marginBottom:5,
};
export const fo = (e: any) => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)";
export const bl = (e: any) => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";