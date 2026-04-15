"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Eye, Download } from "lucide-react";

function DocViewerModal({ url, label, onClose }: {
  url: string; label: string; onClose: () => void;
}) {
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  const content = (
    <div style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.95)",
      display:"flex",flexDirection:"column" }} onClick={onClose}>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <FileText size={16} style={{ color: isPdf?"#f87171":"#60a5fa" }}/>
          <span style={{ fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.9)" }}>{label}</span>
          {isPdf && (
            <span style={{ fontSize:10,padding:"2px 8px",borderRadius:99,
              background:"rgba(239,68,68,0.15)",color:"#f87171",fontWeight:700 }}>PDF</span>
          )}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
              borderRadius:9,background:"rgba(59,130,246,0.15)",
              border:"1px solid rgba(59,130,246,0.3)",color:"#60a5fa",
              fontSize:12,fontWeight:600,textDecoration:"none" }}>
            <Download size={13}/> Татах
          </a>
          <button onClick={onClose}
            style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:9,padding:"7px 10px",cursor:"pointer",
              color:"rgba(255,255,255,0.6)",display:"flex" }}>
            <X size={16}/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        padding:16,overflow:"hidden" }} onClick={e => e.stopPropagation()}>
        {isImg ? (
          <img src={url} alt={label}
            style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:12,
              boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}/>
        ) : isPdf ? (
          <object data={url} type="application/pdf"
            style={{ width:"100%",height:"100%",borderRadius:12,border:"none" }}>
            <div style={{ textAlign:"center",color:"rgba(255,255,255,0.5)",padding:40 }}>
              <FileText size={52} style={{ margin:"0 auto 16px",opacity:0.25,display:"block" }}/>
              <p style={{ fontSize:15,marginBottom:6,color:"rgba(255,255,255,0.7)" }}>
                PDF browser-т нээгдэхгүй байна
              </p>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:24 }}>
                Файлыг татаж үзнэ үү
              </p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",
                  borderRadius:12,background:"rgba(59,130,246,0.2)",
                  border:"1px solid rgba(59,130,246,0.35)",color:"#60a5fa",
                  textDecoration:"none",fontSize:14,fontWeight:600 }}>
                <Download size={16}/> Файл татах
              </a>
            </div>
          </object>
        ) : (
          <div style={{ textAlign:"center",color:"rgba(255,255,255,0.5)",padding:40 }}>
            <FileText size={52} style={{ margin:"0 auto 16px",opacity:0.25,display:"block" }}/>
            <p style={{ fontSize:14,marginBottom:20,color:"rgba(255,255,255,0.6)" }}>
              Энэ файлын төрлийг харуулах боломжгүй
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",
                borderRadius:12,background:"rgba(59,130,246,0.2)",
                border:"1px solid rgba(59,130,246,0.35)",color:"#60a5fa",
                textDecoration:"none",fontSize:14,fontWeight:600 }}>
              <Download size={16}/> Татах
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

export function DocThumbnail({ url, label }: { url: string; label: string }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  return (
    <>
      {viewing && <DocViewerModal url={url} label={label} onClose={() => setViewing(false)}/>}
      <div
        onClick={e => { e.stopPropagation(); e.preventDefault(); setViewing(true); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderRadius:12,overflow:"hidden",cursor:"pointer",
          border:`1.5px solid ${hovered?"rgba(59,130,246,0.5)":"rgba(255,255,255,0.08)"}`,
          background: isImg ? "transparent" : "rgba(255,255,255,0.03)",
          display:"flex",flexDirection:"column" as const,
          alignItems:"center",justifyContent:"center",
          position:"relative",transition:"all .15s",aspectRatio:"4/3",
          transform:hovered?"translateY(-2px)":"translateY(0)" }}>

        {isPdf ? (
          <div style={{ textAlign:"center",padding:12 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="rgba(248,113,113,0.75)" strokeWidth={1.4}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div style={{ fontSize:10,color:"#f87171",marginTop:6,fontWeight:700,
              letterSpacing:"0.08em" }}>PDF</div>
          </div>
        ) : (
          <img src={url} alt={label}
            style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        )}

        {/* Hover overlay */}
        <div style={{ position:"absolute",inset:0,
          background:hovered?"rgba(59,130,246,0.22)":"rgba(0,0,0,0)",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"background .15s" }}>
          {hovered && <Eye size={20} style={{ color:"white",
            filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}/>}
        </div>

        {/* Label */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px",
          background:"linear-gradient(transparent,rgba(0,0,0,0.7))",
          fontSize:9,color:"rgba(255,255,255,0.85)",fontWeight:600,
          letterSpacing:"0.02em" }}>
          {label}
        </div>
      </div>
    </>
  );
}

export { DocViewerModal };