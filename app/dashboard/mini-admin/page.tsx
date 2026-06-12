"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

import { API, tok, authH } from "./_lib/constants";
import { parsePerms, NavId } from "./_lib/permissions";

import { GlobalStyles } from "./_components/GlobalStyles";
import { Toast } from "./_components/Toast";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import { DashboardOverview } from "./_components/DashboardOverview";

// External tabs (shared with super admin)
import { NotificationsTab } from "../admin/_components/NotificationsTab";
import { CompaniesTab } from "../admin/_components/CompaniesTab";
import { AnnouncementsTab } from "../admin/_components/Announcementstab";
import { IndividualsTab } from "../admin/_components/individuals/IndividualsTab";
import { SubAdminsTab } from "./_components/SubAdminsTab";

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

  // Auth guard + initial load
  useEffect(() => {
    const raw =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user");
    if (!tok() || !raw) {
      router.replace("/login");
      return;
    }
    try {
      const cached = JSON.parse(raw);
      if (!["admin", "sub_admin", "super_admin"].includes(cached.role)) {
        router.replace("/login");
        return;
      }
      localStorage.removeItem("individual_token");
      localStorage.removeItem("individual_user");
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

    // Unread notifications
    const aId =
      JSON.parse(
        localStorage.getItem("super_admin_user") ||
          localStorage.getItem("user") ||
          "{}",
      )?.id ?? "guest";
    const readSet = new Set(
      JSON.parse(localStorage.getItem(`notif_read_${aId}`) || "[]"),
    );
    fetch(`${API}/api/notifications?limit=100&_t=${Date.now()}`, {
      headers: authH(),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUnread(
            (d.notifications ?? []).filter((n: any) => !readSet.has(n.id))
              .length,
          );
        }
      })
      .catch(() => {});

    // Refresh own info from server
    fetch(`${API}/api/super-admins/me`, { headers: authH() })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.admin) return;
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
      })
      .catch(() => {});
  }, [router]);

  const canNav = (id: NavId) => {
    if (!me) return false;
    if (id === "dashboard" || id === "sub-admins") return true;
    return myPerms.some((p) => p.startsWith(`${id}.`));
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
  const pendingCount = persons.filter((p) => p.status === "pending").length;

  const navItems = [
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

  const logout = () => {
    ["super_admin_token", "super_admin_user", "token", "user"].forEach((k) =>
      localStorage.removeItem(k),
    );
    router.push("/login");
  };

  const navTitle = navItems.find((n) => n.id === nav)?.label || "Dashboard";

  return (
    <>
      <GlobalStyles />
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div
        style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a" }}
      >
        <Sidebar
          me={me}
          ini={ini}
          nm={nm}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          nav={nav}
          setNav={setNav}
          navItems={navItems}
          onLogout={logout}
          setUnread={setUnread}
        />

        {/* Mobile menu toggle */}
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

        <div
          className="main-content"
          style={{
            flex: 1,
            marginLeft: 260,
            minHeight: "100vh",
            transition: "margin-left 0.3s",
          }}
        >
          <Topbar
            title={navTitle}
            userName={nm}
            ini={ini}
            pendingCount={pendingCount}
          />

          <main
            style={{ padding: "28px 32px", minHeight: "calc(100vh - 70px)" }}
          >
            {nav === "dashboard" && (
              <DashboardOverview
                persons={persons}
                companies={companies}
                pendingCount={pendingCount}
                isSubAdmin={isSubAdmin}
                me={me}
              />
            )}
            {nav === "notifications" && canNav("notifications") && (
              <NotificationsTab
                showToast={showToast}
                onUnreadChange={setUnread}
              />
            )}
            {nav === "announcements" && canNav("announcements") && (
              <AnnouncementsTab
                showToast={showToast}
                canCreate={can("announcements.create")}
                canEdit={can("announcements.edit")}
                canPublish={can("announcements.publish")}
                canDelete={can("announcements.delete")}
              />
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
