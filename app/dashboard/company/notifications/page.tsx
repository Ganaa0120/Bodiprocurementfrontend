"use client";
import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCheck, X, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_ICON: Record<string, string> = {
  announcement: "📢", status: "✅", application: "📋", system: "🔔",
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

  const [notifs,   setNotifs]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/notifications/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setNotifs(d.notifications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});
    setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAll = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, is_read: true })));
  };

  const openNotif = (n: any) => {
    setSelected(n);
    if (!n.is_read) markRead(n.id);
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: isMobile ? "16px 4px" : "24px 16px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 520,
              background: "white",
              borderRadius: isMobile ? "20px 20px 0 0" : 24,
              boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
              animation: isMobile ? "slideUp .25s ease" : "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
              maxHeight: isMobile ? "92vh" : "80vh",
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: isMobile ? "18px 18px" : "22px 24px",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: "#e6f2fa",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {TYPE_ICON[selected.notification_type ?? "system"] ?? "🔔"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: "#0f172a",
                  marginBottom: 5, lineHeight: 1.4, wordBreak: "break-word",
                }}>
                  {selected.title || selected.message}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8",
                  display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} />
                  {new Date(selected.created_at).toLocaleString("mn-MN")}
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 10,
                padding: 8, cursor: "pointer", display: "flex", flexShrink: 0,
              }}>
                <X size={16} style={{ color: "#64748b" }} />
              </button>
            </div>

            <div style={{ padding: isMobile ? "18px 18px" : "22px 24px" }}>
              {selected.image_url && (
                <div style={{
                  marginBottom: 18, borderRadius: 14, overflow: "hidden",
                  border: "1px solid #f1f5f9",
                }}>
                  <img src={selected.image_url} alt="" style={{
                    width: "100%", maxHeight: 280, objectFit: "cover", display: "block"
                  }}
                    onError={e => (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"} />
                </div>
              )}
              {selected.message && selected.title && (
                selected.message.trim().startsWith("<")
                  ? <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: selected.message }} />
                  : <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, margin: 0, wordBreak: "break-word" }}>
                      {selected.message}
                    </p>
              )}
              {selected.body && (
                selected.body.trim().startsWith("<")
                  ? <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: selected.body }} />
                  : <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, margin: 0, wordBreak: "break-word" }}>
                      {selected.body}
                    </p>
              )}
              {!selected.message && !selected.body && !selected.title && (
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                  Дэлгэрэнгүй мэдэгдэл байхгүй байна.
                </p>
              )}
              {selected.link && (
                <a href={selected.link} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, marginTop: 18,
                  padding: "10px 20px", borderRadius: 10,
                  background: "#0072BC",
                  color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none",
                }}>
                  Дэлгэрэнгүй харах →
                </a>
              )}
            </div>

            <div style={{
              padding: isMobile ? "0 18px 22px" : "0 24px 22px",
              display: "flex", justifyContent: "flex-end",
            }}>
              <button onClick={() => setSelected(null)} style={{
                padding: "9px 20px", borderRadius: 10,
                border: "1px solid #e2e8f0", background: "white",
                color: "#64748b", fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                width: isMobile ? "100%" : "auto",
              }}>
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        marginBottom: 20,
        flexDirection: isMobile ? "column" : "row",
        gap: 10,
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? 18 : 20,
            fontWeight: 700, color: "#0f172a", margin: "0 0 4px",
          }}>
            Мэдэгдэл
            {unread > 0 && (
              <span style={{
                marginLeft: 8, fontSize: 12, fontWeight: 700, padding: "2px 8px",
                borderRadius: 99, background: "#0072BC", color: "white",
                verticalAlign: "middle",
              }}>
                {unread}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            {unread > 0 ? `${unread} уншаагүй мэдэгдэл байна` : "Бүгд уншсан"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10,
            border: "1px solid #e2e8f0", background: "white",
            color: "#0072BC", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}>
            <CheckCheck size={14} /> Бүгдийг уншсан болгох
          </button>
        )}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 56, gap: 10 }}>
          <Loader2 size={20} style={{ color: "#0072BC", animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Ачаалж байна...</span>
        </div>
      ) : notifs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "56px 0",
          background: "white", borderRadius: 18, border: "1px solid #f1f5f9",
        }}>
          <Bell size={32} style={{ color: "#e2e8f0", display: "block", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>Мэдэгдэл байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => openNotif(n)}
              style={{
                background: "white", borderRadius: 14,
                padding: isMobile ? "12px 14px" : "14px 18px",
                border: `1px solid ${n.is_read ? "#f1f5f9" : "#bae0f3"}`,
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer",
                opacity: n.is_read ? 0.7 : 1,
                transition: "all .15s",
                boxShadow: n.is_read ? "none" : "0 2px 8px rgba(0,114,188,0.08)",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                background: n.is_read ? "#f8fafc" : "#e6f2fa",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>
                {n.image_url
                  ? <img src={n.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => (e.currentTarget as HTMLImageElement).style.display = "none"} />
                  : (TYPE_ICON[n.notification_type ?? "system"] ?? "🔔")}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: "#0f172a",
                  marginBottom: 2,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {n.title || n.message}
                </div>
                {n.message && n.title && (
                  <div style={{
                    fontSize: 11, color: "#64748b",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}>
                    {n.message}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#94a3b8",
                  display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} />
                  {new Date(n.created_at).toLocaleString("mn-MN")}
                </div>
              </div>

              {!n.is_read && (
                <div style={{
                  width: 9, height: 9, borderRadius: "50%", background: "#0072BC",
                  flexShrink: 0, boxShadow: "0 0 6px rgba(0,114,188,0.5)",
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}