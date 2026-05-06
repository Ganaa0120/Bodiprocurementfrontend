"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Loader2, Send, Clock, FileText, Eye, Users, CheckCircle2, Calendar, DollarSign, Tag, Layers, Zap, ArrowRight } from "lucide-react";
import { API, TYPE, STATUS, authH, jsonH } from "./constants";
import { AnnModal } from "./AnnModal";
import { AnnViewModal } from "./AnnViewModal";
import { BidsDrawer } from "./BidsDrawer";
import type { Ann, AnnType } from "./types";

function SBadge({ s }: { s: string }) {
  const c = STATUS[s] ?? STATUS.draft;
  return (
    <span style={{ 
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 30,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.color}20`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
      {c.label}
    </span>
  );
}

function TBadge({ t }: { t: AnnType }) {
  const c = TYPE[t];
  const Icon = c.icon;
  return (
    <span style={{ 
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 30,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.color}20`
    }}>
      <Icon size={12} />
      {c.label}
    </span>
  );
}

function ConfirmDel({ ann, onClose, onDone }: { ann: Ann; onClose: () => void; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/announcements/${ann.id}`, { method: "DELETE", headers: authH() });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 400, background: "#0d1526", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 24, padding: 28, boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Trash2 size={24} style={{ color: "#ef4444" }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "0 0 8px" }}>Устгах уу?</p>
          <p style={{ fontSize: 13, color: "rgba(148,163,184,0.5)", margin: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{ann.title}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.6)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Болих</button>
          <button onClick={go} disabled={loading} style={{ flex: 1, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.6 : 1 }}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />} Устгах
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsTab({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [anns, setAnns] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [target, setTarget] = useState<Ann | null>(null);
  const [delAnn, setDelAnn] = useState<Ann | null>(null);
  const [viewAnn, setViewAnn] = useState<Ann | null>(null);
  const [statusF, setStatusF] = useState("all");
  const [typeF, setTypeF] = useState("all");
  const [bidsAnn, setBidsAnn] = useState<Ann | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [bidsLoad, setBidsLoad] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusF !== "all") p.set("status", statusF);
      if (typeF !== "all") p.set("ann_type", typeF);
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
      const res = await fetch(`${API}/api/announcements/${bidsAnn.id}/bids/${bidId}/status`, {
        method: "PATCH", headers: jsonH(), body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setBids(p => p.map(b => b.id === bidId ? { ...b, status } : b));
      showToast(status === "accepted" ? "Зөвшөөрөгдлөө ✓" : "Татгалзагдлаа");
    } catch (e: any) { showToast(e.message, false); }
  };

  const setAnnStatus = async (ann: Ann, status: string) => {
    try {
      const res = await fetch(`${API}/api/announcements/${ann.id}/status`, {
        method: "PATCH", headers: jsonH(), body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAnns(p => p.map(a => a.id === ann.id ? { ...a, status } : a));
      showToast(`${STATUS[status]?.label ?? status}`);
    } catch (e: any) { showToast(e.message, false); }
  };

  const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, "").slice(0, 120) || "";
  const fmt = (v?: number, c = "MNT") => v ? `${v.toLocaleString()} ${c}` : null;

  // Status and type counts
  const statusCounts = {
    draft: anns.filter(a => a.status === "draft").length,
    published: anns.filter(a => a.status === "published").length,
    closed: anns.filter(a => a.status === "closed").length,
  };
  const typeCounts = {
    open: anns.filter(a => a.ann_type === "open").length,
    targeted: anns.filter(a => a.ann_type === "targeted").length,
    rfq: anns.filter(a => a.ann_type === "rfq").length,
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ann-card {
          animation: fadeInUp 0.3s ease forwards;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ann-card:hover {
          transform: translateY(-2px);
        }
        .filter-btn {
          transition: all 0.2s ease;
        }
        .filter-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {(modal === "create" || modal === "edit") && (
        <AnnModal 
          mode={modal} 
          ann={target}
          onClose={() => { setModal(null); setTarget(null); }}
          onSave={() => { setModal(null); setTarget(null); load(); }}
          showToast={showToast}
        />
      )}
      {delAnn && (
        <ConfirmDel 
          ann={delAnn} 
          onClose={() => setDelAnn(null)}
          onDone={() => { setAnns(p => p.filter(a => a.id !== delAnn!.id)); setDelAnn(null); showToast("Устгагдлаа"); }}
        />
      )}
      {viewAnn && <AnnViewModal ann={viewAnn} onClose={() => setViewAnn(null)} />}
      {bidsAnn && (
        <BidsDrawer 
          ann={bidsAnn} 
          bids={bids} 
          loading={bidsLoad}
          onClose={() => setBidsAnn(null)}
          onUpdateStatus={updateBidStatus}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Нийт {anns.length} зарлал</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Status filters */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setStatusF("all")}
                className="filter-btn"
                style={{
                  padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                  background: statusF === "all" ? "#4f46e5" : "#1e293b",
                  border: statusF === "all" ? "none" : "1px solid #334155",
                  color: statusF === "all" ? "white" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                Бүгд
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{anns.length}</span>
              </button>
              {["draft", "published", "closed"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusF(s)}
                  className="filter-btn"
                  style={{
                    padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                    background: statusF === s ? STATUS[s]?.color : "#1e293b",
                    border: statusF === s ? "none" : "1px solid #334155",
                    color: statusF === s ? "white" : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {STATUS[s]?.label}
                  <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{statusCounts[s as keyof typeof statusCounts]}</span>
                </button>
              ))}
            </div>

            <div style={{ width: 1, background: "#334155", margin: "0 4px" }} />

            {/* Type filters */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setTypeF("all")}
                className="filter-btn"
                style={{
                  padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                  background: typeF === "all" ? "#64748b" : "#1e293b",
                  border: typeF === "all" ? "none" : "1px solid #334155",
                  color: typeF === "all" ? "white" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                Бүх төрөл
              </button>
              {(["open", "targeted", "rfq"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeF(t)}
                  className="filter-btn"
                  style={{
                    padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 500,
                    background: typeF === t ? TYPE[t].color : "#1e293b",
                    border: typeF === t ? "none" : "1px solid #334155",
                    color: typeF === t ? "white" : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {TYPE[t].label}
                  <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{typeCounts[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={load}
              style={{
                padding: "9px 16px", borderRadius: 10, background: "#1e293b",
                border: "1px solid #334155", color: "#94a3b8", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : undefined }} />
              Дахин ачаалах
            </button>
            <button
              onClick={() => { setTarget(null); setModal("create"); }}
              style={{
                padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.3)"; }}
            >
              <Plus size={14} /> Шинэ зарлал
            </button>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80, gap: 12 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #334155", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#64748b" }}>Ачаалж байна...</span>
          </div>
        ) : anns.length === 0 ? (
          <div style={{ background: "#0f172a", borderRadius: 20, border: "1px solid #334155", padding: "80px 20px", textAlign: "center" }}>
            <FileText size={48} style={{ color: "#334155", margin: "0 auto 16px", display: "block" }} />
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Зарлал байхгүй байна</p>
            <button
              onClick={() => setModal("create")}
              style={{
                marginTop: 20, padding: "8px 20px", borderRadius: 10,
                background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.3)",
                color: "#a5b4fc", fontSize: 13, cursor: "pointer",
              }}
            >
              + Эхний зарлал үүсгэх
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {anns.map((ann, idx) => {
              const tc = TYPE[ann.ann_type];
              const statusColor = STATUS[ann.status]?.color || "#64748b";
              return (
                <div
                  key={ann.id}
                  className="ann-card"
                  style={{
                    background: "#0f172a", borderRadius: 20, padding: "20px 24px",
                    border: "1px solid #334155", borderLeft: `3px solid ${tc.color}`,
                    transition: "all 0.25s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <TBadge t={ann.ann_type} />
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
                          {ann.title}
                        </h3>
                        {ann.is_urgent && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 30, background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                            ⚡ Яаралтай
                          </span>
                        )}
                        <SBadge s={ann.status} />
                      </div>

                      {/* Meta info */}
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
                        {ann.category_name && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                            <Tag size={11} /> {ann.category_name}
                          </span>
                        )}
                        {(ann.budget_from || ann.budget_to) && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                            <DollarSign size={11} /> 
                            {ann.budget_from && ann.budget_to 
                              ? `${fmt(ann.budget_from, ann.currency)} — ${fmt(ann.budget_to, ann.currency)}`
                              : fmt(ann.budget_from || ann.budget_to, ann.currency)}
                          </span>
                        )}
                        {ann.deadline && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: new Date(ann.deadline) < new Date() ? "#f87171" : "#64748b" }}>
                            <Calendar size={11} /> {new Date(ann.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                        {ann.ann_type === "rfq" && ann.rfq_quantity && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                            <Layers size={11} /> {ann.rfq_quantity} {ann.rfq_unit}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                          <Eye size={11} /> {ann.view_count ?? 0}
                        </span>
                      </div>

                      {/* Description */}
                      {ann.description && (
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px", lineHeight: 1.5 }}>
                          {stripHtml(ann.description)}{ann.description.length > 120 ? "…" : ""}
                        </p>
                      )}

                      {/* Activity directions */}
                      {(ann.activity_directions ?? []).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {(ann.activity_directions ?? []).slice(0, 3).map(d => (
                            <span key={d} style={{ fontSize: 10, padding: "2px 10px", borderRadius: 30, background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                              {d}
                            </span>
                          ))}
                          {(ann.activity_directions ?? []).length > 3 && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 30, background: "#1e293b", color: "#64748b" }}>
                              +{(ann.activity_directions ?? []).length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {ann.created_by_name && (
                          <>
                            <div style={{ width: 24, height: 24, borderRadius: 8, background: ann.is_mine ? "rgba(79,70,229,0.2)" : "rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ann.is_mine ? "#a5b4fc" : "#fbbf24" }}>
                              {ann.created_by_name[0]}
                            </div>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{ann.created_by_name}</span>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 30, background: ann.is_mine ? "rgba(79,70,229,0.1)" : "rgba(245,158,11,0.1)", color: ann.is_mine ? "#a5b4fc" : "#fbbf24", fontWeight: 600 }}>
                              {ann.is_mine ? "Өөрийн" : "Дэд админ"}
                            </span>
                            <span style={{ fontSize: 10, color: "#475569" }}>•</span>
                          </>
                        )}
                        <span style={{ fontSize: 10, color: "#475569" }}>
                          {new Date(ann.created_at).toLocaleDateString("mn-MN")}
                        </span>
                        {ann.published_at && ann.status === "published" && (
                          <span style={{ fontSize: 10, color: "#10b981", opacity: 0.6, display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={10} /> Нийтлэгдсэн: {new Date(ann.published_at).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                      {ann.is_mine !== false ? (
                        <>
                          <button
                            onClick={() => loadBids(ann)}
                            style={{
                              padding: "7px 14px", borderRadius: 10, background: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#34d399",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
                          >
                            <Users size={12} /> Хүсэлтүүд
                          </button>
                          <button
                            onClick={() => { setTarget(ann); setModal("edit"); }}
                            style={{
                              padding: "7px 14px", borderRadius: 10, background: "rgba(79,70,229,0.08)",
                              border: "1px solid rgba(79,70,229,0.2)", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a5b4fc",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(79,70,229,0.15)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(79,70,229,0.08)"; }}
                          >
                            <Pencil size={12} /> Засах
                          </button>
                          {ann.status === "draft" && (
                            <button
                              onClick={() => setAnnStatus(ann, "published")}
                              style={{
                                padding: "7px 14px", borderRadius: 10, background: "rgba(16,185,129,0.08)",
                                border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#34d399",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
                            >
                              <Send size={12} /> Нийтлэх
                            </button>
                          )}
                          {ann.status === "published" && (
                            <button
                              onClick={() => setAnnStatus(ann, "closed")}
                              style={{
                                padding: "7px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)",
                                border: "1px solid rgba(245,158,11,0.2)", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#fbbf24",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.15)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; }}
                            >
                              <Clock size={12} /> Хаах
                            </button>
                          )}
                          <button
                            onClick={() => setDelAnn(ann)}
                            style={{
                              padding: "7px 10px", borderRadius: 10, background: "rgba(239,68,68,0.06)",
                              border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setViewAnn(ann)}
                          style={{
                            padding: "7px 14px", borderRadius: 10, background: "#1e293b",
                            border: "1px solid #334155", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                          <Eye size={12} /> Харах
                        </button>
                      )}
                    </div>
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