"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Clock,
  X,
  Calendar,
  Wallet,
  FolderOpen,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Hash,
  Sparkles,
  Package,
  MapPin,
  TrendingUp,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    emoji: string;
    gradient: string;
    softBg: string;
  }
> = {
  open: {
    label: "Нээлттэй",
    color: "#0072BC",
    bg: "rgba(0,114,188,0.08)",
    softBg: "#e6f2fa",
    border: "rgba(0,114,188,0.2)",
    emoji: "🌐",
    gradient: "linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 50%,#ffffff 100%)",
  },
  targeted: {
    label: "Хаалттай",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    softBg: "#f3f0ff",
    border: "rgba(124,58,237,0.2)",
    emoji: "🔒",
    gradient: "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 50%,#ffffff 100%)",
  },
  rfq: {
    label: "Үнийн санал",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    softBg: "#fef9e7",
    border: "rgba(217,119,6,0.2)",
    emoji: "📊",
    gradient: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 50%,#ffffff 100%)",
  },
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

// HTML rendering helper — img, lists, etc-ийг зөв харуулна
function DescriptionContent({ html }: { html: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div className="ann-prose" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  return (
    <div className="ann-prose" style={{ whiteSpace: "pre-wrap" }}>
      {html}
    </div>
  );
}

// Section heading — minimalist
function Section({
  accent,
  Icon,
  title,
  children,
}: {
  accent: string;
  Icon?: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${accent}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {Icon ? (
            <Icon size={14} color={accent} />
          ) : (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: accent,
              }}
            />
          )}
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// Stat tile in detail header
function HeroStat({
  Icon,
  label,
  value,
  accent,
  isMobile,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: string;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        padding: isMobile ? "14px 12px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#94a3b8",
        }}
      >
        <Icon size={11} color="#94a3b8" />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: isMobile ? 13 : 14,
          fontWeight: 700,
          color: accent ?? "#0f172a",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    load();
  }, []);

  // Esc дарж хаах
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (bidModal && !bidSaving) setBidModal(false);
        else if (selected && !bidModal) setSelected(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, bidModal, bidSaving]);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    setSelected({ id, _loading: true });
    try {
      const res = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success && d.announcement) setSelected(d.announcement);
      else setSelected(null);
    } catch {
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
        setSelected(null);
      }, 2500);
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
    const matchQ =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const fmtMoney = (v: any) => (v ? Number(v).toLocaleString() : "—");
  const tc = selected
    ? (TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open)
    : TYPE_CFG.open;

  const daysLeft = selected?.deadline
    ? Math.ceil(
        (new Date(selected.deadline).getTime() - Date.now()) / 86_400_000,
      )
    : null;
  const isExpired = selected?.deadline && daysLeft !== null && daysLeft < 0;

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: isMobile ? "16px 8px" : "28px 20px",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        .ann-modal-body::-webkit-scrollbar { width: 8px; }
        .ann-modal-body::-webkit-scrollbar-track { background: transparent; }
        .ann-modal-body::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1); border-radius: 99px;
        }

        /* ── Prose for description HTML rendering ── */
        .ann-prose {
          font-size: 15px;
          color: #334155;
          line-height: 1.8;
          word-break: break-word;
        }
        .ann-prose > *:first-child { margin-top: 0; }
        .ann-prose > *:last-child { margin-bottom: 0; }
        .ann-prose p { margin: 0 0 14px; }
        .ann-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 14px;
          margin: 18px 0;
          display: block;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
        }
        .ann-prose ul, .ann-prose ol { padding-left: 24px; margin: 14px 0; }
        .ann-prose ul { list-style: disc; }
        .ann-prose ol { list-style: decimal; }
        .ann-prose li { margin: 6px 0; padding-left: 4px; }
        .ann-prose li::marker { color: #0072BC; font-weight: 700; }
        .ann-prose h1, .ann-prose h2, .ann-prose h3 {
          color: #0f172a; font-weight: 700; line-height: 1.35; margin: 22px 0 10px;
          letter-spacing: -0.01em;
        }
        .ann-prose h1 { font-size: 21px; }
        .ann-prose h2 { font-size: 18px; }
        .ann-prose h3 { font-size: 15px; }
        .ann-prose strong, .ann-prose b { font-weight: 700; color: #0f172a; }
        .ann-prose em, .ann-prose i { font-style: italic; }
        .ann-prose a {
          color: #0072BC; text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-thickness: 1px;
          font-weight: 500;
        }
        .ann-prose a:hover { color: #005a96; }
        .ann-prose blockquote {
          border-left: 3px solid #0072BC;
          margin: 16px 0;
          padding: 12px 18px;
          background: linear-gradient(90deg, #f0f7fc 0%, transparent 100%);
          border-radius: 0 12px 12px 0;
          color: #475569;
          font-style: italic;
        }
        .ann-prose pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          overflow-x: auto;
          font-size: 13px;
          margin: 16px 0;
          font-family: 'SF Mono', Menlo, monospace;
        }
        .ann-prose code {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
          font-family: 'SF Mono', Menlo, monospace;
          font-size: 0.92em;
          color: #be123c;
        }
        .ann-prose hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 22px 0;
        }
        .ann-prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
          font-size: 13px;
          border-radius: 8px;
          overflow: hidden;
        }
        .ann-prose th, .ann-prose td {
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          text-align: left;
        }
        .ann-prose th {
          background: #f8fafc;
          font-weight: 700;
          color: #0f172a;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: isMobile ? 22 : 30 }}>
        <h1
          style={{
            fontSize: isMobile ? 22 : 26,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Зарлалууд
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          Нийтлэгдсэн худалдан авалтын зарлалууд
        </p>
      </div>

      {/* ── Tabs + Search ── */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginBottom: 24,
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            flex: 1,
            minWidth: 0,
            paddingBottom: isMobile ? 4 : 0,
          }}
        >
          {TABS.map(({ key, label }) => {
            const t = key === "all" ? null : TYPE_CFG[key];
            const cnt = counts[key as keyof typeof counts];
            const active = typeF === key;
            return (
              <button
                key={key}
                onClick={() => setTypeF(key)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  border: active
                    ? `1.5px solid ${t?.color ?? "#0072BC"}`
                    : "1.5px solid #e2e8f0",
                  background: active ? `${t?.color ?? "#0072BC"}10` : "white",
                  color: active ? (t?.color ?? "#0072BC") : "#64748b",
                  transition: "all .15s",
                }}
              >
                {t && <span style={{ fontSize: 14 }}>{t.emoji}</span>}
                {label}
                {cnt > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      lineHeight: "16px",
                      background: active ? (t?.color ?? "#0072BC") : "#f1f5f9",
                      color: active ? "white" : "#64748b",
                    }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
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
                width: isMobile ? "100%" : 200,
                padding: "10px 14px 10px 36px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                outline: "none",
                background: "white",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#0072BC")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
              }
            />
          </div>
          <button
            onClick={load}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "white";
            }}
          >
            <RefreshCw
              size={14}
              style={{
                color: "#64748b",
                animation: loading ? "spin 1s linear infinite" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 80,
            gap: 12,
          }}
        >
          <Loader2
            size={20}
            style={{ color: "#0072BC", animation: "spin .8s linear infinite" }}
          />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>
            Ачаалж байна...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "white",
            borderRadius: 18,
            border: "1px solid #f1f5f9",
          }}
        >
          <FileText
            size={36}
            style={{
              color: "#cbd5e1",
              display: "block",
              margin: "0 auto 14px",
            }}
          />
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              margin: 0,
              fontWeight: 500,
            }}
          >
            {search
              ? "Хайлтад тохирох зарлал олдсонгүй"
              : "Зарлал байхгүй байна"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((a) => {
            const t = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
            const expired = a.deadline && new Date(a.deadline) < new Date();
            return (
              <div
                key={a.id}
                onClick={() => openDetail(a.id)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: isMobile ? "16px 14px" : "20px 22px",
                  border: "1px solid #e2e8f0",
                  borderLeft: `3px solid ${t.color}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition:
                    "transform .15s, box-shadow .15s, border-color .15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08)";
                  el.style.transform = "translateY(-2px)";
                  el.style.borderColor = t.border;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  el.style.transform = "translateY(0)";
                  el.style.borderColor = "#e2e8f0";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      flex: 1,
                      minWidth: 0,
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: t.softBg,
                        border: `1px solid ${t.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      {t.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: t.softBg,
                            color: t.color,
                            border: `1px solid ${t.border}`,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {t.label}
                        </span>
                        {a.is_urgent && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 99,
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            ⚡ Яаралтай
                          </span>
                        )}
                        {expired && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: 99,
                              background: "#f1f5f9",
                              color: "#64748b",
                            }}
                          >
                            Хугацаа дууссан
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: "0 0 6px",
                          lineHeight: 1.35,
                          letterSpacing: "-0.01em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          wordBreak: "break-word",
                        }}
                      >
                        {a.title}
                      </h3>
                      {a.description && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            margin: "0 0 10px",
                            lineHeight: 1.55,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: isMobile ? 2 : 1,
                            WebkitBoxOrient: "vertical" as const,
                          }}
                        >
                          {a.description
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()
                            .slice(0, 200)}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          flexWrap: "wrap",
                          rowGap: 4,
                        }}
                      >
                        {a.category_name && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FolderOpen size={11} />
                            {a.category_name}
                          </span>
                        )}
                        {(a.budget_from || a.budget_to) && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Wallet size={11} />
                            {fmtMoney(a.budget_from)}
                            {a.budget_to
                              ? ` — ${fmtMoney(a.budget_to)}`
                              : ""}{" "}
                            {a.currency}
                          </span>
                        )}
                        {a.deadline && (
                          <span
                            style={{
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: expired ? "#dc2626" : "#94a3b8",
                              fontWeight: expired ? 600 : 400,
                            }}
                          >
                            <Clock size={11} />
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: isMobile ? "row" : "column",
                      alignItems: isMobile ? "center" : "flex-end",
                      justifyContent: isMobile ? "space-between" : "flex-start",
                      gap: 4,
                      width: isMobile ? "100%" : "auto",
                      paddingTop: isMobile ? 10 : 0,
                      borderTop: isMobile ? "1px solid #f1f5f9" : "none",
                      marginTop: isMobile ? 4 : 0,
                    }}
                  >
                    <div
                      style={{
                        textAlign: isMobile ? "left" : "right",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          marginBottom: 2,
                        }}
                      >
                        {new Date(a.created_at).toLocaleDateString("mn-MN")}
                      </div>
                      {a.created_by_name && (
                        <div style={{ fontSize: 10, color: "#cbd5e1" }}>
                          {a.created_by_name}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: t.color,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: isMobile ? 0 : 6,
                      }}
                    >
                      Дэлгэрэнгүй →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ╔════════════════════════════════════════════════════════════╗
          ║   DETAIL MODAL                                             ║
          ╚════════════════════════════════════════════════════════════╝ */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="ann-modal-body"
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 760,
              background: "white",
              borderRadius: isMobile ? "24px 24px 0 0" : 24,
              boxShadow: "0 32px 80px rgba(15,23,42,0.4)",
              animation: isMobile
                ? "slideUp .35s cubic-bezier(0.34,1.3,0.64,1)"
                : "modalIn .25s cubic-bezier(0.34,1.3,0.64,1)",
              maxHeight: isMobile ? "94vh" : "92vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {detLoading || selected._loading ? (
              <div
                style={{
                  padding: "100px 40px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <Loader2
                  size={28}
                  style={{
                    color: "#0072BC",
                    animation: "spin .8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  Ачаалж байна...
                </span>
              </div>
            ) : (
              <>
                {/* ── HERO ── */}
                <div
                  style={{
                    position: "relative",
                    padding: isMobile ? "26px 20px 22px" : "36px 40px 28px",
                    background: tc.gradient,
                    borderBottom: `1px solid ${tc.border}`,
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Хаах"
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      width: 36,
                      height: 36,
                      background: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      borderRadius: 10,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .15s",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "white";
                      (e.currentTarget as HTMLElement).style.transform =
                        "rotate(90deg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(255,255,255,0.85)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "rotate(0deg)";
                    }}
                  >
                    <X size={16} style={{ color: "#475569" }} />
                  </button>

                  {/* Type ribbon */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px 6px 10px",
                      background: "white",
                      border: `1px solid ${tc.border}`,
                      borderRadius: 99,
                      marginBottom: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{tc.emoji}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: tc.color,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {tc.label}
                    </span>
                    {selected.announcement_number && (
                      <>
                        <span style={{ color: "#cbd5e1", fontSize: 11 }}>
                          ·
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "monospace",
                            fontWeight: 600,
                          }}
                        >
                          #{selected.announcement_number}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: isMobile ? 21 : 26,
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                      lineHeight: 1.25,
                      letterSpacing: "-0.02em",
                      paddingRight: 44,
                      wordBreak: "break-word",
                    }}
                  >
                    {selected.title}
                  </h2>

                  {/* Status pills */}
                  {(selected.is_urgent ||
                    isExpired ||
                    (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7)) && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginTop: 14,
                      }}
                    >
                      {selected.is_urgent && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "5px 12px",
                            borderRadius: 99,
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          ⚡ Яаралтай
                        </span>
                      )}
                      {isExpired ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "5px 12px",
                            borderRadius: 99,
                            background: "#f1f5f9",
                            color: "#64748b",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          ⏱ Хугацаа дууссан
                        </span>
                      ) : (
                        daysLeft !== null &&
                        daysLeft >= 0 &&
                        daysLeft <= 7 && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "5px 12px",
                              borderRadius: 99,
                              background: daysLeft <= 3 ? "#fff7ed" : "#fefce8",
                              color: daysLeft <= 3 ? "#c2410c" : "#a16207",
                              border:
                                daysLeft <= 3
                                  ? "1px solid #fed7aa"
                                  : "1px solid #fde68a",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            ⏳{" "}
                            {daysLeft === 0
                              ? "Өнөөдөр дуусна"
                              : `${daysLeft} өдөр үлдсэн`}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* ── STATS GRID ── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
                    gap: 1,
                    background: "#e2e8f0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ background: "white" }}>
                    <HeroStat
                      Icon={Calendar}
                      label="Дуусах огноо"
                      value={
                        selected.deadline
                          ? new Date(selected.deadline).toLocaleDateString(
                              "mn-MN",
                            )
                          : "—"
                      }
                      accent={
                        isExpired
                          ? "#dc2626"
                          : daysLeft !== null && daysLeft <= 3
                            ? "#ea580c"
                            : "#0f172a"
                      }
                      isMobile={isMobile}
                    />
                  </div>
                  <div style={{ background: "white" }}>
                    <HeroStat
                      Icon={Wallet}
                      label="Төсөв"
                      value={
                        selected.budget_from || selected.budget_to ? (
                          <span>
                            {fmtMoney(selected.budget_from)}
                            {selected.budget_to
                              ? ` — ${fmtMoney(selected.budget_to)}`
                              : ""}{" "}
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              {selected.currency}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )
                      }
                      isMobile={isMobile}
                    />
                  </div>
                  <div style={{ background: "white" }}>
                    <HeroStat
                      Icon={FolderOpen}
                      label="Категори"
                      value={selected.category_name ?? "—"}
                      isMobile={isMobile}
                    />
                  </div>
                  <div style={{ background: "white" }}>
                    <HeroStat
                      Icon={Eye}
                      label="Үзэлт"
                      value={String(selected.view_count ?? 0)}
                      isMobile={isMobile}
                    />
                  </div>
                </div>

                {/* ── BODY ── */}
                <div
                  style={{
                    padding: isMobile ? "26px 20px" : "32px 40px",
                    flex: 1,
                  }}
                >
                  {/* Description */}
                  {selected.description && (
                    <Section title="Тайлбар" accent={tc.color} Icon={FileText}>
                      <DescriptionContent html={selected.description} />
                    </Section>
                  )}

                  {/* Requirements */}
                  {selected.requirements && (
                    <Section title="Шаардлага" accent="#d97706" Icon={Sparkles}>
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg,#fefce8 0%,#fffbeb 100%)",
                          borderRadius: 14,
                          padding: isMobile ? "14px 16px" : "18px 20px",
                          border: "1px solid #fde68a",
                        }}
                      >
                        {selected.requirements
                          .split("\n")
                          .filter((l: string) => l.trim())
                          .map((line: string, i: number, arr: string[]) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                padding: "10px 0",
                                borderBottom:
                                  i < arr.length - 1
                                    ? "1px solid rgba(253,230,138,0.5)"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "#d97706",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  marginTop: 1,
                                }}
                              >
                                {i + 1}
                              </span>
                              <span
                                style={{
                                  fontSize: 14,
                                  lineHeight: 1.65,
                                  color: "#78350f",
                                  wordBreak: "break-word",
                                  flex: 1,
                                }}
                              >
                                {line}
                              </span>
                            </div>
                          ))}
                      </div>
                    </Section>
                  )}

                  {/* RFQ details */}
                  {selected.ann_type === "rfq" &&
                    (selected.rfq_quantity ||
                      selected.rfq_delivery_place ||
                      selected.rfq_specs ||
                      selected.rfq_delivery_date) && (
                      <Section
                        title="Үнийн санал — дэлгэрэнгүй"
                        accent="#d97706"
                        Icon={Package}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                            gap: 10,
                          }}
                        >
                          {selected.rfq_quantity && (
                            <div
                              style={{
                                background: "white",
                                border: "1px solid #fde68a",
                                borderLeft: "3px solid #d97706",
                                borderRadius: 12,
                                padding: "14px 16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 10,
                                  color: "#92400e",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                }}
                              >
                                <Package size={12} />
                                Тоо хэмжээ
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: "#78350f",
                                }}
                              >
                                {selected.rfq_quantity}{" "}
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: "#a16207",
                                    fontWeight: 500,
                                  }}
                                >
                                  {selected.rfq_unit}
                                </span>
                              </div>
                            </div>
                          )}
                          {selected.rfq_delivery_place && (
                            <div
                              style={{
                                background: "white",
                                border: "1px solid #a7f3d0",
                                borderLeft: "3px solid #10b981",
                                borderRadius: 12,
                                padding: "14px 16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 10,
                                  color: "#065f46",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                }}
                              >
                                <MapPin size={12} />
                                Хүргэлтийн газар
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#064e3b",
                                  wordBreak: "break-word",
                                }}
                              >
                                {selected.rfq_delivery_place}
                              </div>
                            </div>
                          )}
                          {selected.rfq_delivery_date && (
                            <div
                              style={{
                                background: "white",
                                border: "1px solid #bfdbfe",
                                borderLeft: "3px solid #3b82f6",
                                borderRadius: 12,
                                padding: "14px 16px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 10,
                                  color: "#1e40af",
                                  marginBottom: 6,
                                  fontWeight: 700,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                }}
                              >
                                <Calendar size={12} />
                                Хүргэлтийн огноо
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#1e3a8a",
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
                              marginTop: 10,
                              background: "white",
                              border: "1px solid #e2e8f0",
                              borderLeft: "3px solid #64748b",
                              borderRadius: 12,
                              padding: "14px 16px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#475569",
                                marginBottom: 8,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              🔧 Техникийн тодорхойлолт
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#334155",
                                lineHeight: 1.7,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {selected.rfq_specs}
                            </div>
                          </div>
                        )}
                      </Section>
                    )}

                  {/* Activity directions */}
                  {selected.activity_directions?.length > 0 && (
                    <Section
                      title="Үйл ажиллагааны чиглэл"
                      accent="#7c3aed"
                      Icon={TrendingUp}
                    >
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {selected.activity_directions.map((d: string) => (
                          <span
                            key={d}
                            style={{
                              fontSize: 12,
                              padding: "7px 14px",
                              borderRadius: 99,
                              background: "#f5f3ff",
                              color: "#6d28d9",
                              border: "1px solid #ddd6fe",
                              fontWeight: 600,
                            }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Author footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 18px",
                      borderRadius: 14,
                      background:
                        "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)",
                      border: "1px solid #e2e8f0",
                      gap: 12,
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minWidth: 0,
                      }}
                    >
                      {selected.created_by_name ? (
                        <>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 11,
                              background:
                                "linear-gradient(135deg,#0072BC,#3b9be0)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "white",
                              flexShrink: 0,
                              boxShadow: "0 2px 8px rgba(0,114,188,0.3)",
                            }}
                          >
                            {selected.created_by_name[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0f172a",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {selected.created_by_name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 1,
                              }}
                            >
                              Нийтэлсэн •{" "}
                              {new Date(selected.created_at).toLocaleDateString(
                                "mn-MN",
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>
                          Bodi Group
                        </span>
                      )}
                    </div>
                    {(selected.bid_count ?? 0) > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 99,
                          background: "white",
                          border: "1px solid #bae6fd",
                        }}
                      >
                        <Send size={11} color="#0072BC" />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#0072BC",
                          }}
                        >
                          {selected.bid_count} хүсэлт
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── STICKY FOOTER ── */}
                <div
                  style={{
                    position: "sticky",
                    bottom: 0,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    borderTop: "1px solid #e2e8f0",
                    padding: isMobile ? "14px 18px" : "18px 40px",
                    display: "flex",
                    gap: 10,
                    boxShadow: "0 -4px 14px rgba(0,0,0,0.04)",
                    paddingBottom: isMobile
                      ? "calc(14px + env(safe-area-inset-bottom))"
                      : 18,
                  }}
                >
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      flex: isMobile ? 1 : "0 0 auto",
                      padding: "13px 22px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      color: "#64748b",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "white";
                    }}
                  >
                    Хаах
                  </button>
                  <button
                    onClick={() => {
                      if (isExpired) return;
                      setBidModal(true);
                      setBidError("");
                    }}
                    disabled={isExpired}
                    style={{
                      flex: 1,
                      padding: "13px 26px",
                      borderRadius: 12,
                      border: "none",
                      background: isExpired
                        ? "#e2e8f0"
                        : "linear-gradient(135deg,#0072BC,#3b9be0)",
                      color: isExpired ? "#94a3b8" : "white",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: isExpired ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: isExpired
                        ? "none"
                        : "0 8px 20px rgba(0,114,188,0.35)",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpired) {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-2px)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 12px 28px rgba(0,114,188,0.45)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpired) {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(0)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 8px 20px rgba(0,114,188,0.35)";
                      }
                    }}
                  >
                    {isExpired ? (
                      "Хугацаа дууссан"
                    ) : (
                      <>
                        <Send size={15} />
                        Хүсэлт илгээх
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ╔════════════════════════════════════════════════════════════╗
          ║   BID MODAL                                                ║
          ╚════════════════════════════════════════════════════════════╝ */}
      {bidModal && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => !bidSaving && setBidModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 480,
              background: "white",
              borderRadius: isMobile ? "24px 24px 0 0" : 22,
              boxShadow: "0 32px 80px rgba(15,23,42,0.5)",
              animation: isMobile
                ? "slideUp .3s cubic-bezier(0.34,1.3,0.64,1)"
                : "modalIn .25s cubic-bezier(0.34,1.3,0.64,1)",
              maxHeight: "92vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {bidDone ? (
              // ── Success State ──
              <div
                style={{
                  padding: "60px 32px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 12px 32px rgba(16,185,129,0.4)",
                    animation: "successPop .5s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <CheckCircle2 size={48} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 6,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Хүсэлт илгээгдлээ!
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#64748b",
                      lineHeight: 1.55,
                      maxWidth: 320,
                    }}
                  >
                    Таны хүсэлтийг хүлээж авлаа. Админ хариуг тань удахгүй
                    мэдэгдэх болно.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: isMobile ? "22px 22px 18px" : "26px 28px 22px",
                    borderBottom: "1px solid #f1f5f9",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background:
                          "linear-gradient(135deg,#0072BC 0%,#3b9be0 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 8px 20px rgba(0,114,188,0.3)",
                      }}
                    >
                      <Send size={22} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#0f172a",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Хүсэлт гаргах
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selected.title}
                      </div>
                    </div>
                    <button
                      onClick={() => !bidSaving && setBidModal(false)}
                      disabled={bidSaving}
                      style={{
                        width: 34,
                        height: 34,
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        borderRadius: 10,
                        cursor: bidSaving ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: bidSaving ? 0.5 : 1,
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!bidSaving)
                          (e.currentTarget as HTMLElement).style.background =
                            "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        if (!bidSaving)
                          (e.currentTarget as HTMLElement).style.background =
                            "#f8fafc";
                      }}
                    >
                      <X size={16} style={{ color: "#64748b" }} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: isMobile ? "22px" : "24px 28px" }}>
                  {bidError && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <AlertCircle
                        size={16}
                        style={{
                          color: "#dc2626",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 13,
                          color: "#991b1b",
                          lineHeight: 1.5,
                        }}
                      >
                        {bidError}
                      </div>
                    </div>
                  )}

                  {/* Info card */}
                  <div
                    style={{
                      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                      border: "1px solid #bfdbfe",
                      borderRadius: 14,
                      padding: "14px 16px",
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontSize: 18, marginTop: 1 }}>💡</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#1e40af",
                        lineHeight: 1.55,
                      }}
                    >
                      Доорх мэдээлэл таны бүртгэлээс автоматаар илгээгдэнэ.
                      Админ нь танилцсаны дараа хариу мэдэгдэх болно.
                    </div>
                  </div>

                  {/* User info */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: "16px 18px",
                      border: "1px solid #f1f5f9",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Building2 size={12} />
                      Таны мэдээлэл
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          Icon: Building2,
                          label: "Байгууллага",
                          value: user?.company_name,
                        },
                        {
                          Icon: Hash,
                          label: "Нийлүүлэгчийн дугаар",
                          value: user?.supplier_number,
                        },
                        {
                          Icon: Mail,
                          label: "И-мэйл",
                          value: user?.email,
                        },
                        {
                          Icon: Phone,
                          label: "Утас",
                          value: user?.phone,
                        },
                      ]
                        .filter((r) => r.value)
                        .map((row) => {
                          const RowIcon = row.Icon;
                          return (
                            <div
                              key={row.label}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 8,
                                  background: "white",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <RowIcon size={13} color="#64748b" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#94a3b8",
                                    marginBottom: 2,
                                    fontWeight: 500,
                                  }}
                                >
                                  {row.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {row.value}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setBidModal(false)}
                      disabled={bidSaving}
                      style={{
                        flex: 1,
                        padding: "13px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "white",
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: bidSaving ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        opacity: bidSaving ? 0.5 : 1,
                      }}
                    >
                      Болих
                    </button>
                    <button
                      onClick={submitBid}
                      disabled={bidSaving}
                      style={{
                        flex: 2,
                        padding: "13px",
                        borderRadius: 12,
                        border: "none",
                        background: "linear-gradient(135deg,#0072BC,#3b9be0)",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: bidSaving ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 8px 20px rgba(0,114,188,0.35)",
                        opacity: bidSaving ? 0.85 : 1,
                        transition: "all .15s",
                      }}
                    >
                      {bidSaving ? (
                        <>
                          <Loader2
                            size={15}
                            style={{
                              animation: "spin .8s linear infinite",
                            }}
                          />
                          Илгээж байна...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Хүсэлт илгээх
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
