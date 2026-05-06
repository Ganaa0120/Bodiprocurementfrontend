"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  BarChart3,
  Settings,
  Activity,
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
  Menu,
  Zap,
  ArrowRight,
  Home,
  Briefcase,
  FolderTree,
  Megaphone,
  UserCog,
} from "lucide-react";
import { IndividualsTab } from "./_components/individuals/IndividualsTab";
import { SpecialPermissionsTab } from "./_components/SpecialPermissionsTab";
import { PendingEditsTab } from "./_components/pending-edits/PendingEditsTab";

type NavId =
  | "dashboard"
  | "notifications"
  | "admins"
  | "companies"
  | "individuals"
  | "categories"
  | "directions"
  | "special_permissions"
  | "announcements"
  | "pending_edits";
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

type DashStats = {
  total_companies: number;
  total_persons: number;
  pending_companies: number;
  pending_persons: number;
  active_companies: number;
  active_persons: number;
  returned_companies: number;
  returned_persons: number;
  new_this_month: number;
  monthly: { month: string; companies: number; persons: number }[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const tok = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";
const authH = () => ({ Authorization: `Bearer ${tok()}` });
const jsonH = () => ({ "Content-Type": "application/json", ...authH() });

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
    subs: [{ id: "dashboard.view", label: "Харах", desc: "Статистик харах" }],
  },
  {
    id: "notifications",
    label: "Мэдэгдэл",
    icon: "🔔",
    subs: [
      { id: "notifications.view", label: "Харах", desc: "Мэдэгдэл харах" },
      { id: "notifications.send", label: "Илгээх", desc: "Мэдэгдэл илгээх" },
    ],
  },
  {
    id: "companies",
    label: "Компаниуд",
    icon: "🏢",
    subs: [
      { id: "companies.view", label: "Харах", desc: "Компани харах" },
      { id: "companies.edit_status", label: "Статус", desc: "Статус солих" },
      { id: "companies.edit", label: "Засах", desc: "Засах" },
      { id: "companies.delete", label: "Устгах", desc: "Устгах" },
    ],
  },
  {
    id: "individuals",
    label: "Хувь хүн",
    icon: "👤",
    subs: [
      { id: "individuals.view", label: "Харах", desc: "Харах" },
      { id: "individuals.edit_status", label: "Статус", desc: "Статус солих" },
      { id: "individuals.edit", label: "Засах", desc: "Засах" },
      { id: "individuals.delete", label: "Устгах", desc: "Устгах" },
    ],
  },
  {
    id: "categories",
    label: "Ангилалууд",
    icon: "📁",
    subs: [
      { id: "categories.view", label: "Харах", desc: "Харах" },
      { id: "categories.manage", label: "Засварлах", desc: "Засах" },
    ],
  },
  {
    id: "directions",
    label: "Үйл ажиллагааны чиглэл",
    icon: "🎯",
    subs: [
      { id: "directions.view", label: "Харах", desc: "Харах" },
      { id: "directions.manage", label: "Засварлах", desc: "Засах" },
    ],
  },
  {
    id: "announcements",
    label: "Зарлалууд",
    icon: "📢",
    subs: [
      { id: "announcements.view", label: "Харах", desc: "Харах" },
      { id: "announcements.create", label: "Үүсгэх", desc: "Үүсгэх" },
      { id: "announcements.edit", label: "Засах", desc: "Засах" },
      { id: "announcements.publish", label: "Нийтлэх", desc: "Нийтлэх" },
      { id: "announcements.delete", label: "Устгах", desc: "Устгах" },
    ],
  },
  {
    id: "admins",
    label: "Админууд",
    icon: "🛡️",
    superAdminOnly: true,
    subs: [
      { id: "admins.view", label: "Харах", desc: "Харах" },
      { id: "admins.manage", label: "Удирдах", desc: "Удирдах" },
    ],
  },
  {
    id: "pending_edits",
    label: "Зассан мэдээлэлүүд",
    icon: "⏳",
    superAdminOnly: true,
    subs: [
      { id: "pending_edits.view", label: "Харах", desc: "Pending edits харах" },
    ],
  },
];

const ALL_PERMS = NAV_PERMS.flatMap((n) => n.subs.map((s) => s.id));
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
  if (!raw) return ["dashboard.view"];
  let arr: string[] = [];
  if (Array.isArray(raw)) arr = raw;
  else {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = ["dashboard.view"];
    }
  }
  if (arr.length === 0) return ["dashboard.view"];
  const isOld = arr.every((p: string) => !p.includes("."));
  if (isOld)
    return [...new Set(arr.flatMap((id: string) => OLD_FORMAT_MAP[id] ?? []))];
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
        gap: 6,
        padding: "4px 12px",
        borderRadius: 30,
        background: c.bg,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
        border: `1px solid ${c.color}20`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
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
        padding: "14px 16px",
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        whiteSpace: "nowrap",
      }}
    >
      {h}
    </th>
  );
}

// AreaChart Component - Enhanced with better colors and animations
function AreaChart({
  data,
}: {
  data: { month: string; companies: number; persons: number }[];
}) {
  if (!data || data.length === 0)
    return (
      <div
        style={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: 12,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <TrendingUp size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p>Мэдээлэл байхгүй</p>
        </div>
      </div>
    );

  const W = 580,
    H = 180,
    PL = 40,
    PB = 28,
    PT = 16,
    PR = 20;
  const cW = W - PL - PR,
    cH = H - PT - PB;
  const maxC = Math.max(...data.map((d) => d.companies), 1);
  const maxP = Math.max(...data.map((d) => d.persons), 1);
  const mx = Math.max(maxC, maxP, 1);
  const n = data.length;
  const xStep = cW / (n - 1 || 1);

  const compPoints = data.map((d, i) => ({
    x: PL + i * xStep,
    y: PT + cH - (d.companies / mx) * cH,
  }));
  const persPoints = data.map((d, i) => ({
    x: PL + i * xStep,
    y: PT + cH - (d.persons / mx) * cH,
  }));

  const pathLine = (pts: { x: number; y: number }[]) =>
    pts
      .map((p, i) =>
        i === 0
          ? `M${p.x.toFixed(1)},${p.y.toFixed(1)}`
          : `L${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ");
  const pathArea = (pts: { x: number; y: number }[]) =>
    `${pathLine(pts)} L${pts[pts.length - 1].x.toFixed(1)},${(PT + cH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PT + cH).toFixed(1)} Z`;

  const gridVals = [0, Math.round(mx / 2), mx];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="gc2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gp2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridVals.map((v, i) => {
        const y = PT + cH - (v / mx) * cH;
        return (
          <g key={i}>
            <line
              x1={PL}
              x2={W - PR}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PL - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Areas */}
      <path d={pathArea(compPoints)} fill="url(#gc2)" />
      <path d={pathArea(persPoints)} fill="url(#gp2)" />

      {/* Lines */}
      <path
        d={pathLine(compPoints)}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      <path
        d={pathLine(persPoints)}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Dots with glow */}
      {compPoints.map((p, i) => (
        <g key={`c${i}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#6366f1"
            stroke="#0a0e1a"
            strokeWidth="2"
          />
          <circle cx={p.x} cy={p.y} r="6" fill="#6366f1" opacity="0.3" />
        </g>
      ))}
      {persPoints.map((p, i) => (
        <g key={`p${i}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#22d3ee"
            stroke="#0a0e1a"
            strokeWidth="2"
          />
          <circle cx={p.x} cy={p.y} r="6" fill="#22d3ee" opacity="0.3" />
        </g>
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={PL + i * xStep}
          y={H - 6}
          textAnchor="middle"
          fontSize="9"
          fill="rgba(255,255,255,0.35)"
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// Ring Chart Component
function RingChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const tot = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 38,
    r = 24,
    cx = 50,
    cy = 50;
  let angle = -90;
  const arcs = data.map((d) => {
    const deg = (d.value / tot) * 360;
    const r1 = (angle * Math.PI) / 180,
      r2 = ((angle + deg) * Math.PI) / 180;
    const x1 = cx + R * Math.cos(r1),
      y1 = cy + R * Math.sin(r1);
    const x2 = cx + R * Math.cos(r2),
      y2 = cy + R * Math.sin(r2);
    const large = deg > 180 ? 1 : 0;
    const path = `M${cx} ${cy} L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
    angle += deg;
    return { ...d, path };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: 100, height: 100, flexShrink: 0 }}
    >
      {arcs.map((a, i) => (
        <path
          key={i}
          d={a.path}
          fill={a.color}
          stroke="#0b1022"
          strokeWidth="1.5"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="#0b1022" />
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="rgba(255,255,255,0.85)"
      >
        {tot}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize="6"
        fill="rgba(255,255,255,0.3)"
      >
        нийт
      </text>
    </svg>
  );
}

// Counter Component
function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / dur, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(start + ease * (target - start)));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <span>{val.toLocaleString()}</span>;
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
  loading,
}: any) {
  return (
    <div
      onClick={onClick}
      style={{
        background:
          "linear-gradient(135deg, rgba(18,22,45,0.95), rgba(12,16,35,0.98))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: "20px 22px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = `0 20px 40px -12px ${color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: trend >= 0 ? "#10b981" : "#ef4444",
              background:
                trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              padding: "4px 10px",
              borderRadius: 30,
            }}
          >
            {trend >= 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "white",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {loading ? (
          <div
            style={{
              width: 60,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
            }}
            className="shimmer"
          />
        ) : (
          <Counter target={value} />
        )}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
          marginTop: 8,
          fontWeight: 500,
        }}
      >
        {title}
      </div>
    </div>
  );
}

// Permission Row Component
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
        borderRadius: 12,
        overflow: "hidden",
        border: visible
          ? "1px solid rgba(99,102,241,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
        background: visible
          ? "rgba(99,102,241,0.04)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
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
            background: visible ? "#6366f1" : "rgba(255,255,255,0.05)",
            border: visible
              ? "1px solid #6366f1"
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
                  padding: "2px 8px",
                  borderRadius: 30,
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
                marginTop: 2,
              }}
            >
              {subCount}/{nav.subs.length} эрх
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
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
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
      {expanded && nav.subs.length > 1 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "10px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(148,163,184,0.35)",
              marginBottom: 8,
            }}
          >
            Дэд эрхүүд
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
          >
            {nav.subs.map((sub) => {
              const isView = sub.id === `${nav.id}.view`;
              const checked = perms.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => !isView && onToggleSub(sub.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    cursor: isView ? "default" : "pointer",
                    background: checked
                      ? "rgba(99,102,241,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: checked
                      ? "1px solid rgba(99,102,241,0.2)"
                      : "1px solid rgba(255,255,255,0.05)",
                    opacity: isView ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      flexShrink: 0,
                      marginTop: 1,
                      background: checked
                        ? "#6366f1"
                        : "rgba(255,255,255,0.06)",
                      border: checked
                        ? "1px solid #6366f1"
                        : "1px solid rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {checked && <CheckCircle2 size={10} color="white" />}
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

// Admin Modal Component
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
  const [perms, setPerms] = React.useState<string[]>(() =>
    admin?.permissions ? parsePerms(admin.permissions) : ["dashboard.view"],
  );
  const [showPw, setShowPw] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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
  const toggleNav = (nav: NavPerm) => {
    const viewSub = `${nav.id}.view`;
    setPerms((prev) => {
      const has = prev.includes(viewSub);
      if (has) {
        const subs = new Set(nav.subs.map((s) => s.id));
        return prev.filter((p) => !subs.has(p));
      }
      return [...prev, viewSub];
    });
  };
  const toggleSub = (subId: string) =>
    setPerms((prev) =>
      prev.includes(subId) ? prev.filter((p) => p !== subId) : [...prev, subId],
    );
  const handleRoleChange = (role: string) => {
    setForm((f) => ({ ...f, role }));
    if (role === "super_admin") setPerms([...ALL_PERMS]);
    else
      setPerms((prev) =>
        prev.length === ALL_PERMS.length ? ["dashboard.view"] : prev,
      );
  };
  const selectAll = () =>
    setPerms((prev) =>
      prev.length >= ALL_PERMS.length ? ["dashboard.view"] : [...ALL_PERMS],
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
    height: 42,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "0 14px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };
  const lbl: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    display: "block",
    marginBottom: 6,
  };
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
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        overflowY: "auto",
        padding: "20px 16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          marginBottom: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {mode === "create"
                ? "Шинэ Мини Админ үүсгэх"
                : "Мини Админ засах"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.45)",
                marginTop: 4,
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
              borderRadius: 12,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
              transition: "all 0.2s",
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
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertCircle
              size={14}
              style={{ color: "#f87171", flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
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
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
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
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
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
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
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
                  style={{ ...inp, paddingRight: 45 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Lock size={14} style={{ color: "#818cf8" }} />
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
                    : `${visibleNavs.filter((n) => perms.includes(`${n.id}.view`)).length}/${visibleNavs.length} цэс идэвхтэй`}
                </div>
              </div>
              {!isSA && (
                <button
                  type="button"
                  onClick={selectAll}
                  style={{
                    fontSize: 11,
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 8,
                    padding: "6px 14px",
                    color: "#a5b4fc",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.08)";
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
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(129,140,248,0.85)" }}>
                  ✓ Супер Админ бүх цэс болон функцийг автоматаар авна
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(148,163,184,0.6)";
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 14,
                background: loading
                  ? "#4f46e5"
                  : "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
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

// Delete Modal Component
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
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#0d1526",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "rgba(239,68,68,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Trash2 size={24} style={{ color: "#ef4444" }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 8,
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
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            Болих
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.25)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#f87171";
            }}
          >
            {loading ? (
              <Loader2
                size={14}
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <Trash2 size={14} />
            )}{" "}
            Устгах
          </button>
        </div>
      </div>
    </div>
  );
}
function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "14px 16px",
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

// Main Dashboard Component
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

  const [stats, setStats] = useState<DashStats>({
    total_companies: 0,
    total_persons: 0,
    pending_companies: 0,
    pending_persons: 0,
    active_companies: 0,
    active_persons: 0,
    returned_companies: 0,
    returned_persons: 0,
    new_this_month: 0,
    monthly: [],
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [cAll, cPend, cActive, pAll, pPend, pActive] =
        await Promise.allSettled([
          fetch(`${API}/api/organizations?limit=1`, { headers: authH() }).then(
            (r) => r.json(),
          ),
          fetch(`${API}/api/organizations?status=pending&limit=1`, {
            headers: authH(),
          }).then((r) => r.json()),
          fetch(`${API}/api/organizations?status=active&limit=1`, {
            headers: authH(),
          }).then((r) => r.json()),
          fetch(`${API}/api/persons?limit=1`, { headers: authH() }).then((r) =>
            r.json(),
          ),
          fetch(`${API}/api/persons?status=pending&limit=1`, {
            headers: authH(),
          }).then((r) => r.json()),
          fetch(`${API}/api/persons?status=active&limit=1`, {
            headers: authH(),
          }).then((r) => r.json()),
        ]);

      const cAllD = cAll.status === "fulfilled" ? cAll.value : null;
      const cPendD = cPend.status === "fulfilled" ? cPend.value : null;
      const cActD = cActive.status === "fulfilled" ? cActive.value : null;
      const pAllD = pAll.status === "fulfilled" ? pAll.value : null;
      const pPendD = pPend.status === "fulfilled" ? pPend.value : null;
      const pActD = pActive.status === "fulfilled" ? pActive.value : null;

      const totalC = cAllD?.total ?? cAllD?.organizations?.length ?? 0;
      const totalP = pAllD?.total ?? pAllD?.persons?.length ?? 0;
      const pendC = cPendD?.total ?? cPendD?.organizations?.length ?? 0;
      const pendP = pPendD?.total ?? pPendD?.persons?.length ?? 0;
      const actC = cActD?.total ?? cActD?.organizations?.length ?? 0;
      const actP = pActD?.total ?? pActD?.persons?.length ?? 0;

      const [cRecent, pRecent] = await Promise.allSettled([
        fetch(`${API}/api/organizations?limit=200&sort=created_at`, {
          headers: authH(),
        }).then((r) => r.json()),
        fetch(`${API}/api/persons?limit=200&sort=created_at`, {
          headers: authH(),
        }).then((r) => r.json()),
      ]);

      const cList =
        cRecent.status === "fulfilled"
          ? (cRecent.value.organizations ?? [])
          : [];
      const pList =
        pRecent.status === "fulfilled" ? (pRecent.value.persons ?? []) : [];

      const months: { month: string; companies: number; persons: number }[] =
        [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${d.getMonth() + 1}-р`;
        const y = d.getFullYear(),
          m = d.getMonth();
        const cCount = cList.filter((c: any) => {
          const dt = new Date(c.created_at);
          return dt.getFullYear() === y && dt.getMonth() === m;
        }).length;
        const pCount = pList.filter((p: any) => {
          const dt = new Date(p.created_at);
          return dt.getFullYear() === y && dt.getMonth() === m;
        }).length;
        months.push({ month: label, companies: cCount, persons: pCount });
      }

      const thisMonth = months[months.length - 1];
      const newThisMonth =
        (thisMonth?.companies ?? 0) + (thisMonth?.persons ?? 0);

      setStats({
        total_companies: totalC,
        total_persons: totalP,
        pending_companies: pendC,
        pending_persons: pendP,
        active_companies: actC,
        active_persons: actP,
        returned_companies: 0,
        returned_persons: 0,
        new_this_month: newThisMonth,
        monthly: months,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const data =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user");
    if (!tok() || !data) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(data);
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
    } catch (e) {
      console.error("Failed to parse user data", e);
    }

    const t = tok();
    if (!t) return;

    const adminData = () => {
      try {
        return JSON.parse(
          localStorage.getItem("super_admin_user") ||
            localStorage.getItem("user") ||
            "{}",
        );
      } catch {
        return {};
      }
    };

    const aId = adminData()?.id ?? "guest";

    let readSet: Set<string | number> = new Set();
    try {
      const readArray = JSON.parse(
        localStorage.getItem(`notif_read_${aId}`) || "[]",
      );
      readSet = new Set(readArray);
    } catch (e) {
      readSet = new Set();
    }

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
    if (id === "special_permissions") return false;
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

  const NAV_ITEMS = [
    {
      id: "dashboard" as NavId,
      icon: BarChart3,
      label: "Хянах самбар",
      badge: 0,
    },
    {
      id: "notifications" as NavId,
      icon: Bell,
      label: "Мэдэгдэл",
      badge: unread,
    },
    { id: "admins" as NavId, icon: ShieldCheck, label: "Админууд", badge: 0 },
    { id: "companies" as NavId, icon: Building2, label: "Компаниуд", badge: 0 },
    { id: "individuals" as NavId, icon: Users, label: "Хувь хүн", badge: 0 },
    {
      id: "categories" as NavId,
      icon: FolderTree,
      label: "Ангилалууд",
      badge: 0,
    },
    {
      id: "directions" as NavId,
      icon: Activity,
      label: "Үйл ажиллагааны чиглэл",
      badge: 0,
    },
    {
      id: "special_permissions" as NavId,
      icon: FileText,
      label: "Тусгай зөвшөөрөл",
      badge: 0,
    },
    {
      id: "announcements" as NavId,
      icon: Megaphone,
      label: "Зарлалууд",
      badge: 0,
    },
    {
      id: "pending_edits" as NavId,
      icon: Clock,
      label: "Шинэчлэсэн хүсэлтүүд",
      badge: 0,
    },
  ].filter((n) => canNav(n.id));

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
    if (nav === "dashboard") {
      fetchRecent();
      fetchStats();
    }
  }, [nav, fetchRecent, fetchStats]);
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

  const ringData = [
    {
      label: "Идэвхтэй",
      value: stats.active_companies + stats.active_persons,
      color: "#10b981",
    },
    {
      label: "Хүлээгдэж",
      value: stats.pending_companies + stats.pending_persons,
      color: "#6366f1",
    },
    {
      label: "Буцаагдсан",
      value: stats.returned_companies + stats.returned_persons,
      color: "#f43f5e",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        body {
          margin: 0;
          background: #0a0e1a;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
          border-radius: 99px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
          transition: background 0.2s;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99,102,241,0.4);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08), rgba(255,255,255,0.03));
          background-size: 200% 100%;
          animation: shimmer 1.5s ease infinite;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          margin: 4px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255,255,255,0.4);
          position: relative;
          overflow: hidden;
        }
        
        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08));
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
        
        .nav-item:hover {
          color: rgba(255,255,255,0.85);
          transform: translateX(4px);
        }
        
        .nav-item:hover::before {
          width: 100%;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08));
          color: #a5b4fc;
          border-left: 2px solid #6366f1;
        }
        
        .nav-item > * {
          position: relative;
          z-index: 1;
        }
        
        .glass-card {
          background: rgba(12,16,35,0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 8px 32px rgba(99,102,241,0.08);
        }
        
        .animate-fade-up {
          animation: fadeInUp 0.4s ease forwards;
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
          .sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 200,
            padding: "12px 20px",
            borderRadius: 16,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            background: toast.ok
              ? "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))"
              : "linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))",
            color: "white",
            backdropFilter: "blur(12px)",
            border: `1px solid ${toast.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
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
        style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a" }}
      >
        {/* Sidebar */}
        <aside
          className={`sidebar ${open ? "open" : ""}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 260,
            background: "rgba(8,12,28,0.98)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              padding: "24px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
  style={{
    width: 36,
    height: 36,
    borderRadius: 12,
    background: "transparent", // ✅ Дэвсгэрийг ил тод болгосон
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // boxShadow: "0 6px 14px rgba(99,102,241,0.3)", // ✅ Сүүдрийг арилгасан
  }}
>
  <img src="/images/logosolo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
</div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Bodi Group
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(99,102,241,0.6)",
                    fontWeight: 500,
                  }}
                >
                  Худалдан авалтын портал
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div
            style={{
              padding: "20px",
              margin: "12px 16px",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
              borderRadius: 20,
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "white",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                }}
              >
                {ini}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  {nm}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(99,102,241,0.7)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                      boxShadow: "0 0 6px #10b981",
                    }}
                  />
                  {me.role === "super_admin" ? "Super Admin" : "Admin"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                padding: "12px 20px 8px",
              }}
            >
              Main Menu
            </div>
            {NAV_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                className={`nav-item ${nav === item.id ? "active" : ""}`}
                style={{
                  animationDelay: `${idx * 0.05}s`,
                  opacity: 0,
                  animation: "slideIn 0.3s ease forwards",
                }}
                onClick={() => {
                  setNav(item.id);
                  setOpen(false);
                  if (item.id === "notifications") setUnread(0);
                }}
              >
                <item.icon size={18} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                  {item.label}
                </span>
                {item.badge > 0 && ( // ✅ badge нь заавал number байна
                  <span
                    style={{
                      background: "#ef4444",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 30,
                      minWidth: 22,
                      textAlign: "center",
                    }}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
            ))}

            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                padding: "20px 20px 8px",
                marginTop: 8,
              }}
            >
              Settings
            </div>
            <div
              className="nav-item"
              style={{
                animationDelay: "0.3s",
                opacity: 0,
                animation: "slideIn 0.3s ease forwards",
              }}
            >
              <Settings size={18} />
              <span style={{ fontSize: 13 }}>Preferences</span>
            </div>
          </nav>

          {/* Logout Button */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              onClick={logout}
              className="nav-item"
              style={{
                color: "rgba(239,68,68,0.6)",
                margin: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(239,68,68,0.6)";
              }}
            >
              <LogOut size={18} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Sign Out</span>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="mobile-menu-btn"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 101,
            background: "rgba(18,22,45,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 10,
            cursor: "pointer",
            display: "none",
            backdropFilter: "blur(12px)",
          }}
        >
          {open ? (
            <X size={20} color="white" />
          ) : (
            <Menu size={20} color="white" />
          )}
        </button>

        {/* Overlay */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 49,
              animation: "fadeIn 0.2s ease",
            }}
          />
        )}

        {/* Main Content */}
        <div
          className="main-content"
          style={{
            flex: 1,
            marginLeft: 260,
            minHeight: "100vh",
            transition: "margin-left 0.3s ease",
          }}
        >
          {/* Topbar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 40,
              background: "rgba(10,14,26,0.85)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-0.3px",
                }}
              >
                {NAV_ITEMS.find((n) => n.id === nav)?.label}
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  marginTop: 2,
                }}
              >
                Welcome back, {nm.split(" ")[0]}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => {
                  setNav("notifications");
                  setUnread(0);
                }}
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <Bell size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
                {unread > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      animation: "pulse 1.5s infinite",
                      border: "2px solid rgba(10,14,26,0.85)",
                    }}
                  />
                )}
              </button>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                }}
              >
                {ini}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main
            style={{ padding: "28px 32px", minHeight: "calc(100vh - 70px)" }}
          >
            {/* Dashboard Tab */}
            {nav === "dashboard" && canNav("dashboard") && (
              <div
                className="animate-fade-up"
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Stats Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                  }}
                >
                  <StatCard
                    title="Нийт бүртгэл"
                    value={stats.total_companies + stats.total_persons}
                    icon={Users}
                    color="#8b5cf6"
                    trend={12}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Хүлээгдэж буй"
                    value={stats.pending_companies + stats.pending_persons}
                    icon={Clock}
                    color="#f59e0b"
                    trend={-3}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Идэвхтэй"
                    value={stats.active_companies + stats.active_persons}
                    icon={CheckCircle2}
                    color="#10b981"
                    trend={8}
                    loading={statsLoading}
                  />
                  <StatCard
                    title="Энэ сард"
                    value={stats.new_this_month}
                    icon={TrendingUp}
                    color="#22d3ee"
                    trend={15}
                    loading={statsLoading}
                  />
                </div>

                {/* Charts Row - Enhanced Design */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 380px",
                    gap: 24,
                  }}
                >
                  {/* Area Chart - Premium Design */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(18,22,45,0.95), rgba(12,16,35,0.98))",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 24,
                      padding: "20px 24px",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 32px rgba(99,102,241,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Decorative glow */}
                    <div
                      style={{
                        position: "absolute",
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(99,102,241,0.15), transparent)",
                        pointerEvents: "none",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "white",
                            margin: 0,
                            letterSpacing: "-0.3px",
                          }}
                        >
                          Бүртгэлийн өсөлт
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#10b981",
                              display: "inline-block",
                            }}
                          />
                          Сүүлийн 6 сарын мэдээлэл
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 12px",
                            borderRadius: 30,
                            background: "rgba(99,102,241,0.08)",
                            border: "1px solid rgba(99,102,241,0.15)",
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: "#6366f1",
                              display: "block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#a5b4fc",
                            }}
                          >
                            Компани
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 12px",
                            borderRadius: 30,
                            background: "rgba(34,211,238,0.08)",
                            border: "1px solid rgba(34,211,238,0.15)",
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: "#22d3ee",
                              display: "block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#67e8f9",
                            }}
                          >
                            Хувь хүн
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 200 }}>
                      {statsLoading ? (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          <Loader2
                            size={28}
                            style={{
                              color: "#6366f1",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            Мэдээлэл ачааллаж байна...
                          </span>
                        </div>
                      ) : (
                        <AreaChart data={stats.monthly} />
                      )}
                    </div>
                  </div>

                  {/* Ring Chart - Premium Design */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(18,22,45,0.95), rgba(12,16,35,0.98))",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 24,
                      padding: "20px",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 32px rgba(99,102,241,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Decorative glow */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(16,185,129,0.1), transparent)",
                        pointerEvents: "none",
                      }}
                    />

                    <div style={{ marginBottom: 16 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "white",
                          margin: 0,
                          letterSpacing: "-0.3px",
                        }}
                      >
                        Статус хуваарилалт
                      </h3>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#f59e0b",
                            display: "inline-block",
                          }}
                        />
                        Нийт бүртгэлийн харьцаа
                      </p>
                    </div>

                    {statsLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 40,
                        }}
                      >
                        <Loader2
                          size={28}
                          style={{
                            color: "#6366f1",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 20,
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {/* Ring Chart with glow effect */}
                        <div
                          style={{
                            position: "relative",
                            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                          }}
                        >
                          <RingChart data={ringData} />
                        </div>

                        {/* Legend with progress bars */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            minWidth: 140,
                          }}
                        >
                          {ringData.map((item, idx) => {
                            const total =
                              ringData.reduce((s, x) => s + x.value, 0) || 1;
                            const percentage = Math.round(
                              (item.value / total) * 100,
                            );
                            return (
                              <div
                                key={item.label}
                                style={{
                                  animation: `fadeInUp ${0.3 + idx * 0.1}s ease forwards`,
                                  opacity: 0,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 3,
                                        background: item.color,
                                        boxShadow: `0 0 6px ${item.color}`,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.7)",
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "white",
                                      }}
                                    >
                                      {item.value.toLocaleString()}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: "rgba(255,255,255,0.35)",
                                      }}
                                    >
                                      ({percentage}%)
                                    </span>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    height: 6,
                                    borderRadius: 3,
                                    background: "rgba(255,255,255,0.08)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      borderRadius: 3,
                                      background: item.color,
                                      width: `${percentage}%`,
                                      transition:
                                        "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                                      boxShadow: `0 0 8px ${item.color}`,
                                      position: "relative",
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background:
                                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2))",
                                        animation: "shimmer 2s infinite",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                  }}
                >
                  <div
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>🏢</span>
                    <div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "white",
                        }}
                      >
                        {statsLoading ? (
                          <span style={{ opacity: 0.3 }}>—</span>
                        ) : (
                          <Counter target={stats.total_companies} />
                        )}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                      >
                        Нийт компани
                      </div>
                    </div>
                  </div>
                  <div
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>👤</span>
                    <div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "white",
                        }}
                      >
                        {statsLoading ? (
                          <span style={{ opacity: 0.3 }}>—</span>
                        ) : (
                          <Counter target={stats.total_persons} />
                        )}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                      >
                        Нийт хувь хүн
                      </div>
                    </div>
                  </div>
                  <div
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>⏳</span>
                    <div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "white",
                        }}
                      >
                        {statsLoading ? (
                          <span style={{ opacity: 0.3 }}>—</span>
                        ) : (
                          <Counter
                            target={
                              stats.pending_companies + stats.pending_persons
                            }
                          />
                        )}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                      >
                        Хүлээгдэж буй
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Registrations */}
                <div className="glass-card">
                  <div
                    style={{
                      padding: "18px 24px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "white",
                          margin: 0,
                        }}
                      >
                        Сүүлийн бүртгэлүүд
                      </h3>
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.35)",
                          marginTop: 2,
                        }}
                      >
                        Хувь хүний бүртгэл
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        fetchRecent();
                        fetchStats();
                      }}
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: 10,
                        padding: "6px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#a5b4fc",
                        fontSize: 12,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(99,102,241,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(99,102,241,0.08)";
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
                      Шинэчлэх
                    </button>
                  </div>

                  {recentLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 48,
                      }}
                    >
                      <Loader2
                        size={24}
                        style={{
                          color: "#6366f1",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 600,
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <TableHeader>Нэр</TableHeader>
                            <TableHeader>И-мэйл</TableHeader>
                            <TableHeader>Регистр</TableHeader>
                            <TableHeader>Статус</TableHeader>
                            <TableHeader>Огноо</TableHeader>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPersons.slice(0, 5).map((person, idx) => {
                            const fullName =
                              [person.last_name, person.first_name]
                                .filter(Boolean)
                                .join(" ") || person.email;
                            const colorsList = [
                              "#6366f1",
                              "#8b5cf6",
                              "#06b6d4",
                              "#10b981",
                              "#f59e0b",
                            ];
                            const avatarColor =
                              colorsList[idx % colorsList.length];

                            return (
                              <tr
                                key={person.id}
                                style={{
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.04)",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.03)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "transparent";
                                }}
                              >
                                {/* Name Column */}
                                <td style={{ padding: "12px 16px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        background: `${avatarColor}15`,
                                        border: `1px solid ${avatarColor}25`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: avatarColor,
                                      }}
                                    >
                                      {(
                                        person.first_name?.[0] ??
                                        person.email[0]
                                      ).toUpperCase()}
                                    </div>
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "rgba(255,255,255,0.85)",
                                      }}
                                    >
                                      {fullName}
                                    </span>
                                  </div>
                                </td>

                                {/* Email Column */}
                                <td
                                  style={{
                                    padding: "12px 16px",
                                    fontSize: 12,
                                    color: "rgba(148,163,184,0.6)",
                                  }}
                                >
                                  {person.email}
                                </td>

                                {/* Register Number Column */}
                                <td
                                  style={{
                                    padding: "12px 16px",
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    color: "rgba(148,163,184,0.5)",
                                  }}
                                >
                                  {person.register_number || "—"}
                                </td>

                                {/* Status Column */}
                                <td style={{ padding: "12px 16px" }}>
                                  <Badge status={person.status} />
                                </td>

                                {/* Date Column */}
                                <td
                                  style={{
                                    padding: "12px 16px",
                                    fontSize: 11,
                                    color: "rgba(148,163,184,0.4)",
                                  }}
                                >
                                  {person.created_at
                                    ? new Date(
                                        person.created_at,
                                      ).toLocaleDateString("mn-MN")
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                          {recentPersons.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                style={{
                                  padding: "60px 20px",
                                  textAlign: "center",
                                  color: "rgba(255,255,255,0.35)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 48,
                                    marginBottom: 12,
                                    opacity: 0.3,
                                  }}
                                >
                                  📭
                                </div>
                                <p style={{ margin: 0 }}>Бүртгэл байхгүй</p>
                                <p
                                  style={{
                                    margin: "6px 0 0",
                                    fontSize: 11,
                                    color: "rgba(148,163,184,0.25)",
                                  }}
                                >
                                  Шинэ бүртгэл бүртгүүлэхэд энд харагдана
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Tabs */}
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
                className="animate-fade-up"
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ position: "relative", width: 280 }}>
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Админ хайх..."
                      className="modern-input"
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                  {can("admins.manage") && (
                    <button
                      onClick={() => {
                        setEditTarget(null);
                        setModalMode("create");
                      }}
                      style={{
                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                        border: "none",
                        borderRadius: 14,
                        padding: "10px 20px",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(99,102,241,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Plus size={16} /> Шинэ Админ
                    </button>
                  )}
                </div>

                {/* Admins Table Section */}
                <div
                  style={{
                    background: "rgba(12,16,35,0.6)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  {adminsLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 60,
                        gap: 12,
                      }}
                    >
                      <Loader2
                        size={24}
                        style={{
                          color: "#6366f1",
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
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 800,
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
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
                                  padding: "60px 20px",
                                  textAlign: "center",
                                  color: "rgba(255,255,255,0.35)",
                                  fontSize: 13,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 48,
                                    marginBottom: 12,
                                    opacity: 0.3,
                                  }}
                                >
                                  👥
                                </div>
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
                              const colors = [
                                "#6366f1",
                                "#8b5cf6",
                                "#06b6d4",
                                "#10b981",
                              ];
                              const color = colors[i % colors.length];
                              return (
                                <tr
                                  key={a.id}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.04)",
                                    transition: "background 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.03)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "transparent";
                                  }}
                                >
                                  {/* Name Column */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      verticalAlign: "middle",
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
                                          width: 36,
                                          height: 36,
                                          borderRadius: 10,
                                          background: `${color}15`,
                                          border: `1px solid ${color}25`,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: color,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {(
                                          a.first_name?.[0] ?? a.email[0]
                                        ).toUpperCase()}
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "rgba(255,255,255,0.88)",
                                          }}
                                        >
                                          {a.last_name} {a.first_name}
                                        </div>
                                        {a.created_at && (
                                          <div
                                            style={{
                                              fontSize: 10,
                                              color: "rgba(148,163,184,0.45)",
                                              marginTop: 2,
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

                                  {/* Company */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      fontSize: 12,
                                      color: "rgba(148,163,184,0.6)",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {a.company_name || "—"}
                                  </td>

                                  {/* Email */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      fontSize: 12,
                                      color: "rgba(148,163,184,0.6)",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {a.email}
                                  </td>

                                  {/* Role */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: "4px 12px",
                                        borderRadius: 30,
                                        background:
                                          a.role === "super_admin"
                                            ? "rgba(239,68,68,0.12)"
                                            : "rgba(99,102,241,0.12)",
                                        color:
                                          a.role === "super_admin"
                                            ? "#f87171"
                                            : "#a5b4fc",
                                        border: `1px solid ${
                                          a.role === "super_admin"
                                            ? "rgba(239,68,68,0.25)"
                                            : "rgba(99,102,241,0.25)"
                                        }`,
                                      }}
                                    >
                                      {a.role === "super_admin"
                                        ? "Super Admin"
                                        : "Mini Admin"}
                                    </span>
                                  </td>

                                  {/* Menu Permissions */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {a.role === "super_admin" ? (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          color: "rgba(239,68,68,0.6)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        }}
                                      >
                                        🔓 Бүгд
                                      </span>
                                    ) : (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: "#a5b4fc",
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
                                          / {NAV_PERMS.length}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: 10,
                                            color: "rgba(148,163,184,0.3)",
                                            marginLeft: 4,
                                          }}
                                        >
                                          цэс
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    <button
                                      onClick={() => toggleStatus(a)}
                                      disabled={statusLoading === a.id}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        display: "flex",
                                      }}
                                    >
                                      {statusLoading === a.id ? (
                                        <Loader2
                                          size={14}
                                          style={{
                                            color: "#6366f1",
                                            animation:
                                              "spin 0.8s linear infinite",
                                          }}
                                        />
                                      ) : (
                                        <Badge status={a.status} />
                                      )}
                                    </button>
                                  </td>

                                  {/* Actions */}
                                  <td
                                    style={{
                                      padding: "14px 16px",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {can("admins.manage") && (
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 8,
                                          alignItems: "center",
                                        }}
                                      >
                                        <button
                                          onClick={() => {
                                            setEditTarget(a);
                                            setModalMode("edit");
                                          }}
                                          style={{
                                            background:
                                              "rgba(255,255,255,0.05)",
                                            border:
                                              "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: 8,
                                            padding: "6px 10px",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background =
                                              "rgba(99,102,241,0.15)";
                                            e.currentTarget.style.borderColor =
                                              "rgba(99,102,241,0.3)";
                                            e.currentTarget.style.transform =
                                              "translateY(-1px)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                              "rgba(255,255,255,0.05)";
                                            e.currentTarget.style.borderColor =
                                              "rgba(255,255,255,0.08)";
                                            e.currentTarget.style.transform =
                                              "translateY(0)";
                                          }}
                                          title="Засах"
                                        >
                                          <Pencil
                                            size={13}
                                            style={{ color: "#a5b4fc" }}
                                          />
                                          {/* ✅ Icon only - текст арилгасан */}
                                        </button>

                                        <button
                                          onClick={() => setDeleteTarget(a)}
                                          style={{
                                            background:
                                              "rgba(255,255,255,0.05)",
                                            border:
                                              "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: 8,
                                            padding: "6px 10px",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background =
                                              "rgba(239,68,68,0.15)";
                                            e.currentTarget.style.borderColor =
                                              "rgba(239,68,68,0.3)";
                                            e.currentTarget.style.transform =
                                              "translateY(-1px)";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                              "rgba(255,255,255,0.05)";
                                            e.currentTarget.style.borderColor =
                                              "rgba(255,255,255,0.08)";
                                            e.currentTarget.style.transform =
                                              "translateY(0)";
                                          }}
                                          title="Устгах"
                                        >
                                          <Trash2
                                            size={13}
                                            style={{ color: "#f87171" }}
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
                    </div>
                  )}
                </div>
              </div>
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
            {nav === "special_permissions" && canNav("special_permissions") && (
              <SpecialPermissionsTab
                isSuperAdmin={me.role === "super_admin"}
                showToast={showToast}
              />
            )}
            {nav === "pending_edits" && canNav("pending_edits") && (
              <PendingEditsTab showToast={showToast} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
