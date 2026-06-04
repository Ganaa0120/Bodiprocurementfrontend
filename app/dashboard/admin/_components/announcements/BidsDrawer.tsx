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
  Crown,
  TrendingUp,
  MessageSquare,
  Users, // ⭐ ШИНЭ
  Inbox,
} from "lucide-react";
import { API, authH, BID_STATUS } from "./constants";
import type { Ann } from "./types";
import React, { useState, useEffect } from "react";

/* ============================================================
   Туслах функцууд — хүргэлт хүртэлх хоног
   ============================================================ */
function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function deliveryLabel(date: string): { text: string; color: string } {
  const d = daysUntil(date);
  if (d > 1) return { text: `${d} хоногийн дараа`, color: "#60a5fa" };
  if (d === 1) return { text: "Маргааш", color: "#fbbf24" };
  if (d === 0) return { text: "Өнөөдөр", color: "#fbbf24" };
  return { text: `${Math.abs(d)} хоног хэтэрсэн`, color: "#f87171" };
}

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
  lowestPrice,
  onClose,
  onUpdateStatus,
}: {
  bid: any;
  ann: Ann;
  supplierInfo: any;
  lowestPrice?: number | null;
  onClose: () => void;
  onUpdateStatus?: (bidId: string, status: string) => void;
}) {
  const isAccepted = bid.status === "accepted" || bid.status === "approved";
  const isRejected = bid.status === "rejected";
  const isPending = bid.status === "submitted" || bid.status === "pending";
  const priceOffer = bid.price_offer || bid.budget_offer;
  const deliveryDate = bid.delivery_date;
  const note = bid.note || bid.message || bid.comment || bid.description;
  const attachments: any[] = Array.isArray(bid.attachments)
    ? bid.attachments
    : [];
  const hasAttachments = attachments.length > 0;

  const isLowest =
    lowestPrice != null && priceOffer && Number(priceOffer) === lowestPrice;
  const priceDiff =
    lowestPrice != null && priceOffer ? Number(priceOffer) - lowestPrice : 0;

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
                  border: `1px solid ${
                    isLowest ? "rgba(16,185,129,0.45)" : "rgba(16,185,129,0.2)"
                  }`,
                  position: "relative",
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
                  {isLowest && (
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 30,
                        background: "rgba(16,185,129,0.18)",
                        color: "#34d399",
                      }}
                    >
                      <Crown size={11} />
                      Хамгийн хямд
                    </span>
                  )}
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
                {!isLowest && priceDiff > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#fbbf24",
                      marginTop: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <TrendingUp size={11} />
                    Хамгийн хямдаас +{priceDiff.toLocaleString()}{" "}
                    {ann.currency ?? "MNT"}
                  </div>
                )}
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
                <div
                  style={{
                    fontSize: 12,
                    color: deliveryLabel(deliveryDate).color,
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {deliveryLabel(deliveryDate).text}
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

          {/* Нийлүүлэгчийн тайлбар / тэмдэглэл */}
          {note && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(148,163,184,0.5)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageSquare size={12} />
                Нийлүүлэгчийн тайлбар
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {note}
              </div>
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
   StatTile — дүгнэлт самбарын нэг нүүр
   ============================================================ */
function StatTile({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 14,
        padding: "12px 14px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "rgba(148,163,184,0.5)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: "rgba(148,163,184,0.45)",
            marginTop: 3,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ParticipantCard — нэг оролцох хүсэлтийг харуулах
   ============================================================ */
function ParticipantCard({
  participant: p,
  onViewDetail,
}: {
  participant: any;
  onViewDetail?: (id: string, type: "company" | "individual") => void;
}) {
  return (
    <div
      style={{
        background: p.has_submitted_bid
          ? "rgba(16,185,129,0.04)"
          : "rgba(255,255,255,0.03)",
        borderRadius: 16,
        padding: "16px 18px",
        border: `1px solid ${
          p.has_submitted_bid
            ? "rgba(16,185,129,0.25)"
            : "rgba(255,255,255,0.08)"
        }`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            background:
              p.participant_type === "company"
                ? "rgba(139,92,246,0.15)"
                : "rgba(99,102,241,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            border: `1px solid ${
              p.participant_type === "company"
                ? "rgba(139,92,246,0.3)"
                : "rgba(99,102,241,0.3)"
            }`,
          }}
        >
          {p.participant_type === "company" ? "🏢" : "👤"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.participant_name || "—"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(148,163,184,0.5)",
              display: "flex",
              gap: 10,
              marginTop: 3,
              flexWrap: "wrap",
            }}
          >
            {p.supplier_number && <span>№ {p.supplier_number}</span>}
            {p.participant_email && <span>📧 {p.participant_email}</span>}
            {p.participant_phone && <span>📞 {p.participant_phone}</span>}
          </div>
        </div>
        {p.has_submitted_bid && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 30,
              background: "rgba(16,185,129,0.15)",
              color: "#34d399",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={11} />
            Санал илгээсэн
          </span>
        )}
      </div>

      {p.message && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginTop: 10,
            padding: "10px 12px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <MessageSquare
            size={13}
            color="rgba(148,163,184,0.5)"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
            }}
          >
            {p.message}
          </span>
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 10, color: "rgba(148,163,184,0.45)" }}>
          👋 {new Date(p.created_at).toLocaleString("mn-MN")}
        </span>
        {onViewDetail && (
          <button
            onClick={() => onViewDetail(p.participant_id, p.participant_type)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.12)";
            }}
          >
            🔍 Дэлгэрэнгүй мэдээлэл
          </button>
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
  participants = [], // ⭐ ШИНЭ
  loading,
  loadingParticipants = false, // ⭐ ШИНЭ
  onClose,
  onUpdateStatus,
  supplierInfo,
}: {
  ann: Ann;
  bids: any[];
  participants?: any[]; // ⭐ ШИНЭ
  loading: boolean;
  loadingParticipants?: boolean; // ⭐ ШИНЭ
  onClose: () => void;
  onUpdateStatus: (bidId: string, status: string) => void;
  supplierInfo?: any;
}) {
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tab, setTab] = useState<"bids" | "participants">("bids"); // ⭐ ШИНЭ
  const [supplierDetail, setSupplierDetail] = useState<{
    id: string;
    type: "company" | "individual";
  } | null>(null);

  const openDetailModal = (bid: any) => {
    setSelectedBid(bid);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = (bidId: string, status: string) => {
    onUpdateStatus(bidId, status);
    setIsDetailModalOpen(false);
  };

  /* ---- Дүгнэлт тооцоолол ---- */
  const prices = bids
    .map((b) => Number(b.price_offer || b.budget_offer))
    .filter((p) => p > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, c) => a + c, 0) / prices.length)
    : null;

  const pendingCount = bids.filter(
    (b) => b.status === "submitted" || b.status === "pending",
  ).length;
  const acceptedCount = bids.filter(
    (b) => b.status === "accepted" || b.status === "approved",
  ).length;
  const rejectedCount = bids.filter((b) => b.status === "rejected").length;
  const currency = ann.currency ?? "MNT";

  return (
    <>
      {isDetailModalOpen && selectedBid && (
        <BidDetailModal
          bid={selectedBid}
          ann={ann}
          supplierInfo={supplierInfo}
          lowestPrice={lowestPrice}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateStatus={handleStatusUpdate}
        />
      )}
      {supplierDetail && (
        <SupplierDetailModal
          supplierId={supplierDetail.id}
          supplierType={supplierDetail.type}
          onClose={() => setSupplierDetail(null)}
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
              {bids.length + participants.length} нийт
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
          {/* ════════════ TAB SWITCHER ════════════ */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "14px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "#0d1526",
              position: "sticky",
              top: 73,
              zIndex: 1,
            }}
          >
            <button
              onClick={() => setTab("bids")}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border:
                  tab === "bids"
                    ? "1px solid rgba(99,102,241,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                background:
                  tab === "bids"
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(255,255,255,0.02)",
                color: tab === "bids" ? "#a5b4fc" : "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              <Inbox size={14} />
              Санал ирүүлсэн
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 8px",
                  borderRadius: 99,
                  background:
                    tab === "bids"
                      ? "rgba(99,102,241,0.25)"
                      : "rgba(255,255,255,0.05)",
                  color: tab === "bids" ? "#c7d2fe" : "rgba(148,163,184,0.5)",
                }}
              >
                {bids.length}
              </span>
            </button>
            <button
              onClick={() => setTab("participants")}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border:
                  tab === "participants"
                    ? "1px solid rgba(16,185,129,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                background:
                  tab === "participants"
                    ? "rgba(16,185,129,0.10)"
                    : "rgba(255,255,255,0.02)",
                color:
                  tab === "participants" ? "#34d399" : "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              <Users size={14} />
              Оролцох хүсэлт
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 8px",
                  borderRadius: 99,
                  background:
                    tab === "participants"
                      ? "rgba(16,185,129,0.25)"
                      : "rgba(255,255,255,0.05)",
                  color:
                    tab === "participants"
                      ? "#6ee7b7"
                      : "rgba(148,163,184,0.5)",
                }}
              >
                {participants.length}
              </span>
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px 28px" }}>
            {/* ════════════ TAB: BIDS ════════════ */}
            {tab === "bids" && (
              <>
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
                    <span
                      style={{ fontSize: 13, color: "rgba(148,163,184,0.4)" }}
                    >
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
                      Санал ирээгүй байна
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ============ ДҮГНЭЛТ САМБАР ============ */}
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      <StatTile
                        label="Нийт"
                        value={bids.length}
                        color="#a5b4fc"
                        sub={`${pendingCount} хүлээгдэж буй`}
                      />
                      {lowestPrice != null && (
                        <StatTile
                          label="Хамгийн хямд"
                          value={`${lowestPrice.toLocaleString()} ${currency}`}
                          color="#34d399"
                        />
                      )}
                      {avgPrice != null && (
                        <StatTile
                          label="Дундаж үнэ"
                          value={`${avgPrice.toLocaleString()} ${currency}`}
                          color="#60a5fa"
                        />
                      )}
                    </div>

                    {/* Төлвийн товч тойм */}
                    {(acceptedCount > 0 || rejectedCount > 0) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 20,
                          flexWrap: "wrap",
                        }}
                      >
                        {acceptedCount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 12px",
                              borderRadius: 30,
                              background: "rgba(16,185,129,0.1)",
                              color: "#34d399",
                              border: "1px solid rgba(16,185,129,0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <CheckCircle2 size={11} />
                            {acceptedCount} зөвшөөрсөн
                          </span>
                        )}
                        {rejectedCount > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 12px",
                              borderRadius: 30,
                              background: "rgba(239,68,68,0.1)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <XCircle size={11} />
                            {rejectedCount} татгалзсан
                          </span>
                        )}
                      </div>
                    )}

                    {/* ============ КАРТУУД ============ */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
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
                        const note =
                          b.note || b.message || b.comment || b.description;
                        const isLowest =
                          lowestPrice != null &&
                          priceOffer &&
                          Number(priceOffer) === lowestPrice;
                        const priceDiff =
                          lowestPrice != null && priceOffer
                            ? Number(priceOffer) - lowestPrice
                            : 0;

                        return (
                          <div
                            key={b.id}
                            className="bid-card"
                            onClick={() => openDetailModal(b)}
                            style={{
                              background: isLowest
                                ? "rgba(16,185,129,0.04)"
                                : "rgba(255,255,255,0.03)",
                              borderRadius: 20,
                              padding: "18px 20px",
                              border: `1px solid ${
                                isLowest
                                  ? "rgba(16,185,129,0.35)"
                                  : isAccepted
                                    ? "rgba(16,185,129,0.25)"
                                    : isRejected
                                      ? "rgba(239,68,68,0.2)"
                                      : "rgba(255,255,255,0.08)"
                              }`,
                              cursor: "pointer",
                              position: "relative",
                            }}
                          >
                            {/* Хамгийн хямд тэмдэг */}
                            {isLowest && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  right: 16,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "3px 10px",
                                  borderRadius: 30,
                                  background: "rgba(16,185,129,0.15)",
                                  color: "#34d399",
                                  border: "1px solid rgba(16,185,129,0.3)",
                                }}
                              >
                                <Crown size={11} />
                                Хамгийн хямд
                              </div>
                            )}

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
                                    paddingRight: isLowest ? 90 : 0,
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
                              {!isLowest && (
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
                              )}
                            </div>

                            {/* Quick info chips */}
                            {(priceOffer || deliveryDate || hasAttachments) && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  marginBottom: note ? 12 : 14,
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
                                {!isLowest && priceDiff > 0 && (
                                  <div
                                    style={{
                                      background: "rgba(245,158,11,0.06)",
                                      borderRadius: 10,
                                      padding: "5px 12px",
                                      border: "1px solid rgba(245,158,11,0.15)",
                                      fontSize: 12,
                                      color: "#fbbf24",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <TrendingUp size={12} />+
                                    {priceDiff.toLocaleString()}
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
                                    <span
                                      style={{
                                        color:
                                          deliveryLabel(deliveryDate).color,
                                        fontWeight: 700,
                                      }}
                                    >
                                      · {deliveryLabel(deliveryDate).text}
                                    </span>
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

                            {/* Нийлүүлэгчийн тайлбар (тойм) */}
                            {note && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 8,
                                  marginBottom: 14,
                                  padding: "10px 12px",
                                  background: "rgba(255,255,255,0.02)",
                                  borderRadius: 10,
                                  border: "1px solid rgba(255,255,255,0.05)",
                                }}
                              >
                                <MessageSquare
                                  size={13}
                                  color="rgba(148,163,184,0.5)"
                                  style={{ flexShrink: 0, marginTop: 1 }}
                                />
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "rgba(255,255,255,0.65)",
                                    lineHeight: 1.5,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {note}
                                </span>
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
                                gap: 10,
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "rgba(148,163,184,0.35)",
                                }}
                              >
                                {new Date(b.submitted_at).toLocaleString(
                                  "mn-MN",
                                )}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSupplierDetail({
                                      id: b.supplier_id,
                                      type: b.supplier_type,
                                    });
                                  }}
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: 8,
                                    background: "rgba(139,92,246,0.12)",
                                    border: "1px solid rgba(139,92,246,0.3)",
                                    color: "#c4b5fd",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(139,92,246,0.22)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(139,92,246,0.12)";
                                  }}
                                >
                                  🔍 Дэлгэрэнгүй мэдээлэл
                                </button>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#a5b4fc",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  Санал <ChevronRight size={14} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ════════════ TAB: PARTICIPANTS ════════════ */}
            {tab === "participants" && (
              <>
                {loadingParticipants ? (
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
                        color: "#34d399",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span
                      style={{ fontSize: 13, color: "rgba(148,163,184,0.4)" }}
                    >
                      Ачаалж байна...
                    </span>
                  </div>
                ) : participants.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Users
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
                      Оролцох хүсэлт ирээгүй байна
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {participants.map((p) => (
                      <ParticipantCard
                        key={p.id}
                        participant={p}
                        onViewDetail={(id, type) =>
                          setSupplierDetail({ id, type })
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SupplierDetailModal — нийлүүлэгчийн бүрэн мэдээлэл
   ============================================================ */
function SupplierDetailModal({
  supplierId,
  supplierType,
  onClose,
}: {
  supplierId: string;
  supplierType: "company" | "individual";
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint =
          supplierType === "company"
            ? `${API}/api/organizations/${supplierId}`
            : `${API}/api/persons/${supplierId}`;
        const res = await fetch(endpoint, { headers: authH() });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message || "Алдаа");
        setData(d.organization || d.person || d.data || d);
      } catch (e: any) {
        setError(e.message || "Мэдээлэл татаж чадсангүй");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supplierId, supplierType]);

  const isCompany = supplierType === "company";

  /* ── Туслах компонентууд ─────────────────────────────── */
  const Row = ({ label, value }: { label: string; value: any }) => {
    if (value == null || value === "" || (Array.isArray(value) && !value.length))
      return null;
    return (
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(148,163,184,0.5)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.85)",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {typeof value === "boolean" ? (value ? "Тийм" : "Үгүй") : String(value)}
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon?: string;
    children: React.ReactNode;
  }) => {
    // Хэрэв section дотор бүх Row null бол section-ыг харуулахгүй
    const hasContent =
      Array.isArray(children) && children.some((c) => c !== null && c !== false);
    if (!hasContent && !Array.isArray(children)) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#a5b4fc",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingBottom: 6,
            borderBottom: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          {title}
        </div>
        <div style={{ display: "grid", gap: 8 }}>{children}</div>
      </div>
    );
  };

  const DocLink = ({ label, url }: { label: string; url: string | null }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(99,102,241,0.06)",
          borderRadius: 10,
          border: "1px solid rgba(99,102,241,0.15)",
          textDecoration: "none",
          color: "#a5b4fc",
          fontSize: 12,
          fontWeight: 500,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(99,102,241,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(99,102,241,0.06)";
        }}
      >
        <FileText size={14} />
        <span style={{ flex: 1 }}>{label}</span>
        <Download size={13} />
      </a>
    );
  };

  const PersonCard = ({ p }: { p: any }) => {
    if (!p) return null;
    const name =
      `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() ||
      p.position ||
      p.email ||
      "—";
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.88)",
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(148,163,184,0.6)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {p.position && <span>📌 {p.position}</span>}
          {p.email && <span>📧 {p.email}</span>}
          {p.phone && <span>📞 {p.phone}</span>}
          {p.gender && (
            <span>{p.gender === "female" ? "♀ Эмэгтэй" : "♂ Эрэгтэй"}</span>
          )}
        </div>
      </div>
    );
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
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
          maxWidth: 720,
          background: "#0d1526",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
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
            gap: 14,
            background: isCompany
              ? "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(99,102,241,0.04))"
              : "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(99,102,241,0.04))",
          }}
        >
          {data?.company_logo_url ? (
            <img
              src={data.company_logo_url}
              alt=""
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                objectFit: "cover",
                border: "1px solid rgba(139,92,246,0.3)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: isCompany
                  ? "rgba(139,92,246,0.15)"
                  : "rgba(99,102,241,0.15)",
                border: `1px solid ${
                  isCompany ? "rgba(139,92,246,0.3)" : "rgba(99,102,241,0.3)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                flexShrink: 0,
              }}
            >
              {isCompany ? "🏢" : "👤"}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {loading
                ? "Ачаалж байна..."
                : data?.company_name ||
                  `${data?.last_name ?? ""} ${data?.first_name ?? ""}`.trim() ||
                  "Нийлүүлэгч"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.55)",
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {data?.supplier_number && (
                <span
                  style={{
                    padding: "2px 8px",
                    background: "rgba(99,102,241,0.15)",
                    borderRadius: 30,
                    color: "#a5b4fc",
                    fontWeight: 600,
                  }}
                >
                  № {data.supplier_number}
                </span>
              )}
              {data?.status && (
                <span
                  style={{
                    padding: "2px 8px",
                    background:
                      data.status === "active"
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(148,163,184,0.15)",
                    borderRadius: 30,
                    color:
                      data.status === "active"
                        ? "#34d399"
                        : "rgba(148,163,184,0.7)",
                    fontWeight: 600,
                  }}
                >
                  {data.status === "active" ? "Идэвхтэй" : data.status}
                </span>
              )}
              {data?.company_type && <span>• {data.company_type}</span>}
            </div>
          </div>
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
          >
            <X size={18} />
          </button>
        </div>

        {/* ============ BODY ============ */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
          ) : error ? (
            <div
              style={{
                padding: 20,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12,
                color: "#f87171",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              ⚠️ {error}
            </div>
          ) : data && isCompany ? (
            <>
              {/* ━━━━━━━━━━ ҮНДСЭН МЭДЭЭЛЭЛ ━━━━━━━━━━ */}
              <Section title="Үндсэн мэдээлэл" icon="📋">
                <Row label="Байгууллагын нэр" value={data.company_name} />
                <Row label="Англи нэр" value={data.company_name_en} />
                <Row label="Регистрийн дугаар" value={data.register_number} />
                <Row
                  label="Улсын бүртгэлийн дугаар"
                  value={data.state_registry_number}
                />
                <Row label="Байгууллагын төрөл" value={data.company_type} />
                <Row label="Ажилтны тоо" value={data.employee_count} />
                <Row
                  label="Үүсгэн байгуулагдсан огноо"
                  value={
                    data.established_date
                      ? new Date(data.established_date).toLocaleDateString(
                          "mn-MN",
                        )
                      : null
                  }
                />
              </Section>

              {/* ━━━━━━━━━━ ХОЛБОО БАРИХ ━━━━━━━━━━ */}
              <Section title="Холбоо барих" icon="📞">
                <Row label="И-мэйл" value={data.email} />
                <Row label="Утас" value={data.phone} />
                <Row label="Хаяг" value={data.address} />
                <Row label="Аймаг/Нийслэл" value={data.aimag_niislel} />
                <Row label="Сум/Дүүрэг" value={data.sum_duureg} />
                <Row label="Баг/Хороо" value={data.bag_horoo} />
              </Section>

              {/* ━━━━━━━━━━ ҮЙЛ АЖИЛЛАГАА ━━━━━━━━━━ */}
              <Section title="Үйл ажиллагаа" icon="⚙️">
                <Row
                  label="Үйл ажиллагааны тайлбар"
                  value={data.activity_description}
                />
                <Row
                  label="Нийлүүлэлтийн чиглэл"
                  value={
                    data.supply_direction === "both"
                      ? "Бараа ба үйлчилгээ"
                      : data.supply_direction === "goods"
                        ? "Бараа"
                        : data.supply_direction === "service"
                          ? "Үйлчилгээ"
                          : null
                  }
                />
                <Row
                  label="Үйл ажиллагааны чиглэл (бүлгийн тоо)"
                  value={
                    Array.isArray(data.activity_directions)
                      ? `${data.activity_directions.length} үндсэн / ${data.activity_directions.reduce(
                          (acc: number, d: any) =>
                            acc + (d?.sub_ids?.length ?? 0),
                          0,
                        )} дэд чиглэл`
                      : null
                  }
                />
              </Section>

              {/* ━━━━━━━━━━ САНХҮҮ ━━━━━━━━━━ */}
              <Section title="Санхүүгийн мэдээлэл" icon="💰">
                <Row label="Банк" value={data.bank_name} />
                <Row label="Дансны дугаар" value={data.bank_account_number} />
                <Row label="Валют" value={data.currency} />
                <Row label="IBAN" value={data.iban} />
                <Row label="SWIFT код" value={data.swift_code} />
                <Row label="НӨАТ-ын дугаар" value={data.vat_number} />
                <Row label="НӨАТ төлөгч" value={data.is_vat_payer} />
              </Section>

              {/* ━━━━━━━━━━ ГЭРЧИЛГЭЭ ━━━━━━━━━━ */}
              <Section title="Гэрчилгээ" icon="🏆">
                <Row label="ISO баталгаажсан" value={data.is_iso_certified} />
                <Row
                  label="Тусгай зөвшөөрөлтэй"
                  value={data.has_special_permission}
                />
                <Row
                  label="Тусгай зөвшөөрлийн дугаар"
                  value={data.special_permission_number}
                />
                <Row
                  label="Тусгай зөвшөөрлийн хүчинтэй огноо"
                  value={
                    data.special_permission_expiry
                      ? new Date(
                          data.special_permission_expiry,
                        ).toLocaleDateString("mn-MN")
                      : null
                  }
                />
              </Section>

              {/* ━━━━━━━━━━ УДИРДЛАГА ━━━━━━━━━━ */}
              {Array.isArray(data.executive_directors) &&
                data.executive_directors.length > 0 && (
                  <Section title="Гүйцэтгэх удирдлага" icon="👔">
                    {data.executive_directors.map((d: any, i: number) => (
                      <PersonCard key={i} p={d} />
                    ))}
                  </Section>
                )}

              {/* ━━━━━━━━━━ ЭЗЭМШИГЧИД ━━━━━━━━━━ */}
              {Array.isArray(data.beneficial_owners) &&
                data.beneficial_owners.length > 0 && (
                  <Section title="Үр шимийг хүртэгч эзэмшигчид" icon="👥">
                    {data.beneficial_owners.map((o: any, i: number) => (
                      <PersonCard key={i} p={o} />
                    ))}
                  </Section>
                )}

              {Array.isArray(data.final_beneficial_owners) &&
                data.final_beneficial_owners.length > 0 && (
                  <Section title="Эцсийн өмчлөгч" icon="🎯">
                    {data.final_beneficial_owners.map((o: any, i: number) => (
                      <PersonCard key={i} p={o} />
                    ))}
                  </Section>
                )}

              {/* ━━━━━━━━━━ БАРИМТ БИЧИГ ━━━━━━━━━━ */}
              {(data.doc_state_registry_url ||
                data.doc_vat_certificate_url ||
                data.doc_contract_url ||
                data.doc_special_permission_url ||
                data.doc_company_intro_url ||
                (Array.isArray(data.extra_documents) &&
                  data.extra_documents.length > 0)) && (
                <Section title="Баримт бичиг" icon="📄">
                  <DocLink
                    label="Улсын бүртгэлийн гэрчилгээ"
                    url={data.doc_state_registry_url}
                  />
                  <DocLink
                    label="НӨАТ-ын гэрчилгээ"
                    url={data.doc_vat_certificate_url}
                  />
                  <DocLink label="Гэрээ" url={data.doc_contract_url} />
                  <DocLink
                    label="Тусгай зөвшөөрөл"
                    url={data.doc_special_permission_url}
                  />
                  <DocLink
                    label="Байгууллагын танилцуулга"
                    url={data.doc_company_intro_url}
                  />
                  {Array.isArray(data.extra_documents) &&
                    data.extra_documents.map((doc: any, i: number) => (
                      <DocLink
                        key={i}
                        label={doc.name || `Нэмэлт баримт ${i + 1}`}
                        url={doc.url || doc}
                      />
                    ))}
                </Section>
              )}

              {/* ━━━━━━━━━━ БУСАД ━━━━━━━━━━ */}
              <Section title="Бусад" icon="ℹ️">
                <Row
                  label="Мэдэгдлийн тохиргоо"
                  value={
                    data.notification_preference === "all"
                      ? "Бүх зарлал"
                      : data.notification_preference === "selected_dirs"
                        ? "Сонгосон чиглэлүүд"
                        : data.notification_preference === "none"
                          ? "Хаасан"
                          : data.notification_preference
                  }
                />
                <Row
                  label="Бүртгүүлсэн огноо"
                  value={
                    data.created_at
                      ? new Date(data.created_at).toLocaleString("mn-MN")
                      : null
                  }
                />
                <Row
                  label="Сүүлд шинэчилсэн"
                  value={
                    data.updated_at
                      ? new Date(data.updated_at).toLocaleString("mn-MN")
                      : null
                  }
                />
              </Section>
            </>
          ) : data ? (
            // ━━━━━━━━━━ INDIVIDUAL (PERSON) ━━━━━━━━━━
            <>
              <Section title="Үндсэн мэдээлэл" icon="📋">
                <Row label="Овог" value={data.last_name} />
                <Row label="Нэр" value={data.first_name} />
                <Row label="Эцгийн нэр" value={data.family_name} />
                <Row label="Регистрийн дугаар" value={data.register_number} />
                <Row
                  label="Нийлүүлэгчийн дугаар"
                  value={data.supplier_number}
                />
              </Section>

              <Section title="Холбоо барих" icon="📞">
                <Row label="И-мэйл" value={data.email} />
                <Row label="Утас" value={data.phone} />
                <Row label="Хаяг" value={data.address} />
                <Row label="Аймаг/Нийслэл" value={data.aimag_niislel} />
                <Row label="Сум/Дүүрэг" value={data.sum_duureg} />
                <Row label="Баг/Хороо" value={data.bag_horoo} />
              </Section>

              <Section title="Үйл ажиллагаа" icon="⚙️">
                <Row
                  label="Үйл ажиллагааны танилцуулга"
                  value={data.activity_intro}
                />
                <Row
                  label="Чиглэлийн тоо"
                  value={
                    Array.isArray(data.activity_directions)
                      ? data.activity_directions.length
                      : null
                  }
                />
              </Section>

              {(data.profile_photo_url ||
                data.id_card_front_url ||
                data.id_card_back_url ||
                data.activity_intro_url) && (
                <Section title="Баримт бичиг" icon="📄">
                  <DocLink
                    label="Профайл зураг"
                    url={data.profile_photo_url}
                  />
                  <DocLink
                    label="Иргэний үнэмлэх (нүүр)"
                    url={data.id_card_front_url}
                  />
                  <DocLink
                    label="Иргэний үнэмлэх (ар)"
                    url={data.id_card_back_url}
                  />
                  <DocLink
                    label="Үйл ажиллагааны танилцуулга"
                    url={data.activity_intro_url}
                  />
                </Section>
              )}

              <Section title="Бусад" icon="ℹ️">
                <Row label="Төлөв" value={data.status} />
                <Row
                  label="Бүртгүүлсэн огноо"
                  value={
                    data.created_at
                      ? new Date(data.created_at).toLocaleString("mn-MN")
                      : null
                  }
                />
              </Section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
