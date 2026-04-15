import { STATUS_CFG } from "./constants";

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
  v==="goods"?"Бараа":v==="service"?"Үйлчилгээ":v==="both"?"Хоёулаа":v;

export const gender = (v?: string) =>
  v==="male"?"Эрэгтэй":v==="female"?"Эмэгтэй":v;