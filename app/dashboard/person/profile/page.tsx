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
} from "lucide-react";
import {
  validateMongolianForm,
  isMongolian,
} from "@/utils/mongolianValidation";
import { UB_DUUREG, AIMAG_SUM } from "@/constants/addressData";

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
  new:      { label: "Бүртгэл үүсгэх",  bg: "#f0f9ff", color: "#0369a1" },
  pending:  { label: "Хянагдаж байна",   bg: "#fffbeb", color: "#92400e" },
  active:   { label: "✓ Баталгаажсан",   bg: "#dcfce7", color: "#166534" },
  approved: { label: "✓ Баталгаажсан",   bg: "#dcfce7", color: "#166534" },
  returned: { label: "Буцаагдсан",        bg: "#fef2f2", color: "#991b1b" },
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
};

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
  selDirs: number[],
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

function FInput({
  label,
  value,
  onChange,
  editing,
  type = "text",
  placeholder,
  mono = false,
  fieldError,
}: any) {
  const display = type === "date" && !editing ? fmtDate(value) : value;
  return (
    <div>
      <label style={S.label}>{label}</label>
      {editing ? (
        <>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || label}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: fieldError
                ? "1.5px solid #ef4444"
                : "1.5px solid #e2e8f0",
              fontSize: 13,
              color: "#1e293b",
              outline: "none",
              background: fieldError ? "#fff5f5" : "white",
              boxSizing: "border-box" as const,
              fontFamily: mono ? "monospace" : "inherit",
              transition: "border-color .15s",
            }}
            onFocus={(e) =>
              ((e.target as HTMLElement).style.borderColor = fieldError
                ? "#ef4444"
                : "#6366f1")
            }
            onBlur={(e) =>
              ((e.target as HTMLElement).style.borderColor = fieldError
                ? "#ef4444"
                : "#e2e8f0")
            }
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
            overflowWrap: "break-word",
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
  label, fieldKey, preview, onFile, editing,
  accept = "image/*", required = false,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ fieldKey болон accept-ээр file type тодорхойлно
  const isDocField = accept.includes("pdf") || accept.includes(".doc");
  const isImageOnly = !isDocField;

  // Preview-г зөв харуулах
  const showAsImage = preview && isImageOnly;
  const showAsFile  = preview && isDocField;

  return (
    <div style={{ display:"block" }}>
      <div style={S.label as any}>
        {label}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
      </div>
      <div
        onClick={() => editing && inputRef.current?.click()}
        style={{
          borderRadius:12,
          border: preview ? "1.5px solid #a7f3d0" : "1.5px dashed #e2e8f0",
          background: preview ? "#f0fdf4" : "#fafafa",
          minHeight:90, display:"flex", alignItems:"center",
          justifyContent:"center", overflow:"hidden",
          position:"relative", transition:"all .15s",
          cursor: editing ? "pointer" : "default",
          flexDirection:"column" as const,
        }}>

        {preview ? (
          showAsImage ? (
            <img src={preview} alt=""
              style={{ width:"100%", height:90, objectFit:"cover" }}/>
          ) : (
            <div style={{ textAlign:"center", padding:12 }}>
              <FileText size={28} style={{ color:"#059669", display:"block", margin:"0 auto 6px" }}/>
              <p style={{ fontSize:11, color:"#059669", margin:0, fontWeight:600 }}>
                Файл байна ✓
              </p>
              {!preview.startsWith("blob:") && (
                <a href={preview} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize:10, color:"#6366f1", marginTop:4,
                    display:"block", textDecoration:"underline" }}>
                  Харах
                </a>
              )}
            </div>
          )
        ) : (
          <div style={{ textAlign:"center", padding:16 }}>
            <Upload size={20} style={{ color:"#cbd5e1", display:"block", margin:"0 auto 6px" }}/>
            <p style={{ fontSize:11, color:"#94a3b8", margin:0 }}>
              {editing ? "Дарж оруулах" : "Байхгүй"}
            </p>
            {editing && isDocField && (
              <p style={{ fontSize:10, color:"#cbd5e1", margin:"3px 0 0" }}>
                PDF, Word, Excel, зураг
              </p>
            )}
          </div>
        )}

        {editing && preview && (
          <div style={{
            position:"absolute", inset:0, background:"rgba(0,0,0,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            opacity:0, transition:"opacity .15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity="1"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity="0"}>
            <span style={{ color:"white", fontSize:12, fontWeight:600 }}>Солих</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display:"none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            alert("Файлын хэмжээ 10MB-аас хэтрэхгүй байх ёстой");
            e.target.value = "";
            return;
          }
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
        style={{ transition: "stroke-dasharray .8s ease, stroke .4s" }}
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

export default function PersonProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selDirs, setSelDirs] = useState<number[]>([]);
  const [selDirSnap, setSelDirSnap] = useState<number[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [form, setForm] = useState<any>(BLANK);
  const [snapshot, setSnapshot] = useState<any>(BLANK);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDirs(d.directions || []);
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
          };
          setForm(f);
          setSnapshot(f);
          const sdirs = Array.isArray(u.activity_directions)
            ? u.activity_directions
            : [];
          setSelDirs(sdirs);
          setSelDirSnap(sdirs);
          const p: Record<string, string> = {};
          if (u.profile_photo_url) p.profile_photo = u.profile_photo_url;
          if (u.id_card_front_url) p.id_card_front = u.id_card_front_url;
          if (u.id_card_back_url) p.id_card_back = u.id_card_back_url;
          if (u.activity_intro_url) p.activity_intro = u.activity_intro_url;
          setPreviews(p);

          // ✅ Шинэ хэрэглэгч бол шууд edit mode
          const isNewUser = !u.first_name && !u.last_name;
          setEditing(isNewUser);
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

  const startEdit = () => {
    setSnapshot({ ...form });
    setSelDirSnap([...selDirs]);
    setEditing(true);
    setError("");
  };
  const cancelEdit = () => {
    setForm({ ...snapshot });
    setSelDirs([...selDirSnap]);
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    // ✅ Монгол validation
    const errs = validateMongolianForm(form, [
      "family_name",
      "last_name",
      "first_name",
      "sum_duureg",
      // ✅ УБ биш үед л bag_horoo монгол шалгана
      ...(form.aimag_niislel !== "Улаанбаатар" ? ["bag_horoo" as const] : []),
    ]);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Зарим талбар монгол үсгээр бичигдэх ёстой");
      return;
    }
    if (form.phone && form.phone.length !== 8) {
      setFieldErrors((p) => ({ ...p, phone: "8 оронтой тоо оруулна уу" }));
      setError("Утасны дугаар 8 оронтой байх ёстой");
      return;
    }
    setFieldErrors({});

    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
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
      }
      setSaved(true);
      setEditing(false);
      setFiles({});
      setSnapshot({ ...form });
      setSelDirSnap([...selDirs]);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDir = (id: number) =>
    setSelDirs((p) =>
      p.includes(id) ? p.filter((d) => d !== id) : [...p, id],
    );

  const pct = calcPct(form, selDirs, previews);
  const isNewUser = !profile?.first_name && !profile?.last_name;
  const statusKey = (profile?.status ??
    "pending") as keyof typeof PERSON_STATUS;
  const sc = PERSON_STATUS[statusKey] ?? PERSON_STATUS.pending;

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

  const initials =
    [(form.last_name || "")[0], (form.first_name || "")[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "20px 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        * { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity:.5; cursor:pointer; }
        @media(max-width:640px){
          .profile-hero  { flex-direction:column !important; align-items:flex-start !important; }
          .profile-grid2 { grid-template-columns:1fr !important; }
          .profile-grid3 { grid-template-columns:1fr 1fr !important; }
          .profile-docs  { grid-template-columns:1fr 1fr !important; }
          .save-bar-btns { flex-direction:column !important; }
        }
      `}</style>

      {/* ── Sticky save bar ───────────────────────────────────── */}
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
            borderRadius: 14,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
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
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                {isNewUser ? "Мэдээлэл бөглөх" : "Засварлаж байна"}
              </span>
              {isNewUser && (
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
                  · Доорх талбаруудыг бөглөөд хадгална уу
                </span>
              )}
            </div>
          </div>
          <div className="save-bar-btns" style={{ display: "flex", gap: 8 }}>
            {/* ✅ Шинэ хэрэглэгч бол Болих товч харуулахгүй */}
            {!isNewUser && (
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
                }}
              >
                <X size={13} /> Болих
              </button>
            )}
            <button
              onClick={handleSave}
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
              }}
            >
              {saving ? (
                <Loader2
                  size={13}
                  style={{ animation: "spin .8s linear infinite" }}
                />
              ) : (
                <Check size={13} />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      )}

      {/* ── Alerts ────────────────────────────────────────────── */}
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

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Card>
        <div
          className="profile-hero"
          style={{ display: "flex", alignItems: "center", gap: 20 }}
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
                  fontSize: 18,
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
              {profile?.email && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {profile.email}
                </span>
              )}
            </div>
          </div>

          {/* Progress + button */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" as const }}>
                <div
                  style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}
                >
                  Анкет бөглөлт
                </div>
                {pct < 100 && (
                  <div style={{ fontSize: 10, color: "#f59e0b" }}>
                    Бүрэн биш
                  </div>
                )}
              </div>
              <Ring pct={pct} />
            </div>
            {/* ✅ Засварлах товч — зөвхөн хуучин хэрэглэгч, edit mode биш үед */}
            {!editing && !isNewUser && (
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
                <Pencil size={13} /> Засварлах
              </button>
            )}
            {editing && !isNewUser && (
              <div
                style={{
                  fontSize: 11,
                  color: "#f59e0b",
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 8,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#f59e0b",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                Засварлаж байна
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        {pct < 100 && !editing && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fafafa",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18 }}>💡</div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: 2,
                }}
              >
                Анкетаа бүрэн бөглөнө үү
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                {!form.gender && "Хүйс · "}
                {!form.birth_date && "Төрсөн огноо · "}
                {selDirs.length === 0 && "Нийлүүлэх чиглэл · "}
                {!previews.profile_photo && "Профайл зураг · "}
                {!previews.id_card_front && "Иргэний үнэмлэх"}
              </div>
            </div>
          </div>
        )}

        {/* Returned warning */}
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
                background: "linear-gradient(135deg,#fef2f2,#fff5f5)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: profile?.return_reason
                  ? "1px solid #fecaca"
                  : "none",
              }}
            >
              <div style={{ fontSize: 20 }}>⚠️</div>
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
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "#dc2626",
                    marginBottom: 8,
                  }}
                >
                  Буцаасан шалтгаан
                </div>
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
                <div
                  style={{
                    fontSize: 11,
                    color: "#b91c1c",
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>→</span>
                  <span>
                    Мэдээллээ засаад <strong>"Хадгалах"</strong> товчийг дарна
                    уу
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── 1. Үндсэн мэдээлэл ───────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={User}
          title="Үндсэн мэдээлэл"
          subtitle="Хувийн болон холбоо барих"
        />
        <div
          className="profile-grid3"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <FInput
            label="Ургийн овог *"
            value={form.family_name}
            onChange={(v: string) => {
              F("family_name", v);
              setFieldErrors((p) => ({
                ...p,
                family_name:
                  v && !isMongolian(v) ? "Ургийн овог криллээр бичнэ үү" : "",
              }));
            }}
            editing={editing}
            fieldError={fieldErrors.family_name}
          />

          <FInput
            label="Овог *"
            value={form.last_name}
            onChange={(v: string) => {
              F("last_name", v);
              setFieldErrors((p) => ({
                ...p,
                last_name: v && !isMongolian(v) ? "Овог криллээр бичнэ үү" : "",
              }));
            }}
            editing={editing}
            fieldError={fieldErrors.last_name}
          />

          <FInput
            label="Нэр *"
            value={form.first_name}
            onChange={(v: string) => {
              F("first_name", v);
              setFieldErrors((p) => ({
                ...p,
                first_name: v && !isMongolian(v) ? "Нэр криллээр бичнэ үү" : "",
              }));
            }}
            editing={editing}
            fieldError={fieldErrors.first_name}
          />
        </div>
        <div
          className="profile-grid2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
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
          className="profile-grid2"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <FInput
            label="Утасны дугаар"
            type="tel"
            value={form.phone}
            onChange={(v: string) => {
              const digits = v.replace(/\D/g, "").slice(0, 8);
              F("phone", digits);
              setFieldErrors((p) => ({
                ...p,
                phone:
                  digits && digits.length < 8 ? "8 оронтой тоо оруулна уу" : "",
              }));
            }}
            editing={editing}
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
      </Card>

      {/* ── 2. Хаяг ───────────────────────────────────────────── */}

      <Card>
        <SectionTitle
          icon={MapPin}
          title="Хаяг, байршил"
          subtitle="Бүртгэлийн болон оршин суугаа хаяг"
        />

        <div
          className="profile-grid2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <FSelect
            label="Аймаг / Нийслэл *"
            value={form.aimag_niislel}
            onChange={(v: string) => {
              F("aimag_niislel", v);
              F("sum_duureg", "");
              F("bag_horoo", "");
              // ✅ Аймаг солигдоход bag_horoo error арилгана
              setFieldErrors((p) => ({ ...p, bag_horoo: "", sum_duureg: "" }));
            }}
            options={AIMAG}
            placeholder="Сонгох"
            editing={editing}
          />

          {/* Дүүрэг / Сум — аймгаас хамаарна */}
          {form.aimag_niislel === "Улаанбаатар" ? (
            <FSelect
              label="Дүүрэг *"
              value={form.sum_duureg}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
              }}
              options={Object.keys(UB_DUUREG)}
              placeholder="Дүүрэг сонгох"
              editing={editing}
            />
          ) : (
            <FSelect
              label="Сум *"
              value={form.sum_duureg}
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
              editing={editing}
            />
          )}
        </div>

        <div
          className="profile-grid2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Хороо — дүүргээс хамаарна */}
          {form.aimag_niislel === "Улаанбаатар" &&
          form.sum_duureg &&
          UB_DUUREG[form.sum_duureg] ? (
            <FSelect
              label="Хороо *"
              value={form.bag_horoo}
              onChange={(v: string) => F("bag_horoo", v)}
              options={UB_DUUREG[form.sum_duureg]}
              placeholder="Хороо сонгох"
              editing={editing}
            />
          ) : (
            <FInput
              label="Баг / Хороо *"
              value={form.bag_horoo}
              onChange={(v: string) => {
                F("bag_horoo", v);
                setFieldErrors((p) => ({
                  ...p,
                  bag_horoo:
                    v && !isMongolian(v) ? "Монгол үсгээр бичнэ үү" : "",
                }));
              }}
              editing={editing}
              fieldError={fieldErrors.bag_horoo}
            />
          )}

          <FInput
            label="Байр, тоот"
            value={form.toot}
            onChange={(v: string) => F("toot", v)}
            editing={editing}
            placeholder="Байр болон тоот оруулах"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <FRadio
            label="Оршин суугаа хаяг бүртгэлийнхээс өөр үү?"
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
              label="Оршин суугаа хаяг"
              value={form.orshisuugaa_hayag}
              onChange={(v: string) => F("orshisuugaa_hayag", v)}
              editing={editing}
              placeholder="Дэлгэрэнгүй хаяг бичнэ үү"
            />
          </div>
        )}
      </Card>

      {/* ── 3. Үйл ажиллагаа ──────────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={Briefcase}
          title="Үйл ажиллагаа"
          subtitle="Үйл ажиллагаа явуулж буй чиглэл"
        />
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Нийлүүлэх чиглэл *</label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
            {dirs.length === 0 ? (
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Чиглэл ачаалж байна...
              </span>
            ) : (
              dirs.map((d) => {
                const on = selDirs.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => editing && toggleDir(d.id)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontFamily: "inherit",
                      border: on
                        ? "1.5px solid #6366f1"
                        : "1.5px solid #e2e8f0",
                      background: on ? "#eef2ff" : "white",
                      color: on ? "#4f46e5" : "#64748b",
                      cursor: editing ? "pointer" : "default",
                      fontWeight: on ? 600 : 400,
                      transition: "all .12s",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })
            )}
          </div>
          {!editing && selDirs.length === 0 && (
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
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <FInput
            label="Үйл ажиллагаа эхэлсэн огноо *"
            type="date"
            value={form.activity_start_date}
            onChange={(v: string) => F("activity_start_date", v)}
            editing={editing}
          />
        </div>
        <div>
          <label style={S.label}>Үйл ажиллагааны тайлбар</label>
          {editing ? (
            <textarea
              value={form.activity_description}
              onChange={(e) => F("activity_description", e.target.value)}
              rows={3}
              placeholder="Хийж буй үйл ажиллагаа, туршлагаа товч тайлбарлана уу..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                resize: "vertical" as const,
                fontFamily: "inherit",
                lineHeight: 1.6,
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
                fontSize: 13,
                color: form.activity_description ? "#1e293b" : "#cbd5e1",
                padding: "10px 0",
                lineHeight: 1.6,
                borderBottom: "1px solid #f1f5f9",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {form.activity_description || "—"}
            </div>
          )}
        </div>
      </Card>

      {/* ── 4. Баримт бичиг ───────────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={Shield}
          title="Баримт бичиг"
          subtitle="Таниулах бичиг баримт"
        />
        <div
          className="profile-docs"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
          }}
        >
          <DocCard
            label="Профайл зураг"
            fieldKey="profile_photo"
            preview={previews.profile_photo}
            onFile={onFile}
            editing={editing}
            accept="image/*"
            required
          />
          <DocCard
            label="Иргэний үнэмлэх (урд)"
            fieldKey="id_card_front"
            preview={previews.id_card_front}
            onFile={onFile}
            editing={editing}
            accept="image/*"
            required
          />
          <DocCard
            label="Иргэний үнэмлэх (ард)"
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
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
          />
        </div>
      </Card>

      {/* ── 5. Мэдэгдлийн тохиргоо ────────────────────────────── */}
      <Card>
        <SectionTitle
          icon={Bell}
          title="Мэдэгдлийн тохиргоо"
          subtitle="Зар болон системийн мэдэгдлийг хэрхэн хүлээн авах"
        />
        <FSelect
          label="Мэдэгдэл хүлээн авах арга"
          value={form.notification_type}
          onChange={(v: string) => F("notification_type", v)}
          editing={editing}
          options={[
            { value: "email", label: "И-мэйлээр" },
            // {value:"sms",   label:"Мессежээр"},
            // {value:"both",  label:"И-мэйл болон Мессеж"},
            // {value:"none",  label:"Мэдэгдэл авахгүй"},
          ]}
        />
      </Card>
    </div>
  );
}
