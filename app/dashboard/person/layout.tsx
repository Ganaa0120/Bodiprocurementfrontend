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
  const isReturned = user?.status === "returned";
  const initials =
    [user?.last_name?.[0], user?.first_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const NAV = [
    { href: "/dashboard/person", label: "Хянах самбар", icon: LayoutDashboard, badge: 0 },
    { href: "/dashboard/person/announcements", label: "Зарлалууд", icon: Megaphone, badge: 0 },
    { href: "/dashboard/person/applications", label: "Миний хүсэлтүүд", icon: ClipboardList, badge: 0 },
    { href: "/dashboard/person/notifications", label: "Мэдэгдэл", icon: Bell, badge: unreadCount },
    { href: "/dashboard/person/profile", label: "Хувийн мэдээлэл", icon: User, badge: 0 },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const currentPage = NAV.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/dashboard/person" && pathname.startsWith(n.href))
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f6f8",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #eef2f6;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 99px;
        }
        
        /* Minimal nav link */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          margin: 2px 0;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          color: #5a6874;
          transition: all 0.15s ease;
        }
        
        .nav-link:hover {
          background: #f0f2f5;
          color: #1e2a3a;
        }
        
        .nav-link.active {
          background: #eef2ff;
          color: #4f46e5;
        }
        
        .nav-link.active svg {
          color: #4f46e5;
        }
        
        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: white;
          border-right: 1px solid #e8edf2;
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.2s ease;
        }
        
        .mobile-menu-btn {
          display: none;
        }
        
        .main-area {
          flex: 1;
          margin-left: 260px;
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
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .main-area {
            margin-left: 0 !important;
          }
        }
        
        /* Topbar minimal */
        .topbar {
          background: white;
          border-bottom: 1px solid #e8edf2;
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
            background: "rgba(0, 0, 0, 0.3)",
          }}
        />
      )}

      {/* ── Sidebar (Minimal) ── */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid #eef2f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={15} color="white" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e2a3a",
                  margin: 0,
                }}
              >
                Bodi Group
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#8a99a8",
                  margin: 0,
                }}
              >
                Нийлүүлэгч портал
              </p>
            </div>
          </div>
        </div>

        {/* User info - minimal card */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eef2f6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "#4f46e5",
                overflow: "hidden",
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
                  color: "#1e2a3a",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {[user?.last_name, user?.first_name].filter(Boolean).join(" ") ||
                  "Хэрэглэгч"}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#8a99a8",
                  margin: "2px 0 0",
                }}
              >
                {user?.supplier_number || "—"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 99,
              fontSize: 10,
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
              }}
            />
            {pStatus.label}
          </div>

          {/* Return reason */}
          {isReturned && user?.return_reason && (
            <div
              style={{
                marginTop: 10,
                padding: "6px 10px",
                borderRadius: 8,
                background: "#fef2f2",
                fontSize: 10,
                color: "#dc2626",
                lineHeight: 1.4,
              }}
            >
              ⚠️ {user.return_reason}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#8a99a8",
              letterSpacing: "0.5px",
              padding: "0 8px",
              marginBottom: 8,
            }}
          >
            ЦЭС
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
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: 99,
                      background: "#ef4444",
                      color: "white",
                    }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "16px 12px 20px",
            borderTop: "1px solid #eef2f6",
          }}
        >
          <button
            onClick={logout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "#8a99a8",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#fef2f2";
              el.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "#8a99a8";
            }}
          >
            <LogOut size={16} />
            <span>Гарах</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-area">
        {/* Topbar */}
        <header
          className="topbar"
          style={{
            height: 56,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <button
            className="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            style={{
              padding: 6,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1e2a3a",
                margin: 0,
              }}
            >
              {currentPage?.label || "Хянах самбар"}
            </p>
          </div>

          {isReturned && (
            <Link
              href="/dashboard/person/profile"
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                background: "#fef2f2",
                fontSize: 11,
                fontWeight: 500,
                color: "#dc2626",
                textDecoration: "none",
              }}
            >
              ⚠️ Профайл засах
            </Link>
          )}

          <Link
            href="/dashboard/person/notifications"
            style={{
              padding: 6,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              display: "flex",
              position: "relative",
            }}
          >
            <Bell size={16} style={{ color: "#5a6874" }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            )}
          </Link>

          <Link href="/dashboard/person/profile">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#eef2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "#4f46e5",
              }}
            >
              {initials}
            </div>
          </Link>
        </header>

        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}