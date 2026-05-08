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
  Sparkles,
  Award,
  TrendingUp,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Building2,
  Globe,
  Zap,
  Clock,
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
  "Өмноговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
];

const PERSON_STATUS: Record<string, any> = {
  new: {
    label: "Шинэ",
    bg: "rgba(99,102,241,0.12)",
    color: "#818cf8",
    icon: Sparkles,
  },
  pending: {
    label: "Хянагдаж байна",
    bg: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    icon: Clock,
  },
  active: {
    label: "Баталгаажсан",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    icon: CheckCircle,
  },
  approved: {
    label: "Баталгаажсан",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    icon: CheckCircle,
  },
  returned: {
    label: "Буцаагдсан",
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    icon: AlertCircle,
  },
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

// ── Premium Components ────────────────────────────────────────

function GlassCard({
  children,
  style,
  glow,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: glow
          ? `0 0 40px ${glow}10, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 4px 24px rgba(0,0,0,0.3)",
        padding: 28,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
          border: "1px solid rgba(99,102,241,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: "#a5b4fc" }} />
      </div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.6)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function RingProgress({ pct, size = 80 }: { pct: number; size?: number }) {
  const strokeW = 5;
  const r = (size - strokeW * 2) / 2;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#818cf8";
  const glow =
    pct >= 80
      ? "rgba(52,211,153,0.3)"
      : pct >= 50
        ? "rgba(251,191,36,0.3)"
        : "rgba(129,140,248,0.3)";

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: `url(#glow-${size})`,
          }}
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          fontSize={size * 0.16}
          fontWeight={700}
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        >
          {pct}%
        </text>
      </svg>
    </div>
  );
}

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
  icon: Icon,
}: any) {
  const display = type === "date" && !editing ? fmtDate(value) : value;
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(148,163,184,0.7)",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            display: "block",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      {editing ? (
        <div>
          <div style={{ position: "relative" }}>
            {Icon && (
              <Icon
                size={14}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: fieldError ? "#f87171" : "rgba(148,163,184,0.4)",
                  zIndex: 1,
                }}
              />
            )}
            <input
              type={type}
              value={value}
              disabled={disabled}
              onChange={(e) => !disabled && onChange(e.target.value)}
              placeholder={placeholder || label || ""}
              style={{
                width: "100%",
                padding: Icon ? "11px 14px 11px 40px" : "11px 16px",
                borderRadius: 12,
                outline: "none",
                fontSize: 13,
                color: disabled
                  ? "rgba(148,163,184,0.5)"
                  : "rgba(255,255,255,0.85)",
                background: disabled
                  ? "rgba(255,255,255,0.02)"
                  : fieldError
                    ? "rgba(239,68,68,0.06)"
                    : "rgba(255,255,255,0.04)",
                border: fieldError
                  ? "1.5px solid rgba(239,68,68,0.3)"
                  : disabled
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(255,255,255,0.1)",
                fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
                cursor: disabled ? "not-allowed" : "text",
                transition: "all 0.2s",
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = fieldError
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(99,102,241,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }
              }}
              onBlur={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = fieldError
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            />
          </div>
          {fieldError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 6,
                padding: "4px 10px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle
                size={11}
                style={{ color: "#f87171", flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 500 }}>
                {fieldError}
              </span>
            </div>
          )}
        </div>
      ) : (
        // ✅ FIXED: Changed text color for white background
        <div
          style={{
            fontSize: 14,
            color: display ? "#1e293b" : "#94a3b8",
            padding: "8px 0",
            fontWeight: display ? 500 : 400,
            fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
            wordBreak: "break-word",
            borderBottom: "1px solid #e2e8f0", // Changed to light gray border
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
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(148,163,184,0.7)",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            display: "block",
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      {editing ? (
        <div style={{ position: "relative" }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 40px 11px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 13,
              color: value ? "rgba(255,255,255,0.85)" : "rgba(148,163,184,0.5)",
              outline: "none",
              background: "rgba(255,255,255,0.04)",
              appearance: "none" as const,
              cursor: "pointer",
              boxSizing: "border-box" as const,
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            {placeholder && (
              <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>
                {placeholder}
              </option>
            )}
            {options.map((o: any) => (
              <option 
                key={o.value || o} 
                value={o.value || o}
                style={{ background: "#1e293b", color: "#e2e8f0" }}
              >
                {o.label || o}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(148,163,184,0.4)",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : (
        // ✅ Read-only display
        <div
          style={{
            fontSize: 14,
            color: value ? "rgba(255,255,255,0.85)" : "rgba(148,163,184,0.4)",
            padding: "8px 0",
            fontWeight: value ? 500 : 400,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
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
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(148,163,184,0.7)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          display: "block",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((o: any) => {
          const sel = value === o.value;
          return editing ? (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 12,
                cursor: "pointer",
                border: sel
                  ? "1.5px solid rgba(129,140,248,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: sel
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(255,255,255,0.04)",
                color: sel ? "#a5b4fc" : "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: sel ? 600 : 400,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {o.label}
            </button>
          ) : (
            // ✅ FIXED: Changed text color for white background
            <span
              key={String(o.value)}
              style={{
                fontSize: 14,
                padding: "8px 0",
                color: sel ? "#4f46e5" : "#94a3b8",
                fontWeight: sel ? 600 : 400,
                borderBottom: sel ? "2px solid #6366f1" : "1px solid #e2e8f0",
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
  icon: DocIcon,
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
        background: "rgba(255,255,255,0.03)",
        border: `1px dashed ${preview ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      <div
        onClick={() => editing && inputRef.current?.click()}
        style={{
          height: 120,
          background: preview
            ? isDoc
              ? "rgba(251,146,60,0.05)"
              : "transparent"
            : "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          cursor: editing ? "pointer" : "default",
          position: "relative",
          overflow: "hidden",
          gap: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (editing)
            e.currentTarget.style.background = preview
              ? isDoc
                ? "rgba(251,146,60,0.1)"
                : "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = preview
            ? isDoc
              ? "rgba(251,146,60,0.05)"
              : "transparent"
            : "rgba(255,255,255,0.02)";
        }}
      >
        {preview ? (
          isDoc ? (
            <>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fb923c"
                strokeWidth={1.5}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fb923c" }}>
                PDF / DOC
              </span>
              {!preview.startsWith("blob:") && (
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 11,
                    color: "#818cf8",
                    textDecoration: "none",
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  Харах →
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
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={18} style={{ color: "rgba(148,163,184,0.4)" }} />
            </div>
            <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>
              {editing ? "Дарж оруулах" : "Байхгүй"}
            </span>
          </>
        )}
        {editing && preview && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0";
            }}
          >
            <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
              Солих
            </span>
          </div>
        )}
        {preview && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(16,185,129,0.2)",
              backdropFilter: "blur(8px)",
              borderRadius: 8,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 600,
              color: "#34d399",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            ✓ Байна
          </div>
        )}
      </div>
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 6,
          }}
        >
          {DocIcon && (
            <DocIcon
              size={12}
              style={{
                display: "inline",
                marginRight: 6,
                color: "rgba(148,163,184,0.5)",
              }}
            />
          )}
          {label}
          {required && (
            <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>
          )}
        </div>
        {fileName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 8,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <FileText size={12} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 11,
                color: "#fbbf24",
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
                color: "rgba(245,158,11,0.6)",
                whiteSpace: "nowrap" as const,
              }}
            >
              Шинэ
            </span>
          </div>
        )}
        {!fileName && savedName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 8,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle
              size={12}
              style={{ color: "#34d399", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#34d399",
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
                color: "rgba(16,185,129,0.6)",
                whiteSpace: "nowrap" as const,
              }}
            >
              Хадгалагдсан
            </span>
          </div>
        )}
        {!fileName && !savedName && (
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>
            {acceptHint} · 10MB
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
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f172a",
          borderRadius: 24,
          padding: 32,
          maxWidth: 460,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "modalIn 0.2s ease",
        }}
      >
        {isComplete ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 8,
                }}
              >
                Илгээхдээ итгэлтэй байна уу?
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.6)",
                  lineHeight: 1.7,
                }}
              >
                Илгээсний дараа таны мэдээлэл хянагдаж,
                <br />
                баталгаажсаны дараа зарлалд оролцох боломжтой.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(148,163,184,0.7)",
                  fontSize: 13,
                  fontWeight: 600,
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
                  flex: 1.5,
                  padding: "12px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <Loader2
                    size={15}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Send size={15} />
                )}
                {saving ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 28 }}>⚠️</span> Дутуу мэдээлэл
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.6)",
                  lineHeight: 1.6,
                }}
              >
                Дараах талбаруудыг бөглөнө үү:
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 24,
                maxHeight: 280,
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
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <X size={12} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span
                    style={{ fontSize: 13, color: "#fca5a5", fontWeight: 500 }}
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
                padding: "12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.8)",
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
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

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

  if (!editing) {
    if (selDirs.length === 0)
      return (
        <div
          style={{
            fontSize: 14,
            color: "rgba(148,163,184,0.4)",
            padding: "10px 0",
          }}
        >
          —
        </div>
      );
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {selDirs.map((sel) => {
          const main = dirs.find((d) => Number(d.id) === Number(sel.main_id));
          if (!main) return null;
          return (
            <div
              key={sel.main_id}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                fontSize: 13,
                fontWeight: 600,
                color: "#a5b4fc",
              }}
            >
              {main.label}{" "}
              {sel.sub_ids.length > 0 && (
                <span
                  style={{ color: "rgba(148,163,184,0.5)", fontWeight: 400 }}
                >
                  · {sel.sub_ids.length}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          minHeight: 380,
        }}
      >
        <div
          style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            overflowY: "auto",
            maxHeight: 420,
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(148,163,184,0.5)",
              letterSpacing: "0.1em",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            ҮНДСЭН ЧИГЛЭЛ
          </div>
          {dirs.length === 0 ? (
            <div
              style={{
                padding: 20,
                fontSize: 12,
                color: "rgba(148,163,184,0.4)",
                textAlign: "center",
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
                    padding: "12px 14px",
                    cursor: "pointer",
                    background: isActive
                      ? "rgba(99,102,241,0.1)"
                      : "transparent",
                    borderLeft: isActive
                      ? "3px solid #6366f1"
                      : "3px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMain(d.id);
                      if (!isOn) setActiveMain(d.id);
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: isOn
                        ? "2px solid #818cf8"
                        : "2px solid rgba(255,255,255,0.2)",
                      background: isOn ? "#6366f1" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {isOn && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isOn ? 600 : 400,
                        color: isActive
                          ? "#c7d2fe"
                          : isOn
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(148,163,184,0.6)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.label}
                    </div>
                    {isOn &&
                      (selDirs.find((s) => Number(s.main_id) === Number(d.id))
                        ?.sub_ids.length ?? 0) > 0 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "#818cf8",
                            marginTop: 1,
                          }}
                        >
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
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            background: "rgba(255,255,255,0.01)",
          }}
        >
          {activeMain === null ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
                color: "rgba(148,163,184,0.3)",
              }}
            >
              <span style={{ fontSize: 32 }}>👈</span>
              <span style={{ fontSize: 13 }}>Үндсэн чиглэл сонгоно уу</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {activeDir?.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(148,163,184,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {activeDir?.children.length || 0} дэд чиглэл
                  </div>
                </div>
                {activeSel && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() =>
                        activeDir?.children.forEach((c) => {
                          if (!activeSel.sub_ids.includes(c.id))
                            toggleSub(activeMain, c.id);
                        })
                      }
                      style={{
                        fontSize: 11,
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(99,102,241,0.3)",
                        background: "rgba(99,102,241,0.1)",
                        color: "#a5b4fc",
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
                          padding: "5px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.1)",
                          color: "#fca5a5",
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
              {(activeDir?.children.length || 0) > 5 && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    position: "relative",
                  }}
                >
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 28,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(148,163,184,0.3)",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Хайх..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 34px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 12,
                      outline: "none",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.8)",
                      boxSizing: "border-box" as const,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.4)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                  />
                </div>
              )}
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
                {!activeSel ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#fbbf24",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Эхлээд үндсэн чиглэлийг сонгоно уу
                  </div>
                ) : filteredSubs.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "rgba(148,163,184,0.4)",
                    }}
                  >
                    {search ? `"${search}" олдсонгүй` : "Дэд чиглэл байхгүй"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                            padding: "8px 16px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 500,
                            border: isSubOn
                              ? "1.5px solid rgba(129,140,248,0.5)"
                              : "1px solid rgba(255,255,255,0.1)",
                            background: isSubOn
                              ? "rgba(99,102,241,0.15)"
                              : "rgba(255,255,255,0.03)",
                            color: isSubOn
                              ? "#a5b4fc"
                              : "rgba(148,163,184,0.6)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {isSubOn && <Check size={11} strokeWidth={3} />}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {activeSel && activeSel.sub_ids.length > 0 && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontSize: 11,
                    color: "#34d399",
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
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {selDirs.length === 0 ? (
          <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 500 }}>
            ⚠️ Нэг буюу хэд хэдэн чиглэл сонгоно уу
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>
              ✓ {selDirs.length} үндсэн чиглэл
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selDirs.map((sel) => {
                const main = dirs.find(
                  (d) => Number(d.id) === Number(sel.main_id),
                );
                return main ? (
                  <span
                    key={sel.main_id}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 99,
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
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
                color: "#fca5a5",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                padding: "5px 12px",
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

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function PersonProfilePage() {
  const w = useW();
  const router = useRouter();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;

  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<DirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string>("");
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
          const source = d.directions || d.flat || [];
          setDirs(
            source
              .filter((dir: any) => !dir.parent_id)
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

  // ✅ UPDATED doSave - separate modes for save/submit
  const doSave = async (extraFields?: Record<string, string>) => {
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setSaving(false);
      setSavingMode(null);
      return;
    }

    const mode = extraFields?.status === "pending" ? "submit" : "draft";
    setSavingMode(mode);

    if (
      mode === "submit" &&
      (profile?.status === "pending" || profile?.status === "submitted")
    ) {
      setError("Танд хүлээгдэж буй өөрчлөлт байна. Эхлээд цуцлана уу.");
      setSaving(false);
      setSavingMode(null);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
    if (mode === "submit") fd.append("status", "pending");
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

      if (!res.ok) {
        if (mode === "draft" && data.message?.includes("хүлээгдэж буй")) {
          setSaved(`✅ Таны мэдээлэл амжилттай хадгалагдлаа`);
          setEditing(false);
          setFiles({});
          setSnapshot({ ...form });
          setSelDirSnap(
            selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })),
          );
          setTimeout(() => setSaved(""), 4000);
          return;
        }
        throw new Error(data.message || "Алдаа гарлаа");
      }

      const u = data.person || data.user;
      if (u) {
        setProfile(u);
        const p: Record<string, string> = { ...previews };
        if (u.profile_photo_url) p.profile_photo = u.profile_photo_url;
        if (u.id_card_front_url) p.id_card_front = u.id_card_front_url;
        if (u.id_card_back_url) p.id_card_back = u.id_card_back_url;
        if (u.activity_intro_url) p.activity_intro = u.activity_intro_url;
        setPreviews(p);
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({ ...stored, ...u, role: "individual" }),
          );
          window.dispatchEvent(new Event("user-updated"));
        } catch {}
        if (u.status) setForm((prev: any) => ({ ...prev, status: u.status }));
      }

      // ✅ Different success messages
      if (mode === "submit") {
        setSaved(`🚀 Таны мэдээлэл амжилттай илгээгдлээ`);
      } else {
        setSaved(`✅ Таны мэдээлэл амжилттай хадгалагдлаа`);
      }

      setEditing(false);
      setShowSubmitModal(false);
      setFiles({});
      setSnapshot({ ...form });
      setSelDirSnap(selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
      setTimeout(() => setSaved(""), 4000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
      setSavingMode(null);
    }
  };

  // ✅ Updated handlers
  const handleSaveDraft = () => {
    doSave();
  };
  const handleSubmitClick = () => setShowSubmitModal(true);
  const handleConfirmSubmit = () => {
    doSave({ status: "pending" });
  };

  const pct = calcPct(form, selDirs, previews);
  const isNewUser = !profile?.first_name && !profile?.last_name;
  const statusKey = (profile?.status ??
    "pending") as keyof typeof PERSON_STATUS;
  const sc = PERSON_STATUS[statusKey] ?? PERSON_STATUS.pending;
  const StatusIcon = sc.icon;
  const initials =
    [(form.last_name || "")[0], (form.first_name || "")[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const g2 = isMobile ? "1fr" : "1fr 1fr";
  const g3 = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const gDoc = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)";

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0a0f1e",
        }}
      >
        <Loader2
          size={28}
          style={{ color: "#a5b4fc", animation: "spin .8s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a1020 100%)",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.1)} 50%{box-shadow:0 0 40px rgba(99,102,241,0.2)} }
        * { box-sizing:border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); border-radius:99px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,0.5); }
      `}</style>

      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: isMobile ? "16px 12px 40px" : "24px 20px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Submit Modal ── */}
        {showSubmitModal && (
          <SubmitModal
            missing={getMissingFields()}
            onConfirm={handleConfirmSubmit}
            onClose={() => setShowSubmitModal(false)}
            saving={saving && savingMode === "submit"}
          />
        )}

        {/* ── Sticky Edit Bar ── */}
        {editing && (
          <div
            style={{
              position: "sticky",
              top: 16,
              zIndex: 50,
              animation: "fadeIn 0.3s ease",
              background: "rgba(13,21,38,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: isMobile ? "14px 16px" : "14px 24px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              gap: 12,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: saving
                    ? savingMode === "draft"
                      ? "#60a5fa"
                      : "#fbbf24"
                    : "#fbbf24",
                  boxShadow: `0 0 12px ${saving ? (savingMode === "draft" ? "rgba(96,165,250,0.5)" : "rgba(251,191,36,0.5)") : "rgba(251,191,36,0.5)"}`,
                  animation: saving ? "none" : "pulse 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {saving
                  ? savingMode === "draft"
                    ? "Хадгалж байна..."
                    : "Илгээж байна..."
                  : isNewUser
                    ? "Мэдээлэл бөглөх"
                    : "Засварлаж байна"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() =>
                  isNewUser ? router.push("/login") : cancelEdit()
                }
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(148,163,184,0.8)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <X size={14} /> Болих
              </button>
              {/* ✅ SAVE BUTTON - blue when saving */}
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  background:
                    saving && savingMode === "draft"
                      ? "rgba(59,130,246,0.15)"
                      : "rgba(255,255,255,0.06)",
                  color:
                    saving && savingMode === "draft"
                      ? "#60a5fa"
                      : "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving && savingMode === "draft" ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Save size={14} />
                )}
                {saving && savingMode === "draft"
                  ? "Хадгалж байна..."
                  : "Хадгалах"}
              </button>
              {/* ✅ SUBMIT BUTTON - purple when submitting */}
              <button
                onClick={handleSubmitClick}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    saving && savingMode === "submit"
                      ? "linear-gradient(135deg, #7c3aed, #8b5cf6)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow:
                    saving && savingMode === "submit"
                      ? "0 4px 20px rgba(139,92,246,0.4)"
                      : "0 4px 20px rgba(99,102,241,0.4)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving && savingMode === "submit" ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Send size={14} />
                )}
                {saving && savingMode === "submit"
                  ? "Илгээж байна..."
                  : "Илгээх"}
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
              gap: 10,
              padding: "14px 18px",
              borderRadius: 16,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              animation: "fadeIn .3s ease",
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: "#f87171", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 500 }}>
              {error}
            </span>
          </div>
        )}
        {saved && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 18px",
              borderRadius: 16,
              background: saved.includes("🚀")
                ? "rgba(99,102,241,0.1)"
                : "rgba(16,185,129,0.1)",
              border: saved.includes("🚀")
                ? "1px solid rgba(99,102,241,0.25)"
                : "1px solid rgba(16,185,129,0.25)",
              animation: "fadeIn .3s ease",
            }}
          >
            <span style={{ fontSize: 18 }}>
              {saved.includes("🚀") ? "🚀" : "✅"}
            </span>
            <span
              style={{
                fontSize: 13,
                color: saved.includes("🚀") ? "#a5b4fc" : "#6ee7b7",
                fontWeight: 500,
              }}
            >
              {saved.replace(/^[🚀✅]\s*/, "")}
            </span>
          </div>
        )}

        {/* ── HERO CARD ── */}
        <GlassCard glow="rgba(99,102,241,0.15)">
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 24,
            }}
          >
            <label
              style={{
                cursor: editing ? "pointer" : "default",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  overflow: "hidden",
                  background: previews.profile_photo
                    ? "transparent"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
                }}
              >
                {previews.profile_photo ? (
                  <img
                    src={previews.profile_photo}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{ fontSize: 30, fontWeight: 700, color: "white" }}
                  >
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
                      borderRadius: 22,
                      background: "rgba(0,0,0,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Camera size={18} color="white" />
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <h2
                  style={{
                    fontSize: isMobile ? 18 : 22,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.92)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {[form.last_name, form.first_name]
                    .filter(Boolean)
                    .join(" ") || "Нэр оруулаагүй"}
                </h2>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 14px",
                    borderRadius: 99,
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.color}20`,
                  }}
                >
                  <StatusIcon size={12} />
                  {sc.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {profile?.supplier_number && (
                  <span
                    style={{
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(148,163,184,0.7)",
                      fontFamily: "'JetBrains Mono', monospace",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    #{profile.supplier_number}
                  </span>
                )}
                {profile?.email && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(148,163,184,0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Mail size={12} /> {profile.email}
                  </span>
                )}
                {profile?.phone && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(148,163,184,0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Phone size={12} /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                alignItems: isMobile ? "center" : "flex-end",
                gap: 12,
                width: isMobile ? "100%" : "auto",
              }}
            >
              <RingProgress pct={pct} />
              {!editing && !isNewUser && (
                <button
                  onClick={startEdit}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                    e.currentTarget.style.color = "#a5b4fc";
                    e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <Pencil size={14} /> Засах
                </button>
              )}
            </div>
          </div>
          {profile?.status === "returned" && (
            <div
              style={{
                marginTop: 20,
                borderRadius: 16,
                border: "1px solid rgba(239,68,68,0.25)",
                overflow: "hidden",
                background: "rgba(239,68,68,0.05)",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: profile?.return_reason
                    ? "1px solid rgba(239,68,68,0.15)"
                    : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5" }}
                  >
                    Бүртгэл буцаагдсан
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(248,113,113,0.7)",
                      marginTop: 2,
                    }}
                  >
                    Шалтгааныг уншаад мэдээллээ засаад дахин илгээнэ үү
                  </div>
                </div>
              </div>
              {profile?.return_reason && (
                <div style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#fca5a5",
                      lineHeight: 1.7,
                      background: "rgba(239,68,68,0.08)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      border: "1px solid rgba(239,68,68,0.2)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {profile.return_reason}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* ── 1. Үндсэн мэдээлэл ── */}
        <GlassCard>
          <SectionHeader
            icon={User}
            title="ХУВЬ ХҮНИЙ ҮНДСЭН МЭДЭЭЛЭЛ"
            subtitle="Хувийн болон холбоо барих мэдээлэл"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: g3,
              gap: 18,
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
              icon={User}
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
                  last_name:
                    v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
                }));
              }}
              fieldError={fieldErrors.last_name}
              icon={User}
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
                  first_name:
                    v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
                }));
              }}
              fieldError={fieldErrors.first_name}
              icon={User}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: g3,
              gap: 18,
              marginBottom: 20,
            }}
          >
            <FInput
              label="Регистрийн дугаар"
              value={profile?.register_number || ""}
              editing={editing}
              disabled={true}
              mono
              icon={CreditCard}
            />
            <FInput
              label="Төрсөн огноо *"
              type="date"
              value={form.birth_date}
              onChange={(v: string) => F("birth_date", v)}
              editing={editing}
              icon={Calendar}
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
          <div style={{ display: "grid", gridTemplateColumns: g2, gap: 18 }}>
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
              icon={Phone}
            />
            <FRadio
              label="НӨАТ төлөгч эсэх"
              value={form.is_vat_payer}
              onChange={(v: any) =>
                F("is_vat_payer", v === "true" || v === true)
              }
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
              gap: 18,
              marginTop: 18,
            }}
          >
            <FInput
              label="И-мэйл хаяг"
              type="email"
              value={form.email || ""}
              disabled={true}
              editing={editing}
              icon={Mail}
            />
            <FSelect
              label="Нийлүүлэх төрөл *"
              value={form.supply_direction || ""}
              onChange={(v: string) => F("supply_direction", v)}
              editing={editing}
              options={[
                { value: "service", label: "Үйлчилгээ" },
                { value: "goods", label: "Бараа материал" },
                { value: "all", label: "Бүгд" },
              ]}
              placeholder="Сонгоно уу"
            />
          </div>
        </GlassCard>

        {/* ── 2. Хаяг ── */}
        <GlassCard>
          <SectionHeader
            icon={MapPin}
            title="ХАЯГ, БАЙРШИЛ"
            subtitle="Оршин суугаа хаягийн мэдээлэл"
          />
          <div style={{ display: "grid", gridTemplateColumns: g2, gap: 18 }}>
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
              gap: 18,
              marginTop: 18,
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
          <div style={{ marginTop: 18 }}>
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
            {form.address_different && (
              <div style={{ marginTop: 14, animation: "fadeIn .2s ease" }}>
                <FInput
                  label="Одоо оршин суугаа хаяг"
                  value={form.orshisuugaa_hayag}
                  editing={editing}
                  onChange={(v: string) => F("orshisuugaa_hayag", v)}
                  placeholder="Дэлгэрэнгүй хаяг бичнэ үү"
                />
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── 3. Үйл ажиллагаа ── */}
        <GlassCard>
          <SectionHeader
            icon={Briefcase}
            title="ЭРХЭЛЖ БУЙ ҮЙЛ АЖИЛЛАГАА"
            subtitle="Нийлүүлэх чиглэл, огноо болон тайлбар"
          />
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(148,163,184,0.7)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              Нийлүүлэх чиглэл{" "}
              {editing && <span style={{ color: "#f87171" }}>*</span>}
              {selDirs.length > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    color: "#34d399",
                    fontWeight: 600,
                    background: "rgba(16,185,129,0.1)",
                    padding: "3px 10px",
                    borderRadius: 99,
                    border: "1px solid rgba(16,185,129,0.2)",
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
          <div style={{ display: "grid", gridTemplateColumns: g2, gap: 18 }}>
            <FInput
              label="Үйл ажиллагаа эхэлсэн огноо *"
              type="date"
              value={form.activity_start_date}
              onChange={(v: string) => F("activity_start_date", v)}
              editing={editing}
              icon={Calendar}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(148,163,184,0.7)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 10,
              }}
            >
              Үйл ажиллагааны тайлбар
            </label>
            {editing ? (
              <textarea
                value={form.activity_description}
                onChange={(e) => F("activity_description", e.target.value)}
                rows={4}
                placeholder="Хийж буй үйл ажиллагаа, туршлага, онцлог, үйлчлүүлэгчийн төрөл гэх мэт..."
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.7,
                  minHeight: 120,
                  background: "rgba(255,255,255,0.03)",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 14,
                  color: form.activity_description
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(148,163,184,0.4)",
                  padding: "12px 0",
                  lineHeight: 1.7,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {form.activity_description || "—"}
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── 4. Баримт бичиг ── */}
        <GlassCard>
          <SectionHeader
            icon={Shield}
            title="БАРИМТ БИЧИГ"
            subtitle="Таниулах бичиг баримт оруулах"
          />
          <div style={{ display: "grid", gridTemplateColumns: gDoc, gap: 14 }}>
            <DocCard
              label="Иргэний үнэмлэх урд тал"
              fieldKey="id_card_front"
              preview={previews.id_card_front}
              onFile={onFile}
              editing={editing}
              accept="image/*"
              required
              icon={CreditCard}
            />
            <DocCard
              label="Иргэний үнэмлэх ард тал"
              fieldKey="id_card_back"
              preview={previews.id_card_back}
              onFile={onFile}
              editing={editing}
              accept="image/*"
              required
              icon={CreditCard}
            />
            <DocCard
              label="Үйл ажиллагааны танилцуулга"
              fieldKey="activity_intro"
              preview={previews.activity_intro}
              onFile={onFile}
              editing={editing}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              icon={FileText}
            />
          </div>
        </GlassCard>

        {/* ── 5. Мэдэгдэл ── */}
        <GlassCard>
          <SectionHeader
            icon={Bell}
            title="МЭДЭГДЭЛ ХҮЛЭЭН АВАХ"
            subtitle="Зарын мэдэгдэл хэрхэн хүлээн авах"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                value: "all",
                icon: "🔔",
                label: "Бүх зарлалаар мэдэгдэл авах",
                desc: "Системд нийтлэгдсэн бүх зарын мэдэгдлийг хүлээн авна",
              },
              {
                value: "selected_dirs",
                icon: "🎯",
                label: "Сонгосон чиглэлээр мэдэгдэл авах",
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
                    gap: 14,
                    padding: "16px 18px",
                    borderRadius: 14,
                    cursor: editing ? "pointer" : "default",
                    border: isOn
                      ? "1.5px solid rgba(99,102,241,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isOn
                      ? "rgba(99,102,241,0.08)"
                      : "rgba(255,255,255,0.02)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (editing) {
                      e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.3)";
                      e.currentTarget.style.background =
                        "rgba(99,102,241,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (editing) {
                      e.currentTarget.style.borderColor = isOn
                        ? "rgba(99,102,241,0.5)"
                        : "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = isOn
                        ? "rgba(99,102,241,0.08)"
                        : "rgba(255,255,255,0.02)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      marginTop: 1,
                      border: isOn
                        ? "2px solid #818cf8"
                        : "2px solid rgba(255,255,255,0.2)",
                      background: isOn ? "#6366f1" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {isOn && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{opt.icon}</span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isOn ? "#a5b4fc" : "rgba(255,255,255,0.8)",
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(148,163,184,0.5)",
                        lineHeight: 1.5,
                      }}
                    >
                      {opt.desc}
                    </div>
                    {opt.value === "selected_dirs" && isOn && (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        {selDirs.length === 0 ? (
                          <span style={{ fontSize: 11, color: "#fbbf24" }}>
                            ⚠️ Үйл ажиллагааны чиглэл сонгоогүй
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
                                  color: "#a5b4fc",
                                  background: "rgba(99,102,241,0.15)",
                                  border: "1px solid rgba(99,102,241,0.3)",
                                  padding: "3px 10px",
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
              marginTop: 16,
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>📧</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  И-мэйл мэдэгдэл
                </div>
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>
                  {profile?.email || "И-мэйл хаяг байхгүй"}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 99,
                background: "rgba(16,185,129,0.1)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              Идэвхтэй
            </span>
          </div>
        </GlassCard>

        {/* ── Bottom Save Bar ── */}
        {editing && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              animation: "slideUp 0.3s ease",
            }}
          >
            <button
              onClick={() => (isNewUser ? router.push("/login") : cancelEdit())}
              disabled={saving}
              style={{
                padding: "12px 24px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(148,163,184,0.7)",
                fontSize: 14,
                fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <X size={15} style={{ display: "inline", marginRight: 6 }} />
              Болих
            </button>
            {/* ✅ BOTTOM SAVE BUTTON */}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.15)",
                background:
                  saving && savingMode === "draft"
                    ? "rgba(59,130,246,0.15)"
                    : "rgba(255,255,255,0.06)",
                color:
                  saving && savingMode === "draft"
                    ? "#60a5fa"
                    : "rgba(255,255,255,0.9)",
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving && savingMode === "draft" ? (
                <Loader2
                  size={15}
                  style={{
                    animation: "spin .8s linear infinite",
                    display: "inline",
                    marginRight: 6,
                  }}
                />
              ) : (
                <Save size={15} style={{ display: "inline", marginRight: 6 }} />
              )}
              {saving && savingMode === "draft"
                ? "Хадгалж байна..."
                : "Хадгалах"}
            </button>
            {/* ✅ BOTTOM SUBMIT BUTTON */}
            <button
              onClick={handleSubmitClick}
              disabled={saving}
              style={{
                padding: "12px 32px",
                borderRadius: 14,
                border: "none",
                background:
                  saving && savingMode === "submit"
                    ? "linear-gradient(135deg, #7c3aed, #8b5cf6)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow:
                  saving && savingMode === "submit"
                    ? "0 8px 30px rgba(139,92,246,0.4)"
                    : "0 8px 30px rgba(99,102,241,0.4)",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving && savingMode === "submit" ? (
                <Loader2
                  size={15}
                  style={{
                    animation: "spin .8s linear infinite",
                    display: "inline",
                    marginRight: 6,
                  }}
                />
              ) : (
                <Send size={15} style={{ display: "inline", marginRight: 6 }} />
              )}
              {saving && savingMode === "submit" ? "Илгээж байна..." : "Илгээх"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
