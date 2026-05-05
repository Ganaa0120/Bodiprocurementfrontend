"use client";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Send,
  CheckCircle2,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  Layers,
  Zap,
} from "lucide-react";
import { API, TYPE, jsonH, inp, lbl, fo, bl } from "./constants";
import dynamic from "next/dynamic";
import { RecipientPicker } from "./RecipientPicker";
import type { Ann, AnnType, AttachedFile } from "./types";

// Dynamic import - SSR алдааг засах
const RichTextEditor = dynamic(
  () => import("./RichEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "40px 20px",
        textAlign: "center",
        background: "rgba(255,255,255,0.03)",
      }}>
        <Loader2 size={20} style={{ animation: "spin 0.8s linear infinite", color: "#94a3b8" }} />
      </div>
    ),
  }
);

const defaultForm = (ann?: Ann | null) => ({
  title: ann?.title ?? "",
  description: ann?.description ?? "",
  requirements: ann?.requirements ?? "",
  category_id: ann?.category_id ?? "",
  budget_from: ann?.budget_from?.toString() ?? "",
  budget_to: ann?.budget_to?.toString() ?? "",
  currency: ann?.currency ?? "MNT",
  deadline: ann?.deadline?.slice(0, 10) ?? "",
  status: ann?.status ?? "draft",
  is_urgent: ann?.is_urgent ?? false,
  activity_directions: ann?.activity_directions ?? ([] as string[]),
  rfq_quantity: ann?.rfq_quantity?.toString() ?? "",
  rfq_unit: ann?.rfq_unit ?? "",
  rfq_delivery_place: ann?.rfq_delivery_place ?? "",
  rfq_delivery_date: ann?.rfq_delivery_date?.slice(0, 10) ?? "",
  rfq_specs: ann?.rfq_specs ?? "",
  recipient_type: "individual" as "individual" | "company",
  attachments: ann?.attachments ?? ([] as AttachedFile[]),
  recipient_ids: [] as string[],
});

export function AnnModal({
  mode,
  ann,
  onClose,
  onSave,
  showToast,
}: {
  mode: "create" | "edit";
  ann?: Ann | null;
  onClose: () => void;
  onSave: () => void;
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [step, setStep] = useState<AnnType | null>(ann?.ann_type ?? null);
  const [form, setForm] = useState(defaultForm(ann));
  const [cats, setCats] = useState<any[]>([]);
  const [dirs, setDirs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const annType = (mode === "edit" ? ann?.ann_type : step) ?? "open";
  const curType = TYPE[annType];
  const TIcon = curType.icon;

  const isDirty =
    form.title.trim() !== "" ||
    form.description.trim() !== "" ||
    form.requirements.trim() !== "" ||
    form.recipient_ids.length > 0 ||
    form.activity_directions.length > 0 ||
    form.budget_from !== "" ||
    form.budget_to !== "" ||
    form.rfq_quantity !== "" ||
    form.rfq_specs !== "";

  // Body scroll унтраах
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const safeClose = useCallback(() => {
    if (isDirty && mode === "create") {
      const ok = window.confirm("Бөглөсөн мэдээлэл устах болно. Үнэхээр гарах уу?");
      if (!ok) return;
    }
    onClose();
  }, [isDirty, mode, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [safeClose]);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((d) => {
        const flat: any[] = [];
        const walk = (c: any[]) =>
          c.forEach((x) => {
            flat.push(x);
            walk(x.children ?? []);
          });
        walk(d.categories ?? []);
        setCats(flat);
      })
      .catch(() => {});
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        setDirs((d.directions ?? []).filter((x: any) => x.is_active));
      })
      .catch(() => {});
  }, []);

  const toggleDir = (l: string) =>
    setForm((p) => ({
      ...p,
      activity_directions: p.activity_directions.includes(l)
        ? p.activity_directions.filter((x) => x !== l)
        : [...p.activity_directions, l],
    }));

  const save = async () => {
    if (!form.title.trim()) {
      setError("Гарчиг шаардлагатай");
      return;
    }
    if (annType === "targeted" && form.recipient_ids.length === 0) {
      setError("Нийлүүлэгч сонгоно уу");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: any = {
        ...form,
        ann_type: annType,
        budget_from: form.budget_from ? Number(form.budget_from) : null,
        budget_to: form.budget_to ? Number(form.budget_to) : null,
        rfq_quantity: form.rfq_quantity ? Number(form.rfq_quantity) : null,
        category_id: form.category_id || null,
        deadline: form.deadline || null,
        rfq_delivery_date: form.rfq_delivery_date || null,
      };
      if (annType !== "targeted" && annType !== "rfq") {
        delete body.recipient_ids;
        delete body.recipient_type;
      }
      if (annType === "rfq" && body.recipient_ids?.length === 0) {
        delete body.recipient_ids;
        delete body.recipient_type;
      }

      const res = await fetch(
        mode === "create"
          ? `${API}/api/announcements`
          : `${API}/api/announcements/${ann!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: jsonH(),
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(mode === "create" ? "Зарлал үүслээ ✓" : "Хадгаллаа ✓");
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Type selector
  if (mode === "create" && !step) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          padding: "20px",
        }}
        onClick={safeClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#1e293b",
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
            animation: "fadeIn 0.2s ease",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>
                Зарлалын төрөл сонгох
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Зорилгоос хамааран сонгоно уу
              </p>
            </div>
            <button
              onClick={safeClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: 8,
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(Object.entries(TYPE) as [AnnType, (typeof TYPE)[AnnType]][]).map(([t, c]) => {
              const I = c.icon;
              return (
                <button
                  key={t}
                  onClick={() => setStep(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    background: "#334155",
                    border: `1px solid ${c.color}30`,
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.color;
                    e.currentTarget.style.background = `${c.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${c.color}30`;
                    e.currentTarget.style.background = "#334155";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `${c.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I size={22} style={{ color: c.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>
                      {c.label} зарлал
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                      {c.desc}
                    </div>
                  </div>
                  <ChevronDown size={16} style={{ color: "#64748b" }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
        overflowY: "auto",
      }}
      onClick={safeClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#1e293b",
          borderRadius: 24,
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
          animation: "fadeIn 0.2s ease",
          margin: "auto",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {mode === "create" && (
            <button
              onClick={() => {
                if (isDirty) {
                  const ok = window.confirm("Бөглөсөн мэдээлэл устах болно. Буцах уу?");
                  if (!ok) return;
                }
                setStep(null);
              }}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 500,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              ← Буцах
            </button>
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: `${curType.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TIcon size={18} style={{ color: curType.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>
              {mode === "create" ? "Шинэ" : "Засах"} — {curType.label} зарлал
            </h3>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              {curType.desc}
            </p>
          </div>
          <button
            onClick={safeClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Title */}
            <div>
              <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600 }}>
                Гарчиг <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                style={{
                  ...inp,
                  height: 44,
                  background: "#334155",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  color: "white",
                }}
                placeholder="Зарлалын гарчиг"
                onFocus={(e) => {
                  e.target.style.borderColor = curType.color;
                  e.target.style.boxShadow = `0 0 0 2px ${curType.color}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600 }}>Тайлбар</label>
              <RichTextEditor
                value={form.description}
                onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                placeholder="Дэлгэрэнгүй тайлбар..."
                files={form.attachments}
                onFilesChange={(files) => setForm((p) => ({ ...p, attachments: files }))}
                accentColor={curType.color}
              />
            </div>

            {/* Requirements */}
            <div>
              <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600 }}>Нийлүүлэгчид тавих шаардлага</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
                rows={2}
                placeholder="Тусгай зөвшөөрөл, туршлага..."
                style={{
                  ...inp,
                  background: "#334155",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  color: "white",
                  resize: "vertical",
                  padding: "10px 14px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = curType.color;
                  e.target.style.boxShadow = `0 0 0 2px ${curType.color}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Category + Urgent */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600 }}>Категори</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    style={{
                      ...inp,
                      height: 44,
                      background: "#334155",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      cursor: "pointer",
                      appearance: "none",
                      paddingRight: 32,
                      color: "white",
                    }}
                  >
                    <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>— Сонгох —</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: "#1e293b", color: "white" }}>
                        {c.category_number}. {c.category_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, is_urgent: !p.is_urgent }))}
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  border: form.is_urgent ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.15)",
                  background: form.is_urgent ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                  color: form.is_urgent ? "#f87171" : "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                <Zap size={14} />
                {form.is_urgent ? "Яаралтай" : "Яаралтай биш"}
              </button>
            </div>

            {/* Activity Directions */}
            {dirs.length > 0 && (
              <div>
                <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <Layers size={12} style={{ marginRight: 6, color: "#94a3b8" }} />
                  Үйл ажиллагааны чиглэл
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {dirs.map((d) => {
                    const sel = form.activity_directions.includes(d.label);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDir(d.label)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: "pointer",
                          border: sel ? `1px solid ${curType.color}` : "1px solid rgba(255,255,255,0.12)",
                          background: sel ? `${curType.color}20` : "rgba(255,255,255,0.05)",
                          color: sel ? curType.color : "#cbd5e1",
                          transition: "all 0.15s",
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RFQ Details */}
            {annType === "rfq" && (
              <div style={{ background: "#334155", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: curType.color, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={12} /> Үнийн санал
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <input
                      type="number"
                      value={form.rfq_quantity}
                      onChange={(e) => setForm((p) => ({ ...p, rfq_quantity: e.target.value }))}
                      style={{ ...inp, height: 40, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "white" }}
                      placeholder="Тоо хэмжээ"
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.rfq_unit}
                      onChange={(e) => setForm((p) => ({ ...p, rfq_unit: e.target.value }))}
                      style={{ ...inp, height: 40, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer", appearance: "none", paddingRight: 28, color: "white" }}
                    >
                      <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>Нэгж сонгох</option>
                      {["Ширхэг", "Багц", "Хоног", "Боодол", "Хайрцаг", "Хос", "м3", "тонн"].map((u) => (
                        <option key={u} value={u} style={{ background: "#1e293b", color: "white" }}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    value={form.rfq_delivery_place}
                    onChange={(e) => setForm((p) => ({ ...p, rfq_delivery_place: e.target.value }))}
                    style={{ ...inp, height: 40, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "white" }}
                    placeholder="Хүргэлтийн газар"
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    type="date"
                    value={form.rfq_delivery_date}
                    onChange={(e) => setForm((p) => ({ ...p, rfq_delivery_date: e.target.value }))}
                    style={{ ...inp, height: 40, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "white" }}
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <textarea
                    value={form.rfq_specs}
                    onChange={(e) => setForm((p) => ({ ...p, rfq_specs: e.target.value }))}
                    rows={2}
                    style={{ ...inp, background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, resize: "vertical", padding: "10px 14px", color: "white" }}
                    placeholder="Техникийн тодорхойлолт"
                  />
                </div>
              </div>
            )}

            {/* Recipients */}
            {(annType === "targeted" || annType === "rfq") && (
              <div>
                <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={14} style={{ color: "#94a3b8" }} /> Хэнд илгээх
                  {annType === "rfq" && <span style={{ fontSize: 10, color: "#64748b" }}>(сонгоогүй бол бүгдэд)</span>}
                </label>
                <RecipientPicker
                  form={form}
                  setForm={setForm}
                  directions={dirs}
                  accentColor={curType.color}
                  optional={annType === "rfq"}
                />
              </div>
            )}

            {/* Budget */}
            <div>
              <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <DollarSign size={12} style={{ marginRight: 4, color: "#94a3b8" }} />
                Төсөв
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 8 }}>
                <input
                  type="number"
                  value={form.budget_from}
                  onChange={(e) => setForm((p) => ({ ...p, budget_from: e.target.value }))}
                  style={{ ...inp, height: 44, background: "#334155", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "white" }}
                  placeholder="Доод дүн"
                />
                <input
                  type="number"
                  value={form.budget_to}
                  onChange={(e) => setForm((p) => ({ ...p, budget_to: e.target.value }))}
                  style={{ ...inp, height: 44, background: "#334155", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "white" }}
                  placeholder="Дээд дүн"
                />
                <div style={{ position: "relative" }}>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                    style={{ ...inp, height: 44, background: "#334155", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", appearance: "none", paddingRight: 28, color: "white" }}
                  >
                    <option value="MNT" style={{ background: "#1e293b" }}>₮ MNT</option>
                    <option value="USD" style={{ background: "#1e293b" }}>$ USD</option>
                    <option value="EUR" style={{ background: "#1e293b" }}>€ EUR</option>
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* Deadline + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={12} style={{ marginRight: 4, color: "#94a3b8" }} />
                  Дуусах хугацаа
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  style={{ ...inp, height: 44, background: "#334155", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", color: "white" }}
                />
              </div>
              <div>
                <label style={{ ...lbl, color: "#cbd5e1", fontWeight: 600 }}>Статус</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    style={{ ...inp, height: 44, background: "#334155", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, cursor: "pointer", appearance: "none", paddingRight: 28, color: "white" }}
                  >
                    <option value="draft" style={{ background: "#1e293b" }}>📄 Ноорог</option>
                    <option value="published" style={{ background: "#1e293b" }}>🌍 Нийтлэх</option>
                    <option value="closed" style={{ background: "#1e293b" }}>🔒 Хаах</option>
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={safeClose}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#94a3b8",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                Болих
              </button>
              <button
                onClick={() => {
                  if (form.status === "published") {
                    setForm((p) => ({ ...p, status: "draft" }));
                    setTimeout(save, 0);
                  } else save();
                }}
                disabled={saving}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 10,
                  border: "none",
                  background: form.status === "published"
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "linear-gradient(135deg, #4f46e5, #6366f1)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: saving ? 0.7 : 1,
                  transition: "all 0.15s",
                }}
              >
                {saving ? (
                  <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                ) : form.status === "published" ? (
                  <Send size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {saving ? "Хадгалж байна..." : form.status === "published" ? "Нийтлэх" : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}