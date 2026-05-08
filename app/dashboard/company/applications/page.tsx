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
  Eye,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string; gradient: string }
> = {
  submitted: {
    label: "Хүлээгдэж буй",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 100%)",
  },
  pending: {
    label: "Хүлээгдэж буй",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 100%)",
  },
  accepted: {
    label: "Зөвшөөрөгдсөн",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    gradient: "linear-gradient(135deg,#d1fae5 0%,#ecfdf5 100%)",
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

// Файл татах компонент
function FileItem({ file }: { file: any }) {
  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name?.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    return "📎";
  };

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: "white",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        textDecoration: "none",
        transition: "all 0.15s",
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
      <span style={{ fontSize: 20 }}>{getFileIcon(file.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#0f172a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
          {formatSize(file.size)}
        </div>
      </div>
      <Download size={14} color="#4f46e5" />
    </a>
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

export default function CompanyApplicationsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const router = useRouter();

  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/applications/mine?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) {
        setApps(d.applications ?? []);
      }
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
    pending: apps.filter((a) => a.status === "pending" || a.status === "submitted").length,
    approved: apps.filter((a) => a.status === "approved" || a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const fmtMoney = (v: any) => (v ? Number(v).toLocaleString() : null);

  const openAttachmentsModal = (attachments: any[]) => {
    setSelectedAttachments(attachments || []);
    setIsModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    if (status === "pending" || status === "submitted") return STATUS_CFG.pending;
    if (status === "approved" || status === "accepted") return STATUS_CFG.approved;
    if (status === "rejected") return STATUS_CFG.rejected;
    return STATUS_CFG.pending;
  };

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
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

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

      {/* Attachments Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              background: "white",
              borderRadius: 24,
              padding: 24,
              animation: "modalIn .2s ease",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Хавсаргасан файлууд
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f1f5f9",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            {selectedAttachments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p>Хавсаргасан файл байхгүй</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedAttachments.map((file, idx) => (
                  <FileItem key={idx} file={file} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
          const sc = key === "all" ? null : STATUS_CFG[key === "pending" ? "pending" : key === "approved" ? "approved" : "rejected"];

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
              : `${STATUS_CFG[filter === "pending" ? "pending" : filter === "approved" ? "approved" : "rejected"]?.label ?? filter} төлөвт хүсэлт байхгүй`}
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
            const sc = getStatusConfig(app.status);
            const tl = TYPE_LABEL[app.ann_type] ?? TYPE_LABEL.open;
            const isApproved = app.status === "approved" || app.status === "accepted";
            const isRejected = app.status === "rejected";
            const isPending = app.status === "pending" || app.status === "submitted";
            const hasAttachments = app.attachments && app.attachments.length > 0;

            return (
              <div
                key={app.id}
                className="app-card"
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

                    {/* Attachments button */}
                    {hasAttachments && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAttachmentsModal(app.attachments);
                        }}
                        style={{
                          marginTop: 10,
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "#4f46e5",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#eef2ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f1f5f9";
                        }}
                      >
                        <Eye size={12} />
                        Хавсаргасан файл ({app.attachments.length})
                      </button>
                    )}

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