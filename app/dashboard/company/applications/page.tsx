"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wallet,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string; gradient: string }
> = {
  pending: {
    label: "Хүлээгдэж буй",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 100%)",
  },
  approved: {
    label: "Зөвшөөрөгдсөн",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    gradient: "linear-gradient(135deg,#d1fae5 0%,#ecfdf5 100%)",
  },
  rejected: {
    label: "Татгалзсан",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    gradient: "linear-gradient(135deg,#fee2e2 0%,#fef2f2 100%)",
  },
};

const TYPE_LABEL: Record<string, { label: string; emoji: string }> = {
  open: { label: "Нээлттэй", emoji: "🌐" },
  targeted: { label: "Хаалттай", emoji: "🔒" },
  rfq: { label: "Үнийн санал", emoji: "📊" },
};

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

export default function CompanyApplicationsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const router = useRouter();

  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/applications/mine?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setApps(d.applications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const fmtMoney = (v: any) => (v ? Number(v).toLocaleString() : null);

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
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .app-card {
          transition: all .25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.1) !important;
        }
        .app-card:hover .app-arrow {
          transform: translateX(4px);
        }
        .app-arrow {
          transition: transform .2s;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? 22 : 26,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Миний хүсэлтүүд
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            {apps.length === 0
              ? "Хүсэлт гаргаагүй байна"
              : `Нийт ${apps.length} хүсэлт гаргасан байна`}
          </p>
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
            gap: 6,
            fontSize: 13,
            fontFamily: "inherit",
            color: "#64748b",
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
            size={13}
            style={{
              animation: loading ? "spin 1s linear infinite" : undefined,
            }}
          />
          Шинэчлэх
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          flexWrap: "wrap",
          overflowX: isMobile ? "auto" : "visible",
        }}
      >
        {[
          { key: "all", label: "Бүгд", count: counts.all },
          {
            key: "pending",
            label: "Хүлээгдэж буй",
            count: counts.pending,
          },
          {
            key: "approved",
            label: "Зөвшөөрөгдсөн",
            count: counts.approved,
          },
          {
            key: "rejected",
            label: "Татгалзсан",
            count: counts.rejected,
          },
        ].map(({ key, label, count }) => {
          const active = filter === key;
          const sc = key === "all" ? null : STATUS_CFG[key];

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: active
                  ? sc
                    ? `${sc.color}10`
                    : "#e6f2fa"
                  : "white",
                color: active ? (sc?.color ?? "#0072BC") : "#64748b",
                border: active
                  ? `1.5px solid ${sc?.color ?? "#0072BC"}`
                  : "1.5px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {label}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 99,
                    lineHeight: "16px",
                    background: active ? (sc?.color ?? "#0072BC") : "#f1f5f9",
                    color: active ? "white" : "#64748b",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
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
            style={{
              color: "#0072BC",
              animation: "spin .8s linear infinite",
            }}
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
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FileText size={28} style={{ color: "#cbd5e1" }} />
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#475569",
              margin: "0 0 6px",
            }}
          >
            {filter === "all"
              ? "Хүсэлт байхгүй байна"
              : `${STATUS_CFG[filter]?.label ?? filter} төлөвт хүсэлт байхгүй`}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
              margin: "0 0 20px",
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Зарлал руу нэвтэрч "Хүсэлт илгээх" товчийг дарж оролцох боломжтой.
          </p>
          <button
            onClick={() => router.push("/dashboard/company/announcements")}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#0072BC,#3b9be0)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 6px 16px rgba(0,114,188,0.3)",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            Зарлалууд харах →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((app) => {
            const sc = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
            const tl = TYPE_LABEL[app.ann_type] ?? TYPE_LABEL.open;
            const isApproved = app.status === "approved";
            const isRejected = app.status === "rejected";
            const isPending = app.status === "pending";

            return (
              <div
                key={app.id}
                className="app-card"
                onClick={() =>
                  router.push(
                    `/dashboard/company/announcements?id=${app.announcement_id}`,
                  )
                }
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: isMobile ? "16px 14px" : "20px 22px",
                  border: "1px solid #e2e8f0",
                  borderLeft: `3px solid ${sc.color}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  cursor: "pointer",
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
                  {/* Status Icon */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: sc.gradient,
                      border: `1px solid ${sc.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isApproved && (
                      <CheckCircle2
                        size={22}
                        style={{ color: sc.color }}
                        strokeWidth={2.2}
                      />
                    )}
                    {isRejected && (
                      <XCircle
                        size={22}
                        style={{ color: sc.color }}
                        strokeWidth={2.2}
                      />
                    )}
                    {isPending && (
                      <Clock
                        size={22}
                        style={{ color: sc.color }}
                        strokeWidth={2.2}
                      />
                    )}
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top: type pill + status pill */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 99,
                          background: "#f8fafc",
                          color: "#475569",
                          border: "1px solid #e2e8f0",
                          letterSpacing: "0.02em",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>{tl.emoji}</span>
                        {tl.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 99,
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {sc.label}
                      </span>
                      {app.is_urgent && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                          }}
                        >
                          ⚡ Яаралтай
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: "0 0 8px",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                      }}
                    >
                      {app.announcement_title || "Тендер / Зарлал"}
                    </h3>

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap",
                        rowGap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Calendar size={11} />
                        Илгээсэн:{" "}
                        {new Date(app.created_at).toLocaleDateString("mn-MN")}
                      </span>
                      {(app.budget_from || app.budget_to) && (
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
                          {fmtMoney(app.budget_from)}
                          {app.budget_to
                            ? ` — ${fmtMoney(app.budget_to)}`
                            : ""}{" "}
                          {app.currency}
                        </span>
                      )}
                      {app.deadline && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Clock size={11} />
                          Дуусах:{" "}
                          {new Date(app.deadline).toLocaleDateString("mn-MN")}
                        </span>
                      )}
                      {app.category_name && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                          }}
                        >
                          📁 {app.category_name}
                        </span>
                      )}
                    </div>

                    {/* Approved message */}
                    {isApproved && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "linear-gradient(135deg,#d1fae5,#ecfdf5)",
                          border: "1px solid #a7f3d0",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{
                            color: "#059669",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#065f46",
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>Баяр хүргэе!</strong> Таны хүсэлтийг
                          зөвшөөрсөн байна.
                        </div>
                      </div>
                    )}

                    {/* Rejected reason */}
                    {isRejected && app.return_reason && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <AlertCircle
                          size={14}
                          style={{
                            color: "#dc2626",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#991b1b",
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>Татгалзсан шалтгаан:</strong>{" "}
                          {app.return_reason}
                        </div>
                      </div>
                    )}

                    {/* Pending hint */}
                    {isPending && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 11,
                          color: "#a16207",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Clock size={11} />
                        Админ таны хүсэлтийг хянаж байна
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div
                    style={{
                      flexShrink: 0,
                      paddingTop: 6,
                      display: isMobile ? "none" : "block",
                    }}
                  >
                    <ArrowRight
                      size={18}
                      className="app-arrow"
                      style={{ color: "#cbd5e1" }}
                    />
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
