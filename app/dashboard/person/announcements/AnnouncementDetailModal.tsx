"use client";
import { Loader2, X, ArrowLeft, Clock, Download } from "lucide-react";
import { getTypeCfg, TYPE_CFG } from "./types";

interface Props {
  selected: any;
  detLoading: boolean;
  onClose: () => void;
  onBid: () => void;
}

export default function AnnouncementDetailModal({ selected, detLoading, onClose, onBid }: Props) {
  if (!selected && !detLoading) return null;

  const tc       = selected ? getTypeCfg(selected.ann_type) : TYPE_CFG.open;
  const isExpired= selected?.deadline && new Date(selected.deadline) < new Date();

  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.55)",
      backdropFilter:"blur(6px)",display:"flex",alignItems:"center",
      justifyContent:"center",padding:"20px 16px",animation:"fadeIn .2s ease" }}
      onClick={onClose}>
      <div style={{ width:"100%",maxWidth:640,background:"white",borderRadius:24,
        boxShadow:"0 32px 80px rgba(0,0,0,0.25)",
        animation:"modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
        maxHeight:"88vh",overflowY:"auto",display:"flex",flexDirection:"column" as const }}
        onClick={e => e.stopPropagation()}>

        {detLoading ? (
          <div style={{ padding:"70px 0",display:"flex",justifyContent:"center",
            alignItems:"center",gap:12 }}>
            <Loader2 size={22} style={{ color:"#6366f1",animation:"spin .8s linear infinite" }}/>
            <span style={{ fontSize:14,color:"#94a3b8" }}>Ачаалж байна...</span>
          </div>
        ) : selected && (
          <>
            {/* ── Colored top bar ── */}
            <div style={{ height:4,background:`linear-gradient(90deg,${tc.color},${tc.color}77)`,
              borderRadius:"24px 24px 0 0",flexShrink:0 }}/>

            {/* ── Header ── */}
            <div style={{ padding:"24px 26px 20px",borderBottom:"1px solid #f1f5f9",flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:16 }}>
                <div style={{ width:52,height:52,borderRadius:16,flexShrink:0,
                  background:`${tc.color}15`,border:`1.5px solid ${tc.color}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>
                  {tc.emoji}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  {/* Tags */}
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" as const,marginBottom:9 }}>
                    <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                      background:tc.bg,color:tc.color,border:`1px solid ${tc.border}` }}>
                      {tc.label}
                    </span>
                    {selected.is_urgent && (
                      <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                        background:"#fef2f2",color:"#ef4444",border:"1px solid #fecaca" }}>
                        ⚡ Яаралтай
                      </span>
                    )}
                    {isExpired && (
                      <span style={{ fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,
                        background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca" }}>
                        ⏰ Хугацаа дууссан
                      </span>
                    )}
                    {selected.announcement_number && (
                      <span style={{ fontSize:11,padding:"3px 10px",borderRadius:99,
                        background:"#f8fafc",color:"#94a3b8",border:"1px solid #e2e8f0",
                        fontFamily:"monospace" }}>
                        #{selected.announcement_number}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize:19,fontWeight:800,color:"#0f172a",
                    margin:0,lineHeight:1.3,letterSpacing:"-0.02em" }}>
                    {selected.title}
                  </h2>
                </div>
                <button onClick={onClose}
                  style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,
                    padding:9,cursor:"pointer",display:"flex",flexShrink:0,transition:"all .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#fee2e2"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}>
                  <X size={16} style={{ color:"#64748b" }}/>
                </button>
              </div>

              {/* Meta chips */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8 }}>
                {selected.deadline && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 13px",
                    borderRadius:12,background:isExpired?"#fff1f2":"#f0fdf4",
                    border:`1px solid ${isExpired?"#fecaca":"#bbf7d0"}` }}>
                    <div style={{ width:28,height:28,borderRadius:9,flexShrink:0,
                      background:isExpired?"#fee2e2":"#dcfce7",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                      📅
                    </div>
                    <div>
                      <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.08em",
                        textTransform:"uppercase" as const,
                        color:isExpired?"#dc2626":"#15803d" }}>Дуусах огноо</div>
                      <div style={{ fontSize:12,fontWeight:700,
                        color:isExpired?"#dc2626":"#166534",marginTop:1 }}>
                        {new Date(selected.deadline).toLocaleDateString("mn-MN")}
                      </div>
                    </div>
                  </div>
                )}
                {(selected.budget_from || selected.budget_to) && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 13px",
                    borderRadius:12,background:"#fffbeb",border:"1px solid #fde68a" }}>
                    <div style={{ width:28,height:28,borderRadius:9,flexShrink:0,
                      background:"#fef3c7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                      💰
                    </div>
                    <div>
                      <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.08em",
                        textTransform:"uppercase" as const,color:"#b45309" }}>Төсөв</div>
                      <div style={{ fontSize:12,fontWeight:700,color:"#92400e",marginTop:1 }}>
                        {Number(selected.budget_from).toLocaleString()}
                        {selected.budget_to?`–${Number(selected.budget_to).toLocaleString()}`:""} ₮
                      </div>
                    </div>
                  </div>
                )}
                {selected.category_name && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 13px",
                    borderRadius:12,background:"#f8fafc",border:"1px solid #e2e8f0" }}>
                    <div style={{ width:28,height:28,borderRadius:9,flexShrink:0,
                      background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                      📁
                    </div>
                    <div>
                      <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.08em",
                        textTransform:"uppercase" as const,color:"#64748b" }}>Ангилал</div>
                      <div style={{ fontSize:12,fontWeight:700,color:"#334155",marginTop:1 }}>
                        {selected.category_name}
                      </div>
                    </div>
                  </div>
                )}
                {selected.view_count !== undefined && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 13px",
                    borderRadius:12,background:"#f8fafc",border:"1px solid #e2e8f0" }}>
                    <div style={{ width:28,height:28,borderRadius:9,flexShrink:0,
                      background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                      👁
                    </div>
                    <div>
                      <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.08em",
                        textTransform:"uppercase" as const,color:"#64748b" }}>Үзсэн</div>
                      <div style={{ fontSize:12,fontWeight:700,color:"#334155",marginTop:1 }}>
                        {selected.view_count} удаа
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding:"22px 26px",display:"flex",flexDirection:"column" as const,gap:22,flex:1 }}>

              {/* Тайлбар */}
              {selected.description && (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                    <div style={{ width:4,height:18,borderRadius:99,
                      background:`linear-gradient(180deg,${tc.color},${tc.color}55)` }}/>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0f172a",letterSpacing:"-0.01em" }}>
                      Тайлбар
                    </span>
                  </div>
                  <div style={{ fontSize:14,color:"#334155",lineHeight:1.9,background:"#f8fafc",
                    borderRadius:14,padding:"16px 18px",border:"1px solid #f1f5f9",
                    borderLeft:`3px solid ${tc.color}33` }}>
                    {/^<(li|ul|ol|p|div|h[1-6]|strong|em|br|table)/i.test(selected.description.trim()) ? (
                      <div dangerouslySetInnerHTML={{ __html:
                        selected.description.trim().startsWith("<li")
                          ? `<ul style="padding-left:20px;margin:0;line-height:1.9">${selected.description}</ul>`
                          : selected.description }}/>
                    ) : (
                      <p style={{ margin:0,whiteSpace:"pre-wrap" as const }}>{selected.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Шаардлага */}
              {selected.requirements && (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                    <div style={{ width:4,height:18,borderRadius:99,
                      background:"linear-gradient(180deg,#f59e0b,#f59e0b55)" }}/>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0f172a",letterSpacing:"-0.01em" }}>
                      Нийлүүлэгчид тавих шаардлага
                    </span>
                  </div>
                  <div style={{ borderRadius:14,overflow:"hidden",border:"1px solid #fde68a" }}>
                    {selected.requirements.split("\n")
                      .filter((l: string) => l.trim())
                      .map((line: string, i: number, arr: string[]) => {
                        const isKey = /хамгийн|өсөлт|эцэст|эхэнд|доод|өндөр|жилийн/i.test(line);
                        return (
                          <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12,
                            padding:"11px 16px",
                            background:isKey?"#fffbeb":"white",
                            borderBottom:i<arr.length-1?"1px solid #fef3c7":"none" }}>
                            <div style={{ width:22,height:22,borderRadius:7,flexShrink:0,
                              background:isKey?"#fde68a":"#f1f5f9",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:10,fontWeight:800,
                              color:isKey?"#92400e":"#94a3b8",marginTop:1 }}>
                              {i+1}
                            </div>
                            <span style={{ fontSize:13,lineHeight:1.65,flex:1,
                              color:isKey?"#78350f":"#475569",fontWeight:isKey?600:400 }}>
                              {line}
                            </span>
                            {isKey && (
                              <span style={{ fontSize:10,padding:"2px 8px",borderRadius:99,
                                background:"#fde68a",color:"#92400e",fontWeight:700,flexShrink:0 }}>
                                ⭐
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Үйл ажиллагааны чиглэл */}
              {(selected.activity_directions ?? []).length > 0 && (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                    <div style={{ width:4,height:18,borderRadius:99,
                      background:"linear-gradient(180deg,#8b5cf6,#8b5cf655)" }}/>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0f172a",letterSpacing:"-0.01em" }}>
                      Үйл ажиллагааны чиглэл
                    </span>
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap" as const,gap:8 }}>
                    {(selected.activity_directions ?? []).map((d: string) => (
                      <span key={d} style={{ fontSize:12,padding:"7px 16px",borderRadius:99,
                        background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",
                        color:"#6d28d9",border:"1px solid #ddd6fe",fontWeight:600,
                        display:"flex",alignItems:"center",gap:5 }}>
                        <span style={{ width:5,height:5,borderRadius:"50%",background:"#8b5cf6" }}/>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RFQ дэлгэрэнгүй */}
              {selected.ann_type === "rfq" && (selected.rfq_quantity || selected.rfq_delivery_place) && (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                    <div style={{ width:4,height:18,borderRadius:99,
                      background:"linear-gradient(180deg,#f59e0b,#f59e0b55)" }}/>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>
                      Үнийн санал дэлгэрэнгүй
                    </span>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                    {selected.rfq_quantity && (
                      <div style={{ padding:"14px 16px",borderRadius:14,background:"#fffbeb",border:"1px solid #fde68a" }}>
                        <div style={{ fontSize:10,color:"#92400e",marginBottom:5,fontWeight:700,
                          letterSpacing:"0.08em",textTransform:"uppercase" as const }}>Тоо хэмжээ</div>
                        <div style={{ fontSize:16,fontWeight:800,color:"#78350f" }}>
                          {selected.rfq_quantity} {selected.rfq_unit}
                        </div>
                      </div>
                    )}
                    {selected.rfq_delivery_place && (
                      <div style={{ padding:"14px 16px",borderRadius:14,background:"#f0fdf4",border:"1px solid #bbf7d0" }}>
                        <div style={{ fontSize:10,color:"#15803d",marginBottom:5,fontWeight:700,
                          letterSpacing:"0.08em",textTransform:"uppercase" as const }}>Хүргэх газар</div>
                        <div style={{ fontSize:14,fontWeight:700,color:"#166534" }}>
                          {selected.rfq_delivery_place}
                        </div>
                      </div>
                    )}
                    {selected.rfq_delivery_date && (
                      <div style={{ padding:"14px 16px",borderRadius:14,background:"#f0fdf4",border:"1px solid #bbf7d0" }}>
                        <div style={{ fontSize:10,color:"#15803d",marginBottom:5,fontWeight:700,
                          letterSpacing:"0.08em",textTransform:"uppercase" as const }}>Хүргэлтийн огноо</div>
                        <div style={{ fontSize:14,fontWeight:700,color:"#166534" }}>
                          {new Date(selected.rfq_delivery_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                  </div>
                  {selected.rfq_specs && (
                    <div style={{ marginTop:10,fontSize:13,color:"#475569",
                      background:"#f8fafc",borderRadius:12,padding:"14px 16px",
                      border:"1px solid #f1f5f9",whiteSpace:"pre-wrap" as const }}>
                      {selected.rfq_specs}
                    </div>
                  )}
                </div>
              )}

              {/* Footer info card */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"14px 18px",borderRadius:14,
                background:"linear-gradient(135deg,#f8fafc,#f1f5f9)",
                border:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:34,height:34,borderRadius:10,
                    background:`${tc.color}15`,border:`1px solid ${tc.color}25`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:700,color:tc.color }}>
                    {selected.created_by_name?.[0] ?? "B"}
                  </div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>
                      {selected.created_by_name ?? "Bodi Group"}
                    </div>
                    <div style={{ fontSize:11,color:"#94a3b8",marginTop:1 }}>
                      {new Date(selected.created_at).toLocaleDateString("mn-MN")} нийтэлсэн
                    </div>
                  </div>
                </div>
                {selected.bid_count > 0 && (
                  <div style={{ textAlign:"right" as const,padding:"8px 14px",
                    borderRadius:10,background:"white",border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#6366f1",lineHeight:1 }}>
                      {selected.bid_count}
                    </div>
                    <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>хүсэлт</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ padding:"0 26px 26px",display:"flex",
              justifyContent:"space-between",alignItems:"center",gap:12,flexShrink:0 }}>
              <button onClick={onClose}
                style={{ padding:"10px 22px",borderRadius:12,border:"1px solid #e2e8f0",
                  background:"white",color:"#64748b",fontSize:13,fontWeight:600,
                  cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,
                  transition:"all .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#f8fafc"; (e.currentTarget as HTMLElement).style.borderColor="#cbd5e1"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.borderColor="#e2e8f0"; }}>
                <ArrowLeft size={14}/> Буцах
              </button>
              <button onClick={onBid}
                style={{ padding:"10px 28px",borderRadius:12,border:"none",
                  background:`linear-gradient(135deg,${tc.color},${tc.color}cc)`,
                  color:"white",fontSize:13,fontWeight:700,cursor:"pointer",
                  fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,
                  boxShadow:`0 4px 18px ${tc.color}44`,transition:"all .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform="translateY(-1px)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
                📨 Хүсэлт гаргах
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}