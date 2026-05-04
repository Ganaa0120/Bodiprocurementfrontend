"use client";

import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCheck, X, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PersonNotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${API}/api/notifications/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setNotifs(d.notifications ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${API}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    }).catch(() => {});

    setNotifs((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              is_read: true,
            }
          : n,
      ),
    );
  };

  const markAll = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API}/api/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    }).catch(() => {});

    setNotifs((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
      })),
    );
  };

  const openNotif = (n: any) => {
    setSelected(n);

    if (!n.is_read) {
      markRead(n.id);
    }
  };

  const unread = notifs.filter((n) => !n.is_read).length;

  const TYPE_ICON: Record<string, string> = {
    announcement: "📢",
    status: "✅",
    application: "📋",
    system: "🔔",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "24px 0 50px",
        boxSizing: "border-box",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <style>{`
        *{
          box-sizing:border-box;
        }

        html,body{
          margin:0;
          padding:0;
        }

        @keyframes spin{
          to{
            transform:rotate(360deg);
          }
        }

        @keyframes modalIn{
          from{
            opacity:0;
            transform:translateY(18px) scale(.96);
          }
          to{
            opacity:1;
            transform:translateY(0) scale(1);
          }
        }

        .notif-wrapper{
          width:92%;
          max-width:1500px;
          margin:0 auto;
        }

        .notif-list{
          display:grid;
          grid-template-columns:1fr;
          gap:14px;
        }

        .notif-card{
          background:#fff;
          border-radius:22px;
          padding:18px;
          display:flex;
          align-items:center;
          gap:16px;
          cursor:pointer;
          transition:.18s ease;
          overflow:hidden;
          width:100%;
          position:relative;
        }

        .notif-card:hover{
          transform:translateY(-3px);
          box-shadow:0 10px 24px rgba(15,23,42,.08);
        }

        .notif-icon{
          width:56px;
          height:56px;
          min-width:56px;
          border-radius:18px;
          overflow:hidden;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:24px;
        }

        .notif-title{
  font-size:15px;
  font-weight:700;
  color:#0f172a;
  line-height:1.45;

  overflow:hidden;
  text-overflow:ellipsis;

  display:-webkit-box;
  -webkit-line-clamp:1;
  -webkit-box-orient:vertical;
}

.notif-desc{
  font-size:13px;
  color:#64748b;
  margin-top:4px;

  overflow:hidden;
  text-overflow:ellipsis;

  display:-webkit-box;
  -webkit-line-clamp:1;
  -webkit-box-orient:vertical;
}

        .notif-time{
          display:flex;
          align-items:center;
          gap:5px;
          margin-top:8px;
          font-size:12px;
          color:#94a3b8;
        }

        .modal-overlay{
          position:fixed;
          inset:0;
          z-index:999;
          background:rgba(15,23,42,.55);
          backdrop-filter:blur(6px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
        }

        .modal-content{
          width:100%;
          max-width:720px;
          background:#fff;
          border-radius:28px;
          overflow:hidden;
          animation:modalIn .22s ease;
          box-shadow:0 30px 70px rgba(0,0,0,.25);
          max-height:90vh;
          display:flex;
          flex-direction:column;
        }

        .modal-header{
          padding:26px;
          display:flex;
          gap:16px;
          border-bottom:1px solid #f1f5f9;
        }

        .modal-body{
          padding:26px;
          overflow-y:auto;
        }

        .modal-footer{
          padding:0 26px 26px;
          display:flex;
          justify-content:flex-end;
        }

        /* TABLET */
        @media (max-width:1024px){

          .notif-wrapper{
            width:94%;
          }

          .notif-card{
            padding:16px;
            border-radius:20px;
          }

          .modal-content{
            max-width:92%;
          }
        }

        /* MOBILE */
        @media (max-width:640px){

          .notif-wrapper{
            width:95%;
          }

          .notif-header{
            flex-direction:column;
            align-items:flex-start !important;
            gap:14px;
          }

          .notif-card{
            padding:14px;
            border-radius:18px;
            gap:12px;
            align-items:flex-start;
          }

          .notif-icon{
            width:48px;
            height:48px;
            min-width:48px;
            border-radius:15px;
            font-size:20px;
          }

          .notif-title{
            font-size:14px;
            white-space:normal;
            line-height:1.5;
          }

          .notif-desc{
            font-size:12px;
            white-space:normal;
            line-height:1.5;
          }

          .notif-time{
            font-size:11px;
          }

          .header-title{
            font-size:24px !important;
          }

          .mark-all-btn{
            width:100%;
            justify-content:center;
          }

          .modal-overlay{
  padding:10px;
  align-items:center;
  justify-content:center;
}

          .modal-content{
            width:100%;
            max-width:100%;
            max-height:92vh;
            border-radius:24px 24px 0 0;
          }

          .modal-header{
            padding:18px;
          }

          .modal-body{
            padding:18px;
          }

          .modal-footer{
            padding:0 18px 18px;
          }

          .modal-title{
            font-size:15px !important;
          }
        }
      `}</style>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="modal-header">
              <div
                style={{
                  width: 54,
                  height: 54,
                  minWidth: 54,
                  borderRadius: 18,
                  background: "#eef2ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {TYPE_ICON[selected.notification_type ?? "system"] ?? "🔔"}
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  className="modal-title"
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {selected.title || selected.message}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#94a3b8",
                    fontSize: 12,
                  }}
                >
                  <Clock size={12} />
                  {new Date(selected.created_at).toLocaleString("mn-MN")}
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={17} color="#64748b" />
              </button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              {selected.image_url && (
                <div
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    marginBottom: 20,
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <img
                    src={selected.image_url}
                    alt=""
                    style={{
                      width: "100%",
                      display: "block",
                      objectFit: "cover",
                      maxHeight: 380,
                    }}
                    onError={(e) => {
                      (
                        e.currentTarget as HTMLImageElement
                      ).parentElement!.style.display = "none";
                    }}
                  />
                </div>
              )}

              {selected.message &&
                selected.title &&
                (selected.message.trim().startsWith("<") ? (
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#334155",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selected.message,
                    }}
                  />
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#334155",
                      wordBreak: "break-word",
                    }}
                  >
                    {selected.message}
                  </p>
                ))}

              {selected.body &&
                (selected.body.trim().startsWith("<") ? (
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#334155",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selected.body,
                    }}
                  />
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.9,
                      color: "#334155",
                      wordBreak: "break-word",
                    }}
                  >
                    {selected.body}
                  </p>
                ))}

              {!selected.message && !selected.body && !selected.title && (
                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: 14,
                  }}
                >
                  Дэлгэрэнгүй мэдээлэл байхгүй байна.
                </p>
              )}

              {selected.link && (
                <a
                  href={selected.link}
                  style={{
                    marginTop: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "12px 22px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Дэлгэрэнгүй харах →
                </a>
              )}
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button
                onClick={() => setSelected(null)}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  borderRadius: 14,
                  padding: "11px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE */}
      <div className="notif-wrapper">
        {/* HEADER */}
        <div
          className="notif-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <h1
              className="header-title"
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 900,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              Мэдэгдэл
              {unread > 0 && (
                <span
                  style={{
                    background: "#4f46e5",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {unread}
                </span>
              )}
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              {unread > 0
                ? `${unread} уншаагүй мэдэгдэл байна`
                : "Бүх мэдэгдэл уншигдсан"}
            </p>
          </div>

          {unread > 0 && (
            <button
              className="mark-all-btn"
              onClick={markAll}
              style={{
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#4f46e5",
                borderRadius: 16,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              <CheckCheck size={16} />
              Бүгдийг уншсан болгох
            </button>
          )}
        </div>

        {/* LOADING */}
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
              size={26}
              style={{
                animation: "spin .8s linear infinite",
                color: "#4f46e5",
              }}
            />

            <span
              style={{
                fontSize: 14,
                color: "#94a3b8",
              }}
            >
              Ачааллаж байна...
            </span>
          </div>
        ) : notifs.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 26,
              border: "1px solid #f1f5f9",
              padding: "90px 20px",
              textAlign: "center",
            }}
          >
            <Bell
              size={42}
              style={{
                color: "#cbd5e1",
                marginBottom: 14,
              }}
            />

            <div
              style={{
                color: "#94a3b8",
                fontSize: 15,
              }}
            >
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
                  border: n.is_read ? "1px solid #f1f5f9" : "1px solid #c7d2fe",
                  boxShadow: n.is_read
                    ? "none"
                    : "0 4px 18px rgba(99,102,241,.07)",
                  opacity: n.is_read ? 0.82 : 1,
                }}
              >
                {/* ICON */}
                <div
                  className="notif-icon"
                  style={{
                    background: n.is_read ? "#f8fafc" : "#eef2ff",
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
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    (TYPE_ICON[n.notification_type ?? "system"] ?? "🔔")
                  )}
                </div>

                {/* CONTENT */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="notif-title"
                    style={{
                      fontWeight: n.is_read ? 600 : 800,
                    }}
                  >
                    {n.title || n.message}
                  </div>

                  {n.message && n.title && (
                    <div className="notif-desc">{n.message}</div>
                  )}

                  <div className="notif-time">
                    <Clock size={12} />

                    {new Date(n.created_at).toLocaleString("mn-MN")}
                  </div>
                </div>

                {/* UNREAD */}
                {!n.is_read && (
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      minWidth: 11,
                      borderRadius: "50%",
                      background: "#4f46e5",
                      boxShadow: "0 0 12px rgba(99,102,241,.55)",
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
