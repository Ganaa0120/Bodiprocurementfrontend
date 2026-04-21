"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Clock,
  X,
  ArrowLeft,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<
  string,
  { label: string; color: string; bg: string; emoji: string; border: string }
> = {
  open: {
    label: "Нээлттэй",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    emoji: "🌐",
  },
  targeted: {
    label: "Хаалттай",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    emoji: "🔒",
  },
  rfq: {
    label: "Үнийн санал",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    emoji: "📊",
  },
};

export default function PersonAnnouncementsPage() {
  const [anns, setAnns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [detLoading, setDetLoading] = useState(false);
  const [bidModal, setBidModal] = useState(false);
  const [bidSaving, setBidSaving] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);
  const [user, setUser] = useState<any>(null);

  const submitBid = async () => {
    if (!selected) return;
    setBidSaving(true);
    setBidError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        // ✅ body байхгүй — supplier info backend-аас авна
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      setBidDone(true);
      setTimeout(() => {
        setBidModal(false);
        setBidDone(false);
      }, 2500);
    } catch (e: any) {
      setBidError(e.message);
    } finally {
      setBidSaving(false);
    }
  };

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const d = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setAnns(d.announcements ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ user нэмэх
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    load();
  }, []);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    try {
      const d = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setSelected(d.announcement);
    } catch {
    } finally {
      setDetLoading(false);
    }
  };

  // Tab counts
  const counts = {
    all: anns.length,
    open: anns.filter((a) => a.ann_type === "open").length,
    targeted: anns.filter((a) => a.ann_type === "targeted").length,
    rfq: anns.filter((a) => a.ann_type === "rfq").length,
  };

  const filtered = anns.filter((a) => {
    const matchType = typeF === "all" || a.ann_type === typeF;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const TABS = [
    { key: "all", label: "Бүгд" },
    { key: "open", label: "Нээлттэй" },
    { key: "targeted", label: "Хаалттай" },
    { key: "rfq", label: "Үнийн санал" },
  ];

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: "24px 16px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes modalIn{
          from{opacity:0;transform:scale(0.94) translateY(8px)}
          to{opacity:1;transform:scale(1) translateY(0)}
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>

      {/* ── Detail Modal ──────────────────────────────────────── */}
      {(selected || detLoading) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => {
            setSelected(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 640,
              background: "white",
              borderRadius: 24,
              boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
              animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {detLoading ? (
              <div
                style={{
                  padding: "60px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Loader2
                  size={20}
                  style={{
                    color: "#6366f1",
                    animation: "spin .8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Ачаалж байна...
                </span>
              </div>
            ) : (
              selected &&
              (() => {
                const tc = TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open;
                return (
                  <>
                    {/* Modal header */}
                    <div
                      style={{
                        padding: "22px 24px 18px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            flexShrink: 0,
                            background: tc.bg,
                            border: `1px solid ${tc.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                          }}
                        >
                          {tc.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h2
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#0f172a",
                              margin: "0 0 6px",
                              lineHeight: 1.3,
                            }}
                          >
                            {selected.title}
                          </h2>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap" as const,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 9px",
                                borderRadius: 99,
                                background: tc.bg,
                                color: tc.color,
                                border: `1px solid ${tc.border}`,
                              }}
                            >
                              {tc.emoji} {tc.label}
                            </span>
                            {selected.is_urgent && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 9px",
                                  borderRadius: 99,
                                  background: "#fef2f2",
                                  color: "#ef4444",
                                  border: "1px solid #fecaca",
                                }}
                              >
                                ⚡ Яаралтай
                              </span>
                            )}
                            {selected.category_name && (
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "2px 9px",
                                  borderRadius: 99,
                                  background: "#f8fafc",
                                  color: "#64748b",
                                  border: "1px solid #f1f5f9",
                                }}
                              >
                                📁 {selected.category_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelected(null)}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            borderRadius: 10,
                            padding: 8,
                            cursor: "pointer",
                            display: "flex",
                            flexShrink: 0,
                          }}
                        >
                          <X size={16} style={{ color: "#64748b" }} />
                        </button>
                      </div>

                      {/* Meta row */}
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          flexWrap: "wrap" as const,
                        }}
                      >
                        {selected.deadline && (
                          <span
                            style={{
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color:
                                new Date(selected.deadline) < new Date()
                                  ? "#ef4444"
                                  : "#64748b",
                            }}
                          >
                            <Clock size={12} />
                            Дуусах:{" "}
                            {new Date(selected.deadline).toLocaleDateString(
                              "mn-MN",
                            )}
                          </span>
                        )}
                        {(selected.budget_from || selected.budget_to) && (
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            💰 {selected.budget_from?.toLocaleString()}
                            {selected.budget_to
                              ? ` — ${selected.budget_to.toLocaleString()}`
                              : ""}{" "}
                            {selected.currency ?? "MNT"}
                          </span>
                        )}
                        {selected.view_count !== undefined && (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            👁 {selected.view_count} үзсэн
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Modal body */}
                    <div
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        flexDirection: "column" as const,
                        gap: 18,
                      }}
                    >
                      {/* Description */}
                      {selected.description && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase" as const,
                              color: "#94a3b8",
                              marginBottom: 10,
                            }}
                          >
                            Тайлбар
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#334155",
                              lineHeight: 1.8,
                              background: "#f8fafc",
                              borderRadius: 12,
                              padding: "14px 16px",
                              border: "1px solid #f1f5f9",
                            }}
                          >
                            {/* ✅ <li> болон бусад HTML tag-тай байвал ul wrapper-д оруулах */}
                            {/^<(li|ul|ol|p|div|h[1-6]|strong|em|br|table)/i.test(
                              selected.description.trim(),
                            ) ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selected.description
                                    .trim()
                                    .startsWith("<li")
                                    ? `<ul style="padding-left:20px;margin:0">${selected.description}</ul>`
                                    : selected.description,
                                }}
                                style={{ lineHeight: 1.8 }}
                              />
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  whiteSpace: "pre-wrap" as const,
                                }}
                              >
                                {selected.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Requirements */}
                      {selected.requirements && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase" as const,
                              color: "#94a3b8",
                              marginBottom: 10,
                            }}
                          >
                            Нийлүүлэгчид тавих шаардлага
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              lineHeight: 1.8,
                              background: "#f8fafc",
                              borderRadius: 12,
                              padding: "14px 16px",
                              border: "1px solid #f1f5f9",
                            }}
                          >
                            {/* ✅ \n → мөр, тоо баримт → highlight */}
                            {selected.requirements
                              .split("\n")
                              .map((line: string, i: number) => {
                                // "Хамгийн ..." гэсэн мөрүүдийг тусгайлан харуулах
                                const isHighlight =
                                  /хамгийн|өсөлт|эцэст|эхэнд|доод|өндөр/i.test(
                                    line,
                                  );
                                return line.trim() ? (
                                  <div
                                    key={i}
                                    style={{
                                      padding: "5px 0",
                                      borderBottom:
                                        i <
                                        selected.requirements.split("\n")
                                          .length -
                                          1
                                          ? "1px solid #f1f5f9"
                                          : "none",
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 8,
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#cbd5e1",
                                        flexShrink: 0,
                                        marginTop: 2,
                                      }}
                                    >
                                      •
                                    </span>
                                    <span
                                      style={{
                                        color: isHighlight
                                          ? "#0f172a"
                                          : "#475569",
                                        fontWeight: isHighlight ? 500 : 400,
                                      }}
                                    >
                                      {line}
                                    </span>
                                  </div>
                                ) : (
                                  <div key={i} style={{ height: 6 }} />
                                );
                              })}
                          </div>
                        </div>
                      )}
                      {/* RFQ details */}
                      {selected.ann_type === "rfq" &&
                        (selected.rfq_quantity ||
                          selected.rfq_delivery_place ||
                          selected.rfq_specs) && (
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase" as const,
                                color: tc.color,
                                marginBottom: 10,
                              }}
                            >
                              Үнийн санал — дэлгэрэнгүй
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 10,
                                marginBottom: 10,
                              }}
                            >
                              {selected.rfq_quantity && (
                                <div
                                  style={{
                                    background: "#f8fafc",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    border: "1px solid #f1f5f9",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "#94a3b8",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Тоо хэмжээ
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {selected.rfq_quantity} {selected.rfq_unit}
                                  </div>
                                </div>
                              )}
                              {selected.rfq_delivery_place && (
                                <div
                                  style={{
                                    background: "#f8fafc",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    border: "1px solid #f1f5f9",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "#94a3b8",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Хүргэлтийн газар
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {selected.rfq_delivery_place}
                                  </div>
                                </div>
                              )}
                              {selected.rfq_delivery_date && (
                                <div
                                  style={{
                                    background: "#f8fafc",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    border: "1px solid #f1f5f9",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "#94a3b8",
                                      marginBottom: 3,
                                    }}
                                  >
                                    Хүргэлтийн огноо
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {new Date(
                                      selected.rfq_delivery_date,
                                    ).toLocaleDateString("mn-MN")}
                                  </div>
                                </div>
                              )}
                            </div>
                            {selected.rfq_specs && (
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "#475569",
                                  background: "#f8fafc",
                                  borderRadius: 12,
                                  padding: "14px 16px",
                                  border: "1px solid #f1f5f9",
                                  whiteSpace: "pre-wrap" as const,
                                }}
                              >
                                {selected.rfq_specs}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Activity directions */}
                      {(selected.activity_directions ?? []).length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase" as const,
                              color: "#94a3b8",
                              marginBottom: 8,
                            }}
                          >
                            Үйл ажиллагааны чиглэл
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap" as const,
                              gap: 6,
                            }}
                          >
                            {(selected.activity_directions ?? []).map(
                              (d: string) => (
                                <span
                                  key={d}
                                  style={{
                                    fontSize: 12,
                                    padding: "4px 12px",
                                    borderRadius: 99,
                                    background: "#eef2ff",
                                    color: "#4f46e5",
                                    border: "1px solid #c7d2fe",
                                    fontWeight: 500,
                                  }}
                                >
                                  {d}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Creator */}
                      <div
                        style={{
                          paddingTop: 14,
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {selected.created_by_name && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: "#eef2ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#6366f1",
                              }}
                            >
                              {selected.created_by_name[0]}
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {selected.created_by_name}
                            </span>
                          </div>
                        )}
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {new Date(selected.created_at).toLocaleDateString(
                            "mn-MN",
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0 24px 22px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <button
                        onClick={() => setSelected(null)}
                        style={{
                          padding: "9px 18px",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          background: "white",
                          color: "#64748b",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ArrowLeft size={14} /> Буцах
                      </button>

                      {/* ✅ Бүх зарлалд хүсэлт гаргах боломжтой */}
                      <button
                        onClick={() => {
                          setBidModal(true);
                          setBidError("");
                        }}
                        style={{
                          padding: "9px 22px",
                          borderRadius: 10,
                          border: "none",
                          background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        📨 Хүсэлт гаргах
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
      {bidModal && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
          }}
          onClick={() => setBidModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "white",
              borderRadius: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
              animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                📋
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
                >
                  Оролцох хүсэлт гаргах
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {selected.title}
                </div>
              </div>
              <button
                onClick={() => setBidModal(false)}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: 9,
                  padding: 7,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={15} style={{ color: "#64748b" }} />
              </button>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {bidDone ? (
                <div
                  style={{ textAlign: "center" as const, padding: "24px 0" }}
                >
                  <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#059669",
                      marginBottom: 6,
                    }}
                  >
                    Хүсэлт амжилттай илгээгдлээ!
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    Таны мэдээллийг admin нарт илгээлээ. Хариуг хүлээнэ үү.
                  </div>
                </div>
              ) : (
                <>
                  {bidError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        fontSize: 13,
                        color: "#dc2626",
                        marginBottom: 16,
                      }}
                    >
                      {bidError}
                    </div>
                  )}

                  {/* ✅ Танай мэдээлэл автоматаар явна гэж мэдэгдэх */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        marginBottom: 10,
                      }}
                    >
                      Таны мэдээлэл
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column" as const,
                        gap: 6,
                      }}
                    >
                      {[
                        {
                          label: "Нэр",
                          value:
                            [user?.last_name, user?.first_name]
                              .filter(Boolean)
                              .join(" ") || user?.email,
                        },
                        { label: "Нийлүүлэгч №", value: user?.supplier_number },
                        { label: "И-мэйл", value: user?.email },
                        { label: "Утас", value: user?.phone },
                      ]
                        .filter((r) => r.value)
                        .map((row) => (
                          <div
                            key={row.label}
                            style={{ display: "flex", gap: 8 }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                width: 100,
                                flexShrink: 0,
                              }}
                            >
                              {row.label}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#0f172a",
                              }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        color: "#94a3b8",
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "#eef2ff",
                        border: "1px solid #c7d2fe",
                      }}
                    >
                      💡 Дээрх мэдээлэл таны бүртгэлээс автоматаар явна
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setBidModal(false)}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "white",
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Болих
                    </button>
                    <button
                      onClick={submitBid}
                      disabled={bidSaving}
                      style={{
                        flex: 2,
                        padding: "11px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        opacity: bidSaving ? 0.7 : 1,
                      }}
                    >
                      {bidSaving ? (
                        <>
                          <Loader2
                            size={14}
                            style={{ animation: "spin .8s linear infinite" }}
                          />{" "}
                          Илгээж байна...
                        </>
                      ) : (
                        "📨 Хүсэлт илгээх"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 4px",
          }}
        >
          Зарлалууд
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Нийт нийтлэгдсэн худалдан авалтын зарлалууд
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap" as const,
        }}
      >
        {TABS.map(({ key, label }) => {
          const tc = key === "all" ? null : TYPE_CFG[key];
          const cnt = counts[key as keyof typeof counts];
          const active = typeF === key;
          return (
            <button
              key={key}
              onClick={() => setTypeF(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: active
                  ? `1.5px solid ${tc?.color ?? "#6366f1"}`
                  : "1.5px solid #e2e8f0",
                background: active ? `${tc?.color ?? "#6366f1"}10` : "white",
                color: active ? (tc?.color ?? "#6366f1") : "#64748b",
              }}
            >
              {tc && <span>{tc.emoji}</span>}
              {label}
              {/* ✅ Count badge */}
              {cnt > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 99,
                    lineHeight: "16px",
                    background: active ? (tc?.color ?? "#6366f1") : "#f1f5f9",
                    color: active ? "white" : "#64748b",
                  }}
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}

        {/* Search + Refresh */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Хайх..."
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 12,
                outline: "none",
                background: "white",
                width: 180,
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#6366f1")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
              }
            />
          </div>
          <button
            onClick={load}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RefreshCw
              size={13}
              style={{
                color: "#64748b",
                animation: loading ? "spin 1s linear infinite" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 56,
            gap: 10,
          }}
        >
          <Loader2
            size={20}
            style={{ color: "#6366f1", animation: "spin .8s linear infinite" }}
          />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Ачаалж байна...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center" as const,
            padding: "56px 0",
            background: "white",
            borderRadius: 18,
            border: "1px solid #f1f5f9",
          }}
        >
          <FileText
            size={32}
            style={{
              color: "#e2e8f0",
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>
            {search
              ? "Хайлтад тохирох зарлал олдсонгүй"
              : "Зарлал байхгүй байна"}
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}
        >
          {filtered.map((a) => {
            const tc = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
            return (
              <div
                key={a.id}
                onClick={() => openDetail(a.id)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "18px 20px",
                  border: `1px solid ${tc.border}`,
                  borderLeft: `3px solid ${tc.color}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {tc.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap" as const,
                        marginBottom: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: tc.bg,
                          color: tc.color,
                          border: `1px solid ${tc.border}`,
                        }}
                      >
                        {tc.label}
                      </span>
                      {a.is_urgent && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                          }}
                        >
                          ⚡ Яаралтай
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {a.title}
                    </div>

                    {a.description && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          margin: "0 0 6px",
                          lineHeight: 1.5,
                          overflow: "hidden",
                          display: "-webkit-box" as const,
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical" as const,
                        }}
                      >
                        {/* ✅ HTML strip + plain text харуулах */}
                        {a.description
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .slice(0, 120)}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      {a.category_name && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          📁 {a.category_name}
                        </span>
                      )}
                      {(a.budget_from || a.budget_to) && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          💰 {a.budget_from?.toLocaleString()}
                          {a.budget_to
                            ? ` — ${a.budget_to.toLocaleString()}`
                            : ""}{" "}
                          {a.currency}
                        </span>
                      )}
                      {a.deadline && (
                        <span
                          style={{
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            color:
                              new Date(a.deadline) < new Date()
                                ? "#ef4444"
                                : "#94a3b8",
                          }}
                        >
                          <Clock size={10} />
                          {new Date(a.deadline).toLocaleDateString("mn-MN")}
                        </span>
                      )}
                      {a.ann_type === "rfq" && a.rfq_quantity && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          📦 {a.rfq_quantity} {a.rfq_unit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: "right" as const }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        marginBottom: 4,
                      }}
                    >
                      {new Date(a.created_at).toLocaleDateString("mn-MN")}
                    </div>
                    {a.created_by_name && (
                      <div style={{ fontSize: 10, color: "#cbd5e1" }}>
                        {a.created_by_name}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        color: tc.color,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        justifyContent: "flex-end",
                      }}
                    >
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
