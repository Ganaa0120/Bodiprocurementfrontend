"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Search, RefreshCw, Plus, Pencil, Trash2,
  Loader2, ShieldCheck, BarChart3, Bell, Building2,
  Users, FileText,
} from "lucide-react";
import { API, authH } from "../_lib/constants";
import { parsePerms } from "../_lib/permissions";
import { SubAdminModal } from "./SubAdminModal";
import { Th } from "../ui/Th";
import { Badge } from "../ui/Badge";

const LOCAL_NAV_PERMS = [
  { id: "dashboard", label: "Хянах самбар", icon: <BarChart3 size={18} /> },
  { id: "notifications", label: "Мэдэгдэл", icon: <Bell size={18} /> },
  { id: "companies", label: "Компаниуд", icon: <Building2 size={18} /> },
  { id: "individuals", label: "Хувь хүн", icon: <Users size={18} /> },
  { id: "announcements", label: "Зарлалууд", icon: <FileText size={18} /> },
];

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];

export function SubAdminsTab({
  myPerms, showToast,
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

  useEffect(() => { load(); }, [load]);

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

  return (
    <>
      {(modal === "create" || modal === "edit") && (
        <SubAdminModal
          mode={modal}
          admin={target}
          parentPerms={myPerms}
          onClose={() => { setModal(null); setTarget(null); }}
          onSave={() => {
            setModal(null);
            setTarget(null);
            load();
            showToast(modal === "create" ? "Үүсгэлээ" : "Хадгаллаа");
          }}
        />
      )}

      {delId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        }} onClick={() => setDelId(null)}>
          <div style={{
            width: "100%", maxWidth: 380,
            background: "#0d1526",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 24, padding: 28,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "rgba(239,68,68,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Trash2 size={24} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                Устгах уу?
              </div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", marginTop: 6 }}>
                Энэ брокерыг бүрмөсөн устгана
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDelId(null)} style={{
                flex: 1, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.5)",
                fontSize: 13, cursor: "pointer",
              }}>Болих</button>
              <button onClick={handleDelete} disabled={delLoad} style={{
                flex: 1, height: 44, borderRadius: 12,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {delLoad ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ position: "relative", width: 280 }}>
            <Search size={16} style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", color: "#64748b",
            }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, и-мэйл хайх..."
              style={{
                width: "100%", padding: "10px 14px 10px 42px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13, color: "white", outline: "none",
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
            <button onClick={load} style={{
              padding: "9px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(148,163,184,0.7)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 500, transition: "all 0.2s",
            }}>
              <RefreshCw size={14} style={{
                animation: loading ? "spin 1s linear infinite" : undefined,
              }} />
              Дахин ачаалах
            </button>
            <button onClick={() => { setTarget(null); setModal("create"); }} style={{
              padding: "9px 20px", borderRadius: 12,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none", color: "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}>
              <Plus size={16} /> Шинэ Брокер
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: "rgba(12,16,35,0.6)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {loading ? (
            <div style={{
              display: "flex", justifyContent: "center",
              alignItems: "center", padding: 60, gap: 12,
            }}>
              <Loader2 size={24} style={{
                color: "#6366f1", animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}>
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
                      <td colSpan={5} style={{
                        padding: "60px 20px", textAlign: "center",
                        color: "rgba(255,255,255,0.35)",
                      }}>
                        <ShieldCheck size={48} style={{
                          color: "rgba(148,163,184,0.15)",
                          margin: "0 auto 12px", display: "block",
                        }} />
                        <p style={{ margin: 0 }}>Брокер байхгүй байна</p>
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(148,163,184,0.25)" }}>
                          Шинэ брокер нэмж эрх хуваарилна уу
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((adminItem, index) => {
                      const adminPerms = parsePerms(adminItem.permissions);
                      const navCount = LOCAL_NAV_PERMS.filter((navItem) =>
                        adminPerms.includes(`${navItem.id}.view`) ||
                        (navItem.id === "dashboard" &&
                          (adminPerms.includes("dashboard.view") || adminPerms.includes("dashboard")))
                      ).length;
                      const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

                      return (
                        <tr key={adminItem.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 12,
                                background: `${avatarColor}15`,
                                border: `1px solid ${avatarColor}25`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 700, color: avatarColor,
                              }}>
                                {(adminItem.first_name?.[0] ?? adminItem.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <div style={{
                                  fontSize: 13, fontWeight: 600,
                                  color: "rgba(255,255,255,0.88)",
                                }}>
                                  {adminItem.last_name} {adminItem.first_name}
                                </div>
                                {adminItem.company_name && (
                                  <div style={{
                                    fontSize: 10, color: "rgba(148,163,184,0.45)", marginTop: 2,
                                  }}>{adminItem.company_name}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{
                            padding: "14px 16px",
                            fontSize: 12, color: "rgba(148,163,184,0.6)",
                          }}>{adminItem.email}</td>

                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc" }}>
                                {navCount}
                              </span>
                              <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>
                                / {LOCAL_NAV_PERMS.length}
                              </span>
                              <span style={{ fontSize: 10, color: "rgba(148,163,184,0.3)" }}>
                                цэс
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <Badge s={adminItem.status} />
                          </td>

                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => { setTarget(adminItem); setModal("edit"); }}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 8, padding: "6px 10px",
                                  cursor: "pointer", transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "rgba(99,102,241,0.15)";
                                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                }}>
                                <Pencil size={13} style={{ color: "#a5b4fc" }} />
                              </button>
                              <button onClick={() => setDelId(adminItem.id)}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 8, padding: "6px 10px",
                                  cursor: "pointer", transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                }}>
                                <Trash2 size={13} style={{ color: "#f87171" }} />
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