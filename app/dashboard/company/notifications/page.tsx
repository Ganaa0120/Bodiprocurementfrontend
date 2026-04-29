"use client";
import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCheck, X, Clock, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_ICON: Record<string, string> = {
  announcement: "📢",
  status: "✅",
  application: "📋",
  system: "🔔",
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

export default function CompanyNotificationsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;

  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/notifications/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setNotifs(d.notifications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});

    setNotifs(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAll = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});

    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const openNotif = (n: any) => {
    setSelected(n);
    if (!n.is_read) markRead(n.id);
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "16px 8px" : "28px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(80px); } to { opacity: 1; transform: translateY(0); } }

        .notif-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notif-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? 24 : 28, 
            fontWeight: 700, 
            color: "#0f172a", 
            margin: 0,
            letterSpacing: "-0.02em"
          }}>
            Мэдэгдэл
          </h1>
          <p style={{ fontSize: 14.5, color: "#64748b", marginTop: 6 }}>
            {unread > 0 
              ? `${unread} уншаагүй мэдэгдэл байна` 
              : "Бүх мэдэгдэл уншсан байна"}
          </p>
        </div>

        {unread > 0 && (
          <button 
            onClick={markAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#3b9be0",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <CheckCheck size={16} />
            Бүгдийг уншсан болгох
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <Loader2 size={32} style={{ color: "#3b9be0", animation: "spin 0.9s linear infinite", margin: "0 auto 20px" }} />
          <p style={{ color: "#64748b" }}>Мэдэгдэл ачаалж байна...</p>
        </div>
      ) : notifs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "100px 20px",
          background: "white",
          borderRadius: 20,
          border: "1px solid #f1f5f9",
        }}>
          <Bell size={52} style={{ color: "#e2e8f0", marginBottom: 16 }} />
          <p style={{ fontSize: 15.5, color: "#94a3b8" }}>Мэдэгдэл байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => openNotif(n)}
              className="notif-card"
              style={{
                background: "white",
                borderRadius: 18,
                padding: isMobile ? "16px 18px" : "18px 24px",
                border: `1px solid ${n.is_read ? "#f1f5f9" : "#bae0f3"}`,
                boxShadow: n.is_read ? "0 4px 15px rgba(0,0,0,0.04)" : "0 6px 20px rgba(0,114,188,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: n.is_read ? "#f8fafc" : "#e6f2fa",
                border: `2px solid ${n.is_read ? "#e2e8f0" : "#bae0f3"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}>
                {n.image_url ? (
                  <img 
                    src={n.image_url} 
                    alt="" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  TYPE_ICON[n.notification_type ?? "system"] ?? "🔔"
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: n.is_read ? 500 : 700,
                  color: "#0f172a",
                  marginBottom: 4,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {n.title || n.message}
                </div>

                {(n.message && n.title) && (
                  <div style={{
                    fontSize: 13.5,
                    color: "#475569",
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 6,
                  }}>
                    {n.message}
                  </div>
                )}

                <div style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}>
                  <Clock size={12} />
                  {new Date(n.created_at).toLocaleString("mn-MN", { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Status Indicator */}
              {!n.is_read && (
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#3b9be0",
                  boxShadow: "0 0 8px rgba(59,155,224,0.6)",
                  flexShrink: 0,
                }} />
              )}

              <ArrowRight size={18} style={{ color: "#94a3b8", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* ====================== DETAIL MODAL ====================== */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 560,
              background: "white",
              borderRadius: isMobile ? "20px 20px 0 0" : 24,
              boxShadow: "0 30px 80px rgba(15,23,42,0.35)",
              animation: isMobile ? "slideUp 0.35s ease" : "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              maxHeight: isMobile ? "94vh" : "88vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: isMobile ? "24px 24px 18px" : "32px 36px 24px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#e6f2fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}>
                {selected.image_url ? (
                  <img src={selected.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} 
                       onError={(e) => (e.currentTarget.style.display = "none")} />
                ) : (
                  TYPE_ICON[selected.notification_type ?? "system"] ?? "🔔"
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: isMobile ? 17 : 19,
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.35,
                  marginBottom: 8,
                }}>
                  {selected.title || selected.message}
                </div>
                <div style={{ fontSize: 12.5, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={13} />
                  {new Date(selected.created_at).toLocaleString("mn-MN")}
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} style={{ color: "#64748b" }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: isMobile ? "24px 24px" : "32px 36px" }}>
              {(selected.message || selected.body) && (
                <div style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "#334155",
                  wordBreak: "break-word",
                }}>
                  {selected.message && selected.message.trim().startsWith("<") ? (
                    <div dangerouslySetInnerHTML={{ __html: selected.message }} />
                  ) : (
                    <p style={{ margin: 0 }}>{selected.message || selected.body}</p>
                  )}
                </div>
              )}

              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 24,
                    padding: "12px 24px",
                    background: "#3b9be0",
                    color: "white",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Дэлгэрэнгүй харах <ArrowRight size={16} />
                </a>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: isMobile ? "16px 24px 24px" : "20px 36px 32px",
              borderTop: "1px solid #f1f5f9",
            }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#475569",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}