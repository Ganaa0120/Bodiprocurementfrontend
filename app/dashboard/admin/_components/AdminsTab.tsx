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
  super_admin: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  admin: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  viewer: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
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
    <div
      className="page-in"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
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
              placeholder="Нэр, и-мэйл хайх..."
              className="gi"
              style={{ width: 240, paddingLeft: 36 }}
            />
          </div>
          <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
            {data.adminsLoading
              ? "..."
              : `${filtered.length} / ${data.admins.length}`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={data.fetchAdmins}
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
              padding: "9px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
            }}
          >
            <Plus size={15} /> Шинэ Админ
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
            background: "rgba(251,191,36,0.05)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <AlertCircle size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(251,191,36,0.8)" }}>
            API алдаа — {data.adminsError}
          </span>
        </div>
      )}

      <div
        style={{
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {data.adminsLoading ? (
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
                border: "2px solid rgba(59,130,246,0.3)",
                borderTopColor: "#3b82f6",
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
                      color: "rgba(148,163,184,0.3)",
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
                  const colors = [
                    "#3b82f6",
                    "#34d399",
                    "#a78bfa",
                    "#fbbf24",
                    "#fb923c",
                  ];
                  const c = colors[i % colors.length];
                  return (
                    <tr key={a.id} className="tr">
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: `${c}15`,
                              border: `1px solid ${c}20`,
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
                                  color: "rgba(148,163,184,0.35)",
                                  marginTop: 1,
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
                          padding: "13px 16px",
                          fontSize: 12,
                          color: "rgba(148,163,184,0.55)",
                        }}
                      >
                        {a.company_name || "—"}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 12,
                          color: "rgba(148,163,184,0.55)",
                        }}
                      >
                        {a.email}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 12,
                          color: "rgba(148,163,184,0.5)",
                          fontFamily: "monospace",
                        }}
                      >
                        {a.phone || "—"}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: rs.bg,
                            color: rs.color,
                            border: `1px solid ${rs.color}22`,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <button
                          onClick={() => onToggle(a)}
                          disabled={statusLoading === a.id}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          {statusLoading === a.id ? (
                            <Loader2
                              size={14}
                              style={{
                                color: "rgba(148,163,184,0.4)",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                          ) : (
                            <Badge status={a.status} />
                          )}
                        </button>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="icon-btn"
                            onClick={() => onEdit(a)}
                            title="Засах"
                          >
                            <Pencil
                              size={13}
                              style={{ color: "rgba(96,165,250,0.7)" }}
                            />
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => onDelete(a)}
                            title="Устгах"
                          >
                            <Trash2
                              size={13}
                              style={{ color: "rgba(248,113,113,0.6)" }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
