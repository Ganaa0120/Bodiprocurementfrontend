"use client";
import { Upload, FileText } from "lucide-react";

export function Section({ icon:Icon, title, children }: any) {
  return (
    <div style={{ background:"white", borderRadius:16, border:"1px solid #f1f5f9",
      overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding:"14px 20px", borderBottom:"1px solid #f8fafc",
        display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:28,height:28,borderRadius:8,background:"#eef2ff",
          display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Icon size={14} style={{ color:"#6366f1" }}/>
        </div>
        <p style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:0 }}>{title}</p>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

export function DocUpload({ label, fieldKey, preview, onFile, editing, accept="image/*", required=false }: any) {
  const isPdf = accept.includes("pdf");
  return (
    <label style={{ cursor:editing?"pointer":"default", display:"block" }}>
      <p style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
        textTransform:"uppercase" as const, margin:"0 0 8px" }}>
        {label}{required && <span style={{ color:"#ef4444" }}> *</span>}
      </p>
      <div style={{ borderRadius:12, minHeight:80, position:"relative", overflow:"hidden",
        border: preview ? "1.5px solid #a7f3d0" : "1.5px dashed #e2e8f0",
        background: preview ? "#ecfdf5" : "#fafafa",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
        {preview ? (
          isPdf ? (
            <div style={{ textAlign:"center", padding:16 }}>
              <FileText size={24} style={{ color:"#059669", margin:"0 auto 6px" }}/>
              <p style={{ fontSize:11, color:"#059669", margin:0, fontWeight:600 }}>Файл байна</p>
            </div>
          ) : (
            <img src={preview} alt="" style={{ width:"100%", height:80, objectFit:"cover" }}/>
          )
        ) : (
          <div style={{ textAlign:"center", padding:16 }}>
            <Upload size={18} style={{ color:"#cbd5e1", margin:"0 auto 6px" }}/>
            <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>{editing?"Файл оруулах":"Байхгүй"}</p>
          </div>
        )}
        {editing && preview && (
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",
            display:"flex",alignItems:"center",justifyContent:"center",
            opacity:0,transition:"opacity .15s" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="0"}>
            <span style={{ fontSize:11, color:"white", fontWeight:600 }}>Солих</span>
          </div>
        )}
      </div>
      {editing && (
        <input type="file" accept={accept} style={{ display:"none" }}
          onChange={e => e.target.files?.[0] && onFile(fieldKey, e.target.files[0])}/>
      )}
    </label>
  );
}