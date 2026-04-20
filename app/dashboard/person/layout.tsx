"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Building2,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG = {
  new: {
    label: "Бүртгэл үүсгэх",
    dot: "#0ea5e9",
    bg: "#f0f9ff",
    color: "#0369a1",
  },
  pending: {
    label: "Хянагдаж байна",
    dot: "#f59e0b",
    bg: "#fffbeb",
    color: "#d97706",
  },
  active: {
    label: "Баталгаажсан",
    dot: "#10b981",
    bg: "#ecfdf5",
    color: "#059669",
  },
  approved: {
    label: "Баталгаажсан",
    dot: "#10b981",
    bg: "#ecfdf5",
    color: "#059669",
  },
  returned: {
    label: "Буцаагдсан",
    dot: "#ef4444",
    bg: "#fef2f2",
    color: "#dc2626",
  },
  rejected: {
    label: "Татгалзсан",
    dot: "#ef4444",
    bg: "#fef2f2",
    color: "#dc2626",
  },
};

export default function PersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role && parsed.role !== "individual") {
          router.push("/login");
          return;
        }
        setUser(parsed);
      } catch {
        router.push("/login");
        return;
      }
    }

    const refreshUser = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/persons/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && (d.person || d.user)) {
            const fresh = d.person || d.user;
            const stored = (() => {
              try {
                return JSON.parse(localStorage.getItem("user") || "{}");
              } catch {
                return {};
              }
            })();
            const updated = { ...stored, ...fresh, role: "individual" };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
          }
        })
        .catch(() => {});
    };

    const fetchNotifications = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/notifications/mine`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          const list = d.notifications ?? d.data ?? [];
          setUnreadCount(list.filter((n: any) => !n.is_read).length);
        })
        .catch(() => {});
    };

    refreshUser();
    fetchNotifications();

    const interval = setInterval(refreshUser, 30 * 60 * 1000);
    window.addEventListener("focus", refreshUser);
    window.addEventListener("user-updated", refreshUser); // ✅
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshUser);
      window.removeEventListener("user-updated", refreshUser); // ✅
    };
  }, []);

  const pStatus =
    STATUS_CFG[user?.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
  const isReturned = user?.status === "returned";
  const initials =
    [user?.last_name?.[0], user?.first_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const NAV = [
    {
      href: "/dashboard/person",
      label: "Хянах самбар",
      icon: LayoutDashboard,
      badge: 0,
    },
    {
      href: "/dashboard/person/announcements",
      label: "Зарлалууд",
      icon: Megaphone,
      badge: 0,
    },
    {
      href: "/dashboard/person/applications",
      label: "Миний хүсэлтүүд",
      icon: ClipboardList,
      badge: 0,
    },
    {
      href: "/dashboard/person/notifications",
      label: "Мэдэгдэл",
      icon: Bell,
      badge: unreadCount,
    },
    {
      href: "/dashboard/person/profile",
      label: "Хувийн мэдээлэл",
      icon: User,
      badge: 0,
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const currentPage = NAV.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/dashboard/person" && pathname.startsWith(n.href)),
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f8f9fc",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;font-family:'Inter',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .nav-lnk{
          display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;
          text-decoration:none;font-size:13px;font-weight:500;color:#64748b;
          transition:all .15s;margin-bottom:2px;
        }
        .nav-lnk:hover{background:#f1f5f9;color:#1e293b;}
        .nav-lnk.active{
          background:linear-gradient(135deg,#6366f1,#818cf8);color:white;
          box-shadow:0 4px 12px rgba(99,102,241,0.3);
        }
        .sidebar-wrap{
          position:fixed;top:0;left:0;bottom:0;width:240px;
          background:white;border-right:1px solid #f1f5f9;
          display:flex;flex-direction:column;z-index:40;
          transition:transform .3s;box-shadow:4px 0 24px rgba(0,0,0,0.04);
        }
        .mob-btn{display:none}
        .main-wrap{flex:1;margin-left:240px;display:flex;flex-direction:column;min-height:100vh;}
        @media(max-width:1024px){
          .sidebar-wrap{transform:translateX(-100%)}
          .sidebar-wrap.open{transform:translateX(0)}
          .mob-btn{display:flex!important}
          .main-wrap{margin-left:0!important}
        }
      `}</style>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar-wrap ${open ? "open" : ""}`}>
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid #f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                flexShrink: 0,
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={16} color="white" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Bodi Group
              </p>
              <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                Нийлүүлэгч портал
              </p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div
          style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                overflow: "hidden",
                background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#6366f1",
              }}
            >
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {[user?.last_name, user?.first_name]
                  .filter(Boolean)
                  .join(" ") || "Хэрэглэгч"}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {user?.supplier_number || user?.email || "—"}
              </p>
            </div>
          </div>

          {/* Status */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 500,
              background: pStatus.bg,
              color: pStatus.color,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: pStatus.dot,
                animation:
                  user?.status === "pending" ? "pulse 1.5s infinite" : "none",
              }}
            />
            {pStatus.label}
          </span>

          {/* Буцаасан шалтгаан */}
          {isReturned && user?.return_reason && (
            <div
              style={{
                marginTop: 8,
                padding: "7px 10px",
                borderRadius: 8,
                background: "#fef2f2",
                border: "1px solid #fecaca",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: "#dc2626",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                ⚠️ {user.return_reason}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#cbd5e1",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              padding: "0 8px",
              marginBottom: 6,
            }}
          >
            Үндсэн
          </p>
          {NAV.map(({ href, label, icon: Icon, badge }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard/person" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`nav-lnk ${active ? "active" : ""}`}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: active ? "rgba(255,255,255,0.3)" : "#ef4444",
                      color: "white",
                      lineHeight: "16px",
                    }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : active ? (
                  <ChevronRight size={13} />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid #f8fafc" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#94a3b8",
              transition: "all .15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fef2f2";
              (e.currentTarget as HTMLElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
              (e.currentTarget as HTMLElement).style.color = "#94a3b8";
            }}
          >
            <LogOut size={15} /> Системээс гарах
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-wrap">
        {/* Topbar */}
        <header
          style={{
            height: 56,
            background: "white",
            borderBottom: "1px solid #f1f5f9",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 20,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Mobile menu button */}
          <button
            className="mob-btn"
            onClick={() => setOpen(!open)}
            style={{
              padding: 6,
              borderRadius: 8,
              border: "none",
              background: "none",
              cursor: "pointer",
              alignItems: "center",
            }}
          >
            {open ? (
              <X size={18} style={{ color: "#64748b" }} />
            ) : (
              <Menu size={18} style={{ color: "#64748b" }} />
            )}
          </button>

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {currentPage?.label || "Хянах самбар"}
            </p>
          </div>

          {/* Буцаагдсан badge */}
          {isReturned && (
            <Link
              href="/dashboard/person/profile"
              style={{ textDecoration: "none" }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                }}
              >
                ⚠️ Буцаагдсан — профайл засах
              </span>
            </Link>
          )}

          {/* Bell */}
          <Link
            href="/dashboard/person/notifications"
            style={{
              padding: "7px",
              borderRadius: 9,
              border: "1px solid #f1f5f9",
              background: "#fafafa",
              display: "flex",
              textDecoration: "none",
              position: "relative",
            }}
          >
            <Bell size={16} style={{ color: "#64748b" }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid white",
                }}
              />
            )}
          </Link>

          {/* Avatar */}
          <Link
            href="/dashboard/person/profile"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                overflow: "hidden",
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "white",
              }}
            >
              {user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
          </Link>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
