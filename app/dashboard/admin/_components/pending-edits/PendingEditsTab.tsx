// app/dashboard/admin/_components/pending-edits/PendingEditsTab.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Clock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const tok = () =>
  localStorage.getItem("super_admin_token") ||
  localStorage.getItem("token") ||
  "";

// Талбарын нэрсийг Mongolian-аар харуулах
const FIELD_LABELS: Record<string, string> = {
  company_name: "Байгууллагын нэр",
  company_name_en: "Англи нэр",
  phone: "Утас",
  register_number: "Регистрийн дугаар",
  state_registry_number: "Улсын бүртгэл №",
  established_date: "Үүсгэн байгуулагдсан огноо",
  employee_count: "Ажилчдын тоо",
  is_vat_payer: "НӨАТ төлөгч",
  vat_number: "НӨАТ дугаар",
  is_iso_certified: "ISO сертификат",
  has_special_permission: "Тусгай зөвшөөрөлтэй",
  aimag_niislel: "Аймаг/Нийслэл",
  sum_duureg: "Сум/Дүүрэг",
  bag_horoo: "Баг/Хороо",
  address: "Дэлгэрэнгүй хаяг",
  activity_directions: "Үйл ажиллагааны чиглэл",
  activity_description: "Үйл ажиллагааны тайлбар",
  supply_direction: "Нийлүүлэх төрөл",
  bank_name: "Банкны нэр",
  bank_account_number: "Дансны дугаар",
  swift_code: "SWIFT",
  iban: "IBAN",
  currency: "Валют",
  beneficial_owners: "Эзэмшигчид",
  executive_directors: "Гүйцэтгэх захирал",
  special_permissions: "Тусгай зөвшөөрлүүд",
  company_logo_url: "Лого",
  doc_state_registry_url: "Улсын бүртгэлийн гэрчилгээ",
  doc_vat_certificate_url: "НӨАТ-ын гэрчилгээ",
  doc_special_permission_url: "Тусгай зөвшөөрөл",
  doc_contract_url: "Гэрээ",
  doc_company_intro_url: "Танилцуулга",
  extra_documents: "Нэмэлт баримт",
  notification_preference: "Мэдэгдэл хүлээн авах",
};

const fmtVal = (v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Тийм" : "Үгүй";
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (typeof v[0] === "object") return `${v.length} мөр`;
    return v.join(", ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

type PendingEdit = {
  id: string;
  organization_id: string;
  company_name: string;
  email: string;
  supplier_number?: string;
  changed_fields: Record<string, any>;
  old_values: Record<string, any>;
  new_files: Record<string, string>;
  old_files: Record<string, string>;
  status: string;
  return_reason?: string;
  created_at: string;
  changed_count?: number;
};

function DiffModal({
  edit,
  onClose,
  onAction,
  showToast,
}: {
  edit: PendingEdit;
  onClose: () => void;
  onAction: () => void;
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "return" | null>(null);
  const [showReasonInput, setShowReasonInput] = useState(false);

  const approve = async () => {
    setLoading("approve");
    try {
      const res = await fetch(
        `${API}/api/organizations/pending-edits/${edit.id}/approve`,
        { method: "PATCH", headers: { Authorization: `Bearer ${tok()}` } },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      showToast("Зөвшөөрөгдлөө ✓");
      onAction();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(null);
    }
  };

  const doReturn = async () => {
    if (!reason.trim()) {
      showToast("Шалтгаан заавал бичнэ үү", false);
      return;
    }
    setLoading("return");
    try {
      const res = await fetch(
        `${API}/api/organizations/pending-edits/${edit.id}/return`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tok()}`,
          },
          body: JSON.stringify({ return_reason: reason }),
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      showToast("Буцаагдлаа");
      onAction();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setLoading(null);
    }
  };

  const fields = Object.keys(edit.changed_fields || {});
  const files = Object.keys(edit.new_files || {});

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px 16px",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          marginBottom: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {edit.company_name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(148,163,184,0.5)",
                marginTop: 2,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>{edit.email}</span>
              {edit.supplier_number && <span>· {edit.supplier_number}</span>}
              <span>· {new Date(edit.created_at).toLocaleString("mn-MN")}</span>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: "#fbbf24",
                fontWeight: 600,
              }}
            >
              {fields.length + files.length} талбар өөрчлөгдсөн
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Diff body */}
        <div
          style={{
            padding: "20px 24px",
            maxHeight: "55vh",
            overflowY: "auto",
          }}
        >
          {fields.length === 0 && files.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 32,
                fontSize: 13,
                color: "rgba(148,163,184,0.4)",
              }}
            >
              Өөрчлөгдсөн талбар байхгүй
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fields.map((key) => (
                <div
                  key={key}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(96,165,250,0.85)",
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {FIELD_LABELS[key] ?? key}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 24px 1fr",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8,
                        padding: "8px 11px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: "rgba(239,68,68,0.6)",
                          marginBottom: 3,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        ХУУЧИН
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.65)",
                          wordBreak: "break-word",
                        }}
                      >
                        {fmtVal(edit.old_values?.[key])}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        color: "rgba(148,163,184,0.4)",
                      }}
                    >
                      →
                    </div>
                    <div
                      style={{
                        background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 8,
                        padding: "8px 11px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: "rgba(16,185,129,0.7)",
                          marginBottom: 3,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        ШИНЭ
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.85)",
                          wordBreak: "break-word",
                          fontWeight: 500,
                        }}
                      >
                        {fmtVal(edit.changed_fields?.[key])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {files.map((key) => (
                <div
                  key={key}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(167,139,250,0.85)",
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    📎 {FIELD_LABELS[key] ?? key} (Файл)
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 24px 1fr",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    {edit.old_files?.[key] ? (
                      <a
                        href={edit.old_files[key]}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 11,
                          color: "rgba(239,68,68,0.7)",
                          textDecoration: "underline",
                          padding: "8px 11px",
                          background: "rgba(239,68,68,0.06)",
                          borderRadius: 8,
                          textAlign: "center",
                        }}
                      >
                        Хуучин файл
                      </a>
                    ) : (
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(148,163,184,0.3)",
                          padding: "8px 11px",
                          textAlign: "center",
                        }}
                      >
                        —
                      </div>
                    )}
                    <div
                      style={{
                        textAlign: "center",
                        color: "rgba(148,163,184,0.4)",
                      }}
                    >
                      →
                    </div>
                    <a
                      href={edit.new_files[key]}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: "rgba(16,185,129,0.85)",
                        textDecoration: "underline",
                        padding: "8px 11px",
                        background: "rgba(16,185,129,0.06)",
                        borderRadius: 8,
                        textAlign: "center",
                        fontWeight: 500,
                      }}
                    >
                      Шинэ файл
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Return reason input */}
        {showReasonInput && (
          <div
            style={{
              padding: "0 24px 16px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 16,
            }}
          >
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(245,158,11,0.85)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 8,
              }}
            >
              Буцаах шалтгаан *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Жишээ: Утасны дугаар буруу бичигдсэн..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          {!showReasonInput ? (
            <>
              <button
                onClick={() => setShowReasonInput(true)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <AlertCircle size={14} /> Буцаах
              </button>
              <button
                onClick={approve}
                disabled={loading === "approve"}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#059669,#10b981)",
                  border: "none",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  opacity: loading === "approve" ? 0.7 : 1,
                }}
              >
                {loading === "approve" ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Зөвшөөрөх
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowReasonInput(false);
                  setReason("");
                }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(148,163,184,0.7)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Болих
              </button>
              <button
                onClick={doReturn}
                disabled={loading === "return" || !reason.trim()}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.4)",
                  color: "#f59e0b",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  opacity: !reason.trim() || loading === "return" ? 0.5 : 1,
                }}
              >
                {loading === "return" ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <AlertCircle size={14} />
                )}
                Буцаах баталгаажуулах
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PendingEditsTab({
  showToast,
}: {
  showToast: (m: string, ok?: boolean) => void;
}) {
  const [edits, setEdits] = useState<PendingEdit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PendingEdit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/organizations/pending-edits`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await res.json();
      if (d.success) setEdits(d.edits ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/organizations/pending-edits/${id}`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const d = await res.json();
      if (d.success) setSelected(d.edit);
    } catch {}
  };

  return (
    <>
      {selected && (
        <DiffModal
          edit={selected}
          onClose={() => setSelected(null)}
          onAction={() => {
            setSelected(null);
            load();
          }}
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={14} style={{ color: "#f59e0b" }} />
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
              }}
            >
              Хүлээгдэж буй өөрчлөлт
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 9px",
                borderRadius: 99,
                background: "rgba(245,158,11,0.12)",
                color: "#f59e0b",
                fontWeight: 700,
              }}
            >
              {edits.length}
            </span>
          </div>
          <button
            onClick={load}
            style={{
              padding: "8px 12px",
              borderRadius: 9,
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
            Шинэчлэх
          </button>
        </div>

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
                padding: 56,
                gap: 12,
              }}
            >
              <Loader2
                size={20}
                style={{
                  color: "#6366f1",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "rgba(148,163,184,0.4)" }}>
                Ачаалж байна...
              </span>
            </div>
          ) : edits.length === 0 ? (
            <div style={{ padding: "56px 16px", textAlign: "center" }}>
              <CheckCircle2
                size={32}
                style={{
                  color: "rgba(16,185,129,0.3)",
                  display: "block",
                  margin: "0 auto 12px",
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.4)",
                  margin: 0,
                }}
              >
                Хүлээгдэж буй өөрчлөлт байхгүй байна
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {edits.map((e) => (
                <div
                  key={e.id}
                  onClick={() => openDetail(e.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(ev) =>
                    ((ev.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(ev) =>
                    ((ev.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#f59e0b",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {e.company_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {e.company_name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(148,163,184,0.45)",
                        marginTop: 1,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{e.email}</span>
                      <span>·</span>
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                        {e.changed_count ?? 0} талбар өөрчлөгдсөн
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(e.created_at).toLocaleString("mn-MN", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      background: "rgba(59,130,246,0.08)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "#60a5fa",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    <Eye size={12} /> Diff харах
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
