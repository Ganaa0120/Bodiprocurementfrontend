"use client";
import { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Send,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { API, TYPE, STATUS, authH, jsonH, inp, lbl, fo, bl } from "./constants";
import { RichEditor } from "./RichEditor";
import { RecipientPicker } from "./RecipientPicker";
import type { Ann, AnnType } from "./types";

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

  // ── Track unsaved changes — Esc/close confirmation-д ашиглана ──
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

  // ── Confirmed close — мэдээлэл бичсэн бол сэрэмжлүүлнэ ──
  const safeClose = () => {
    if (isDirty && mode === "create") {
      const ok = window.confirm(
        "Бөглөсөн мэдээлэл устах болно. Үнэхээр гарах уу?",
      );
      if (!ok) return;
    }
    onClose();
  };

  // ── Esc key listener ──────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, mode]);

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
        },
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

  // ── Type selector (зөвхөн create горимд) ──────────────────
  if (mode === "create" && !step)
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
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#0d1526",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 32,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Зарлалын төрөл сонгох
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(148,163,184,0.4)",
                  marginTop: 2,
                }}
              >
                Зорилгоос хамааран сонгоно уу
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(Object.entries(TYPE) as [AnnType, (typeof TYPE)[AnnType]][]).map(
              ([t, c]) => {
                const I = c.icon;
                return (
                  <button
                    key={t}
                    onClick={() => setStep(t)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${c.color}25`,
                      transition: "all .15s",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = c.bg;
                      (e.currentTarget as HTMLElement).style.borderColor =
                        c.color + "60";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        c.color + "25";
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: c.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <I size={22} style={{ color: c.color }} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.9)",
                          marginBottom: 4,
                        }}
                      >
                        {c.label} зарлал
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(148,163,184,0.55)",
                        }}
                      >
                        {c.desc}
                      </div>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        padding: "20px 16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {mode === "create" && (
            <button
              onClick={() => {
                if (isDirty) {
                  const ok = window.confirm(
                    "Бөглөсөн мэдээлэл устах болно. Буцах уу?",
                  );
                  if (!ok) return;
                }
                setStep(null);
              }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                color: "rgba(148,163,184,0.6)",
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              ← Буцах
            </button>
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              flexShrink: 0,
              background: curType.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TIcon size={18} style={{ color: curType.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {mode === "create" ? "Шинэ" : "Засах"} — {curType.label} зарлал
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.4)",
                marginTop: 1,
              }}
            >
              {curType.desc}
            </div>
          </div>
          <button
            onClick={safeClose}
            title="Хаах (Esc)"
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle
              size={13}
              style={{ color: "#ef4444", flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "rgba(239,68,68,0.9)" }}>
              {error}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lbl}>Гарчиг *</label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              style={{ ...inp, height: 42 }}
              placeholder="Зарлалын гарчиг"
              onFocus={fo}
              onBlur={bl}
            />
          </div>
          <div>
            <label style={lbl}>Тайлбар</label>
            <RichEditor
              value={form.description}
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
              placeholder="Дэлгэрэнгүй тайлбар..."
            />
          </div>
          <div>
            <label style={lbl}>Нийлүүлэгчид тавих шаардлага</label>
            <textarea
              value={form.requirements}
              onChange={(e) =>
                setForm((p) => ({ ...p, requirements: e.target.value }))
              }
              rows={2}
              placeholder="Тусгай зөвшөөрөл, туршлага..."
              style={{ ...inp, resize: "vertical" as const }}
              onFocus={fo}
              onBlur={bl}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label style={lbl}>Категори</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category_id: e.target.value }))
                  }
                  style={{
                    ...inp,
                    height: 42,
                    cursor: "pointer",
                    paddingRight: 30,
                    appearance: "none" as const,
                  }}
                  onFocus={fo}
                  onBlur={bl}
                >
                  <option value="">— Сонгох —</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_number}. {c.category_name}
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
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, is_urgent: !p.is_urgent }))
              }
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 600,
                border: form.is_urgent
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: form.is_urgent
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: form.is_urgent ? "#ef4444" : "rgba(148,163,184,0.6)",
              }}
            >
              {form.is_urgent ? "⚡ Яаралтай" : "Яаралтай биш"}
            </button>
          </div>

          {dirs.length > 0 && (
            <div>
              <label style={lbl}>Үйл ажиллагааны чиглэл</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dirs.map((d) => {
                  const sel = form.activity_directions.includes(d.label);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDir(d.label)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 99,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        border: sel
                          ? "1px solid rgba(59,130,246,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                        background: sel
                          ? "rgba(59,130,246,0.12)"
                          : "rgba(255,255,255,0.03)",
                        color: sel ? "#60a5fa" : "rgba(148,163,184,0.55)",
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {annType === "rfq" && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: curType.color,
                }}
              >
                Үнийн санал — дэлгэрэнгүй
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lbl}>Тоо хэмжээ</label>
                  <input
                    type="number"
                    value={form.rfq_quantity}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rfq_quantity: e.target.value }))
                    }
                    style={{ ...inp, height: 42 }}
                    placeholder="100"
                    onFocus={fo}
                    onBlur={bl}
                  />
                </div>
                <div>
                  <label style={lbl}>Хэмжих нэгж</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={form.rfq_unit}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rfq_unit: e.target.value }))
                      }
                      style={{
                        ...inp,
                        height: 42,
                        appearance: "none",
                        paddingRight: 32,
                        cursor: "pointer",
                      }}
                      onFocus={fo}
                      onBlur={bl}
                    >
                      <option value="">Сонгох...</option>
                      {[
                        "Удаа",
                        "Багц",
                        "Хоног",
                        "Боодол",
                        "Ширхэг",
                        "Хайрцаг",
                        "Хос",
                        "м3",
                      ].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(148,163,184,0.5)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label style={lbl}>Хүргэлтийн газар</label>
                <input
                  value={form.rfq_delivery_place}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      rfq_delivery_place: e.target.value,
                    }))
                  }
                  style={{ ...inp, height: 42 }}
                  placeholder="Хаяг, байршил"
                  onFocus={fo}
                  onBlur={bl}
                />
              </div>
              <div>
                <label style={lbl}>Хүргэлтийн огноо</label>
                <input
                  type="date"
                  value={form.rfq_delivery_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      rfq_delivery_date: e.target.value,
                    }))
                  }
                  style={{ ...inp, height: 42 }}
                  onFocus={fo}
                  onBlur={bl}
                />
              </div>
              <div>
                <label style={lbl}>Техникийн тодорхойлолт</label>
                <textarea
                  value={form.rfq_specs}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rfq_specs: e.target.value }))
                  }
                  rows={3}
                  placeholder="Барааны стандарт, чанарын шаардлага..."
                  style={{ ...inp, resize: "vertical" as const }}
                  onFocus={fo}
                  onBlur={bl}
                />
              </div>
            </div>
          )}

          {(annType === "targeted" || annType === "rfq") && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: curType.color,
                  }}
                >
                  Хэнд илгээх
                </div>
                {annType === "rfq" && (
                  <span
                    style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}
                  >
                    Сонгоогүй бол бүх нийлүүлэгчид явна
                  </span>
                )}
              </div>
              <RecipientPicker
                form={form}
                setForm={setForm}
                directions={dirs}
                accentColor={curType.color}
                optional={annType === "rfq"}
              />
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 16,
            }}
          >
            <label style={lbl}>Төсөв</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 90px",
                gap: 8,
              }}
            >
              <input
                type="number"
                value={form.budget_from}
                onChange={(e) =>
                  setForm((p) => ({ ...p, budget_from: e.target.value }))
                }
                style={{ ...inp, height: 42 }}
                placeholder="Доод дүн"
                onFocus={fo}
                onBlur={bl}
              />
              <input
                type="number"
                value={form.budget_to}
                onChange={(e) =>
                  setForm((p) => ({ ...p, budget_to: e.target.value }))
                }
                style={{ ...inp, height: 42 }}
                placeholder="Дээд дүн"
                onFocus={fo}
                onBlur={bl}
              />
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currency: e.target.value }))
                }
                style={{ ...inp, height: 42, cursor: "pointer" }}
                onFocus={fo}
                onBlur={bl}
              >
                <option value="MNT">MNT</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Дуусах хугацаа</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((p) => ({ ...p, deadline: e.target.value }))
                }
                style={{ ...inp, height: 42, cursor: "pointer" }}
                onFocus={fo}
                onBlur={bl}
              />
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, status: e.target.value }))
                  }
                  style={{
                    ...inp,
                    height: 42,
                    cursor: "pointer",
                    paddingRight: 30,
                    appearance: "none" as const,
                  }}
                  onFocus={fo}
                  onBlur={bl}
                >
                  <option value="draft">Ноорог болгох</option>
                  <option value="published">Нийтлэх</option>
                  <option value="closed">Хаах</option>
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
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={safeClose}
              style={{
                flex: 1,
                height: 44,
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
            {form.status === "published" && (
              <button
                onClick={() => {
                  setForm((p) => ({ ...p, status: "draft" }));
                  setTimeout(save, 0);
                }}
                disabled={saving}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(148,163,184,0.7)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <FileText size={13} /> Ноорог
              </button>
            )}
            <button
              onClick={save}
              disabled={saving}
              style={{
                flex: 2,
                height: 44,
                borderRadius: 10,
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                background:
                  form.status === "published"
                    ? "linear-gradient(135deg,#059669,#10b981)"
                    : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
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
              ) : form.status === "published" ? (
                <Send size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {saving
                ? "Хадгалж байна..."
                : form.status === "published"
                  ? "Нийтлэх"
                  : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}