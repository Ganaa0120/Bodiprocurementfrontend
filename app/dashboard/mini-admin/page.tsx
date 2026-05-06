"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  Users,
  LogOut,
  RefreshCw,
  Eye,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  X,
  Loader2,
  Trash2,
  Pencil,
  Plus,
  ChevronRight,
  ChevronDown,
  Lock,
  EyeOff,
  Activity,
  Menu,
  Home,
  Briefcase,
  UserCircle,
  MessageSquare,
  FolderTree,
  ExternalLink,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";
import { NotificationsTab } from "../admin/_components/NotificationsTab";
import { CompaniesTab } from "../admin/_components/CompaniesTab";
import { AnnouncementsTab } from "../admin/_components/Announcementstab";
import { CategoriesTab } from "../admin/_components/Categoriestab";
import { DirectionsTab } from "../admin/_components/Directionstab";
import { IndividualsTab } from "../admin/_components/individuals/IndividualsTab";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const tok = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";
const authH = () => ({ Authorization: `Bearer ${tok()}` });
const jsonH = () => ({ "Content-Type": "application/json", ...authH() });

type NavId =
  | "dashboard"
  | "individuals"
  | "companies"
  | "notifications"
  | "announcements"
  | "sub-admins"
  | "categories"
  | "directions";

const NAV_PERMS = [
  { id: "dashboard", label: "Хянах самбар", icon: <BarChart3 size={18} /> },
  { id: "notifications", label: "Мэдэгдэл", icon: <Bell size={18} /> },
  { id: "companies", label: "Компаниуд", icon: <Building2 size={18} /> },
  { id: "individuals", label: "Хувь хүн", icon: <Users size={18} /> },
  { id: "announcements", label: "Зарлалууд", icon: <FileText size={18} /> },
  { id: "sub-admins", label: "Брокерууд", icon: <ShieldCheck size={18} /> },
  { id: "categories", label: "Ангилалууд", icon: <FolderTree size={18} /> },
  {
    id: "directions",
    label: "Үйл ажиллагааны чиглэл",
    icon: <Activity size={18} />,
  },
];

const SUB_PERMS: Record<string, { id: string; label: string; desc: string }[]> =
  {
    notifications: [
      { id: "notifications.view", label: "Харах", desc: "Мэдэгдлийн жагсаалт" },
      { id: "notifications.send", label: "Илгээх", desc: "Мэдэгдэл илгээх" },
    ],
    companies: [
      { id: "companies.view", label: "Харах", desc: "Компанийн жагсаалт" },
      {
        id: "companies.edit_status",
        label: "Статус солих",
        desc: "Компанийн статус",
      },
      { id: "companies.edit", label: "Засах", desc: "Мэдээлэл засах" },
      { id: "companies.delete", label: "Устгах", desc: "Компани устгах" },
    ],
    individuals: [
      { id: "individuals.view", label: "Харах", desc: "Хувь хүний жагсаалт" },
      {
        id: "individuals.edit_status",
        label: "Статус солих",
        desc: "Статус өөрчлөх",
      },
      { id: "individuals.edit", label: "Засах", desc: "Мэдээлэл засах" },
      { id: "individuals.delete", label: "Устгах", desc: "Хувь хүн устгах" },
    ],
    announcements: [
      { id: "announcements.view", label: "Харах", desc: "Зарлалууд харах" },
      { id: "announcements.create", label: "Үүсгэх", desc: "Шинэ зарлал" },
      { id: "announcements.edit", label: "Засах", desc: "Зарлал засах" },
      { id: "announcements.publish", label: "Нийтлэх", desc: "Статус солих" },
      { id: "announcements.delete", label: "Устгах", desc: "Зарлал устгах" },
    ],
    categories: [
      { id: "categories.view", label: "Харах", desc: "Ангилалууд харах" },
      {
        id: "categories.manage",
        label: "Удирдах",
        desc: "Ангилал нэмэх/засах",
      },
    ],
    directions: [
      { id: "directions.view", label: "Харах", desc: "Чиглэлүүд харах" },
      { id: "directions.manage", label: "Удирдах", desc: "Чиглэл нэмэх/засах" },
    ],
  };

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
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
  };

function Badge({ s }: { s: string }) {
  const c = STATUS_CFG[s] ?? STATUS_CFG.pending;
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
        padding: "12px 16px",
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
  if (arr.length === 0) return ["dashboard", "dashboard.view"];
  const isOldFormat = arr.every((p: string) => !p.includes("."));
  if (isOldFormat) {
    return [
      ...new Set(arr.flatMap((id: string) => OLD_FORMAT_MAP[id] ?? [id])),
    ];
  }
  return arr;
}

// SubAdminModal Component
function SubAdminModal({
  mode,
  admin,
  parentPerms,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  admin?: any;
  parentPerms: string[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    first_name: admin?.first_name ?? "",
    last_name: admin?.last_name ?? "",
    company_name: admin?.company_name ?? "",
    email: admin?.email ?? "",
    phone: admin?.phone ?? "",
    password: "",
  });
  const [perms, setPerms] = useState<string[]>(parsePerms(admin?.permissions));
  const [showPw, setShowPw] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["individuals"]),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableNavs = NAV_PERMS.filter(
    (n) =>
      n.id === "dashboard" ||
      parentPerms.includes(`${n.id}.view`) ||
      parentPerms.some((p) => p.startsWith(`${n.id}.`)),
  ).filter(
    (n) =>
      n.id !== "sub-admins" && n.id !== "categories" && n.id !== "directions",
  );

  const navVisible = (id: string) =>
    perms.includes(`${id}.view`) ||
    (id === "dashboard" && perms.includes("dashboard.view"));

  const toggleNav = (id: string) => {
    if (id === "dashboard") return;
    const viewId = `${id}.view`;
    if (navVisible(id))
      setPerms((p) => p.filter((x) => !x.startsWith(`${id}.`)));
    else setPerms((p) => [...new Set([...p, viewId])]);
  };

  const toggleSub = (subId: string) => {
    setPerms((p) =>
      p.includes(subId) ? p.filter((x) => x !== subId) : [...p, subId],
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalPerms = perms.filter(
        (p) =>
          parentPerms.includes(p) ||
          p === "dashboard" ||
          p === "dashboard.view",
      );
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
          body: JSON.stringify({
            ...form,
            role: "admin",
            permissions: finalPerms,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
          method: "PUT",
          headers: jsonH(),
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            company_name: form.company_name,
            phone: form.phone,
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
    color: "rgba(148,163,184,0.5)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
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
              {mode === "create" ? "Шинэ Брокер" : "Брокер засах"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.5)",
                marginTop: 2,
              }}
            >
              Зөвхөн өөрт байгаа эрхийн хүрээнд олгоно
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
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
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertCircle size={14} style={{ color: "#f87171" }} />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Овог *</label>
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, last_name: e.target.value }))
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
                  setForm((p) => ({ ...p, first_name: e.target.value }))
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
            <label style={lbl}>Компани</label>
            <input
              value={form.company_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, company_name: e.target.value }))
              }
              placeholder="Компанийн нэр"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
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
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="mail@example.mn"
                required
                disabled={mode === "edit"}
                style={{ ...inp, opacity: mode === "edit" ? 0.5 : 1 }}
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
                  setForm((p) => ({ ...p, phone: e.target.value }))
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
                    setForm((p) => ({ ...p, password: e.target.value }))
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
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

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
                gap: 8,
                marginBottom: 14,
              }}
            >
              <Lock size={14} style={{ color: "#60a5fa" }} />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Цэсний эрх тохиргоо
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {NAV_PERMS.filter(
                (n) =>
                  n.id !== "dashboard" &&
                  n.id !== "sub-admins" &&
                  n.id !== "categories" &&
                  n.id !== "directions",
              ).map((nav) => {
                const vis = navVisible(nav.id);
                const subs = SUB_PERMS[nav.id] || [];
                const isExpanded = expanded.has(nav.id);
                const activeCount = subs.filter((s) =>
                  perms.includes(s.id),
                ).length;
                const availableSubs = subs.filter((s) =>
                  parentPerms.includes(s.id),
                );

                return (
                  <div
                    key={nav.id}
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      border: vis
                        ? "1px solid rgba(99,102,241,0.25)"
                        : "1px solid rgba(255,255,255,0.07)",
                      background: vis
                        ? "rgba(99,102,241,0.04)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleNav(nav.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          flexShrink: 0,
                          cursor: "pointer",
                          background: vis
                            ? "#6366f1"
                            : "rgba(255,255,255,0.05)",
                          border: vis
                            ? "1px solid #6366f1"
                            : "1px solid rgba(255,255,255,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {vis && <CheckCircle2 size={13} color="white" />}
                      </button>
                      {nav.icon}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: vis
                              ? "rgba(255,255,255,0.88)"
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {nav.label}
                        </div>
                        {vis && availableSubs.length > 0 && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(148,163,184,0.4)",
                              marginTop: 1,
                            }}
                          >
                            {activeCount}/{availableSubs.length} эрх
                          </div>
                        )}
                      </div>
                      {vis && availableSubs.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((prev) => {
                              const n = new Set(prev);
                              n.has(nav.id) ? n.delete(nav.id) : n.add(nav.id);
                              return n;
                            })
                          }
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: 10,
                            color: "rgba(148,163,184,0.5)",
                          }}
                        >
                          {isExpanded ? "Хаах" : "Тохируулах"}
                          {isExpanded ? (
                            <ChevronDown size={10} />
                          ) : (
                            <ChevronRight size={10} />
                          )}
                        </button>
                      )}
                    </div>

                    {vis && isExpanded && availableSubs.length > 1 && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          padding: "8px 12px 10px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 5,
                          }}
                        >
                          {availableSubs.map((sub) => {
                            const checked = perms.includes(sub.id);
                            const isView = sub.id === `${nav.id}.view`;
                            return (
                              <div
                                key={sub.id}
                                onClick={() => !isView && toggleSub(sub.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 10,
                                  padding: "7px 9px",
                                  borderRadius: 10,
                                  cursor: isView ? "default" : "pointer",
                                  background: checked
                                    ? "rgba(99,102,241,0.08)"
                                    : "rgba(255,255,255,0.02)",
                                  border: checked
                                    ? "1px solid rgba(99,102,241,0.18)"
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
                                      : "rgba(255,255,255,0.05)",
                                    border: checked
                                      ? "1px solid #6366f1"
                                      : "1px solid rgba(255,255,255,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {checked && (
                                    <CheckCircle2 size={10} color="white" />
                                  )}
                                </div>
                                <div>
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
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: 46,
                borderRadius: 12,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {loading
                ? "Хадгалж байна..."
                : mode === "create"
                  ? "Үүсгэх"
                  : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubAdminsTab({
  myPerms,
  showToast,
}: {
  myPerms: string[];
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [target, setTarget] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [delLoad, setDelLoad] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/super-admins?role=sub_admin`, {
        headers: authH(),
      });
      const d = await res.json();
      if (d.success) setAdmins(d.admins ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!delId) return;
    setDelLoad(true);
    try {
      const res = await fetch(`${API}/api/super-admins/${delId}`, {
        method: "DELETE",
        headers: authH(),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAdmins((p) => p.filter((a) => a.id !== delId));
      showToast("Амжилттай устгагдлаа");
      setDelId(null);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDelLoad(false);
    }
  };

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${a.last_name ?? ""} ${a.first_name ?? ""} ${a.email}`
        .toLowerCase()
        .includes(q)
    );
  });

  // Define NAV_PERMS locally to avoid reference issues
  const localNavPerms = [
    { id: "dashboard", label: "Хянах самбар", icon: <BarChart3 size={18} /> },
    { id: "notifications", label: "Мэдэгдэл", icon: <Bell size={18} /> },
    { id: "companies", label: "Компаниуд", icon: <Building2 size={18} /> },
    { id: "individuals", label: "Хувь хүн", icon: <Users size={18} /> },
    { id: "announcements", label: "Зарлалууд", icon: <FileText size={18} /> },
  ];

  return (
    <>
      {(modal === "create" || modal === "edit") && (
        <SubAdminModal
          mode={modal}
          admin={target}
          parentPerms={myPerms}
          onClose={() => {
            setModal(null);
            setTarget(null);
          }}
          onSave={() => {
            setModal(null);
            setTarget(null);
            load();
            showToast(modal === "create" ? "Үүсгэлээ" : "Хадгаллаа");
          }}
        />
      )}

      {delId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setDelId(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#0d1526",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 24,
              padding: 28,
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
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={24} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Устгах уу?
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.5)",
                  marginTop: 6,
                }}
              >
                Энэ брокерыг бүрмөсөн устгана
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDelId(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(148,163,184,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Болих
              </button>
              <button
                onClick={handleDelete}
                disabled={delLoad}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {delLoad ? (
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
      )}

      <div
        className="page-in"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
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
                color: "#64748b",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, и-мэйл хайх..."
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13,
                color: "white",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.background = "rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.04)";
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={load}
              style={{
                padding: "9px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(148,163,184,0.7)";
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: loading ? "spin 1s linear infinite" : undefined,
                }}
              />{" "}
              Дахин ачаалах
            </button>
            <button
              onClick={() => {
                setTarget(null);
                setModal("create");
              }}
              style={{
                padding: "9px 20px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(99,102,241,0.3)";
              }}
            >
              <Plus size={16} /> Шинэ Брокер
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "rgba(12,16,35,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {loading ? (
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
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 700,
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
                    <Th h="И-мэйл" />
                    <Th h="Эрхүүд" />
                    <Th h="Статус" />
                    <Th h="" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        <ShieldCheck
                          size={48}
                          style={{
                            color: "rgba(148,163,184,0.15)",
                            margin: "0 auto 12px",
                            display: "block",
                          }}
                        />
                        <p style={{ margin: 0 }}>Брокер байхгүй байна</p>
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 12,
                            color: "rgba(148,163,184,0.25)",
                          }}
                        >
                          Шинэ брокер нэмж эрх хуваарилна уу
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((adminItem, index) => {
                      const adminPerms = parsePerms(adminItem.permissions);
                      const navCount = localNavPerms.filter(
                        (navItem) =>
                          adminPerms.includes(`${navItem.id}.view`) ||
                          (navItem.id === "dashboard" &&
                            (adminPerms.includes("dashboard.view") ||
                              adminPerms.includes("dashboard"))),
                      ).length;
                      const colorsList = [
                        "#6366f1",
                        "#8b5cf6",
                        "#06b6d4",
                        "#10b981",
                      ];
                      const avatarColor = colorsList[index % colorsList.length];
                      return (
                        <tr
                          key={adminItem.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {/* Name Column */}
                          <td style={{ padding: "14px 16px" }}>
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
                                  borderRadius: 12,
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
                                  adminItem.first_name?.[0] ??
                                  adminItem.email[0]
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
                                  {adminItem.last_name} {adminItem.first_name}
                                </div>
                                {adminItem.company_name && (
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "rgba(148,163,184,0.45)",
                                      marginTop: 2,
                                    }}
                                  >
                                    {adminItem.company_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email Column */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              color: "rgba(148,163,184,0.6)",
                            }}
                          >
                            {adminItem.email}
                          </td>

                          {/* Permissions Count Column */}
                          <td style={{ padding: "14px 16px" }}>
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
                                / {localNavPerms.length}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "rgba(148,163,184,0.3)",
                                }}
                              >
                                цэс
                              </span>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td style={{ padding: "14px 16px" }}>
                            <Badge s={adminItem.status} />
                          </td>

                          {/* Actions Column */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => {
                                  setTarget(adminItem);
                                  setModal("edit");
                                }}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 8,
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(99,102,241,0.15)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(99,102,241,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.05)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(255,255,255,0.08)";
                                }}
                              >
                                <Pencil
                                  size={13}
                                  style={{ color: "#a5b4fc" }}
                                />
                              </button>
                              <button
                                onClick={() => setDelId(adminItem.id)}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 8,
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(239,68,68,0.15)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(239,68,68,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.05)";
                                  e.currentTarget.style.borderColor =
                                    "rgba(255,255,255,0.08)";
                                }}
                              >
                                <Trash2
                                  size={13}
                                  style={{ color: "#f87171" }}
                                />
                              </button>
                            </div>
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
    </>
  );
}

// Mini Admin Dashboard Component
export default function MiniAdminDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [myPerms, setMyPerms] = useState<string[]>([]);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [nav, setNav] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pSearch, setPSearch] = useState("");
  const [pStatus, setPStatus] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [unread, setUnread] = useState(0);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const raw =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user");
    if (!tok() || !raw) {
      router.replace("/login");
      return;
    }
    try {
      const cached = JSON.parse(raw);
      if (cached.role === "super_admin") {
        router.replace("/dashboard/admin");
        return;
      }
      setIsSubAdmin(!!cached.parent_id);
      setMe(cached);
      setMyPerms([
        ...new Set([...parsePerms(cached.permissions), "dashboard.view"]),
      ]);
    } catch {
      router.replace("/login");
      return;
    }

    const t2 =
      localStorage.getItem("super_admin_token") ||
      localStorage.getItem("token") ||
      "";
    const aId2 = (() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem("super_admin_user") ||
              localStorage.getItem("user") ||
              "{}",
          )?.id ?? "guest"
        );
      } catch {
        return "guest";
      }
    })();
    const readSet2 = new Set(
      (() => {
        try {
          return JSON.parse(localStorage.getItem(`notif_read_${aId2}`) || "[]");
        } catch {
          return [];
        }
      })(),
    );
    fetch(`${API}/api/notifications?limit=100&_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${t2}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const count = (d.notifications ?? []).filter(
            (n: any) => !readSet2.has(n.id),
          ).length;
          setUnread(count);
        }
      })
      .catch(() => {});

    fetch(`${API}/api/super-admins/me`, { headers: authH() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.admin) {
          const key = localStorage.getItem("super_admin_user")
            ? "super_admin_user"
            : "user";
          localStorage.setItem(key, JSON.stringify(d.admin));
          if (d.admin.role === "super_admin") {
            router.replace("/dashboard/admin");
            return;
          }
          setIsSubAdmin(!!d.admin.parent_id);
          setMe(d.admin);
          setMyPerms([
            ...new Set([...parsePerms(d.admin.permissions), "dashboard.view"]),
          ]);
        }
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    const onFocus = () => {
      if (!tok()) return;
      fetch(`${API}/api/super-admins/me`, { headers: authH() })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.admin) {
            const key = localStorage.getItem("super_admin_user")
              ? "super_admin_user"
              : "user";
            localStorage.setItem(key, JSON.stringify(d.admin));
            setIsSubAdmin(!!d.admin.parent_id);
            setMe(d.admin);
            setMyPerms([
              ...new Set([
                ...parsePerms(d.admin.permissions),
                "dashboard.view",
              ]),
            ]);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const canNav = (id: NavId) => {
    if (!me) return false;
    if (id === "dashboard") return true;
    if (id === "sub-admins") return true;
    return (
      myPerms.some((p) => p.startsWith(`${id}.`)) ||
      myPerms.includes(id as string)
    );
  };
  const can = (p: string) => myPerms.includes(p);

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        limit: "50",
        ...(pStatus ? { status: pStatus } : {}),
      });
      const res = await fetch(`${API}/api/persons?${p}`, { headers: authH() });
      const d = await res.json();
      if (d.success) setPersons(d.persons ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [pStatus]);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/organizations?limit=50`, {
        headers: authH(),
      });
      const d = await res.json();
      if (d.success) setCompanies(d.organizations ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!me) return;
    if (nav === "dashboard" || nav === "individuals") fetchPersons();
    if (nav === "dashboard" || nav === "companies") fetchCompanies();
  }, [nav, me]);
  useEffect(() => {
    if (nav === "individuals") fetchPersons();
  }, [pStatus]);

  if (!me) return null;

  const ini = (me.email?.[0] ?? "A").toUpperCase();
  const nm =
    [me.first_name, me.last_name].filter(Boolean).join(" ") || me.email;

  const NAV_ITEMS = [
    {
      id: "dashboard" as NavId,
      icon: <BarChart3 size={18} />,
      label: "Хянах самбар",
      perm: "dashboard",
      badge: 0,
    },
    {
      id: "notifications" as NavId,
      icon: <Bell size={18} />,
      label: "Мэдэгдэл",
      perm: "notifications",
      badge: unread,
    },
    {
      id: "companies" as NavId,
      icon: <Building2 size={18} />,
      label: "Компаниуд",
      perm: "companies",
      badge: 0,
    },
    {
      id: "individuals" as NavId,
      icon: <Users size={18} />,
      label: "Хувь хүн",
      perm: "individuals",
      badge: 0,
    },
    {
      id: "announcements" as NavId,
      icon: <FileText size={18} />,
      label: "Зарлалууд",
      perm: "announcements",
      badge: 0,
    },
    {
      id: "sub-admins" as NavId,
      icon: <ShieldCheck size={18} />,
      label: "Брокерууд",
      perm: "sub-admins",
      badge: 0,
    },
  ].filter((n) => {
    if (n.id === "dashboard") return true;
    if (n.id === "sub-admins") return !isSubAdmin;
    return myPerms.some((p) => p.startsWith(`${n.perm}.`));
  });

  const pendingCount = persons.filter((p) => p.status === "pending").length;
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

  const logout = () => {
    ["super_admin_token", "super_admin_user", "token", "user"].forEach((k) =>
      localStorage.removeItem(k),
    );
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
        *,*::before,*::after{box-sizing:border-box;font-family:'Inter',sans-serif;}
        body{margin:0;background:#0a0e1a;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:99px}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .nav-item{display:flex;align-items:center;gap:12px;padding:10px 16px;margin:4px 12px;border-radius:12px;cursor:pointer;transition:all 0.3s;color:rgba(255,255,255,0.4);position:relative;overflow:hidden}
        .nav-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08));transition:width 0.3s;z-index:0}
        .nav-item:hover::before{width:100%}
        .nav-item:hover{color:rgba(255,255,255,0.85);transform:translateX(4px)}
        .nav-item.active{background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));color:#a5b4fc;border-left:2px solid #6366f1}
        .nav-item>*{position:relative;z-index:1}
        .glass-card{background:rgba(12,16,35,0.8);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;transition:all 0.3s}
        .glass-card:hover{border-color:rgba(99,102,241,0.25);box-shadow:0 8px 32px rgba(99,102,241,0.08)}
        .animate-fade-up{animation:fadeInUp 0.4s ease forwards}
        @media (max-width:1024px){.mobile-menu-btn{display:flex!important}.sidebar{transform:translateX(-100%);transition:transform 0.3s}.sidebar.open{transform:translateX(0)}.main-content{margin-left:0!important}}
      `}</style>

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
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div
        style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a" }}
      >
        {/* Sidebar */}
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
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
                <img
                  src="/images/logosolo.png"
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
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
                  Admin
                </div>
              </div>
            </div>
          </div>

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
                  setSidebarOpen(false);
                  if (item.id === "notifications") setUnread(0);
                }}
              >
                {item.icon}
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                  {item.label}
                </span>
                {item.badge > 0 && (
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
          </nav>

          <div
            style={{
              padding: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              onClick={logout}
              className="nav-item"
              style={{ color: "rgba(239,68,68,0.6)", margin: 0 }}
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
          onClick={() => setSidebarOpen(!sidebarOpen)}
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
          {sidebarOpen ? (
            <X size={20} color="white" />
          ) : (
            <Menu size={20} color="white" />
          )}
        </button>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
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
            transition: "margin-left 0.3s",
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
              {pendingCount > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 30,
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f59e0b",
                    }}
                  />
                  <span
                    style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b" }}
                  >
                    {pendingCount} хүлээгдэж буй
                  </span>
                </div>
              )}
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

          <main
            style={{ padding: "28px 32px", minHeight: "calc(100vh - 70px)" }}
          >
            {/* Dashboard */}
            {nav === "dashboard" && (
              <div
                className="animate-fade-up"
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 20,
                  }}
                >
                  {[
                    {
                      label: "Нийт хувь хүн",
                      value: persons.length,
                      icon: Users,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Хүлээгдэж буй",
                      value: pendingCount,
                      icon: Clock,
                      color: "#f59e0b",
                    },
                    {
                      label: "Идэвхтэй",
                      value: persons.filter((p) => p.status === "active")
                        .length,
                      icon: CheckCircle2,
                      color: "#10b981",
                    },
                    {
                      label: "Байгууллага",
                      value: companies.length,
                      icon: Building2,
                      color: "#06b6d4",
                    },
                  ].map(({ label, value, icon: Icon, color }, i) => (
                    <div
                      key={i}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(18,22,45,0.95), rgba(12,16,35,0.98))",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 24,
                        padding: "20px 22px",
                        transition: "all 0.35s",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = `${color}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.06)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
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
                        {value}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.45)",
                          marginTop: 8,
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {pendingCount > 0 && (
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
                          Хянах шаардлагатай
                        </h3>
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.35)",
                            marginTop: 2,
                          }}
                        >
                          Хүлээгдэж буй хүсэлтүүд
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: 30,
                          background: "rgba(245,158,11,0.1)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        {pendingCount} хүсэлт
                      </span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            <Th h="Нэр" />
                            <Th h="Регистр" />
                            <Th h="И-мэйл" />
                            <Th h="Огноо" />
                          </tr>
                        </thead>
                        <tbody>
                          {persons
                            .filter((p) => p.status === "pending")
                            .slice(0, 5)
                            .map((p, i) => {
                              const nm =
                                [p.last_name, p.first_name]
                                  .filter(Boolean)
                                  .join(" ") || p.email;
                              const color = colors[i % colors.length];
                              return (
                                <tr
                                  key={p.id}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255,255,255,0.04)",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "rgba(255,255,255,0.03)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "transparent")
                                  }
                                >
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
                                          borderRadius: 10,
                                          background: `${color}15`,
                                          border: `1px solid ${color}25`,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: 12,
                                          fontWeight: 700,
                                          color,
                                        }}
                                      >
                                        {(
                                          p.first_name?.[0] ?? p.email[0]
                                        ).toUpperCase()}
                                      </div>
                                      <span
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 500,
                                          color: "rgba(255,255,255,0.8)",
                                        }}
                                      >
                                        {nm}
                                      </span>
                                    </div>
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px 16px",
                                      fontSize: 11,
                                      fontFamily: "monospace",
                                      color: "rgba(255,255,255,0.4)",
                                    }}
                                  >
                                    {p.register_number || "—"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px 16px",
                                      fontSize: 12,
                                      color: "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    {p.email}
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px 16px",
                                      fontSize: 11,
                                      color: "rgba(255,255,255,0.35)",
                                    }}
                                  >
                                    {p.created_at
                                      ? new Date(
                                          p.created_at,
                                        ).toLocaleDateString("mn-MN")
                                      : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Tabs */}
            {nav === "notifications" && canNav("notifications") && (
              <NotificationsTab
                showToast={showToast}
                onUnreadChange={(c) => setUnread(c)}
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
                  personsLoading: loading,
                  personsError: "",
                  fetchPersons,
                  showToast,
                  canEdit: can("individuals.edit"),
                  canEditStatus: can("individuals.edit_status"),
                  canDelete: can("individuals.delete"),
                }}
                search={pSearch}
                setSearch={setPSearch}
                status={pStatus}
                setStatus={setPStatus}
                onDetail={() => {}}
              />
            )}
            {nav === "companies" && canNav("companies") && (
              <CompaniesTab
                data={{
                  companies,
                  setCompanies,
                  companiesLoading: false,
                  fetchCompanies,
                  showToast,
                  canEdit: can("companies.edit"),
                  canEditStatus: can("companies.edit_status"),
                  canDelete: can("companies.delete"),
                }}
              />
            )}
            {nav === "sub-admins" && !isSubAdmin && (
              <SubAdminsTab myPerms={myPerms} showToast={showToast} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
