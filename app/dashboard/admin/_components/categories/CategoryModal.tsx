"use client";
import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { API, getToken, inp, lbl, focus, blur, flatCats } from "./constants";
import type { Category } from "./types";

const PREFIXES = [
  { value: "", label: "— Угтвар байхгүй —" },
  { value: "ITEM", label: "ITEM — Бараа" },
  { value: "FA", label: "FA — Хөрөнгө" },
  // { value:"SVC",  label:"SVC — Үйлчилгээ"     },
  // { value:"MAT",  label:"MAT — Материал"       },
  // { value:"EQP",  label:"EQP — Тоног төхөөрөмж" },
];

export function CategoryModal({
  mode,
  category,
  categories,
  onClose,
  onSave,
  showToast,
}: {
  mode: "create" | "edit";
  category?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, ok?: boolean) => void;
}) {
  const [form, setForm] = useState({
    category_prefix: (category as any)?.category_prefix ?? "",
    category_number: category?.category_number?.toString() ?? "",
    category_name: category?.category_name ?? "",
    parent_id: category?.parent_id ?? "",
    status: category?.status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parentOptions = flatCats(categories, 0, category?.id);

  // Preview: FA-200 гэх мэт
  const codePreview = form.category_prefix
    ? `${form.category_prefix}-${form.category_number || "???"}`
    : form.category_number || "???";

  const handleSave = async () => {
    if (!form.category_number.trim() || !form.category_name.trim()) {
      setError("Дугаар болон нэр шаардлагатай");
      return;
    }
    if (isNaN(Number(form.category_number))) {
      setError("Дугаар нь тоо байх ёстой");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url =
        mode === "create"
          ? `${API}/api/categories`
          : `${API}/api/categories/${category!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          category_prefix: form.category_prefix || null,
          category_number: Number(form.category_number),
          category_name: form.category_name,
          parent_id: form.parent_id || null,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(
        mode === "create" ? "Ангилал үүслээ ✓" : "Амжилттай хадгаллаа ✓",
      );
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
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
          maxWidth: 500,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn .25s ease",
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
              {mode === "create" ? "Шинэ ангилал нэмэх" : "Ангилал засах"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.4)",
                marginTop: 2,
              }}
            >
              Зөвхөн Супер Админ
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
          {/* ── Код preview ── */}
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>
              Ангилалын код:
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#60a5fa",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {codePreview}
            </span>
          </div>

          {/* ── Угтвар + Дугаар ── */}
          <div>
            <label style={lbl}>Ангилал төрөл сонгох *</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 100px",
                gap: 8,
              }}
            >
              {/* Угтвар select */}
              <div style={{ position: "relative" }}>
                <select
                  value={form.category_prefix}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category_prefix: e.target.value }))
                  }
                  style={{
                    ...inp,
                    cursor: "pointer",
                    paddingRight: 28,
                    appearance: "none" as const,
                  }}
                  onFocus={focus}
                  onBlur={blur}
                >
                  {PREFIXES.map((p) => (
                    <option key={p.value} value={p.value} className="bg-slate-700">
                      {p.label}
                    </option>
                  ))}
                </select>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(148,163,184,0.4)"
                  strokeWidth={2}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {/* Дугаар input */}
              <input
                type="number"
                value={form.category_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category_number: e.target.value }))
                }
                style={{
                  ...inp,
                  textAlign: "center" as const,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
                placeholder="200"
                onFocus={focus}
                onBlur={blur}
              />
            </div>
          </div>

          {/* ── Нэр ── */}
          <div>
            <label style={lbl}>Нэр *</label>
            <input
              value={form.category_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, category_name: e.target.value }))
              }
              style={inp}
              placeholder="Ангилалын нэр"
              onFocus={focus}
              onBlur={blur}
            />
          </div>

          {/* ── Эх категори ── */}
          <div>
            <label style={lbl}>Эх ангилал (сонголттой)</label>
            <select
              value={form.parent_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, parent_id: e.target.value }))
              }
              style={{ ...inp, cursor: "pointer" }}
              onFocus={focus}
              onBlur={blur}
            >
              <option value="">— Эх ангилал байхгүй —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* ── Статус ── */}
          <div>
            <label style={lbl}>Статус</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { v: "active", l: "Идэвхтэй" },
                { v: "inactive", l: "Идэвхгүй" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, status: v }))}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 9,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    border:
                      form.status === v
                        ? "1px solid rgba(59,130,246,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      form.status === v
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(255,255,255,0.04)",
                    color:
                      form.status === v ? "#60a5fa" : "rgba(148,163,184,0.6)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Buttons ── */}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
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
