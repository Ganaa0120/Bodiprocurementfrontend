"use client";
import React, { useRef, useState, useEffect } from "react";
import { Image as ImgIcon, Paperclip } from "lucide-react";
import type { AttachedFile } from "./types";

const divider = <span style={{ width:1,height:18,background:"rgba(255,255,255,0.08)",margin:"0 2px" }}/>;

export function RichEditor({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const edRef  = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const fRef   = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [files,   setFiles]   = useState<AttachedFile[]>([]);
  const [, tick]              = useState(0);

  useEffect(() => { if (edRef.current) edRef.current.innerHTML = value || ""; }, []);

  const ex   = (cmd: string, v?: string) => { document.execCommand(cmd, false, v); edRef.current?.focus(); sync(); };
  const sync = () => { if (edRef.current) onChange(edRef.current.innerHTML); };
  const on   = (cmd: string) => { try { return document.queryCommandState(cmd); } catch { return false; } };
  const bs   = (a: boolean): React.CSSProperties => ({
    background: a ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
    border: a ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
    borderRadius:6, padding:"4px 8px", cursor:"pointer",
    color: a ? "#60a5fa" : "rgba(148,163,184,0.7)",
    fontSize:12, fontFamily:"inherit", display:"flex", alignItems:"center",
  });

  const pasteImg = (blob: Blob) => {
    const r = new FileReader();
    r.onload = () => {
      document.execCommand("insertHTML", false,
        `<img src="${r.result}" style="max-width:100%;border-radius:8px;margin:6px 0;display:block;"/>`);
      sync();
    };
    r.readAsDataURL(blob);
  };
  const addImg  = (e: React.ChangeEvent<HTMLInputElement>) => { Array.from(e.target.files||[]).forEach(f => pasteImg(f)); e.target.value = ""; };
  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files||[]).forEach(f =>
      setFiles(p => [...p, { name:f.name, size:f.size, type:f.type, url:URL.createObjectURL(f), isImage:f.type.startsWith("image/") }])
    );
    e.target.value = "";
  };

  const fmt      = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
  const fileIcon = (t: string) => t.includes("pdf") ? "📄" : t.includes("word") ? "📝" : t.includes("sheet") || t.includes("excel") ? "📊" : "📎";

  return (
    <div style={{ border:focused?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)",
      borderRadius:10,overflow:"hidden",transition:"border-color .2s" }}>
      {/* Toolbar */}
      <div style={{ display:"flex",alignItems:"center",gap:3,padding:"6px 10px",flexWrap:"wrap",
        background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}
        onMouseDown={e => e.preventDefault()}>
        {([["bold","B",{fontWeight:700}],["italic","I",{fontStyle:"italic"}],
           ["underline","U",{textDecoration:"underline"}],["strikeThrough","S",{textDecoration:"line-through"}]] as [string,string,React.CSSProperties][])
          .map(([cmd,ic,st]) => (
            <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); ex(cmd); tick(n => n+1); }}
              style={{ ...bs(on(cmd)), minWidth:27 }}><span style={st}>{ic}</span></button>
          ))}
        {divider}
        {["H1","H2","H3"].map((h,i) => (
          <button key={h} type="button" onMouseDown={e => { e.preventDefault(); ex("formatBlock", `<h${i+1}>`); tick(n => n+1); }}
            style={{ ...bs(false), minWidth:27, fontSize:10, fontWeight:700 }}>{h}</button>
        ))}
        {divider}
        <button type="button" onMouseDown={e => { e.preventDefault(); ex("insertUnorderedList"); tick(n => n+1); }} style={{ ...bs(on("insertUnorderedList")), minWidth:27 }}>•≡</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); ex("insertOrderedList"); tick(n => n+1); }}  style={{ ...bs(on("insertOrderedList")), minWidth:27 }}>1≡</button>
        {divider}
        {([["◀","justifyLeft"],["▬","justifyCenter"],["▶","justifyRight"]] as [string,string][]).map(([ic,cmd]) => (
          <button key={cmd} type="button" onMouseDown={e => { e.preventDefault(); ex(cmd); tick(n => n+1); }}
            style={{ ...bs(on(cmd)), minWidth:26, fontSize:11 }}>{ic}</button>
        ))}
        {divider}
        <button type="button" onMouseDown={e => { e.preventDefault(); const url = prompt("URL:","https://"); if (url) ex("createLink", url); tick(n => n+1); }}
          style={{ ...bs(false), padding:"4px 9px", gap:4 }}>🔗 <span style={{ fontSize:11 }}>Холбоос</span></button>
        {divider}
        <button type="button" onMouseDown={e => { e.preventDefault(); imgRef.current?.click(); }}
          style={{ ...bs(false), padding:"4px 9px", gap:4, color:"rgba(52,211,153,0.85)" }}>
          <ImgIcon size={12}/><span style={{ fontSize:11 }}>Зураг</span></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); fRef.current?.click(); }}
          style={{ ...bs(false), padding:"4px 9px", gap:4, color:"rgba(96,165,250,0.85)" }}>
          <Paperclip size={12}/><span style={{ fontSize:11 }}>Файл</span></button>
        <button type="button" onMouseDown={e => { e.preventDefault(); ex("removeFormat"); tick(n => n+1); }}
          style={{ ...bs(false), padding:"4px 9px", marginLeft:"auto", color:"rgba(239,68,68,0.6)", fontSize:11 }}>
          ✕ Арилгах</button>
      </div>

      <input ref={imgRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={addImg}/>
      <input ref={fRef}   type="file" accept="*/*"    multiple style={{ display:"none" }} onChange={addFile}/>

      <div ref={edRef} contentEditable suppressContentEditableWarning className="rich-ed"
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); sync(); }}
        onInput={sync}
        onPaste={e => {
          const item = Array.from(e.clipboardData?.items||[]).find(i => i.type.startsWith("image/"));
          if (item) { e.preventDefault(); const b = item.getAsFile(); if (b) pasteImg(b); }
        }}
        onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); ex("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); } }}
        data-placeholder={placeholder}
        style={{ minHeight:160,padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,0.85)",
          lineHeight:1.75,outline:"none",background:"rgba(255,255,255,0.03)",fontFamily:"inherit" }}/>

      {files.length > 0 && (
        <div style={{ padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.06)",
          background:"rgba(255,255,255,0.015)",display:"flex",flexDirection:"column",gap:6 }}>
          <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
            textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)" }}>
            Хавсаргасан файл ({files.length})
          </span>
          {files.map((f, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"7px 10px",
              borderRadius:9,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
              {f.isImage
                ? <img src={f.url} style={{ width:36,height:36,borderRadius:6,objectFit:"cover",flexShrink:0 }}/>
                : <div style={{ width:36,height:36,borderRadius:6,flexShrink:0,background:"rgba(59,130,246,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{fileIcon(f.type)}</div>
              }
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.8)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{f.name}</div>
                <div style={{ fontSize:10,color:"rgba(148,163,184,0.4)" }}>{fmt(f.size)}</div>
              </div>
              <button type="button" onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
                style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.18)",
                  borderRadius:6,padding:"4px 7px",cursor:"pointer",color:"rgba(239,68,68,0.7)",fontSize:12 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={() => fRef.current?.click()}
            style={{ border:"1px dashed rgba(255,255,255,0.1)",borderRadius:8,padding:"7px",
              background:"none",cursor:"pointer",color:"rgba(148,163,184,0.4)",fontSize:12,fontFamily:"inherit" }}>
            + Файл нэмэх
          </button>
        </div>
      )}

      <style>{`
        .rich-ed:empty:before{content:attr(data-placeholder);color:rgba(148,163,184,0.3);pointer-events:none}
        .rich-ed h1{font-size:20px;font-weight:700;margin:10px 0 4px;color:rgba(255,255,255,0.92);line-height:1.3}
        .rich-ed h2{font-size:16px;font-weight:700;margin:8px 0 4px;color:rgba(255,255,255,0.87);line-height:1.3}
        .rich-ed h3{font-size:14px;font-weight:600;margin:6px 0 3px;color:rgba(255,255,255,0.82)}
        .rich-ed ul{padding-left:22px;margin:6px 0;list-style:disc}
        .rich-ed ol{padding-left:22px;margin:6px 0;list-style:decimal}
        .rich-ed li{margin:3px 0;color:rgba(255,255,255,0.82)}
        .rich-ed a{color:#60a5fa;text-decoration:underline}
        .rich-ed strong,.rich-ed b{font-weight:700}
        .rich-ed em,.rich-ed i{font-style:italic}
        .rich-ed p{margin:4px 0}
        .rich-ed img{max-width:100%;border-radius:8px;margin:6px 0;display:block}
        .rich-ed blockquote{border-left:3px solid rgba(59,130,246,.5);margin:6px 0;padding:4px 12px;color:rgba(148,163,184,.7)}
      `}</style>
    </div>
  );
}