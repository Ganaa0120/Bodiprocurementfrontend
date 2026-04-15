"use client";
import { X, Loader2, FileText, Users } from "lucide-react";
import { BID_STATUS } from "./constants";
import type { Ann } from "./types";

export function BidsDrawer({ ann, bids, loading, onClose, onUpdateStatus }: {
  ann: Ann; bids: any[]; loading: boolean;
  onClose: () => void;
  onUpdateStatus: (bidId: string, status: string) => void;
}) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",justifyContent:"flex-end",
      background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",animation:"fadeIn .2s ease" }}
      onClick={onClose}>
      <div style={{ width:"100%",maxWidth:520,height:"100%",background:"#0d1526",overflowY:"auto",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.4)",animation:"slideRight .28s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:"#0d1526",zIndex:1 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.9)",marginBottom:2 }}>Ирсэн хүсэлтүүд</div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.45)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const }}>{ann.title}</div>
          </div>
          <div style={{ fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:99,
            background:"rgba(59,130,246,0.15)",color:"#60a5fa",border:"1px solid rgba(59,130,246,0.25)",flexShrink:0 }}>
            {bids.length} хүсэлт
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,cursor:"pointer",display:"flex",color:"rgba(148,163,184,0.5)",flexShrink:0 }}>
            <X size={15}/>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding:"16px" }}>
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",padding:48,gap:10 }}>
              <Loader2 size={16} style={{ color:"#60a5fa",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
            </div>
          ) : bids.length === 0 ? (
            <div style={{ textAlign:"center",padding:"48px 0" }}>
              <FileText size={28} style={{ color:"rgba(148,163,184,0.15)",display:"block",margin:"0 auto 10px" }}/>
              <p style={{ fontSize:13,color:"rgba(148,163,184,0.3)",margin:0 }}>Хүсэлт ирээгүй байна</p>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {bids.map(b => {
                const bs = BID_STATUS[b.status] ?? BID_STATUS.submitted;
                return (
                  <div key={b.id} style={{ background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"16px",border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                      <div style={{ width:38,height:38,borderRadius:11,flexShrink:0,
                        background: b.supplier_type==="company" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                        {b.supplier_type==="company" ? "🏢" : "👤"}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const }}>{b.supplier_name || "—"}</div>
                        <div style={{ fontSize:10,color:"rgba(148,163,184,0.4)",display:"flex",gap:8,marginTop:1,flexWrap:"wrap" }}>
                          {b.supplier_number && <span>{b.supplier_number}</span>}
                          {b.supplier_email  && <span>{b.supplier_email}</span>}
                          {b.supplier_phone  && <span>{b.supplier_phone}</span>}
                        </div>
                      </div>
                      <span style={{ fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:99,background:bs.bg,color:bs.color,flexShrink:0 }}>{bs.label}</span>
                    </div>

                    {(b.price_offer || b.delivery_date) && (
                      <div style={{ display:"grid",gridTemplateColumns:b.price_offer&&b.delivery_date?"1fr 1fr":"1fr",gap:8,marginBottom:10 }}>
                        {b.price_offer && (
                          <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 12px",border:"1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize:9,color:"rgba(148,163,184,0.35)",marginBottom:3,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Үнийн санал</div>
                            <div style={{ fontSize:15,fontWeight:700,color:"#10b981" }}>
                              {Number(b.price_offer).toLocaleString()}
                              <span style={{ fontSize:10,fontWeight:400,color:"rgba(148,163,184,0.5)",marginLeft:3 }}>{ann.currency ?? "MNT"}</span>
                            </div>
                          </div>
                        )}
                        {b.delivery_date && (
                          <div style={{ background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 12px",border:"1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize:9,color:"rgba(148,163,184,0.35)",marginBottom:3,textTransform:"uppercase" as const,letterSpacing:"0.08em" }}>Хүргэлтийн огноо</div>
                            <div style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.75)" }}>{new Date(b.delivery_date).toLocaleDateString("mn-MN")}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {b.note && (
                      <div style={{ fontSize:12,color:"rgba(148,163,184,0.65)",background:"rgba(255,255,255,0.02)",borderRadius:9,padding:"9px 12px",marginBottom:10,border:"1px solid rgba(255,255,255,0.04)",lineHeight:1.6 }}>
                        {b.note}
                      </div>
                    )}

                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ fontSize:10,color:"rgba(148,163,184,0.3)" }}>{new Date(b.submitted_at).toLocaleString("mn-MN")}</span>
                      {b.status === "submitted" && (
                        <div style={{ display:"flex",gap:6 }}>
                          <button onClick={() => onUpdateStatus(b.id, "accepted")}
                            style={{ padding:"6px 12px",borderRadius:8,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",color:"#10b981",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                            ✓ Зөвшөөрөх
                          </button>
                          <button onClick={() => onUpdateStatus(b.id, "rejected")}
                            style={{ padding:"6px 12px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                            ✕ Татгалзах
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}