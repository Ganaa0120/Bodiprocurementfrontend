export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getToken = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") || "";

export const CAT_COLORS = ["#3b82f6","#10b981","#a78bfa","#f59e0b","#fb923c","#60a5fa"];

export const inp: React.CSSProperties = {
  width:"100%", height:40, background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:9,
  padding:"0 12px", fontSize:13, color:"rgba(255,255,255,0.85)",
  outline:"none", fontFamily:"inherit",
};
export const lbl: React.CSSProperties = {
  fontSize:10, fontWeight:700, letterSpacing:"0.1em",
  textTransform:"uppercase" as const, color:"rgba(148,163,184,0.45)",
  display:"block" as const, marginBottom:5,
};
export const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  ((e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)");
export const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
  ((e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)");

export function flatCats(
  cats: import("./types").Category[],
  depth = 0,
  excludeId?: string,
): { id: string; label: string }[] {
  return cats.flatMap((c) => {
    if (c.id === excludeId) return [];
    return [
      { id: c.id, label: "　".repeat(depth) + c.category_number + " — " + c.category_name },
      ...flatCats(c.children ?? [], depth + 1, excludeId),
    ];
  });
}