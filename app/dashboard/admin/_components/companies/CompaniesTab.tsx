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
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
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
        color: "rgba(148,163,184,0.28)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.09em",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        whiteSpace: "nowrap" as const,
      }}
    >
      {h}
    </th>
  );
}

export function CompaniesTab({ data }: { data: any }) {
  const [search, setSearch] = useState("");
  const [detailOrg, setDetailOrg] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [permTypes, setPermTypes] = useState<{ id: number; label: string }[]>(
    [],
  );
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

  const filtered = (data.companies ?? []).filter((c: any) =>
    `${c.company_name ?? ""} ${c.register_number ?? ""} ${c.company_regnum ?? ""} ${c.email ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        .tr { transition:background .12s; border-bottom:1px solid rgba(255,255,255,0.04); }
        .tr:hover { background:rgba(255,255,255,0.028); }
        .tr:last-child { border-bottom:none; }
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

      {/* Excel татах — зөвхөн байгууллага */}
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
                  color: "rgba(148,163,184,0.4)",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр, регистр хайх..."
                className="gi"
                style={{ width: 240, paddingLeft: 36 }}
              />
            </div>
            <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
              {data.companiesLoading
                ? "..."
                : `${filtered.length} / ${(data.companies ?? []).length} компани`}
            </span>
          </div>

          {/* Action buttons — Excel татах + Дахин ачаалах */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowExport(true)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.22)",
                color: "#a78bfa",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> Excel татах
            </button>
            <button
              onClick={data.fetchCompanies}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontFamily: "inherit",
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

        <div
          style={{
            background: "#0d1526",
            border: "1px solid rgba(255,255,255,0.06)",
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
                  border: "2px solid rgba(52,211,153,0.3)",
                  borderTopColor: "#34d399",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "rgba(148,163,184,0.4)" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
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
                        color: "rgba(148,163,184,0.3)",
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
                                color: "rgba(255,255,255,0.85)",
                              }}
                            >
                              {c.company_name}
                            </div>
                            {c.company_name_en && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "rgba(148,163,184,0.4)",
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
                          color: "rgba(148,163,184,0.5)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {c.register_number ?? c.company_regnum ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "rgba(148,163,184,0.55)",
                        }}
                      >
                        {c.email}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "rgba(148,163,184,0.5)",
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
                          color: "rgba(148,163,184,0.4)",
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
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.18)",
                            borderRadius: 8,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            color: "#60a5fa",
                            fontFamily: "inherit",
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