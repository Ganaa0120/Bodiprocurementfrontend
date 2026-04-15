"use client";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

type Props = { admin: any; onClose: () => void; onConfirm: () => void; loading: boolean };

export function DeleteModal({ admin, onClose, onConfirm, loading }: Props) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:380, background:"#0d1526", border:"1px solid rgba(248,113,113,0.2)", borderRadius:22, padding:28, boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(248,113,113,0.05)", animation:"modalIn .22s ease" }} onClick={e=>e.stopPropagation()}>

        <div style={{ width:56, height:56, borderRadius:18, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <AlertTriangle size={24} style={{ color:"#f87171" }}/>
        </div>

        <div style={{ textAlign:"center", marginBottom:24 }}>
          <p style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.9)", margin:"0 0 8px" }}>Устгах уу?</p>
          <p style={{ fontSize:13, color:"rgba(148,163,184,0.7)", margin:"0 0 6px" }}>
            <span style={{ color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{admin.last_name} {admin.first_name}</span>
          </p>
          <p style={{ fontSize:12, color:"rgba(148,163,184,0.5)", margin:0 }}>{admin.email}</p>
          <div style={{ marginTop:12, padding:"8px 14px", borderRadius:8, background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.15)" }}>
            <p style={{ fontSize:11, color:"rgba(248,113,113,0.8)", margin:0 }}>Энэ үйлдлийг буцаах боломжгүй</p>
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, height:42, borderRadius:11, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(148,163,184,0.7)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            Болих
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex:1, height:42, borderRadius:11, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            {loading ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={13}/>}
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}