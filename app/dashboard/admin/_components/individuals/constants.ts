import { CheckCircle2, AlertCircle } from "lucide-react";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label:"Баталгаажсан",   color:"#10b981", bg:"rgba(16,185,129,0.12)", dot:"#10b981" },
  pending:  { label:"Хянагдаж байна", color:"#f59e0b", bg:"rgba(245,158,11,0.12)", dot:"#f59e0b" },
  returned: { label:"Буцаагдсан",     color:"#ef4444", bg:"rgba(239,68,68,0.12)",  dot:"#ef4444" },
};

export const STATUS_ACTIONS = [
  { status:"active",   label:"Баталгаажсан болгох", icon:CheckCircle2, color:"#10b981", bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.3)" },
  { status:"returned", label:"Буцаах",              icon:AlertCircle,  color:"#ef4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.28)" },
  { status:"pending",  label:"Хянагдаж буй болгох", icon:null,         color:"#f59e0b", bg:"rgba(245,158,11,0.10)", border:"rgba(245,158,11,0.28)" },
];

export const AIMAG = [
  "Улаанбаатар","Архангай","Баян-Өлгий","Баянхонгор","Булган","Говь-Алтай",
  "Говьсүмбэр","Дархан-Уул","Дорноговь","Дорнод","Дундговь","Завхан",
  "Орхон","Өвөрхангай","Өмнөговь","Сүхбаатар","Сэлэнгэ","Төв","Увс",
  "Ховд","Хөвсгөл","Хэнтий",
];

export const AVATAR_COLORS = [
  "#34d399","#3b82f6","#a78bfa","#fbbf24","#fb923c","#60a5fa","#f87171",
];