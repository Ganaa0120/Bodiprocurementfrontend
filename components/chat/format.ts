import type { LastMessagePreview, MemberRef } from "@/lib/chat/types";

const WD = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
const pad = (n: number) => String(n).padStart(2, "0");
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const dayDiff = (d: Date) => Math.round((dayStart(new Date()) - dayStart(d)) / 86_400_000);

export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function fmtListTime(iso: string): string {
  const d = new Date(iso);
  const diff = dayDiff(d);
  if (diff <= 0) return fmtTime(iso);
  if (diff === 1) return "Өчигдөр";
  if (diff < 7) return WD[d.getDay()];
  if (d.getFullYear() === new Date().getFullYear()) return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function fmtDayLabel(iso: string): string {
  const d = new Date(iso);
  const diff = dayDiff(d);
  if (diff <= 0) return "Өнөөдөр";
  if (diff === 1) return "Өчигдөр";
  if (diff < 7) return `${WD[d.getDay()]} гараг`;
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`;
}

export function fmtFull(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${fmtTime(iso)}`;
}

export function fmtLastSeen(iso: string | null, online: boolean): string {
  if (online) return "Идэвхтэй байна";
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "Дөнгөж сая идэвхтэй байсан";
  if (mins < 60) return `${mins} минутын өмнө идэвхтэй байсан`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} цагийн өмнө идэвхтэй байсан`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} өдрийн өмнө идэвхтэй байсан`;
  return "";
}

export const fmtSize = (b: number) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`;

export const sameRef = (a: MemberRef, b: MemberRef) => a.type === b.type && a.id === b.id;
export const refKey = (m: MemberRef) => `${m.type}:${m.id}`;

export function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const PALETTE = ["#2563eb", "#0891b2", "#7c3aed", "#c2410c", "#15803d", "#be185d", "#4f46e5", "#a16207"];
export function colorFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const EMOJI_ONLY = /^(?:[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u200d\ufe0f]|\s)+$/u;
export function isEmojiOnly(s: string): boolean {
  const t = s.trim();
  return !!t && [...t].length <= 8 && EMOJI_ONLY.test(t) && /\p{Extended_Pictographic}/u.test(t);
}

export function previewText(lm: LastMessagePreview | null, me: MemberRef, isGroup: boolean): string {
  if (!lm) return "Мессеж алга";
  if (lm.kind === "system") return lm.body;
  const mine = sameRef(lm.sender, me);
  const who = mine ? "Та: " : isGroup ? `${lm.senderName.split(/\s+/)[0]}: ` : "";
  if (lm.deleted) return mine ? "Та мессежээ буцаасан" : "Мессеж буцаагдсан";
  if (lm.body) return who + lm.body.replace(/\s+/g, " ");
  if (lm.attachmentKind === "image") return who + (lm.attachmentCount > 1 ? `${lm.attachmentCount} зураг илгээсэн` : "Зураг илгээсэн");
  if (lm.attachmentKind === "file") return who + (lm.attachmentCount > 1 ? `${lm.attachmentCount} файл илгээсэн` : "Файл илгээсэн");
  return who;
}
