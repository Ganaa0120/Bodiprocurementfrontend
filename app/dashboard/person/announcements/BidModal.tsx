"use client";
import { useState, useRef } from "react";
import {
  Loader2,
  X,
  Send,
  AlertCircle,
  FileText,
  Paperclip,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  selected: any;
  user: any;
  onClose: () => void;
}

export default function BidModal({ selected, user, onClose }: Props) {
  const [bidSaving, setBidSaving] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);

  // ── Upload progress state ──
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const [priceOffer, setPriceOffer] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    { name: string; size: number }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [priceError, setPriceError] = useState("");
  const [dateError, setDateError] = useState("");
  const [touched, setTouched] = useState({ price: false, date: false });

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: { name: string; size: number }[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} - 10MB-аас хэтэрсэн байна`);
        return;
      }
      newFiles.push(file);
      newPreviews.push({ name: file.name, size: file.size });
    });
    setAttachments((prev) => [...prev, ...newFiles]);
    setAttachmentPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validatePrice = (val: string) => {
    if (!val || isNaN(Number(val)) || Number(val) <= 0) {
      setPriceError("Үнийн санал оруулна уу");
      return false;
    }
    setPriceError("");
    return true;
  };

  const validateDate = (val: string) => {
    if (!val) {
      setDateError("Хүргэлтийн огноо сонгоно уу");
      return false;
    }
    setDateError("");
    return true;
  };

  // ═══════════════════════════════════════════════════════════
  //  Файл нэг бүрийг upload хийж URL авах
  // ═══════════════════════════════════════════════════════════
  const uploadOne = async (file: File, token: string) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/api/announcements/upload-attachment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        `"${file.name}" файлыг upload хийж чадсангүй: ${data.message || "Алдаа"}`,
      );
    }
    return {
      url: data.url,
      name: data.name || file.name,
      size: data.size || file.size,
      type: data.type || file.type,
    };
  };

  // ═══════════════════════════════════════════════════════════
  //  SUBMIT BID — 2 алхамтай
  //   1. Бүх файлыг upload-attachment endpoint руу явуулна
  //   2. Дараа нь JSON body-той bid үүсгэх POST явуулна
  // ═══════════════════════════════════════════════════════════
  const submitBid = async () => {
    if (!selected) return;

    const isPriceValid = validatePrice(priceOffer);
    const isDateValid = validateDate(deliveryDate);
    setTouched({ price: true, date: true });
    if (!isPriceValid || !isDateValid) {
      setBidError("Шаардлагатай талбаруудыг бөглөнө үү");
      return;
    }

    setBidSaving(true);
    setBidError("");
    const token = localStorage.getItem("token") || "";

    try {
      // ── 1. Файлуудыг upload хийнэ ──
      const uploadedAttachments: any[] = [];
      if (attachments.length > 0) {
        setUploadProgress({ current: 0, total: attachments.length });
        for (let i = 0; i < attachments.length; i++) {
          setUploadProgress({ current: i + 1, total: attachments.length });
          const uploaded = await uploadOne(attachments[i], token);
          uploadedAttachments.push(uploaded);
        }
        setUploadProgress(null);
      }

      // ── 2. Bid-ыг JSON-аар явуулна ──
      console.log("Submitting bid:", {
        price_offer: Number(priceOffer),
        delivery_date: deliveryDate,
        attachments_count: uploadedAttachments.length,
      });

      const res = await fetch(
        `${API}/api/announcements/${selected.id}/bids`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price_offer: Number(priceOffer),
            delivery_date: deliveryDate,
            attachments: uploadedAttachments,
            message: message.trim() || null,
          }),
        },
      );

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");

      setBidDone(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e: any) {
      setBidError(e.message);
      setUploadProgress(null);
    } finally {
      setBidSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
      onClick={() => !bidSaving && onClose()}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        @keyframes progressBar { from { width: 0%; } }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          background: "#0f172a",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            📋
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              Оролцох хүсэлт гаргах
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.5)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selected.title}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={bidSaving}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: bidSaving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(148,163,184,0.5)",
              flexShrink: 0,
              opacity: bidSaving ? 0.4 : 1,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {bidDone ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  fontSize: 56,
                  marginBottom: 16,
                  animation: "bounceIn 0.5s ease",
                }}
              >
                🚀
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#34d399",
                  marginBottom: 8,
                }}
              >
                Хүсэлт амжилттай илгээгдлээ!
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.5)",
                  lineHeight: 1.6,
                }}
              >
                Таны мэдээлэл болон файлуудыг admin нарт илгээлээ.
              </div>
            </div>
          ) : (
            <>
              {bidError && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    fontSize: 13,
                    color: "#fca5a5",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    animation: "shake 0.4s ease",
                  }}
                >
                  <AlertCircle
                    size={14}
                    style={{ color: "#f87171", flexShrink: 0 }}
                  />
                  {bidError}
                </div>
              )}

              {/* Upload progress indicator */}
              {uploadProgress && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#a5b4fc",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Loader2
                        size={13}
                        style={{ animation: "spin .8s linear infinite" }}
                      />
                      Файл upload хийж байна...
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(165,180,252,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {uploadProgress.current} / {uploadProgress.total}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                        background:
                          "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Price Offer */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color:
                      priceError && touched.price
                        ? "#f87171"
                        : "rgba(148,163,184,0.7)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Үнийн санал <span style={{ color: "#f87171" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={priceOffer}
                    onChange={(e) => {
                      setPriceOffer(e.target.value);
                      if (touched.price) validatePrice(e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, price: true }));
                      validatePrice(priceOffer);
                    }}
                    placeholder="10,000,000"
                    disabled={bidSaving}
                    style={{
                      width: "100%",
                      padding: "11px 50px 11px 16px",
                      borderRadius: 12,
                      border:
                        priceError && touched.price
                          ? "1.5px solid rgba(239,68,68,0.4)"
                          : "1px solid rgba(255,255,255,0.1)",
                      fontSize: 14,
                      outline: "none",
                      background:
                        priceError && touched.price
                          ? "rgba(239,68,68,0.06)"
                          : "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: 600,
                      boxSizing: "border-box",
                      transition: "all 0.2s",
                      fontFamily: "'JetBrains Mono', monospace",
                      opacity: bidSaving ? 0.6 : 1,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        priceError && touched.price
                          ? "rgba(239,68,68,0.5)"
                          : "rgba(99,102,241,0.4)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12,
                      color: "rgba(148,163,184,0.5)",
                      fontWeight: 500,
                    }}
                  >
                    {selected.currency || "MNT"}
                  </span>
                </div>
                {priceError && touched.price && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 10, color: "#f87171" }}>✕</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#fca5a5",
                        fontWeight: 500,
                      }}
                    >
                      {priceError}
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery Date */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color:
                      dateError && touched.date
                        ? "#f87171"
                        : "rgba(148,163,184,0.7)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Хүргэлтийн огноо <span style={{ color: "#f87171" }}>*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    if (touched.date) validateDate(e.target.value);
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, date: true }));
                    validateDate(deliveryDate);
                  }}
                  disabled={bidSaving}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: 12,
                    border:
                      dateError && touched.date
                        ? "1.5px solid rgba(239,68,68,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                    fontSize: 13,
                    outline: "none",
                    background:
                      dateError && touched.date
                        ? "rgba(239,68,68,0.06)"
                        : "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.85)",
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                    opacity: bidSaving ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      dateError && touched.date
                        ? "rgba(239,68,68,0.5)"
                        : "rgba(99,102,241,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                />
                {dateError && touched.date && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 10, color: "#f87171" }}>✕</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#fca5a5",
                        fontWeight: 500,
                      }}
                    >
                      {dateError}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(148,163,184,0.7)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Нэмэлт мэдээлэл / Зурвас
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Нэмэлт тайлбар, тэмдэглэл..."
                  disabled={bidSaving}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 13,
                    outline: "none",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.85)",
                    resize: "vertical",
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    minHeight: 80,
                    opacity: bidSaving ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(148,163,184,0.7)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Хавсралт файлууд
                </label>
                <div
                  onClick={() =>
                    !bidSaving && fileInputRef.current?.click()
                  }
                  style={{
                    border: "1px dashed rgba(255,255,255,0.15)",
                    borderRadius: 14,
                    padding: "24px 20px",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.02)",
                    cursor: bidSaving ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: bidSaving ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!bidSaving) {
                      e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.4)";
                      e.currentTarget.style.background =
                        "rgba(99,102,241,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.15)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <Paperclip
                    size={24}
                    style={{ color: "rgba(148,163,184,0.4)", marginBottom: 8 }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(148,163,184,0.5)",
                      marginBottom: 4,
                    }}
                  >
                    Файл хавсаргах
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.3)" }}>
                    PDF, DOC, Зураг · 10MB хүртэл
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  style={{ display: "none" }}
                  onChange={handleFileAdd}
                />
                {attachmentPreviews.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {attachmentPreviews.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          animation: "slideUp 0.2s ease",
                        }}
                      >
                        <FileText
                          size={16}
                          style={{
                            color: "rgba(148,163,184,0.5)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "rgba(255,255,255,0.8)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(148,163,184,0.4)",
                              marginTop: 2,
                            }}
                          >
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          disabled={bidSaving}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            cursor: bidSaving ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f87171",
                            flexShrink: 0,
                            opacity: bidSaving ? 0.4 : 1,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Info Summary */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(148,163,184,0.4)",
                    marginBottom: 4,
                  }}
                >
                  Илгээгч
                </div>
                {[
                  {
                    label: "Нэр",
                    value:
                      [user?.last_name, user?.first_name]
                        .filter(Boolean)
                        .join(" ") ||
                      user?.company_name ||
                      user?.email,
                  },
                  { label: "Нийлүүлэгч №", value: user?.supplier_number },
                  { label: "И-мэйл", value: user?.email },
                ]
                  .filter((r) => r.value)
                  .map((row) => (
                    <div key={row.label} style={{ display: "flex", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(148,163,184,0.4)",
                          width: 90,
                          flexShrink: 0,
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!bidDone && (
          <div
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 12,
              flexShrink: 0,
              background: "rgba(15,23,42,0.5)",
            }}
          >
            <button
              onClick={onClose}
              disabled={bidSaving}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(148,163,184,0.7)",
                fontSize: 13,
                fontWeight: 500,
                cursor: bidSaving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: bidSaving ? 0.5 : 1,
              }}
            >
              Болих
            </button>
            <button
              onClick={submitBid}
              disabled={bidSaving}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: 14,
                border: "none",
                background: bidSaving
                  ? "linear-gradient(135deg, #7c3aed, #8b5cf6)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: bidSaving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: bidSaving ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              {bidSaving ? (
                <>
                  <Loader2
                    size={15}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  {uploadProgress
                    ? `Файл ${uploadProgress.current}/${uploadProgress.total}...`
                    : "Илгээж байна..."}
                </>
              ) : (
                <>
                  <Send size={15} /> Хүсэлт илгээх
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}