"use client";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { NavId } from "../_lib/permissions";

type NavItem = {
  id: NavId;
  icon: ReactNode;
  label: string;
  badge: number;
};

export function Sidebar({
  me, ini, nm, sidebarOpen, setSidebarOpen,
  nav, setNav, navItems, onLogout, setUnread,
}: {
  me: any;
  ini: string;
  nm: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  nav: NavId;
  setNav: (id: NavId) => void;
  navItems: NavItem[];
  onLogout: () => void;
  setUnread: (n: number) => void;
}) {
  return (
    <aside
      className={`sidebar ${sidebarOpen ? "open" : ""}`}
      style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
        background: "rgba(8,12,28,0.98)", backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", zIndex: 50,
      }}
    >
      {/* Brand */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/images/logosolo.png" alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>
              Bodi Group
            </div>
            <div style={{ fontSize: 10, color: "rgba(99,102,241,0.6)", fontWeight: 500 }}>
              Худалдан авалтын портал
            </div>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div style={{
        padding: "20px", margin: "12px 16px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
        borderRadius: 20, border: "1px solid rgba(99,102,241,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "white",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}>{ini}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>{nm}</div>
            <div style={{
              fontSize: 10, color: "rgba(99,102,241,0.7)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#10b981", boxShadow: "0 0 6px #10b981",
              }} />
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
          padding: "12px 20px 8px",
        }}>Main Menu</div>

        {navItems.map((item, idx) => (
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
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                background: "#ef4444", color: "white",
                fontSize: 10, fontWeight: 700,
                padding: "2px 8px", borderRadius: 30,
                minWidth: 22, textAlign: "center",
              }}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          onClick={onLogout}
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
  );
}