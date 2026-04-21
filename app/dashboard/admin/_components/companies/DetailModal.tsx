"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, FileText, Loader2, Trash2, Building2, User, CreditCard,
  MapPin, Briefcase, CheckCircle2, AlertCircle, Download, Eye,
  ShieldCheck, ChevronRight,
} from "lucide-react";
import { API, STATUS_ACTIONS } from "./constants";
import { fmtDate, supply, gender, getStatus } from "./utils";
import { ClickableLogo } from "./LogoComponents";

// ── DocViewerModal ────────────────────────────────────────────
function DocViewerModal({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
  const content = (
    <div style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.96)",display:"flex",flexDirection:"column" }} onClick={onClose}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <FileText size={15} style={{ color:"rgba(148,163,184,0.5)" }}/>
          <span style={{ fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.85)" }}>{label}</span>
          {isPdf && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:99,background:"rgba(239,68,68,0.15)",color:"#f87171",fontWeight:700 }}>PDF</span>}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:9,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",color:"#60a5fa",fontSize:12,textDecoration:"none",fontWeight:500 }}>
            <Download size={12}/> Татах
          </a>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"7px 10px",cursor:"pointer",color:"rgba(255,255,255,0.5)",display:"flex" }}><X size={15}/></button>
        </div>
      </div>
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        {isImg ? (
          <img src={url} alt={label} style={{ maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:12 }}/>
        ) : isPdf ? (
          <object data={`${url}#toolbar=1&navpanes=0`} type="application/pdf" style={{ width:"100%",height:"100%",borderRadius:12,border:"none" }}>
            <div style={{ textAlign:"center",color:"rgba(255,255,255,0.5)",padding:32 }}>
              <FileText size={48} style={{ margin:"0 auto 16px",opacity:0.3,display:"block" }}/>
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",color:"#60a5fa",textDecoration:"none",fontSize:13,fontWeight:600 }}>
                <Download size={15}/> Татаж үзэх
              </a>
            </div>
          </object>
        ) : (
          <div style={{ textAlign:"center",color:"rgba(255,255,255,0.5)",padding:32 }}>
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",color:"#60a5fa",textDecoration:"none",fontSize:13,fontWeight:600 }}>
              <Download size={15}/> Татах
            </a>
          </div>
        )}
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

// ── Helpers ───────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const c = getStatus(status);
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:99,background:c.bg,fontSize:12,fontWeight:700,color:c.color,letterSpacing:"0.02em" }}>
      <span style={{ width:6,height:6,borderRadius:"50%",background:c.color }}/>
      {c.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display:"flex",alignItems:"baseline",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize:11,color:"rgba(148,163,184,0.38)",minWidth:130,flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:500,wordBreak:"break-all" }}>
        {typeof value === "boolean" ? (value ? "✓ Тийм" : "✗ Үгүй") : value}
      </span>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width:26,height:26,borderRadius:7,background:"rgba(0,114,188,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <Icon size={13} style={{ color:"#0072BC" }}/>
      </div>
      <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" as const,color:"rgba(255,255,255,0.5)" }}>{label}</span>
    </div>
  );
}

// ── Main DetailModal ──────────────────────────────────────────
export function DetailModal({
  org, onClose, onStatusChange, onDeleted, showToast,
  canEditStatus = true, canDelete = true, dirs = [], permTypes = [],
}: {
  org: any; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDeleted: (id: string) => void;
  showToast: (msg: string, ok?: boolean) => void;
  canEditStatus?: boolean; canDelete?: boolean;
  dirs?: { id: number; label: string; children: { id: number; label: string }[] }[];
  permTypes?: { id: number; label: string }[];
}) {
  const [tab, setTab]               = useState(0);
  const [localStatus, setLocalStatus] = useState(org.status);
  const [returnReason, setReturnReason] = useState(org.return_reason ?? "");
  const [actLoad, setActLoad]       = useState(false);
  const [delLoad, setDelLoad]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [viewDoc, setViewDoc]       = useState<{ url: string; label: string } | null>(null);

  const allDocs = [
    { url: org.doc_state_registry_url,     label:"Улсын бүртгэл"    },
    { url: org.doc_vat_certificate_url,    label:"НӨАТ гэрчилгээ"   },
    { url: org.doc_special_permission_url, label:"Тусгай зөвшөөрөл" },
    { url: org.doc_contract_url,           label:"Гэрээ"             },
    { url: org.doc_company_intro_url,      label:"Танилцуулга"       },
    ...(Array.isArray(org.extra_documents) ? org.extra_documents.map((u: string, i: number) => ({
      url: u,
      label: decodeURIComponent(u.split("/").pop()?.split("?")[0] || `Нэмэлт ${i+1}`),
    })) : []),
  ].filter(d => d.url) as { url: string; label: string }[];

  const doAction = async (newStatus: string) => {
    setActLoad(true);
    try {
      const token = localStorage.getItem("super_admin_token");
      const res = await fetch(`${API}/api/organizations/${org.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, return_reason: returnReason || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      setLocalStatus(newStatus);
      onStatusChange(org.id, newStatus);
      showToast(`${STATUS_ACTIONS.find(a => a.status === newStatus)?.label ?? newStatus} ✓`);
    } catch (e: any) { showToast(e.message, false); }
    finally { setActLoad(false); }
  };

  const doDelete = async () => {
    setDelLoad(true);
    try {
      const token = localStorage.getItem("super_admin_token");
      const res = await fetch(`${API}/api/organizations/${org.id}`, {
        method: "DELETE", headers: { Authorization:`Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      onDeleted(org.id); showToast("Амжилттай устгагдлаа"); onClose();
    } catch (e: any) { showToast(e.message, false); }
    finally { setDelLoad(false); }
  };

  const TABS = [
    { label:"Байгууллага", icon: Building2 },
    { label:"Өмчлөгчид",      icon: User      },
    { label:"Үйл ажиллагаа", icon: Briefcase },
    { label:"Санхүү",      icon: CreditCard },
    { label:"Баримт",      icon: FileText, badge: allDocs.length },
    { label:"Үйлдэл",      icon: CheckCircle2 },
  ];

  const content = (
    <>
      <style>{`
        @keyframes dmIn { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        .dm-tab { display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;cursor:pointer;border:none;background:transparent;font-family:inherit;font-size:12px;font-weight:500;color:rgba(148,163,184,0.45);transition:all .15s;width:100%;text-align:left;white-space:nowrap; }
        .dm-tab:hover { background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.65); }
        .dm-tab.active { background:rgba(0,114,188,0.18);color:#38bdf8;font-weight:700;border-left:2px solid #0072BC; }
        .dm-doc { width:100%;display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);cursor:pointer;transition:all .15s;margin-bottom:6px; }
        .dm-doc:hover { border-color:rgba(0,114,188,0.4);background:rgba(0,114,188,0.06); }
        .dm-perm { padding:10px 12px;border-radius:10px;background:rgba(0,114,188,0.07);border:1px solid rgba(0,114,188,0.15);margin-bottom:6px; }
        .dm-action { display:flex;align-items:center;gap:8px;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;border:1.5px solid;transition:all .15s;flex:1;justify-content:center; }
        .dm-action:hover { transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.3); }
        .dm-action:disabled { opacity:0.5;cursor:not-allowed;transform:none; }
      `}</style>

      {viewDoc && <DocViewerModal url={viewDoc.url} label={viewDoc.label} onClose={() => setViewDoc(null)}/>}

      {/* Backdrop */}
      <div style={{ position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
        onClick={onClose}>

        {/* Modal */}
        <div style={{ width:"100%",maxWidth:920,height:"min(88vh,680px)",background:"#0b1120",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,boxShadow:"0 40px 100px rgba(0,0,0,0.8)",animation:"dmIn .22s ease",display:"flex",flexDirection:"column",overflow:"hidden" }}
          onClick={e => e.stopPropagation()}>

          {/* ── TOP HEADER ── */}
          <div style={{ display:"flex",alignItems:"center",gap:16,padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0,background:"rgba(255,255,255,0.015)" }}>
            <ClickableLogo org={org} size={48}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                <span style={{ fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.92)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{org.company_name}</span>
                {org.company_name_en && <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)" }}>{org.company_name_en}</span>}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginTop:5,flexWrap:"wrap" }}>
                <Badge status={localStatus}/>
                {org.supplier_number && (
                  <span style={{ fontSize:10,fontFamily:"monospace",color:"rgba(148,163,184,0.3)",background:"rgba(255,255,255,0.04)",padding:"2px 8px",borderRadius:6 }}>{org.supplier_number}</span>
                )}
                {org.register_number && (
                  <span style={{ fontSize:10,color:"rgba(148,163,184,0.35)" }}>РД: {org.register_number}</span>
                )}
                {org.company_type && (
                  <span style={{ fontSize:10,color:"rgba(0,114,188,0.7)",background:"rgba(0,114,188,0.1)",padding:"2px 8px",borderRadius:6 }}>{org.company_type}</span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:8,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex",flexShrink:0 }}>
              <X size={16}/>
            </button>
          </div>

          {/* ── BODY: sidebar + content ── */}
          <div style={{ flex:1,display:"flex",overflow:"hidden" }}>

            {/* LEFT SIDEBAR TABS */}
            <div style={{ width:160,flexShrink:0,borderRight:"1px solid rgba(255,255,255,0.05)",padding:"12px 8px",display:"flex",flexDirection:"column",gap:2,background:"rgba(0,0,0,0.15)" }}>
              {TABS.map((t, i) => (
                <button key={i} className={`dm-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
                  <t.icon size={14} style={{ flexShrink:0 }}/>
                  <span style={{ flex:1 }}>{t.label}</span>
                  {t.badge ? (
                    <span style={{ fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,background:"rgba(0,114,188,0.3)",color:"#38bdf8" }}>{t.badge}</span>
                  ) : tab === i ? (
                    <ChevronRight size={11} style={{ opacity:0.5 }}/>
                  ) : null}
                </button>
              ))}
            </div>

            {/* RIGHT CONTENT */}
            <div style={{ flex:1,padding:"20px 24px",overflowY:"auto",display:"flex",flexDirection:"column",gap:16 }}>

              {/* ── TAB 0: Байгууллага ── */}
              {tab === 0 && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,height:"100%" }}>
                  <div>
                    <SectionTitle icon={Building2} label="Үндсэн мэдээлэл"/>
                    <InfoRow label="Регистрийн дугаар" value={org.register_number}/>
                    <InfoRow label="Улсын бүртгэл №"   value={org.state_registry_number}/>
                    <InfoRow label="И-мэйл"            value={org.email}/>
                    <InfoRow label="Утас"              value={org.phone}/>
                    <InfoRow label="Байгуулагдсан"     value={fmtDate(org.established_date)}/>
                    <InfoRow label="Ажилчдын тоо"      value={org.employee_count?.toString()}/>
                    <InfoRow label="Бүртгэгдсэн"       value={fmtDate(org.created_at)}/>
                    <InfoRow label="Шинэчлэгдсэн"      value={fmtDate(org.updated_at)}/>
                  </div>
                  <div>
                    <SectionTitle icon={MapPin} label="Хаяг"/>
                    <InfoRow label="Аймаг/Нийслэл" value={org.aimag_niislel}/>
                    <InfoRow label="Сум/Дүүрэг"    value={org.sum_duureg}/>
                    <InfoRow label="Баг/Хороо"     value={org.bag_horoo}/>
                    <InfoRow label="Дэлгэрэнгүй"   value={org.address}/>
                    <div style={{ marginTop:20 }}>
                      <SectionTitle icon={ShieldCheck} label="Тусгай мэдээлэл"/>
                      <InfoRow label="НӨАТ төлөгч"     value={org.is_vat_payer}/>
                      <InfoRow label="НӨАТ дугаар"     value={org.vat_number}/>
                      <InfoRow label="ISO сертификат"  value={org.is_iso_certified}/>
                      <InfoRow label="Тусгай зөвшөөрөл" value={org.has_special_permission}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 1: Хүмүүс ── */}
              {tab === 1 && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                  <div>
                    <SectionTitle icon={User} label="Гүйцэтгэх захирал"/>
                    {org.executive_directors?.filter((d: any) => d.last_name || d.first_name).length > 0 ? (
                      org.executive_directors.filter((d: any) => d.last_name || d.first_name).map((d: any, i: number) => (
                        <div key={i} style={{ marginBottom:i > 0 ? 12 : 0, paddingTop: i > 0 ? 12 : 0, borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                          <InfoRow label="Овог / Нэр"    value={`${d.last_name||""} ${d.first_name||""}`.trim()}/>
                          <InfoRow label="Албан тушаал"  value={d.position}/>
                          <InfoRow label="Утас"          value={d.phone}/>
                          <InfoRow label="И-мэйл"        value={d.email}/>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize:12,color:"rgba(148,163,184,0.3)",padding:"8px 0" }}>Мэдээлэл байхгүй</div>
                    )}
                  </div>
                  <div>
                    <SectionTitle icon={User} label="Өмчлөгчид"/>
                    {org.beneficial_owners?.filter((o: any) => o.last_name || o.first_name).length > 0 ? (
                      org.beneficial_owners.filter((o: any) => o.last_name || o.first_name).map((o: any, i: number) => (
                        <div key={i} style={{ marginBottom:i > 0 ? 12 : 0, paddingTop: i > 0 ? 12 : 0, borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                          <InfoRow label="Овог / Нэр"   value={`${o.last_name||""} ${o.first_name||""}`.trim()}/>
                          <InfoRow label="Ургийн овог"  value={o.family_name}/>
                          <InfoRow label="Хүйс"         value={gender(o.gender)}/>
                          <InfoRow label="Албан тушаал" value={o.position}/>
                          <InfoRow label="Утас"         value={o.phone}/>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize:12,color:"rgba(148,163,184,0.3)",padding:"8px 0" }}>Мэдээлэл байхгүй</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 2: Үйл ажиллагаа ── */}
              {tab === 2 && (
                <div>
                  <SectionTitle icon={Briefcase} label="Үйл ажиллагааны мэдээлэл"/>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                    <div>
                      <InfoRow label="Нийлүүлэх чиглэл" value={supply(org.supply_direction)}/>
                      {org.activity_description && (
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",marginBottom:5,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Тайлбар</div>
                          <div style={{ fontSize:12,color:"rgba(255,255,255,0.65)",lineHeight:1.7,background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"10px 12px" }}>
                            {org.activity_description}
                          </div>
                        </div>
                      )}
                      {/* Тусгай зөвшөөрлүүд */}
                      {org.special_permissions?.filter((p: any) => p.type_id || p.number).length > 0 && (
                        <div style={{ marginTop:14 }}>
                          <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Тусгай зөвшөөрлүүд</div>
                          {org.special_permissions.filter((p: any) => p.type_id || p.number).map((p: any, i: number) => {
                            const lbl = p.type_label ||
                              permTypes.find((t: any) => Number(t.id) === Number(p.type_id))?.label ||
                              (p.type_id ? `Зөвшөөрөл #${p.type_id}` : "—");
                            return (
                              <div key={i} className="dm-perm">
                                <div style={{ fontSize:11,color:"#38bdf8",fontWeight:600,marginBottom:4 }}>{lbl}</div>
                                <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
                                  {p.number && <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)" }}>№: <span style={{ color:"rgba(255,255,255,0.7)",fontFamily:"monospace" }}>{p.number}</span></span>}
                                  {p.expiry && <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)" }}>Хугацаа: <span style={{ color:"rgba(255,255,255,0.7)" }}>{p.expiry}</span></span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Үйл ажиллагааны чиглэлүүд</div>
                      {org.activity_directions?.length > 0 ? (
                        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                          {org.activity_directions.map((d: any, idx: number) => {
                            if (d && typeof d === "object" && "main_id" in d) {
                              const main = dirs.find((x: any) => Number(x.id) === Number(d.main_id));
                              return (
                                <div key={idx} style={{ background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(255,255,255,0.05)" }}>
                                  <div style={{ fontSize:11,color:"#60a5fa",fontWeight:600,marginBottom:5 }}>{main?.label ?? `ID:${d.main_id}`}</div>
                                  {d.sub_ids?.length > 0 && (
                                    <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                                      {d.sub_ids.map((sid: number) => {
                                        let sl = `${sid}`;
                                        for (const dir of dirs) { const sub = dir.children?.find((c: any) => c.id === sid); if (sub) { sl = sub.label; break; } }
                                        return <span key={sid} style={{ fontSize:10,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,0.1)",color:"#818cf8",border:"1px solid rgba(99,102,241,0.15)" }}>{sl}</span>;
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            const dirId = typeof d === "object" ? d?.id : d;
                            const found = dirs.find((x: any) => Number(x.id) === Number(dirId));
                            return <span key={idx} style={{ fontSize:11,padding:"3px 9px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.2)" }}>{found?.label ?? String(d)}</span>;
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize:12,color:"rgba(148,163,184,0.3)" }}>Сонгоогүй байна</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: Санхүү ── */}
              {tab === 3 && (
                <div style={{ maxWidth:480 }}>
                  <SectionTitle icon={CreditCard} label="Банкны мэдээлэл"/>
                  <InfoRow label="Банкны нэр"    value={org.bank_name}/>
                  <InfoRow label="Дансны дугаар" value={org.bank_account_number}/>
                  <InfoRow label="IBAN"          value={org.iban}/>
                  <InfoRow label="SWIFT код"     value={org.swift_code}/>
                  <InfoRow label="Валют"         value={org.currency}/>
                  <InfoRow label="НӨАТ дугаар"   value={org.vat_number}/>
                </div>
              )}

              {/* ── TAB 4: Баримт ── */}
              {tab === 4 && (
                <div>
                  <SectionTitle icon={FileText} label={`Баримт бичиг (${allDocs.length})`}/>
                  {allDocs.length === 0 ? (
                    <div style={{ fontSize:13,color:"rgba(148,163,184,0.3)",padding:"24px 0",textAlign:"center" as const }}>Баримт байхгүй байна</div>
                  ) : (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                      {allDocs.map((d, i) => {
                        const isPdf = /\.pdf(\?|$)/i.test(d.url) || d.url.toLowerCase().includes(".pdf");
                        const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(d.url);
                        return (
                          <button key={i} className="dm-doc" onClick={() => setViewDoc(d)}>
                            <div style={{ width:36,height:36,borderRadius:9,flexShrink:0,overflow:"hidden",background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              {isImg ? (
                                <img src={d.url} alt={d.label} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.7)" strokeWidth={1.5}>
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                </svg>
                              )}
                            </div>
                            <div style={{ flex:1,minWidth:0,textAlign:"left" as const }}>
                              <div style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.78)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{d.label}</div>
                              <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",marginTop:2 }}>{isPdf ? "PDF" : isImg ? "Зураг" : "Файл"} · дарж харах</div>
                            </div>
                            <Eye size={14} style={{ color:"rgba(0,114,188,0.6)",flexShrink:0 }}/>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 5: Үйлдэл ── */}
              {tab === 5 && (
                <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                  {/* Буцаасан шалтгаан харуулах */}
                  {org.return_reason && (
                    <div style={{ padding:"12px 16px",borderRadius:12,background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"rgba(245,158,11,0.7)",marginBottom:5,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>⚠ Буцаасан шалтгаан</div>
                      <div style={{ fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.6 }}>{org.return_reason}</div>
                    </div>
                  )}

                  {/* Шалтгаан оруулах */}
                  <div>
                    <div style={{ fontSize:11,fontWeight:600,color:"rgba(148,163,184,0.4)",marginBottom:8,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Буцаах шалтгаан (заавал биш)</div>
                    <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} rows={3}
                      placeholder="Жишээ: Баримт дутуу байна, мэдээлэл буруу бичигдсэн..."
                      style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"rgba(255,255,255,0.75)",outline:"none",resize:"vertical" as const,fontFamily:"inherit",boxSizing:"border-box" as const,lineHeight:1.6 }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor="rgba(0,114,188,0.4)"}
                      onBlur={e  => (e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.07)"}
                    />
                  </div>

                  {/* Action buttons */}
                  {canEditStatus && (
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:"rgba(148,163,184,0.4)",marginBottom:10,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Статус өөрчлөх</div>
                      <div style={{ display:"flex",gap:10 }}>
                        {STATUS_ACTIONS.filter(a => a.status !== localStatus).map(a => (
                          <button key={a.status} className="dm-action" onClick={() => doAction(a.status)} disabled={actLoad}
                            style={{ background:a.bg, borderColor:a.border, color:a.color }}>
                            {actLoad ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/>
                              : a.status === "approved" ? <CheckCircle2 size={14}/>
                              : a.status === "returned" ? <AlertCircle size={14}/> : null}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Одоогийн статус */}
                  <div style={{ padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>Одоогийн статус:</span>
                    <Badge status={localStatus}/>
                  </div>

                  {/* Устгах */}
                  {canDelete && (
                    <div style={{ marginTop:"auto",paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      {!confirmDel ? (
                        <button onClick={() => setConfirmDel(true)}
                          style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.18)",color:"rgba(239,68,68,0.65)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                          <Trash2 size={13}/> Бүртгэл устгах
                        </button>
                      ) : (
                        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:12,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)" }}>
                          <span style={{ fontSize:12,color:"rgba(239,68,68,0.85)",flex:1 }}>Итгэлтэй байна уу? Энэ үйлдэл буцаах боломжгүй.</span>
                          <button onClick={() => setConfirmDel(false)}
                            style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(148,163,184,0.6)",fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
                            Болих
                          </button>
                          <button onClick={doDelete} disabled={delLoad}
                            style={{ padding:"6px 16px",borderRadius:8,background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,opacity:delLoad?0.6:1 }}>
                            {delLoad ? <Loader2 size={12} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={12}/>}
                            Устгах
                          </button>
                        </div>
                      )}
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

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}