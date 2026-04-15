"use client";
import { X } from "lucide-react";
import { TYPE, STATUS } from "./constants";
import type { Ann, AnnType } from "./types";

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

export function AnnViewModal({ ann, onClose }: { ann: Ann; onClose: () => void }) {
  const tc = TYPE[ann.ann_type]; const TIcon = tc.icon;
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
                {(ann.activity_directions ?? []).map(d => (
                  <span key={d} style={{ fontSize:11,padding:"3px 10px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)" }}>{d}</span>
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