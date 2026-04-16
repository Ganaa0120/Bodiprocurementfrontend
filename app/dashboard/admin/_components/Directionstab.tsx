"use client";
import { useState, useEffect, useCallback } from "react";
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
        mode === "create" ? "Чиглэл нэмэгдлэа ✓" : "Амжилттай хадгаллаа ✓",
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
    height: 42,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 9,
    padding: "0 12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    fontFamily: "inherit",
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
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {mode === "create" ? "Шинэ чиглэл нэмэх" : "Чиглэл засах"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.4)",
                marginTop: 2,
              }}
            >
              Үйл ажиллагааны чиглэл
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9,
              padding: 7,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "9px 13px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.18)",
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 12, color: "rgba(239,68,68,0.9)" }}>
              {error}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Үндсэн чиглэл сонгох */}
          <div>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "rgba(148,163,184,0.45)",
                display: "block",
                marginBottom: 5,
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
                    "rgba(59,130,246,0.4)")
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
                size={13}
                style={{
                  position: "absolute",
                  right: 10,
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
                  marginTop: 5,
                }}
              >
                ↳ {parents.find((p) => String(p.id) === parentId)?.label}-ийн
                туслах чиглэл болно
              </div>
            )}
          </div>

          {/* Нэр */}
          <div>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "rgba(148,163,184,0.45)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Нэр *
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={inp}
              placeholder={parentId ? "Жишээ: Дотоод засал" : "Жишээ: Барилга"}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(59,130,246,0.4)")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.08)")
              }
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Болих
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                height: 42,
                borderRadius: 10,
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <CheckCircle2 size={14} />
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
          // ✅ Parent
          result.push({
            id: d.id,
            label: d.label,
            is_active: d.is_active,
            parent_id: d.parent_id ?? null,
            created_at: d.created_at,
          });
          // ✅ Children
          (d.children || []).forEach((c: any) => {
            result.push({
              id: c.id,
              label: c.label,
              is_active: c.is_active,
              parent_id: d.id, // ✅ parent_id заавал тохируулна
              created_at: c.created_at,
            });
          });
        });
        setFlatDirs(result);
        // ✅ Children бүхий parent-уудыг expand хийнэ
        const parentIds = new Set(
          result.filter((d) => d.parent_id).map((d) => d.parent_id as number),
        );
        setExpanded(parentIds);
      }
    } catch {
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggle = async (d: Direction) => {
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
      <>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
          <td
            style={{
              padding: "10px 16px",
              fontSize: 11,
              color: "rgba(148,163,184,0.3)",
              fontFamily: "monospace",
              width: 48,
            }}
          >
            {isChild ? "" : d.id}
          </td>
          <td style={{ padding: "10px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingLeft: isChild ? 40 : 0,
              }}
            >
              {/* Expand/collapse — зөвхөн parent-д */}
              {!isChild && hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(d.id)}
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 6,
                    padding: "3px 5px",
                    cursor: "pointer",
                    display: "flex",
                    color: "#818cf8",
                    flexShrink: 0,
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={11} />
                  ) : (
                    <ChevronRight size={11} />
                  )}
                </button>
              )}

              {/* Sub icon */}
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
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: isChild
                    ? "rgba(99,102,241,0.08)"
                    : d.is_active
                      ? "rgba(59,130,246,0.12)"
                      : "rgba(148,163,184,0.06)",
                  border: isChild
                    ? "1px solid rgba(99,102,241,0.15)"
                    : d.is_active
                      ? "1px solid rgba(59,130,246,0.2)"
                      : "1px solid rgba(148,163,184,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isChild
                    ? "#818cf8"
                    : d.is_active
                      ? "#60a5fa"
                      : "rgba(148,163,184,0.4)",
                }}
              >
                {d.label[0]}
              </div>

              <div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: d.is_active
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(255,255,255,0.35)",
                  }}
                >
                  {d.label}
                </span>
                {/* Parent-д children тоо */}
                {!isChild && hasChildren && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(148,163,184,0.4)",
                      marginTop: 1,
                    }}
                  >
                    {children.length} туслах чиглэл
                  </div>
                )}
              </div>
            </div>
          </td>

          <td style={{ padding: "10px 16px" }}>
            <button
              onClick={() => isSuperAdmin && handleToggle(d)}
              disabled={toggling === d.id || !isSuperAdmin}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 99,
                border: "none",
                cursor: isSuperAdmin ? "pointer" : "default",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: 600,
                background: d.is_active
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(148,163,184,0.1)",
                color: d.is_active ? "#10b981" : "#94a3b8",
                opacity: toggling === d.id ? 0.5 : 1,
              }}
            >
              {toggling === d.id ? (
                <Loader2
                  size={10}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              ) : (
                <span
                  style={{
                    width: 5,
                    height: 5,
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
              padding: "10px 16px",
              fontSize: 11,
              color: "rgba(148,163,184,0.4)",
            }}
          >
            {isChild ? (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "rgba(99,102,241,0.08)",
                  color: "rgba(99,102,241,0.5)",
                }}
              >
                туслах
              </span>
            ) : d.created_at ? (
              new Date(d.created_at).toLocaleDateString("mn-MN")
            ) : (
              "—"
            )}
          </td>

          <td style={{ padding: "10px 16px" }}>
            {isSuperAdmin && (
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => {
                    setEditTarget(d);
                    setModalMode("edit");
                  }}
                  style={{
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.18)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    color: "#60a5fa",
                    fontFamily: "inherit",
                  }}
                >
                  <Pencil size={11} /> Засах
                </button>
                <button
                  onClick={() => setConfirmDel(d)}
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(239,68,68,0.7)",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </td>
        </tr>

        {/* ✅ Children — expand дарсан үед харагдана */}
        {!isChild &&
          isExpanded &&
          children.map((child) => (
            <DirectionRow key={child.id} d={child} isChild={true} />
          ))}

        {/* ✅ Children байвал хэрэглэгч expand дарахгүй байсан ч summary харуулна */}
        {!isChild && !isExpanded && hasChildren && (
          <tr>
            <td />
            <td style={{ paddingLeft: 56, paddingBottom: 8 }}>
              <button
                type="button"
                onClick={() => toggleExpand(d.id)}
                style={{
                  fontSize: 11,
                  color: "rgba(99,102,241,0.6)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ChevronRight size={11} />
                {children.length} туслах чиглэл харах
              </button>
            </td>
            <td />
            <td />
            <td />
          </tr>
        )}
      </>
    );
  };

  return (
    <>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        tr:hover td { background: rgba(255,255,255,0.015); }
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
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setConfirmDel(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#0d1526",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(239,68,68,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <Trash2 size={22} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  margin: "0 0 8px",
                }}
              >
                Устгах уу?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.6)",
                  margin: 0,
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
                >
                  {confirmDel.label}
                </span>
              </p>
              {flatDirs.filter((d) => d.parent_id === confirmDel.id).length >
                0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(239,68,68,0.7)",
                    marginTop: 8,
                  }}
                >
                  ⚠️ Туслах{" "}
                  {flatDirs.filter((d) => d.parent_id === confirmDel.id).length}{" "}
                  чиглэл ч устгагдана
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDel(null)}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Болих
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? (
                  <Loader2
                    size={13}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <Trash2 size={13} />
                )}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
              {loading ? "..." : flatDirs.length + " чиглэл"}
            </span>
            {!loading && (
              <>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 11,
                    background: "rgba(59,130,246,0.1)",
                    color: "#60a5fa",
                  }}
                >
                  {mains} үндсэн
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 11,
                    background: "rgba(99,102,241,0.1)",
                    color: "#818cf8",
                  }}
                >
                  {subs} туслах
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 11,
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                  }}
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />
                  {active} идэвхтэй
                </span>
                {inactive > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      background: "rgba(148,163,184,0.1)",
                      color: "#94a3b8",
                    }}
                  >
                    {inactive} идэвхгүй
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={fetchDirections}
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
                  padding: "9px 16px",
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
                }}
              >
                <Plus size={14} /> Шинэ чиглэл
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#0d1526",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {loading ? (
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
          ) : flatDirs.length === 0 ? (
            <div style={{ padding: "56px 16px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.3)",
                  margin: 0,
                }}
              >
                Үйл ажиллагааны чиглэл байхгүй байна
              </p>
              {isSuperAdmin && (
                <button
                  onClick={() => setModalMode("create")}
                  style={{
                    marginTop: 16,
                    padding: "8px 18px",
                    borderRadius: 10,
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#60a5fa",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Эхний чиглэл нэмэх
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "Нэр", "Статус", "Нэмэгдсэн", ""].map((h, i) => (
                    <th
                      key={i}
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
                  ))}
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
          )}
        </div>
      </div>
    </>
  );
}
