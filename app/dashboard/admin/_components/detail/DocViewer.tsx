"use client";
import { useState } from "react";
import { X, FileText, Eye } from "lucide-react";

export function DocViewerModal({ url, label, onClose }: {
  url: string; label: string; onClose: () => void;
}) {
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.includes("application/pdf");
  const pdfSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:350,background:"rgba(0,0,0,0.93)",
      backdropFilter:"blur(16px)",display:"flex",flexDirection:"column" }}
      onClick={onClose}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <FileText size={15} style={{ color:"rgba(148,163,184,0.5)" }}/>
          <span style={{ fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.85)" }}>{label}</span>
          {isPdf && (
            <span style={{ fontSize:10,padding:"2px 8px",borderRadius:99,
              background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",
              color:"#f87171",fontWeight:700 }}>PDF</span>
          )}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 13px",
              borderRadius:9,background:"rgba(59,130,246,0.08)",
              border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",
              fontSize:12,fontWeight:500,textDecoration:"none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Татах
          </a>
          <button onClick={onClose}
            style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:9,padding:"7px 10px",cursor:"pointer",color:"rgba(148,163,184,0.6)",display:"flex" }}>
            <X size={15}/>
          </button>
        </div>
      </div>
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        padding:20,overflow:"hidden" }} onClick={e => e.stopPropagation()}>
        {isPdf
          ? <iframe src={pdfSrc} title={label} style={{ width:"100%",height:"100%",border:"none",borderRadius:12 }}/>
          : <img src={url} alt={label} style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)" }}/>
        }
      </div>
    </div>
  );
}

export function DocThumbnail({ url, label }: { url: string; label: string }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.includes("application/pdf");

  return (
    <>
      {viewing && <DocViewerModal url={url} label={label} onClose={() => setViewing(false)}/>}
      <div
        onClick={e => { e.stopPropagation(); e.preventDefault(); setViewing(true); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderRadius:10,overflow:"hidden",cursor:"pointer",aspectRatio:"4/3",
          border:`1px solid ${hovered?"rgba(59,130,246,0.5)":"rgba(255,255,255,0.08)"}`,
          background:"rgba(255,255,255,0.03)",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",position:"relative",transition:"border-color .15s" }}>
        {isPdf ? (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span style={{ fontSize:10,color:"#f87171",marginTop:5,fontWeight:600 }}>PDF</span>
          </>
        ) : (
          <img src={url} alt={label} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        )}
        <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",
          alignItems:"center",justifyContent:"center",opacity:hovered?1:0,transition:"opacity .15s" }}>
          <Eye size={22} style={{ color:"white" }}/>
        </div>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"5px 8px",
          background:"rgba(0,0,0,0.65)",fontSize:9,color:"rgba(255,255,255,0.8)",fontWeight:600 }}>
          {label}
        </div>
      </div>
    </>
  );
}