"use client";
import { X, Download, FileText, ImageIcon } from "lucide-react";
import { TYPE, STATUS } from "./constants";
import type { Ann, AnnType, AttachedFile } from "./types";

function SBadge({ s }: { s: string }) {
  const c = STATUS[s] ?? STATUS.draft;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
    borderRadius:99,fontSize:11,fontWeight:600,background:c.bg,color:c.color }}>
    <span style={{ width:5,height:5,borderRadius:"50%",background:c.color }}/>{c.label}</span>;
}
function TBadge({ t }: { t: AnnType }) {
  const c = TYPE[t]; const I = c.icon;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
    borderRadius:99,fontSize:11,fontWeight:600,background:c.bg,color:c.color }}>
    <I size={10}/>{c.label}</span>;
}
function InfoItem({ label, value, warn }: { label:string; value:string; warn?:boolean }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:9,padding:"10px 13px",border:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13,fontWeight:500,color:warn?"#f87171":"rgba(255,255,255,0.82)" }}>{value}</div>
    </div>
  );
}

const fmtSize = (b: number) =>
  b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

const fileIcon = (t: string) =>
  t.includes("pdf") ? "📄" :
  t.includes("word") ? "📝" :
  t.includes("sheet") || t.includes("excel") ? "📊" : "📎";

export function AnnViewModal({ ann, onClose }: { ann: Ann; onClose: () => void }) {
  const tc = TYPE[ann.ann_type]; const TIcon = tc.icon;
  const attachments: AttachedFile[] = ann.attachments ?? [];
  const images   = attachments.filter(a => a.isImage);
  const docFiles = attachments.filter(a => !a.isImage);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",
      justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",
      padding:"20px 16px",overflowY:"auto" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:680,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginBottom:24 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ padding:"22px 26px",borderBottom:"1px solid rgba(255,255,255,0.06)",
          display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:tc.bg,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            <TIcon size={20} style={{ color:tc.color }}/>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.92)",marginBottom:5 }}>{ann.title}</div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <TBadge t={ann.ann_type}/><SBadge s={ann.status}/>
              {ann.is_urgent && <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(239,68,68,0.12)",color:"#ef4444" }}>⚡ Яаралтай</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:8,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex",flexShrink:0 }}><X size={16}/></button>
        </div>

        <div style={{ padding:"22px 26px",display:"flex",flexDirection:"column",gap:18 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {ann.category_name && <InfoItem label="Категори" value={`📁 ${ann.category_name}`}/>}
            {ann.deadline && <InfoItem label="Дуусах хугацаа" value={new Date(ann.deadline).toLocaleDateString("mn-MN")} warn={new Date(ann.deadline) < new Date()}/>}
            {(ann.budget_from || ann.budget_to) && <InfoItem label="Төсөв" value={[ann.budget_from && ann.budget_from.toLocaleString(), ann.budget_to && ann.budget_to.toLocaleString()].filter(Boolean).join(" — ") + ` ${ann.currency ?? "MNT"}`}/>}
            {ann.view_count !== undefined && <InfoItem label="Үзсэн" value={`${ann.view_count} удаа`}/>}
          </div>

          {ann.description && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:8 }}>Тайлбар</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.7,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.05)" }}
                dangerouslySetInnerHTML={{ __html: ann.description }}/>
            </div>
          )}

          {ann.requirements && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:8 }}>Шаардлага</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.7,background:"rgba(255,255,255,0.02)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.05)",whiteSpace:"pre-wrap" as const }}>{ann.requirements}</div>
            </div>
          )}

          {(ann.activity_directions ?? []).length > 0 && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:8 }}>Үйл ажиллагааны чиглэл</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {(ann.activity_directions ?? []).map((d, i) => (
                  <span key={i} style={{ fontSize:11,padding:"3px 10px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)" }}>
                    {typeof d === "string" ? d : `Чиглэл #${(d as any).main_id || i}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ⭐ Зургийн галерей */}
          {images.length > 0 && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>
                <ImageIcon size={11}/> Зураг ({images.length})
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:8 }}>
                {images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noreferrer"
                    style={{ position:"relative" as const,paddingBottom:"100%",borderRadius:10,
                      overflow:"hidden",background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",
                      transition:"transform .15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}>
                    <img src={img.url} alt={img.name}
                      style={{ position:"absolute",inset:0,width:"100%",height:"100%",
                        objectFit:"cover" as const }}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ⭐ Бусад файлууд */}
          {docFiles.length > 0 && (
            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>
                <FileText size={11}/> Хавсралт ({docFiles.length})
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {docFiles.map((f, i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer" download
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                      background:"rgba(255,255,255,0.03)",
                      border:"1px solid rgba(255,255,255,0.06)",
                      borderRadius:10,textDecoration:"none",
                      transition:"all .15s" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.06)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.2)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                    }}>
                    <div style={{ width:36,height:36,borderRadius:8,flexShrink:0,
                      background:"rgba(59,130,246,0.1)",display:"flex",
                      alignItems:"center",justifyContent:"center",fontSize:18 }}>
                      {fileIcon(f.type)}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.85)",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize:10,color:"rgba(148,163,184,0.45)" }}>
                        {fmtSize(f.size)}
                      </div>
                    </div>
                    <Download size={14} style={{ color:"rgba(148,163,184,0.5)",flexShrink:0 }}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            {ann.created_by_name && (
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <div style={{ width:22,height:22,borderRadius:6,background:"rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fbbf24" }}>{ann.created_by_name[0]}</div>
                <span style={{ fontSize:12,color:"rgba(148,163,184,0.7)",fontWeight:500 }}>{ann.created_by_name}</span>
              </div>
            )}
            <span style={{ fontSize:11,color:"rgba(148,163,184,0.35)" }}>{new Date(ann.created_at).toLocaleDateString("mn-MN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}