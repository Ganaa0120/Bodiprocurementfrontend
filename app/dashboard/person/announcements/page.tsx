"use client";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Clock,
  X,
  ArrowLeft,
  Megaphone,
  Zap,
  Eye,
  Send,
  AlertCircle,
  Calendar,
  DollarSign,
  FolderOpen,
  MapPin,
  Package,
  Hash,
  User,
  Building2,
  Phone,
  Download,
  Mail,
  Paperclip,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<
  string,
  { label: string; color: string; bg: string; emoji: string; border: string }
> = {
  open: {
    label: "Нээлттэй",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    emoji: "🌐",
  },
  targeted: {
    label: "Хаалттай",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    emoji: "🔒",
  },
  rfq: {
    label: "Үнийн санал",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    emoji: "📊",
  },
};

function FileItem({ file }: { file: any }) {
  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <span style={{ fontSize: 24 }}>📄</span>
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── BidModal ──
function BidModal({
  selected,
  user,
  onClose,
}: {
  selected: any;
  user: any;
  onClose: () => void;
}) {
  const [bidSaving, setBidSaving] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);
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
    const token = localStorage.getItem("token");
    const fd = new FormData();
    
    // ✅ Эдгээрийг шалгах - backend хүлээж буй field нэрс:
    fd.append("price_offer", priceOffer);        // эсвэл "price" ?
    fd.append("delivery_date", deliveryDate);     // эсвэл "deadline" ?
    if (message.trim()) fd.append("message", message.trim());
    attachments.forEach(file => fd.append("attachments", file));
    
    // ✅ Debug: илгээх өмнө FormData-г шалгах
    console.log("Submitting bid:", {
      price_offer: priceOffer,
      delivery_date: deliveryDate,
      message: message,
      attachments_count: attachments.length
    });
    
    try {
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
        body: fd,
      });
      const data = await res.json();
      console.log("Response:", data); // ✅ Debug: хариуг харах
      
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      setBidDone(true);
      setTimeout(() => { onClose(); }, 2500);
    } catch (e: any) { 
      setBidError(e.message); 
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
      onClick={onClose}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes bounceIn{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(.9)}to{transform:scale(1);opacity:1}}@keyframes shake{0%,to{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
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
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(148,163,184,0.5)",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {bidDone ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  fontSize: 56,
                  marginBottom: 16,
                  animation: "bounceIn .5s ease",
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
              <div style={{ fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
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
                    animation: "shake .4s ease",
                  }}
                >
                  <AlertCircle
                    size={14}
                    style={{ color: "#f87171", flexShrink: 0 }}
                  />
                  {bidError}
                </div>
              )}
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
                    <span style={{ fontSize: 11, color: "#fca5a5" }}>
                      {priceError}
                    </span>
                  </div>
                )}
              </div>
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
                    <span style={{ fontSize: 11, color: "#fca5a5" }}>
                      {dateError}
                    </span>
                  </div>
                )}
              </div>
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
                  placeholder="Нэмэлт тайлбар..."
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
                  }}
                />
              </div>
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
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "1px dashed rgba(255,255,255,0.15)",
                    borderRadius: 14,
                    padding: "24px 20px",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                          animation: "slideUp .2s ease",
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
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f87171",
                            flexShrink: 0,
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                        .join(" ") || user?.email,
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
                cursor: "pointer",
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
                cursor: "pointer",
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
                  Илгээж байна...
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

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function PersonAnnouncementsPage() {
  const [anns, setAnns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [detLoading, setDetLoading] = useState(false);
  const [bidModal, setBidModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const d = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setAnns(d.announcements ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    load();
  }, []);
  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    try {
      const d = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setSelected(d.announcement || d.data);
    } catch {
    } finally {
      setDetLoading(false);
    }
  };

  const counts = {
    all: anns.length,
    open: anns.filter((a) => a.ann_type === "open").length,
    targeted: anns.filter((a) => a.ann_type === "targeted").length,
    rfq: anns.filter((a) => a.ann_type === "rfq").length,
  };
  const filtered = anns.filter((a) => {
    const matchType = typeF === "all" || a.ann_type === typeF;
    const q = search.toLowerCase();
    return (
      matchType &&
      (!q ||
        a.title?.toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q))
    );
  });
  const TABS = [
    { key: "all", label: "Бүгд", icon: "📋" },
    { key: "open", label: "Нээлттэй", icon: "🌐" },
    { key: "targeted", label: "Хаалттай", icon: "🔒" },
    { key: "rfq", label: "Үнийн санал", icon: "📊" },
  ];

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes modalIn{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {bidModal && selected && (
        <BidModal
          selected={selected}
          user={user}
          onClose={() => setBidModal(false)}
        />
      )}

      {/* ══════ FULL DETAIL MODAL ══════ */}
      {(selected || detLoading) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 750,
              maxHeight: "88vh",
              background: "#0f172a",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {detLoading ? (
              <div
                style={{
                  padding: "80px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Loader2
                  size={22}
                  style={{
                    color: "#a5b4fc",
                    animation: "spin .8s linear infinite",
                  }}
                />
                <span style={{ fontSize: 14, color: "rgba(148,163,184,0.5)" }}>
                  Ачаалж байна...
                </span>
              </div>
            ) : (
              selected &&
              (() => {
                const tc = TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open;
                const isExpired =
                  selected?.deadline &&
                  new Date(selected.deadline) < new Date();
                return (
                  <>
                    <div
                      style={{
                        height: 3,
                        background: `linear-gradient(90deg, ${tc.color}, ${tc.color}44, transparent)`,
                        borderRadius: "24px 24px 0 0",
                        flexShrink: 0,
                      }}
                    />

                    {/* ── Header ── */}
                    <div
                      style={{
                        padding: "24px 28px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        flexShrink: 0,
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            flexShrink: 0,
                            background: tc.bg,
                            border: `1.5px solid ${tc.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 26,
                          }}
                        >
                          {tc.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "4px 12px",
                                borderRadius: 99,
                                background: tc.bg,
                                color: tc.color,
                                border: `1px solid ${tc.border}`,
                              }}
                            >
                              {tc.label}
                            </span>
                            {selected.is_urgent && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "4px 12px",
                                  borderRadius: 99,
                                  background: "rgba(239,68,68,0.12)",
                                  color: "#fca5a5",
                                  border: "1px solid rgba(239,68,68,0.25)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Zap size={10} style={{ fill: "#fca5a5" }} />{" "}
                                Яаралтай
                              </span>
                            )}
                            {isExpired && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "4px 12px",
                                  borderRadius: 99,
                                  background: "rgba(239,68,68,0.08)",
                                  color: "#f87171",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Clock size={10} /> Хугацаа дууссан
                              </span>
                            )}
                            {selected.announcement_number && (
                              <span
                                style={{
                                  fontSize: 11,
                                  padding: "4px 12px",
                                  borderRadius: 99,
                                  background: "rgba(255,255,255,0.04)",
                                  color: "rgba(148,163,184,0.6)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  fontFamily: "monospace",
                                }}
                              >
                                <Hash
                                  size={10}
                                  style={{ display: "inline", marginRight: 4 }}
                                />
                                {selected.announcement_number}
                              </span>
                            )}
                            {selected.procurement_kind && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "4px 12px",
                                  borderRadius: 99,
                                  background: "rgba(192,132,252,0.1)",
                                  color: "#c4b5fd",
                                  border: "1px solid rgba(192,132,252,0.2)",
                                }}
                              >
                                {selected.procurement_kind === "goods"
                                  ? "📦 Бараа"
                                  : selected.procurement_kind === "service"
                                    ? "🔧 Үйлчилгээ"
                                    : selected.procurement_kind}
                              </span>
                            )}
                          </div>
                          <h2
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "rgba(255,255,255,0.92)",
                              margin: 0,
                              lineHeight: 1.3,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {selected.title}
                          </h2>
                        </div>
                        <button
                          onClick={() => setSelected(null)}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(148,163,184,0.5)",
                            flexShrink: 0,
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {/* Meta chips */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(160px, 1fr))",
                          gap: 10,
                        }}
                      >
                        {selected.deadline && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              borderRadius: 14,
                              background: isExpired
                                ? "rgba(239,68,68,0.06)"
                                : "rgba(16,185,129,0.06)",
                              border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: isExpired
                                  ? "rgba(239,68,68,0.12)"
                                  : "rgba(16,185,129,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Calendar
                                size={14}
                                style={{
                                  color: isExpired ? "#f87171" : "#34d399",
                                }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: isExpired ? "#f87171" : "#34d399",
                                }}
                              >
                                Дуусах огноо
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: isExpired ? "#fca5a5" : "#6ee7b7",
                                  marginTop: 2,
                                }}
                              >
                                {new Date(selected.deadline).toLocaleDateString(
                                  "mn-MN",
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {(selected.budget_from || selected.budget_to) && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              borderRadius: 14,
                              background: "rgba(245,158,11,0.06)",
                              border: "1px solid rgba(245,158,11,0.2)",
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: "rgba(245,158,11,0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DollarSign
                                size={14}
                                style={{ color: "#fbbf24" }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "#fbbf24",
                                }}
                              >
                                Төсөв
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#fbbf24",
                                  marginTop: 2,
                                }}
                              >
                                {Number(selected.budget_from).toLocaleString()}
                                {selected.budget_to
                                  ? ` – ${Number(selected.budget_to).toLocaleString()}`
                                  : ""}{" "}
                                ₮
                              </div>
                            </div>
                          </div>
                        )}
                        {selected.category_name && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              borderRadius: 14,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FolderOpen
                                size={14}
                                style={{ color: "rgba(148,163,184,0.5)" }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "rgba(148,163,184,0.5)",
                                }}
                              >
                                Ангилал
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "rgba(255,255,255,0.7)",
                                  marginTop: 2,
                                }}
                              >
                                {selected.category_name}
                              </div>
                            </div>
                          </div>
                        )}
                        {selected.view_count !== undefined && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              borderRadius: 14,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Eye
                                size={14}
                                style={{ color: "rgba(148,163,184,0.5)" }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "rgba(148,163,184,0.5)",
                                }}
                              >
                                Үзсэн
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.7)",
                                  marginTop: 2,
                                }}
                              >
                                {selected.view_count} удаа
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Body ── */}
                    <div
                      style={{
                        padding: "24px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        flex: 1,
                      }}
                    >
                      {/* Supply Period */}
                      {(selected.supply_start_date ||
                        selected.supply_end_date) && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #60a5fa, #60a5fa44)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Нийлүүлэх хугацаа
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                            }}
                          >
                            {selected.supply_start_date && (
                              <div
                                style={{
                                  padding: "14px 16px",
                                  borderRadius: 14,
                                  background: "rgba(59,130,246,0.06)",
                                  border: "1px solid rgba(59,130,246,0.2)",
                                }}
                              >
                                <Calendar
                                  size={11}
                                  style={{ color: "#60a5fa" }}
                                />
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#60a5fa",
                                    marginTop: 4,
                                  }}
                                >
                                  Эхлэх
                                </div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#93c5fd",
                                  }}
                                >
                                  {new Date(
                                    selected.supply_start_date,
                                  ).toLocaleDateString("mn-MN")}
                                </div>
                              </div>
                            )}
                            {selected.supply_end_date && (
                              <div
                                style={{
                                  padding: "14px 16px",
                                  borderRadius: 14,
                                  background: "rgba(59,130,246,0.06)",
                                  border: "1px solid rgba(59,130,246,0.2)",
                                }}
                              >
                                <Calendar
                                  size={11}
                                  style={{ color: "#60a5fa" }}
                                />
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#60a5fa",
                                    marginTop: 4,
                                  }}
                                >
                                  Дуусах
                                </div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#93c5fd",
                                  }}
                                >
                                  {new Date(
                                    selected.supply_end_date,
                                  ).toLocaleDateString("mn-MN")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {(selected.central_location ||
                        selected.branch_location) && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #34d399, #34d39944)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Байршил
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                            }}
                          >
                            {selected.central_location && (
                              <div
                                style={{
                                  padding: "14px 16px",
                                  borderRadius: 14,
                                  background: "rgba(16,185,129,0.06)",
                                  border: "1px solid rgba(16,185,129,0.2)",
                                }}
                              >
                                <MapPin
                                  size={11}
                                  style={{ color: "#34d399" }}
                                />
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#34d399",
                                    marginTop: 4,
                                  }}
                                >
                                  Төв байршил
                                </div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#6ee7b7",
                                  }}
                                >
                                  {selected.central_location}
                                </div>
                              </div>
                            )}
                            {selected.branch_location && (
                              <div
                                style={{
                                  padding: "14px 16px",
                                  borderRadius: 14,
                                  background: "rgba(16,185,129,0.06)",
                                  border: "1px solid rgba(16,185,129,0.2)",
                                }}
                              >
                                <MapPin
                                  size={11}
                                  style={{ color: "#34d399" }}
                                />
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#34d399",
                                    marginTop: 4,
                                  }}
                                >
                                  Салбар байршил
                                </div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#6ee7b7",
                                  }}
                                >
                                  {selected.branch_location}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {selected.description && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background: `linear-gradient(180deg, ${tc.color}, ${tc.color}44)`,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Тайлбар
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.6)",
                              lineHeight: 1.9,
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: 14,
                              padding: "16px 18px",
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderLeft: `3px solid ${tc.color}33`,
                            }}
                          >
                            {/^</.test(selected.description.trim()) ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selected.description
                                    .trim()
                                    .startsWith("<li")
                                    ? `<ul style="padding-left:20px;margin:0;line-height:1.9">${selected.description}</ul>`
                                    : selected.description,
                                }}
                              />
                            ) : (
                              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                {selected.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Requirements */}
                      {selected.requirements && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #fbbf24, #fbbf2444)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Нийлүүлэгчид тавих шаардлага
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.6)",
                              lineHeight: 1.9,
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: 14,
                              padding: "18px 20px",
                              border: "1px solid rgba(245,158,11,0.15)",
                              borderLeft: "3px solid rgba(245,158,11,0.3)",
                            }}
                          >
                            {/^</.test(selected.requirements.trim()) ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selected.requirements,
                                }}
                                style={{ lineHeight: 1.9 }}
                              />
                            ) : (
                              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                {selected.requirements}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Activity Directions */}
                      {(selected.activity_directions ?? []).length > 0 && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #a78bfa, #a78bfa44)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Үйл ажиллагааны чиглэл
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            {(selected.activity_directions ?? []).map(
                              (d: string) => (
                                <span
                                  key={d}
                                  style={{
                                    fontSize: 12,
                                    padding: "7px 16px",
                                    borderRadius: 99,
                                    background: "rgba(139,92,246,0.1)",
                                    color: "#c4b5fd",
                                    border: "1px solid rgba(139,92,246,0.25)",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      background: "#a78bfa",
                                    }}
                                  />
                                  {d}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Client & Contact Info */}
                      {(selected.client_company ||
                        selected.contact_phone ||
                        selected.responsible_person_name) && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #fb923c, #fb923c44)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Холбоо барих
                            </span>
                          </div>
                          <div
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: 14,
                              padding: "16px",
                              border: "1px solid rgba(255,255,255,0.05)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            {selected.client_company && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <Building2
                                  size={14}
                                  style={{ color: "rgba(148,163,184,0.4)" }}
                                />
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "rgba(148,163,184,0.5)",
                                    width: 80,
                                  }}
                                >
                                  Компани
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.8)",
                                  }}
                                >
                                  {selected.client_company}
                                </span>
                              </div>
                            )}
                            {selected.contact_phone && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <Phone
                                  size={14}
                                  style={{ color: "rgba(148,163,184,0.4)" }}
                                />
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "rgba(148,163,184,0.5)",
                                    width: 80,
                                  }}
                                >
                                  Утас
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.8)",
                                  }}
                                >
                                  {selected.contact_phone}
                                </span>
                              </div>
                            )}
                            {selected.responsible_person_name && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <User
                                  size={14}
                                  style={{ color: "rgba(148,163,184,0.4)" }}
                                />
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: "rgba(148,163,184,0.5)",
                                    width: 80,
                                  }}
                                >
                                  Хариуцагч
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.8)",
                                  }}
                                >
                                  {selected.responsible_person_name}
                                  {selected.responsible_position && (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: "rgba(148,163,184,0.5)",
                                        marginLeft: 6,
                                      }}
                                    >
                                      ({selected.responsible_position})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Buyer Documents */}
                      {(selected.buyer_attachments?.length > 0 ||
                        selected.buyer_doc_info) && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #818cf8, #818cf844)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Худалдан авагчийн баримт бичиг
                            </span>
                          </div>
                          {selected.buyer_doc_info && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "rgba(148,163,184,0.6)",
                                lineHeight: 1.6,
                                marginBottom: 12,
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: "rgba(245,158,11,0.06)",
                                border: "1px solid rgba(245,158,11,0.15)",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: selected.buyer_doc_info,
                              }}
                            />
                          )}
                          {selected.buyer_attachments?.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {selected.buyer_attachments.map(
                                (file: any, idx: number) => (
                                  <FileItem key={idx} file={file} />
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Supplier Required Documents */}
                      {(selected.supplier_required_docs?.length > 0 ||
                        selected.supplier_doc_info) && (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div
                              style={{
                                width: 4,
                                height: 18,
                                borderRadius: 99,
                                background:
                                  "linear-gradient(180deg, #34d399, #34d39944)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              Нийлүүлэгчид шаардлагатай бичиг баримт
                            </span>
                          </div>
                          {selected.supplier_doc_info && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "rgba(148,163,184,0.6)",
                                lineHeight: 1.6,
                                marginBottom: 12,
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: "rgba(16,185,129,0.06)",
                                border: "1px solid rgba(16,185,129,0.15)",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: selected.supplier_doc_info,
                              }}
                            />
                          )}
                          {selected.supplier_required_docs?.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {selected.supplier_required_docs.map(
                                (file: any, idx: number) => (
                                  <FileItem key={idx} file={file} />
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 20px",
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              background: "rgba(99,102,241,0.15)",
                              border: "1px solid rgba(99,102,241,0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#a5b4fc",
                            }}
                          >
                            {selected.created_by_name?.[0] ?? "B"}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.8)",
                              }}
                            >
                              {selected.created_by_name ?? "Bodi Group"}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "rgba(148,163,184,0.4)",
                                marginTop: 2,
                              }}
                            >
                              <Calendar
                                size={10}
                                style={{ display: "inline", marginRight: 4 }}
                              />
                              {new Date(selected.created_at).toLocaleDateString(
                                "mn-MN",
                              )}{" "}
                              нийтэлсэн
                            </div>
                          </div>
                        </div>
                        {selected.application_count > 0 && (
                          <div
                            style={{
                              textAlign: "right",
                              padding: "10px 16px",
                              borderRadius: 12,
                              background: "rgba(99,102,241,0.08)",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: "#a5b4fc",
                                lineHeight: 1,
                              }}
                            >
                              {selected.application_count}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "rgba(148,163,184,0.5)",
                                marginTop: 2,
                              }}
                            >
                              хүсэлт
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        padding: "0 28px 28px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => setSelected(null)}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(148,163,184,0.7)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <ArrowLeft size={14} /> Буцах
                      </button>
                      <button
                        onClick={() => setBidModal(true)}
                        style={{
                          padding: "12px 32px",
                          borderRadius: 14,
                          border: "none",
                          background: `linear-gradient(135deg, ${tc.color}dd, ${tc.color})`,
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          boxShadow: `0 4px 20px ${tc.color}44`,
                        }}
                      >
                        <Send size={14} /> Хүсэлт гаргах
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Megaphone size={18} style={{ color: "#a5b4fc" }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  margin: "0 0 2px",
                }}
              >
                Зарлалууд
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.5)",
                  margin: 0,
                }}
              >
                Нийт нийтлэгдсэн худалдан авалтын зарлалууд
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(148,163,184,0.4)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Зарлал хайх..."
                style={{
                  padding: "9px 14px 9px 36px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 12,
                  outline: "none",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.85)",
                  width: 200,
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
              />
            </div>
            <button
              onClick={load}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  color: "rgba(148,163,184,0.5)",
                  animation: loading ? "spin 1s linear infinite" : undefined,
                }}
              />
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {TABS.map(({ key, label, icon }) => {
            const tc = key === "all" ? null : TYPE_CFG[key];
            const cnt = counts[key as keyof typeof counts];
            const active = typeF === key;
            return (
              <button
                key={key}
                onClick={() => setTypeF(key)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: active
                    ? `1.5px solid ${tc?.color ?? "rgba(129,140,248,0.5)"}`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: active
                    ? `${tc?.color ?? "rgba(99,102,241,0.15)"}20`
                    : "rgba(255,255,255,0.03)",
                  color: active
                    ? (tc?.color ?? "#a5b4fc")
                    : "rgba(148,163,184,0.6)",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
                {label}
                {cnt > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: active
                        ? (tc?.color ?? "#6366f1")
                        : "rgba(255,255,255,0.06)",
                      color: active ? "white" : "rgba(148,163,184,0.6)",
                    }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 80,
              gap: 12,
            }}
          >
            <Loader2
              size={28}
              style={{
                color: "#a5b4fc",
                animation: "spin .8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
              Ачаалж байна...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FileText
              size={28}
              style={{ color: "rgba(148,163,184,0.3)", marginBottom: 16 }}
            />
            <p
              style={{
                fontSize: 14,
                color: "rgba(148,163,184,0.5)",
                margin: 0,
              }}
            >
              {search
                ? "Хайлтад тохирох зарлал олдсонгүй"
                : "Зарлал байхгүй байна"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((a, idx) => {
              const tc = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
              const isDeadlinePassed =
                a.deadline && new Date(a.deadline) < new Date();
              return (
                <div
                  key={a.id}
                  onClick={() => openDetail(a.id)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 20,
                    padding: "20px 22px",
                    border: `1px solid ${tc.border}`,
                    borderLeft: `3px solid ${tc.color}`,
                    cursor: "pointer",
                    transition: "all 0.25s",
                    animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${tc.color}15`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        flexShrink: 0,
                        background: tc.bg,
                        border: `1px solid ${tc.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      {tc.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: tc.bg,
                            color: tc.color,
                            border: `1px solid ${tc.border}`,
                          }}
                        >
                          {tc.label}
                        </span>
                        {a.is_urgent && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 99,
                              background: "rgba(239,68,68,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(239,68,68,0.25)",
                            }}
                          >
                            <Zap size={10} style={{ fill: "#fca5a5" }} />{" "}
                            Яаралтай
                          </span>
                        )}
                        {isDeadlinePassed && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 99,
                              background: "rgba(148,163,184,0.08)",
                              color: "rgba(148,163,184,0.6)",
                            }}
                          >
                            Дууссан
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.9)",
                          marginBottom: 6,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.title}
                      </div>
                      {a.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(148,163,184,0.6)",
                            margin: "0 0 8px",
                            lineHeight: 1.5,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {a.description
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim()
                            .slice(0, 130)}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {a.category_name && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(148,163,184,0.5)",
                            }}
                          >
                            📁 {a.category_name}
                          </span>
                        )}
                        {(a.budget_from || a.budget_to) && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#34d399",
                              background: "rgba(16,185,129,0.08)",
                              padding: "3px 10px",
                              borderRadius: 8,
                              border: "1px solid rgba(16,185,129,0.2)",
                            }}
                          >
                            💰 {a.budget_from?.toLocaleString()}
                            {a.budget_to
                              ? ` — ${a.budget_to.toLocaleString()}`
                              : ""}
                          </span>
                        )}
                        {a.deadline && (
                          <span
                            style={{
                              fontSize: 11,
                              color: isDeadlinePassed
                                ? "#f87171"
                                : "rgba(148,163,184,0.5)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={11} />
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        flexShrink: 0,
                        textAlign: "right",
                        minWidth: 70,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(148,163,184,0.4)",
                          marginBottom: 4,
                        }}
                      >
                        {new Date(a.created_at).toLocaleDateString("mn-MN")}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          color: tc.color,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Eye size={12} /> Харах
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
