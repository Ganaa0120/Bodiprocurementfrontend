"use client";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Clock,
  X,
  Calendar,
  Wallet,
  FolderOpen,
  Eye,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Hash,
  Sparkles,
  Package,
  MapPin,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  ShieldCheck,
  FileCheck,
  Upload,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TYPE_CFG: Record<string, any> = {
  open: {
    label: "Нээлттэй",
    color: "#0072BC",
    bg: "rgba(0,114,188,0.08)",
    softBg: "#e6f2fa",
    border: "rgba(0,114,188,0.2)",
    emoji: "🌐",
    gradient: "linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 50%,#ffffff 100%)",
  },
  targeted: {
    label: "Хаалттай",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    softBg: "#f3f0ff",
    border: "rgba(124,58,237,0.2)",
    emoji: "🔒",
    gradient: "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 50%,#ffffff 100%)",
  },
  rfq: {
    label: "Үнийн санал",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    softBg: "#fef9e7",
    border: "rgba(217,119,6,0.2)",
    emoji: "📊",
    gradient: "linear-gradient(135deg,#fef3c7 0%,#fffbeb 50%,#ffffff 100%)",
  },
};

const TABS = [
  { key: "all", label: "Бүгд" },
  { key: "open", label: "Нээлттэй" },
  { key: "targeted", label: "Хаалттай" },
  { key: "rfq", label: "Үнийн санал" },
];

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

function SafeHTML({ html }: { html: string }) {
  if (!html) return null;
  return (
    <div
      className="ann-prose"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
    />
  );
}

function Section({ accent, Icon, title, children }: any) {
  return (
    <div style={{ marginBottom: 28 }}>
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
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${accent}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {Icon ? (
            <Icon size={14} color={accent} />
          ) : (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: accent,
              }}
            />
          )}
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function HeroStat({ Icon, label, value, accent, isMobile }: any) {
  return (
    <div
      style={{
        padding: isMobile ? "14px 12px" : "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#94a3b8",
        }}
      >
        <Icon size={11} color="#94a3b8" />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: isMobile ? 13 : 14,
          fontWeight: 700,
          color: accent ?? "#0f172a",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DownloadFileItem({ file }: { file: any }) {
  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (name: string) => {
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
        gap: 12,
        padding: "10px 14px",
        background: "white",
        borderRadius: 10,
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
      <span style={{ fontSize: 24 }}>{getIcon(file.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#0f172a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          {formatSize(file.size)}
        </div>
      </div>
      <Download size={16} color="#4f46e5" />
    </a>
  );
}

function UploadFileItem({ file, onRemove, onView }: any) {
  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (name: string) => {
    const ext = name?.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    return "📎";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "white",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
      }}
    >
      <span style={{ fontSize: 24 }}>{getIcon(file.name)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#0f172a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          {formatSize(file.size)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onView}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "#eef2ff",
            border: "none",
            cursor: "pointer",
            color: "#4f46e5",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Download size={12} /> Татах
        </button>
        <button
          onClick={onRemove}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "#fef2f2",
            border: "none",
            cursor: "pointer",
            color: "#ef4444",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Trash2 size={12} /> Устгах
        </button>
      </div>
    </div>
  );
}

export default function CompanyAnnouncementsPage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;

  const [anns, setAnns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [detLoading, setDetLoading] = useState(false);
  const [bidModal, setBidModal] = useState(false);
  const [bidSaving, setBidSaving] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any[]>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDoc, setCurrentDoc] = useState("");

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const res = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setAnns(d.announcements ?? []);
    } catch (e) {
      console.error(e);
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (bidModal && !bidSaving) setBidModal(false);
        else if (selected && !bidModal) setSelected(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, bidModal, bidSaving]);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    setSelected({ id, _loading: true });
    try {
      const res = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success && d.announcement) {
        setSelected(d.announcement);
        setUploadedFiles({});
      } else setSelected(null);
    } catch {
      setSelected(null);
    } finally {
      setDetLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/api/announcements/upload-attachment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data.url;
  };

  const handleAddFile = async (docName: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("Файлын хэмжээ 10MB-аас бага байх ёстой");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file);
      const newFile = { url, name: file.name, size: file.size };
      setUploadedFiles((prev) => ({
        ...prev,
        [docName]: [...(prev[docName] || []), newFile],
      }));
    } catch (err: any) {
      alert("Файл upload хийж чадсангүй: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (docName: string, index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docName]: prev[docName].filter((_, i) => i !== index),
    }));
  };

  const handleViewFile = (url: string, name?: string) => {
    window.open(url, "_blank");
  };

  const parseRequiredDocs = (text: string): string[] => {
    if (!text) return [];
    const lines = text.split("\n").filter((l) => l.trim());
    const docs: string[] = [];
    for (const line of lines) {
      const clean = line.replace(/^[•\-*\d]+\.?\s*/, "").trim();
      if (clean && !clean.startsWith("✔") && clean.length > 2 && clean.length < 200) {
        docs.push(clean);
      }
    }
    return docs.slice(0, 10);
  };

  const supplierRequiredFiles = selected?.supplier_required_docs || [];
  const supplierRequiredText = selected?.supplier_doc_info || "";
  const supplierRequiredDocsList = parseRequiredDocs(supplierRequiredText);

  const submitBid = async () => {
    if (!selected?.id) return;
    setBidSaving(true);
    setBidError("");
    const token = localStorage.getItem("token");
    try {
      const attachments = Object.entries(uploadedFiles).flatMap(([docName, files]) =>
        files.map((f) => ({ ...f, docName }))
      );
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attachments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      setBidDone(true);
      setTimeout(() => {
        setBidModal(false);
        setBidDone(false);
        setSelected(null);
      }, 2500);
    } catch (e: any) {
      setBidError(e.message || "Хүсэлт илгээхэд алдаа гарлаа");
    } finally {
      setBidSaving(false);
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
    const matchQ =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  const fmtMoney = (v: any) => (v ? Number(v).toLocaleString() : "—");
  const tc = selected ? (TYPE_CFG[selected.ann_type] ?? TYPE_CFG.open) : TYPE_CFG.open;
  const daysLeft = selected?.deadline
    ? Math.ceil((new Date(selected.deadline).getTime() - Date.now()) / 86400000)
    : null;
  const isExpired = selected?.deadline && daysLeft !== null && daysLeft < 0;
  const totalFiles = Object.values(uploadedFiles).flat().length;

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
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .ann-modal-body::-webkit-scrollbar { width: 6px; }
        .ann-modal-body::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 99px; }
        .ann-modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        .ann-prose {
          font-size: 14px;
          color: #334155;
          line-height: 1.7;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .ann-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 12px 0;
        }
        .ann-prose ul, .ann-prose ol { padding-left: 20px; margin: 8px 0; }
        .ann-prose li { margin: 4px 0; }
        .ann-prose p { margin: 0 0 8px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 22 : 30 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
          Зарлалууд
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Нийтлэгдсэн худалдан авалтын зарлалууд</p>
      </div>

      {/* Tabs + Search */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
          marginBottom: 24,
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: isMobile ? "nowrap" : "wrap",
            overflowX: isMobile ? "auto" : "visible",
            flex: 1,
            paddingBottom: isMobile ? 4 : 0,
          }}
        >
          {TABS.map(({ key, label }) => {
            const t = key === "all" ? null : TYPE_CFG[key];
            const cnt = counts[key as keyof typeof counts];
            const active = typeF === key;
            return (
              <button
                key={key}
                onClick={() => setTypeF(key)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  border: active ? `1.5px solid ${t?.color ?? "#0072BC"}` : "1.5px solid #e2e8f0",
                  background: active ? `${t?.color ?? "#0072BC"}10` : "white",
                  color: active ? (t?.color ?? "#0072BC") : "#64748b",
                }}
              >
                {t && <span style={{ fontSize: 14 }}>{t.emoji}</span>}
                {label}
                {cnt > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: active ? (t?.color ?? "#0072BC") : "#f1f5f9",
                      color: active ? "white" : "#64748b",
                    }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Хайх..."
              style={{
                width: isMobile ? "100%" : 200,
                padding: "10px 14px 10px 36px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                outline: "none",
                background: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0072BC")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <RefreshCw size={14} style={{ color: "#64748b", animation: loading ? "spin 1s linear infinite" : undefined }} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 80, gap: 12 }}>
          <Loader2 size={20} style={{ color: "#0072BC", animation: "spin .8s linear infinite" }} />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>Ачаалж байна...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: 18, border: "1px solid #f1f5f9" }}>
          <FileText size={36} style={{ color: "#cbd5e1", display: "block", margin: "0 auto 14px" }} />
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
            {search ? "Хайлтад тохирох зарлал олдсонгүй" : "Зарлал байхгүй байна"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((a) => {
            const t = TYPE_CFG[a.ann_type] ?? TYPE_CFG.open;
            const expired = a.deadline && new Date(a.deadline) < new Date();
            return (
              <div
                key={a.id}
                onClick={() => openDetail(a.id)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: isMobile ? "16px 14px" : "20px 22px",
                  border: "1px solid #e2e8f0",
                  borderLeft: `3px solid ${t.color}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Card content - ижил */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: t.softBg,
                        border: `1px solid ${t.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}
                    >
                      {t.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: t.softBg,
                            color: t.color,
                            border: `1px solid ${t.border}`,
                          }}
                        >
                          {t.label}
                        </span>
                        {a.is_urgent && (
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
                        {expired && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: 99,
                              background: "#f1f5f9",
                              color: "#64748b",
                            }}
                          >
                            Хугацаа дууссан
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: "0 0 6px",
                          lineHeight: 1.35,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {a.title}
                      </h3>
                      {a.description && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            margin: "0 0 10px",
                            lineHeight: 1.55,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: isMobile ? 2 : 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {a.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", rowGap: 4 }}>
                        {a.category_name && (
                          <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <FolderOpen size={11} /> {a.category_name}
                          </span>
                        )}
                        {(a.budget_from || a.budget_to) && (
                          <span style={{ fontSize: 11, color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Wallet size={11} />
                            {fmtMoney(a.budget_from)}
                            {a.budget_to ? ` — ${fmtMoney(a.budget_to)}` : ""} {a.currency}
                          </span>
                        )}
                        {a.deadline && (
                          <span
                            style={{
                              fontSize: 11,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: expired ? "#dc2626" : "#94a3b8",
                            }}
                          >
                            <Clock size={11} />
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: isMobile ? "row" : "column",
                      alignItems: isMobile ? "center" : "flex-end",
                      justifyContent: isMobile ? "space-between" : "flex-start",
                      gap: 4,
                      width: isMobile ? "100%" : "auto",
                      paddingTop: isMobile ? 10 : 0,
                      borderTop: isMobile ? "1px solid #f1f5f9" : "none",
                      marginTop: isMobile ? 4 : 0,
                    }}
                  >
                    <div style={{ textAlign: isMobile ? "left" : "right" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>
                        {new Date(a.created_at).toLocaleDateString("mn-MN")}
                      </div>
                      {a.created_by_name && <div style={{ fontSize: 10, color: "#cbd5e1" }}>{a.created_by_name}</div>}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.color, display: "flex", alignItems: "center", gap: 4 }}>
                      Дэлгэрэнгүй →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && !detLoading && !selected._loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="ann-modal-body"
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 860,
              background: "white",
              borderRadius: isMobile ? "24px 24px 0 0" : 24,
              boxShadow: "0 32px 80px rgba(15,23,42,0.4)",
              animation: isMobile ? "slideUp .35s cubic-bezier(0.34,1.3,0.64,1)" : "modalIn .25s cubic-bezier(0.34,1.3,0.64,1)",
              maxHeight: isMobile ? "94vh" : "92vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HERO SECTION */}
            <div
              style={{
                position: "relative",
                padding: isMobile ? "26px 20px 22px" : "36px 40px 28px",
                background: tc.gradient,
                borderBottom: `1px solid ${tc.border}`,
              }}
            >
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(15,23,42,0.06)",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.85)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                <X size={16} style={{ color: "#475569" }} />
              </button>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px 6px 10px",
                  background: "white",
                  border: `1px solid ${tc.border}`,
                  borderRadius: 99,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 16 }}>{tc.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tc.color }}>{tc.label}</span>
              </div>

              <h2
                style={{
                  fontSize: isMobile ? 21 : 26,
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  lineHeight: 1.25,
                  paddingRight: 44,
                  wordBreak: "break-word",
                }}
              >
                {selected.title}
              </h2>

              {(selected.is_urgent || isExpired || (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7)) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                  {selected.is_urgent && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "5px 12px",
                        borderRadius: 99,
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                      }}
                    >
                      ⚡ Яаралтай
                    </span>
                  )}
                  {isExpired ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "5px 12px",
                        borderRadius: 99,
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      ⏱ Хугацаа дууссан
                    </span>
                  ) : (
                    daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "5px 12px",
                          borderRadius: 99,
                          background: daysLeft <= 3 ? "#fff7ed" : "#fefce8",
                          color: daysLeft <= 3 ? "#c2410c" : "#a16207",
                          border: daysLeft <= 3 ? "1px solid #fed7aa" : "1px solid #fde68a",
                        }}
                      >
                        ⏳ {daysLeft === 0 ? "Өнөөдөр дуусна" : `${daysLeft} өдөр үлдсэн`}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* STATS GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
                gap: 1,
                background: "#e2e8f0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ background: "white" }}>
                <HeroStat
                  Icon={Calendar}
                  label="Дуусах огноо"
                  value={selected.deadline ? new Date(selected.deadline).toLocaleDateString("mn-MN") : "—"}
                  accent={isExpired ? "#dc2626" : daysLeft !== null && daysLeft <= 3 ? "#ea580c" : "#0f172a"}
                  isMobile={isMobile}
                />
              </div>
              <div style={{ background: "white" }}>
                <HeroStat
                  Icon={Wallet}
                  label="Төсөв"
                  value={
                    selected.budget_from || selected.budget_to ? (
                      <span>
                        {fmtMoney(selected.budget_from)}
                        {selected.budget_to ? ` — ${fmtMoney(selected.budget_to)}` : ""}{" "}
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{selected.currency}</span>
                      </span>
                    ) : (
                      "—"
                    )
                  }
                  isMobile={isMobile}
                />
              </div>
              <div style={{ background: "white" }}>
                <HeroStat Icon={FolderOpen} label="Категори" value={selected.category_name ?? "—"} isMobile={isMobile} />
              </div>
              <div style={{ background: "white" }}>
                <HeroStat
                  Icon={TrendingUp}
                  label="Худалдан авалтын төрөл"
                  value={selected.procurement_kind === "goods" ? "Бараа" : selected.procurement_kind === "service" ? "Үйлчилгээ" : "—"}
                  isMobile={isMobile}
                />
              </div>
              <div style={{ background: "white" }}>
                <HeroStat Icon={Eye} label="Үзэлт" value={String(selected.view_count ?? 0)} isMobile={isMobile} />
              </div>
            </div>

            {/* BODY */}
            <div style={{ padding: isMobile ? "26px 20px" : "32px 40px", flex: 1 }}>
              {/* Тайлбар */}
              {selected.description && (
                <Section title="Тайлбар" accent={tc.color} Icon={FileText}>
                  <SafeHTML html={selected.description} />
                </Section>
              )}

              {/* Шаардлага */}
              {selected.requirements && (
                <Section title="Шаардлага" accent="#d97706" Icon={Sparkles}>
                  <div
                    style={{
                      background: "linear-gradient(135deg,#fefce8 0%,#fffbeb 100%)",
                      borderRadius: 14,
                      padding: isMobile ? "14px 16px" : "18px 20px",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <SafeHTML html={selected.requirements} />
                  </div>
                </Section>
              )}

              {/* Худалдан авагчийн мэдээлэл */}
              {(selected.client_company || selected.responsible_person_name || selected.contact_phone) && (
                <Section title="Худалдан авагчийн мэдээлэл" accent={tc.color} Icon={Building2}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                      gap: 12,
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: "16px 18px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {selected.client_company && (
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Байгууллага
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{selected.client_company}</div>
                      </div>
                    )}
                    {selected.responsible_person_name && (
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Хариуцлагатай хүн
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          {selected.responsible_person_name}
                          {selected.responsible_position && (
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 400, marginLeft: 6 }}>
                              ({selected.responsible_position})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {selected.contact_phone && (
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Холбоо барих утас
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{selected.contact_phone}</div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Худалдан авалтын хугацаа */}
              {(selected.start_date || selected.end_date) && (
                <Section title="Худалдан авалтын хугацаа" accent={tc.color} Icon={Calendar}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {selected.start_date && (
                      <div style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Эхлэх огноо
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          {new Date(selected.start_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                    {selected.end_date && (
                      <div style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Дуусах огноо
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                          {new Date(selected.end_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Хүргэлтийн хугацаа */}
              {(selected.supply_start_date || selected.supply_end_date) && (
                <Section title="Хүргэлтийн хугацаа" accent="#d97706" Icon={Package}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {selected.supply_start_date && (
                      <div style={{ flex: 1, background: "#fefce8", borderRadius: 12, padding: "12px 16px", border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: 10, color: "#92400e", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Эхлэх огноо
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#78350f" }}>
                          {new Date(selected.supply_start_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                    {selected.supply_end_date && (
                      <div style={{ flex: 1, background: "#fefce8", borderRadius: 12, padding: "12px 16px", border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: 10, color: "#92400e", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>
                          Дуусах огноо
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#78350f" }}>
                          {new Date(selected.supply_end_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Байршил */}
              {(selected.central_location || selected.branch_location || selected.address_details) && (
                <Section title="Байршил" accent="#7c3aed" Icon={MapPin}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      background: "#f5f3ff",
                      borderRadius: 14,
                      padding: "16px 18px",
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    {selected.central_location && (
                      <div>
                        <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 2, fontWeight: 600, textTransform: "uppercase" }}>
                          Төв байршил
                        </div>
                        <div style={{ fontSize: 14, color: "#4c1d95" }}>{selected.central_location}</div>
                      </div>
                    )}
                    {selected.branch_location && (
                      <div>
                        <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 2, fontWeight: 600, textTransform: "uppercase" }}>
                          Салбар байршил
                        </div>
                        <div style={{ fontSize: 14, color: "#4c1d95" }}>{selected.branch_location}</div>
                      </div>
                    )}
                    {selected.address_details && (
                      <div>
                        <div style={{ fontSize: 10, color: "#6d28d9", marginBottom: 2, fontWeight: 600, textTransform: "uppercase" }}>
                          Дэлгэрэнгүй хаяг
                        </div>
                        <div style={{ fontSize: 14, color: "#4c1d95" }}>{selected.address_details}</div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* RFQ дэлгэрэнгүй */}
              {selected.ann_type === "rfq" && (selected.rfq_quantity || selected.rfq_delivery_place || selected.rfq_specs) && (
                <Section title="Үнийн санал — дэлгэрэнгүй" accent="#d97706" Icon={Package}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    {selected.rfq_quantity && (
                      <div style={{ background: "white", border: "1px solid #fde68a", borderLeft: "3px solid #d97706", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 10, color: "#92400e", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>
                          Тоо хэмжээ
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#78350f" }}>
                          {selected.rfq_quantity} <span style={{ fontSize: 13, color: "#a16207" }}>{selected.rfq_unit}</span>
                        </div>
                      </div>
                    )}
                    {selected.rfq_delivery_place && (
                      <div style={{ background: "white", border: "1px solid #a7f3d0", borderLeft: "3px solid #10b981", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 10, color: "#065f46", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>
                          Хүргэлтийн газар
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#064e3b" }}>{selected.rfq_delivery_place}</div>
                      </div>
                    )}
                    {selected.rfq_delivery_date && (
                      <div style={{ background: "white", border: "1px solid #bfdbfe", borderLeft: "3px solid #3b82f6", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 10, color: "#1e40af", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>
                          Хүргэлтийн огноо
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a8a" }}>
                          {new Date(selected.rfq_delivery_date).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    )}
                  </div>
                  {selected.rfq_specs && (
                    <div style={{ marginTop: 10, background: "white", border: "1px solid #e2e8f0", borderLeft: "3px solid #64748b", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, fontWeight: 700, textTransform: "uppercase" }}>
                        🔧 Техникийн тодорхойлолт
                      </div>
                      <div style={{ fontSize: 14, color: "#334155", whiteSpace: "pre-wrap" }}>{selected.rfq_specs}</div>
                    </div>
                  )}
                </Section>
              )}

              {/* Үйл ажиллагааны чиглэл */}
              {selected.activity_directions?.length > 0 && (
                <Section title="Үйл ажиллагааны чиглэл" accent="#7c3aed" Icon={TrendingUp}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.activity_directions.map((d: string) => (
                      <span
                        key={d}
                        style={{
                          fontSize: 12,
                          padding: "7px 14px",
                          borderRadius: 99,
                          background: "#f5f3ff",
                          color: "#6d28d9",
                          border: "1px solid #ddd6fe",
                          fontWeight: 600,
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Худалдан авагчийн баримт бичгүүд */}
              {(selected.buyer_doc_info || selected.buyer_attachments?.length > 0) && (
                <Section title="Худалдан авагчийн баримт бичгүүд" accent="#3b82f6" Icon={FileText}>
                  <div style={{ background: "#eff6ff", borderRadius: 14, padding: "16px 18px", border: "1px solid #bfdbfe" }}>
                    {selected.buyer_doc_info && <SafeHTML html={selected.buyer_doc_info} />}
                    {selected.buyer_attachments?.length > 0 && (
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af", marginBottom: 6 }}>Хавсаргасан файлууд:</div>
                        {selected.buyer_attachments.map((file: any, idx: number) => (
                          <DownloadFileItem key={idx} file={file} />
                        ))}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* НИЙЛҮҮЛЭГЧИД ШААРДЛАГАТАЙ БАРИМТ БИЧГҮҮД */}
              {(supplierRequiredText || supplierRequiredFiles.length > 0 || supplierRequiredDocsList.length > 0) && (
                <Section title="Нийлүүлэгчид шаардлагатай баримт бичгүүд" accent="#10b981" Icon={ShieldCheck}>
                  <div
                    style={{
                      background: "#ecfdf5",
                      borderRadius: 14,
                      padding: "16px 18px",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    {supplierRequiredText && <SafeHTML html={supplierRequiredText} />}

                    {supplierRequiredFiles.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#065f46",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FileCheck size={12} />
                          Хавсаргасан баримт бичгүүд (татах):
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {supplierRequiredFiles.map((file: any, idx: number) => (
                            <DownloadFileItem key={idx} file={file} />
                          ))}
                        </div>
                      </div>
                    )}

                    {supplierRequiredDocsList.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#065f46",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Upload size={12} />
                          Шаардлагатай баримт бичгүүдээ хавсаргана уу:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {supplierRequiredDocsList.map((doc, idx) => {
                            const files = uploadedFiles[doc] || [];
                            return (
                              <div
                                key={idx}
                                style={{
                                  border: "1px solid #d1fae5",
                                  borderRadius: 12,
                                  overflow: "hidden",
                                  background: "white",
                                }}
                              >
                                <div
                                  style={{
                                    padding: "12px 16px",
                                    background: "#f0fdf4",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: 10,
                                    borderBottom: files.length > 0 ? "1px solid #d1fae5" : "none",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <FileText size={16} color="#059669" />
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#065f46",
                                      }}
                                    >
                                      {doc}
                                    </span>
                                    {files.length > 0 && (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          padding: "2px 10px",
                                          borderRadius: 30,
                                          background: "#d1fae5",
                                          color: "#065f46",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {files.length} файл хавсаргасан
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setCurrentDoc(doc);
                                      fileInputRef.current?.click();
                                    }}
                                    disabled={uploading}
                                    style={{
                                      padding: "6px 14px",
                                      borderRadius: 8,
                                      background: "#059669",
                                      border: "none",
                                      color: "white",
                                      fontSize: 12,
                                      fontWeight: 500,
                                      cursor: uploading ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                      opacity: uploading ? 0.6 : 1,
                                      transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!uploading) {
                                        e.currentTarget.style.background = "#047857";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!uploading) {
                                        e.currentTarget.style.background = "#059669";
                                      }
                                    }}
                                  >
                                    <Plus size={14} />
                                    Файл нэмэх
                                  </button>
                                </div>

                                {files.length > 0 && (
                                  <div
                                    style={{
                                      padding: "12px 16px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 10,
                                    }}
                                  >
                                    {files.map((file, fileIdx) => (
                                      <UploadFileItem
                                        key={fileIdx}
                                        file={file}
                                        onRemove={() => handleRemoveFile(doc, fileIdx)}
                                        onView={() => handleViewFile(file.url, file.name)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {uploading && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 16,
                          padding: "10px 14px",
                          background: "#edf7ed",
                          borderRadius: 10,
                          fontSize: 12,
                          color: "#065f46",
                        }}
                      >
                        <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                        Файл upload хийж байна...
                      </div>
                    )}

                    {totalFiles > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "8px 12px",
                          background: "#d1fae5",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#065f46",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Нийт {totalFiles} файл хавсаргагдсан
                      </div>
                    )}
                  </div>
                </Section>
              )}

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && currentDoc) {
                    handleAddFile(currentDoc, file);
                    e.target.value = "";
                  }
                }}
              />

              {/* Author footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 14,
                  background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)",
                  border: "1px solid #e2e8f0",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {selected.created_by_name ? (
                    <>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 11,
                          background: "linear-gradient(135deg,#0072BC,#3b9be0)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {selected.created_by_name[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0f172a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected.created_by_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                          Нийтэлсэн • {new Date(selected.created_at).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>Bodi Group</span>
                  )}
                </div>
                {(selected.bid_count ?? 0) > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "white", border: "1px solid #bae6fd" }}>
                    <Send size={11} color="#0072BC" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0072BC" }}>{selected.bid_count} хүсэлт</span>
                  </div>
                )}
              </div>
            </div>

            {/* STICKY FOOTER */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                borderTop: "1px solid #e2e8f0",
                padding: isMobile ? "14px 18px" : "18px 40px",
                display: "flex",
                gap: 10,
                boxShadow: "0 -4px 14px rgba(0,0,0,0.04)",
                paddingBottom: isMobile ? "calc(14px + env(safe-area-inset-bottom))" : 18,
              }}
            >
              <button
                onClick={() => setSelected(null)}
                style={{
                  flex: isMobile ? 1 : "0 0 auto",
                  padding: "13px 22px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Хаах
              </button>
              <button
                onClick={() => {
                  if (isExpired) return;
                  setBidModal(true);
                  setBidError("");
                }}
                disabled={isExpired}
                style={{
                  flex: 1,
                  padding: "13px 26px",
                  borderRadius: 12,
                  border: "none",
                  background: isExpired ? "#e2e8f0" : "linear-gradient(135deg,#0072BC,#3b9be0)",
                  color: isExpired ? "#94a3b8" : "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isExpired ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: isExpired ? "none" : "0 8px 20px rgba(0,114,188,0.35)",
                }}
              >
                {isExpired ? "Хугацаа дууссан" : <><Send size={15} /> Хүсэлт илгээх</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BID MODAL */}
      {bidModal && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : "20px 16px",
            animation: "fadeIn .2s ease",
          }}
          onClick={() => !bidSaving && setBidModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 520,
              background: "white",
              borderRadius: isMobile ? "24px 24px 0 0" : 24,
              boxShadow: "0 32px 80px rgba(15,23,42,0.5)",
              animation: isMobile ? "slideUp .3s cubic-bezier(0.34,1.3,0.64,1)" : "modalIn .25s cubic-bezier(0.34,1.3,0.64,1)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {bidDone ? (
              <div style={{ padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "successPop .5s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  <CheckCircle2 size={48} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Хүсэлт илгээгдлээ!</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.55, maxWidth: 320 }}>
                    Таны хүсэлтийг хүлээж авлаа. Админ хариуг тань удахгүй мэдэгдэх болно.
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ padding: isMobile ? "22px 22px 18px" : "26px 28px 22px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: "linear-gradient(135deg,#0072BC 0%,#3b9be0 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Send size={22} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Хүсэлт гаргах</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selected.title}
                      </div>
                    </div>
                    <button
                      onClick={() => !bidSaving && setBidModal(false)}
                      disabled={bidSaving}
                      style={{
                        width: 34,
                        height: 34,
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        borderRadius: 10,
                        cursor: bidSaving ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: bidSaving ? 0.5 : 1,
                      }}
                    >
                      <X size={16} style={{ color: "#64748b" }} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: isMobile ? "22px" : "24px 28px" }}>
                  {bidError && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.5 }}>{bidError}</div>
                    </div>
                  )}

                  {/* Шаардлагатай баримт бичгүүд хавсаргах */}
                  {supplierRequiredDocsList.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#475569",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FileText size={12} />
                        Шаардлагатай баримт бичгүүд
                        {totalFiles === 0 && (
                          <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 400 }}>
                            (заавал хавсаргах шаардлагатай)
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          background: "#ecfdf5",
                          borderRadius: 14,
                          padding: "16px 18px",
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        {supplierRequiredDocsList.map((doc, idx) => {
                          const files = uploadedFiles[doc] || [];
                          const hasFiles = files.length > 0;
                          return (
                            <div
                              key={idx}
                              style={{
                                marginBottom: idx < supplierRequiredDocsList.length - 1 ? 16 : 0,
                                border: hasFiles ? "1px solid #d1fae5" : "1px dashed #d1fae5",
                                borderRadius: 12,
                                overflow: "hidden",
                                background: hasFiles ? "white" : "transparent",
                              }}
                            >
                              <div
                                style={{
                                  padding: "12px 16px",
                                  background: hasFiles ? "#f0fdf4" : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  flexWrap: "wrap",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <FileText size={16} color={hasFiles ? "#059669" : "#94a3b8"} />
                                  <span
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: hasFiles ? "#065f46" : "#64748b",
                                    }}
                                  >
                                    {doc}
                                  </span>
                                  {!hasFiles && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 8px",
                                        borderRadius: 30,
                                        background: "#fef2f2",
                                        color: "#dc2626",
                                      }}
                                    >
                                      шаардлагатай
                                    </span>
                                  )}
                                  {hasFiles && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        padding: "2px 10px",
                                        borderRadius: 30,
                                        background: "#d1fae5",
                                        color: "#065f46",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {files.length} файл
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setCurrentDoc(doc);
                                    fileInputRef.current?.click();
                                  }}
                                  disabled={uploading}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    background: "#059669",
                                    border: "none",
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: uploading ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    opacity: uploading ? 0.6 : 1,
                                    transition: "all 0.15s",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!uploading) e.currentTarget.style.background = "#047857";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!uploading) e.currentTarget.style.background = "#059669";
                                  }}
                                >
                                  <Plus size={14} />
                                  Файл нэмэх
                                </button>
                              </div>

                              {hasFiles && (
                                <div
                                  style={{
                                    padding: "12px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    borderTop: "1px solid #d1fae5",
                                  }}
                                >
                                  {files.map((file, fileIdx) => (
                                    <UploadFileItem
                                      key={fileIdx}
                                      file={file}
                                      onRemove={() => handleRemoveFile(doc, fileIdx)}
                                      onView={() => handleViewFile(file.url, file.name)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Таны мэдээлэл хэсэг */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: "16px 18px",
                      border: "1px solid #f1f5f9",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Building2 size={12} /> Таны мэдээлэл
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { Icon: Building2, label: "Байгууллага", value: user?.company_name },
                        { Icon: Hash, label: "Нийлүүлэгчийн дугаар", value: user?.supplier_number },
                        { Icon: Mail, label: "И-мэйл", value: user?.email },
                        { Icon: Phone, label: "Утас", value: user?.phone },
                      ]
                        .filter((r) => r.value)
                        .map((row) => {
                          const RowIcon = row.Icon;
                          return (
                            <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 8,
                                  background: "white",
                                  border: "1px solid #e2e8f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <RowIcon size={13} color="#64748b" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2, fontWeight: 500 }}>{row.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{row.value}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Хавсаргасан файлын нийт тоо */}
                  {totalFiles > 0 && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#d1fae5",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#065f46",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 16,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Нийт {totalFiles} файл хавсаргагдсан
                    </div>
                  )}

                  {/* Хэрэв шаардлагатай баримт бичиг байхгүй бол анхааруулга */}
                  {supplierRequiredDocsList.length > 0 && totalFiles === 0 && !bidSaving && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "#fef2f2",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 16,
                      }}
                    >
                      <AlertCircle size={12} />
                      Та бүх шаардлагатай баримт бичгүүдийг хавсаргана уу
                    </div>
                  )}

                  {/* Үйлдлийн товчнууд */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setBidModal(false)}
                      disabled={bidSaving}
                      style={{
                        flex: 1,
                        padding: "13px",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        background: "white",
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: bidSaving ? "not-allowed" : "pointer",
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
                        padding: "13px",
                        borderRadius: 12,
                        border: "none",
                        background: "linear-gradient(135deg,#0072BC,#3b9be0)",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: bidSaving ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 8px 20px rgba(0,114,188,0.35)",
                        opacity: bidSaving ? 0.85 : 1,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!bidSaving) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,114,188,0.45)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!bidSaving) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,114,188,0.35)";
                        }
                      }}
                    >
                      {bidSaving ? (
                        <>
                          <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} />
                          Илгээж байна...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Хүсэлт илгээх
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}