"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Clock, CheckCircle2, XCircle, AlertCircle, ClipboardList, DollarSign, Calendar, MessageSquare, Zap } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending: { label: "Хүлээгдэж буй", color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: Clock },
  reviewed: { label: "Хянагдсан", color: "#60a5fa", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", icon: AlertCircle },
  approved: { label: "Баталгаажсан", color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", icon: CheckCircle2 },
  rejected: { label: "Татгалзсан", color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", icon: XCircle },
};

export default function PersonApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/applications/mine?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setApps(d.applications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const TABS = [
    { key: "all", label: "Бүгд", icon: "📋" },
    { key: "pending", label: "Хүлээгдэж", icon: "⏳" },
    { key: "approved", label: "Баталгаажсан", icon: "✅" },
    { key: "rejected", label: "Татгалзсан", icon: "❌" },
  ];

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ClipboardList size={18} style={{ color: "#a5b4fc" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
            Миний хүсэлтүүд
          </h1>
          <p style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", margin: 0 }}>
            Нийт {apps.length} хүсэлт гаргасан байна
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" as const }}>
        {TABS.map(({ key, label, icon }) => {
          const sc = key === "all" ? null : STATUS_CFG[key];
          const cnt = counts[key as keyof typeof counts];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "9px 16px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: active
                  ? `1.5px solid ${sc?.color ?? "rgba(129,140,248,0.5)"}`
                  : "1px solid rgba(255,255,255,0.08)",
                background: active
                  ? `${sc?.color ?? "rgba(99,102,241,0.15)"}20`
                  : "rgba(255,255,255,0.03)",
                color: active ? (sc?.color ?? "#a5b4fc") : "rgba(148,163,184,0.6)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(148,163,184,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
              {cnt > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: active ? (sc?.color ?? "#6366f1") : "rgba(255,255,255,0.06)",
                    color: active ? "white" : "rgba(148,163,184,0.6)",
                  }}
                >
                  {cnt}
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
            gap: 12,
          }}
        >
          <Loader2 size={28} style={{ color: "#a5b4fc", animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 13, color: "rgba(148,163,184,0.5)" }}>Ачаалж байна...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center" as const,
            padding: "80px 20px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FileText size={28} style={{ color: "rgba(148,163,184,0.3)" }} />
          </div>
          <p style={{ fontSize: 14, color: "rgba(148,163,184,0.5)", margin: 0, fontWeight: 500 }}>
            Хүсэлт байхгүй байна
          </p>
          <p style={{ fontSize: 12, color: "rgba(148,163,184,0.3)", margin: "4px 0 0" }}>
            Танд одоогоор ямар ч хүсэлт байхгүй байна
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {filtered.map((app, idx) => {
            const sc = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
            const StatusIcon = sc.icon;
            return (
              <div
                key={app.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 20,
                  padding: "20px 22px",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderLeft: `3px solid ${sc.color}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4)`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = `${sc.color}40`;
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Status Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <StatusIcon size={22} style={{ color: sc.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title & Status */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.9)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {app.announcement_title || "Тендер"}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 99,
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <StatusIcon size={10} />
                        {sc.label}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" as const, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(148,163,184,0.5)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Calendar size={11} />
                        {new Date(app.created_at).toLocaleDateString("mn-MN")}
                      </span>
                      {app.price_offer && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#34d399",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            background: "rgba(16,185,129,0.08)",
                            padding: "2px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(16,185,129,0.2)",
                          }}
                        >
                          <DollarSign size={11} />
                          {Number(app.price_offer).toLocaleString()} ₮
                        </span>
                      )}
                    </div>

                    {/* Note */}
                    {app.note && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.55)",
                          margin: "6px 0 0",
                          lineHeight: 1.5,
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        <MessageSquare size={12} style={{ color: "rgba(148,163,184,0.4)", flexShrink: 0, marginTop: 2 }} />
                        {app.note}
                      </div>
                    )}

                    {/* Return reason */}
                    {app.return_reason && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.15)",
                          fontSize: 12,
                          color: "#fca5a5",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        <AlertCircle size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <strong style={{ color: "#f87171" }}>Буцаасан шалтгаан: </strong>
                          {app.return_reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Status Icon (large) */}
                  <div style={{ flexShrink: 0, opacity: 0.6 }}>
                    <StatusIcon size={24} style={{ color: sc.color }} />
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