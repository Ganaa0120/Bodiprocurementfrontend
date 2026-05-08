"use client";
import { Loader2, X, ArrowLeft, Clock, Download, Eye, Calendar, DollarSign, FolderOpen, MapPin, Package, Hash, User, Building2, Zap, AlertCircle, CheckCircle, Send, TrendingUp, Phone, FileText } from "lucide-react";
import { getTypeCfg, TYPE_CFG } from "./types";

interface Props {
  selected: any;
  detLoading: boolean;
  onClose: () => void;
  onBid: () => void;
}

function FileItem({ file }: { file: any }) {
  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", background: "rgba(255,255,255,0.04)",
        borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
        textDecoration: "none", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span style={{ fontSize: 24 }}>📄</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>
          {formatSize(file.size)}
        </div>
      </div>
      <Download size={16} color="#a5b4fc" />
    </a>
  );
}

export default function AnnouncementDetailModal({ selected, detLoading, onClose, onBid }: Props) {
  if (!selected && !detLoading) return null;

  const tc = selected ? getTypeCfg(selected.ann_type) : TYPE_CFG.open;
  const isExpired = selected?.deadline && new Date(selected.deadline) < new Date();

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px", animation: "fadeIn .2s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          width: "100%", maxWidth: 750, maxHeight: "88vh",
          background: "#0f172a", borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
          overflowY: "auto", display: "flex", flexDirection: "column" as const,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          height: 3, background: `linear-gradient(90deg, ${tc.color}, ${tc.color}44, transparent)`,
          borderRadius: "24px 24px 0 0", flexShrink: 0,
        }} />

        {detLoading ? (
          <div style={{ padding: "80px 0", display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            <Loader2 size={22} style={{ color: "#a5b4fc", animation: "spin .8s linear infinite" }} />
            <span style={{ fontSize: 14, color: "rgba(148,163,184,0.5)" }}>Ачаалж байна...</span>
          </div>
        ) : selected && (
          <>
            {/* Header */}
            <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: tc.bg, border: `1.5px solid ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {tc.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{tc.label}</span>
                    {selected.is_urgent && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Zap size={10} style={{ fill: "#fca5a5" }} /> Яаралтай
                      </span>
                    )}
                    {isExpired && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99, background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} /> Хугацаа дууссан
                      </span>
                    )}
                    {selected.announcement_number && (
                      <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}>
                        <Hash size={10} style={{ display: "inline", marginRight: 4 }} />{selected.announcement_number}
                      </span>
                    )}
                    {selected.procurement_kind && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99, background: "rgba(192,132,252,0.1)", color: "#c4b5fd", border: "1px solid rgba(192,132,252,0.2)" }}>
                        {selected.procurement_kind === "goods" ? "📦 Бараа" : selected.procurement_kind === "service" ? "🔧 Үйлчилгээ" : selected.procurement_kind}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "rgba(255,255,255,0.92)", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{selected.title}</h2>
                </div>
                <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.5)", flexShrink: 0, transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(148,163,184,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {selected.deadline && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: isExpired ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, background: isExpired ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Calendar size={14} style={{ color: isExpired ? "#f87171" : "#34d399" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isExpired ? "#f87171" : "#34d399" }}>Дуусах огноо</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isExpired ? "#fca5a5" : "#6ee7b7", marginTop: 2 }}>{new Date(selected.deadline).toLocaleDateString("mn-MN")}</div>
                    </div>
                  </div>
                )}
                {(selected.budget_from || selected.budget_to) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={14} style={{ color: "#fbbf24" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fbbf24" }}>Төсөв</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginTop: 2 }}>{Number(selected.budget_from).toLocaleString()}{selected.budget_to ? ` – ${Number(selected.budget_to).toLocaleString()}` : ""} ₮</div>
                    </div>
                  </div>
                )}
                {selected.category_name && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FolderOpen size={14} style={{ color: "rgba(148,163,184,0.5)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>Ангилал</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{selected.category_name}</div>
                    </div>
                  </div>
                )}
                {selected.view_count !== undefined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Eye size={14} style={{ color: "rgba(148,163,184,0.5)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(148,163,184,0.5)" }}>Үзсэн</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{selected.view_count} удаа</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

              {/* Supply Period */}
              {(selected.supply_start_date || selected.supply_end_date) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #60a5fa, #60a5fa44)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Нийлүүлэх хугацаа</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {selected.supply_start_date && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#60a5fa", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> Эхлэх</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>{new Date(selected.supply_start_date).toLocaleDateString("mn-MN")}</div>
                      </div>
                    )}
                    {selected.supply_end_date && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#60a5fa", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> Дуусах</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>{new Date(selected.supply_end_date).toLocaleDateString("mn-MN")}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Locations */}
              {(selected.central_location || selected.branch_location) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #34d399, #34d39944)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Байршил</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {selected.central_location && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#34d399", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> Төв байршил</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>{selected.central_location}</div>
                      </div>
                    )}
                    {selected.branch_location && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#34d399", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> Салбар байршил</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>{selected.branch_location}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: `linear-gradient(180deg, ${tc.color}, ${tc.color}44)` }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Тайлбар</span>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.05)", borderLeft: `3px solid ${tc.color}33` }}>
                    {/^</.test(selected.description.trim()) ? (
                      <div dangerouslySetInnerHTML={{ __html: selected.description.trim().startsWith("<li") ? `<ul style="padding-left:20px;margin:0;line-height:1.9">${selected.description}</ul>` : selected.description }} />
                    ) : (
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements - FIXED for HTML */}
              {selected.requirements && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #fbbf24, #fbbf2444)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Нийлүүлэгчид тавих шаардлага</span>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(245,158,11,0.15)", borderLeft: "3px solid rgba(245,158,11,0.3)" }}>
                    {/^</.test(selected.requirements.trim()) ? (
                      <div dangerouslySetInnerHTML={{ __html: selected.requirements }} style={{ lineHeight: 1.9 }} />
                    ) : selected.requirements.includes("\n") ? (
                      selected.requirements.split("\n").filter((l: string) => l.trim()).map((line: string, i: number, arr: string[]) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(245,158,11,0.06)" : "none" }}>
                          <span style={{ minWidth: 22, height: 22, borderRadius: 7, background: "rgba(245,158,11,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fbbf24" }}>{i + 1}</span>
                          <span style={{ flex: 1, color: "rgba(255,255,255,0.6)" }}>{line}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{selected.requirements}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Directions */}
              {(selected.activity_directions ?? []).length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #a78bfa, #a78bfa44)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Үйл ажиллагааны чиглэл 121</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(selected.activity_directions ?? []).map((d: string) => (
                      <span key={d} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 99, background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa" }} />{d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* RFQ Details */}
              {selected.ann_type === "rfq" && (selected.rfq_quantity || selected.rfq_delivery_place) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #fbbf24, #fbbf2444)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Үнийн санал дэлгэрэнгүй</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {selected.rfq_quantity && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#fbbf24", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><Package size={11} /> Тоо хэмжээ</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#fbbf24" }}>{selected.rfq_quantity} {selected.rfq_unit}</div>
                      </div>
                    )}
                    {selected.rfq_delivery_place && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#34d399", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> Хүргэх газар</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>{selected.rfq_delivery_place}</div>
                      </div>
                    )}
                    {selected.rfq_delivery_date && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ fontSize: 10, color: "#34d399", marginBottom: 6, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> Хүргэлтийн огноо</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>{new Date(selected.rfq_delivery_date).toLocaleDateString("mn-MN")}</div>
                      </div>
                    )}
                  </div>
                  {selected.rfq_specs && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.05)", whiteSpace: "pre-wrap" }}>{selected.rfq_specs}</div>
                  )}
                </div>
              )}

              {/* Client & Contact Info */}
              {(selected.client_company || selected.contact_phone || selected.responsible_person_name) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #fb923c, #fb923c44)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Холбоо барих мэдээлэл</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
                    {selected.client_company && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Building2 size={14} style={{ color: "rgba(148,163,184,0.4)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", width: 80, flexShrink: 0 }}>Компани</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{selected.client_company}</span>
                      </div>
                    )}
                    {selected.contact_phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Phone size={14} style={{ color: "rgba(148,163,184,0.4)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", width: 80, flexShrink: 0 }}>Утас</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{selected.contact_phone}</span>
                      </div>
                    )}
                    {selected.responsible_person_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <User size={14} style={{ color: "rgba(148,163,184,0.4)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", width: 80, flexShrink: 0 }}>Хариуцагч</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                          {selected.responsible_person_name}
                          {selected.responsible_position && <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginLeft: 6 }}>({selected.responsible_position})</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Buyer Documents */}
              {(selected.buyer_attachments?.length > 0 || selected.buyer_doc_info) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #818cf8, #818cf844)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Худалдан авагчийн баримт бичиг</span>
                  </div>
                  {selected.buyer_doc_info && (
                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", lineHeight: 1.6, marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
                      dangerouslySetInnerHTML={{ __html: selected.buyer_doc_info }} />
                  )}
                  {selected.buyer_attachments?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selected.buyer_attachments.map((file: any, idx: number) => (
                        <FileItem key={idx} file={file} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Supplier Required Documents */}
              {(selected.supplier_required_docs?.length > 0 || selected.supplier_doc_info) && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 4, height: 18, borderRadius: 99, background: "linear-gradient(180deg, #34d399, #34d39944)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Нийлүүлэгчид шаардлагатай бичиг баримт</span>
                  </div>
                  {selected.supplier_doc_info && (
                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", lineHeight: 1.6, marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                      dangerouslySetInnerHTML={{ __html: selected.supplier_doc_info }} />
                  )}
                  {selected.supplier_required_docs?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selected.supplier_required_docs.map((file: any, idx: number) => (
                        <FileItem key={idx} file={file} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Footer info */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#a5b4fc" }}>
                    {selected.created_by_name?.[0] ?? "B"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{selected.created_by_name ?? "Bodi Group"}</div>
                    <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginTop: 2 }}>
                      <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />
                      {new Date(selected.created_at).toLocaleDateString("mn-MN")} нийтэлсэн
                    </div>
                  </div>
                </div>
                {selected.application_count > 0 && (
                  <div style={{ textAlign: "right", padding: "10px 16px", borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#a5b4fc", lineHeight: 1 }}>{selected.application_count}</div>
                    <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>хүсэлт</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: "0 28px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <button onClick={onClose}
                style={{ padding: "12px 24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <ArrowLeft size={14} /> Буцах
              </button>
              <button onClick={onBid}
                style={{ padding: "12px 32px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${tc.color}dd, ${tc.color})`, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 20px ${tc.color}44`, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 24px ${tc.color}66`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${tc.color}44`; }}>
                <Send size={14} /> Хүсэлт гаргах
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}