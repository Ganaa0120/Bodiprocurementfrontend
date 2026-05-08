"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Bell,
  CheckCheck,
  X,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  ZoomIn,
  Sparkles,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PersonNotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/notifications/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNotifs(d.notifications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});

    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const markAll = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token || ""}` },
    }).catch(() => {});

    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const openNotif = (n: any) => {
    setSelected(n);
    if (!n.is_read) markRead(n.id);
  };

  const unread = notifs.filter((n) => !n.is_read).length;

  const TYPE_ICON: Record<string, string> = {
    announcement: "📢",
    status: "✅",
    application: "📋",
    system: "🔔",
  };

  const TYPE_COLOR: Record<string, string> = {
    announcement: "rgba(245,158,11,0.12)",
    status: "rgba(16,185,129,0.12)",
    application: "rgba(99,102,241,0.12)",
    system: "rgba(148,163,184,0.12)",
  };

  const TYPE_BORDER: Record<string, string> = {
    announcement: "rgba(245,158,11,0.3)",
    status: "rgba(16,185,129,0.3)",
    application: "rgba(99,102,241,0.3)",
    system: "rgba(148,163,184,0.2)",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "0",
        boxSizing: "border-box",
        background: "transparent",
        minHeight: "100vh",
      }}
    >
      <style>{`
  * { box-sizing: border-box; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

  .notif-wrapper {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
  }

  .notif-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 16px;
  }

  .notif-card {
    background: rgba(255,255,255,0.03);
    border-radius: 20px;
    padding: 18px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(10px);
  }

  .notif-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
    border-color: rgba(99,102,241,0.3);
    background: rgba(255,255,255,0.05);
  }

  .notif-icon {
    width: 52px;
    height: 52px;
    min-width: 52px;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    transition: all 0.2s;
  }

  .notif-card:hover .notif-icon {
    transform: scale(1.05);
    border-color: rgba(99,102,241,0.3);
  }

  .notif-title {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255,255,255,0.9);
    line-height: 1.45;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .notif-desc {
    font-size: 12px;
    color: rgba(148,163,184,0.7);
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5;
  }

  .notif-time {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 11px;
    color: rgba(148,163,184,0.5);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  .modal-content {
    width: 100%;
    max-width: 560px;
    background: #0f172a;
    border-radius: 28px;
    overflow: hidden;
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .modal-header {
    padding: 24px 24px 20px;
    display: flex;
    gap: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.02));
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 24px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }

  .fullscreen-modal {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: fadeIn 0.2s ease;
  }

  @media (max-width: 900px) {
    .notif-list { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  }

  @media (max-width: 640px) {
    .notif-wrapper { padding: 0; }
    .notif-header { flex-direction: column; align-items: flex-start !important; gap: 14px; }
    .notif-list { grid-template-columns: 1fr; gap: 12px; }
    .notif-card { padding: 14px; border-radius: 18px; }
    .notif-icon { width: 44px; height: 44px; min-width: 44px; border-radius: 14px; font-size: 20px; }
    .notif-title { font-size: 13px; }
    .notif-desc { font-size: 11px; }
    .modal-content { max-width: 100%; max-height: 90vh; border-radius: 24px 24px 0 0; }
    .modal-header { padding: 20px; }
    .modal-body { padding: 20px; }
  }
`}</style>

      {/* Full Screen Image */}
      {fullImage && (
        <div className="fullscreen-modal" onClick={() => setFullImage(null)}>
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
          <button
            onClick={() => setFullImage(null)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "rgba(255,255,255,0.7)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  borderRadius: 16,
                  background:
                    TYPE_COLOR[selected.notification_type ?? "system"] ||
                    "rgba(148,163,184,0.12)",
                  border: `1px solid ${TYPE_BORDER[selected.notification_type ?? "system"] || "rgba(148,163,184,0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {TYPE_ICON[selected.notification_type ?? "system"] ?? "🔔"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.92)",
                    lineHeight: 1.4,
                    marginBottom: 6,
                  }}
                >
                  {selected.title || "Мэдэгдэл"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 11,
                  }}
                >
                  <Clock size={11} />
                  {new Date(selected.created_at).toLocaleString("mn-MN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  color: "rgba(148,163,184,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(148,163,184,0.5)";
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {selected.image_url && (
                <div
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 20,
                    background: "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    position: "relative",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullImage(selected.image_url);
                  }}
                >
                  <img
                    src={selected.image_url}
                    alt=""
                    style={{
                      width: "100%",
                      display: "block",
                      objectFit: "contain",
                      maxHeight: 280,
                      transition: "transform 0.2s",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 10,
                      padding: "5px 12px",
                      fontSize: 10,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <ZoomIn size={12} /> Томруулах
                  </div>
                </div>
              )}

              {(selected.message || selected.body) && (
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                    wordBreak: "break-word",
                  }}
                >
                  {(selected.message || selected.body)
                    .trim()
                    .startsWith("<") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: (selected.message || selected.body)
                          .replace(
                            /<img/g,
                            '<img style="max-width:100%; border-radius:12px; margin:12px 0; cursor:pointer;"',
                          )
                          .replace(
                            /<a/g,
                            '<a style="color:#a5b4fc; text-decoration:underline;" target="_blank"',
                          ),
                      }}
                    />
                  ) : (
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {selected.message || selected.body}
                    </p>
                  )}
                </div>
              )}

              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 22px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(99,102,241,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Дэлгэрэнгүй харах <ArrowRight size={14} />
                </a>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: "100%",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.7)",
                  borderRadius: 14,
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="notif-wrapper">
        {/* Header */}
        <div
          className="notif-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: "rgba(255,255,255,0.92)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                letterSpacing: "-0.3px",
              }}
            >
              Мэдэгдэл
              {unread > 0 && (
                <span
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    borderRadius: 30,
                    padding: "3px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
                  }}
                >
                  {unread} шинэ
                </span>
              )}
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
              }}
            >
              {unread > 0
                ? `${unread} уншаагүй мэдэгдэл байна`
                : "Бүх мэдэгдэл уншигдсан"}
            </p>
          </div>

          {unread > 0 && (
            <button
              onClick={markAll}
              style={{
                border: "1px solid rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.08)",
                color: "#a5b4fc",
                borderRadius: 14,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              }}
            >
              <CheckCheck size={16} />
              Бүгдийг уншсан болгох
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "80px 0",
            }}
          >
            <Loader2
              size={24}
              style={{
                animation: "spin 0.8s linear infinite",
                color: "#a5b4fc",
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
              Ачааллаж байна...
            </span>
          </div>
        ) : notifs.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "80px 20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <Bell
              size={44}
              style={{ color: "rgba(148,163,184,0.2)", marginBottom: 16 }}
            />
            <div style={{ color: "rgba(148,163,184,0.5)", fontSize: 14 }}>
              Мэдэгдэл байхгүй байна
            </div>
          </div>
        ) : (
          <div className="notif-list">
            {notifs.map((n) => (
              <div
                key={n.id}
                className="notif-card"
                onClick={() => openNotif(n)}
                style={{
                  border: n.is_read
                    ? "1px solid rgba(255,255,255,0.06)"
                    : `1px solid ${TYPE_BORDER[n.notification_type ?? "system"] || "rgba(99,102,241,0.3)"}`,
                  boxShadow: n.is_read
                    ? "none"
                    : `0 4px 20px ${(TYPE_BORDER[n.notification_type ?? "system"] || "rgba(99,102,241,0.1)").replace("0.3", "0.1").replace("0.2", "0.08")}`,
                  opacity: n.is_read ? 0.7 : 1,
                  background: n.is_read
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                {/* Icon */}
                <div
                  className="notif-icon"
                  style={{
                    background: n.is_read
                      ? "rgba(255,255,255,0.03)"
                      : TYPE_COLOR[n.notification_type ?? "system"] ||
                        "rgba(148,163,184,0.1)",
                    border: n.is_read
                      ? "1px solid rgba(255,255,255,0.06)"
                      : `1px solid ${TYPE_BORDER[n.notification_type ?? "system"] || "rgba(148,163,184,0.2)"}`,
                  }}
                >
                  {n.image_url ? (
                    <img
                      src={n.image_url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          TYPE_ICON[n.notification_type ?? "system"] ?? "🔔";
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 20 }}>
                      {TYPE_ICON[n.notification_type ?? "system"] ?? "🔔"}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <div
                    className="notif-title"
                    style={{
                      fontWeight: n.is_read ? 600 : 700,
                      color: n.is_read
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {n.title || n.message || "Мэдэгдэл"}
                  </div>

                  {n.message && n.title && (
                    <div className="notif-desc">{n.message}</div>
                  )}

                  <div className="notif-time">
                    <Clock size={11} />
                    {new Date(n.created_at).toLocaleString("mn-MN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      borderRadius: "50%",
                      background: "#818cf8",
                      boxShadow: "0 0 10px rgba(129,140,248,0.6)",
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
