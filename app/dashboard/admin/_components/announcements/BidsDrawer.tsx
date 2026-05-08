"use client";
import {
  X,
  Loader2,
  FileText,
  Download,
  Calendar,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  File,
  ChevronRight,
  Send,
  Package,
} from "lucide-react";
import { BID_STATUS } from "./constants";
import type { Ann } from "./types";
import { useState } from "react";

/* ============================================================
   FileItem — нэг файлыг харуулах + татах товч
   ============================================================ */
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
    if (["zip", "rar", "7z"].includes(ext)) return "🗜️";
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
        gap: 12,
        padding: "12px 16px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        textDecoration: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <span style={{ fontSize: 28 }}>{getFileIcon(file.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div
          style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2 }}
        >
          {formatSize(file.size)}
        </div>
      </div>
      <Download size={16} color="#a5b4fc" />
    </a>
  );
}

/* ============================================================
   BidDetailModal — нэг дэлгэцэнд бүх хэрэгтэй мэдээлэл
   • Үнийн санал
   • Хүргэлтийн огноо
   • Хавсаргасан файлууд
   • Илгээсэн огноо
   • Approve / Reject товч
   ============================================================ */
function BidDetailModal({
  bid,
  ann,
  supplierInfo,
  onClose,
  onUpdateStatus,
}: {
  bid: any;
  ann: Ann;
  supplierInfo: any;
  onClose: () => void;
  onUpdateStatus?: (bidId: string, status: string) => void;
}) {
  const isAccepted = bid.status === "accepted" || bid.status === "approved";
  const isRejected = bid.status === "rejected";
  const isPending = bid.status === "submitted" || bid.status === "pending";
  const priceOffer = bid.price_offer || bid.budget_offer;
  const deliveryDate = bid.delivery_date;
  const attachments: any[] = Array.isArray(bid.attachments)
    ? bid.attachments
    : [];
  const hasAttachments = attachments.length > 0;

  const supplierName =
    bid.supplier_name || supplierInfo?.company_name || "Нийлүүлэгч";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#0d1526",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          animation: "modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============ HEADER ============ */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background:
                bid.supplier_type === "company"
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(99,102,241,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              border: `1px solid ${
                bid.supplier_type === "company"
                  ? "rgba(139,92,246,0.3)"
                  : "rgba(99,102,241,0.3)"
              }`,
              flexShrink: 0,
            }}
          >
            {bid.supplier_type === "company" ? "🏢" : "👤"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {supplierName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.55)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {bid.supplier_number && <span>№ {bid.supplier_number}</span>}
              {bid.supplier_email && <span>📧 {bid.supplier_email}</span>}
              {bid.supplier_phone && <span>📞 {bid.supplier_phone}</span>}
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 16px",
              borderRadius: 30,
              background: isAccepted
                ? "rgba(16,185,129,0.12)"
                : isRejected
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(245,158,11,0.12)",
              color: isAccepted
                ? "#34d399"
                : isRejected
                  ? "#f87171"
                  : "#fbbf24",
              border: `1px solid ${
                isAccepted
                  ? "rgba(16,185,129,0.25)"
                  : isRejected
                    ? "rgba(239,68,68,0.2)"
                    : "rgba(245,158,11,0.25)"
              }`,
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {isAccepted && <CheckCircle2 size={11} />}
            {isRejected && <XCircle size={11} />}
            {isPending && <Clock size={11} />}
            {BID_STATUS[bid.status]?.label || "Хүлээгдэж буй"}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(148,163,184,0.5)";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ============ BODY ============ */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Зарлалын нэр */}
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(148,163,184,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Package size={11} />
              Зарлал
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.4,
              }}
            >
              {ann.title}
            </div>
          </div>

          {/* Үнийн санал + Хүргэлтийн огноо (хажуу хажууд) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                priceOffer && deliveryDate ? "1fr 1fr" : "1fr",
              gap: 12,
            }}
          >
            {priceOffer && (
              <div
                style={{
                  background: "rgba(16,185,129,0.06)",
                  borderRadius: 16,
                  padding: "18px 20px",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#34d399",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <Wallet size={14} />
                  Үнийн санал
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#34d399",
                    lineHeight: 1.1,
                  }}
                >
                  {Number(priceOffer).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(52,211,153,0.7)",
                    marginTop: 4,
                  }}
                >
                  {ann.currency ?? "MNT"}
                </div>
              </div>
            )}
            {deliveryDate && (
              <div
                style={{
                  background: "rgba(59,130,246,0.06)",
                  borderRadius: 16,
                  padding: "18px 20px",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#60a5fa",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <Calendar size={14} />
                  Хүргэлтийн огноо
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#60a5fa",
                    lineHeight: 1.2,
                  }}
                >
                  {new Date(deliveryDate).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Үнийн санал болон огноо хоёул байхгүй үед */}
          {!priceOffer && !deliveryDate && (
            <div
              style={{
                padding: "20px",
                background: "rgba(245,158,11,0.06)",
                borderRadius: 14,
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#fbbf24",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              ⚠️ Үнийн санал болон хүргэлтийн огноо оруулаагүй байна
            </div>
          )}

          {/* Хавсаргасан файлууд */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(148,163,184,0.5)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <File size={12} />
                Хавсаргасан файлууд
              </div>
              {hasAttachments && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 10px",
                    borderRadius: 30,
                    background: "rgba(99,102,241,0.15)",
                    color: "#a5b4fc",
                  }}
                >
                  {attachments.length}
                </span>
              )}
            </div>

            {!hasAttachments ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 20px",
                  color: "rgba(148,163,184,0.4)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 14,
                  border: "1px dashed rgba(255,255,255,0.08)",
                  fontSize: 13,
                }}
              >
                <File
                  size={32}
                  style={{
                    margin: "0 auto 10px",
                    opacity: 0.3,
                    display: "block",
                  }}
                />
                Хавсаргасан файл байхгүй
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {attachments.map((file, idx) => (
                  <FileItem key={idx} file={file} />
                ))}
              </div>
            )}
          </div>

          {/* Илгээсэн огноо */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.5)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Send size={11} />
              Илгээсэн огноо
            </span>
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
              }}
            >
              {new Date(bid.submitted_at).toLocaleString("mn-MN")}
            </span>
          </div>
        </div>

        {/* ============ FOOTER ACTIONS ============ */}
        {isPending && onUpdateStatus && (
          <div
            style={{
              padding: "16px 28px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              gap: 12,
              background: "#0a0e1a",
            }}
          >
            <button
              onClick={() => {
                onUpdateStatus(bid.id, "rejected");
                onClose();
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              }}
            >
              <XCircle size={16} />
              Татгалзах
            </button>
            <button
              onClick={() => {
                onUpdateStatus(bid.id, "accepted");
                onClose();
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#34d399",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.08)";
              }}
            >
              <CheckCircle2 size={16} />
              Зөвшөөрөх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BidsDrawer — хажуугийн drawer (ирсэн хүсэлтүүдийн жагсаалт)
   ============================================================ */
export function BidsDrawer({
  ann,
  bids,
  loading,
  onClose,
  onUpdateStatus,
  supplierInfo,
}: {
  ann: Ann;
  bids: any[];
  loading: boolean;
  onClose: () => void;
  onUpdateStatus: (bidId: string, status: string) => void;
  supplierInfo?: any;
}) {
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openDetailModal = (bid: any) => {
    setSelectedBid(bid);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = (bidId: string, status: string) => {
    onUpdateStatus(bidId, status);
    setIsDetailModalOpen(false);
  };

  return (
    <>
      {isDetailModalOpen && selectedBid && (
        <BidDetailModal
          bid={selectedBid}
          ann={ann}
          supplierInfo={supplierInfo}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateStatus={handleStatusUpdate}
        />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          display: "flex",
          justifyContent: "flex-end",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.2s ease",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            height: "100%",
            background: "linear-gradient(135deg, #0d1526 0%, #0a1020 100%)",
            overflowY: "auto",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
            animation: "slideRight 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes modalIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            @keyframes spin { to { transform: rotate(360deg); } }
            .bid-card {
              transition: all 0.2s ease;
            }
            .bid-card:hover {
              transform: translateX(4px);
              border-color: rgba(99,102,241,0.4) !important;
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "sticky",
              top: 0,
              background: "#0d1526",
              zIndex: 1,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 2,
                }}
              >
                Ирсэн хүсэлтүүд
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.5)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ann.title}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 16px",
                borderRadius: 30,
                background: "rgba(99,102,241,0.15)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.25)",
                flexShrink: 0,
              }}
            >
              {bids.length} хүсэлт
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 8,
                cursor: "pointer",
                display: "flex",
                color: "rgba(148,163,184,0.5)",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(148,163,184,0.5)";
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px 28px" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 60,
                  gap: 14,
                }}
              >
                <Loader2
                  size={28}
                  style={{
                    color: "#a5b4fc",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 13, color: "rgba(148,163,184,0.4)" }}>
                  Ачаалж байна...
                </span>
              </div>
            ) : bids.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <FileText
                  size={48}
                  style={{
                    color: "rgba(148,163,184,0.15)",
                    margin: "0 auto 16px",
                    display: "block",
                  }}
                />
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(148,163,184,0.4)",
                    margin: 0,
                  }}
                >
                  Хүсэлт ирээгүй байна
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {bids.map((b) => {
                  const bs = BID_STATUS[b.status] ?? BID_STATUS.submitted;
                  const isPending =
                    b.status === "submitted" || b.status === "pending";
                  const isAccepted =
                    b.status === "accepted" || b.status === "approved";
                  const isRejected = b.status === "rejected";
                  const hasAttachments =
                    b.attachments && b.attachments.length > 0;
                  const priceOffer = b.price_offer || b.budget_offer;
                  const deliveryDate = b.delivery_date;

                  return (
                    <div
                      key={b.id}
                      className="bid-card"
                      onClick={() => openDetailModal(b)}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 20,
                        padding: "18px 20px",
                        border: `1px solid ${
                          isAccepted
                            ? "rgba(16,185,129,0.25)"
                            : isRejected
                              ? "rgba(239,68,68,0.2)"
                              : "rgba(255,255,255,0.08)"
                        }`,
                        cursor: "pointer",
                      }}
                    >
                      {/* Supplier info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            flexShrink: 0,
                            background:
                              b.supplier_type === "company"
                                ? "rgba(139,92,246,0.15)"
                                : "rgba(99,102,241,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            border: `1px solid ${
                              b.supplier_type === "company"
                                ? "rgba(139,92,246,0.3)"
                                : "rgba(99,102,241,0.3)"
                            }`,
                          }}
                        >
                          {b.supplier_type === "company" ? "🏢" : "👤"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.88)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {b.supplier_name ||
                              supplierInfo?.company_name ||
                              "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(148,163,184,0.5)",
                              display: "flex",
                              gap: 10,
                              marginTop: 4,
                              flexWrap: "wrap",
                            }}
                          >
                            {b.supplier_number && (
                              <span>№ {b.supplier_number}</span>
                            )}
                            {b.supplier_email && (
                              <span>📧 {b.supplier_email}</span>
                            )}
                            {b.supplier_phone && (
                              <span>📞 {b.supplier_phone}</span>
                            )}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "5px 14px",
                            borderRadius: 30,
                            background: bs.bg,
                            color: bs.color,
                            border: `1px solid ${bs.color}20`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {isAccepted && <CheckCircle2 size={10} />}
                          {isRejected && <XCircle size={10} />}
                          {isPending && <Clock size={10} />}
                          {bs.label}
                        </span>
                      </div>

                      {/* Quick info chips */}
                      {(priceOffer || deliveryDate || hasAttachments) && (
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            marginBottom: 14,
                            flexWrap: "wrap",
                          }}
                        >
                          {priceOffer && (
                            <div
                              style={{
                                background: "rgba(16,185,129,0.06)",
                                borderRadius: 10,
                                padding: "5px 12px",
                                border: "1px solid rgba(16,185,129,0.15)",
                                fontSize: 12,
                                color: "#34d399",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Wallet size={12} />
                              {Number(priceOffer).toLocaleString()}{" "}
                              {ann.currency}
                            </div>
                          )}
                          {deliveryDate && (
                            <div
                              style={{
                                background: "rgba(59,130,246,0.06)",
                                borderRadius: 10,
                                padding: "5px 12px",
                                border: "1px solid rgba(59,130,246,0.15)",
                                fontSize: 12,
                                color: "#60a5fa",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Calendar size={12} />
                              {new Date(deliveryDate).toLocaleDateString(
                                "mn-MN",
                              )}
                            </div>
                          )}
                          {hasAttachments && (
                            <div
                              style={{
                                background: "rgba(99,102,241,0.06)",
                                borderRadius: 10,
                                padding: "5px 12px",
                                border: "1px solid rgba(99,102,241,0.15)",
                                fontSize: 12,
                                color: "#a5b4fc",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <File size={12} />
                              {b.attachments.length} файл
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                          paddingTop: 12,
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "rgba(148,163,184,0.35)",
                          }}
                        >
                          {new Date(b.submitted_at).toLocaleString("mn-MN")}
                        </span>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#a5b4fc",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          Дэлгэрэнгүй <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}