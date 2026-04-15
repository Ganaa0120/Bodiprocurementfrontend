import { STATUS_CFG } from "./constants";
import type { Dir } from "./types";

export const getStatus = (s: string) => STATUS_CFG[s] ?? STATUS_CFG.pending;

export const fmtDate = (v?: string | null) => {
  if (!v) return null;
  try {
    return new Date(v).toLocaleDateString("mn-MN", {
      year:"numeric", month:"2-digit", day:"2-digit",
    });
  } catch { return v; }
};

export const supply = (v?: string) =>
  v==="goods"?"Бараа":v==="service"?"Үйлчилгээ":v==="both"?"Хоёулаа":v??null;

export const gender = (v?: string) =>
  v==="male"?"Эрэгтэй":v==="female"?"Эмэгтэй":v??null;

// ✅ ID-г label болгох
export const getDirLabels = (ids: any[], dirs: Dir[]): string[] => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return ids
    .map(id => dirs.find(d => d.id === Number(id))?.label)
    .filter(Boolean) as string[];
};