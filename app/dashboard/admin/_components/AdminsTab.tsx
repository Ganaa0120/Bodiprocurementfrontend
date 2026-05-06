"use client";
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge, Th } from "./Badge";

type Props = {
  data: any;
  search: string;
  setSearch: (v: string) => void;
  statusLoading: string | null;
  onToggle: (a: any) => void;
  onEdit: (a: any) => void;
  onDelete: (a: any) => void;
  onCreate: () => void;
};

const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  super_admin: { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  admin: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  viewer: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

export function AdminsTab({
  data,
  search,
  setSearch,
  statusLoading,
  onToggle,
  onEdit,
  onDelete,
  onCreate,
}: Props) {
  const filtered = data.admins.filter((a: any) =>
    `${a.last_name} ${a.first_name} ${a.email} ${a.company_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, и-мэйл, компаниар хайх..."
              className="modern-input"
              style={{
                width: 280,
                paddingLeft: 42,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "10px 14px 10px 42px",
                fontSize: 13,
                color: "white",
                outline: "none",
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
          <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>
            {data.adminsLoading
              ? "..."
              : `${filtered.length} / ${data.admins.length} админ`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={data.fetchAdmins}
            style={{
              padding: "9px 16px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(148,163,184,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(148,163,184,0.7)";
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: data.adminsLoading
                  ? "spin 1s linear infinite"
                  : undefined,
              }}
            />
            Дахин ачаалах
          </button>
          <button
            onClick={onCreate}
            style={{
              padding: "9px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(99,102,241,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(99,102,241,0.3)";
            }}
          >
            <Plus size={16} /> Шинэ Админ
          </button>
        </div>
      </div>

      {data.adminsError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <AlertCircle size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(251,191,36,0.8)" }}>
            API холболт байхгүй — mock өгөгдөл харуулж байна
          </span>
        </div>
      )}

      {/* Table */}
      <div
        className="glass-card"
        style={{
          overflow: "hidden",
          borderRadius: 20,
        }}
      >
        {data.adminsLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 60,
              gap: 12,
            }}
          >
            <Loader2
              size={24}
              style={{
                color: "#6366f1",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Ачаалж байна...
            </span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <Th h="Нэр" />
                  <Th h="Компани" />
                  <Th h="И-мэйл" />
                  <Th h="Утас" />
                  <Th h="Эрх" />
                  <Th h="Статус" />
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
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {data.admins.length === 0
                        ? "Админ байхгүй байна"
                        : "Хайлтын үр дүн олдсонгүй"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((a: any, i: number) => {
                    const rs = ROLE_STYLE[a.role] ?? ROLE_STYLE.viewer;
                    const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];
                    const c = colors[i % colors.length];
                    return (
                      <table key={a.id} className="tr">
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                background: `${c}15`,
                                border: `1px solid ${c}25`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                color: c,
                                flexShrink: 0,
                              }}
                            >
                              {a.first_name?.[0] ?? a.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "rgba(255,255,255,0.85)",
                                }}
                              >
                                {a.last_name} {a.first_name}
                              </div>
                              {a.created_at && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "rgba(148,163,184,0.4)",
                                    marginTop: 2,
                                  }}
                                >
                                  {new Date(a.created_at).toLocaleDateString(
                                    "mn-MN",
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 12,
                            color: "rgba(148,163,184,0.6)",
                          }}
                        >
                          {a.company_name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 12,
                            color: "rgba(148,163,184,0.6)",
                          }}
                        >
                          {a.email}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 12,
                            fontFamily: "monospace",
                            color: "rgba(148,163,184,0.5)",
                          }}
                        >
                          {a.phone || "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "4px 12px",
                              borderRadius: 30,
                              background: rs.bg,
                              color: rs.color,
                              border: `1px solid ${rs.color}20`,
                            }}
                          >
                            {a.role === "super_admin" ? "Super Admin" : "Admin"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => onToggle(a)}
                            disabled={statusLoading === a.id}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            {statusLoading === a.id ? (
                              <Loader2
                                size={14}
                                style={{
                                  color: "#6366f1",
                                  animation: "spin 0.8s linear infinite",
                                }}
                              />
                            ) : (
                              <Badge status={a.status} />
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => onEdit(a)}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 8,
                                padding: "7px 8px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(99,102,241,0.15)";
                                e.currentTarget.style.borderColor =
                                  "rgba(99,102,241,0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.04)";
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.08)";
                              }}
                              title="Засах"
                            >
                              <Pencil size={14} style={{ color: "#a5b4fc" }} />
                            </button>
                            <button
                              onClick={() => onDelete(a)}
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 8,
                                padding: "7px 8px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(239,68,68,0.15)";
                                e.currentTarget.style.borderColor =
                                  "rgba(239,68,68,0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.04)";
                                e.currentTarget.style.borderColor =
                                  "rgba(255,255,255,0.08)";
                              }}
                              title="Устгах"
                            >
                              <Trash2 size={14} style={{ color: "#f87171" }} />
                            </button>
                          </div>
                        </td>
                      </table>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
