"use client";
import { Pencil, X, Check, Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function HeroCard({ profile, previews, editing, onFile, startEdit, pct, isNewUser }: any) {
  const initials   = (profile?.company_name || "?")[0].toUpperCase();
  const s          = profile?.status;
  const isActive   = s === "active" || s === "approved";
  const isReturned = s === "returned";

  const badge = isActive
    ? { label:"Баталгаажсан",   bg:"#ecfdf5", color:"#059669", border:"#a7f3d0", dot:"#10b981" }
    : isReturned
    ? { label:"Буцаагдсан",     bg:"#fef2f2", color:"#dc2626", border:"#fecaca", dot:"#ef4444" }
    : { label:"Хянагдаж байна", bg:"#fffbeb", color:"#d97706", border:"#fde68a", dot:"#f59e0b" };

  return (
    <div style={{ background:"white", border:"1px solid #f1f5f9", borderRadius:20,
      padding:24, display:"flex", alignItems:"flex-start", gap:20,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

      {/* Logo */}
      <label style={{ cursor:editing?"pointer":"default", flexShrink:0, position:"relative" }}>
        <div style={{ width:64, height:64, borderRadius:16, overflow:"hidden",
          border:"2px solid #f1f5f9", background:"#f8fafc",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {previews.company_logo
            ? <img src={previews.company_logo} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
            : <span style={{ fontSize:22, fontWeight:700, color:"#6366f1" }}>{initials}</span>}
        </div>
        {editing && (
          <>
            <div style={{ position:"absolute", inset:0, borderRadius:16, background:"rgba(0,0,0,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Upload size={14} color="white"/>
            </div>
            <input type="file" accept="image/*" style={{ display:"none" }}
              onChange={e => e.target.files?.[0] && onFile("company_logo", e.target.files[0])}/>
          </>
        )}
      </label>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" as const }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:"#0f172a", margin:0 }}>
            {profile?.company_name || "Байгааллага"}
          </h2>
          <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99,
            background:badge.bg, color:badge.color, border:`1px solid ${badge.border}`,
            display:"inline-flex", alignItems:"center", gap:5 }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:badge.dot, flexShrink:0 }}/>
            {badge.label}
          </span>
        </div>
        {profile?.company_name_en && (
          <p style={{ fontSize:12, color:"#64748b", margin:"0 0 6px" }}>{profile.company_name_en}</p>
        )}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" as const }}>
          {[
            profile?.supplier_number,
            `Рег: ${profile?.register_number || "—"}`,
            profile?.company_type,
          ].filter(Boolean).map(t => (
            <span key={t} style={{ fontSize:11, padding:"3px 10px", borderRadius:8,
              background:"#f8fafc", border:"1px solid #f1f5f9", color:"#64748b", fontFamily:"monospace" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Progress + button */}
      <div style={{ flexShrink:0, display:"flex", flexDirection:"column" as const, alignItems:"flex-end", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" as const }}>
            <p style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:0 }}>{pct}%</p>
            <p style={{ fontSize:10, color:"#94a3b8", margin:0 }}>бөглөлт</p>
          </div>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
            <circle cx="22" cy="22" r="18" fill="none"
              stroke={pct>=80?"#10b981":pct>=50?"#f59e0b":"#6366f1"}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(pct/100)*113.1} 113.1`}
              transform="rotate(-90 22 22)"
              style={{ transition:"stroke-dasharray .6s ease" }}/>
          </svg>
        </div>

        {/* ✅ Шинэ хэрэглэгч биш + edit mode биш үед л Засварлах товч харуулна */}
        {!editing && !isNewUser && (
          <button onClick={startEdit}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
              borderRadius:10, border:"1px solid #e2e8f0", background:"white",
              color:"#0f172a", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#6366f1"; (e.currentTarget as HTMLElement).style.color="#6366f1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#e2e8f0"; (e.currentTarget as HTMLElement).style.color="#0f172a"; }}>
            <Pencil size={13}/> Засварлах
          </button>
        )}

        {/* Edit mode-д байгааг заах */}
        {editing && !isNewUser && (
          <div style={{ fontSize:11, color:"#f59e0b", fontWeight:600,
            padding:"5px 10px", borderRadius:8, background:"#fffbeb",
            border:"1px solid #fde68a", display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#f59e0b" }}/>
            Засварлаж байна
          </div>
        )}
      </div>
    </div>
  );
}

export function Alert({ type, msg }: { type:"error"|"success"; msg:string }) {
  const isErr = type === "error";
  const Icon  = isErr ? AlertCircle : CheckCircle;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 16px", borderRadius:12,
      background: isErr?"#fef2f2":"#ecfdf5",
      border:`1px solid ${isErr?"#fecaca":"#a7f3d0"}` }}>
      <Icon size={14} style={{ color:isErr?"#dc2626":"#059669", flexShrink:0 }}/>
      <span style={{ fontSize:13, color:isErr?"#dc2626":"#059669", fontWeight:isErr?400:500 }}>{msg}</span>
    </div>
  );
}