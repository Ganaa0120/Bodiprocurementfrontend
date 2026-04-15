export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

export const inp: React.CSSProperties = {
  width:"100%", background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:9,
  padding:"9px 12px", fontSize:13, color:"rgba(255,255,255,0.85)",
  outline:"none", fontFamily:"inherit",
};

export const lbl: React.CSSProperties = {
  fontSize:10, fontWeight:700, letterSpacing:"0.1em",
  textTransform:"uppercase" as const, color:"rgba(148,163,184,0.45)",
  display:"block" as const, marginBottom:5,
};