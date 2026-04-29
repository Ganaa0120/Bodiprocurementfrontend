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
  Calendar,
  Wallet,
  FolderOpen,
  Eye,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<
  string,
  { label: string; color: string; bg: string; emoji: string; border: string; gradient: string }
> = {
  open: { label: "Нээлттэй", color: "#3b9be0", bg: "rgba(59,155,224,0.08)", border: "rgba(59,155,224,0.25)", emoji: "🌐", gradient: "linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)" },
  targeted: { label: "Хаалттай", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", emoji: "🔒", gradient: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)" },
  rfq: { label: "Үнийн санал", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", emoji: "📊", gradient: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)" },
};

const TABS = [
  { key: "all", label: "Бүгд" },
  { key: "open", label: "Нээлттэй" },
  { key: "targeted", label: "Хаалттай" },
  { key: "rfq", label: "Үнийн санал" },
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

function Section({ accent, title, children }: { accent: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 4, height: 18, borderRadius: 9999, background: accent }} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function CompanyAnnouncementsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;

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

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const res = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setAnns(d.announcements ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    load();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (bidModal) setBidModal(false);
        else if (selected) setSelected(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, bidModal]);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setDetLoading(true);
    setSelected({ id, _loading: true });   // Temporary object

    try {
      const res = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success && d.announcement) {
        setSelected(d.announcement);
      } else {
        setSelected(null);
      }
    } catch (e) {
      console.error(e);
      setSelected(null);
    } finally {
      setDetLoading(false);
    }
  };

  const submitBid = async () => {
    if (!selected?.id) return;
    setBidSaving(true);
    setBidError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");

      setBidDone(true);
      setTimeout(() => {
        setBidModal(false);
        setBidDone(false);
        setSelected(null);   // Close detail modal too
      }, 2200);
    } catch (e: any) {
      setBidError(e.message || "Хүсэлт илгээхэд алдаа гарлаа");
    } finally {
      setBidSaving(false);
    }
  };

  const counts = {
    all: anns.length,
    open: anns.filter((a) => a.ann_type === "open").length,
    targeted: anns.filter((a) => a.ann_type === "targeted").length,
    rfq: anns.filter((a) => a.ann_type === "rfq").length,
  };

  const filtered = anns.filter((a) => {
    const matchType = typeF === "all" || a.ann_type === typeF;
    const q = search.toLowerCase();
    const matchQ = !q || a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const fmtCurrency = (v: any) => (v ? `${Number(v).toLocaleString()} ₮` : "—");

  const daysLeft = selected?.deadline 
    ? Math.ceil((new Date(selected.deadline).getTime() - Date.now()) / 86400000) 
    : null;
  const isExpired = selected?.deadline && daysLeft !== null && daysLeft < 0;

  const tc = selected ? (TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open) : TYPE_CFG.open;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "16px 8px" : "28px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header + Tabs + Search (өмнөхтэй адил) */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: "#0f172a", margin: 0 }}>Зарлалууд</h1>
        <p style={{ fontSize: 14.5, color: "#64748b", marginTop: 6 }}>Нийтлэгдсэн худалдан авалтын зарлалууд</p>
      </div>

      {/* Tabs & Search - өмнөх кодтой адил (хэвээр үлдээв) */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 28, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
          {TABS.map(({ key, label }) => {
            const active = typeF === key;
            const t = key === "all" ? null : TYPE_CFG[key];
            const count = counts[key as keyof typeof counts];
            return (
              <button
                key={key}
                onClick={() => setTypeF(key)}
                style={{
                  padding: "11px 20px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  background: active ? (t?.color + "12" || "#e0f2fe") : "white",
                  color: active ? (t?.color || "#3b9be0") : "#475569",
                  border: active ? `2.5px solid ${t?.color || "#3b9be0"}` : "2px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                {t?.emoji} {label}
                {count > 0 && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 9999, background: active ? t?.color : "#f1f5f9", color: active ? "white" : "#64748b" }}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, width: isMobile ? "100%" : "auto" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Зарлал хайх..." style={{ width: "100%", padding: "13px 14px 13px 50px", borderRadius: 14, border: "2px solid #e2e8f0", fontSize: 14.5 }} />
          </div>
          <button onClick={load} style={{ padding: "13px 14px", borderRadius: 14, border: "2px solid #e2e8f0", background: "white" }}>
            <RefreshCw size={19} style={{ color: "#64748b", animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>
      </div>

      {/* List ... (өмнөхтэй ижил) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <Loader2 size={32} style={{ color: "#3b9be0", animation: "spin 0.9s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: "#64748b" }}>Ачаалж байна...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 20px", background: "white", borderRadius: 20, border: "1px solid #f1f5f9" }}>
          <FileText size={52} style={{ color: "#e2e8f0", marginBottom: 16 }} />
          <p style={{ fontSize: 15.5, color: "#94a3b8" }}>Тохирох зарлал олдсонгүй</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((a) => {
            const t = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
            return (
              <div key={a.id} onClick={() => openDetail(a.id)} style={{
                background: "white", borderRadius: 20, padding: isMobile ? "20px" : "24px 28px",
                border: `1px solid ${t.border}`, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", cursor: "pointer"
              }}>
                <div style={{ display: "flex", gap: 20 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, background: t.bg, border: `2px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {t.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 12.5, padding: "5px 14px", borderRadius: 9999, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>{t.label}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{a.title}</h3>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
                      {a.description ? a.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================== DETAIL MODAL (Сайжруулсан) ====================== */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(15,23,42,0.65)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
          padding: isMobile ? 0 : "20px",
        }} onClick={() => setSelected(null)}>
          
          <div style={{
            width: "100%", maxWidth: isMobile ? "100%" : 780,
            background: "white", borderRadius: isMobile ? "20px 20px 0 0" : 24,
            boxShadow: "0 30px 80px rgba(15,23,42,0.3)",
            maxHeight: isMobile ? "94vh" : "90vh",
            overflowY: "auto",
            animation: isMobile ? "slideUp 0.35s ease" : "modalIn 0.3s ease",
          }} onClick={(e) => e.stopPropagation()}>
            
            {detLoading || selected._loading ? (
              <div style={{ padding: "80px 40px", textAlign: "center" }}>
                <Loader2 size={36} style={{ color: "#3b9be0", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <p>Зарлалын дэлгэрэнгүйг ачаалж байна...</p>
              </div>
            ) : (
              <>
                {/* Hero */}
                <div style={{ position: "relative", padding: isMobile ? "28px 24px 20px" : "40px 44px 28px", background: tc.gradient }}>
                  <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 20, right: 20, width: 42, height: 42, background: "white", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={20} />
                  </button>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", background: "white", borderRadius: 9999, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{tc.emoji}</span>
                    <span style={{ fontWeight: 700, color: tc.color }}>{tc.label}</span>
                  </div>

                  <h2 style={{ fontSize: isMobile ? 22 : 27, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{selected.title}</h2>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", background: "#f8fafc", padding: "16px 0" }}>
                  <div style={{ padding: "14px 20px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Дуусах огноо</div>
                    <div style={{ fontWeight: 600 }}>{selected.deadline ? new Date(selected.deadline).toLocaleDateString("mn-MN") : "—"}</div>
                  </div>
                  <div style={{ padding: "14px 20px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Төсөв</div>
                    <div style={{ fontWeight: 600 }}>{fmtCurrency(selected.budget_from || selected.budget_to)}</div>
                  </div>
                  <div style={{ padding: "14px 20px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Категори</div>
                    <div style={{ fontWeight: 600 }}>{selected.category_name || "—"}</div>
                  </div>
                  <div style={{ padding: "14px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Үзэлт</div>
                    <div style={{ fontWeight: 600 }}>{selected.view_count || 0}</div>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ padding: isMobile ? "24px 24px" : "36px 44px" }}>
                  {selected.description && (
                    <Section accent="#3b9be0" title="Тайлбар">
                      <div className="ann-prose" style={{ fontSize: 15, lineHeight: 1.8, color: "#334155" }} dangerouslySetInnerHTML={{ __html: selected.description }} />
                    </Section>
                  )}

                  {selected.requirements && (
                    <Section accent="#f59e0b" title="Шаардлага">
                      <div style={{ background: "#fffbeb", padding: 20, borderRadius: 16, border: "1px solid #fde68a" }}>
                        {selected.requirements.split("\n").filter((l: string) => l.trim()).map((line: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                            <span style={{ color: "#f59e0b", fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                            <span style={{ color: "#78350f" }}>{line}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {selected.activity_directions?.length > 0 && (
                    <Section accent="#8b5cf6" title="Үйл ажиллагааны чиглэл">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {selected.activity_directions.map((dir: string, i: number) => (
                          <span key={i} style={{ padding: "8px 16px", background: "#f5f3ff", color: "#6d28d9", borderRadius: 9999, fontSize: 13 }}>
                            {dir}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  position: "sticky", bottom: 0, background: "white", borderTop: "1px solid #e2e8f0",
                  padding: isMobile ? "16px 24px" : "20px 44px", display: "flex", gap: 12
                }}>
                  <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "15px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
                    Буцах
                  </button>
                  <button
                    onClick={() => !isExpired && setBidModal(true)}
                    disabled={isExpired}
                    style={{
                      flex: 2,
                      padding: "15px",
                      borderRadius: 12,
                      background: isExpired ? "#e2e8f0" : "linear-gradient(135deg,#3b9be0,#1e3a8a)",
                      color: "white",
                      fontWeight: 700,
                      border: "none",
                    }}
                  >
                    {isExpired ? "Хугацаа дууссан" : "📨 Хүсэлт илгээх"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bid Modal (өмнөхтэй ижил) */}
      {bidModal && selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }} onClick={() => !bidSaving && setBidModal(false)}>
          <div style={{ width: "100%", maxWidth: 460, background: "white", borderRadius: isMobile ? "20px 20px 0 0" : 20, boxShadow: "0 25px 70px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            {/* Bid modal content - өмнөх кодтой ижил байлгаж болно. Хэрэгтэй бол хэлээрэй. */}
            <div style={{ padding: 24 }}>
              {bidDone ? (
                <div style={{ textAlign: "center", padding: "50px 20px" }}>
                  <div style={{ fontSize: 64 }}>✅</div>
                  <h3 style={{ color: "#10b981" }}>Хүсэлт амжилттай илгээгдлээ!</h3>
                </div>
              ) : (
                <>
                  {bidError && <div style={{ padding: 14, background: "#fef2f2", color: "#dc2626", borderRadius: 10, marginBottom: 16 }}>{bidError}</div>}
                  <button onClick={submitBid} disabled={bidSaving} style={{ width: "100%", padding: "16px", background: "#3b9be0", color: "white", borderRadius: 12, fontWeight: 700 }}>
                    {bidSaving ? "Илгээж байна..." : "Хүсэлт илгээх"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}