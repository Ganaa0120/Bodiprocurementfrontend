"use client";
import { useEffect, useState, useRef } from "react";
import {
  Pencil,
  X,
  Check,
  Upload,
  Loader2,
  AlertCircle,
  ChevronDown,
  User,
  MapPin,
  Briefcase,
  FileText,
  Bell,
  CheckCircle,
  Camera,
  Shield,
  Search,
  Send,
  Save,
} from "lucide-react";
import {
  validateMongolianForm,
  isMongolian,
} from "@/utils/mongolianValidation";
import { UB_DUUREG, AIMAG_SUM } from "@/constants/addressData";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AIMAG = [
  "Улаанбаатар",
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Орхон",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
];

const PERSON_STATUS = {
  new: { label: "Бүртгэл үүсгэх", bg: "#f0f9ff", color: "#0369a1" },
  pending: { label: "Хянагдаж байна", bg: "#fffbeb", color: "#92400e" },
  active: { label: "✓ Баталгаажсан", bg: "#dcfce7", color: "#166534" },
  approved: { label: "✓ Баталгаажсан", bg: "#dcfce7", color: "#166534" },
  returned: { label: "Буцаагдсан", bg: "#fef2f2", color: "#991b1b" },
};

const BLANK = {
  family_name: "",
  last_name: "",
  first_name: "",
  birth_date: "",
  gender: "",
  phone: "",
  aimag_niislel: "",
  sum_duureg: "",
  bag_horoo: "",
  toot: "",
  address_different: false,
  orshisuugaa_hayag: "",
  activity_description: "",
  activity_start_date: "",
  is_vat_payer: false,
  notification_type: "email",
  notification_preference: "all",
  supply_direction: "",
};

const REQUIRED_FIELDS = [
  { key: "family_name", label: "Ургийн овог" },
  { key: "last_name", label: "Овог" },
  { key: "first_name", label: "Нэр" },
  { key: "birth_date", label: "Төрсөн огноо" },
  { key: "gender", label: "Хүйс" },
  { key: "phone", label: "Утасны дугаар" },
  { key: "aimag_niislel", label: "Аймаг / Нийслэл" },
  { key: "sum_duureg", label: "Сум / Дүүрэг" },
  { key: "bag_horoo", label: "Баг / Хороо" },
  { key: "supply_direction", label: "Нийлүүлэх төрөл" },
  { key: "activity_start_date", label: "Үйл ажиллагаа эхэлсэн огноо" },
];

type DirItem = {
  id: number;
  label: string;
  children: { id: number; label: string }[];
};
type SelDir = { main_id: number; sub_ids: number[] };

// ── Helpers ───────────────────────────────────────────────────

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

function fmtDate(v?: string | null) {
  if (!v) return null;
  try {
    return new Date(v).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return v;
  }
}

function calcPct(
  form: any,
  selDirs: SelDir[],
  previews: Record<string, string>,
) {
  const scored = [
    { v: form.last_name, w: 8 },
    { v: form.first_name, w: 8 },
    { v: form.family_name, w: 4 },
    { v: form.birth_date, w: 8 },
    { v: form.gender, w: 6 },
    { v: form.phone, w: 8 },
    { v: form.aimag_niislel, w: 6 },
    { v: form.sum_duureg, w: 4 },
    { v: form.bag_horoo, w: 4 },
    { v: form.toot, w: 2 },
    { v: form.activity_description, w: 4 },
    { v: form.activity_start_date, w: 3 },
    { v: selDirs.length > 0, w: 10 },
    { v: previews.profile_photo, w: 10 },
    { v: previews.id_card_front, w: 10 },
    { v: previews.id_card_back, w: 8 },
    { v: previews.activity_intro, w: 5 },
  ];
  const total = scored.reduce((s, x) => s + x.w, 0);
  const earned = scored.reduce((s, x) => s + (x.v ? x.w : 0), 0);
  return Math.round((earned / total) * 100);
}

const S = {
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#94a3b8",
    display: "block" as const,
    marginBottom: 6,
  } as React.CSSProperties,
};

// ── Sub-components ────────────────────────────────────────────

function FInput({
  label,
  value,
  onChange,
  editing,
  type = "text",
  placeholder,
  mono = false,
  fieldError,
  disabled,
}: any) {
  const display = type === "date" && !editing ? fmtDate(value) : value;
  return (
    <div>
      {label && <label style={S.label}>{label}</label>}
      {editing ? (
        <>
          <input
            type={type}
            value={value}
            onChange={(e) => !disabled && onChange(e.target.value)}
            placeholder={placeholder || label || ""}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: fieldError
                ? "1.5px solid #ef4444"
                : disabled
                  ? "1.5px solid #f1f5f9"
                  : "1.5px solid #e2e8f0",
              fontSize: 13,
              color: disabled ? "#94a3b8" : "#1e293b",
              outline: "none",
              background: disabled
                ? "#f8fafc"
                : fieldError
                  ? "#fff5f5"
                  : "white",
              boxSizing: "border-box" as const,
              fontFamily: mono ? "monospace" : "inherit",
              cursor: disabled ? "not-allowed" : "text",
              transition: "border-color .15s",
            }}
            onFocus={(e) => {
              if (!disabled)
                (e.target as HTMLElement).style.borderColor = fieldError
                  ? "#ef4444"
                  : "#6366f1";
            }}
            onBlur={(e) => {
              if (!disabled)
                (e.target as HTMLElement).style.borderColor = fieldError
                  ? "#ef4444"
                  : "#e2e8f0";
            }}
          />
          {fieldError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 500 }}>
                {fieldError}
              </span>
            </div>
          )}
          {/* ✅ disabled бол түгжээний тайлбар */}
          {disabled && (
            <div style={{ fontSize: 10, color: "#b0bec5", marginTop: 3 }}>
              🔒 Өөрчлөх боломжгүй
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: display ? "#1e293b" : "#cbd5e1",
            padding: "10px 0",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: display ? 500 : 400,
            fontFamily: mono ? "monospace" : "inherit",
            wordBreak: "break-word",
          }}
        >
          {display || "—"}
        </div>
      )}
    </div>
  );
}

function FSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  editing,
}: any) {
  return (
    <div>
      {label && <label style={S.label}>{label}</label>}
      {editing ? (
        <div style={{ position: "relative" }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 36px 10px 14px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              fontSize: 13,
              color: value ? "#1e293b" : "#94a3b8",
              outline: "none",
              background: "white",
              appearance: "none" as const,
              cursor: "pointer",
              boxSizing: "border-box" as const,
            }}
            onFocus={(e) =>
              ((e.target as HTMLElement).style.borderColor = "#6366f1")
            }
            onBlur={(e) =>
              ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
            }
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o: any) => (
              <option key={o.value || o} value={o.value || o}>
                {o.label || o}
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
      ) : (
        <div
          style={{
            fontSize: 13,
            color: value ? "#1e293b" : "#cbd5e1",
            padding: "10px 0",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: value ? 500 : 400,
          }}
        >
          {options.find((o: any) => (o.value || o) === value)?.label ||
            value ||
            "—"}
        </div>
      )}
    </div>
  );
}

function FRadio({ label, value, onChange, options, editing }: any) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
        {options.map((o: any) => {
          const sel = value === o.value;
          return editing ? (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 10,
                cursor: "pointer",
                border: sel ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                background: sel ? "#eef2ff" : "white",
                color: sel ? "#4f46e5" : "#64748b",
                fontSize: 13,
                fontWeight: sel ? 600 : 400,
                transition: "all .15s",
                fontFamily: "inherit",
              }}
            >
              {o.label}
            </button>
          ) : (
            <span
              key={String(o.value)}
              style={{
                fontSize: 13,
                padding: "9px 0",
                color: sel ? "#4f46e5" : "#cbd5e1",
                fontWeight: sel ? 600 : 400,
                borderBottom: sel ? "2px solid #6366f1" : "1px solid #f1f5f9",
                flex: 1,
                textAlign: "center" as const,
              }}
            >
              {o.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function DocCard({
  label,
  fieldKey,
  preview,
  onFile,
  editing,
  accept = "image/*",
  required = false,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const isDoc = accept.includes("pdf") || accept.includes(".doc");

  const savedName =
    preview && !preview.startsWith("blob:")
      ? decodeURIComponent(preview.split("/").pop()?.split("?")[0] || "")
      : "";

  const acceptHint = accept.includes("pdf") ? "PDF, DOC, Зураг" : "Зураг";

  return (
    <div
      style={{
        background: "white",
        border: `0.5px ${preview ? "solid #a7f3d0" : "dashed #e2e8f0"}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "all .15s",
      }}
    >
      {/* Preview хэсэг */}
      <div
        onClick={() => editing && inputRef.current?.click()}
        style={{
          height: 110,
          background: preview ? (isDoc ? "#fff7ed" : "transparent") : "#fafafa",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          cursor: editing ? "pointer" : "default",
          position: "relative",
          overflow: "hidden",
          gap: 6,
          transition: "background .15s",
        }}
        onMouseEnter={(e) => {
          if (editing)
            (e.currentTarget as HTMLElement).style.background = preview
              ? isDoc
                ? "#ffedd5"
                : "rgba(0,0,0,0.04)"
              : "#f1f5f9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = preview
            ? isDoc
              ? "#fff7ed"
              : "transparent"
            : "#fafafa";
        }}
      >
        {preview ? (
          isDoc ? (
            <>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ea580c"
                strokeWidth={1.5}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#ea580c",
                  letterSpacing: "0.05em",
                }}
              >
                PDF
              </span>
              {!preview.startsWith("blob:") && (
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 10,
                    color: "#6366f1",
                    textDecoration: "underline",
                  }}
                >
                  Харах
                </a>
              )}
            </>
          ) : (
            <img
              src={preview}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        ) : (
          <>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "white",
                border: "0.5px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={16} style={{ color: "#94a3b8" }} />
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {editing ? "Дарж оруулах" : "Байхгүй"}
            </span>
          </>
        )}

        {/* Hover — солих */}
        {editing && preview && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "1")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "0")
            }
          >
            <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>
              Солих
            </span>
          </div>
        )}

        {/* Байна badge */}
        {preview && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(255,255,255,0.92)",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 10,
              fontWeight: 600,
              color: "#059669",
            }}
          >
            ✓ Байна
          </div>
        )}
      </div>

      {/* Info хэсэг */}
      <div style={{ padding: "10px 12px", borderTop: "0.5px solid #f1f5f9" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
          )}
        </div>

        {/* Шинэ файл */}
        {fileName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 6,
              background: "#fffbeb",
              border: "0.5px solid #fde68a",
            }}
          >
            <FileText size={11} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 10,
                color: "#92400e",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
                flex: 1,
              }}
            >
              {fileName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#f59e0b",
                whiteSpace: "nowrap" as const,
              }}
            >
              Хадгалагдаагүй
            </span>
          </div>
        )}

        {/* DB-аас ирсэн */}
        {!fileName && savedName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 6,
              background: "#f0fdf4",
              border: "0.5px solid #a7f3d0",
            }}
          >
            <FileText size={11} style={{ color: "#059669", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 10,
                color: "#065f46",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
                flex: 1,
              }}
            >
              {savedName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#6ee7b7",
                whiteSpace: "nowrap" as const,
              }}
            >
              ✓ Хадгалагдсан
            </span>
          </div>
        )}

        {/* Hint */}
        {!fileName && !savedName && (
          <div style={{ fontSize: 10, color: "#94a3b8" }}>
            {acceptHint} · 10MB хүртэл
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            alert("10MB-аас хэтэрсэн байна");
            e.target.value = "";
            return;
          }
          setFileName(file.name);
          onFile(fieldKey, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} style={{ color: "#6366f1" }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 28,
    c = 2 * Math.PI * r;
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#6366f1";
  return (
    <svg width={72} height={72} viewBox="0 0 72 72">
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={5}
      />
      <circle
        cx={36}
        cy={36}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dasharray .8s ease" }}
      />
      <text
        x={36}
        y={40}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── SubmitModal ───────────────────────────────────────────────

function SubmitModal({
  missing,
  onConfirm,
  onClose,
  saving,
}: {
  missing: { key: string; label: string }[];
  onConfirm: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const isComplete = missing.length === 0;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "fadeIn .2s ease",
        }}
      >
        {isComplete ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 8,
                }}
              >
                Мэдээлэл бүрэн бөглөгдсөн байна
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                Та мэдээлэлээ илгээхдээ итгэлтэй байна уу?
                <br />
                Илгээсний дараа хянагдах болно.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Болих
              </button>
              <button
                onClick={onConfirm}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Send size={14} />
                )}
                {saving ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>⚠️</span> Дутуу мэдээлэл байна
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Илгээхийн өмнө дараах талбаруудыг бөглөнө үү:
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 20,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {missing.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}
                  >
                    ✕
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Буцаж бөглөх
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── DirectionPicker ───────────────────────────────────────────

function DirectionPicker({
  dirs,
  selDirs,
  editing,
  toggleMain,
  toggleSub,
}: {
  dirs: DirItem[];
  selDirs: SelDir[];
  editing: boolean;
  toggleMain: (id: number) => void;
  toggleSub: (mainId: number, subId: number) => void;
}) {
  const [activeMain, setActiveMain] = useState<number | null>(
    selDirs.length > 0 ? selDirs[0].main_id : null,
  );
  const [search, setSearch] = useState("");

  const activeDir = dirs.find((d) => d.id === activeMain);
  const filteredSubs =
    activeDir?.children.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  const activeSel = selDirs.find(
    (s) => Number(s.main_id) === Number(activeMain),
  );

  // ── Read-only ─────────────────────────────────────────────
  if (!editing) {
    if (selDirs.length === 0)
      return (
        <div
          style={{
            fontSize: 13,
            color: "#cbd5e1",
            padding: "10px 0",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          —
        </div>
      );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selDirs.map((sel) => {
          const main = dirs.find((d) => Number(d.id) === Number(sel.main_id));
          if (!main) return null;
          return (
            <div
              key={sel.main_id}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "#f8f9ff",
                border: "1px solid #e8eaff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: sel.sub_ids.length ? 8 : 0,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {main.label[0]}
                </div>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}
                >
                  {main.label}
                </span>
                {sel.sub_ids.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      marginLeft: "auto",
                    }}
                  >
                    {sel.sub_ids.length} дэд чиглэл
                  </span>
                )}
              </div>
              {sel.sub_ids.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    paddingLeft: 36,
                  }}
                >
                  {sel.sub_ids.map((sid) => {
                    const sub = main.children?.find(
                      (c) => Number(c.id) === Number(sid),
                    );
                    return sub ? (
                      <span
                        key={sid}
                        style={{
                          fontSize: 11,
                          color: "#4f46e5",
                          background: "#eef2ff",
                          border: "1px solid #c7d2fe",
                          padding: "2px 10px",
                          borderRadius: 99,
                        }}
                      >
                        {sub.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Edit mode — 2 хэсэгт хуваасан ─────────────────────────
  return (
    <div
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          minHeight: 360,
        }}
      >
        {/* ── Зүүн: Үндсэн чиглэлүүд ── */}
        <div
          style={{
            borderRight: "1px solid #f1f5f9",
            background: "#fafafa",
            overflowY: "auto",
            maxHeight: 400,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Үндсэн чиглэл
          </div>
          {dirs.length === 0 ? (
            <div
              style={{
                padding: 16,
                fontSize: 12,
                color: "#94a3b8",
                textAlign: "center" as const,
              }}
            >
              Ачаалж байна...
            </div>
          ) : (
            dirs.map((d) => {
              const isOn = selDirs.some(
                (s) => Number(s.main_id) === Number(d.id),
              );
              const isActive = activeMain === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveMain(d.id);
                    setSearch("");
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? "#eef2ff" : "transparent",
                    borderLeft: isActive
                      ? "3px solid #6366f1"
                      : "3px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all .12s",
                  }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMain(d.id);
                      if (!isOn) setActiveMain(d.id);
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: isOn ? "2px solid #6366f1" : "2px solid #d1d5db",
                      background: isOn ? "#6366f1" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                    }}
                  >
                    {isOn && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isOn ? 600 : 400,
                        color: isActive
                          ? "#4f46e5"
                          : isOn
                            ? "#1e293b"
                            : "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {d.label}
                    </div>
                    {isOn &&
                      (selDirs.find((s) => Number(s.main_id) === Number(d.id))
                        ?.sub_ids.length ?? 0) > 0 && (
                        <div style={{ fontSize: 10, color: "#6366f1" }}>
                          {
                            selDirs.find(
                              (s) => Number(s.main_id) === Number(d.id),
                            )?.sub_ids.length
                          }{" "}
                          сонгосон
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Баруун: Дэд чиглэлүүд ── */}
        <div style={{ display: "flex", flexDirection: "column" as const }}>
          {activeMain === null ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column" as const,
                gap: 8,
                color: "#94a3b8",
              }}
            >
              <span style={{ fontSize: 28 }}>👈</span>
              <span style={{ fontSize: 13 }}>Үндсэн чиглэл сонгоно уу</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                  >
                    {activeDir?.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {activeDir?.children.length || 0} дэд чиглэл
                  </div>
                </div>
                {activeSel && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        activeSel.sub_ids.forEach(() => {});
                        activeDir?.children.forEach((c) => {
                          if (!activeSel.sub_ids.includes(c.id))
                            toggleSub(activeMain, c.id);
                        });
                      }}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        color: "#4f46e5",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Бүгдийг сонгох
                    </button>
                    {activeSel.sub_ids.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          activeSel.sub_ids
                            .slice()
                            .forEach((id) => toggleSub(activeMain, id))
                        }
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Цэвэрлэх
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search */}
              {(activeDir?.children.length || 0) > 5 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    position: "relative",
                  }}
                >
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 26,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Дэд чиглэл хайх..."
                    style={{
                      width: "100%",
                      padding: "7px 10px 7px 30px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      outline: "none",
                      background: "white",
                      boxSizing: "border-box" as const,
                    }}
                    onFocus={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#6366f1")
                    }
                    onBlur={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
                    }
                  />
                </div>
              )}

              {/* Sub-directions */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
                {!activeSel ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#f59e0b",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Эхлээд үндсэн чиглэлийг сонгоно уу (зүүн талын checkbox)
                  </div>
                ) : filteredSubs.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    {search ? `"${search}" олдсонгүй` : "Дэд чиглэл байхгүй"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {filteredSubs.map((sub) => {
                      const isSubOn = activeSel.sub_ids.some(
                        (id) => Number(id) === Number(sub.id),
                      );
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(activeMain, sub.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 500,
                            border: isSubOn
                              ? "1.5px solid #6366f1"
                              : "1.5px solid #e2e8f0",
                            background: isSubOn ? "#eef2ff" : "white",
                            color: isSubOn ? "#4f46e5" : "#64748b",
                            cursor: "pointer",
                            transition: "all .12s",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isSubOn && <Check size={10} strokeWidth={3} />}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected summary */}
              {activeSel && activeSel.sub_ids.length > 0 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: 11,
                    color: "#6366f1",
                    fontWeight: 600,
                  }}
                >
                  ✓ {activeSel.sub_ids.length} дэд чиглэл сонгогдсон
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom: Selected summary */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap" as const,
        }}
      >
        {selDirs.length === 0 ? (
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>
            ⚠️ Нэг буюу хэд хэдэн чиглэл сонгоно уу
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
              ✓ {selDirs.length} үндсэн чиглэл сонгогдсон
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
              {selDirs.map((sel) => {
                const main = dirs.find(
                  (d) => Number(d.id) === Number(sel.main_id),
                );
                return main ? (
                  <span
                    key={sel.main_id}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      color: "#4f46e5",
                      fontWeight: 600,
                    }}
                  >
                    {main.label}
                  </span>
                ) : null;
              })}
            </div>
            <button
              type="button"
              onClick={() => selDirs.forEach((s) => toggleMain(s.main_id))}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Бүгдийг цэвэрлэх
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function PersonProfilePage() {
  const w = useW();
  const router = useRouter();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;

  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<DirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selDirs, setSelDirs] = useState<SelDir[]>([]);
  const [selDirSnap, setSelDirSnap] = useState<SelDir[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [form, setForm] = useState<any>(BLANK);
  const [snapshot, setSnapshot] = useState<any>(BLANK);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // ── Load data ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          // hierarchical болон flat хоёуланг дэмжинэ
          const source = d.directions || d.flat || [];
          setDirs(
            source
              .filter((dir: any) => !dir.parent_id) // зөвхөн үндсэн чиглэл
              .map((dir: any) => ({
                id: Number(dir.id),
                label: dir.label,
                children: (
                  dir.children ||
                  source.filter(
                    (c: any) => Number(c.parent_id) === Number(dir.id),
                  )
                ).map((c: any) => ({ id: Number(c.id), label: c.label })),
              })),
          );
        }
      })
      .catch(() => {});

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/persons/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && (d.person || d.user)) {
          const u = d.person || d.user;
          setProfile(u);
          const f = {
            family_name: u.family_name || "",
            last_name: u.last_name || "",
            first_name: u.first_name || "",
            birth_date: u.birth_date?.slice(0, 10) || "",
            gender: u.gender || "",
            phone: u.phone || "",
            aimag_niislel: u.aimag_niislel || "",
            sum_duureg: u.sum_duureg || "",
            bag_horoo: u.bag_horoo || "",
            toot: u.toot || "",
            address_different: u.address_different || false,
            orshisuugaa_hayag: u.orshisuugaa_hayag || "",
            activity_description: u.activity_description || "",
            activity_start_date: u.activity_start_date?.slice(0, 10) || "",
            is_vat_payer: u.is_vat_payer || false,
            notification_type: u.notification_type || "email",
            notification_preference: u.notification_preference || "all",
            email: u.email || u.user?.email || "",
            supply_direction: u.supply_direction || "",
          };
          setForm(f);
          setSnapshot(f);

          const rawDirs = u.activity_directions || [];
          const parsedDirs: SelDir[] =
            Array.isArray(rawDirs) &&
            rawDirs.length > 0 &&
            typeof rawDirs[0] === "object"
              ? rawDirs.map((d: any) => ({
                  main_id: Number(d.main_id),
                  sub_ids: (d.sub_ids || []).map(Number),
                }))
              : rawDirs.map((id: number) => ({
                  main_id: Number(id),
                  sub_ids: [],
                }));
          setSelDirs(parsedDirs);
          setSelDirSnap(parsedDirs);

          const p: Record<string, string> = {};
          if (u.profile_photo_url) p.profile_photo = u.profile_photo_url;
          if (u.id_card_front_url) p.id_card_front = u.id_card_front_url;
          if (u.id_card_back_url) p.id_card_back = u.id_card_back_url;
          if (u.activity_intro_url) p.activity_intro = u.activity_intro_url;
          setPreviews(p);
          setEditing(!u.first_name && !u.last_name);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ─────────────────────────────────────────────────
  const F = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const onFile = (field: string, file: File) => {
    setFiles((p) => ({ ...p, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const getMissingFields = () => {
    const missing = REQUIRED_FIELDS.filter((f) => !form[f.key]);
    if (selDirs.length === 0)
      missing.push({ key: "activity_directions", label: "Нийлүүлэх чиглэл" });
    if (!previews.id_card_front)
      missing.push({ key: "id_card_front", label: "Иргэний үнэмлэх урд тал" });
    if (!previews.id_card_back)
      missing.push({ key: "id_card_back", label: "Иргэний үнэмлэх ард тал" });
    return missing;
  };

  const toggleMain = (mainId: number) => {
    setSelDirs((p) => {
      const exists = p.find((d) => Number(d.main_id) === Number(mainId));
      if (exists) return p.filter((d) => Number(d.main_id) !== Number(mainId));
      const main = dirs.find((d) => Number(d.id) === Number(mainId));
      return [
        ...p,
        {
          main_id: Number(mainId),
          sub_ids: (main?.children || []).map((c) => Number(c.id)),
        },
      ];
    });
  };

  const toggleSub = (mainId: number, subId: number) =>
    setSelDirs((p) =>
      p.map((d) =>
        d.main_id !== mainId
          ? d
          : {
              ...d,
              sub_ids: d.sub_ids.some((id) => Number(id) === Number(subId))
                ? d.sub_ids.filter((id) => Number(id) !== Number(subId))
                : [...d.sub_ids, subId],
            },
      ),
    );

  const startEdit = () => {
    setSnapshot({ ...form });
    setSelDirSnap(selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setEditing(true);
    setError("");
    setFieldErrors({});
  };
  const cancelEdit = () => {
    setForm({ ...snapshot });
    setSelDirs(selDirSnap.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setEditing(false);
    setError("");
    setFieldErrors({});
  };

  // ── API call helper ─────────────────────────────────────────
  const doSave = async (extraFields?: Record<string, string>) => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSaving(false);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
    if (extraFields)
      Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, f]) => fd.append(k, f as File));
    try {
      const res = await fetch(`${API}/api/persons/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      const u = data.person || data.user;
      if (u) {
        setProfile(u);
        const p: Record<string, string> = { ...previews };
        if (u.profile_photo_url) p.profile_photo = u.profile_photo_url;
        if (u.id_card_front_url) p.id_card_front = u.id_card_front_url;
        if (u.id_card_back_url) p.id_card_back = u.id_card_back_url;
        if (u.activity_intro_url) p.activity_intro = u.activity_intro_url;
        setPreviews(p);

        // ✅ localStorage шинэчлэх — Layout sidebar уншдаг
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          const updated = { ...stored, ...u, role: "individual" };
          localStorage.setItem("user", JSON.stringify(updated));
          window.dispatchEvent(new Event("user-updated")); // ✅ нэмэх
        } catch {}
        // ✅ Form дотор status шинэчлэх
        if (u.status) {
          setForm((prev: any) => ({ ...prev, status: u.status }));
        }
      }
      setSaved(true);
      setEditing(false);
      setShowSubmitModal(false);
      setFiles({});
      setSnapshot({ ...form });
      setSelDirSnap(selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Засах горимын хуучин handleSave (Монгол validation хийдэг)
  const handleSave = async () => {
    const errs = validateMongolianForm(form, [
      "family_name",
      "last_name",
      "first_name",
      "sum_duureg",
    ]);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Зарим талбар монгол үсгээр бичигдэх ёстой");
      return;
    }
    if (
      form.bag_horoo &&
      !/^[\u0400-\u04FF\s\d\-\/\.]+$/.test(form.bag_horoo)
    ) {
      setFieldErrors((p) => ({
        ...p,
        bag_horoo: "Крилл үсэг, тоо оруулна уу",
      }));
      setError("Баг/Хороо талбар буруу байна");
      return;
    }
    if (form.phone && form.phone.length !== 8) {
      setFieldErrors((p) => ({ ...p, phone: "8 оронтой тоо оруулна уу" }));
      setError("Утасны дугаар 8 оронтой байх ёстой");
      return;
    }
    setFieldErrors({});
    await doSave();
  };

  // Хадгалах — validation хийхгүй, draft хадгална
  const handleSaveDraft = () => doSave();

  // Илгээх товч дарах
  const handleSubmitClick = () => setShowSubmitModal(true);

  // Modal-аас баталгаажуулж илгээх
  const handleConfirmSubmit = () => doSave({ status: "pending" });

  // ── Derived ─────────────────────────────────────────────────
  const pct = calcPct(form, selDirs, previews);
  const isNewUser = !profile?.first_name && !profile?.last_name;
  const statusKey = (profile?.status ??
    "pending") as keyof typeof PERSON_STATUS;
  const sc = PERSON_STATUS[statusKey] ?? PERSON_STATUS.pending;
  const initials =
    [(form.last_name || "")[0], (form.first_name || "")[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const g2 = isMobile ? "1fr" : "1fr 1fr";
  const g3 = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const gDoc = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 12,
        }}
      >
        <Loader2
          size={22}
          style={{ color: "#6366f1", animation: "spin .8s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: isMobile ? "12px 10px 40px" : "20px 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing:border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
      `}</style>

      {/* ── Submit Modal ── */}
      {showSubmitModal && (
        <SubmitModal
          missing={getMissingFields()}
          onConfirm={handleConfirmSubmit}
          onClose={() => setShowSubmitModal(false)}
          saving={saving}
        />
      )}

      {/* ── Sticky bar (editing горимд) ── */}
      {editing && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            animation: "fadeIn .2s ease",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            border: "1px solid #e2e8f0",
            borderRadius: isMobile ? 10 : 14,
            padding: isMobile ? "10px 12px" : "12px 18px",
            display: "flex",
            flexDirection: isMobile ? "column" : ("row" as any),
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: 10,
            boxShadow: "0 4px 20px rgba(99,102,241,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {isNewUser ? "Мэдээлэл бөглөх" : "Засварлаж байна"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: isMobile ? "flex-end" : "flex-start",
            }}
          >
            {/* Болих */}
            {isNewUser ? (
              <button
                onClick={() => router.push("/login")}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 14px",
                  borderRadius: 9,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <X size={13} /> Буцах
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 16px",
                  borderRadius: 9,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <X size={13} /> Болих
              </button>
            )}
            {/* Хадгалах */}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 16px",
                borderRadius: 9,
                border: "1.5px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Save size={13} /> Хадгалах
            </button>
            {/* Илгээх */}
            <button
              onClick={handleSubmitClick}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
                flex: isMobile ? 1 : ("none" as any),
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              {saving ? (
                <Loader2
                  size={13}
                  style={{ animation: "spin .8s linear infinite" }}
                />
              ) : (
                <Send size={13} />
              )}
              {saving ? "Хадгалж байна..." : "Илгээх"}
            </button>
          </div>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            animation: "fadeIn .3s ease",
          }}
        >
          <AlertCircle size={14} style={{ color: "#dc2626", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
        </div>
      )}
      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#f0fdf4",
            border: "1px solid #a7f3d0",
            animation: "fadeIn .3s ease",
          }}
        >
          <CheckCircle size={14} style={{ color: "#059669", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
            Мэдээлэл амжилттай хадгаллаа
          </span>
        </div>
      )}

      {/* ── Hero ── */}
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : ("row" as any),
            alignItems: isMobile ? "flex-start" : "center",
            gap: 20,
          }}
        >
          {/* Avatar */}
          <label
            style={{
              cursor: editing ? "pointer" : "default",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                overflow: "hidden",
                background: previews.profile_photo
                  ? "transparent"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #f1f5f9",
              }}
            >
              {previews.profile_photo ? (
                <img
                  src={previews.profile_photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
                  {initials}
                </span>
              )}
            </div>
            {editing && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 20,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={16} color="white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    onFile("profile_photo", e.target.files[0])
                  }
                />
              </>
            )}
          </label>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap" as const,
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {[form.last_name, form.first_name].filter(Boolean).join(" ") ||
                  "Нэр оруулаагүй"}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: sc.bg,
                  color: sc.color,
                }}
              >
                {sc.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {profile?.supplier_number && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: "#f8fafc",
                    color: "#475569",
                    fontFamily: "monospace",
                  }}
                >
                  {profile.supplier_number}
                </span>
              )}
              {profile?.register_number && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Регистрийн дугаар: {profile.register_number}
                </span>
              )}
            </div>
            {profile?.email && (
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {" "}
                И-мэйл: {profile.email}
              </span>
            )}
          </div>

          {/* Ring + Buttons */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: isMobile ? "row" : ("column" as any),
              alignItems: isMobile ? "center" : "flex-end",
              justifyContent: isMobile ? "space-between" : "flex-start",
              gap: 8,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Ring pct={pct} />
            {!editing && !isNewUser && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Засах */}
                <button
                  onClick={startEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#6366f1";
                    (e.currentTarget as HTMLElement).style.color = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "#e2e8f0";
                    (e.currentTarget as HTMLElement).style.color = "#0f172a";
                  }}
                >
                  <Pencil size={13} /> Засах
                </button>
                
              </div>
            )}
          </div>
        </div>

        {/* Returned banner */}
        {profile?.status === "returned" && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 14,
              border: "1.5px solid #fecaca",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}
                >
                  Бүртгэл буцаагдсан байна
                </div>
                <div style={{ fontSize: 11, color: "#ef4444", marginTop: 1 }}>
                  Доорх шалтгааныг уншаад мэдээллээ засна уу
                </div>
              </div>
            </div>
            {profile?.return_reason && (
              <div style={{ padding: "14px 16px", background: "#fff5f5" }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#7f1d1d",
                    lineHeight: 1.7,
                    background: "white",
                    borderRadius: 10,
                    padding: "10px 14px",
                    border: "1px solid #fecaca",
                    whiteSpace: "pre-wrap" as const,
                  }}
                >
                  {profile.return_reason}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── 1. Үндсэн мэдээлэл ── */}
      <Card>
        <SectionTitle
          icon={User}
          title="ХУВЬ ХҮНИЙ ҮНДСЭН МЭДЭЭЛЭЛ"
          subtitle="Хувийн болон холбоо барих мэдээлэл"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: g3,
            gap: 16,
            marginBottom: 20,
          }}
        >
          <FInput
            label="Ургийн овог *"
            value={form.family_name}
            editing={editing}
            onChange={(v: string) => {
              F("family_name", v);
              setFieldErrors((p) => ({
                ...p,
                family_name:
                  v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
              }));
            }}
            fieldError={fieldErrors.family_name}
          />
          <FInput
            label="Овог *"
            value={form.last_name}
            editing={editing}
            disabled={true}
            onChange={(v: string) => {
              F("last_name", v);
              setFieldErrors((p) => ({
                ...p,
                last_name: v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
              }));
            }}
            fieldError={fieldErrors.last_name}
          />
          <FInput
            label="Нэр *"
            value={form.first_name}
            disabled={true}
            editing={editing}
            onChange={(v: string) => {
              F("first_name", v);
              setFieldErrors((p) => ({
                ...p,
                first_name: v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
              }));
            }}
            fieldError={fieldErrors.first_name}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: g3,
            gap: 16,
            marginBottom: 20,
          }}
        >
          <FInput
            label="Регистрийн дугаар"
            value={profile?.register_number || ""}
            editing={editing}
            onChange={() => {}}
            disabled={true}
            mono
          />
          <FInput
            label="Төрсөн огноо *"
            type="date"
            value={form.birth_date}
            onChange={(v: string) => F("birth_date", v)}
            editing={editing}
          />
          <FRadio
            label="Хүйс *"
            value={form.gender}
            onChange={(v: string) => F("gender", v)}
            editing={editing}
            options={[
              { value: "male", label: "Эрэгтэй" },
              { value: "female", label: "Эмэгтэй" },
            ]}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 16,
            marginBottom: 20,
          }}
        >
          <FInput
            label="Утасны дугаар"
            type="tel"
            value={form.phone}
            editing={editing}
            onChange={(v: string) => {
              const d = v.replace(/\D/g, "").slice(0, 8);
              F("phone", d);
              setFieldErrors((p) => ({
                ...p,
                phone: d && d.length < 8 ? "8 оронтой тоо оруулна уу" : "",
              }));
            }}
            fieldError={fieldErrors.phone}
          />
          <FRadio
            label="НӨАТ төлөгч эсэх"
            value={form.is_vat_payer}
            onChange={(v: any) => F("is_vat_payer", v === "true" || v === true)}
            editing={editing}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 16,
            marginTop: 8,
          }}
        >
          {/* И-мэйл */}
          <div>
            <label style={S.label}>
              И-мэйл хаяг{" "}
              {editing && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            {editing ? (
              <FInput
                type="email"
                value={form.email || ""}
                disabled={true}
                onChange={(v: string) => F("email", v)}
                editing={true}
                placeholder="example@gmail.com"
              />
            ) : (
              <div
                style={{
                  fontSize: 13,
                  color: "#1e293b",
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontWeight: 500,
                }}
              >
                {profile?.email || form.email || "—"}
              </div>
            )}
          </div>

          {/* Нийлүүлэх төрөл */}
          <div>
            <label style={S.label}>
              Нийлүүлэх төрөл{" "}
              {editing && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            {editing ? (
              <FSelect
                label=""
                value={form.supply_direction || ""}
                onChange={(v: string) => F("supply_direction", v)}
                editing={true}
                options={[
                  { value: "service", label: "Үйлчилгээ" },
                  { value: "goods", label: "Бараа материал" },
                  { value: "all", label: "Бүгд" },
                ]}
                placeholder="Сонгоно уу"
              />
            ) : (
              <div
                style={{
                  fontSize: 13,
                  color: "#1e293b",
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontWeight: 500,
                }}
              >
                {form.supply_direction === "service"
                  ? "Үйлчилгээ"
                  : form.supply_direction === "goods"
                    ? "Бараа материал"
                    : form.supply_direction === "all"
                      ? "Бүгд"
                      : "—"}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── 2. Хаяг ── */}
      <Card>
        <SectionTitle
          icon={MapPin}
          title="ХАЯГ, БАЙРШИЛ"
          subtitle="Оршин суугаа хаягийн мэдээлэл"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 16,
            marginBottom: 16,
          }}
        >
          <FSelect
            label="Аймаг / Нийслэл *"
            value={form.aimag_niislel}
            editing={editing}
            onChange={(v: string) => {
              F("aimag_niislel", v);
              F("sum_duureg", "");
              F("bag_horoo", "");
            }}
            options={AIMAG}
            placeholder="Сонгох"
          />
          {form.aimag_niislel === "Улаанбаатар" ? (
            <FSelect
              label="Дүүрэг *"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
              }}
              options={Object.keys(UB_DUUREG)}
              placeholder="Дүүрэг сонгох"
            />
          ) : (
            <FSelect
              label="Сум *"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
              }}
              options={
                form.aimag_niislel && AIMAG_SUM[form.aimag_niislel]
                  ? AIMAG_SUM[form.aimag_niislel]
                  : []
              }
              placeholder={
                form.aimag_niislel ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"
              }
            />
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 16,
            marginBottom: 16,
          }}
        >
          {form.aimag_niislel === "Улаанбаатар" &&
          form.sum_duureg &&
          UB_DUUREG[form.sum_duureg] ? (
            <FSelect
              label="Хороо *"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => F("bag_horoo", v)}
              options={UB_DUUREG[form.sum_duureg]}
              placeholder="Хороо сонгох"
            />
          ) : (
            <FInput
              label="Баг / Хороо *"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => {
                F("bag_horoo", v);
                setFieldErrors((p) => ({
                  ...p,
                  bag_horoo:
                    v && !/^[\u0400-\u04FF\s\d\-\/\.]+$/.test(v)
                      ? "Крилл үсэг, тоо оруулна уу"
                      : "",
                }));
              }}
              fieldError={fieldErrors.bag_horoo}
            />
          )}
          <FInput
            label="Хаяг"
            value={form.toot}
            editing={editing}
            onChange={(v: string) => F("toot", v)}
            placeholder="Байр болон тоот"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <FRadio
            label="Иргэний албан ёсны харьялал оршин суугаа хаягаас зөрүүтэй эсэх"
            value={form.address_different}
            onChange={(v: any) =>
              F("address_different", v === "true" || v === true)
            }
            editing={editing}
            options={[
              { value: true, label: "Тийм, өөр" },
              { value: false, label: "Үгүй, адил" },
            ]}
          />
        </div>
        {form.address_different && (
          <div style={{ animation: "slideIn .2s ease" }}>
            <FInput
              label="Одоо оршин суугаа хаяг оруулах"
              value={form.orshisuugaa_hayag}
              editing={editing}
              onChange={(v: string) => F("orshisuugaa_hayag", v)}
              placeholder="Дэлгэрэнгүй хаяг бичнэ үү"
            />
          </div>
        )}
      </Card>

      {/* ── 3. Үйл ажиллагаа ── */}
      <Card>
        <SectionTitle
          icon={Briefcase}
          title="ЭРХЭЛЖ БУЙ ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ"
          subtitle="Нийлүүлэх чиглэл, эхэлсэн огноо болон тайлбар"
        />

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              ...S.label,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Нийлүүлэх чиглэл
            {editing && <span style={{ color: "#ef4444" }}>*</span>}
            {editing && selDirs.length > 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: "#10b981",
                  fontWeight: 600,
                  background: "rgba(16,185,129,0.1)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {selDirs.length} сонгогдсон
              </span>
            )}
          </label>
          <DirectionPicker
            dirs={dirs}
            selDirs={selDirs}
            editing={editing}
            toggleMain={toggleMain}
            toggleSub={toggleSub}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: g2, gap: 16 }}>
          <FInput
            label="Үйл ажиллагаа эхэлсэн огноо *"
            type="date"
            value={form.activity_start_date}
            onChange={(v: string) => F("activity_start_date", v)}
            editing={editing}
          />
          <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
            <label style={S.label}>Үйл ажиллагааны тайлбар</label>
            {editing ? (
              <textarea
                value={form.activity_description}
                onChange={(e) => F("activity_description", e.target.value)}
                rows={4}
                placeholder="Хийж буй үйл ажиллагаа, туршлага, онцлог, үйлчлүүлэгчийн төрөл гэх мэтээ товч бөгөөд тодорхой бичнэ үү..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 13.5,
                  color: "#1e293b",
                  outline: "none",
                  resize: "vertical" as const,
                  fontFamily: "inherit",
                  lineHeight: 1.65,
                  minHeight: 110,
                  transition: "border-color .15s",
                  boxSizing: "border-box" as const,
                }}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor = "#6366f1")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
                }
              />
            ) : (
              <div
                style={{
                  fontSize: 13.5,
                  color: form.activity_description ? "#1e293b" : "#cbd5e1",
                  padding: "12px 0",
                  lineHeight: 1.7,
                  borderBottom: "1px solid #f1f5f9",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {form.activity_description || "—"}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── 4. Баримт бичиг ── */}
      <Card>
        <SectionTitle
          icon={Shield}
          title="БАРИМТ БИЧГИЙН ХУУЛБАР ОРУУЛАХ"
          subtitle="Таниулах бичиг баримт"
        />
        <div style={{ display: "grid", gridTemplateColumns: gDoc, gap: 12 }}>
          <DocCard
            label="Иргэний үнэмлэх урд тал"
            fieldKey="id_card_front"
            preview={previews.id_card_front}
            onFile={onFile}
            editing={editing}
            accept="image/*"
            required
          />
          <DocCard
            label="Иргэний үнэмлэх ард тал"
            fieldKey="id_card_back"
            preview={previews.id_card_back}
            onFile={onFile}
            editing={editing}
            accept="image/*"
            required
          />
          <DocCard
            label="Үйл ажиллагааны танилцуулга"
            fieldKey="activity_intro"
            preview={previews.activity_intro}
            onFile={onFile}
            editing={editing}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
          />
        </div>
      </Card>

      {/* ── 5. Мэдэгдэл ── */}
      <Card>
        <SectionTitle
          icon={Bell}
          title="МЭДЭГДЭЛ ХҮЛЭЭН АВАХ ХЭЛБЭР"
          subtitle="Зарын мэдэгдэл хэрхэн хүлээн авах"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              value: "all",
              icon: "🔔",
              label: "Бүх үйл ажиллагааны чиглэлээр хүлээн авах",
              desc: "Системд нийтлэгдсэн бүх зарын мэдэгдлийг хүлээн авна",
            },
            {
              value: "selected_dirs",
              icon: "🎯",
              label: "Сонгосон үйл ажиллагааны чиглэлээр хүлээн авах",
              desc: "Дээр сонгосон чиглэлтэй холбоотой зарын мэдэгдлийг л хүлээн авна",
            },
          ].map((opt) => {
            const isOn = form.notification_preference === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() =>
                  editing && F("notification_preference", opt.value)
                }
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 12,
                  cursor: editing ? "pointer" : "default",
                  border: isOn ? "1.5px solid #0072BC" : "1.5px solid #e2e8f0",
                  background: isOn ? "#f8f9ff" : "white",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 2,
                    border: isOn ? "2px solid #0072BC" : "2px solid #e2e8f0",
                    background: isOn ? "#0072BC" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isOn && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "white",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{opt.icon}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isOn ? "#4f46e5" : "#0f172a",
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}
                  >
                    {opt.desc}
                  </div>
                  {opt.value === "selected_dirs" && isOn && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {selDirs.length === 0 ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#f59e0b",
                            fontWeight: 500,
                          }}
                        >
                          ⚠️ Үйл ажиллагааны чиглэл сонгоогүй байна
                        </span>
                      ) : (
                        selDirs.map((sel) => {
                          const main = dirs.find(
                            (d) => Number(d.id) === Number(sel.main_id),
                          );
                          return main ? (
                            <span
                              key={sel.main_id}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4f46e5",
                                background: "#eef2ff",
                                border: "1px solid #c7d2fe",
                                padding: "2px 8px",
                                borderRadius: 99,
                              }}
                            >
                              {main.label}
                            </span>
                          ) : null;
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 14,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📧</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                И-мэйл мэдэгдэл
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                {profile?.email || "И-мэйл хаяг байхгүй"}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 99,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            Идэвхтэй
          </div>
        </div>
      </Card>

      {/* ── Bottom bar (editing горимд) ── */}
      {editing && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: isMobile ? "12px" : "16px 20px",
            background: "white",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            boxShadow: "0 -4px 20px rgba(99,102,241,0.08)",
            flexDirection: isMobile ? "column" : ("row" as any),
          }}
        >
          {isNewUser ? (
            <button
              onClick={() => router.push("/login")}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <X size={14} /> Нэвтрэх хуудас руу буцах
            </button>
          ) : (
            <button
              onClick={cancelEdit}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <X size={14} /> Болих
            </button>
          )}
          {/* Хадгалах */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 24px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flex: isMobile ? 1 : ("none" as any),
            }}
          >
            <Save size={14} /> Хадгалах
          </button>
          {/* Илгээх */}
          <button
            onClick={handleSubmitClick}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#4f46e5,#6366f1)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              flex: isMobile ? 1 : ("none" as any),
            }}
          >
            {saving ? (
              <Loader2
                size={14}
                style={{ animation: "spin .8s linear infinite" }}
              />
            ) : (
              <Send size={14} />
            )}
            {saving ? "Илгээж байна..." : "Илгээх"}
          </button>
        </div>
      )}
    </div>
  );
}
