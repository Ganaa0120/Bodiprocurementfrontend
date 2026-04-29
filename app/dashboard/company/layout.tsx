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
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const NAV = [
  { href: "/dashboard/company", label: "Хянах самбар", icon: LayoutDashboard },
  { href: "/dashboard/company/announcements", label: "Зарлалууд", icon: Megaphone },
  { href: "/dashboard/company/applications", label: "Миний хүсэлтүүд", icon: FileText },
  { href: "/dashboard/company/notifications", label: "Мэдэгдэл", icon: Bell },
  { href: "/dashboard/company/profile", label: "Байгууллагын мэдээлэл", icon: User },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed.role !== "company") { router.push("/login"); return; }
      setUser(parsed);
    }

    const refreshStatus = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/organizations/me`, { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success && (d.organization || d.user)) {
            const fresh = d.organization || d.user;
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            const updated = { ...stored, status: fresh.status, return_reason: fresh.return_reason };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser({ ...updated });
          }
        })
        .catch(() => {});
    };

    refreshStatus();
    const interval = setInterval(refreshStatus, 12 * 60 * 60 * 1000);
    window.addEventListener("focus", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const s = user?.status;
  const isNew = s === "new";
  const isActive = s === "active" || s === "approved";
  const isReturned = s === "returned";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8f9fc", fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }

        .nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none; font-size: 13px; font-weight: 500;
          color: #64748b; transition: all .15s; margin-bottom: 2px;
        }
        .nav-link:hover { background: #f1f5f9; color: #1e293b; }
        .nav-link.active {
          background: #0072BC; color: white;
          box-shadow: 0 4px 12px rgba(0,114,188,0.3);
        }
        .nav-link.active:hover { background: #005a96; color: white; }

        /* Sidebar transform (drawer below 1024px) */
        .company-sidebar { transform: translateX(0); }
        @media (max-width: 1024px) {
          .company-sidebar { transform: translateX(-100%); }
          .company-sidebar.open { transform: translateX(0); }
          .company-main { margin-left: 0 !important; }
        }

        /* Mobile menu button */
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex !important; }
        }

        /* Topbar tightening */
        @media (max-width: 640px) {
          .company-topbar { padding: 0 12px !important; gap: 8px !important; }
          .company-main-area { padding: 14px 10px !important; }
          .company-returned-pill .pill-text { display: none; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .company-main-area { padding: 18px 16px !important; }
        }
      `}</style>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

   {/* ── Sidebar ── */}
<aside
  className={cn("company-sidebar", open && "open")}
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 268,
    background: "#0a1428",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
    transition: "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)",
    boxShadow: "12px 0 60px rgba(0, 0, 0, 0.4)",
    borderRight: "1px solid rgba(59, 155, 224, 0.18)",
  }}
>
  {/* Animated Background */}
  <div style={{
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background: `
      linear-gradient(135deg, 
        rgba(0, 114, 188, 0.12) 0%, 
        rgba(59, 155, 224, 0.08) 40%, 
        rgba(16, 185, 129, 0.06) 70%, 
        rgba(0, 114, 188, 0.10) 100%
      ),
      radial-gradient(circle at 25% 30%, rgba(59, 155, 224, 0.18) 0%, transparent 60%),
      radial-gradient(circle at 80% 70%, rgba(0, 114, 188, 0.15) 0%, transparent 55%)
    `,
    animation: "gradientShift 35s ease infinite",
    opacity: 0.92,
  }} />

  {/* Subtle Grid */}
  <div style={{
    position: "absolute",
    inset: 0,
    zIndex: 1,
    backgroundImage: `
      linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    animation: "subtleDrift 90s linear infinite",
    opacity: 0.65,
  }} />

  {/* Logo */}
  <div style={{ 
    padding: "28px 24px 20px", 
    borderBottom: "1px solid rgba(59,155,224,0.15)",
    zIndex: 3,
    position: "relative"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: "linear-gradient(135deg, #0072BC, #3b9be0, #60a5fa)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 25px rgba(59,155,224,0.6)",
        flexShrink: 0,
      }}>
        <Image src="/images/logosolo.png" alt="Logo" width={40} height={40} />
      </div>
      <div>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.025em", margin: 0 }}>
          Bodi Group
        </p>
        <p style={{ fontSize: "10.5px", color: "#64748b", margin: 0, letterSpacing: "1px" }}>
          SUPPLIER PORTAL
        </p>
      </div>
    </div>
  </div>

  {/* User Info */}
  <div style={{ 
    padding: "22px 24px", 
    borderBottom: "1px solid rgba(59,155,224,0.12)",
    zIndex: 3,
    position: "relative"
  }}>
    {/* ... User info хэвээр үлдээнэ (өмнөх кодтой ижил) ... */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "linear-gradient(135deg, #e0e7ff, #c4d0ff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px", fontWeight: 700, color: "#1e40af",
        boxShadow: "inset 0 3px 10px rgba(0,0,0,0.15)",
        border: "2px solid rgba(255,255,255,0.7)",
      }}>
        {user?.company_name?.[0] || "B"}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "14.5px", fontWeight: 600, color: "#f1f5f9", margin: 0 }}>{user?.company_name || "Байгууллага"}</p>
        <p style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>{user?.supplier_number || "SUP-••••••"}</p>
      </div>
    </div>

    {/* Status Badge - өмнөхтэй ижил */}
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "6px 14px", borderRadius: 9999, fontSize: "11.5px", fontWeight: 500,
      background: isActive ? "rgba(16,185,129,0.15)" : isReturned ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
      color: isActive ? "#4ade80" : isReturned ? "#f87171" : "#fbbf24",
      border: `1px solid ${isActive ? "rgba(74,222,128,0.4)" : isReturned ? "rgba(248,113,113,0.4)" : "rgba(251,191,36,0.4)"}`,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? "#4ade80" : isReturned ? "#f87171" : "#fbbf24", animation: isActive ? "pulse 2.5s infinite" : "none" }} />
      {isActive ? "Баталгаажсан" : isReturned ? "Буцаагдсан" : isNew ? "Шинэ бүртгэл" : "Хянагдаж байна"}
    </div>
  </div>

  {/* Navigation - 3D Active Effectтэй */}
  <nav style={{ flex: 1, padding: "20px 16px", overflowY: "auto", zIndex: 3, position: "relative" }}>
    <p style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", letterSpacing: "1.2px", textTransform: "uppercase", padding: "0 12px 10px", marginBottom: 6 }}>
      Үндсэн цэс
    </p>

    {NAV.map(({ href, label, icon: Icon }) => {
      const active = pathname === href;
      return (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "15px 18px",
            borderRadius: 16,
            color: active ? "#ffffff" : "#cbd5e1",
            fontSize: "14.2px",
            fontWeight: 500,
            marginBottom: 6,
            position: "relative",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", // 3D мэдрэмжтэй smooth
            transform: active ? "translateX(8px) scale(1.02)" : "translateX(0) scale(1)",
            boxShadow: active ? "0 10px 25px rgba(59,155,224,0.25)" : "none",
            overflow: "hidden",
          }}
        >
          {/* 3D Active Background */}
          {active && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(59,155,224,0.3), rgba(96,165,250,0.15))",
              zIndex: -1,
              borderRadius: 16,
            }} />
          )}

          {/* Left Glow Line */}
          {active && (
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              background: "linear-gradient(to bottom, #60a5fa, #3b9be0)",
              boxShadow: "4px 0 15px rgba(96,165,250,0.6)",
            }} />
          )}

          <Icon 
            size={19} 
            style={{ 
              flexShrink: 0,
              color: active ? "#ffffff" : "#94a3b8",
              transition: "all 0.35s ease",
              transform: active ? "scale(1.15)" : "scale(1)",
            }} 
          />

          <span style={{ 
            flex: 1, 
            transition: "all 0.35s ease",
            color: active ? "#ffffff" : "#cbd5e1"
          }}>
            {label}
          </span>

          {active && <ChevronRight size={17} style={{ color: "#ffffff", opacity: 0.9 }} />}
        </Link>
      );
    })}
  </nav>

  {/* Logout - өмнөхтэй ижил */}
  <div style={{ padding: "18px 20px", borderTop: "1px solid rgba(59,155,224,0.12)", zIndex: 3 }}>
    <button
      onClick={logout}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px", borderRadius: 14, border: "none",
        background: "rgba(248,113,113,0.1)", color: "#f87171",
        fontSize: "14px", fontWeight: 500, cursor: "pointer",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
    >
      <LogOut size={18} />
      Системээс гарах
    </button>
  </div>
</aside>

      {/* ── Main ── */}
      <div
        className="company-main"
        style={{
          flex: 1,
          marginLeft: 240,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          className="company-topbar"
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
            className="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            style={{
              padding: 7, borderRadius: 9,
              border: "1px solid #f1f5f9",
              background: "#fafafa",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu size={18} style={{ color: "#64748b" }} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }} />

          {isReturned && (
            <Link href="/dashboard/company/profile" style={{ textDecoration: "none" }}>
              <span
                className="company-returned-pill"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 99,
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: "#fef2f2", color: "#dc2626",
                  border: "1px solid #fecaca",
                  whiteSpace: "nowrap",
                }}
              >
                <span>⚠️</span>
                <span className="pill-text">Буцаагдсан — профайл засах</span>
              </span>
            </Link>
          )}

          <Link href="/dashboard/company/notifications" style={{
            padding: "7px", borderRadius: 9,
            border: "1px solid #f1f5f9", background: "#fafafa",
            display: "flex", textDecoration: "none",
          }}>
            <Bell size={16} style={{ color: "#64748b" }} />
          </Link>
          <Link href="/dashboard/company/profile" style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#0072BC,#3b9be0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", fontSize: 12, fontWeight: 700, color: "white",
            flexShrink: 0,
          }}>
            {user?.company_name?.[0] || "?"}
          </Link>
        </header>

        <main className="company-main-area" style={{ flex: 1, padding: 24, overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}