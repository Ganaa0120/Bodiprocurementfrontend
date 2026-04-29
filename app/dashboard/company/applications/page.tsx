"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "Хүлээгдэж буй", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  reviewed: { label: "Хянагдсан",     color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  approved: { label: "Баталгаажсан",  color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  rejected: { label: "Татгалзсан",    color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
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

  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/applications/mine?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setApps(d.applications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" 
    ? apps 
    : apps.filter(a => a.status === filter);

  const totalCounts = {
    all: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    approved: apps.filter(a => a.status === "approved").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "16px 8px" : "28px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .app-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .app-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: isMobile ? 24 : 28, 
          fontWeight: 700, 
          color: "#0f172a", 
          margin: 0,
          letterSpacing: "-0.02em"
        }}>
          Миний хүсэлтүүд
        </h1>
        <p style={{ fontSize: 14.5, color: "#64748b", marginTop: 6 }}>
          Нийт {apps.length} хүсэлт гаргасан байна
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 28,
        flexWrap: "wrap",
      }}>
        {[
          { key: "all",      label: "Бүгд", count: totalCounts.all },
          { key: "pending",  label: "Хүлээгдэж буй", count: totalCounts.pending },
          { key: "approved", label: "Баталгаажсан", count: totalCounts.approved },
          { key: "rejected", label: "Татгалзсан", count: totalCounts.rejected },
        ].map(({ key, label, count }) => {
          const active = filter === key;
          const sc = key === "all" ? null : STATUS_CFG[key];

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "11px 20px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                background: active 
                  ? (sc?.color + "12" || "#e0f2fe") 
                  : "white",
                color: active 
                  ? (sc?.color || "#3b9be0") 
                  : "#475569",
                border: active 
                  ? `2.5px solid ${sc?.color || "#3b9be0"}` 
                  : "2px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
              <span style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 9999,
                background: active ? (sc?.color || "#3b9be0") : "#f1f5f9",
                color: active ? "white" : "#64748b",
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <Loader2 size={32} style={{ color: "#3b9be0", animation: "spin 0.9s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: "#64748b", fontSize: 15 }}>Хүсэлтүүдийг ачаалж байна...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "100px 20px",
          background: "white",
          borderRadius: 20,
          border: "1px solid #f1f5f9",
        }}>
          <FileText size={52} style={{ color: "#e2e8f0", marginBottom: 16 }} />
          <p style={{ fontSize: 15.5, color: "#94a3b8" }}>Хүсэлт байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((app) => {
            const sc = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
            const isApproved = app.status === "approved";
            const isRejected = app.status === "rejected";
            const isPending = app.status === "pending";

            return (
              <div
                key={app.id}
                className="app-card"
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: isMobile ? "20px 20px" : "24px 28px",
                  border: `1px solid ${sc.border}`,
                  borderLeft: `4px solid ${sc.color}`,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  {/* Status Icon */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: sc.bg,
                    border: `2px solid ${sc.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isApproved && <CheckCircle2 size={26} style={{ color: sc.color }} />}
                    {isRejected && <XCircle size={26} style={{ color: sc.color }} />}
                    {isPending && <Clock size={26} style={{ color: sc.color }} />}
                  </div>

                  {/* Main Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <h3 style={{
                        fontSize: 16.5,
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        flex: 1,
                        wordBreak: "break-word",
                      }}>
                        {app.announcement_title || "Тендер / Зарлал"}
                      </h3>
                      <span style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: "6px 14px",
                        borderRadius: 9999,
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                        whiteSpace: "nowrap",
                      }}>
                        {sc.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13.5, color: "#64748b", marginBottom: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={14} /> {new Date(app.created_at).toLocaleDateString("mn-MN")}
                      </span>
                      {app.price_offer && (
                        <span>💰 {Number(app.price_offer).toLocaleString()} ₮</span>
                      )}
                    </div>

                    {app.note && (
                      <p style={{
                        fontSize: 14,
                        color: "#475569",
                        lineHeight: 1.6,
                        margin: "8px 0 0",
                        padding: "10px 14px",
                        background: "#f8fafc",
                        borderRadius: 10,
                      }}>
                        {app.note}
                      </p>
                    )}

                    {app.return_reason && (
                      <div style={{
                        marginTop: 12,
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        fontSize: 13.5,
                      }}>
                        <strong>Буцаасан шалтгаан:</strong> {app.return_reason}
                      </div>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div style={{ flexShrink: 0, paddingTop: 8 }}>
                    <ArrowRight size={20} style={{ color: "#94a3b8" }} />
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