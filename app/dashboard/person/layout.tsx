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
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string, any> = {
  new: {
    label: "Шинэ",
    dot: "#818cf8",
    bg: "rgba(99,102,241,0.12)",
    color: "#a5b4fc",
    icon: Sparkles,
  },
  pending: {
    label: "Хянагдаж байна",
    dot: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    icon: Zap,
  },
  active: {
    label: "Баталгаажсан",
    dot: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    icon: Shield,
  },
  approved: {
    label: "Баталгаажсан",
    dot: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    icon: Shield,
  },
  returned: {
    label: "Буцаагдсан",
    dot: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    icon: X,
  },
  rejected: {
    label: "Татгалзсан",
    dot: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    color: "#f87171",
    icon: X,
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
    window.addEventListener("user-updated", refreshUser);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshUser);
      window.removeEventListener("user-updated", refreshUser);
    };
  }, []);

  const pStatus =
    STATUS_CFG[user?.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
  const StatusIcon = pStatus.icon;
  const isReturned = user?.status === "returned";
  const initials =
    [user?.last_name?.[0], user?.first_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const NAV = [
    { href: "/dashboard/person", label: "Хянах самбар", icon: LayoutDashboard },
    { href: "/dashboard/person/announcements", label: "Зарлалууд", icon: Megaphone },
    { href: "/dashboard/person/applications", label: "Миний хүсэлтүүд", icon: ClipboardList },
    { href: "/dashboard/person/notifications", label: "Мэдэгдэл", icon: Bell, badge: unreadCount },
    { href: "/dashboard/person/profile", label: "Хувийн мэдээлэл", icon: User },
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
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a1020 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
        
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 2px 0;
          border-radius: 12px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: rgba(148,163,184,0.7);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .nav-link:hover {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
        }
        
        .nav-link.active {
          background: rgba(99,102,241,0.1);
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.2);
        }
        
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #6366f1;
          border-radius: 0 3px 3px 0;
          box-shadow: 0 0 10px rgba(99,102,241,0.5);
        }
        
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: rgba(13,21,38,0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mobile-menu-btn { display: none; }
        
        .main-area {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 8px 0 40px rgba(0, 0, 0, 0.6);
          }
          .mobile-menu-btn { display: flex !important; }
          .main-area { margin-left: 0 !important; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.5); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 35,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                animation: "glow 3s ease-in-out infinite",
              }}
            >
              <Building2 size={17} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0, letterSpacing: "-0.01em" }}>
                Bodi Group
              </p>
              <p style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", margin: 0, marginTop: 1 }}>
                Нийлүүлэгч портал
              </p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 600,
                color: "#a5b4fc",
                overflow: "hidden",
                flexShrink: 0,
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
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {[user?.last_name, user?.first_name].filter(Boolean).join(" ") || "Хэрэглэгч"}
              </p>
              <p style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                {user?.supplier_number || "—"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 600,
              background: pStatus.bg,
              color: pStatus.color,
              border: `1px solid ${pStatus.color}20`,
            }}
          >
            <StatusIcon size={11} />
            {pStatus.label}
          </div>

          {/* Return reason */}
          {isReturned && user?.return_reason && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                fontSize: 11,
                color: "#fca5a5",
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 600, marginRight: 4 }}>⚠️ Буцаасан шалтгаан:</span>
              {user.return_reason}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(148,163,184,0.4)",
              letterSpacing: "0.1em",
              padding: "0 14px",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Цэс
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
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && badge > 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#ef4444",
                      color: "white",
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
                {active && (
                  <ChevronRight size={14} style={{ color: "#818cf8", opacity: 0.6 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(148,163,184,0.5)",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(239,68,68,0.08)";
              el.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "rgba(148,163,184,0.5)";
            }}
          >
            <LogOut size={17} />
            <span>Гарах</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-area">
        {/* Topbar */}
        <header
          style={{
            height: 60,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "rgba(13,21,38,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            className="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            style={{
              padding: 8,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(148,163,184,0.6)",
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              {currentPage?.label || "Хянах самбар "}
            </p>
            {currentPage?.icon && (
              <currentPage.icon size={14} style={{ color: "rgba(148,163,184,0.4)" }} />
            )}
          </div>

          {/* Returned alert */}
          {isReturned && (
            <Link
              href="/dashboard/person/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                fontSize: 11,
                fontWeight: 500,
                color: "#fca5a5",
                textDecoration: "none",
                animation: "pulse 2s infinite",
              }}
            >
              <span>⚠️</span> Профайл засах
            </Link>
          )}

          {/* Notifications */}
          <Link
            href="/dashboard/person/notifications"
            style={{
              padding: 8,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <Bell size={17} style={{ color: "rgba(148,163,184,0.6)" }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ef4444",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #0d1526",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link href="/dashboard/person/profile">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#a5b4fc",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.boxShadow = "none";
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

        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}