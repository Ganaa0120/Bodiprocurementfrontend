"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Search, RefreshCw, Clock, X, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; emoji: string; border: string }> = {
  open:     { label: "Нээлттэй",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", emoji: "🌐" },
  targeted: { label: "Хаалттай",    color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", emoji: "🔒" },
  rfq:      { label: "Үнийн санал", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", emoji: "📊" },
};

const TABS = [
  { key: "all",      label: "Бүгд" },
  { key: "open",     label: "Нээлттэй" },
  { key: "targeted", label: "Хаалттай" },
  { key: "rfq",      label: "Үнийн санал" },
];

function useW() {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function CompanyAnnouncementsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w >= 640 && w < 1024;

  const [anns,       setAnns]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [typeF,      setTypeF]      = useState("all");
  const [selected,   setSelected]   = useState<any>(null);
  const [detLoading, setDetLoading] = useState(false);
  const [bidModal,   setBidModal]   = useState(false);
  const [bidSaving,  setBidSaving]  = useState(false);
  const [bidError,   setBidError]   = useState("");
  const [bidDone,    setBidDone]    = useState(false);
  const [user,       setUser]       = useState<any>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const d = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      if (d.success) setAnns(d.announcements ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) { try { setUser(JSON.parse(u)); } catch {} }
    load();
  }, []);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    try {
      const d = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      if (d.success) setSelected(d.announcement);
    } catch {}
    finally { setDetLoading(false); }
  };

  const submitBid = async () => {
    if (!selected) return;
    setBidSaving(true); setBidError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST", headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      setBidDone(true);
      setTimeout(() => { setBidModal(false); setBidDone(false); }, 2500);
    } catch (e: any) { setBidError(e.message); }
    finally { setBidSaving(false); }
  };

  const counts = {
    all:      anns.length,
    open:     anns.filter(a => a.ann_type === "open").length,
    targeted: anns.filter(a => a.ann_type === "targeted").length,
    rfq:      anns.filter(a => a.ann_type === "rfq").length,
  };

  const filtered = anns.filter(a => {
    const matchType = typeF === "all" || a.ann_type === typeF;
    const q = search.toLowerCase();
    const matchQ = !q || a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: isMobile ? "16px 4px" : "24px 16px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .ann-tabs-scroll::-webkit-scrollbar { display: none; }
        .ann-tabs-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Detail Modal ── */}
      {(selected || detLoading) && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 640,
              background: "white",
              borderRadius: isMobile ? "20px 20px 0 0" : 24,
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
              animation: isMobile ? "slideUp .25s ease" : "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
              maxHeight: isMobile ? "94vh" : "85vh",
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            {detLoading ? (
              <div style={{ padding: "60px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                <Loader2 size={20} style={{ color: "#0072BC", animation: "spin .8s linear infinite" }} />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Ачаалж байна...</span>
              </div>
            ) : selected && (() => {
              const tc = TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open;
              const isExpired = selected.deadline && new Date(selected.deadline) < new Date();
              return (
                <>
                  {/* ── Hero header ── */}
                  <div style={{ padding: isMobile ? "20px 18px 18px" : "24px 26px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      <div style={{
                        width: isMobile ? 44 : 52, height: isMobile ? 44 : 52,
                        borderRadius: 16, flexShrink: 0,
                        background: tc.bg, border: `1.5px solid ${tc.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 20 : 24,
                      }}>
                        {tc.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 7 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                            background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                          }}>{tc.label}</span>
                          {selected.is_urgent && (
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                              background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                            }}>⚡ Яаралтай</span>
                          )}
                          {isExpired && (
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                            }}>Хугацаа дууссан</span>
                          )}
                          {selected.announcement_number && (
                            <span style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 99,
                              background: "#f8fafc", color: "#94a3b8", border: "1px solid #f1f5f9",
                              fontFamily: "monospace",
                            }}>#{selected.announcement_number}</span>
                          )}
                        </div>
                        <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.3, wordBreak: "break-word" }}>
                          {selected.title}
                        </h2>
                      </div>
                      <button onClick={() => setSelected(null)} style={{
                        background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 10,
                        padding: 8, cursor: "pointer", display: "flex", flexShrink: 0,
                      }}>
                        <X size={16} style={{ color: "#64748b" }} />
                      </button>
                    </div>

                    {/* ── Meta chips ── */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selected.deadline && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99,
                          background: isExpired ? "#fef2f2" : "#f0fdf4",
                          border: `1px solid ${isExpired ? "#fecaca" : "#a7f3d0"}`,
                          fontSize: 12, color: isExpired ? "#dc2626" : "#059669",
                        }}>
                          <Clock size={12} />
                          <span>Дуусах: <strong>{new Date(selected.deadline).toLocaleDateString("mn-MN")}</strong></span>
                        </div>
                      )}
                      {(selected.budget_from || selected.budget_to) && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99,
                          background: "#fffbeb", border: "1px solid #fde68a",
                          fontSize: 12, color: "#92400e",
                        }}>
                          <span>💰</span>
                          <span>
                            {Number(selected.budget_from).toLocaleString()}
                            {selected.budget_to ? ` — ${Number(selected.budget_to).toLocaleString()}` : ""} {selected.currency}
                          </span>
                        </div>
                      )}
                      {selected.category_name && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99,
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          fontSize: 12, color: "#64748b",
                        }}>
                          <span>📁</span>
                          <span>{selected.category_name}</span>
                        </div>
                      )}
                      {selected.view_count !== undefined && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99,
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          fontSize: 12, color: "#94a3b8",
                        }}>
                          <span>👁</span>
                          <span>{selected.view_count} үзсэн</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Body ── */}
                  <div style={{ padding: isMobile ? "18px" : "22px 26px", display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Тайлбар */}
                    {selected.description && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 3, height: 16, borderRadius: 99, background: "#0072BC" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", letterSpacing: "0.02em" }}>
                            Тайлбар
                          </span>
                        </div>
                        <div style={{
                          fontSize: 14, color: "#334155", lineHeight: 1.85,
                          background: "#fafafa", borderRadius: 14,
                          padding: isMobile ? "14px 16px" : "16px 18px",
                          border: "1px solid #f1f5f9",
                          wordBreak: "break-word",
                        }}>
                          {/^<(li|ul|ol|p|div|h[1-6]|strong|em|br|table)/i.test(selected.description.trim()) ? (
                            <div dangerouslySetInnerHTML={{
                              __html:
                                selected.description.trim().startsWith("<li")
                                  ? `<ul style="padding-left:20px;margin:0;line-height:1.85">${selected.description}</ul>`
                                  : selected.description
                            }} />
                          ) : (
                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.description}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Шаардлага */}
                    {selected.requirements && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 3, height: 16, borderRadius: 99, background: "#f59e0b" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                            Нийлүүлэгчид тавих шаардлага
                          </span>
                        </div>
                        <div style={{
                          background: "#fffbeb", borderRadius: 14,
                          padding: isMobile ? "14px 16px" : "16px 18px",
                          border: "1px solid #fde68a",
                        }}>
                          {selected.requirements.split("\n").map((line: string, i: number) => {
                            if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
                            const isKey = /хамгийн|өсөлт|эцэст|эхэнд|доод|өндөр|жилийн/i.test(line);
                            return (
                              <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: 10,
                                padding: "7px 0",
                                borderBottom: i < selected.requirements.split("\n").length - 1 ? "1px solid #fde68a20" : "none",
                              }}>
                                <span style={{
                                  width: 20, height: 20, borderRadius: "50%",
                                  background: isKey ? "#fde68a" : "#f1f5f9",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 10, fontWeight: 700, color: isKey ? "#92400e" : "#94a3b8",
                                  flexShrink: 0, marginTop: 1,
                                }}>{i + 1}</span>
                                <span style={{
                                  fontSize: 13, lineHeight: 1.6,
                                  color: isKey ? "#92400e" : "#475569",
                                  fontWeight: isKey ? 600 : 400,
                                  wordBreak: "break-word",
                                }}>{line}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Үйл ажиллагааны чиглэл */}
                    {selected.activity_directions?.length > 0 && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 3, height: 16, borderRadius: 99, background: "#8b5cf6" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                            Үйл ажиллагааны чиглэл
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                          {selected.activity_directions.map((d: string) => (
                            <span key={d} style={{
                              fontSize: 12, padding: "6px 14px", borderRadius: 99,
                              background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe", fontWeight: 500,
                            }}>{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RFQ дэлгэрэнгүй */}
                    {selected.ann_type === "rfq" && (selected.rfq_quantity || selected.rfq_delivery_place || selected.rfq_specs) && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 3, height: 16, borderRadius: 99, background: "#f59e0b" }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Үнийн санал дэлгэрэнгүй</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          {selected.rfq_quantity && (
                            <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px 14px", border: "1px solid #fde68a" }}>
                              <div style={{ fontSize: 10, color: "#92400e", marginBottom: 4, fontWeight: 600 }}>ТОО ХЭМЖЭЭ</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#78350f" }}>
                                {selected.rfq_quantity} {selected.rfq_unit}
                              </div>
                            </div>
                          )}
                          {selected.rfq_delivery_place && (
                            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "12px 14px", border: "1px solid #a7f3d0" }}>
                              <div style={{ fontSize: 10, color: "#065f46", marginBottom: 4, fontWeight: 600 }}>ХҮРГЭЛТИЙН ГАЗАР</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#064e3b" }}>{selected.rfq_delivery_place}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer info */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderRadius: 12,
                      background: "#f8fafc", border: "1px solid #f1f5f9",
                      gap: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        {selected.created_by_name ? (
                          <>
                            <div style={{
                              width: 30, height: 30, borderRadius: 9, background: "#e6f2fa",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700, color: "#0072BC", flexShrink: 0,
                            }}>
                              {selected.created_by_name[0]}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {selected.created_by_name}
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8" }}>Нийтэлсэн</div>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>Bodi Group</span>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {new Date(selected.created_at).toLocaleDateString("mn-MN")}
                        </div>
                        {selected.bid_count > 0 && (
                          <div style={{ fontSize: 11, color: "#0072BC", marginTop: 2 }}>
                            {selected.bid_count} хүсэлт ирсэн
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div style={{
                    padding: isMobile ? "0 18px 22px" : "0 26px 24px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                    flexDirection: isMobile ? "column-reverse" : "row",
                  }}>
                    <button onClick={() => setSelected(null)} style={{
                      padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0",
                      background: "white", color: "#64748b", fontSize: 13, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      width: isMobile ? "100%" : "auto",
                    }}>
                      <ArrowLeft size={14} /> Буцах
                    </button>
                    <button onClick={() => { setBidModal(true); setBidError(""); }} style={{
                      padding: "10px 24px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg,#0072BC,#3b9be0)", color: "white",
                      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(0,114,188,0.35)",
                      width: isMobile ? "100%" : "auto",
                    }}>
                      📨 Хүсэлт гаргах
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Bid Modal ── */}
      {bidModal && selected && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 110,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
          }}
          onClick={() => setBidModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 440,
              background: "white",
              borderRadius: isMobile ? "20px 20px 0 0" : 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
              animation: isMobile ? "slideUp .25s ease" : "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: "20px 22px", borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "#e6f2fa",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
              }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Оролцох хүсэлт гаргах</div>
                <div style={{
                  fontSize: 11, color: "#94a3b8", marginTop: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{selected.title}</div>
              </div>
              <button onClick={() => setBidModal(false)} style={{
                background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 9,
                padding: 7, cursor: "pointer", display: "flex", flexShrink: 0,
              }}>
                <X size={15} style={{ color: "#64748b" }} />
              </button>
            </div>
            <div style={{ padding: "20px 22px" }}>
              {bidDone ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#059669", marginBottom: 6 }}>
                    Хүсэлт амжилттай илгээгдлээ!
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Таны мэдээллийг admin нарт илгээлээ. Хариуг хүлээнэ үү.
                  </div>
                </div>
              ) : (
                <>
                  {bidError && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: "#fef2f2", border: "1px solid #fecaca",
                      fontSize: 13, color: "#dc2626", marginBottom: 16,
                    }}>{bidError}</div>
                  )}
                  <div style={{
                    padding: "14px 16px", borderRadius: 12,
                    background: "#f8fafc", border: "1px solid #f1f5f9", marginBottom: 18,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: "#94a3b8",
                      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
                    }}>
                      Таны мэдээлэл
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { label: "Байгууллага",   value: user?.company_name },
                        { label: "Нийлүүлэгч №",  value: user?.supplier_number },
                        { label: "И-мэйл",        value: user?.email },
                        { label: "Утас",          value: user?.phone },
                      ].filter(r => r.value).map(row => (
                        <div key={row.label} style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8", width: 100, flexShrink: 0 }}>{row.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", wordBreak: "break-word", minWidth: 0 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: 10, fontSize: 11, color: "#94a3b8",
                      padding: "8px 10px", borderRadius: 8,
                      background: "#e6f2fa", border: "1px solid #bae0f3",
                    }}>
                      💡 Дээрх мэдээлэл таны бүртгэлээс автоматаар явна
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setBidModal(false)} style={{
                      flex: 1, padding: "11px", borderRadius: 10,
                      border: "1px solid #e2e8f0", background: "white", color: "#64748b",
                      fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}>Болих</button>
                    <button onClick={submitBid} disabled={bidSaving} style={{
                      flex: 2, padding: "11px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg,#0072BC,#3b9be0)", color: "white",
                      fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      opacity: bidSaving ? 0.7 : 1,
                    }}>
                      {bidSaving
                        ? <><Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> Илгээж байна...</>
                        : "📨 Хүсэлт илгээх"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Зарлалууд</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Нийт нийтлэгдсэн худалдан авалтын зарлалууд</p>
      </div>

      {/* ── Tabs + Search row ── */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 10,
        marginBottom: 16,
      }}>
        {/* Tabs */}
        <div
          className="ann-tabs-scroll"
          style={{
            display: "flex", gap: 6,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            paddingBottom: isMobile ? 4 : 0,
            WebkitOverflowScrolling: "touch",
            flex: 1,
            minWidth: 0,
          }}
        >
          {TABS.map(({ key, label }) => {
            const tc     = key === "all" ? null : TYPE_CFG[key];
            const cnt    = counts[key as keyof typeof counts];
            const active = typeF === key;
            return (
              <button key={key} onClick={() => setTypeF(key)} style={{
                padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", flexShrink: 0,
                border: active ? `1.5px solid ${tc?.color ?? "#0072BC"}` : "1.5px solid #e2e8f0",
                background: active ? `${tc?.color ?? "#0072BC"}10` : "white",
                color: active ? (tc?.color ?? "#0072BC") : "#64748b",
              }}>
                {tc && <span>{tc.emoji}</span>}
                {label}
                {cnt > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                    lineHeight: "16px",
                    background: active ? (tc?.color ?? "#0072BC") : "#f1f5f9",
                    color: active ? "white" : "#64748b",
                  }}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + refresh */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
            <Search size={13} style={{
              position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", color: "#94a3b8",
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              style={{
                padding: "8px 12px 8px 32px", borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 12, outline: "none", background: "white",
                width: isMobile ? "100%" : 180,
                boxSizing: "border-box",
              }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = "#0072BC"}
              onBlur={e  => (e.target as HTMLElement).style.borderColor = "#e2e8f0"}
            />
          </div>
          <button onClick={load} style={{
            padding: "8px 12px", borderRadius: 10,
            border: "1px solid #e2e8f0", background: "white",
            cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0,
          }}>
            <RefreshCw size={13} style={{ color: "#64748b",
              animation: loading ? "spin 1s linear infinite" : undefined }} />
          </button>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 56, gap: 10 }}>
          <Loader2 size={20} style={{ color: "#0072BC", animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Ачаалж байна...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "56px 0",
          background: "white", borderRadius: 18, border: "1px solid #f1f5f9",
        }}>
          <FileText size={32} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>
            {search ? "Хайлтад тохирох зарлал олдсонгүй" : "Зарлал байхгүй байна"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(a => {
            const tc = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
            return (
              <div key={a.id} onClick={() => openDetail(a.id)} style={{
                background: "white", borderRadius: 16,
                padding: isMobile ? "14px 16px" : "18px 20px",
                border: `1px solid ${tc.border}`, borderLeft: `3px solid ${tc.color}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; el.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; el.style.transform = "translateY(0)"; }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: isMobile ? 10 : 14,
                  flexDirection: isMobile ? "column" : "row",
                }}>
                  {/* Top row on mobile = icon + title */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: isMobile ? 12 : 14,
                    width: isMobile ? "100%" : "auto",
                    flex: isMobile ? "none" : 1,
                    minWidth: 0,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: tc.bg, border: `1px solid ${tc.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    }}>
                      {tc.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                          background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                        }}>{tc.label}</span>
                        {a.is_urgent && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                            background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca",
                          }}>⚡ Яаралтай</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        wordBreak: "break-word",
                      }}>
                        {a.title}
                      </div>
                      {a.description && (
                        <p style={{
                          fontSize: 12, color: "#64748b", margin: "0 0 6px", lineHeight: 1.5,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: isMobile ? 2 : 1, WebkitBoxOrient: "vertical" as const,
                        }}>
                          {a.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        {a.category_name && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>📁 {a.category_name}</span>
                        )}
                        {(a.budget_from || a.budget_to) && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            💰 {a.budget_from?.toLocaleString()}{a.budget_to ? ` — ${a.budget_to.toLocaleString()}` : ""} {a.currency}
                          </span>
                        )}
                        {a.deadline && (
                          <span style={{
                            fontSize: 11, display: "flex", alignItems: "center", gap: 3,
                            color: new Date(a.deadline) < new Date() ? "#ef4444" : "#94a3b8",
                          }}>
                            <Clock size={10} />
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right meta: stays right on desktop, full-width row on mobile */}
                  <div style={{
                    flexShrink: 0,
                    textAlign: isMobile ? "left" : "right",
                    width: isMobile ? "100%" : "auto",
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "flex-end",
                    justifyContent: isMobile ? "space-between" : "flex-start",
                    gap: 4,
                    paddingTop: isMobile ? 8 : 0,
                    borderTop: isMobile ? "1px solid #f1f5f9" : "none",
                    marginTop: isMobile ? 4 : 0,
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>
                        {new Date(a.created_at).toLocaleDateString("mn-MN")}
                      </div>
                      {a.created_by_name && (
                        <div style={{ fontSize: 10, color: "#cbd5e1" }}>{a.created_by_name}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: tc.color,
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      Харах →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}