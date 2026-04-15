"use client";

import { useEffect, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Bell,
  Search,
  MoreHorizontal,
  Clock,
  ChevronUp,
  Menu,
  BarChart3,
  Settings,
  UserCheck,
  Activity,
  ArrowUpRight,
  X,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  FileText,
  ChevronDown,
} from "lucide-react";
import { CompaniesTab } from "./admin/_components/CompaniesTab";
import { CategoriesTab } from "./admin/_components/Categoriestab";
import { DirectionsTab } from "./admin/_components/Directionstab";
import { IndividualsTab } from "./admin/_components/individuals/IndividualsTab";

// ── Types ─────────────────────────────────────────────────────────
type Admin = {
  id: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};
type NavId =
  | "dashboard"
  | "notifications"
  | "admins"
  | "companies"
  | "individuals"
  | "categories"
  | "directions"
  | "directions";
type ModalMode = "create" | "edit" | null;

type Person = {
  id: string;
  supplier_number?: string;
  last_name?: string;
  first_name?: string;
  family_name?: string;
  email: string;
  phone?: string;
  register_number?: string;
  birth_date?: string;
  gender?: string;
  aimag_niislel?: string;
  sum_duureg?: string;
  bag_horoo?: string;
  toot?: string;
  orshisuugaa_hayag?: string;
  activity_directions?: string[];
  activity_description?: string;
  supply_direction?: string;
  activity_start_date?: string;
  is_vat_payer?: boolean;
  notification_type?: string;
  profile_photo_url?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  activity_intro_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  return_reason?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ── Mock dashboard data ───────────────────────────────────────────
const RECENT = [
  {
    id: 1,
    name: "Болд Баатар",
    type: "individual",
    status: "approved",
    time: "2 мин",
    amount: "₮1.2M",
  },
  {
    id: 2,
    name: "Номин Трейд ХХК",
    type: "company",
    status: "pending",
    time: "15 мин",
    amount: "₮8.4M",
  },
  {
    id: 3,
    name: "Сарнай Дорж",
    type: "individual",
    status: "approved",
    time: "1 цаг",
    amount: "₮560K",
  },
  {
    id: 4,
    name: "Бурхан Констракшн",
    type: "company",
    status: "rejected",
    time: "2 цаг",
    amount: "₮12M",
  },
  {
    id: 5,
    name: "Энхбаяр Лувсан",
    type: "individual",
    status: "pending",
    time: "3 цаг",
    amount: "₮2.1M",
  },
  {
    id: 6,
    name: "Алтай Эрчим ХХК",
    type: "company",
    status: "approved",
    time: "5 цаг",
    amount: "₮34M",
  },
];
const NOTIFS = [
  {
    id: 1,
    text: "Номин Трейд ХХК бүртгэлийн хүсэлт ирлээ",
    time: "15 мин",
    unread: true,
  },
  {
    id: 2,
    text: "Бурхан Констракшн татгалзагдлаа",
    time: "2 цаг",
    unread: true,
  },
  { id: 3, text: "Шинэ 5 хувь хүн бүртгүүллээ", time: "4 цаг", unread: false },
  {
    id: 4,
    text: "Сүүлийн 7 хоногийн тайлан бэлэн боллоо",
    time: "1 өдөр",
    unread: false,
  },
];
const MONTHLY = [
  { m: "1-р", i: 28, c: 12 },
  { m: "2-р", i: 35, c: 18 },
  { m: "3-р", i: 42, c: 22 },
  { m: "4-р", i: 38, c: 25 },
  { m: "5-р", i: 55, c: 30 },
  { m: "6-р", i: 60, c: 35 },
  { m: "7-р", i: 48, c: 28 },
  { m: "8-р", i: 70, c: 42 },
  { m: "9-р", i: 65, c: 38 },
  { m: "10-р", i: 80, c: 50 },
  { m: "11-р", i: 90, c: 58 },
  { m: "12-р", i: 95, c: 62 },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> =
  {
    approved: {
      label: "Зөвшөөрсөн",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
    },
    pending: {
      label: "Хүлээгдэж",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
    rejected: {
      label: "Татгалзсан",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
    },
    active: {
      label: "Идэвхтэй",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
    },
    inactive: {
      label: "Идэвхгүй",
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.1)",
    },
  };

// ── Shared UI ─────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: c.bg,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
        }}
      />
      {c.label}
    </span>
  );
}

function Th({ h }: { h: string }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 16px",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(255,255,255,0.22)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.09em",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        whiteSpace: "nowrap" as const,
      }}
    >
      {h}
    </th>
  );
}

function BarChart() {
  const mx = Math.max(...MONTHLY.map((d) => d.i + d.c));
  const W = 580,
    H = 148,
    PL = 6,
    PB = 20,
    PT = 6,
    PR = 6,
    cW = W - PL - PR,
    cH = H - PT - PB,
    bW = cW / MONTHLY.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {[0, 30, 60, 90].map((v) => (
        <line
          key={v}
          x1={PL}
          x2={W - PR}
          y1={PT + cH - (v / mx) * cH}
          y2={PT + cH - (v / mx) * cH}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {MONTHLY.map((d, i) => {
        const x = PL + i * bW,
          iH = (d.i / mx) * cH,
          cH2 = (d.c / mx) * cH,
          g = 2,
          bw = (bW - g * 3) / 2;
        return (
          <g key={i}>
            <rect
              x={x + g}
              y={PT + cH - iH}
              width={bw}
              height={iH}
              rx="2"
              fill="url(#gi)"
            />
            <rect
              x={x + g * 2 + bw}
              y={PT + cH - cH2}
              width={bw}
              height={cH2}
              rx="2"
              fill="url(#gc)"
            />
            <text
              x={x + bW / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize="7.5"
              fill="rgba(255,255,255,0.22)"
            >
              {d.m}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut() {
  const data = [
    { v: 892, c: "#10b981" },
    { v: 248, c: "#f59e0b" },
    { v: 144, c: "#ef4444" },
  ];
  const tot = data.reduce((s, d) => s + d.v, 0);
  let a = -90;
  const R = 42,
    cx = 55,
    cy = 55;
  const arcs = data.map((d) => {
    const deg = (d.v / tot) * 360,
      r1 = (a * Math.PI) / 180,
      r2 = ((a + deg) * Math.PI) / 180,
      x1 = cx + R * Math.cos(r1),
      y1 = cy + R * Math.sin(r1),
      x2 = cx + R * Math.cos(r2),
      y2 = cy + R * Math.sin(r2),
      path = `M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}Z`;
    a += deg;
    return { ...d, path };
  });
  return (
    <svg
      viewBox="0 0 110 110"
      style={{ width: 110, height: 110, flexShrink: 0 }}
    >
      {arcs.map((a, i) => (
        <path
          key={i}
          d={a.path}
          fill={a.c}
          stroke="#0b1022"
          strokeWidth="1.5"
        />
      ))}
      <circle cx={cx} cy={cy} r={26} fill="#0b1022" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill="rgba(255,255,255,0.88)"
      >
        {tot}
      </text>
      <text
        x={cx}
        y={cy + 9}
        textAnchor="middle"
        fontSize="7"
        fill="rgba(255,255,255,0.3)"
      >
        нийт
      </text>
    </svg>
  );
}

// ── Admin Form Modal ──────────────────────────────────────────────
function AdminModal({
  mode,
  admin,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  admin?: Admin | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    company_name: admin?.company_name ?? "",
    first_name: admin?.first_name ?? "",
    last_name: admin?.last_name ?? "",
    phone: admin?.phone ?? "",
    email: admin?.email ?? "",
    password: "",
    role: admin?.role ?? "admin",
    status: admin?.status ?? "active",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (mode === "create") {
        if (
          !form.first_name ||
          !form.last_name ||
          !form.email ||
          !form.password
        ) {
          setError("Бүх заавал талбарыг бөглөнө үү");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/super-admins/create`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      } else {
        const body: Record<string, string> = {
          company_name: form.company_name,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          role: form.role,
          status: form.status,
        };
        const res = await fetch(`${API}/api/super-admins/${admin!.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      }
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: 40,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 9,
    padding: "0 12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all .18s",
  };
  const labelStyle = {
    fontSize: 10,
    fontWeight: 700 as const,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.3)",
    display: "block" as const,
    marginBottom: 5,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#0f1629",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {mode === "create" ? "Шинэ Админ" : "Админ засах"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                marginTop: 2,
              }}
            >
              {mode === "create"
                ? "Бүх заавал талбарыг бөглөнө үү"
                : "Мэдээллийг шинэчилнэ үү"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 8,
              padding: 7,
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
              marginBottom: 16,
            }}
          >
            <AlertCircle
              size={14}
              style={{ color: "#ef4444", flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "rgba(239,68,68,0.9)" }}>
              {error}
            </span>
          </div>
        )}

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* 2 col grid */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Овог *</label>
              <input
                value={form.last_name}
                onChange={set("last_name")}
                placeholder="Овог"
                required
                style={inputStyle}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(59,130,246,0.4)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Нэр *</label>
              <input
                value={form.first_name}
                onChange={set("first_name")}
                placeholder="Нэр"
                required
                style={inputStyle}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(59,130,246,0.4)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Компанийн нэр</label>
            <input
              value={form.company_name}
              onChange={set("company_name")}
              placeholder="Компани"
              style={inputStyle}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  "rgba(59,130,246,0.4)")
              }
              onBlur={(e) =>
                ((e.target as HTMLInputElement).style.borderColor =
                  "rgba(255,255,255,0.08)")
              }
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>И-мэйл *</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="mail@example.mn"
                required
                disabled={mode === "edit"}
                style={{ ...inputStyle, opacity: mode === "edit" ? 0.5 : 1 }}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(59,130,246,0.4)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Утас</label>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="99001122"
                style={inputStyle}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(59,130,246,0.4)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
          </div>
          {mode === "create" && (
            <div>
              <label style={labelStyle}>Нууц үг *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "rgba(59,130,246,0.4)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "rgba(255,255,255,0.08)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Эрх</label>
              <select
                value={form.role}
                onChange={set("role")}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Статус</label>
              <select
                value={form.status}
                onChange={set("status")}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="active">Идэвхтэй</option>
                <option value="inactive">Идэвхгүй</option>
                <option value="suspended">Түдгэлзүүлсэн</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  {mode === "create" ? "Үүсгэх" : "Хадгалах"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────
function DeleteModal({
  admin,
  onClose,
  onConfirm,
  loading,
}: {
  admin: Admin;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0f1629",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          animation: "modalIn .22s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(239,68,68,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={20} style={{ color: "#ef4444" }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              marginBottom: 6,
            }}
          >
            Устгах уу?
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {admin.last_name} {admin.first_name}
            </span>{" "}
            — {admin.email}
          </div>
          <div
            style={{ fontSize: 11, color: "rgba(239,68,68,0.6)", marginTop: 6 }}
          >
            Энэ үйлдэл буцаах боломжгүй (soft delete)
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 9,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Болих
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 9,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <Loader2
                size={13}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <Trash2 size={13} />
            )}
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Person Detail Modal ───────────────────────────────────────────
function DetailModal({
  person,
  onClose,
  onUpdateStatus,
  loading,
  returnReason,
  setReturnReason,
}: {
  person: Person;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  loading: boolean;
  returnReason: string;
  setReturnReason: (v: string) => void;
}) {
  const nm =
    [person.last_name, person.first_name].filter(Boolean).join(" ") ||
    person.email;
  const ini = (person.first_name?.[0] ?? "?").toUpperCase();
  const [returnError, setReturnError] = useState("");
  const STATUS_ACTIONS = [
    {
      status: "active",
      label: "Баталгаажсан болгох",
      color: "#10b981",
      bg: "rgba(16,185,129,0.15)",
      border: "rgba(16,185,129,0.3)",
    },
    {
      status: "returned",
      label: "Буцаах",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.25)",
    },
    {
      status: "pending",
      label: "Хянагдаж буй болгох",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
    },
  ];
  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: 4,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    width: 140,
    flexShrink: 0,
  };
  const valStyle: React.CSSProperties = {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 500,
  };

  const STATUS_CFG2: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    pending: {
      label: "Хүлээгдэж буй",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
    active: {
      label: "Идэвхтэй",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
    },
    inactive: {
      label: "Идэвхгүй",
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.1)",
    },
    returned: {
      label: "Буцаагдсан",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
    },
  };
  const sc = STATUS_CFG2[person.status] ?? STATUS_CFG2.pending;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        padding: "20px 16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          background: "#0f1629",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "modalIn .25s ease",
          marginTop: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {person.profile_photo_url ? (
            <img
              src={person.profile_photo_url}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                objectFit: "cover",
                flexShrink: 0,
                border: "2px solid rgba(59,130,246,0.3)",
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {ini}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {nm}
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
              }}
            >
              {person.supplier_number || person.register_number || person.email}
            </div>
            <div
              style={{
                marginTop: 5,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 9px",
                borderRadius: 99,
                background: sc.bg,
                fontSize: 10,
                fontWeight: 700,
                color: sc.color,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: sc.color,
                }}
              />
              {sc.label}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 8,
              padding: 7,
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Basic info */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
                marginBottom: 10,
              }}
            >
              Үндсэн мэдээлэл
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.025)",
                borderRadius: 12,
                padding: "4px 14px",
              }}
            >
              {[
                ["Бүтэн нэр", nm],
                ["Регистр", person.register_number],
                ["И-мэйл", person.email],
                ["Утас", person.phone],
                [
                  "Хүйс",
                  person.gender === "male"
                    ? "Эрэгтэй"
                    : person.gender === "female"
                      ? "Эмэгтэй"
                      : null,
                ],
                ["Төрсөн огноо", person.birth_date],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string} style={rowStyle}>
                    <span style={labelStyle}>{k}</span>
                    <span style={valStyle}>{v as string}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Address */}
          {(person.aimag_niislel || person.sum_duureg) && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 10,
                }}
              >
                Хаяг
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderRadius: 12,
                  padding: "4px 14px",
                }}
              >
                {[
                  ["Аймаг/Нийслэл", person.aimag_niislel],
                  ["Сум/Дүүрэг", person.sum_duureg],
                  ["Баг/Хороо", person.bag_horoo],
                  ["Тоот", person.toot],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k as string} style={rowStyle}>
                      <span style={labelStyle}>{k}</span>
                      <span style={valStyle}>{v as string}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Activity */}
          {person.supply_direction && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 10,
                }}
              >
                Үйл ажиллагаа
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderRadius: 12,
                  padding: "4px 14px",
                }}
              >
                {[
                  [
                    "Нийлүүлэх",
                    person.supply_direction === "goods"
                      ? "Бараа"
                      : person.supply_direction === "service"
                        ? "Үйлчилгээ"
                        : "Хоёулаа",
                  ],
                  ["Эхэлсэн огноо", person.activity_start_date],
                  ["НӨАТ", person.is_vat_payer ? "Тийм" : "Үгүй"],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k as string} style={rowStyle}>
                      <span style={labelStyle}>{k}</span>
                      <span style={valStyle}>{v as string}</span>
                    </div>
                  ))}
                {person.activity_directions?.length ? (
                  <div style={rowStyle}>
                    <span style={labelStyle}>Чиглэл</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {person.activity_directions.map((d) => (
                        <span
                          key={d}
                          style={{
                            fontSize: 10,
                            padding: "1px 7px",
                            borderRadius: 99,
                            background: "rgba(59,130,246,0.12)",
                            color: "#60a5fa",
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Documents */}
          {(person.id_card_front_url ||
            person.id_card_back_url ||
            person.activity_intro_url) && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 10,
                }}
              >
                Баримт бичиг
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { url: person.id_card_front_url, label: "ИҮ урд тал" },
                  { url: person.id_card_back_url, label: "ИҮ ар тал" },
                  { url: person.activity_intro_url, label: "Танилцуулга" },
                ]
                  .filter((d) => d.url)
                  .map((d) => (
                    <a
                      key={d.label}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 12px",
                        borderRadius: 9,
                        background: "rgba(59,130,246,0.08)",
                        border: "1px solid rgba(59,130,246,0.18)",
                        color: "#60a5fa",
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={13} />
                      {d.label}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Return reason input (shown when clicking Буцаах) */}
          {person.status !== "returned" && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  marginBottom: 8,
                }}
              >
                Буцаах шалтгаан (заавал биш)
              </div>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={2}
                placeholder="Жишээ: Мэдээлэл дутуу байна..."
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
                marginBottom: 10,
              }}
            >
              Үйлдэл
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STATUS_ACTIONS.filter((a) => a.status !== person.status).map(
                (a) => (
                  <button
                    key={a.status}
                    onClick={() => {
                      // ✅ Буцаах бол шалтгаан заавал
                      if (a.status === "returned" && !returnReason.trim()) {
                        setReturnError("Буцаах шалтгаан бичнэ үү");
                        return;
                      }
                      setReturnError("");
                      onUpdateStatus(person.id, a.status);
                    }}
                    disabled={loading}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      background: a.bg,
                      border: `1px solid ${a.border}`,
                      color: a.color,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading && (
                      <Loader2
                        size={13}
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    )}
                    {a.label}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Return reason display */}
          {person.return_reason && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(245,158,11,0.7)",
                  marginBottom: 4,
                }}
              >
                БУЦААСАН ШАЛТГААН
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {person.return_reason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Admin | null>(null);
  const [nav, setNav] = useState<NavId>("dashboard");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(2);

  // Admins state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  // Individuals state
  const [persons, setPersons] = useState<Person[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [personsError, setPersonsError] = useState("");
  const [personSearch, setPersonSearch] = useState("");
  const [personStatus, setPersonStatus] = useState("");

  // Companies state
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Dashboard recent
  const [recentPersons, setRecentPersons] = useState<Person[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Detail modal
  const [detailPerson, setDetailPerson] = useState<Person | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    const token =
      localStorage.getItem("super_admin_token") ||
      localStorage.getItem("token");
    const data =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user");
    if (!token || !data) {
      router.replace("/login");
      return;
    }
    try {
      setMe(JSON.parse(data));
    } catch {}
  }, [router]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch admins ─────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError("");
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/super-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(data.admins ?? []);
    } catch (err: any) {
      setAdminsError(err.message || "Мэдээлэл татахад алдаа гарлаа");
      // mock fallback
      setAdmins([
        {
          id: "1",
          company_name: "ProcureX",
          first_name: "Болормаа",
          last_name: "Дорж",
          phone: "99001122",
          email: "bolor@procurex.mn",
          role: "admin",
          status: "active",
        },
        {
          id: "2",
          company_name: "ProcureX",
          first_name: "Ганбаатар",
          last_name: "Нямаа",
          phone: "88223344",
          email: "ganaa@procurex.mn",
          role: "viewer",
          status: "active",
        },
        {
          id: "3",
          company_name: "Бодь Групп",
          first_name: "Оюунцэцэг",
          last_name: "Лувсан",
          phone: "77334455",
          email: "oyun@procurex.mn",
          role: "admin",
          status: "inactive",
        },
      ]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nav === "admins") fetchAdmins();
  }, [nav, fetchAdmins]);

  // ── Fetch persons ─────────────────────────────────────────────────
  const fetchPersons = useCallback(async () => {
    setPersonsLoading(true);
    setPersonsError("");
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const params = new URLSearchParams();
      if (personStatus) params.set("status", personStatus);
      params.set("limit", "50");
      const res = await fetch(`${API}/api/persons?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPersons(data.persons ?? []);
    } catch (err: any) {
      setPersonsError(err.message || "Мэдээлэл татахад алдаа гарлаа");
    } finally {
      setPersonsLoading(false);
    }
  }, [personStatus]);

  useEffect(() => {
    if (nav === "individuals") fetchPersons();
  }, [nav, fetchPersons]);

  // ── Fetch companies ───────────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/organizations?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCompanies(data.organizations ?? []);
    } catch {
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nav === "companies") fetchCompanies();
  }, [nav, fetchCompanies]);
  // categories fetch нь CategoriesTab дотор хийгдэнэ

  // ── Fetch recent (dashboard) ──────────────────────────────────────
  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/persons?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecentPersons(data.persons ?? []);
    } catch {
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nav === "dashboard") fetchRecent();
  }, [nav, fetchRecent]);

  // ── Open detail (fetch full person) ──────────────────────────────
  const openDetail = async (id: string) => {
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/persons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDetailPerson(data.person);
        setReturnReason("");
      }
    } catch {}
  };

  // ── Update person status ──────────────────────────────────────
  const updatePersonStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");

      // ✅ PUT → PATCH болгох
      const res = await fetch(`${API}/api/persons/${id}/status`, {
        method: "PATCH", // ← ЭНД
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, return_reason: returnReason || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDetailPerson((p) =>
        p ? { ...p, status, return_reason: returnReason || undefined } : null,
      );
      setPersons((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
      setRecentPersons((p) =>
        p.map((x) => (x.id === id ? { ...x, status } : x)),
      );
      showToast("Статус амжилттай шинэчлэгдлээ");
    } catch (err: any) {
      showToast(err.message || "Алдаа гарлаа", false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/super-admins/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins((p) => p.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Амжилттай устгагдлаа");
    } catch (err: any) {
      showToast(err.message, "err" as any);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Toggle status ────────────────────────────────────────────────
  const toggleStatus = async (admin: Admin) => {
    setStatusLoading(admin.id);
    const newStatus = admin.status === "active" ? "inactive" : "active";
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins((p) =>
        p.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a)),
      );
      showToast(`Статус → ${newStatus === "active" ? "Идэвхтэй" : "Идэвхгүй"}`);
    } catch (err: any) {
      showToast(err.message, false);
    } finally {
      setStatusLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("super_admin_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const NAV_ITEMS = [
    { id: "dashboard" as NavId, icon: BarChart3, label: "Хянах самбар" },
    {
      id: "notifications" as NavId,
      icon: Bell,
      label: "Мэдэгдэл",
      badge: unread,
    },
    { id: "admins" as NavId, icon: ShieldCheck, label: "Админууд" },
    { id: "companies" as NavId, icon: Building2, label: "Компаниуд" },
    { id: "individuals" as NavId, icon: Users, label: "Хувь хүн" },
    { id: "categories" as NavId, icon: ChevronDown, label: "Ангилалууд" },
    { id: "directions" as NavId, icon: Activity, label: "Чиглэлүүд" },
    {
      id: "directions" as NavId,
      icon: Activity,
      label: "Үйл ажиллагааны чиглэл",
    },
  ];

  if (!me) return null;
  const ini = (me.email?.[0] ?? "A").toUpperCase();
  const nm =
    [me.first_name, me.last_name].filter(Boolean).join(" ") || me.email;

  const filteredAdmins = admins.filter((a) =>
    `${a.last_name} ${a.first_name} ${a.email} ${a.company_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;font-family:'Plus Jakarta Sans',sans-serif;}
        body{margin:0;background:#080c18;}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
        .ni{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;margin:1px 8px;cursor:pointer;border:none;font-size:13px;font-weight:500;color:rgba(255,255,255,0.38);background:transparent;transition:all .18s;text-align:left;width:calc(100% - 16px);}
        .ni:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.72);}
        .ni.on{background:rgba(59,130,246,0.14);color:#60a5fa;border-left:2px solid #3b82f6;font-weight:600;}
        .card{background:#0f1629;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;}
        .sc{background:#0f1629;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;position:relative;overflow:hidden;transition:all .2s;}
        .sc:hover{border-color:rgba(59,130,246,0.2);transform:translateY(-2px);}
        .tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s;}
        .tr:hover{background:rgba(255,255,255,0.025);}
        .tr:last-child{border:none;}
        .gi{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px 14px 8px 36px;font-size:13px;color:rgba(255,255,255,0.72);outline:none;transition:all .2s;font-family:inherit;}
        .gi::placeholder{color:rgba(255,255,255,0.18);}
        .gi:focus{border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.05);}
        .page-in{animation:pi .3s ease both;}
        @keyframes pi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .badge{min-width:17px;height:17px;border-radius:99px;background:#ef4444;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}
        .sec-lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,0.18);padding:10px 14px 4px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .toast-enter{animation:toastIn .3s ease}
        @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .icon-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:7px;padding:6px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .icon-btn:hover{background:rgba(255,255,255,0.08);}
        select option{background:#1a2035;color:rgba(255,255,255,0.82);}
        @media(max-width:1024px){.sidebar{transform:translateX(-100%)!important}.sidebar.open{transform:translateX(0)!important}.main{margin-left:0!important}}
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          className="toast-enter"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 200,
            padding: "10px 16px",
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            background: toast.ok
              ? "rgba(16,185,129,0.95)"
              : "rgba(239,68,68,0.95)",
            color: "white",
          }}
        >
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {(modalMode === "create" || modalMode === "edit") && (
        <AdminModal
          mode={modalMode}
          admin={editTarget}
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
          onSave={() => {
            setModalMode(null);
            setEditTarget(null);
            fetchAdmins();
            showToast(
              modalMode === "create"
                ? "Амжилттай үүслээ"
                : "Амжилттай хадгаллаа",
            );
          }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          admin={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
      {detailPerson && (
        <DetailModal
          person={detailPerson}
          onClose={() => {
            setDetailPerson(null);
            setReturnReason("");
          }}
          onUpdateStatus={updatePersonStatus}
          loading={actionLoading}
          returnReason={returnReason}
          setReturnReason={setReturnReason}
        />
      )}

      <div
        style={{ display: "flex", minHeight: "100vh", background: "#080c18" }}
      >
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              zIndex: 40,
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* ══ SIDEBAR ══ */}
        <aside
          className={`sidebar ${open ? "open" : ""}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 240,
            background: "#0b1022",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
            transition: "transform .3s",
          }}
        >
          <div
            style={{
              padding: "20px 18px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <a href="/">
              <img
                src="/images/Bodi-Group-logo-PNG-ENG-blue.png"
                alt="Logo"
                style={{ height: 26, objectFit: "contain" }}
              />
            </a>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {ini}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nm}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.28)",
                    marginTop: 1,
                  }}
                >
                  {me.role === "super_admin" ? "Супер Админ" : "Админ"}
                </div>
              </div>
            </div>
          </div>
          <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            <div className="sec-lbl">Үндсэн</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`ni ${nav === item.id ? "on" : ""}`}
                onClick={() => {
                  setNav(item.id);
                  setOpen(false);
                  if (item.id === "notifications") setUnread(0);
                }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="badge">{item.badge}</span>
                )}
              </button>
            ))}
            <div className="sec-lbl" style={{ marginTop: 8 }}>
              Тохиргоо
            </div>
            <button className="ni">
              <Settings size={15} /> Тохиргоо
            </button>
          </nav>
          <div
            style={{
              padding: "10px 8px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              className="ni"
              onClick={logout}
              style={{ color: "rgba(239,68,68,0.55)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#ef4444";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(239,68,68,0.55)";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <LogOut size={15} /> Системээс гарах
            </button>
          </div>
        </aside>

        {/* ══ MAIN ══ */}
        <div
          className="main"
          style={{
            flex: 1,
            marginLeft: 240,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {/* Topbar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 30,
              height: 56,
              background: "rgba(8,12,24,0.9)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {NAV_ITEMS.find((n) => n.id === nav)?.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.22)",
                    marginTop: 1,
                  }}
                >
                  ProcureX удирдлагын систем
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => {
                  setNav("notifications");
                  setUnread(0);
                }}
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: 8,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <Bell size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
                {unread > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "1.5px solid #080c18",
                    }}
                  />
                )}
              </button>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {ini}
              </div>
            </div>
          </div>

          <main style={{ flex: 1, padding: "22px 26px", overflowY: "auto" }}>
            {/* ── DASHBOARD ─────────────────────────────────────── */}
            {nav === "dashboard" && (
              <div
                className="page-in"
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 12,
                  }}
                >
                  {[
                    {
                      label: "Нийт бүртгэл",
                      value: "1,284",
                      delta: "+12%",
                      icon: Users,
                      color: "#3b82f6",
                      bg: "rgba(59,130,246,0.12)",
                    },
                    {
                      label: "Компаниуд",
                      value: "348",
                      delta: "+8%",
                      icon: Building2,
                      color: "#8b5cf6",
                      bg: "rgba(139,92,246,0.12)",
                    },
                    {
                      label: "Хүлээгдэж буй",
                      value: "24",
                      delta: "+3",
                      icon: Clock,
                      color: "#f59e0b",
                      bg: "rgba(245,158,11,0.12)",
                    },
                    {
                      label: "Энэ сарын өсөлт",
                      value: "98",
                      delta: "+18%",
                      icon: TrendingUp,
                      color: "#10b981",
                      bg: "rgba(16,185,129,0.12)",
                    },
                  ].map(({ label, value, delta, icon: Icon, color, bg }, i) => (
                    <div key={i} className="sc">
                      <div
                        style={{
                          position: "absolute",
                          right: -16,
                          top: -16,
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          background: color,
                          opacity: 0.06,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={17} style={{ color }} />
                        </div>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#10b981",
                            background: "rgba(16,185,129,0.1)",
                            padding: "2px 7px",
                            borderRadius: 99,
                          }}
                        >
                          <ChevronUp size={10} />
                          {delta}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.88)",
                          lineHeight: 1.1,
                        }}
                      >
                        {value}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.32)",
                          marginTop: 3,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 300px",
                    gap: 14,
                  }}
                >
                  <div className="card" style={{ padding: "18px 18px 10px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.82)",
                          }}
                        >
                          Бүртгэлийн динамик
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.28)",
                            marginTop: 1,
                          }}
                        >
                          2026 оны сараар
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        {[
                          { c: "#3b82f6", l: "Хувь хүн" },
                          { c: "#10b981", l: "Компани" },
                        ].map((l) => (
                          <div
                            key={l.l}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: l.c,
                              }}
                            />
                            {l.l}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ height: 148 }}>
                      <BarChart />
                    </div>
                  </div>
                  <div className="card" style={{ padding: 18 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.82)",
                      }}
                    >
                      Статус хуваарилалт
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.28)",
                        marginTop: 1,
                        marginBottom: 14,
                      }}
                    >
                      Одоогийн байдлаар
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <Donut />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        {[
                          { l: "Зөвшөөрсөн", v: 892, c: "#10b981" },
                          { l: "Хүлээгдэж", v: 248, c: "#f59e0b" },
                          { l: "Татгалзсан", v: 144, c: "#ef4444" },
                        ].map((d) => (
                          <div key={d.l}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 3,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.4)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <span
                                  style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: d.c,
                                  }}
                                />
                                {d.l}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.65)",
                                }}
                              >
                                {d.v}
                              </span>
                            </div>
                            <div
                              style={{
                                height: 3,
                                borderRadius: 99,
                                background: "rgba(255,255,255,0.06)",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  background: d.c,
                                  width: `${(d.v / 1284) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 280px",
                    gap: 14,
                  }}
                >
                  {/* Recent persons from DB */}
                  <div className="card">
                    <div
                      style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.82)",
                          }}
                        >
                          Сүүлийн бүртгэлүүд
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.28)",
                            marginTop: 1,
                          }}
                        >
                          Persons table-аас татсан
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <Search
                            size={12}
                            style={{
                              position: "absolute",
                              left: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "rgba(255,255,255,0.28)",
                            }}
                          />
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Хайх..."
                            className="gi"
                            style={{ width: 140 }}
                          />
                        </div>
                        <button
                          onClick={fetchRecent}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 8,
                            padding: "6px 7px",
                            cursor: "pointer",
                            display: "flex",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          <RefreshCw
                            size={12}
                            style={{
                              animation: recentLoading
                                ? "spin 1s linear infinite"
                                : undefined,
                            }}
                          />
                        </button>
                      </div>
                    </div>
                    {recentLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          padding: 32,
                          gap: 8,
                        }}
                      >
                        <Loader2
                          size={16}
                          style={{
                            color: "#3b82f6",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          Ачаалж байна...
                        </span>
                      </div>
                    ) : (
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            <Th h="Нэр" />
                            <Th h="Регистр" />
                            <Th h="Статус" />
                            <Th h="Огноо" />
                            <Th h="" />
                          </tr>
                        </thead>
                        <tbody>
                          {recentPersons
                            .filter((r) => {
                              const q = search.toLowerCase();
                              return (
                                !q ||
                                `${r.last_name ?? ""} ${r.first_name ?? ""} ${r.email}`
                                  .toLowerCase()
                                  .includes(q)
                              );
                            })
                            .map((p, i) => {
                              const nm =
                                [p.last_name, p.first_name]
                                  .filter(Boolean)
                                  .join(" ") || p.email;
                              return (
                                <tr
                                  key={p.id}
                                  className="tr"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => openDetail(p.id)}
                                >
                                  <td style={{ padding: "10px 16px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 9,
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 7,
                                          background:
                                            i % 2 === 0
                                              ? "rgba(59,130,246,0.18)"
                                              : "rgba(139,92,246,0.18)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color:
                                            i % 2 === 0 ? "#60a5fa" : "#a78bfa",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {(
                                          p.first_name?.[0] ?? p.email[0]
                                        ).toUpperCase()}
                                      </div>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 600,
                                          color: "rgba(255,255,255,0.78)",
                                        }}
                                      >
                                        {nm}
                                      </span>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px 16px",
                                      fontSize: 11,
                                      fontFamily: "monospace",
                                      color: "rgba(255,255,255,0.35)",
                                    }}
                                  >
                                    {p.register_number || "—"}
                                  </td>
                                  <td style={{ padding: "10px 16px" }}>
                                    <Badge status={p.status} />
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px 16px",
                                      fontSize: 11,
                                      color: "rgba(255,255,255,0.28)",
                                    }}
                                  >
                                    {p.created_at
                                      ? new Date(
                                          p.created_at,
                                        ).toLocaleDateString("mn-MN")
                                      : "—"}
                                  </td>
                                  <td style={{ padding: "10px 16px" }}>
                                    <button
                                      className="icon-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDetail(p.id);
                                      }}
                                    >
                                      <Eye
                                        size={12}
                                        style={{
                                          color: "rgba(59,130,246,0.7)",
                                        }}
                                      />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          {recentPersons.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                style={{
                                  padding: "28px 16px",
                                  textAlign: "center",
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.2)",
                                }}
                              >
                                Бүртгэл байхгүй байна
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        l: "Нийт хувь хүн",
                        v: String(
                          persons.length || recentPersons.length || "—",
                        ),
                        icon: Users,
                        c: "#3b82f6",
                      },
                      {
                        l: "Хүлээгдэж буй",
                        v: String(
                          recentPersons.filter((x) => x.status === "pending")
                            .length,
                        ),
                        icon: Clock,
                        c: "#f59e0b",
                      },
                      {
                        l: "Идэвхтэй",
                        v: String(
                          recentPersons.filter((x) => x.status === "active")
                            .length,
                        ),
                        icon: UserCheck,
                        c: "#10b981",
                      },
                      {
                        l: "Буцаагдсан",
                        v: String(
                          recentPersons.filter((x) => x.status === "returned")
                            .length,
                        ),
                        icon: Activity,
                        c: "#ef4444",
                      },
                    ].map(({ l, v, icon: Icon, c }) => (
                      <div
                        key={l}
                        className="card"
                        style={{
                          padding: "13px 15px",
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: `${c}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={15} style={{ color: c }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "rgba(255,255,255,0.85)",
                              lineHeight: 1.1,
                            }}
                          >
                            {v}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.28)",
                              marginTop: 2,
                            }}
                          >
                            {l}
                          </div>
                        </div>
                        <ArrowUpRight
                          size={13}
                          style={{ color: "rgba(255,255,255,0.14)" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ─────────────────────────────────── */}
            {nav === "notifications" && (
              <div
                className="page-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxWidth: 580,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}
                  >
                    Нийт {NOTIFS.length} мэдэгдэл
                  </span>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "rgba(59,130,246,0.65)",
                      fontFamily: "inherit",
                    }}
                  >
                    Бүгдийг уншсан болгох
                  </button>
                </div>
                {NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    className="card"
                    style={{
                      padding: "13px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      opacity: n.unread ? 1 : 0.55,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: n.unread
                          ? "rgba(59,130,246,0.14)"
                          : "rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Bell
                        size={14}
                        style={{
                          color: n.unread
                            ? "#60a5fa"
                            : "rgba(255,255,255,0.28)",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: n.unread ? 600 : 400,
                          color: n.unread
                            ? "rgba(255,255,255,0.82)"
                            : "rgba(255,255,255,0.42)",
                        }}
                      >
                        {n.text}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.22)",
                          marginTop: 2,
                        }}
                      >
                        {n.time} өмнө
                      </div>
                    </div>
                    {n.unread && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── ADMINS (FULL CRUD) ─────────────────────────────── */}
            {nav === "admins" && (
              <div
                className="page-in"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={13}
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.28)",
                      }}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Хайх..."
                      className="gi"
                      style={{ width: 220 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={fetchAdmins}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 9,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontFamily: "inherit",
                      }}
                    >
                      <RefreshCw
                        size={13}
                        style={{
                          animation: adminsLoading
                            ? "spin 1s linear infinite"
                            : undefined,
                        }}
                      />{" "}
                      Дахин ачаалах
                    </button>
                    <button
                      onClick={() => {
                        setEditTarget(null);
                        setModalMode("create");
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 9,
                        background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                        border: "none",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Plus size={15} /> Шинэ Админ
                    </button>
                  </div>
                </div>

                {/* Count */}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {adminsLoading
                    ? "Ачаалж байна..."
                    : `${filteredAdmins.length} / ${admins.length} админ`}
                </div>

                {/* Error */}
                {adminsError && !adminsLoading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.18)",
                    }}
                  >
                    <AlertCircle
                      size={14}
                      style={{ color: "#f59e0b", flexShrink: 0 }}
                    />
                    <span
                      style={{ fontSize: 12, color: "rgba(245,158,11,0.8)" }}
                    >
                      API холболт байхгүй — mock өгөгдөл харуулж байна
                    </span>
                  </div>
                )}

                {/* Table */}
                <div className="card">
                  {adminsLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 48,
                        gap: 10,
                      }}
                    >
                      <Loader2
                        size={18}
                        style={{
                          color: "#3b82f6",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <span
                        style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
                      >
                        Ачаалж байна...
                      </span>
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          <Th h="Нэр" />
                          <Th h="Компани" />
                          <Th h="И-мэйл" />
                          <Th h="Утас" />
                          <Th h="Эрх" />
                          <Th h="Статус" />
                          <Th h="Үйлдэл" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                padding: "40px 16px",
                                textAlign: "center",
                                fontSize: 13,
                                color: "rgba(255,255,255,0.25)",
                              }}
                            >
                              Хайлтын үр дүн олдсонгүй
                            </td>
                          </tr>
                        ) : (
                          filteredAdmins.map((a, i) => (
                            <tr key={a.id} className="tr">
                              <td style={{ padding: "12px 16px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 9,
                                      background:
                                        i % 2 === 0
                                          ? "rgba(59,130,246,0.18)"
                                          : "rgba(139,92,246,0.18)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color:
                                        i % 2 === 0 ? "#60a5fa" : "#a78bfa",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {a.first_name?.[0] ??
                                      a.email[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "rgba(255,255,255,0.82)",
                                      }}
                                    >
                                      {a.last_name} {a.first_name}
                                    </div>
                                    {a.created_at && (
                                      <div
                                        style={{
                                          fontSize: 10,
                                          color: "rgba(255,255,255,0.25)",
                                          marginTop: 1,
                                        }}
                                      >
                                        {new Date(
                                          a.created_at,
                                        ).toLocaleDateString("mn-MN")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.45)",
                                }}
                              >
                                {a.company_name || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.45)",
                                }}
                              >
                                {a.email}
                              </td>
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.4)",
                                  fontFamily: "monospace",
                                }}
                              >
                                {a.phone || "—"}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: 99,
                                    background:
                                      a.role === "super_admin"
                                        ? "rgba(239,68,68,0.12)"
                                        : a.role === "admin"
                                          ? "rgba(59,130,246,0.12)"
                                          : "rgba(139,92,246,0.12)",
                                    color:
                                      a.role === "super_admin"
                                        ? "#f87171"
                                        : a.role === "admin"
                                          ? "#60a5fa"
                                          : "#a78bfa",
                                  }}
                                >
                                  {a.role}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <button
                                  onClick={() => toggleStatus(a)}
                                  disabled={statusLoading === a.id}
                                  title="Статус солих"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {statusLoading === a.id ? (
                                    <Loader2
                                      size={14}
                                      style={{
                                        color: "rgba(255,255,255,0.4)",
                                        animation: "spin 0.8s linear infinite",
                                      }}
                                    />
                                  ) : (
                                    <Badge status={a.status} />
                                  )}
                                </button>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                  {/* Edit */}
                                  <button
                                    className="icon-btn"
                                    title="Засах"
                                    onClick={() => {
                                      setEditTarget(a);
                                      setModalMode("edit");
                                    }}
                                  >
                                    <Pencil
                                      size={13}
                                      style={{ color: "rgba(59,130,246,0.7)" }}
                                    />
                                  </button>
                                  {/* Delete */}
                                  <button
                                    className="icon-btn"
                                    title="Устгах"
                                    onClick={() => setDeleteTarget(a)}
                                  >
                                    <Trash2
                                      size={13}
                                      style={{ color: "rgba(239,68,68,0.6)" }}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── COMPANIES ─────────────────────────────────────── */}
            {nav === "companies" && (
              <CompaniesTab
                data={{
                  companies,
                  setCompanies,
                  companiesLoading,
                  fetchCompanies,
                  showToast,
                }}
              />
            )}

            {/* ── CATEGORIES ───────────────────────────────────── */}
            {nav === "categories" && (
              <CategoriesTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}

            {/* ── DIRECTIONS ────────────────────────────────────── */}
            {nav === "directions" && (
              <DirectionsTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}

            {/* ── INDIVIDUALS ───────────────────────────────────── */}
            {nav === "individuals" && (
              <IndividualsTab
                data={{
                  persons,
                  setPersons,
                  personsLoading,
                  personsError,
                  fetchPersons,
                  showToast,
                }}
                search={personSearch}
                setSearch={setPersonSearch}
                status={personStatus}
                setStatus={setPersonStatus}
                onDetail={openDetail}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
