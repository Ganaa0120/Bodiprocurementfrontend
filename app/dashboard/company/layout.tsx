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
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const NAV = [
  { href:"/dashboard/company",               label:"Хянах самбар",         icon:LayoutDashboard },
  { href:"/dashboard/company/announcements", label:"Зарлалууд",            icon:Megaphone       },
  { href:"/dashboard/company/applications",  label:"Миний хүсэлтүүд",      icon:FileText        },
  { href:"/dashboard/company/notifications", label:"Мэдэгдэл",             icon:Bell            },
  { href:"/dashboard/company/profile",       label:"Байгууллагын мэдээлэл",icon:User            },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed.role !== "company") {
        router.push("/login");
        return;
      }
      setUser(parsed);
    }

    // ✅ Статус шинэчлэх
    const refreshStatus = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/organizations/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && (d.organization || d.user)) {
            const fresh = d.organization || d.user;
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            const updated = {
              ...stored,
              status: fresh.status,
              return_reason: fresh.return_reason,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser({ ...updated });
          }
        })
        .catch(() => {});
    };

    refreshStatus();
    const interval = setInterval(refreshStatus, 12 * 60 * 60 * 1000); // 12 цаг
    window.addEventListener("focus", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const s = user?.status;
  const isActive = s === "active" || s === "approved";
  const isReturned = s === "returned";

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
        * { box-sizing:border-box; font-family:'Inter',sans-serif; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px}
        .nav-link { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:500;color:#64748b;transition:all .15s;margin-bottom:2px; }
        .nav-link:hover { background:#f1f5f9;color:#1e293b; }
        .nav-link.active { background:linear-gradient(135deg,#6366f1,#818cf8);color:white;box-shadow:0 4px 12px rgba(99,102,241,0.3); }
        @media(max-width:1024px){.sidebar{transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}}
      `}</style>

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
      <aside
        className={cn("sidebar", open && "open")}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: "white",
          borderRight: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          transition: "transform .3s",
          boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
        }}
      >
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
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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

        {/* User */}
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
                background: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#6366f1",
              }}
            >
              {user?.company_name?.[0] || "?"}
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
                {user?.company_name || "Байгааллага"}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  margin: 0,
                  fontFamily: "monospace",
                }}
              >
                {user?.supplier_number || "—"}
              </p>
            </div>
          </div>

          {/* ✅ Статус badge — returned ч харуулна */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 500,
              background: isActive
                ? "#ecfdf5"
                : isReturned
                  ? "#fef2f2"
                  : "#fffbeb",
              color: isActive ? "#059669" : isReturned ? "#dc2626" : "#d97706",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isActive
                  ? "#10b981"
                  : isReturned
                    ? "#ef4444"
                    : "#f59e0b",
              }}
            />
            {isActive
              ? "Баталгаажсан"
              : isReturned
                ? "Буцаагдсан"
                : "Хянагдаж байна"}
          </span>

          {/* ✅ Буцаасан шалтгаан sidebar-д харуулна */}
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
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#cbd5e1",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 8px",
              marginBottom: 6,
            }}
          >
            Үндсэн
          </p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn("nav-link", active && "active")}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={13} />}
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
      <div
        style={{
          flex: 1,
          marginLeft: 240,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
        className="main-content"
      >
        <style>{`@media(max-width:1024px){.main-content{margin-left:0!important}}`}</style>

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
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: "none",
              padding: 6,
              borderRadius: 8,
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
            className="mobile-menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <style>{`@media(max-width:1024px){.mobile-menu{display:flex!important}}`}</style>
          <div style={{ flex: 1 }} />

          {/* ✅ Topbar-д статус badge */}
          {isReturned && (
            <Link
              href="/dashboard/company/profile"
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
                  cursor: "pointer",
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                }}
              >
                ⚠️ Буцаагдсан — профайл засах
              </span>
            </Link>
          )}

          <Link
            href="/dashboard/company/notifications"
            style={{
              padding: "7px",
              borderRadius: 9,
              border: "1px solid #f1f5f9",
              background: "#fafafa",
              display: "flex",
              textDecoration: "none",
            }}
          >
            <Bell size={16} style={{ color: "#64748b" }} />
          </Link>
          <Link
            href="/dashboard/company/profile"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              color: "white",
            }}
          >
            {user?.company_name?.[0] || "?"}
          </Link>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
