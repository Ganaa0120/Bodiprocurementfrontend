"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Shield,
  Activity,
  Calendar,
  Hash,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const getToken = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";

type Direction = {
  id: number;
  label: string;
  is_active: boolean;
  parent_id: number | null;
  created_at?: string;
  children?: Direction[];
};

// ── Modal ─────────────────────────────────────────────────────
function DirectionModal({
  mode,
  direction,
  parents,
  onClose,
  onSave,
  showToast,
}: {
  mode: "create" | "edit";
  direction?: Direction | null;
  parents: Direction[];
  onClose: () => void;
  onSave: () => void;
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [label, setLabel] = useState(direction?.label ?? "");
  const [parentId, setParentId] = useState<string>(
    direction?.parent_id ? String(direction.parent_id) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!label.trim()) {
      setError("Нэр шаардлагатай");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url =
        mode === "create"
          ? `${API}/api/activity-directions`
          : `${API}/api/activity-directions/${direction!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          label,
          parent_id: parentId ? Number(parentId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(
        mode === "create" ? "Чиглэл нэмэгдлээ ✓" : "Амжилттай хадгаллаа ✓",
      );
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%",
    height: 44,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "0 14px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };

  const sel: React.CSSProperties = {
    ...inp,
    appearance: "none" as const,
    cursor: "pointer",
    paddingRight: 32,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: 32,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {mode === "create" ? "Шинэ чиглэл нэмэх" : "Чиглэл засах"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.5)",
                marginTop: 4,
              }}
            >
              Үйл ажиллагааны чиглэл
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(148,163,184,0.5)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.5)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Үндсэн чиглэл
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={sel}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(99,102,241,0.6)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              >
                <option value="" style={{ background: "#0d1526" }}>
                  — Үндсэн чиглэл (хэрэв туслах бол сонгоно) —
                </option>
                {parents
                  .filter((p) => !p.parent_id)
                  .map((p) => (
                    <option
                      key={p.id}
                      value={String(p.id)}
                      style={{ background: "#0d1526" }}
                    >
                      {p.label}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(148,163,184,0.4)",
                  pointerEvents: "none",
                }}
              />
            </div>
            {parentId && (
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(99,102,241,0.7)",
                  marginTop: 6,
                }}
              >
                ↳ {parents.find((p) => String(p.id) === parentId)?.label}-ийн
                туслах чиглэл болно
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.5)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Чиглэлийн нэр *
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={inp}
              placeholder={parentId ? "Жишээ: Дотоод засал" : "Жишээ: Барилга"}
              autoFocus
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(99,102,241,0.6)")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.08)")
              }
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(148,163,184,0.6)";
              }}
            >
              Болих
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: saving ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {saving ? (
                <Loader2
                  size={16}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {saving
                ? "Хадгалж байна..."
                : mode === "create"
                  ? "Нэмэх"
                  : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Directions Tab ────────────────────────────────────────────
export function DirectionsTab({
  isSuperAdmin,
  showToast,
}: {
  isSuperAdmin: boolean;
  showToast: (msg: string, ok?: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Direction | null>(null);
  const [confirmDel, setConfirmDel] = useState<Direction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [flatDirs, setFlatDirs] = useState<Direction[]>([]);

  const fetchDirections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/activity-directions`);
      const data = await res.json();
      if (data.success) {
        const result: Direction[] = [];
        (data.directions || []).forEach((d: any) => {
          result.push({
            id: d.id,
            label: d.label,
            is_active: d.is_active,
            parent_id: d.parent_id ?? null,
            created_at: d.created_at,
          });
          (d.children || []).forEach((c: any) => {
            result.push({
              id: c.id,
              label: c.label,
              is_active: c.is_active,
              parent_id: d.id,
              created_at: c.created_at,
            });
          });
        });
        setFlatDirs(result);
        const parentIds = new Set(
          result.filter((d) => d.parent_id).map((d) => d.parent_id as number),
        );
        setExpanded(parentIds);
      }
    } catch {
      // Silent catch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirections();
  }, [fetchDirections]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggle = async (d: Direction) => {
    if (!isSuperAdmin) return;
    setToggling(d.id);
    try {
      const res = await fetch(`${API}/api/activity-directions/${d.id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFlatDirs((prev) =>
        prev.map((x) =>
          x.id === d.id ? { ...x, is_active: !x.is_active } : x,
        ),
      );
      showToast(`${d.label} → ${!d.is_active ? "Идэвхтэй" : "Идэвхгүй"}`);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${API}/api/activity-directions/${confirmDel.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${confirmDel.label} устгагдлаа`);
      setFlatDirs((prev) =>
        prev.filter(
          (x) => x.id !== confirmDel.id && x.parent_id !== confirmDel.id,
        ),
      );
      setConfirmDel(null);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDeleting(false);
    }
  };

  const active = flatDirs.filter((d) => d.is_active).length;
  const inactive = flatDirs.filter((d) => !d.is_active).length;
  const mains = flatDirs.filter((d) => !d.parent_id).length;
  const subs = flatDirs.filter((d) => !!d.parent_id).length;

  // DirectionRow component defined inside to access flatDirs and expanded state
  const DirectionRow = ({
    d,
    isChild = false,
  }: {
    d: Direction;
    isChild?: boolean;
  }) => {
    const children = flatDirs.filter((c) => c.parent_id === d.id);
    const isExpanded = expanded.has(d.id);
    const hasChildren = children.length > 0;

    return (
      <React.Fragment key={d.id}>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <td
            style={{
              padding: "12px 16px",
              fontSize: 11,
              color: "rgba(148,163,184,0.3)",
              fontFamily: "monospace",
              width: 60,
            }}
          >
            {isChild ? "" : d.id}
          </td>
          <td style={{ padding: "12px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingLeft: isChild ? 40 : 0,
              }}
            >
              {!isChild && hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(d.id)}
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 6,
                    padding: "3px 6px",
                    cursor: "pointer",
                    display: "flex",
                    color: "#818cf8",
                    flexShrink: 0,
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
              )}
              {isChild && (
                <span
                  style={{
                    color: "rgba(148,163,184,0.3)",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  ↳
                </span>
              )}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: isChild
                    ? "rgba(99,102,241,0.08)"
                    : d.is_active
                      ? "rgba(99,102,241,0.12)"
                      : "rgba(148,163,184,0.06)",
                  border: isChild
                    ? "1px solid rgba(99,102,241,0.15)"
                    : d.is_active
                      ? "1px solid rgba(99,102,241,0.2)"
                      : "1px solid rgba(148,163,184,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: isChild
                    ? "#a5b4fc"
                    : d.is_active
                      ? "#a5b4fc"
                      : "rgba(148,163,184,0.4)",
                }}
              >
                {d.label[0]?.toUpperCase()}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: d.is_active
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {d.label}
                </span>
                {!isChild && hasChildren && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(148,163,184,0.4)",
                      marginTop: 2,
                    }}
                  >
                    {children.length} туслах чиглэл
                  </div>
                )}
              </div>
            </div>
          </td>

          <td style={{ padding: "12px 16px" }}>
            <button
              onClick={() => handleToggle(d)}
              disabled={toggling === d.id || !isSuperAdmin}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 30,
                cursor: isSuperAdmin ? "pointer" : "default",
                fontSize: 11,
                fontWeight: 600,
                background: d.is_active
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(148,163,184,0.1)",
                color: d.is_active ? "#34d399" : "#94a3b8",
                border: d.is_active
                  ? "1px solid rgba(16,185,129,0.2)"
                  : "1px solid rgba(148,163,184,0.15)",
                opacity: toggling === d.id ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (isSuperAdmin && toggling !== d.id) {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (isSuperAdmin && toggling !== d.id) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {toggling === d.id ? (
                <Loader2
                  size={12}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: d.is_active ? "#10b981" : "#94a3b8",
                  }}
                />
              )}
              {d.is_active ? "Идэвхтэй" : "Идэвхгүй"}
            </button>
          </td>

          <td
            style={{
              padding: "12px 16px",
              fontSize: 11,
              color: "rgba(148,163,184,0.4)",
            }}
          >
            {isChild ? (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 10px",
                  borderRadius: 30,
                  background: "rgba(99,102,241,0.08)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                туслах
              </span>
            ) : d.created_at ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={12} style={{ color: "#475569" }} />
                {new Date(d.created_at).toLocaleDateString("mn-MN")}
              </div>
            ) : (
              "—"
            )}
          </td>

          <td style={{ padding: "12px 16px" }}>
            {isSuperAdmin && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    setEditTarget(d);
                    setModalMode("edit");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#a5b4fc",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#334155";
                    e.currentTarget.style.borderColor = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1e293b";
                    e.currentTarget.style.borderColor = "#334155";
                  }}
                >
                  <Pencil size={12} /> Засах
                </button>
                <button
                  onClick={() => setConfirmDel(d)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#f87171",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1e293b";
                    e.currentTarget.style.borderColor = "#334155";
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </td>
        </tr>

        {/* Children rows */}
        {!isChild &&
          isExpanded &&
          hasChildren &&
          children.map((child) => (
            <DirectionRow key={child.id} d={child} isChild={true} />
          ))}

        {/* Collapsed summary */}
        {!isChild && !isExpanded && hasChildren && (
          <tr>
            <td colSpan={5}>
              <button
                type="button"
                onClick={() => toggleExpand(d.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 16px 8px 56px",
                  fontSize: 11,
                  color: "rgba(99,102,241,0.6)",
                  background: "rgba(99,102,241,0.03)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.03)";
                }}
              >
                <ChevronRight size={12} />
                {children.length} туслах чиглэл харах
              </button>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .perm-row {
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .perm-row:hover {
          background: rgba(255,255,255,0.03);
          transform: translateX(2px);
        }
        .perm-row:last-child {
          border-bottom: none;
        }
      `}</style>

      {(modalMode === "create" || modalMode === "edit") && (
        <DirectionModal
          mode={modalMode}
          direction={editTarget}
          parents={flatDirs}
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
          onSave={() => {
            setModalMode(null);
            setEditTarget(null);
            fetchDirections();
          }}
          showToast={showToast}
        />
      )}

      {confirmDel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setConfirmDel(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "#0d1526",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              animation: "modalIn 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: "rgba(239,68,68,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Trash2 size={24} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  margin: "0 0 8px",
                }}
              >
                Устгах уу?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.5)",
                  margin: 0,
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}
                >
                  "{confirmDel.label}"
                </span>
              </p>
              {flatDirs.filter((d) => d.parent_id === confirmDel.id).length >
                0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(239,68,68,0.6)",
                    marginTop: 10,
                  }}
                >
                  ⚠️ Туслах{" "}
                  {flatDirs.filter((d) => d.parent_id === confirmDel.id).length}{" "}
                  чиглэл ч устгагдана
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmDel(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(148,163,184,0.6)";
                }}
              >
                Болих
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: deleting ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "rgba(239,68,68,0.25)";
                    e.currentTarget.style.color = "#ef4444";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                    e.currentTarget.style.color = "#f87171";
                  }
                }}
              >
                {deleting ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <Trash2 size={14} />
                )}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="animate-fade-up"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Нийт {flatDirs.length} чиглэл
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 30,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#a5b4fc",
                }}
              >
                {mains} үндсэн
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 30,
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34d399",
                }}
              >
                <Shield size={12} /> Идэвхтэй: {active}
              </span>
              {inactive > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 30,
                    background: "rgba(148,163,184,0.1)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  Идэвхгүй: {inactive}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={fetchDirections}
                style={{
                  padding: "9px 16px",
                  borderRadius: 12,
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#334155";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1e293b";
                  e.currentTarget.style.color = "#94a3b8";
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
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setEditTarget(null);
                    setModalMode("create");
                  }}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(79,70,229,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(79,70,229,0.3)";
                  }}
                >
                  <Plus size={14} /> Шинэ чиглэл
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 80,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "2px solid #334155",
                  borderTopColor: "#4f46e5",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : flatDirs.length === 0 ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <Activity
                size={48}
                style={{
                  color: "#334155",
                  margin: "0 auto 16px",
                  display: "block",
                }}
              />
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Үйл ажиллагааны чиглэл байхгүй байна
              </p>
              {isSuperAdmin && (
                <button
                  onClick={() => setModalMode("create")}
                  style={{
                    marginTop: 20,
                    padding: "8px 20px",
                    borderRadius: 10,
                    background: "rgba(79,70,229,0.1)",
                    border: "1px solid rgba(79,70,229,0.3)",
                    color: "#a5b4fc",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  + Эхний чиглэл нэмэх
                </button>
              )}
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
                  <tr
                    style={{
                      background: "#0f172a",
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <th
                      style={{
                        padding: "14px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Hash
                        size={12}
                        style={{ display: "inline", marginRight: 4 }}
                      />{" "}
                      №
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Чиглэлийн нэр
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Статус
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Calendar
                        size={12}
                        style={{ display: "inline", marginRight: 4 }}
                      />{" "}
                      Төрөл
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        whiteSpace: "nowrap",
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {flatDirs
                    .filter((d) => d.parent_id === null)
                    .map((d) => (
                      <DirectionRow key={d.id} d={d} />
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
