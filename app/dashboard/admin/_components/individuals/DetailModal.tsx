"use client";
import { useState } from "react";
import { X, FileText, Loader2, Trash2, User, MapPin, Briefcase, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";
import { API, STATUS_ACTIONS } from "./constants";
import { fmtDate, supply, gender, getDirLabels } from "./utils";
import { getStatus } from "./utils";
import { DocThumbnail } from "./DocViewer";
import { ClickableAvatar } from "./AvatarComponents";
import { EditModal } from "./EditModal";
import type { Dir } from "./types";

const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

function Badge({ status }: { status: string }) {
  const c = getStatus(status);
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",
      borderRadius:99,background:c.bg,fontSize:11,fontWeight:600,color:c.color }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:c.dot }}/>
      {c.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display:"flex",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)",width:160,flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12,color:"rgba(255,255,255,0.78)",fontWeight:500 }}>
        {typeof value === "boolean" ? (value ? "Тийм" : "Үгүй") : value}
      </span>
    </div>
  );
}

function Section({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:8 }}>
        <Icon size={13} style={{ color:"rgba(148,163,184,0.4)" }}/>
        <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase" as const,color:"rgba(148,163,184,0.32)" }}>
          {label}
        </span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.025)",borderRadius:12,padding:"4px 14px" }}>
        {children}
      </div>
    </div>
  );
}

export function DetailModal({ person: init, onClose, onStatusChange, onDeleted, showToast,
  dirs = [], canEditStatus = true, canEdit = true, canDelete = true }: {
  person: any; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDeleted: (id: string) => void;
  showToast: (msg: string, ok?: boolean) => void;
  dirs?: Dir[];
  canEditStatus?: boolean; canEdit?: boolean; canDelete?: boolean;
}) {
  const [person,       setPerson]       = useState(init);
  const [localStatus,  setLocalStatus]  = useState(init.status);
  const [returnReason, setReturnReason] = useState(init.return_reason ?? "");
  const [actLoad,      setActLoad]      = useState(false);
  const [delLoad,      setDelLoad]      = useState(false);
  const [confirmDel,   setConfirmDel]   = useState(false);
  const [editing,      setEditing]      = useState(false);
  const [returnError,  setReturnError]  = useState("");

  const nm = [person.last_name, person.first_name].filter(Boolean).join(" ") || person.email;

  // ✅ ID → label хөрвүүлэх
  const dirLabels = getDirLabels(person.activity_directions ?? [], dirs);

  const docs = [
    { url: person.id_card_front_url,  label:"ИҮ урд тал" },
    { url: person.id_card_back_url,   label:"ИҮ ар тал"  },
    { url: person.activity_intro_url, label:"Танилцуулга" },
  ].filter(d => d.url) as { url: string; label: string }[];

  const doAction = async (newStatus: string) => {
    if (newStatus === "returned" && !returnReason.trim()) {
      setReturnError("Буцаах шалтгаан заавал бичнэ үү"); return;
    }
    setReturnError(""); setActLoad(true);
    try {
      const res = await fetch(`${API}/api/persons/${person.id}/status`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus, return_reason: returnReason || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      setLocalStatus(newStatus);
      setPerson((p: any) => ({ ...p, status: newStatus, return_reason: returnReason || p.return_reason }));
      onStatusChange(person.id, newStatus);
      showToast(`${STATUS_ACTIONS.find(a => a.status===newStatus)?.label ?? newStatus} ✓`);
    } catch (e: any) { showToast(e.message, false); }
    finally { setActLoad(false); }
  };

  const doDelete = async () => {
    setDelLoad(true);
    try {
      const res = await fetch(`${API}/api/persons/${person.id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      onDeleted(person.id); showToast("Амжилттай устгагдлаа"); onClose();
    } catch (e: any) { showToast(e.message, false); }
    finally { setDelLoad(false); }
  };

  if (editing) return (
    <>
      <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)" }}/>
      <EditModal person={person} onClose={() => setEditing(false)}
        onSave={(upd: any) => {
          setPerson((p: any) => ({ ...p, ...upd }));
          setEditing(false); showToast("Мэдээлэл засагдлаа");
        }}/>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ position:"fixed",inset:0,zIndex:200,overflowY:"auto",
        background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }}
        onClick={onClose}>
        <div style={{ minHeight:"100%",display:"flex",alignItems:"center",
          justifyContent:"center",padding:"20px 16px" }}>
          <div style={{ width:"100%",maxWidth:680,background:"#0d1526",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,
            boxShadow:"0 32px 80px rgba(0,0,0,0.7)",animation:"modalIn .22s ease" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding:"22px 26px",borderBottom:"1px solid rgba(255,255,255,0.06)",
              display:"flex",alignItems:"center",gap:16 }}>
              <ClickableAvatar person={person} size={52}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:17,fontWeight:700,color:"rgba(255,255,255,0.92)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {nm}
                </div>
                {person.supplier_number && (
                  <div style={{ fontSize:10,fontFamily:"monospace",
                    color:"rgba(148,163,184,0.35)",marginTop:2 }}>
                    {person.supplier_number}
                  </div>
                )}
                <div style={{ marginTop:7 }}><Badge status={localStatus}/></div>
              </div>
              <div style={{ display:"flex",gap:7,flexShrink:0 }}>
                {canEdit && (
                  <button onClick={() => setEditing(true)}
                    style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 13px",
                      borderRadius:9,background:"rgba(59,130,246,0.08)",
                      border:"1px solid rgba(59,130,246,0.2)",color:"#60a5fa",
                      fontSize:12,fontWeight:600,cursor:"pointer" }}>
                    <Pencil size={13}/> Засах
                  </button>
                )}
                <button onClick={onClose}
                  style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",
                    borderRadius:9,padding:8,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding:"22px 26px",display:"flex",flexDirection:"column",gap:18 }}>

              <Section icon={User} label="Үндсэн мэдээлэл">
                <InfoRow label="Бүтэн нэр"   value={nm}/>
                <InfoRow label="Регистр"      value={person.register_number}/>
                <InfoRow label="И-мэйл"       value={person.email}/>
                <InfoRow label="Утас"          value={person.phone}/>
                <InfoRow label="Хүйс"         value={gender(person.gender)}/>
                <InfoRow label="Төрсөн огноо" value={fmtDate(person.birth_date)}/>
                <InfoRow label="Бүртгэгдсэн"  value={fmtDate(person.created_at)}/>
              </Section>

              {(person.aimag_niislel || person.sum_duureg) && (
                <Section icon={MapPin} label="Хаяг">
                  <InfoRow label="Аймаг/Нийслэл" value={person.aimag_niislel}/>
                  <InfoRow label="Сум/Дүүрэг"    value={person.sum_duureg}/>
                  <InfoRow label="Баг/Хороо"     value={person.bag_horoo}/>
                  <InfoRow label="Тоот"           value={person.toot}/>
                </Section>
              )}

              {(person.supply_direction || person.activity_description ||
                person.activity_start_date || dirLabels.length > 0) && (
                <Section icon={Briefcase} label="Үйл ажиллагаа">
                  <InfoRow label="Нийлүүлэх чиглэл" value={supply(person.supply_direction)}/>
                  <InfoRow label="Эхэлсэн огноо"     value={fmtDate(person.activity_start_date)}/>
                  <InfoRow label="НӨАТ төлөгч"       value={person.is_vat_payer}/>
                  {person.activity_description && (
                    <div style={{ padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)",
                        display:"block",marginBottom:5 }}>Тайлбар</span>
                      <span style={{ fontSize:12,color:"rgba(255,255,255,0.78)",
                        lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word" }}>
                        {person.activity_description}
                      </span>
                    </div>
                  )}
                  {/* ✅ ID биш label харуулна, давхардахгүй */}
                  {dirLabels.length > 0 && (
                    <div style={{ padding:"10px 0" }}>
                      <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginBottom:8 }}>
                        Сонгосон чиглэлүүд
                      </div>
                      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                        {dirLabels.map(label => (
                          <span key={label} style={{ fontSize:12,padding:"5px 12px",borderRadius:999,
                            background:"rgba(59,130,246,0.12)",color:"#60a5fa",
                            border:"1px solid rgba(59,130,246,0.25)",fontWeight:500 }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {docs.length > 0 && (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:12 }}>
                    <FileText size={13} style={{ color:"rgba(148,163,184,0.4)" }}/>
                    <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                      textTransform:"uppercase" as const,color:"rgba(148,163,184,0.32)" }}>
                      Баримт бичиг
                    </span>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
                    {docs.map(d => <DocThumbnail key={d.label} url={d.url} label={d.label}/>)}
                  </div>
                </div>
              )}

              {person.return_reason && (
                <div style={{ padding:"10px 14px",borderRadius:12,
                  background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.18)" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:"rgba(245,158,11,0.7)",marginBottom:4 }}>
                    БУЦААСАН ШАЛТГААН
                  </div>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,0.6)" }}>{person.return_reason}</div>
                </div>
              )}

              {canEditStatus && (
                <div>
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                    textTransform:"uppercase" as const,color:"rgba(148,163,184,0.28)",marginBottom:7 }}>
                    Буцаах шалтгаан
                  </div>
                  {returnError && (
                    <div style={{ fontSize:11,color:"#ef4444",marginBottom:6 }}>{returnError}</div>
                  )}
                  <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                    rows={2} placeholder="Жишээ: Мэдээлэл дутуу байна..."
                    style={{ width:"100%",background:"rgba(255,255,255,0.04)",
                      border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,
                      padding:"9px 12px",fontSize:12,color:"rgba(255,255,255,0.7)",
                      outline:"none",resize:"vertical" as const,fontFamily:"inherit",
                      boxSizing:"border-box" as const }}
                    onFocus={e => (e.target as HTMLElement).style.borderColor="rgba(59,130,246,0.3)"}
                    onBlur={e  => (e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.07)"}/>
                </div>
              )}

              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                  textTransform:"uppercase" as const,color:"rgba(148,163,184,0.28)",marginBottom:10 }}>
                  Үйлдэл
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {canEditStatus && STATUS_ACTIONS.filter(a => a.status !== localStatus).map(a => (
                    <button key={a.status} onClick={() => doAction(a.status)} disabled={actLoad}
                      style={{ padding:"9px 18px",borderRadius:10,background:a.bg,
                        border:`1px solid ${a.border}`,color:a.color,fontSize:13,fontWeight:600,
                        cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,
                        opacity:actLoad?0.5:1,transition:"all .15s" }}>
                      {actLoad
                        ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/>
                        : a.icon ? <a.icon size={13}/> : null}
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {canDelete && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:16 }}>
                  {!confirmDel ? (
                    <button onClick={() => setConfirmDel(true)}
                      style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 15px",
                        borderRadius:10,background:"rgba(239,68,68,0.06)",
                        border:"1px solid rgba(239,68,68,0.16)",color:"rgba(239,68,68,0.7)",
                        fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                      <Trash2 size={13}/> Устгах
                    </button>
                  ) : (
                    <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
                      borderRadius:12,background:"rgba(239,68,68,0.07)",
                      border:"1px solid rgba(239,68,68,0.2)" }}>
                      <span style={{ fontSize:12,color:"rgba(239,68,68,0.85)",flex:1 }}>
                        Устгахдаа итгэлтэй байна уу?
                      </span>
                      <button onClick={() => setConfirmDel(false)}
                        style={{ padding:"5px 13px",borderRadius:8,background:"rgba(255,255,255,0.05)",
                          border:"1px solid rgba(255,255,255,0.08)",color:"rgba(148,163,184,0.6)",
                          fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
                        Болих
                      </button>
                      <button onClick={doDelete} disabled={delLoad}
                        style={{ padding:"5px 14px",borderRadius:8,background:"rgba(239,68,68,0.15)",
                          border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:12,
                          fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                          display:"flex",alignItems:"center",gap:5,opacity:delLoad?0.6:1 }}>
                        {delLoad
                          ? <Loader2 size={12} style={{ animation:"spin 0.8s linear infinite" }}/>
                          : <Trash2 size={12}/>}
                        Устгах
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}