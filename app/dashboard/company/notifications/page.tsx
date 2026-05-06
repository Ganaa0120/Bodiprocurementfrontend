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
  const [fullImage, setFullImage] = useState<string | null>(null);

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

      {selected && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center",
      padding: isMobile ? 0 : "24px",
      animation: "fadeIn 0.2s ease",
    }}
    onClick={() => setSelected(null)}
  >
    <div
      style={{
        width: "100%",
        maxWidth: isMobile ? "100%" : 560,
        background: "white",
        borderRadius: isMobile ? "28px 28px 0 0" : 28,
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        animation: isMobile ? "slideUp 0.35s cubic-bezier(0.2,0.9,0.4,1.1)" : "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        maxHeight: isMobile ? "90vh" : "85vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header - Small icon only */}
      <div
        style={{
          padding: isMobile ? "24px 24px 20px" : "28px 28px 20px",
          borderBottom: "1px solid #f0f2f5",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "linear-gradient(135deg, #ffffff, #fafbfc)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {TYPE_ICON[selected.notification_type ?? "system"] ?? "🔔"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? 16 : 17,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.35,
              marginBottom: 6,
              letterSpacing: "-0.3px",
            }}
          >
            {selected.title || "Мэдэгдэл"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} />
              {new Date(selected.created_at).toLocaleString("mn-MN")}
            </span>
            {selected.notification_type && (
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 8px",
                  borderRadius: 30,
                  background: "#f1f5f9",
                  color: "#475569",
                }}
              >
                {selected.notification_type === "announcement"
                  ? "Зарлал"
                  : selected.notification_type === "system"
                  ? "Систем"
                  : "Мэдэгдэл"}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setSelected(null)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#f1f5f9",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <X size={15} style={{ color: "#64748b" }} />
        </button>
      </div>

      {/* Modal Body - Image placed here */}
      <div
        style={{
          padding: isMobile ? "20px 24px" : "24px 28px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* ✅ Image in body - Click to open fullscreen modal (NOT blank tab) */}
        {selected.image_url && (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 16,
              overflow: "hidden",
              background: "#f8fafc",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              // ✅ Open fullscreen modal instead of blank tab
              setFullImage(selected.image_url);
            }}
          >
            <img
              src={selected.image_url}
              alt=""
              style={{
                width: "100%",
                maxHeight: 280,
                objectFit: "contain",
                display: "block",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.padding = "40px";
                  parent.innerHTML = "🖼️ Зураг олдсонгүй";
                  parent.style.color = "#94a3b8";
                  parent.style.fontSize = "13px";
                }
              }}
            />
            {/* Zoom hint */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "rgba(0,0,0,0.5)",
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: 10,
                color: "white",
                pointerEvents: "none",
              }}
            >
              🔍 Томруулах
            </div>
          </div>
        )}

        {/* Message Content */}
        {(selected.message || selected.body) && (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "#334155",
              wordBreak: "break-word",
            }}
            className="notification-content"
          >
            {selected.message && selected.message.trim().startsWith("<") ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: selected.message
                    .replace(/<img/g, '<img style="max-width:100%; border-radius:12px; margin:12px 0; box-shadow:0 2px 8px rgba(0,0,0,0.08); cursor:pointer;"')
                    .replace(/<a/g, '<a style="color:#4f46e5; text-decoration:underline;" target="_blank"'),
                }}
              />
            ) : (
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {selected.message || selected.body}
              </p>
            )}
          </div>
        )}

        {/* Call to Action Button */}
        {selected.link && (
          <div style={{ marginTop: 28 }}>
            <a
              href={selected.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "12px 24px",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "white",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.3)";
              }}
            >
              Дэлгэрэнгүй харах
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div
        style={{
          padding: isMobile ? "16px 24px 24px" : "20px 28px 28px",
          borderTop: "1px solid #f0f2f5",
          background: "#fafbfc",
        }}
      >
        <button
          onClick={() => setSelected(null)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            background: "white",
            color: "#475569",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          Хаах
        </button>
      </div>
    </div>
  </div>
)}

{/* ✅ Full Screen Image Modal - opens when clicking on image */}
{fullImage && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "rgba(0,0,0,0.95)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      animation: "fadeIn 0.2s ease",
    }}
    onClick={() => setFullImage(null)}
  >
    <img
      src={fullImage}
      alt="Full size"
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
        objectFit: "contain",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        cursor: "zoom-out",
      }}
      onClick={(e) => e.stopPropagation()}
    />
    
    {/* Close button */}
    <button
      onClick={() => setFullImage(null)}
      style={{
        position: "absolute",
        top: 24,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 50,
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        color: "white",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <X size={22} />
    </button>

    {/* Download button */}
    <button
      onClick={() => {
        const link = document.createElement("a");
        link.href = fullImage;
        link.download = "image.jpg";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 50,
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        color: "white",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.2)";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  </div>
)}

{/* Global Animations */}
<style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .notification-content img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 12px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    cursor: pointer;
  }
  
  .notification-content a {
    color: #4f46e5;
    text-decoration: underline;
  }
`}</style>
    </div>
  );
}