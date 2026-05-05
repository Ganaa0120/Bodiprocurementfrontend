"use client";
import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Eye, Search, Download } from "lucide-react";
import { API, ORG_COLORS } from "./constants";
import { getStatus, fmtDate } from "./utils";
import { OrgAvatar } from "./LogoComponents";
import { DetailModal } from "./DetailModal";
import { ExcelExportModal } from "../ExcelImportModal";

function Badge({ status }: { status: string }) {
  const c = getStatus(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: c.bg,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
        border: `1px solid ${c.dot}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          animation:
            status === "new" || status === "pending"
              ? "pulse 1.5s infinite"
              : "none",
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
        padding: "10px 16px",
        fontSize: 10,
        fontWeight: 700,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        borderBottom: "1px solid #334155",
        whiteSpace: "nowrap",
      }}
    >
      {h}
    </th>
  );
}

const STATUS_FILTERS = [
  { value: "", label: "Бүгд" },
  { value: "new", label: "Бүртгэл үүсгэж буй", color: "#0ea5e9" },
  { value: "pending", label: "Хүсэлт ирсэн", color: "#f59e0b" },
  { value: "active", label: "Баталгаажсан", color: "#10b981" },
  { value: "returned", label: "Буцаагдсан", color: "#ef4444" },
];

export function CompaniesTab({ data }: { data: any }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrg, setDetailOrg] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [permTypes, setPermTypes] = useState<{ id: number; label: string }[]>([]);
  const showToast = data.showToast ?? (() => {});
  const canEditStatus = data.canEditStatus !== false;
  const canDelete = data.canDelete !== false;
  const [dirs, setDirs] = useState<
    { id: number; label: string; children: { id: number; label: string }[] }[]
  >([]);

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const normalized = (d.directions || []).map((dir: any) => ({
            id: dir.id,
            label: dir.label,
            children: (dir.children || []).map((c: any) => ({
              id: c.id,
              label: c.label,
            })),
          }));
          setDirs(normalized);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/api/special-permission-types`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPermTypes(d.types || []);
      })
      .catch(() => {});
  }, []);

  const openDetail = useCallback(async (c: any) => {
    setTimeout(() => setDetailOrg(c), 0);
    try {
      const token =
        localStorage.getItem("super_admin_token") ||
        localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/organizations/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const d = await res.json();
      if (d.success && d.organization) setDetailOrg(d.organization);
    } catch {}
  }, []);

  const handleStatusChange = useCallback(
    (id: string, status: string) => {
      if (status === "deleted") {
        data.setCompanies?.((prev: any[]) =>
          prev.filter((c: any) => c.id !== id),
        );
      } else {
        data.setCompanies?.((prev: any[]) =>
          prev.map((c: any) => (c.id === id ? { ...c, status } : c)),
        );
        if (detailOrg?.id === id)
          setDetailOrg((p: any) => (p ? { ...p, status } : null));
      }
    },
    [data, detailOrg],
  );

  const filtered = (data.companies ?? [])
    .filter((c: any) =>
      `${c.company_name ?? ""} ${c.register_number ?? ""} ${c.company_regnum ?? ""} ${c.email ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((c: any) => !statusFilter || c.status === statusFilter);

  // Status counts (бүх компаниас)
  const statusCounts = (data.companies ?? []).reduce(
    (acc: Record<string, number>, c: any) => {
      acc[c.status || "unknown"] = (acc[c.status || "unknown"] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .tr { transition:background .12s; border-bottom:1px solid #334155; }
        .tr:hover { background:rgba(255,255,255,0.03); }
        .tr:last-child { border-bottom:none; }
        input::placeholder { color: #64748b; }
      `}</style>

      {detailOrg && (
        <DetailModal
          org={detailOrg}
          dirs={dirs}
          permTypes={permTypes}
          onClose={() => setDetailOrg(null)}
          onStatusChange={handleStatusChange}
          onDeleted={(id) => {
            handleStatusChange(id, "deleted");
            setDetailOrg(null);
          }}
          showToast={showToast}
          canEditStatus={canEditStatus}
          canDelete={canDelete}
        />
      )}

      {showExport && (
        <ExcelExportModal
          type="companies"
          totalCount={(data.companies ?? []).length}
          onClose={() => setShowExport(false)}
          showToast={showToast}
        />
      )}

      <div
        className="page-in"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Header - Search and Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={13}
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
                placeholder="Нэр, регистр хайх..."
                style={{
                  width: 240,
                  padding: "10px 12px 10px 36px",
                  borderRadius: 10,
                  border: "1px solid #334155",
                  fontSize: 13,
                  outline: "none",
                  background: "#1e293b",
                  color: "white",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#334155")}
              />
            </div>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {data.companiesLoading
                ? "..."
                : `${filtered.length} / ${(data.companies ?? []).length} компани`}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowExport(true)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#a78bfa",
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
                e.currentTarget.style.background = "#334155";
                e.currentTarget.style.borderColor = "#a78bfa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.borderColor = "#334155";
              }}
            >
              <Download size={13} /> Excel татах
            </button>
            <button
              onClick={data.fetchCompanies}
              style={{
                padding: "9px 14px",
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e293b";
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: data.companiesLoading
                    ? "spin 1s linear infinite"
                    : undefined,
                }}
              />
              Дахин ачаалах
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.value;
            const count = f.value
              ? statusCounts[f.value] || 0
              : (data.companies ?? []).length;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 99,
                  border: isActive
                    ? `1px solid ${f.color || "#6366f1"}`
                    : "1px solid #334155",
                  background: isActive
                    ? `${f.color || "#6366f1"}1A`
                    : "#1e293b",
                  color: isActive ? f.color || "#a78bfa" : "#94a3b8",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 99,
                    background: isActive
                      ? f.color || "#6366f1"
                      : "rgba(255,255,255,0.05)",
                    color: isActive ? "white" : "#64748b",
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {data.companiesLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 56,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  border: "2px solid #334155",
                  borderTopColor: "#a78bfa",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  <Th h="Байгууллага" />
                  <Th h="Регистр" />
                  <Th h="И-мэйл" />
                  <Th h="Утас" />
                  <Th h="Статус" />
                  <Th h="Огноо" />
                  <Th h="" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      {(data.companies ?? []).length === 0
                        ? "Байгууллага байхгүй байна"
                        : "Хайлтын үр дүн олдсонгүй"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c: any) => (
                    <tr
                      key={c.id}
                      className="tr"
                      style={{ cursor: "pointer" }}
                      onClick={() => openDetail(c)}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          }}
                        >
                          <OrgAvatar org={c} size={34} />
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "white",
                              }}
                            >
                              {c.company_name}
                            </div>
                            {c.company_name_en && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#64748b",
                                }}
                              >
                                {c.company_name_en}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: "#94a3b8",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {c.register_number ?? c.company_regnum ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "#94a3b8",
                        }}
                      >
                        {c.email}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "#94a3b8",
                          fontFamily: "monospace",
                        }}
                      >
                        {c.phone || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge status={c.status} />
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        {fmtDate(c.created_at) || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 16px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openDetail(c)}
                          style={{
                            background: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "inherit",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#334155";
                            e.currentTarget.style.borderColor = "#6366f1";
                            e.currentTarget.style.color = "#a78bfa";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#1e293b";
                            e.currentTarget.style.borderColor = "#334155";
                            e.currentTarget.style.color = "#94a3b8";
                          }}
                        >
                          <Eye size={12} /> Харах
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}