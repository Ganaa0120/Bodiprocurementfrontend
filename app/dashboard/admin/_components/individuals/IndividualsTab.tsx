"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { RefreshCw, Eye, Search, Download, Mail, Phone, Calendar, Users, CheckCircle2, Clock, AlertCircle, User, X, FileText } from "lucide-react";
import { API, AVATAR_COLORS } from "./constants";
import { getStatus, fmtDate, getDirLabels } from "./utils";
import { Avatar } from "./AvatarComponents";
import { DetailModal } from "./DetailModal";
import type { IndividualsTabProps } from "./types";
import { ExcelExportModal } from "../ExcelImportModal";

const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

// Status badge
function Badge({ status }: { status: string }) {
  const statusConfig: Record<string, any> = {
    new: { label: "Шинэ", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    pending: { label: "Хүлээгдэж буй", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    active: { label: "Идэвхтэй", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    approved: { label: "Идэвхтэй", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
    returned: { label: "Буцаагдсан", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
    rejected: { label: "Татгалзсан", color: "#7f1d1d", bg: "rgba(220,38,38,0.12)" },
  };
  
  const c = statusConfig[status] ?? statusConfig.pending;
  
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

// Th component
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

// StatusFilter component
function StatusFilter({ currentStatus, onStatusChange, counts }: { 
  currentStatus: string; 
  onStatusChange: (status: string) => void;
  counts: { new: number; pending: number; active: number; returned: number };
}) {
  const filters = [
    { id: "", label: "Бүгд", icon: Users, color: "#64748b", count: counts.new + counts.pending + counts.active + counts.returned },
    { id: "new", label: "Шинэ", icon: FileText, color: "#f59e0b", count: counts.new },
    { id: "pending", label: "Хүлээгдэж буй", icon: Clock, color: "#3b82f6", count: counts.pending },
    { id: "active", label: "Идэвхтэй", icon: CheckCircle2, color: "#10b981", count: counts.active },
    { id: "returned", label: "Буцаагдсан", icon: AlertCircle, color: "#dc2626", count: counts.returned },
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {filters.map((filter) => {
        const isActive = currentStatus === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onStatusChange(filter.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 30,
              background: isActive ? filter.color : "#1e293b",
              border: isActive ? "none" : "1px solid #334155",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#334155";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <filter.icon size={12} style={{ color: isActive ? "white" : filter.color }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "white" : "#94a3b8",
              }}
            >
              {filter.label}
            </span>
            {filter.count > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 20,
                  background: isActive ? "rgba(255,255,255,0.2)" : "#334155",
                  color: isActive ? "white" : "#94a3b8",
                }}
              >
                {filter.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function IndividualsTab({
  data, search, setSearch, status, setStatus, dirs = [],
}: IndividualsTabProps) {
  const canEditStatus = data.canEditStatus !== false;
  const canEdit       = data.canEdit       !== false;
  const canDelete     = data.canDelete     !== false;
  const [detailPerson, setDetailPerson] = useState<any>(null);
  const [localPersons, setLocalPersons] = useState<any[] | null>(null);
  const [showExport,   setShowExport]   = useState(false);
  const [loading, setLoading] = useState(false);
  const isOpening = useRef(false);
  const showToast = data.showToast ?? (() => {});
  const persons   = localPersons ?? data.persons ?? [];

  // Count by status
  const statusCounts = {
    new: persons.filter((p: any) => p.status === "new").length,
    pending: persons.filter((p: any) => p.status === "pending").length,
    active: persons.filter((p: any) => p.status === "active" || p.status === "approved").length,
    returned: persons.filter((p: any) => p.status === "returned").length,
  };

  // Filtered persons based on search and status
  const filtered = persons.filter((p: any) => {
    const matchesSearch = !search || 
      `${p.last_name ?? ""} ${p.first_name ?? ""} ${p.email} ${p.register_number ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || p.status === status;
    return matchesSearch && matchesStatus;
  });

  // Reset filters function
  const resetFilters = () => {
    setSearch("");
    setStatus("");
  };

  // Refresh data function
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await data.fetchPersons?.(status);
    } finally {
      setLoading(false);
    }
  }, [data, status]);

  const openDetail = useCallback(async (p: any) => {
    isOpening.current = true;
    setDetailPerson(p);
    requestAnimationFrame(() => { isOpening.current = false; });
    try {
      const res = await fetch(`${API}/api/persons/${p.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const d = await res.json();
      if (d.success) setDetailPerson(d.person ?? d.user ?? p);
    } catch {}
  }, []);

  const closeDetail = useCallback(() => {
    if (isOpening.current) return;
    setDetailPerson(null);
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: string) => {
    const update = (prev: any[]) =>
      newStatus === "deleted"
        ? prev.filter(p => p.id !== id)
        : prev.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setLocalPersons(prev => update(prev ?? data.persons ?? []));
    setDetailPerson((prev: any) => prev?.id === id ? { ...prev, status: newStatus } : prev);
  }, [data.persons]);

  const handleDeleted = useCallback((id: string) => {
    handleStatusChange(id, "deleted");
    setDetailPerson(null);
  }, [handleStatusChange]);

  // Sync with parent data
  useEffect(() => {
    if (data.persons) {
      setLocalPersons(null);
    }
  }, [data.persons]);

  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ind-row {
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
        }
        .ind-row:hover {
          background: rgba(255,255,255,0.03);
          transform: translateX(2px);
        }
        .ind-row:last-child td {
          border-bottom: none;
        }
        input::placeholder {
          color: #64748b;
        }
      `}</style>

      {detailPerson && (
        <DetailModal
          person={detailPerson}
          onClose={closeDetail}
          onStatusChange={handleStatusChange}
          onDeleted={handleDeleted}
          showToast={showToast}
          dirs={dirs}
          canEditStatus={canEditStatus}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Excel export modal */}
      {showExport && (
        <ExcelExportModal
          type="persons"
          totalCount={persons.length}
          currentStatus={status}
          onClose={() => setShowExport(false)}
          showToast={showToast}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.3s ease" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Нийт {persons.length} бүртгэлтэй хувь хүн
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр, и-мэйл, регистрээр хайх..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 12,
                  border: "1px solid #334155",
                  fontSize: 13,
                  outline: "none",
                  background: "#1e293b",
                  color: "white",
                  transition: "all 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#334155";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowExport(true)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#f5f3ff",
                  border: "1px solid #e9d5ff",
                  color: "#8b5cf6",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ede9fe";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f3ff";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Download size={14} /> Excel татах
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#334155";
                    e.currentTarget.style.borderColor = "#64748b";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#1e293b";
                    e.currentTarget.style.borderColor = "#334155";
                  }
                }}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation: loading ? "spin 1s linear infinite" : undefined,
                  }}
                />
                Дахин ачаалах
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <StatusFilter 
            currentStatus={status} 
            onStatusChange={setStatus}
            counts={statusCounts}
          />
          
          {/* Reset button - only when filters are active */}
          {(search || status) && (
            <button
              onClick={resetFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 30,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#334155";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <X size={12} />
              Шүүлтүүрийг цэвэрлэх
            </button>
          )}
        </div>

        {/* Table */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {(data.personsLoading || loading) ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 60,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "2px solid #334155",
                  borderTopColor: "#8b5cf6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "#64748b" }}>Ачаалж байна...</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <Th h="Нэр" />
                    <Th h="Нийлүүлэгч №" />
                    <Th h="Регистр" />
                    <Th h="И-мэйл" />
                    <Th h="Утас" />
                    <Th h="Статус" />
                    <Th h="Бүртгүүлсэн" />
                    <Th h="" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr key="empty">
                      <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center" }}>
                        <Users size={40} style={{ color: "#334155", margin: "0 auto 12px", display: "block" }} />
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                          {persons.length === 0
                            ? "Бүртгэлтэй хувь хүн байхгүй байна"
                            : "Хайлтын үр дүн олдсонгүй"}
                        </p>
                        {(search || status) && (
                          <button
                            onClick={resetFilters}
                            style={{
                              marginTop: 16,
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: "#1e293b",
                              border: "1px solid #334155",
                              color: "#94a3b8",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Шүүлтүүрийг цэвэрлэх
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p: any) => {
                      const fullName = [p.last_name, p.first_name].filter(Boolean).join(" ") || "—";
                      const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
                      const avatarColor = colors[Math.abs(p.id?.length ?? 0) % colors.length];
                      
                      return (
                        <tr
                          key={p.id}
                          className="ind-row"
                          onClick={() => openDetail(p)}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 12,
                                  flexShrink: 0,
                                  background: `${avatarColor}15`,
                                  border: `1px solid ${avatarColor}25`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: avatarColor,
                                }}
                              >
                                {(p.first_name?.[0] ?? p.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "white",
                                  }}
                                >
                                  {fullName}
                                </div>
                                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                                  {p.supplier_number || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Supplier Number */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              fontFamily: "monospace",
                              color: "#94a3b8",
                            }}
                          >
                            {p.supplier_number || "—"}
                          </td>

                          {/* Register Number */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              fontFamily: "monospace",
                              color: "#64748b",
                            }}
                          >
                            {p.register_number || "—"}
                          </td>

                          {/* Email */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              color: "#94a3b8",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Mail size={12} style={{ color: "#64748b" }} />
                              {p.email || "—"}
                            </div>
                          </td>

                          {/* Phone */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              color: "#94a3b8",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Phone size={12} style={{ color: "#64748b" }} />
                              {p.phone || "—"}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "14px 16px" }}>
                            <Badge status={p.status} />
                          </td>

                          {/* Date */}
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: 12,
                              color: "#64748b",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Calendar size={12} style={{ color: "#64748b" }} />
                              {fmtDate(p.created_at) || "—"}
                            </div>
                          </td>

                          {/* Actions */}
                          <td
                            style={{ padding: "14px 16px" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => openDetail(p)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                background: "#1e293b",
                                border: "1px solid #334155",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                color: "#94a3b8",
                                fontFamily: "inherit",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#334155";
                                e.currentTarget.style.borderColor = "#8b5cf6";
                                e.currentTarget.style.color = "#a78bfa";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#1e293b";
                                e.currentTarget.style.borderColor = "#334155";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                            >
                              <Eye size={12} /> Дэлгэрэнгүй
                            </button>
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