"use client";
// ════════════════════════════════════════════════════════════════
//  AnnModal — orchestrator (4 алхамт WIZARD)
//  State эзэмшиж, өгөгдөл татаж, section-уудыг алхам алхмаар угсарна
// ════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, Fragment } from "react";
import {
  X,
  AlertCircle,
  Loader2,
  Send,
  CheckCircle2,
  Check,
  ChevronDown,
  ClipboardList,
  Layers,
  Users,
  FileText,
} from "lucide-react";
import { API, TYPE, jsonH, authH } from "./constants";
import type { Ann, AnnType } from "./types";
import { defaultForm, inputStyle } from "./annModal.config";
import { Field } from "./annModal.ui";
import { InvitationSection } from "./InvitationSection";
import {
  TypeSelector,
  BasicInfoSection,
  ScheduleSection,
  CategorySection,
  RfqSection,
  RecipientsField,
  SupplySection,
  DocumentsSection,
} from "./annModal.sections";

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
  const [wstep, setWstep] = useState(0); // wizard алхам 0..3
  const [form, setForm] = useState(defaultForm(ann));
  const [cats, setCats] = useState<any[]>([]);
  const [dirs, setDirs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [permTypes, setPermTypes] = useState<any[]>([]);
  const [invCompanies, setInvCompanies] = useState<any[]>([]);
  const [invPersons, setInvPersons] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  const annType = (mode === "edit" ? ann?.ann_type : step) ?? "open";
  const curType = TYPE[annType];
  const TIcon = curType.icon;
  const accentColor = curType.color;

  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // 🎯 Form-ийн "цэвэр" суурь — autofill хийсний дараах төлөв
  // isDirty шалгахдаа үүнтэй харьцуулна
  const [baseline, setBaseline] = useState<string>(() =>
    JSON.stringify(defaultForm(ann)),
  );

  // ── Wizard алхмууд (төрлөөс хамаарч 3-р алхмын нэр өөрчлөгдөнө) ──
  const STEPS = [
    { key: "basic", label: "Үндсэн", icon: ClipboardList },
    { key: "details", label: "Дэлгэрэнгүй", icon: Layers },
    {
      key: "recipients",
      label: annType === "open" ? "Урилга" : "Хүлээн авагч",
      icon: annType === "open" ? Send : Users,
    },
    { key: "docs", label: "Баримт", icon: FileText },
  ];
  const LAST = STEPS.length - 1;

  const isDirty = JSON.stringify(form) !== baseline;

  // Body scroll унтраах
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const safeClose = useCallback(() => {
    if (isDirty && mode === "create") {
      setConfirmDialog({
        message: "Бөглөсөн мэдээлэл устах болно. Үнэхээр гарах уу?",
        confirmText: "Тийм, гарах",
        onConfirm: onClose,
      });
      return;
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

  // Categories + activity directions
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

  // Тусгай зөвшөөрлийн master types (1 удаа)
  useEffect(() => {
    fetch(`${API}/api/special-permission-types`, { headers: authH() })
      .then((r) => r.json())
      .then((d) => {
        setPermTypes((d.types || []).filter((t: any) => t.is_active));
      })
      .catch(() => {});
  }, []);

  // Нээлттэй type-д урилгын pool (companies + persons)
  useEffect(() => {
    if (annType !== "open") return;
    setInvLoading(true);
    Promise.all([
      fetch(`${API}/api/organizations?limit=500`, { headers: authH() }).then(
        (r) => r.json(),
      ),
      fetch(`${API}/api/persons?limit=500`, { headers: authH() }).then((r) =>
        r.json(),
      ),
    ])
      .then(([orgsData, persData]) => {
        setInvCompanies(orgsData.organizations || orgsData.data || []);
        setInvPersons(persData.persons || persData.data || []);
      })
      .catch(() => {})
      .finally(() => setInvLoading(false));
  }, [annType]);

  // Auto-fill — localStorage-аас админы мэдээлэл
  // Auto-fill — localStorage-аас админы мэдээлэл + baseline шинэчлэх
  useEffect(() => {
    if (mode !== "create") return;
    try {
      const raw =
        localStorage.getItem("super_admin_user") ||
        localStorage.getItem("user");
      if (!raw) return;

      const user = JSON.parse(raw);
      const phone = user?.phone ?? user?.contact_phone ?? "";
      const company = user?.company_name ?? user?.company ?? "";
      const fullName =
        `${user?.last_name ?? ""} ${user?.first_name ?? ""}`.trim() ||
        user?.name ||
        "";
      const position =
        user?.position ?? user?.job_title ?? user?.role_title ?? "";

      setForm((p) => {
        const next = {
          ...p,
          contact_phone: p.contact_phone || phone,
          client_company: p.client_company || company,
          responsible_person_name: p.responsible_person_name || fullName,
          responsible_position: p.responsible_position || position,
        };
        // 🎯 Autofill хийсний дараах төлөвийг "цэвэр" гэж тэмдэглэнэ
        // Ингэснээр autofill нь dirty гэж тоологдохгүй
        setBaseline(JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error("AUTOFILL ERROR:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Алхам бүрийн шалгалт ──
  const validateStep = (i: number): string => {
    if (i === 0 && !form.title.trim()) return "Зарын нэр шаардлагатай";
    if (i === 2 && annType === "targeted" && form.recipient_ids.length === 0)
      return "Нийлүүлэгч сонгоно уу";
    return "";
  };

  const goNext = () => {
    const e = validateStep(wstep);
    if (e) {
      setError(e);
      return;
    }
    setError("");
    setWstep((s) => Math.min(s + 1, LAST));
  };

  const goBack = () => {
    setError("");
    setWstep((s) => Math.max(s - 1, 0));
  };

  // Stepper дээр дарж алхам сонгох (урагшаа үсрэхэд одоогийн алхмыг шалгана)
  const goTo = (i: number) => {
    if (i > wstep) {
      const e = validateStep(wstep);
      if (e) {
        setError(e);
        return;
      }
    }
    setError("");
    setWstep(i);
  };

  // ════════════════════════════════════════════════════════════════
  //  SAVE
  // ════════════════════════════════════════════════════════════════
  const save = async () => {
    if (!form.title.trim()) {
      setError("Зарын нэр шаардлагатай");
      setWstep(0);
      return;
    }
    if (annType === "targeted" && form.recipient_ids.length === 0) {
      setError("Нийлүүлэгч сонгоно уу");
      setWstep(2);
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
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        supply_start_date: form.supply_start_date || null,
        supply_end_date: form.supply_end_date || null,
      };

      if (annType !== "targeted" && annType !== "rfq") {
        delete body.recipient_ids;
        delete body.recipient_type;
      }
      if (annType === "rfq" && body.recipient_ids?.length === 0) {
        delete body.recipient_ids;
        delete body.recipient_type;
      }
      // Урилгын талбарууд зөвхөн нээлттэй type-д л явна
      if (annType !== "open") {
        delete body.invitation_permission_types;
        delete body.invitation_company_ids;
        delete body.invitation_person_ids;
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

  // ── TYPE SELECTOR (create эхэнд) ──
  if (mode === "create" && !step) {
    return (
      <TypeSelector
        onSelect={(t) => {
          setStep(t);
          setWstep(0);
        }}
        onClose={safeClose}
      />
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  MAIN MODAL (WIZARD)
  // ════════════════════════════════════════════════════════════════
  return (
    <>
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
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
      >
        <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes stepIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

        <div
          style={{
            width: "100%",
            maxWidth: 760,
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            background: "#1e293b",
            borderRadius: 24,
            boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
            animation: "fadeIn 0.2s ease",
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            {mode === "create" && wstep === 0 && (
              <button
                onClick={() => {
                  if (isDirty) {
                    setConfirmDialog({
                      message: "Бөглөсөн мэдээлэл устах болно. Буцах уу?",
                      confirmText: "Тийм, буцах",
                      onConfirm: () => {
                        setStep(null);
                        setWstep(0);
                      },
                    });
                    return;
                  }
                  setStep(null);
                  setWstep(0);
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
                  whiteSpace: "nowrap",
                }}
              >
                ← Төрөл
              </button>
            )}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                background: `${accentColor}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TIcon size={18} style={{ color: accentColor }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {mode === "create" ? "Шинэ" : "Засах"} — {curType.label}
              </h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                Алхам {wstep + 1} / {STEPS.length} · {STEPS[wstep].label}
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
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── STEPPER ── */}
          <div
            style={{
              padding: "16px 24px 4px",
              display: "flex",
              alignItems: "flex-start",
              flexShrink: 0,
            }}
          >
            {STEPS.map((s, i) => {
              const done = i < wstep;
              const current = i === wstep;
              const SIcon = s.icon;
              return (
                <Fragment key={s.key}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      width: 70,
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        transition: "all 0.15s",
                        background:
                          current || done
                            ? accentColor
                            : "rgba(255,255,255,0.06)",
                        color: current || done ? "white" : "#64748b",
                        border: current
                          ? `2px solid ${accentColor}`
                          : "2px solid transparent",
                        boxShadow: current
                          ? `0 0 0 4px ${accentColor}25`
                          : "none",
                      }}
                    >
                      {done ? <Check size={16} /> : <SIcon size={15} />}
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: current ? 700 : 500,
                        color: current
                          ? accentColor
                          : done
                            ? "#cbd5e1"
                            : "#64748b",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < LAST && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        marginTop: 16,
                        borderRadius: 2,
                        background:
                          i < wstep ? accentColor : "rgba(255,255,255,0.1)",
                        transition: "all 0.2s",
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* ── BODY (одоогийн алхам) ── */}
          <div
            style={{
              padding: "16px 24px",
              overflowY: "auto",
              flex: 1,
            }}
          >
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
                  marginBottom: 16,
                }}
              >
                <AlertCircle
                  size={14}
                  style={{ color: "#f87171", flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
              </div>
            )}

            <div
              key={wstep}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                animation: "stepIn 0.2s ease",
              }}
            >
              {/* STEP 0 — Үндсэн */}
              {wstep === 0 && (
                <>
                  <Field label="Зарын нэр" required>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                      style={inputStyle}
                      placeholder="Зарлалын гарчиг"
                      onFocus={(e) => {
                        e.target.style.borderColor = accentColor;
                        e.target.style.boxShadow = `0 0 0 2px ${accentColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.12)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Field>
                  <BasicInfoSection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                  />
                  <ScheduleSection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                  />
                </>
              )}

              {/* STEP 1 — Зарын дэлгэрэнгүй */}
              {wstep === 1 && (
                <>
                  <CategorySection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                    cats={cats}
                    dirs={dirs}
                  />
                  {annType === "rfq" && (
                    <RfqSection
                      form={form}
                      setForm={setForm}
                      accentColor={accentColor}
                    />
                  )}
                </>
              )}

              {/* STEP 2 — Хүлээн авагч / Урилга */}
              {wstep === 2 &&
                (annType === "open" ? (
                  <InvitationSection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                    permTypes={permTypes}
                    invCompanies={invCompanies}
                    invPersons={invPersons}
                    invLoading={invLoading}
                  />
                ) : (
                  <RecipientsField
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                    dirs={dirs}
                    annType={annType}
                  />
                ))}

              {/* STEP 3 — Баримт ба нийтлэх */}
              {wstep === 3 && (
                <>
                  <SupplySection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                  />
                  <DocumentsSection
                    form={form}
                    setForm={setForm}
                    accentColor={accentColor}
                  />
                  <Field label="Статус">
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, status: e.target.value }))
                        }
                        style={{
                          ...inputStyle,
                          cursor: "pointer",
                          appearance: "none",
                          paddingRight: 28,
                        }}
                      >
                        <option value="draft" style={{ background: "#1e293b" }}>
                          📄 Ноорог
                        </option>
                        <option
                          value="published"
                          style={{ background: "#1e293b" }}
                        >
                          🌍 Нийтлэх
                        </option>
                        <option
                          value="closed"
                          style={{ background: "#1e293b" }}
                        >
                          🔒 Хаах
                        </option>
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
                  </Field>
                </>
              )}
            </div>
          </div>

          {/* ── FOOTER (навигаци) ── */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 10,
              flexShrink: 0,
              background: "rgba(0,0,0,0.15)",
            }}
          >
            <button
              onClick={wstep === 0 ? safeClose : goBack}
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
              }}
            >
              {wstep === 0 ? "Болих" : "← Өмнөх"}
            </button>

            {wstep < LAST ? (
              <button
                onClick={goNext}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                Дараах →
              </button>
            ) : (
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 10,
                  border: "none",
                  background:
                    form.status === "published"
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  ConfirmDialog — gar хийсэн confirm modal
// ════════════════════════════════════════════════════════════════
function ConfirmDialog({
  message,
  confirmText,
  cancelText = "Үгүй",
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#1e293b",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "fadeIn 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <AlertCircle size={26} style={{ color: "#f59e0b" }} />
        </div>

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            margin: "0 0 22px",
            textAlign: "center",
            lineHeight: 1.55,
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
