"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CompaniesTab } from "./_components/CompaniesTab";
import { NotificationsTab } from "./_components/NotificationsTab";
import { CategoriesTab } from "./_components/Categoriestab";
import { AnnouncementsTab } from "./_components/Announcementstab";
import { DirectionsTab } from "./_components/Directionstab";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Bell,
  Search,
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
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import { IndividualsTab } from "./_components/individuals/IndividualsTab";
import { SpecialPermissionsTab } from "./_components/SpecialPermissionsTab";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type NavId =
  | "dashboard"
  | "notifications"
  | "admins"
  | "companies"
  | "individuals"
  | "categories"
  | "directions"
  | "special_permissions"
  | "announcements";
type ModalMode = "create" | "edit" | null;

type Admin = {
  id: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  role: string;
  status: string;
  permissions?: string[];
  parent_id?: string;
  parent_name?: string;
  created_at?: string;
  updated_at?: string;
};
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
  return_reason?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const tok = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";
const authH = () => ({ Authorization: `Bearer ${tok()}` });
const jsonH = () => ({ "Content-Type": "application/json", ...authH() });

// ─────────────────────────────────────────────────────────────
// Permission config — nav цэс бүрийн дэд эрхүүд
// ─────────────────────────────────────────────────────────────
type SubPerm = { id: string; label: string; desc: string };
type NavPerm = {
  id: NavId;
  label: string;
  icon: string;
  superAdminOnly?: boolean;
  subs: SubPerm[];
};

const NAV_PERMS: NavPerm[] = [
  {
    id: "dashboard",
    label: "Хянах самбар",
    icon: "📊",
    subs: [
      {
        id: "dashboard.view",
        label: "Харах",
        desc: "Статистик, графикуудыг харах",
      },
    ],
  },
  {
    id: "notifications",
    label: "Мэдэгдэл",
    icon: "🔔",
    subs: [
      {
        id: "notifications.view",
        label: "Харах",
        desc: "Мэдэгдлийн жагсаалт харах",
      },
      { id: "notifications.send", label: "Илгээх", desc: "Мэдэгдэл илгээх" },
    ],
  },
  {
    id: "companies",
    label: "Компаниуд",
    icon: "🏢",
    subs: [
      {
        id: "companies.view",
        label: "Харах",
        desc: "Компанийн жагсаалт харах",
      },
      {
        id: "companies.edit_status",
        label: "Статус солих",
        desc: "Компанийн статусыг өөрчлөх",
      },
      {
        id: "companies.edit",
        label: "Засах",
        desc: "Компанийн мэдээлэл засах",
      },
      { id: "companies.delete", label: "Устгах", desc: "Компани устгах" },
    ],
  },
  {
    id: "individuals",
    label: "Хувь хүн",
    icon: "👤",
    subs: [
      {
        id: "individuals.view",
        label: "Харах",
        desc: "Хувь хүний жагсаалт харах",
      },
      {
        id: "individuals.edit_status",
        label: "Статус солих",
        desc: "Хувь хүний статусыг өөрчлөх",
      },
      {
        id: "individuals.edit",
        label: "Засах",
        desc: "Хувь хүний мэдээлэл засах",
      },
      { id: "individuals.delete", label: "Устгах", desc: "Хувь хүн устгах" },
    ],
  },
  {
    id: "categories",
    label: "Ангилалууд",
    icon: "📁",
    subs: [
      {
        id: "categories.view",
        label: "Харах",
        desc: "Категорийн жагсаалт харах",
      },
      {
        id: "categories.manage",
        label: "Засварлах",
        desc: "Нэмэх, засах, устгах (super admin)",
      },
    ],
  },
  {
    id: "directions",
    label: "Үйл ажиллагааны чиглэл",
    icon: "🎯",
    subs: [
      {
        id: "directions.view",
        label: "Харах",
        desc: "Чиглэлийн жагсаалт харах",
      },
      {
        id: "directions.manage",
        label: "Засварлах",
        desc: "Нэмэх, засах, устгах (super admin)",
      },
    ],
  },
  {
    id: "announcements",
    label: "Зарлалууд",
    icon: "📢",
    subs: [
      {
        id: "announcements.view",
        label: "Харах",
        desc: "Зарлалын жагсаалт харах",
      },
      {
        id: "announcements.create",
        label: "Үүсгэх",
        desc: "Шинэ зарлал үүсгэх",
      },
      { id: "announcements.edit", label: "Засах", desc: "Зарлал засах" },
      {
        id: "announcements.publish",
        label: "Нийтлэх",
        desc: "Зарлалын статус өөрчлөх",
      },
      { id: "announcements.delete", label: "Устгах", desc: "Зарлал устгах" },
    ],
  },
  {
    id: "admins",
    label: "Админууд",
    icon: "🛡️",
    superAdminOnly: true,
    subs: [
      { id: "admins.view", label: "Харах", desc: "Adminы жагсаалт харах" },
      { id: "admins.manage", label: "Удирдах", desc: "Нэмэх, засах, устгах" },
    ],
  },
];

// Нэг nav-н бүх subs-ын default "view" sub
const navDefaultPerms = (id: NavId) =>
  NAV_PERMS.find((n) => n.id === id)
    ?.subs.slice(0, 1)
    .map((s) => s.id) ?? [];

// Super admin-н бүх эрх
const ALL_PERMS = NAV_PERMS.flatMap((n) => n.subs.map((s) => s.id));

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
// Хуучин ["companies"] → шинэ ["companies.view","companies.edit_status",...] болгох mapping
const OLD_FORMAT_MAP: Record<string, string[]> = {
  dashboard: ["dashboard.view"],
  notifications: ["notifications.view", "notifications.send"],
  companies: [
    "companies.view",
    "companies.edit_status",
    "companies.edit",
    "companies.delete",
  ],
  individuals: [
    "individuals.view",
    "individuals.edit_status",
    "individuals.edit",
    "individuals.delete",
  ],
  categories: ["categories.view", "categories.manage"],
  directions: ["directions.view", "directions.manage"],
  announcements: [
    "announcements.view",
    "announcements.create",
    "announcements.edit",
    "announcements.publish",
    "announcements.delete",
  ],
  admins: ["admins.view", "admins.manage"],
};

function parsePerms(raw: any): string[] {
  if (!raw) return ["dashboard", "dashboard.view"];
  let arr: string[] = [];
  if (Array.isArray(raw)) arr = raw;
  else {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = ["dashboard", "dashboard.view"];
    }
  }
  if (arr.length === 0) return ["dashboard.view"];

  // Хуучин nav-ID формат → шинэ sub-perm формат болгоно
  const isOldFormat = arr.every((p: string) => !p.includes("."));
  if (isOldFormat) {
    return [...new Set(arr.flatMap((id: string) => OLD_FORMAT_MAP[id] ?? []))];
  }
  // Шинэ формат: bare nav ID-г хасна ("dashboard" → зөвхөн "dashboard.view")
  return arr.filter((p: string) => p.includes("."));
}

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
          c2 = (d.c / mx) * cH,
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
              y={PT + cH - c2}
              width={bw}
              height={c2}
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
      r2 = ((a + deg) * Math.PI) / 180;
    const x1 = cx + R * Math.cos(r1),
      y1 = cy + R * Math.sin(r1),
      x2 = cx + R * Math.cos(r2),
      y2 = cy + R * Math.sin(r2);
    const path = `M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}Z`;
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

// ─────────────────────────────────────────────────────────────
// Admin Modal with Permissions
// ─────────────────────────────────────────────────────────────
function PermRow({
  nav,
  perms,
  onToggleNav,
  onToggleSub,
  expanded,
  onExpand,
}: {
  nav: NavPerm;
  perms: string[];
  expanded: boolean;
  onToggleNav: (nav: NavPerm) => void;
  onToggleSub: (subId: string) => void;
  onExpand: () => void;
}) {
  const visible = perms.includes(`${nav.id}.view`);
  const locked = nav.id === "dashboard";
  const subCount = nav.subs.filter((s) => perms.includes(s.id)).length;

  return (
    <div
      style={{
        borderRadius: 11,
        overflow: "hidden",
        border: visible
          ? "1px solid rgba(59,130,246,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
        background: visible
          ? "rgba(59,130,246,0.04)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Nav row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
        }}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => !locked && onToggleNav(nav)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            flexShrink: 0,
            cursor: locked ? "default" : "pointer",
            background: visible ? "#3b82f6" : "rgba(255,255,255,0.05)",
            border: visible
              ? "1px solid #3b82f6"
              : "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {visible && <CheckCircle2 size={13} color="white" />}
        </button>

        <span style={{ fontSize: 16, flexShrink: 0 }}>{nav.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: visible
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {nav.label}
            {locked && (
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 99,
                  background: "rgba(148,163,184,0.1)",
                  color: "rgba(148,163,184,0.5)",
                }}
              >
                заавал
              </span>
            )}
          </div>
          {visible && nav.subs.length > 1 && (
            <div
              style={{
                fontSize: 10,
                color: "rgba(148,163,184,0.4)",
                marginTop: 1,
              }}
            >
              {subCount} / {nav.subs.length} эрх
            </div>
          )}
        </div>

        {nav.subs.length > 1 && (
          <button
            type="button"
            onClick={onExpand}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 7,
              padding: "3px 9px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              color: "rgba(148,163,184,0.55)",
              fontFamily: "inherit",
            }}
          >
            {expanded ? "Хаах" : "Тохируулах"}
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </button>
        )}
      </div>

      {/* Sub perms */}
      {expanded && nav.subs.length > 1 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 14px 10px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "rgba(148,163,184,0.35)",
              marginBottom: 6,
            }}
          >
            Дэд эрхүүд
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}
          >
            {nav.subs.map((sub) => {
              const isViewSub = sub.id === `${nav.id}.view`;
              const checked = perms.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => !isViewSub && onToggleSub(sub.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    padding: "7px 9px",
                    borderRadius: 8,
                    cursor: isViewSub ? "default" : "pointer",
                    background: checked
                      ? "rgba(59,130,246,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: checked
                      ? "1px solid rgba(59,130,246,0.2)"
                      : "1px solid rgba(255,255,255,0.05)",
                    opacity: isViewSub ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 4,
                      flexShrink: 0,
                      marginTop: 1,
                      background: checked
                        ? "#3b82f6"
                        : "rgba(255,255,255,0.06)",
                      border: checked
                        ? "1px solid #3b82f6"
                        : "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {checked && <CheckCircle2 size={9} color="white" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: checked
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {sub.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(148,163,184,0.35)",
                        marginTop: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {sub.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [form, setForm] = React.useState({
    company_name: admin?.company_name ?? "",
    first_name: admin?.first_name ?? "",
    last_name: admin?.last_name ?? "",
    phone: admin?.phone ?? "",
    email: admin?.email ?? "",
    password: "",
    role: admin?.role ?? "admin",
    status: admin?.status ?? "active",
  });

  // perms — хадгалагдсан permissions-г parse хийж эхлэнэ
  const [perms, setPerms] = React.useState<string[]>(() =>
    admin?.permissions ? parsePerms(admin.permissions) : ["dashboard.view"],
  );

  const [showPw, setShowPw] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Edit mode-д admin өөрчлөгдвөл perms refresh
  React.useEffect(() => {
    setPerms(parsePerms(admin?.permissions));
    setForm({
      company_name: admin?.company_name ?? "",
      first_name: admin?.first_name ?? "",
      last_name: admin?.last_name ?? "",
      phone: admin?.phone ?? "",
      email: admin?.email ?? "",
      password: "",
      role: admin?.role ?? "admin",
      status: admin?.status ?? "active",
    });
  }, [admin?.id]);

  const isSA = form.role === "super_admin";

  // Нэг nav-ийн view sub toggle → nav бүхлээр on/off
  const toggleNav = (nav: NavPerm) => {
    const viewSub = `${nav.id}.view`;
    setPerms((prev) => {
      const has = prev.includes(viewSub);
      if (has) {
        // Бүх sub-г хасна
        const subIds = new Set(nav.subs.map((s) => s.id));
        return prev.filter((p) => !subIds.has(p));
      } else {
        // view sub нэмнэ (зөвхөн view, user өөрөө нэмэлт sub-г сонгоно)
        return [...prev, viewSub];
      }
    });
  };

  // Нэг sub-perm toggle
  const toggleSub = (subId: string) => {
    setPerms((prev) =>
      prev.includes(subId) ? prev.filter((p) => p !== subId) : [...prev, subId],
    );
  };

  const handleRoleChange = (role: string) => {
    setForm((f) => ({ ...f, role }));
    if (role === "super_admin") setPerms([...ALL_PERMS]);
    else
      setPerms((prev) =>
        prev.length === ALL_PERMS.length
          ? ["dashboard", "dashboard.view"]
          : prev,
      );
  };

  const selectAll = () =>
    setPerms((prev) =>
      prev.length >= ALL_PERMS.length
        ? ["dashboard", "dashboard.view"]
        : [...ALL_PERMS],
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalPerms = isSA ? ALL_PERMS : perms;
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
          headers: jsonH(),
          body: JSON.stringify({ ...form, permissions: finalPerms }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin!.id}`, {
          method: "PUT",
          headers: jsonH(),
          body: JSON.stringify({
            company_name: form.company_name,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            role: form.role,
            status: form.status,
            permissions: finalPerms,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      }
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
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
  };
  const lbl: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.3)",
    display: "block" as const,
    marginBottom: 5,
  };
  const fo = (e: any) =>
    ((e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)");
  const bl = (e: any) =>
    ((e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)");

  const visibleNavs = NAV_PERMS.filter((n) => !n.superAdminOnly || isSA);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        overflowY: "auto",
        padding: "20px 16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          marginBottom: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {mode === "create"
                ? "Шинэ Мини Админ үүсгэх"
                : "Мини Админ засах"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.45)",
                marginTop: 3,
              }}
            >
              Харах цэс болон үйлдлийн эрхийг тохируулна уу
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9,
              padding: 7,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
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
          {/* Нэр */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Овог *</label>
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                placeholder="Овог"
                required
                style={inp}
                onFocus={fo}
                onBlur={bl}
              />
            </div>
            <div>
              <label style={lbl}>Нэр *</label>
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                placeholder="Нэр"
                required
                style={inp}
                onFocus={fo}
                onBlur={bl}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Компанийн нэр</label>
            <input
              value={form.company_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, company_name: e.target.value }))
              }
              placeholder="Компани"
              style={inp}
              onFocus={fo}
              onBlur={bl}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>И-мэйл *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="mail@example.mn"
                required
                style={inp}
                onFocus={fo}
                onBlur={bl}
              />
            </div>
            <div>
              <label style={lbl}>Утас</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="99001122"
                style={inp}
                onFocus={fo}
                onBlur={bl}
              />
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label style={lbl}>Нууц үг *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                  style={{ ...inp, paddingRight: 40 }}
                  onFocus={fo}
                  onBlur={bl}
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
              <label style={lbl}>Эрх</label>
              <select
                value={form.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="admin">Мини Админ</option>
                <option value="super_admin">Супер Админ</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="active">Идэвхтэй</option>
                <option value="inactive">Идэвхгүй</option>
              </select>
            </div>
          </div>

          {/* ── Permissions ── */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Lock size={13} style={{ color: "#60a5fa" }} />
                  Цэсний эрх тохиргоо
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(148,163,184,0.4)",
                    marginTop: 2,
                  }}
                >
                  {isSA
                    ? "Супер админ бүх эрхтэй"
                    : `${visibleNavs.filter((n) => perms.includes(`${n.id}.view`)).length} / ${visibleNavs.length} цэс идэвхтэй`}
                </div>
              </div>
              {!isSA && (
                <button
                  type="button"
                  onClick={selectAll}
                  style={{
                    fontSize: 11,
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 8,
                    padding: "5px 12px",
                    color: "#60a5fa",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {perms.length >= ALL_PERMS.length
                    ? "Бүгдийг хасах"
                    : "Бүгдийг сонгох"}
                </button>
              )}
            </div>

            {isSA ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(59,130,246,0.06)",
                  border: "1px solid rgba(59,130,246,0.18)",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(96,165,250,0.85)" }}>
                  ✓ Супер Админ бүх цэс болон функцийг автоматаар авна
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {visibleNavs.map((nav) => (
                  <PermRow
                    key={nav.id}
                    nav={nav}
                    perms={perms}
                    expanded={!!expanded[nav.id]}
                    onToggleNav={toggleNav}
                    onToggleSub={toggleSub}
                    onExpand={() =>
                      setExpanded((e) => ({ ...e, [nav.id]: !e[nav.id] }))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
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
                height: 44,
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

// ─────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────
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
          background: "#0d1526",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
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

// ═══════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Admin | null>(null);
  const [myPerms, setMyPerms] = useState<string[]>([]);
  const [nav, setNav] = useState<NavId>("dashboard");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(0);

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [persons, setPersons] = useState<Person[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [personsError, setPersonsError] = useState("");
  const [personSearch, setPersonSearch] = useState("");
  const [personStatus, setPersonStatus] = useState("");

  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const [dirs, setDirs] = useState<{ id: number; label: string }[]>([]);

  const [recentPersons, setRecentPersons] = useState<Person[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    const data =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user");
    if (!tok() || !data) {
      router.replace("/login");
      return;
    }
    try {
      const parsed = JSON.parse(data);

      // Super admin биш бол mini-admin dashboard руу шилжүүлнэ
      if (parsed.role !== "super_admin") {
        router.replace("/dashboard/mini-admin");
        return;
      }

      setMe(parsed);
      const p =
        parsed.role === "super_admin"
          ? ALL_PERMS
          : parsePerms(parsed.permissions);
      setMyPerms(p);
    } catch {}

    // Mount-д notification unread count татна
    const t =
      localStorage.getItem("super_admin_token") ||
      localStorage.getItem("token") ||
      "";
    const adminData = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("super_admin_user") ||
            localStorage.getItem("user") ||
            "{}",
        );
      } catch {
        return {};
      }
    })();
    const aId = adminData?.id ?? "guest";
    const readSet = new Set(
      (() => {
        try {
          return JSON.parse(localStorage.getItem(`notif_read_${aId}`) || "[]");
        } catch {
          return [];
        }
      })(),
    );
    fetch(`${API}/api/notifications?limit=100&_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const count = (d.notifications ?? []).filter(
            (n: any) => !readSet.has(n.id),
          ).length;
          setUnread(count);
        }
      })
      .catch(() => {});
  }, [router]);

  const canNav = (id: NavId) => {
    if (!me) return false;
    if (me.role === "super_admin") return true;
    if (id === "special_permissions") return false; // ✅ super admin only
    return (
      myPerms.includes(`${id}.view`) ||
      (id === "dashboard" && myPerms.includes("dashboard.view"))
    );
  };
  const can = (perm: string) =>
    me?.role === "super_admin" || myPerms.includes(perm);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // NAV items filtered by permissions
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
    {
      id: "directions" as NavId,
      icon: Activity,
      label: "Үйл ажиллагааны чиглэл",
    },
    {
      id: "special_permissions" as NavId,
      icon: FileText,
      label: "Тусгай зөвшөөрөл",
    },
    { id: "announcements" as NavId, icon: FileText, label: "Зарлалууд" },
  ].filter((n) => canNav(n.id));

  // Ensure nav is valid after permissions load
  useEffect(() => {
    if (me && !canNav(nav)) {
      const first = NAV_ITEMS[0]?.id;
      if (first) setNav(first);
    }
  }, [me, myPerms]);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError("");
    try {
      const res = await fetch(`${API}/api/super-admins`, { headers: authH() });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAdmins(d.admins ?? []);
    } catch (e: any) {
      setAdminsError(e.message || "Алдаа");
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
          role: "admin",
          status: "active",
        },
      ]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const fetchPersons = useCallback(async () => {
    setPersonsLoading(true);
    setPersonsError("");
    try {
      const p = new URLSearchParams();
      if (personStatus) p.set("status", personStatus);
      p.set("limit", "50");
      const res = await fetch(`${API}/api/persons?${p}`, { headers: authH() });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setPersons(d.persons ?? []);
    } catch (e: any) {
      setPersonsError(e.message || "Алдаа");
    } finally {
      setPersonsLoading(false);
    }
  }, [personStatus]);

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const res = await fetch(`${API}/api/organizations?limit=50`, {
        headers: authH(),
      });
      const d = await res.json();
      if (d.success) setCompanies(d.organizations ?? []);
    } catch {
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const res = await fetch(`${API}/api/persons?limit=10`, {
        headers: authH(),
      });
      const d = await res.json();
      if (d.success) setRecentPersons(d.persons ?? []);
    } catch {
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (nav === "admins") fetchAdmins();
  }, [nav, fetchAdmins]);
  useEffect(() => {
    if (nav === "individuals") fetchPersons();
  }, [nav, fetchPersons]);
  useEffect(() => {
    if (nav === "companies") fetchCompanies();
  }, [nav, fetchCompanies]);
  useEffect(() => {
    if (nav === "dashboard") fetchRecent();
  }, [nav, fetchRecent]);

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDirs(d.directions);
      })
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API}/api/super-admins/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authH(),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAdmins((p) => p.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Амжилттай устгагдлаа");
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleStatus = async (admin: Admin) => {
    setStatusLoading(admin.id);
    const ns = admin.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
        method: "PUT",
        headers: jsonH(),
        body: JSON.stringify({ status: ns }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAdmins((p) =>
        p.map((a) => (a.id === admin.id ? { ...a, status: ns } : a)),
      );
      showToast(`Статус → ${ns === "active" ? "Идэвхтэй" : "Идэвхгүй"}`);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setStatusLoading(null);
    }
  };

  const logout = () => {
    ["super_admin_token", "super_admin_user", "token", "user"].forEach((k) =>
      localStorage.removeItem(k),
    );
    router.push("/login");
  };

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
        .icon-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:7px;padding:6px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .icon-btn:hover{background:rgba(255,255,255,0.08);}
        select option{background:#1a2035;color:rgba(255,255,255,0.82);}
      `}</style>

      {/* Toast */}
      {toast && (
        <div
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
              modalMode === "create" ? "Амжилттай үүслээ" : "Хадгаллаа",
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

      <div
        style={{ display: "flex", minHeight: "100vh", background: "#080c18" }}
      >
        {/* ── Sidebar ── */}
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
                  {me.role === "super_admin" ? "Супер Админ" : "Мини Админ"}
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
              <Settings size={15} />
              Тохиргоо
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
              <LogOut size={15} />
              Системээс гарах
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div
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
            {/* Dashboard */}
            {nav === "dashboard" && canNav("dashboard") && (
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
                        Persons table-аас
                      </div>
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
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}
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
                        </tr>
                      </thead>
                      <tbody>
                        {recentPersons.map((p, i) => {
                          const nm =
                            [p.last_name, p.first_name]
                              .filter(Boolean)
                              .join(" ") || p.email;
                          return (
                            <tr key={p.id} className="tr">
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
                                      flexShrink: 0,
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
                                  ? new Date(p.created_at).toLocaleDateString(
                                      "mn-MN",
                                    )
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                        {recentPersons.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                padding: "28px 16px",
                                textAlign: "center",
                                fontSize: 12,
                                color: "rgba(255,255,255,0.2)",
                              }}
                            >
                              Бүртгэл байхгүй
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {nav === "notifications" && canNav("notifications") && (
              <NotificationsTab
                showToast={showToast}
                onUnreadChange={(c) => setUnread(c)}
              />
            )}

            {nav === "companies" && canNav("companies") && (
              <CompaniesTab
                data={{
                  companies,
                  setCompanies,
                  companiesLoading,
                  fetchCompanies,
                  showToast,
                  canEdit: can("companies.edit"),
                  canEditStatus: can("companies.edit_status"),
                  canDelete: can("companies.delete"),
                }}
              />
            )}

            {nav === "categories" && canNav("categories") && (
              <CategoriesTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}

            {nav === "directions" && canNav("directions") && (
              <DirectionsTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}

            {nav === "announcements" && canNav("announcements") && (
              <AnnouncementsTab showToast={showToast} />
            )}

            {nav === "individuals" && canNav("individuals") && (
              <IndividualsTab
                data={{
                  persons,
                  setPersons,
                  personsLoading,
                  personsError,
                  fetchPersons,
                  showToast,
                  canEdit: can("individuals.edit"),
                  canEditStatus: can("individuals.edit_status"),
                  canDelete: can("individuals.delete"),
                }}
                search={personSearch}
                setSearch={setPersonSearch}
                status={personStatus}
                setStatus={setPersonStatus}
                onDetail={() => {}}
                dirs={dirs}
              />
            )}

            {nav === "admins" && canNav("admins") && (
              <div
                className="page-in"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
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
                    {can("admins.manage") && (
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
                    )}
                  </div>
                </div>

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
                          <Th h="Эрх" />
                          <Th h="Цэсний эрх" />
                          <Th h="Статус" />
                          <Th h="" />
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
                          filteredAdmins.map((a, i) => {
                            const aPerms = parsePerms(a.permissions);
                            const navCount =
                              a.role === "super_admin"
                                ? NAV_PERMS.length
                                : NAV_PERMS.filter(
                                    (n) =>
                                      aPerms.includes(`${n.id}.view`) ||
                                      (n.id === "dashboard" &&
                                        (aPerms.includes("dashboard.view") ||
                                          aPerms.includes("dashboard"))),
                                  ).length;
                            return (
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
                                        flexShrink: 0,
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
                                      {a.parent_name ? (
                                        <div
                                          style={{
                                            fontSize: 10,
                                            color: "rgba(14,165,233,0.65)",
                                            marginTop: 1,
                                          }}
                                        >
                                          ↳ {a.parent_name}
                                        </div>
                                      ) : (
                                        a.created_at && (
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
                                        )
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
                                          : "rgba(59,130,246,0.12)",
                                      color:
                                        a.role === "super_admin"
                                          ? "#f87171"
                                          : "#60a5fa",
                                    }}
                                  >
                                    {a.role === "super_admin"
                                      ? "Super Admin"
                                      : "Mini Admin"}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 5,
                                    }}
                                  >
                                    {a.role === "super_admin" ? (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          color: "rgba(239,68,68,0.7)",
                                        }}
                                      >
                                        Бүгд
                                      </span>
                                    ) : (
                                      <>
                                        <span
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "rgba(96,165,250,0.8)",
                                          }}
                                        >
                                          {navCount}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: 11,
                                            color: "rgba(148,163,184,0.4)",
                                          }}
                                        >
                                          / {NAV_PERMS.length} цэс
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  <button
                                    onClick={() => toggleStatus(a)}
                                    disabled={statusLoading === a.id}
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
                                          animation:
                                            "spin 0.8s linear infinite",
                                        }}
                                      />
                                    ) : (
                                      <Badge status={a.status} />
                                    )}
                                  </button>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  {can("admins.manage") && (
                                    <div style={{ display: "flex", gap: 6 }}>
                                      <button
                                        className="icon-btn"
                                        onClick={() => {
                                          setEditTarget(a);
                                          setModalMode("edit");
                                        }}
                                      >
                                        <Pencil
                                          size={13}
                                          style={{
                                            color: "rgba(59,130,246,0.7)",
                                          }}
                                        />
                                      </button>
                                      <button
                                        className="icon-btn"
                                        onClick={() => setDeleteTarget(a)}
                                      >
                                        <Trash2
                                          size={13}
                                          style={{
                                            color: "rgba(239,68,68,0.6)",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            {nav === "special_permissions" && canNav("special_permissions") && (
              <SpecialPermissionsTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
