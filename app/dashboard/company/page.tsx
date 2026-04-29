"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "Хүлээгдэж буй", color: "#f59e0b", bg: "#fffbeb" },
  reviewed: { label: "Хянагдсан",     color: "#2563eb", bg: "#eff6ff" },
  approved: { label: "Баталгаажсан",  color: "#10b981", bg: "#ecfdf5" },
  rejected: { label: "Татгалзсан",    color: "#ef4444", bg: "#fef2f2" },
};

function Badge({ status }: { status: string }) {
  const c = STATUS[status] ?? STATUS.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 12px", borderRadius: 9999,
      fontSize: 11.5, fontWeight: 600,
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}30`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
      {c.label}
    </span>
  );
}

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

export default function CompanyDashboard() {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w >= 640 && w < 1024;

  const [user, setUser] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const refreshStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/organizations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && (data.organization || data.user)) {
        const fresh = data.organization || data.user;
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updated = { ...stored, status: fresh.status, return_reason: fresh.return_reason };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }
    } catch {}
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchApps();
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000);
    window.addEventListener("focus", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);

  const fetchApps = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/applications/mine?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.applications || [];
        setApps(list);
        setStats({
          total: data.pagination?.total || list.length,
          pending: list.filter((a: any) => a.status === "pending").length,
          approved: list.filter((a: any) => a.status === "approved").length,
          rejected: list.filter((a: any) => a.status === "rejected").length,
        });
      }
    } catch {}
    finally { setLoading(false); }
  };

  const s = user?.status;
  const isNew = s === "new";
  const isActive = s === "active" || s === "approved";
  const isReturned = s === "returned";

  const STAT_CARDS = [
    { label: "Нийт хүсэлт",   value: stats.total,    icon: FileText,    color: "#3b9be0", bg: "rgba(59,155,224,0.08)" },
    { label: "Хүлээгдэж буй", value: stats.pending,  icon: Clock,       color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { label: "Баталгаажсан",  value: stats.approved, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
    { label: "Татгалзсан",    value: stats.rejected, icon: XCircle,     color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  ];

  const QUICK = [
    { href: "/dashboard/company/applications",  icon: "📋", label: "Хүсэлтүүд", desc: "Бүх хүсэлтээ удирдах" },
    { href: "/dashboard/company/notifications", icon: "🔔", label: "Мэдэгдэл",  desc: "Шинэ мэдэгдлүүд" },
    { href: "/dashboard/company/profile",       icon: "🏢", label: "Профайл",   desc: "Байгууллагын мэдээлэл" },
  ];

  const statGrid = isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)";

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "0 8px" : "0 12px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, letterSpacing: "0.5px", fontWeight: 500 }}>
            БАЙГУУЛЛАГЫН ХЯНАХ САМБАР
          </p>
          <h1 style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 700,
            color: "#0f172a",
            margin: "8px 0 4px",
            letterSpacing: "-0.03em",
          }}>
            Сайн байна уу, {user?.company_name?.split(" ")[0] || "Байгууллага"}?
          </h1>
          {user?.supplier_number && (
            <p style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
              {user.supplier_number}
            </p>
          )}
        </div>

        <div style={{
          padding: "8px 16px",
          borderRadius: 9999,
          background: isActive ? "rgba(16,185,129,0.1)" : isReturned ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
          color: isActive ? "#10b981" : isReturned ? "#ef4444" : "#f59e0b",
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: `1px solid ${isActive ? "#4ade80" : isReturned ? "#f87171" : "#fbbf24"}30`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isActive ? "#4ade80" : isReturned ? "#f87171" : "#fbbf24",
            animation: (isNew || s === "pending") ? "pulse 2s infinite" : "none",
          }} />
          {isActive ? "Баталгаажсан" : isReturned ? "Буцаагдсан" : isNew ? "Бүртгэл үүсгэх" : "Хянагдаж байна"}
        </div>
      </div>

      {/* Status Banners */}
      {(isReturned || isNew || s === "pending") && (
        <div style={{ marginBottom: 24 }}>
          {isReturned && (
            <Link href="/dashboard/company/profile" style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", border: "1px solid #fecaca", borderRadius: 16,
                padding: 18, display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 4px 20px rgba(239,68,68,0.08)",
              }}>
                <div style={{ fontSize: 28 }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "#dc2626", margin: 0 }}>Бүртгэл буцаагдсан байна</p>
                  {user?.return_reason && <p style={{ margin: "4px 0 0", color: "#ef4444", fontSize: 13 }}>{user.return_reason}</p>}
                </div>
                <ArrowRight size={20} style={{ color: "#dc2626" }} />
              </div>
            </Link>
          )}

          {isNew && (
            <Link href="/dashboard/company/profile" style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", border: "1px solid #bae6fd", borderRadius: 16,
                padding: 18, display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 4px 20px rgba(59,155,224,0.08)",
              }}>
                <div style={{ fontSize: 28 }}>📝</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "#0369a1", margin: 0 }}>Байгууллагын мэдээллээ бөглөнө үү</p>
                  <p style={{ margin: "4px 0 0", color: "#0ea5e9", fontSize: 13 }}>Бүртгэлээ дуусгаж баталгаажуулалт авна уу</p>
                </div>
                <ArrowRight size={20} style={{ color: "#3b9be0" }} />
              </div>
            </Link>
          )}

          {s === "pending" && (
            <div style={{
              background: "white", border: "1px solid #fde68a", borderRadius: 16,
              padding: 18, display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ fontSize: 28 }}>⏳</div>
              <div>
                <p style={{ fontWeight: 600, color: "#92400e", margin: 0 }}>Бүртгэл хянагдаж байна</p>
                <p style={{ margin: "4px 0 0", color: "#d97706", fontSize: 13 }}>
                  Таны мэдээллийг администратор хянаж байна. Удахгүй мэдэгдэл ирнэ.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: statGrid, gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }, index) => (
          <div
            key={index}
            style={{
              background: "white",
              border: "1px solid #f1f5f9",
              borderRadius: 18,
              padding: isMobile ? "18px 20px" : "22px 24px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.04)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={22} style={{ color }} />
              </div>
              <TrendingUp size={18} style={{ color: "#e2e8f0" }} />
            </div>

            <p style={{
              fontSize: isMobile ? 28 : 32,
              fontWeight: 700,
              color: "#0f172a",
              margin: "16px 0 4px",
            }}>
              {loading ? "—" : value.toLocaleString()}
            </p>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "280px 1fr", gap: 20 }}>
        
        {/* Progress / Summary */}
        <div style={{
          background: "white",
          border: "1px solid #f1f5f9",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Хүсэлтийн дүн шинжилгээ</p>
          
          {[
            { label: "Нийт хүсэлт", value: stats.total, color: "#3b9be0" },
            { label: "Хүлээгдэж буй", value: stats.pending, color: "#f59e0b" },
            { label: "Баталгаажсан", value: stats.approved, color: "#10b981" },
            { label: "Татгалзсан", value: stats.rejected, color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{value}</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(value / Math.max(stats.total, 1)) * 100}%`,
                  background: color,
                  borderRadius: 9999,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div style={{
          background: "white",
          border: "1px solid #f1f5f9",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 6px 24px rgba(0,0,0,0.04)",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Сүүлийн хүсэлтүүд</p>
              <p style={{ fontSize: 12, color: "#64748b" }}>Хамгийн сүүлд илгээсэн хүсэлтүүд</p>
            </div>
            <Link href="/dashboard/company/applications" style={{
              fontSize: 13, color: "#3b9be0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
            }}>
              Бүгдийг харах <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ width: 24, height: 24, border: "3px solid #e2e8f0", borderTopColor: "#3b9be0", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto" }} />
            </div>
          ) : apps.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <FileText size={36} style={{ color: "#cbd5e1", marginBottom: 12 }} />
              <p style={{ color: "#94a3b8" }}>Хүсэлт байхгүй байна</p>
            </div>
          ) : (
            apps.slice(0, 5).map((app, i) => (
              <div
                key={app.id}
                style={{
                  padding: "16px 24px",
                  borderBottom: i < apps.length - 1 ? "1px solid #f8fafc" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `hsl(${(i * 55) % 360}, 70%, 96%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: `hsl(${(i * 55) % 360}, 60%, 45%)`,
                }}>
                  {app.announcement_title?.[0] || "T"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: 14, color: "#0f172a" }}>
                    {app.announcement_title || "Тендер"}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {new Date(app.created_at).toLocaleDateString("mn-MN")} 
                    {app.price_offer && ` • ${Number(app.price_offer).toLocaleString()} ₮`}
                  </p>
                </div>

                <Badge status={app.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>Түргэн үйлдлүүд</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 14 }}>
          {QUICK.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white",
                border: "1px solid #f1f5f9",
                borderRadius: 16,
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b9be0";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(59,155,224,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#f1f5f9";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14.5, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.desc}</p>
                </div>
                <ChevronRight size={18} style={{ marginLeft: "auto", color: "#94a3b8" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}