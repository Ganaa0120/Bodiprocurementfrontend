"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Loader2, Send, Clock, FileText, Eye, Users, CheckCircle2 } from "lucide-react";
import { API, TYPE, STATUS, authH, jsonH } from "./constants";
import { AnnModal } from "./AnnModal";
import { AnnViewModal } from "./AnnViewModal";
import { BidsDrawer } from "./BidsDrawer";
import type { Ann, AnnType } from "./types";

function SBadge({ s }: { s: string }) {
  const c = STATUS[s] ?? STATUS.draft;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:c.bg,color:c.color }}>
    <span style={{ width:5,height:5,borderRadius:"50%",background:c.color }}/>{c.label}</span>;
}
function TBadge({ t }: { t: AnnType }) {
  const c = TYPE[t]; const I = c.icon;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:c.bg,color:c.color }}>
    <I size={10}/>{c.label}</span>;
}

function ConfirmDel({ ann, onClose, onDone }: { ann: Ann; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/announcements/${ann.id}`, { method:"DELETE", headers:authH() });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:380,background:"#0d1526",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:28,boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }} onClick={e => e.stopPropagation()}>
        <div style={{ width:52,height:52,borderRadius:16,background:"rgba(239,68,68,0.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}><Trash2 size={22} style={{ color:"#ef4444" }}/></div>
        <div style={{ textAlign:"center",marginBottom:22 }}>
          <p style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:"0 0 8px" }}>Устгах уу?</p>
          <p style={{ fontSize:13,color:"rgba(148,163,184,0.6)",margin:0 }}><span style={{ color:"rgba(255,255,255,0.8)",fontWeight:600 }}>{ann.title}</span></p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,height:42,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Болих</button>
          <button onClick={go} disabled={loading} style={{ flex:1,height:42,borderRadius:10,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:loading?0.6:1 }}>
            {loading ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={13}/>}Устгах
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsTab({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [anns,    setAnns]    = useState<Ann[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState<"create" | "edit" | null>(null);
  const [target,  setTarget]  = useState<Ann | null>(null);
  const [delAnn,  setDelAnn]  = useState<Ann | null>(null);
  const [viewAnn, setViewAnn] = useState<Ann | null>(null);
  const [statusF, setStatusF] = useState("all");
  const [typeF,   setTypeF]   = useState("all");

  const [bidsAnn,  setBidsAnn]  = useState<Ann | null>(null);
  const [bids,     setBids]     = useState<any[]>([]);
  const [bidsLoad, setBidsLoad] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusF !== "all") p.set("status", statusF);
      if (typeF   !== "all") p.set("ann_type", typeF);
      const d = await fetch(`${API}/api/announcements?${p}`, { headers: authH() }).then(r => r.json());
      if (d.success) setAnns(d.announcements ?? []);
    } catch {}
    finally { setLoading(false); }
  }, [statusF, typeF]);

  useEffect(() => { load(); }, [load]);

  const loadBids = async (ann: Ann) => {
    setBidsAnn(ann); setBids([]); setBidsLoad(true);
    try {
      const d = await fetch(`${API}/api/announcements/${ann.id}/bids`, { headers: authH() }).then(r => r.json());
      if (d.success) setBids(d.bids ?? []);
    } catch {}
    finally { setBidsLoad(false); }
  };

  const updateBidStatus = async (bidId: string, status: string) => {
    if (!bidsAnn) return;
    try {
      const res = await fetch(`${API}/api/announcements/${bidsAnn.id}/bids/${bidId}/status`,
        { method:"PATCH", headers:jsonH(), body:JSON.stringify({ status }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setBids(p => p.map(b => b.id === bidId ? { ...b, status } : b));
      showToast(status === "accepted" ? "Зөвшөөрөгдлөө ✓" : "Татгалзагдлаа");
    } catch (e: any) { showToast(e.message, false); }
  };

  const setStatus = async (ann: Ann, status: string) => {
    try {
      const res = await fetch(`${API}/api/announcements/${ann.id}/status`,
        { method:"PATCH", headers:jsonH(), body:JSON.stringify({ status }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAnns(p => p.map(a => a.id === ann.id ? { ...a, status } : a));
      showToast(`${STATUS[status]?.label ?? status}`);
    } catch (e: any) { showToast(e.message, false); }
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").slice(0, 120);
  const fmt = (v?: number, c = "MNT") => v ? `${v.toLocaleString()} ${c}` : null;

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {(modal === "create" || modal === "edit") && (
        <AnnModal mode={modal} ann={target}
          onClose={() => { setModal(null); setTarget(null); }}
          onSave={() => { setModal(null); setTarget(null); load(); }}
          showToast={showToast}/>
      )}
      {delAnn && (
        <ConfirmDel ann={delAnn} onClose={() => setDelAnn(null)}
          onDone={() => { setAnns(p => p.filter(a => a.id !== delAnn!.id)); setDelAnn(null); showToast("Устгагдлаа"); }}/>
      )}
      {viewAnn && <AnnViewModal ann={viewAnn} onClose={() => setViewAnn(null)}/>}
      {bidsAnn && (
        <BidsDrawer ann={bidsAnn} bids={bids} loading={bidsLoad}
          onClose={() => setBidsAnn(null)}
          onUpdateStatus={updateBidStatus}/>
      )}

      <div className="page-in" style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {/* Toolbar */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
            {["all","draft","published","closed"].map(s => (
              <button key={s} onClick={() => setStatusF(s)}
                style={{ padding:"5px 12px",borderRadius:99,fontSize:12,cursor:"pointer",fontFamily:"inherit",
                  border: statusF===s ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  background: statusF===s ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                  color: statusF===s ? "#60a5fa" : "rgba(148,163,184,0.5)" }}>
                {s === "all" ? "Бүгд" : STATUS[s]?.label}
              </button>
            ))}
            <span style={{ width:1,background:"rgba(255,255,255,0.07)",margin:"0 4px" }}/>
            {(["all","open","targeted","rfq"] as const).map(t => (
              <button key={t} onClick={() => setTypeF(t)}
                style={{ padding:"5px 12px",borderRadius:99,fontSize:12,cursor:"pointer",fontFamily:"inherit",
                  border: typeF===t ? `1px solid ${t==="all"?"rgba(148,163,184,0.4)":TYPE[t].color+"40"}` : "1px solid rgba(255,255,255,0.07)",
                  background: typeF===t ? (t==="all" ? "rgba(148,163,184,0.1)" : TYPE[t].bg) : "rgba(255,255,255,0.03)",
                  color: typeF===t ? (t==="all" ? "#94a3b8" : TYPE[t].color) : "rgba(148,163,184,0.5)" }}>
                {t === "all" ? "Бүх төрөл" : TYPE[t].label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={load} style={{ padding:"9px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",cursor:"pointer",display:"flex",alignItems:"center" }}>
              <RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":undefined }}/>
            </button>
            <button onClick={() => { setTarget(null); setModal("create"); }}
              style={{ padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
              <Plus size={14}/> Шинэ зарлал
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:56,gap:12 }}>
            <div style={{ width:22,height:22,border:"2px solid rgba(52,211,153,0.3)",borderTopColor:"#34d399",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
            <span style={{ fontSize:13,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
          </div>
        ) : anns.length === 0 ? (
          <div style={{ padding:"56px 16px",textAlign:"center",background:"#0d1526",borderRadius:18,border:"1px solid rgba(255,255,255,0.06)" }}>
            <FileText size={32} style={{ color:"rgba(148,163,184,0.15)",margin:"0 auto 12px",display:"block" }}/>
            <p style={{ fontSize:13,color:"rgba(148,163,184,0.3)",margin:"0 0 16px" }}>Зарлал байхгүй байна</p>
            <button onClick={() => setModal("create")} style={{ padding:"8px 18px",borderRadius:10,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",color:"#60a5fa",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>+ Эхний зарлал үүсгэх</button>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {anns.map(a => {
              const tc = TYPE[a.ann_type];
              return (
                <div key={a.id}
                  style={{ background:"#0d1526",borderRadius:16,padding:"18px 20px",border:"1px solid rgba(255,255,255,0.06)",borderLeft:`3px solid ${tc.color}40`,transition:"border-left-color .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderLeftColor = tc.color + "80"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderLeftColor = tc.color + "40"}>

                  <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:6 }}>
                        <TBadge t={a.ann_type}/>
                        <span style={{ fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>{a.title}</span>
                        {a.is_urgent && <span style={{ fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"rgba(239,68,68,0.12)",color:"#ef4444" }}>⚡ Яаралтай</span>}
                        <SBadge s={a.status}/>
                      </div>
                      <div style={{ display:"flex",gap:14,flexWrap:"wrap",marginBottom:6 }}>
                        {a.category_name && <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)" }}>📁 {a.category_name}</span>}
                        {(a.budget_from || a.budget_to) && <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)" }}>💰 {a.budget_from && a.budget_to ? `${fmt(a.budget_from,a.currency)} — ${fmt(a.budget_to,a.currency)}` : fmt(a.budget_from || a.budget_to, a.currency)}</span>}
                        {a.deadline && <span style={{ fontSize:11,color:new Date(a.deadline)<new Date()?"#f87171":"rgba(148,163,184,0.5)" }}><Clock size={10} style={{ display:"inline",marginRight:3 }}/>{new Date(a.deadline).toLocaleDateString("mn-MN")}</span>}
                        {a.ann_type === "rfq" && a.rfq_quantity && <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)" }}>📦 {a.rfq_quantity} {a.rfq_unit}</span>}
                        <span style={{ fontSize:11,color:"rgba(148,163,184,0.3)" }}><Eye size={10} style={{ display:"inline",marginRight:3 }}/>{a.view_count ?? 0}</span>
                      </div>
                      {a.description && <p style={{ fontSize:12,color:"rgba(148,163,184,0.45)",margin:"0 0 6px" }}>{stripHtml(a.description)}{a.description.length > 120 ? "…" : ""}</p>}
                      {(a.activity_directions ?? []).length > 0 && (
                        <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                          {(a.activity_directions ?? []).map(d => (
                            <span key={d} style={{ fontSize:10,padding:"2px 8px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.18)" }}>{d}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display:"flex",flexDirection:"column",gap:6,flexShrink:0 }}>
                      {a.is_mine !== false ? (
                        <>
                          <button onClick={() => loadBids(a)}
                            style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#10b981",fontFamily:"inherit" }}>
                            <Users size={11}/> Хүсэлтүүд
                          </button>
                          <button onClick={() => { setTarget(a); setModal("edit"); }}
                            style={{ background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#60a5fa",fontFamily:"inherit" }}>
                            <Pencil size={11}/> Засах
                          </button>
                          {a.status === "draft" && (
                            <button onClick={() => setStatus(a, "published")}
                              style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#10b981",fontFamily:"inherit" }}>
                              <Send size={11}/> Нийтлэх
                            </button>
                          )}
                          {a.status === "published" && (
                            <button onClick={() => setStatus(a, "closed")}
                              style={{ background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#f59e0b",fontFamily:"inherit" }}>
                              <Clock size={11}/> Хаах
                            </button>
                          )}
                          <button onClick={() => setDelAnn(a)}
                            style={{ background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 8px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(239,68,68,0.7)" }}>
                            <Trash2 size={12}/>
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setViewAnn(a)}
                          style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:11,color:"rgba(148,163,184,0.6)",fontFamily:"inherit" }}>
                          <Eye size={11}/> Харах
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                      {a.created_by_name && (
                        <>
                          <div style={{ width:20,height:20,borderRadius:6,background:a.is_mine?"rgba(99,102,241,0.2)":"rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:a.is_mine?"#818cf8":"#fbbf24" }}>{a.created_by_name[0]}</div>
                          <span style={{ fontSize:11,color:"rgba(148,163,184,0.6)",fontWeight:500 }}>{a.created_by_name}</span>
                          <span style={{ fontSize:9,padding:"1px 6px",borderRadius:99,background:a.is_mine?"rgba(99,102,241,0.1)":"rgba(245,158,11,0.1)",color:a.is_mine?"#818cf8":"#fbbf24",fontWeight:600 }}>{a.is_mine ? "Өөрийн" : "Дэд админ"}</span>
                          <span style={{ fontSize:10,color:"rgba(148,163,184,0.25)" }}>·</span>
                        </>
                      )}
                      <span style={{ fontSize:10,color:"rgba(148,163,184,0.3)" }}>{new Date(a.created_at).toLocaleDateString("mn-MN")}</span>
                    </div>
                    {a.published_at && <span style={{ fontSize:10,color:"rgba(16,185,129,0.5)" }}>Нийтлэгдсэн: {new Date(a.published_at).toLocaleDateString("mn-MN")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}