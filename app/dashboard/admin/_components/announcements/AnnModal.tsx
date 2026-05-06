"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Send,
  CheckCircle2,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Layers,
  Zap,
  Building2,
  User,
  Briefcase,
  Phone,
  MapPin,
  Package,
  Wrench,
  FileText,
  Upload,
  Paperclip,
  ClipboardList,
  Truck,
  CalendarRange,
} from "lucide-react";
import { API, TYPE, jsonH, authH, inp, lbl } from "./constants";
import dynamic from "next/dynamic";
import { RecipientPicker } from "./RecipientPicker";
import type { Ann, AnnType, AttachedFile } from "./types";

// Dynamic import - SSR алдааг засах
const RichTextEditor = dynamic(
  () => import("./RichEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "40px 20px",
          textAlign: "center",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <Loader2 size={20} style={{ animation: "spin 0.8s linear infinite", color: "#94a3b8" }} />
      </div>
    ),
  },
);

// ════════════════════════════════════════════════════════════════
//  Default form values
// ════════════════════════════════════════════════════════════════
const defaultForm = (ann?: Ann | null) => ({
  title: ann?.title ?? "",
  description: ann?.description ?? "",
  requirements: ann?.requirements ?? "",
  category_id: ann?.category_id ?? "",
  budget_from: ann?.budget_from?.toString() ?? "",
  budget_to: ann?.budget_to?.toString() ?? "",
  currency: ann?.currency ?? "MNT",
  deadline: ann?.deadline?.slice(0, 10) ?? "",
  status: ann?.status ?? "draft",
  is_urgent: ann?.is_urgent ?? false,
  activity_directions: ann?.activity_directions ?? ([] as string[]),
  rfq_quantity: ann?.rfq_quantity?.toString() ?? "",
  rfq_unit: ann?.rfq_unit ?? "",
  rfq_delivery_place: ann?.rfq_delivery_place ?? "",
  rfq_delivery_date: ann?.rfq_delivery_date?.slice(0, 10) ?? "",
  rfq_specs: ann?.rfq_specs ?? "",
  recipient_type: "individual" as "individual" | "company",
  attachments: ann?.attachments ?? ([] as AttachedFile[]),
  recipient_ids: [] as string[],

  // ⭐ Шинэ талбарууд
  client_company: ann?.client_company ?? "",
  responsible_person_name: ann?.responsible_person_name ?? "",
  responsible_position: ann?.responsible_position ?? "",
  contact_phone: ann?.contact_phone ?? "",
  start_date: ann?.start_date?.slice(0, 10) ?? "",
  end_date: ann?.end_date?.slice(0, 10) ?? "",
  procurement_kind: (ann?.procurement_kind ?? "goods") as "goods" | "service",
  supply_start_date: ann?.supply_start_date?.slice(0, 10) ?? "",
  supply_end_date: ann?.supply_end_date?.slice(0, 10) ?? "",
  central_location: ann?.central_location ?? "",
  branch_location: ann?.branch_location ?? "",
  address_details: ann?.address_details ?? "",
  buyer_doc_info: ann?.buyer_doc_info ?? "",
  buyer_attachments: ann?.buyer_attachments ?? ([] as AttachedFile[]),
  supplier_doc_info: ann?.supplier_doc_info ?? "",
  supplier_required_docs: ann?.supplier_required_docs ?? ([] as AttachedFile[]),
});

// ════════════════════════════════════════════════════════════════
//  Reusable: дэд хэсгийн картын wrapper
// ════════════════════════════════════════════════════════════════
function Section({
  title,
  icon: Icon,
  accentColor,
  children,
}: {
  title: string;
  icon: any;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#334155",
        borderRadius: 14,
        padding: "14px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          color: accentColor,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
          letterSpacing: "0.05em",
        }}
      >
        <Icon size={12} /> {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Reusable: input field-ын labelтай wrapper
// ════════════════════════════════════════════════════════════════
function Field({
  label: labelText,
  required,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  icon?: any;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          ...lbl,
          color: "#cbd5e1",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {Icon && <Icon size={11} style={{ color: "#94a3b8" }} />}
        {labelText} {required && <span style={{ color: "#ef4444" }}>*</span>}
        {hint && (
          <span
            style={{
              fontSize: 9,
              color: "#64748b",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              marginLeft: 4,
            }}
          >
            ({hint})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Reusable: олон файл хуулах picker
// ════════════════════════════════════════════════════════════════
function FilePicker({
  files,
  onChange,
  accentColor,
  label = "Файл сонгох",
}: {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
  accentColor: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    const newFiles: AttachedFile[] = [];
    for (const file of Array.from(fileList)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`${API}/api/announcements/upload-attachment`, {
          method: "POST",
          headers: authH(),
          body: fd,
        });
        const data = await res.json();
        if (data.success || data.url) {
          newFiles.push({
            name: data.name ?? file.name,
            size: data.size ?? file.size,
            type: data.type ?? file.type,
            url: data.url,
            isImage: (data.type ?? file.type ?? "").startsWith("image/"),
          });
        }
      } catch (err) {
        console.error("upload error", err);
      }
    }
    onChange([...files, ...newFiles]);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1.5px dashed rgba(255,255,255,0.15)",
          cursor: uploading ? "not-allowed" : "pointer",
          color: uploading ? "#64748b" : "#94a3b8",
          fontSize: 12,
          fontWeight: 500,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.color = accentColor;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = uploading ? "#64748b" : "#94a3b8";
        }}
      >
        {uploading ? (
          <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
        ) : (
          <Upload size={14} />
        )}
        {uploading ? "Хуулж байна..." : `${label} (олон сонголт)`}
        <input
          type="file"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Paperclip size={12} style={{ color: accentColor, flexShrink: 0 }} />
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: "white",
                  textDecoration: "none",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name}
              </a>
              <span style={{ fontSize: 10, color: "#64748b", flexShrink: 0 }}>
                {(f.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "none",
                  borderRadius: 6,
                  padding: 4,
                  cursor: "pointer",
                  color: "#f87171",
                  display: "flex",
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
  );
}

// ════════════════════════════════════════════════════════════════
//  Дотор-talbar styling shortcuts
// ════════════════════════════════════════════════════════════════
const inputStyle: React.CSSProperties = {
  ...inp,
  height: 44,
  background: "#334155",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "white",
};

const innerInputStyle: React.CSSProperties = {
  ...inp,
  height: 40,
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
};

// ════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export function AnnModal({
  mode,
  ann,
  onClose,
  onSave,
  showToast,
}: {
  mode: "create" | "edit";
  ann?: Ann | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [step, setStep] = useState<AnnType | null>(ann?.ann_type ?? null);
  const [form, setForm] = useState(defaultForm(ann));
  const [cats, setCats] = useState<any[]>([]);
  const [dirs, setDirs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const annType = (mode === "edit" ? ann?.ann_type : step) ?? "open";
  const curType = TYPE[annType];
  const TIcon = curType.icon;

  const isDirty =
    form.title.trim() !== "" ||
    form.description.trim() !== "" ||
    form.requirements.trim() !== "" ||
    form.client_company.trim() !== "" ||
    form.responsible_person_name.trim() !== "" ||
    form.recipient_ids.length > 0 ||
    form.activity_directions.length > 0 ||
    form.budget_from !== "" ||
    form.budget_to !== "" ||
    form.rfq_quantity !== "" ||
    form.rfq_specs !== "" ||
    form.attachments.length > 0 ||
    form.buyer_attachments.length > 0 ||
    form.supplier_required_docs.length > 0;

  // Body scroll унтраах
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const safeClose = useCallback(() => {
    if (isDirty && mode === "create") {
      const ok = window.confirm("Бөглөсөн мэдээлэл устах болно. Үнэхээр гарах уу?");
      if (!ok) return;
    }
    onClose();
  }, [isDirty, mode, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [safeClose]);

  // Categories + activity directions
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((d) => {
        const flat: any[] = [];
        const walk = (c: any[]) =>
          c.forEach((x) => {
            flat.push(x);
            walk(x.children ?? []);
          });
        walk(d.categories ?? []);
        setCats(flat);
      })
      .catch(() => {});
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        setDirs((d.directions ?? []).filter((x: any) => x.is_active));
      })
      .catch(() => {});
  }, []);

  // ⭐ Auto-fill contact_phone — өөрийн profile-ийг fetch хийх
  // (хэрэв /api/admins/me байхгүй бол silently fail болно)
  useEffect(() => {
    if (mode !== "create" || form.contact_phone) return;
    const tryEndpoints = [
      `${API}/api/admins/me`,
      `${API}/api/auth/me`,
      `${API}/api/me`,
    ];
    (async () => {
      for (const url of tryEndpoints) {
        try {
          const res = await fetch(url, { headers: authH() });
          if (!res.ok) continue;
          const d = await res.json();
          const user = d.admin ?? d.user ?? d.data ?? d;
          const phone = user?.phone ?? user?.contact_phone;
          if (phone) {
            setForm((p) => ({ ...p, contact_phone: phone }));
            break;
          }
        } catch {
          /* silent */
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const toggleDir = (l: string) =>
    setForm((p) => ({
      ...p,
      activity_directions: p.activity_directions.includes(l)
        ? p.activity_directions.filter((x) => x !== l)
        : [...p.activity_directions, l],
    }));

  // ════════════════════════════════════════════════════════════════
  //  SAVE
  // ════════════════════════════════════════════════════════════════
  const save = async () => {
    if (!form.title.trim()) {
      setError("Зарын нэр шаардлагатай");
      return;
    }
    if (annType === "targeted" && form.recipient_ids.length === 0) {
      setError("Нийлүүлэгч сонгоно уу");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: any = {
        ...form,
        ann_type: annType,
        budget_from: form.budget_from ? Number(form.budget_from) : null,
        budget_to: form.budget_to ? Number(form.budget_to) : null,
        rfq_quantity: form.rfq_quantity ? Number(form.rfq_quantity) : null,
        category_id: form.category_id || null,
        deadline: form.deadline || null,
        rfq_delivery_date: form.rfq_delivery_date || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        supply_start_date: form.supply_start_date || null,
        supply_end_date: form.supply_end_date || null,
      };
      if (annType !== "targeted" && annType !== "rfq") {
        delete body.recipient_ids;
        delete body.recipient_type;
      }
      if (annType === "rfq" && body.recipient_ids?.length === 0) {
        delete body.recipient_ids;
        delete body.recipient_type;
      }

      const res = await fetch(
        mode === "create"
          ? `${API}/api/announcements`
          : `${API}/api/announcements/${ann!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: jsonH(),
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(mode === "create" ? "Зарлал үүслээ ✓" : "Хадгаллаа ✓");
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  //  TYPE SELECTOR (Create flow эхэнд)
  // ════════════════════════════════════════════════════════════════
  if (mode === "create" && !step) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          padding: "20px",
        }}
        onClick={safeClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#1e293b",
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
            animation: "fadeIn 0.2s ease",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>
                Худалдан авалтын арга сонгох
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Зорилгоос хамааран сонгоно уу
              </p>
            </div>
            <button
              onClick={safeClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: 8,
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(Object.entries(TYPE) as [AnnType, (typeof TYPE)[AnnType]][]).map(([t, c]) => {
              const I = c.icon;
              return (
                <button
                  key={t}
                  onClick={() => setStep(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    background: "#334155",
                    border: `1px solid ${c.color}30`,
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.color;
                    e.currentTarget.style.background = `${c.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${c.color}30`;
                    e.currentTarget.style.background = "#334155";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `${c.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I size={22} style={{ color: c.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>
                      {t === "open"
                        ? "Тендер нээлттэй"
                        : t === "targeted"
                          ? "Тендер хаалттай"
                          : "Үнийн санал"}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                      {c.desc}
                    </div>
                  </div>
                  <ChevronDown size={16} style={{ color: "#64748b" }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  MAIN MODAL
  // ════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          background: "#1e293b",
          borderRadius: 24,
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
          animation: "fadeIn 0.2s ease",
          margin: "auto",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {mode === "create" && (
            <button
              onClick={() => {
                if (isDirty) {
                  const ok = window.confirm("Бөглөсөн мэдээлэл устах болно. Буцах уу?");
                  if (!ok) return;
                }
                setStep(null);
              }}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 500,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              ← Буцах
            </button>
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: `${curType.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TIcon size={18} style={{ color: curType.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
              {mode === "create" ? "Шинэ" : "Засах"} — {curType.label}
            </h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{curType.desc}</p>
          </div>
          <button
            onClick={safeClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px", maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* ─── 1. Зарын нэр ─── */}
            <Field label="Зарын нэр" required>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                style={inputStyle}
                placeholder="Зарлалын гарчиг"
                onFocus={(e) => {
                  e.target.style.borderColor = curType.color;
                  e.target.style.boxShadow = `0 0 0 2px ${curType.color}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </Field>

            {/* ─── 2. ҮНДСЭН МЭДЭЭЛЭЛ ─── */}
            <Section title="Үндсэн мэдээлэл" icon={Building2} accentColor={curType.color}>
              <Field label="Захиалагч компани" required icon={Building2}>
                <input
                  value={form.client_company}
                  onChange={(e) => setForm((p) => ({ ...p, client_company: e.target.value }))}
                  style={innerInputStyle}
                  placeholder="Захиалагч компанийн нэр"
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Хариуцах ажилтны нэр" required icon={User}>
                  <input
                    value={form.responsible_person_name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, responsible_person_name: e.target.value }))
                    }
                    style={innerInputStyle}
                    placeholder="Овог нэр"
                  />
                </Field>
                <Field label="Албан тушаал" required icon={Briefcase}>
                  <input
                    value={form.responsible_position}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, responsible_position: e.target.value }))
                    }
                    style={innerInputStyle}
                    placeholder="Албан тушаал"
                  />
                </Field>
              </div>

              <Field label="Холбоо барих утас" required icon={Phone} hint="auto-fill хийгдэнэ">
                <input
                  value={form.contact_phone}
                  onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
                  style={innerInputStyle}
                  placeholder="99000000"
                  type="tel"
                />
              </Field>
            </Section>

            {/* ─── 3. ОГНОО ─── */}
            <Section title="Зарлалын хугацаа" icon={CalendarRange} accentColor={curType.color}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Эхлэх огноо" required icon={Calendar}>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                    style={innerInputStyle}
                  />
                </Field>
                <Field label="Дуусах огноо" required icon={Calendar}>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                    style={innerInputStyle}
                  />
                </Field>
              </div>
              <Field label="Үнийн санал өгөх огноо" required icon={Calendar}>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  style={innerInputStyle}
                />
              </Field>
            </Section>

            {/* ─── 4. ЗАРЫН ДЭЛГЭРЭНГҮЙ — Категори, Худалдан авалтын төрөл ─── */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#cbd5e1",
                marginTop: 8,
                marginBottom: -4,
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ClipboardList size={12} /> Зарын дэлгэрэнгүй мэдээлэл
            </div>

            <Field label="Ангилал" required icon={Layers}>
              <div style={{ position: "relative" }}>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 32,
                  }}
                >
                  <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>
                    — Сонгох —
                  </option>
                  {cats.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      style={{ background: "#1e293b", color: "white" }}
                    >
                      {c.category_number}. {c.category_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </Field>

            {/* Худалдан авалтын төрөл (Бараа/Үйлчилгээ) + Яаралтай */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <Field label="Худалдан авалтын төрөл" required>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { v: "goods", label: "Бараа материал", icon: Package },
                    { v: "service", label: "Ажил үйлчилгээ", icon: Wrench },
                  ].map(({ v, label, icon: I }) => {
                    const sel = form.procurement_kind === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, procurement_kind: v as any }))
                        }
                        style={{
                          flex: 1,
                          height: 44,
                          padding: "0 14px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          border: sel
                            ? `1px solid ${curType.color}`
                            : "1px solid rgba(255,255,255,0.12)",
                          background: sel
                            ? `${curType.color}20`
                            : "#334155",
                          color: sel ? curType.color : "#cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          transition: "all 0.15s",
                        }}
                      >
                        <I size={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, is_urgent: !p.is_urgent }))}
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  border: form.is_urgent
                    ? "1px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.15)",
                  background: form.is_urgent
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(255,255,255,0.05)",
                  color: form.is_urgent ? "#f87171" : "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                <Zap size={14} />
                {form.is_urgent ? "Яаралтай" : "Яаралтай биш"}
              </button>
            </div>

            {/* Activity directions */}
            {dirs.length > 0 && (
              <Field label="Үйл ажиллагааны чиглэл" icon={Layers}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {dirs.map((d) => {
                    const sel = form.activity_directions.includes(d.label);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDir(d.label)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                          border: sel
                            ? `1px solid ${curType.color}`
                            : "1px solid rgba(255,255,255,0.12)",
                          background: sel ? `${curType.color}20` : "rgba(255,255,255,0.05)",
                          color: sel ? curType.color : "#cbd5e1",
                          transition: "all 0.15s",
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}

            {/* Description editor */}
            <Field label="Тайлбар">
              <RichTextEditor
                value={form.description}
                onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                placeholder="Дэлгэрэнгүй тайлбар..."
                files={form.attachments}
                onFilesChange={(files) => setForm((p) => ({ ...p, attachments: files }))}
                accentColor={curType.color}
              />
            </Field>

            {/* Budget */}
            <Field label="Төсөв" icon={DollarSign}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px", gap: 8 }}>
                <input
                  type="number"
                  value={form.budget_from}
                  onChange={(e) => setForm((p) => ({ ...p, budget_from: e.target.value }))}
                  style={inputStyle}
                  placeholder="Доод дүн"
                />
                <input
                  type="number"
                  value={form.budget_to}
                  onChange={(e) => setForm((p) => ({ ...p, budget_to: e.target.value }))}
                  style={inputStyle}
                  placeholder="Дээд дүн"
                />
                <div style={{ position: "relative" }}>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      appearance: "none",
                      paddingRight: 28,
                    }}
                  >
                    <option value="MNT" style={{ background: "#1e293b" }}>
                      ₮ MNT
                    </option>
                    <option value="USD" style={{ background: "#1e293b" }}>
                      $ USD
                    </option>
                    <option value="EUR" style={{ background: "#1e293b" }}>
                      € EUR
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            </Field>

            {/* RFQ Details */}
            {annType === "rfq" && (
              <Section title="Үнийн санал" icon={TrendingUp} accentColor={curType.color}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input
                    type="number"
                    value={form.rfq_quantity}
                    onChange={(e) => setForm((p) => ({ ...p, rfq_quantity: e.target.value }))}
                    style={innerInputStyle}
                    placeholder="Тоо хэмжээ"
                  />
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.rfq_unit}
                      onChange={(e) => setForm((p) => ({ ...p, rfq_unit: e.target.value }))}
                      style={{
                        ...innerInputStyle,
                        cursor: "pointer",
                        appearance: "none",
                        paddingRight: 28,
                      }}
                    >
                      <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>
                        Нэгж сонгох
                      </option>
                      {["Ширхэг", "Багц", "Хоног", "Боодол", "Хайрцаг", "Хос", "м3", "тонн"].map(
                        (u) => (
                          <option
                            key={u}
                            value={u}
                            style={{ background: "#1e293b", color: "white" }}
                          >
                            {u}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown
                      size={12}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
                <input
                  value={form.rfq_delivery_place}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rfq_delivery_place: e.target.value }))
                  }
                  style={innerInputStyle}
                  placeholder="Хүргэлтийн газар"
                />
                <input
                  type="date"
                  value={form.rfq_delivery_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rfq_delivery_date: e.target.value }))
                  }
                  style={innerInputStyle}
                />
                <textarea
                  value={form.rfq_specs}
                  onChange={(e) => setForm((p) => ({ ...p, rfq_specs: e.target.value }))}
                  rows={2}
                  style={{
                    ...innerInputStyle,
                    height: "auto",
                    resize: "vertical",
                    padding: "10px 14px",
                  }}
                  placeholder="Техникийн тодорхойлолт"
                />
              </Section>
            )}

            {/* Recipients */}
            {(annType === "targeted" || annType === "rfq") && (
              <Field
                label="Хэнд илгээх"
                icon={Users}
                hint={annType === "rfq" ? "сонгоогүй бол бүгдэд" : undefined}
              >
                <RecipientPicker
                  form={form}
                  setForm={setForm}
                  directions={dirs}
                  accentColor={curType.color}
                  optional={annType === "rfq"}
                />
              </Field>
            )}

            {/* ─── 5. БАРАА МАТЕРИАЛ НИЙЛҮҮЛЭХ ХУГАЦАА ─── */}
            <Section
              title="Бараа материал / ажил үйлчилгээ нийлүүлэх хугацаа"
              icon={Truck}
              accentColor={curType.color}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Эхлэх огноо" required icon={Calendar}>
                  <input
                    type="date"
                    value={form.supply_start_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, supply_start_date: e.target.value }))
                    }
                    style={innerInputStyle}
                  />
                </Field>
                <Field label="Дуусах огноо" required icon={Calendar}>
                  <input
                    type="date"
                    value={form.supply_end_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, supply_end_date: e.target.value }))
                    }
                    style={innerInputStyle}
                  />
                </Field>
              </div>
            </Section>

            {/* ─── 6. БАРАА МАТЕРИАЛ НИЙЛҮҮЛЭХ БАЙРШИЛ ─── */}
            <Section
              title="Бараа материал нийлүүлэх байршил"
              icon={MapPin}
              accentColor={curType.color}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Худалдан авалтын төв байршил" required icon={MapPin}>
                  <input
                    value={form.central_location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, central_location: e.target.value }))
                    }
                    style={innerInputStyle}
                    placeholder="Жишээ: Улаанбаатар"
                  />
                </Field>
                <Field label="Салбар байршил" required icon={MapPin}>
                  <input
                    value={form.branch_location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, branch_location: e.target.value }))
                    }
                    style={innerInputStyle}
                    placeholder="Жишээ: Сүхбаатар дүүрэг"
                  />
                </Field>
              </div>
              <Field label="Хаягийн дэлгэрэнгүй мэдээлэл">
                <textarea
                  value={form.address_details}
                  onChange={(e) => setForm((p) => ({ ...p, address_details: e.target.value }))}
                  rows={2}
                  style={{
                    ...innerInputStyle,
                    height: "auto",
                    resize: "vertical",
                    padding: "10px 14px",
                  }}
                  placeholder="Дэлгэрэнгүй хаяг..."
                />
              </Field>
            </Section>

            {/* ─── 7. НИЙЛҮҮЛЭГЧИД ТАВИГДАХ ШААРДЛАГА ─── */}
            <Field label="Нийлүүлэгчид тавигдах шаардлага">
              <RichTextEditor
                value={form.requirements}
                onChange={(v) => setForm((p) => ({ ...p, requirements: v }))}
                placeholder="Тусгай зөвшөөрөл, туршлага, мэргэжлийн шаардлага..."
                files={[]}
                onFilesChange={() => {}}
                accentColor={curType.color}
              />
            </Field>

            {/* ─── 8. ЗАХИАЛАГЧИЙН БАРИМТ БИЧИГ ─── */}
            <Section
              title="Захиалагчийн баримт бичиг"
              icon={FileText}
              accentColor={curType.color}
            >
              <Field label="Захиалагчийн баримт бичигтэй холбоотой мэдээлэл">
                <RichTextEditor
                  value={form.buyer_doc_info}
                  onChange={(v) => setForm((p) => ({ ...p, buyer_doc_info: v }))}
                  placeholder="Захиалагчийн талаас өгөх баримт бичгийн тайлбар..."
                  files={[]}
                  onFilesChange={() => {}}
                  accentColor={curType.color}
                />
              </Field>
              <Field label="Захиалагчийн баримт бичиг" hint="олон файл">
                <FilePicker
                  files={form.buyer_attachments}
                  onChange={(files) =>
                    setForm((p) => ({ ...p, buyer_attachments: files }))
                  }
                  accentColor={curType.color}
                  label="Файл хуулах"
                />
              </Field>
            </Section>

            {/* ─── 9. НИЙЛҮҮЛЭГЧЭЭС ШААРДАХ БАРИМТ ─── */}
            <Section
              title="Нийлүүлэгчээс авах баримт бичиг"
              icon={ClipboardList}
              accentColor={curType.color}
            >
              <Field label="Нийлүүлэгчийн баримт бичигтэй холбоотой мэдээлэл">
                <RichTextEditor
                  value={form.supplier_doc_info}
                  onChange={(v) => setForm((p) => ({ ...p, supplier_doc_info: v }))}
                  placeholder="Нийлүүлэгчээс шаардах баримтын тайлбар..."
                  files={[]}
                  onFilesChange={() => {}}
                  accentColor={curType.color}
                />
              </Field>
              <Field label="Нийлүүлэгчээс авах загвар бичиг баримт" hint="олон файл">
                <FilePicker
                  files={form.supplier_required_docs}
                  onChange={(files) =>
                    setForm((p) => ({ ...p, supplier_required_docs: files }))
                  }
                  accentColor={curType.color}
                  label="Файл хуулах"
                />
              </Field>
            </Section>

            {/* ─── СТАТУС ─── */}
            <Field label="Статус">
              <div style={{ position: "relative" }}>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 28,
                  }}
                >
                  <option value="draft" style={{ background: "#1e293b" }}>
                    📄 Ноорог
                  </option>
                  <option value="published" style={{ background: "#1e293b" }}>
                    🌍 Нийтлэх
                  </option>
                  <option value="closed" style={{ background: "#1e293b" }}>
                    🔒 Хаах
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </Field>

            {/* ─── ACTIONS ─── */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={safeClose}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                Болих
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 10,
                  border: "none",
                  background:
                    form.status === "published"
                      ? "linear-gradient(135deg, #059669, #10b981)"
                      : "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: saving ? 0.7 : 1,
                  transition: "all 0.15s",
                }}
              >
                {saving ? (
                  <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                ) : form.status === "published" ? (
                  <Send size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {saving
                  ? "Хадгалж байна..."
                  : form.status === "published"
                    ? "Нийтлэх"
                    : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}