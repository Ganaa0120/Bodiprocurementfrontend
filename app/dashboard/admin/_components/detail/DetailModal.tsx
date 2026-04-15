"use client";
import { X, FileText, Loader2, MapPin, Briefcase, User } from "lucide-react";
import { Badge } from "../Badge";
import { ACTIONS, fmtDate, type DetailProps } from "./types";
import { DocThumbnail } from "./DocViewer";
import { Row, Section } from "./Helpers";
import { ClickableAvatar } from "./ClickableAvatar";

export function DetailModal({
  person, onClose, onUpdateStatus, loading, returnReason, setReturnReason,
}: DetailProps) {
  const nm = [person.last_name, person.first_name].filter(Boolean).join(" ") || person.email;

  const docs = [
    { url: person.id_card_front_url,  label:"ИҮ урд тал"  },
    { url: person.id_card_back_url,   label:"ИҮ ар тал"   },
    { url: person.activity_intro_url, label:"Танилцуулга"  },
  ].filter(d => d.url) as { url: string; label: string }[];

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-start",
        justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)",
        padding:"24px 16px",overflowY:"auto" }} onClick={onClose}>
        <div style={{ width:"100%",maxWidth:640,background:"#0d1526",
          border:"1px solid rgba(255,255,255,0.07)",borderRadius:24,
          boxShadow:"0 40px 100px rgba(0,0,0,0.7)",animation:"modalIn .25s ease",marginTop:8 }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding:"24px 28px",borderBottom:"1px solid rgba(255,255,255,0.05)",
            display:"flex",alignItems:"center",gap:16 }}>
            <ClickableAvatar url={person.profile_photo_url} name={person.first_name ?? person.email}/>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:17,fontWeight:700,color:"rgba(255,255,255,0.92)",margin:"0 0 2px" }}>{nm}</p>
              <p style={{ fontSize:12,fontFamily:"monospace",color:"rgba(148,163,184,0.5)",margin:"0 0 8px" }}>
                {person.supplier_number || person.register_number || person.email}
              </p>
              <Badge status={person.status}/>
            </div>
            <button onClick={onClose}
              style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:8,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
              <X size={16}/>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:22 }}>

            <Section icon={User} title="Үндсэн мэдээлэл">
              <Row label="Бүтэн нэр"    value={nm}/>
              <Row label="Регистр"      value={person.register_number}/>
              <Row label="И-мэйл"       value={person.email}/>
              <Row label="Утас"         value={person.phone}/>
              <Row label="Хүйс"        value={person.gender==="male"?"Эрэгтэй":person.gender==="female"?"Эмэгтэй":null}/>
              <Row label="Төрсөн огноо" value={fmtDate(person.birth_date)}/>
              <Row label="Бүртгэгдсэн"  value={fmtDate(person.created_at)}/>
            </Section>

            {(person.aimag_niislel || person.sum_duureg) && (
              <Section icon={MapPin} title="Хаяг">
                <Row label="Аймаг/Нийслэл" value={person.aimag_niislel}/>
                <Row label="Сум/Дүүрэг"    value={person.sum_duureg}/>
                <Row label="Баг/Хороо"     value={person.bag_horoo}/>
                <Row label="Тоот"           value={person.toot}/>
              </Section>
            )}

            {person.supply_direction && (
              <Section icon={Briefcase} title="Үйл ажиллагаа">
                <Row label="Нийлүүлэх"   value={person.supply_direction==="goods"?"Бараа":person.supply_direction==="service"?"Үйлчилгээ":"Хоёулаа"}/>
                <Row label="Эхэлсэн огноо" value={fmtDate(person.activity_start_date)}/>
                <Row label="НӨАТ"         value={person.is_vat_payer?"Тийм":"Үгүй"}/>
                <Row label="Тайлбар"      value={person.activity_description}/>
                {person.activity_directions?.length > 0 && (
                  <div style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)",width:130,flexShrink:0,paddingTop:1 }}>Чиглэл</span>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                      {person.activity_directions.map((d: string) => (
                        <span key={d} style={{ fontSize:10,padding:"2px 8px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)" }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {docs.length > 0 && (
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12 }}>
                  <FileText size={12} style={{ color:"rgba(96,165,250,0.6)" }}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.4)" }}>Баримт бичиг</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
                  {docs.map(d => <DocThumbnail key={d.label} url={d.url} label={d.label}/>)}
                </div>
              </div>
            )}

            {person.return_reason && (
              <div style={{ padding:"12px 16px",borderRadius:12,background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.15)" }}>
                <p style={{ fontSize:10,fontWeight:700,color:"rgba(251,191,36,0.7)",margin:"0 0 5px",letterSpacing:"0.1em",textTransform:"uppercase" as const }}>Буцаасан шалтгаан</p>
                <p style={{ fontSize:12,color:"rgba(255,255,255,0.6)",margin:0 }}>{person.return_reason}</p>
              </div>
            )}

            {person.status !== "returned" && (
              <div>
                <label style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.4)",display:"block",marginBottom:8 }}>
                  Буцаах шалтгаан
                </label>
                <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                  rows={2} placeholder="Шалтгаан бичнэ үү..."
                  style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"rgba(255,255,255,0.75)",outline:"none",resize:"vertical" as const,fontFamily:"inherit",boxSizing:"border-box" as const }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor="rgba(59,130,246,0.3)"}
                  onBlur={e  => (e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.07)"}
                />
              </div>
            )}

            <div>
              <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.4)",margin:"0 0 10px" }}>Үйлдэл</p>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {ACTIONS.filter(a => a.status !== person.status).map(a => (
                  <button key={a.status} onClick={() => onUpdateStatus(person.id, a.status)} disabled={loading}
                    style={{ padding:"9px 18px",borderRadius:11,background:a.bg,border:`1px solid ${a.border}`,color:a.color,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,opacity:loading?0.5:1,transition:"all .15s" }}>
                    {loading && <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/>}
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}