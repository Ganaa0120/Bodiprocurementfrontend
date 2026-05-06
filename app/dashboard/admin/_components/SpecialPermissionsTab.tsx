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
  Shield,
  ShieldCheck,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const getToken = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";

type PermType = {
  id: number;
  label: string;
  is_active: boolean;
  created_at?: string;
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  color: "rgba(255,255,255,0.85)",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.2s",
  resize: "vertical" as const,
  lineHeight: 1.5,
};

// PermTypeModal Component
function PermTypeModal({
  mode,
  item,
  onClose,
  onSave,
  showToast,
}: {
  mode: "create" | "edit";
  item?: PermType | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [label, setLabel] = useState(item?.label ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!label.trim()) {
      setError("Төрлийн нэр шаардлагатай");
      return;
    }
    if (label.length < 2) {
      setError("Төрлийн нэр хамгийн багадаа 2 тэмдэгт байх ёстой");
      return;
    }
    if (label.length > 1000) {
      setError("Төрлийн нэр хамгийн ихдээ 100 тэмдэгт байх ёстой");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url =
        mode === "create"
          ? `${API}/api/special-permission-types`
          : `${API}/api/special-permission-types/${item!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ label: label.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(
        mode === "create"
          ? "Төрөл амжилттай нэмэгдлээ ✓"
          : "Төрөл амжилттай хадгалагдлаа ✓",
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
    height: 48,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "0 16px",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };

  const isEditMode = mode === "edit";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
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
          maxWidth: 500,
          background: "linear-gradient(135deg, #0d1526, #0a1020)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          padding: 32,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: isEditMode
                  ? "rgba(99,102,241,0.12)"
                  : "rgba(16,185,129,0.12)",
                border: isEditMode
                  ? "1px solid rgba(99,102,241,0.25)"
                  : "1px solid rgba(16,185,129,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isEditMode ? (
                <Pencil size={24} style={{ color: "#a5b4fc" }} />
              ) : (
                <Shield size={24} style={{ color: "#34d399" }} />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.95)",
                  letterSpacing: "-0.3px",
                }}
              >
                {mode === "create" ? "Шинэ төрөл нэмэх" : "Төрөл засах"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.5)",
                  marginTop: 4,
                }}
              >
                {mode === "create"
                  ? "Тусгай зөвшөөрлийн шинэ төрөл үүсгэх"
                  : "Тусгай зөвшөөрлийн төрлийн мэдээлэл засах"}
              </div>
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
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(148,163,184,0.5)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertCircle
              size={16}
              style={{ color: "#f87171", flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(148,163,184,0.6)",
                display: "block",
                marginBottom: 10,
              }}
            >
              Төрлийн нэр <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={textareaStyle}
              placeholder="Жишээ: Барилгын тусгай зөвшөөрөл"
              rows={4} // ✅ 3 → 4 (илүү зай)
              autoFocus
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(99,102,241,0.6)";
                e.target.style.background = "rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.04)";
              }}
              onKeyDown={(e) => {
                // Ctrl+Enter дарвал хадгална
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <div
              style={{
                fontSize: 10,
                color: "rgba(148,163,184,0.4)",
                marginTop: 6,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Хамгийн багадаа 2 тэмдэгт</span>
              <span>{label.length}/100</span>
            </div>
          </div>

          {/* Info box for edit mode */}
          {isEditMode && item?.created_at && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Calendar size={14} style={{ color: "#a5b4fc" }} />
              <span style={{ fontSize: 11, color: "rgba(148,163,184,0.6)" }}>
                Үүсгэсэн:{" "}
                {new Date(item.created_at).toLocaleDateString("mn-MN")}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.7)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(148,163,184,0.7)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Болих
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                height: 50,
                borderRadius: 14,
                background: saving
                  ? "#4f46e5"
                  : "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: saving ? 0.7 : 1,
                transition: "all 0.2s",
                boxShadow: saving ? "none" : "0 4px 14px rgba(79,70,229,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(79,70,229,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(79,70,229,0.3)";
                }
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {mode === "create" ? "Төрөл нэмэх" : "Өөрчлөлт хадгалах"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main SpecialPermissionsTab Component
export function SpecialPermissionsTab({
  isSuperAdmin,
  showToast,
}: {
  isSuperAdmin: boolean;
  showToast: (msg: string, ok?: boolean) => void;
}) {
  const [items, setItems] = useState<PermType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<PermType | null>(null);
  const [confirmDel, setConfirmDel] = useState<PermType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/special-permission-types`);
      const data = await res.json();
      if (data.success) setItems(data.types ?? []);
    } catch {
      // Silent catch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggle = async (item: PermType) => {
    if (!isSuperAdmin) return;
    setToggling(item.id);
    try {
      const res = await fetch(
        `${API}/api/special-permission-types/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ is_active: !item.is_active }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, is_active: !x.is_active } : x,
        ),
      );
      showToast(`${item.label} → ${!item.is_active ? "Идэвхтэй" : "Идэвхгүй"}`);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel || !isSuperAdmin) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${API}/api/special-permission-types/${confirmDel.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${confirmDel.label} амжилттай устгагдлаа`);
      setItems((prev) => prev.filter((x) => x.id !== confirmDel.id));
      setConfirmDel(null);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDeleting(false);
    }
  };

  const active = items.filter((d) => d.is_active).length;
  const inactive = items.filter((d) => !d.is_active).length;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
        <PermTypeModal
          mode={modalMode}
          item={editTarget}
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
          onSave={() => {
            setModalMode(null);
            setEditTarget(null);
            fetchItems();
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
              maxWidth: 420,
              background: "#0d1526",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 28,
              padding: 32,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              animation: "modalIn 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                background: "rgba(239,68,68,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Trash2 size={28} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.95)",
                  margin: "0 0 8px",
                }}
              >
                Төрөл устгах
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.5)",
                  margin: 0,
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
                >
                  "{confirmDel.label}"
                </span>{" "}
                төрлийг бүрмөсөн устгах уу?
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(239,68,68,0.5)",
                  marginTop: 12,
                }}
              >
                ⚠️ Энэ үйлдлийг буцаах боломжгүй
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmDel(null)}
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
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
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
                    size={16}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <Trash2 size={16} />
                )}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "white",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Shield size={20} style={{ color: "#8b5cf6" }} />
              Тусгай зөвшөөрлийн төрлүүд
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Нийт {items.length} төрлийн зөвшөөрөл
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
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34d399",
                }}
              >
                <ShieldCheck size={12} /> Идэвхтэй: {active}
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
                  <EyeOff size={12} /> Идэвхгүй: {inactive}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={fetchItems}
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
                  <Plus size={14} /> Шинэ төрөл
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
          ) : items.length === 0 ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <Shield
                size={48}
                style={{
                  color: "#334155",
                  margin: "0 auto 16px",
                  display: "block",
                }}
              />
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Тусгай зөвшөөрлийн төрөл байхгүй байна
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
                  + Эхний төрөл нэмэх
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 600,
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
                      Төрлийн нэр
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
                      Нэмэгдсэн
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
                  {items.map((item, idx) => (
                    <tr key={item.id} className="perm-row">
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: "#64748b",
                          width: 60,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </td>
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
                              flexShrink: 0,
                              background: item.is_active
                                ? "rgba(99,102,241,0.12)"
                                : "rgba(148,163,184,0.08)",
                              border: item.is_active
                                ? "1px solid rgba(99,102,241,0.25)"
                                : "1px solid rgba(148,163,184,0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: item.is_active ? "#a5b4fc" : "#64748b",
                            }}
                          >
                            {item.label[0]?.toUpperCase()}
                          </div>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: item.is_active
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={toggling === item.id || !isSuperAdmin}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 14px",
                            borderRadius: 30,
                            cursor: isSuperAdmin ? "pointer" : "default",
                            fontSize: 11,
                            fontWeight: 600,
                            background: item.is_active
                              ? "rgba(16,185,129,0.12)"
                              : "rgba(148,163,184,0.1)",
                            color: item.is_active ? "#34d399" : "#94a3b8",
                            border: item.is_active
                              ? "1px solid rgba(16,185,129,0.2)"
                              : "1px solid rgba(148,163,184,0.15)",
                            opacity: toggling === item.id ? 0.6 : 1,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (isSuperAdmin && toggling !== item.id) {
                              e.currentTarget.style.transform = "scale(1.02)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isSuperAdmin && toggling !== item.id) {
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                        >
                          {toggling === item.id ? (
                            <Loader2
                              size={12}
                              style={{ animation: "spin 0.8s linear infinite" }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: item.is_active
                                  ? "#10b981"
                                  : "#94a3b8",
                              }}
                            />
                          )}
                          {item.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                        </button>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Calendar size={12} style={{ color: "#475569" }} />
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(
                                "mn-MN",
                              )
                            : "—"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {isSuperAdmin && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => {
                                setEditTarget(item);
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
                              onClick={() => setConfirmDel(item)}
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
                                e.currentTarget.style.background =
                                  "rgba(239,68,68,0.1)";
                                e.currentTarget.style.borderColor =
                                  "rgba(239,68,68,0.3)";
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
