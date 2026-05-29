// app/dashboard/admin/_components/pending-edits/PendingEditsTab.tsx
"use client";
import * as React from "react";
import { useState, useEffect, useCallback, Fragment } from "react";
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

// ── Талбарын Mongolian нэрс ─────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  company_name: "Байгууллагын нэр",
  company_name_en: "Англи нэр",
  company_type: "Байгууллагын төрөл",
  phone: "Утас",
  register_number: "Регистрийн дугаар",
  state_registry_number: "Улсын бүртгэл №",
  established_date: "Үүсгэн байгуулагдсан огноо",
  employee_count: "Ажилчдын тоо",
  is_vat_payer: "НӨАТ төлөгч",
  vat_number: "НӨАТ дугаар",
  is_iso_certified: "ISO сертификат",
  has_special_permission: "Тусгай зөвшөөрөлтэй",
  special_permission_number: "Тусгай зөвшөөрлийн дугаар",
  special_permission_expiry: "Тусгай зөвшөөрлийн хугацаа",
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
  final_beneficial_owners: "Эцсийн өмчлөгчид",
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

// Хүний дотоод талбарын нэрс
const PERSON_FIELD_LABELS: Record<string, string> = {
  last_name: "Овог",
  first_name: "Нэр",
  family_name: "Эцгийн нэр",
  phone: "Утас",
  email: "Имэйл",
  position: "Албан тушаал",
  register_number: "Регистр",
  share_percent: "Хувь",
  ownership_percent: "Эзэмшлийн хувь",
  is_foreign: "Гадаад иргэн",
  passport_number: "Паспорт",
  citizenship: "Иргэншил",
  birth_date: "Төрсөн огноо",
  gender: "Хүйс",
  address: "Хаяг",
};

const DATE_FIELDS = ["established_date", "special_permission_expiry"];
const DIRECTION_FIELDS = ["activity_directions"];
const PEOPLE_FIELDS = [
  "beneficial_owners",
  "final_beneficial_owners",
  "executive_directors",
];

const labelSupply = (s: string) =>
  s === "service"
    ? "Үйлчилгээ"
    : s === "goods"
      ? "Бараа"
      : s === "all"
        ? "Аль аль нь"
        : s;
const labelNotification = (n: string) =>
  n === "selected_dirs"
    ? "Сонгосон чиглэлээр"
    : n === "all"
      ? "Бүх чиглэлээр"
      : n;

// ── Helpers ──────────────────────────────────────────────────────
function parseArr(v: any): any[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function personName(p: any): string {
  if (!p || typeof p !== "object") return String(p ?? "");
  const n = [p.last_name, p.first_name].filter(Boolean).join(" ");
  return n || p.family_name || p.name || "Тодорхойгүй";
}

function formatDirections(raw: any, dirMap: Map<number, string>): string {
  const arr = parseArr(raw);
  if (arr.length === 0) return "—";
  const nameOf = (id: any) => dirMap.get(Number(id)) || `#${id}`;
  return (
    arr
      .map((item: any) => {
        if (typeof item === "number" || typeof item === "string")
          return nameOf(item);
        if (item && typeof item === "object") {
          const mainLabel = item.main_id != null ? nameOf(item.main_id) : "";
          const subLabels = Array.isArray(item.sub_ids)
            ? item.sub_ids.map(nameOf)
            : [];
          if (subLabels.length > 0)
            return mainLabel
              ? `${mainLabel}: ${subLabels.join(", ")}`
              : subLabels.join(", ");
          return mainLabel;
        }
        return "";
      })
      .filter(Boolean)
      .join("; ") || "—"
  );
}

// Үндсэн утга форматлагч (PEOPLE_FIELDS-ийг тусдаа PersonDiff component-аар үзүүлнэ)
function fmtVal(v: any, key: string, dirMap: Map<number, string>): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Тийм" : "Үгүй";

  if (DIRECTION_FIELDS.includes(key)) return formatDirections(v, dirMap);
  if (key === "supply_direction") return labelSupply(String(v));
  if (key === "notification_preference") return labelNotification(String(v));
  if (DATE_FIELDS.includes(key)) {
    const s = String(v);
    return s.length >= 10 ? s.slice(0, 10) : s;
  }

  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (typeof v[0] === "object") return `${v.length} зүйл`;
    return v.join(", ");
  }
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return "—";
    }
  }
  return String(v);
}

// ── Person array-ийн доторх field-level diff ─────────────────────
type PersonChange =
  | { type: "added"; index: number; person: any }
  | { type: "removed"; index: number; person: any }
  | {
      type: "changed";
      index: number;
      name: string;
      changes: { field: string; old: any; new: any }[];
    };

function computePersonDiff(oldRaw: any, newRaw: any): PersonChange[] {
  const oldList = parseArr(oldRaw);
  const newList = parseArr(newRaw);
  const max = Math.max(oldList.length, newList.length);
  const out: PersonChange[] = [];

  for (let i = 0; i < max; i++) {
    const o = oldList[i];
    const n = newList[i];
    if (!o && n) {
      out.push({ type: "added", index: i, person: n });
    } else if (o && !n) {
      out.push({ type: "removed", index: i, person: o });
    } else if (o && n) {
      const keys = new Set([
        ...Object.keys(o || {}),
        ...Object.keys(n || {}),
      ]);
      const changes: { field: string; old: any; new: any }[] = [];
      for (const k of keys) {
        const ov = o[k] ?? null;
        const nv = n[k] ?? null;
        if (JSON.stringify(ov) !== JSON.stringify(nv)) {
          changes.push({ field: k, old: ov, new: nv });
        }
      }
      if (changes.length > 0) {
        out.push({ type: "changed", index: i, name: personName(o), changes });
      }
    }
  }
  return out;
}

function PersonDiff({
  oldRaw,
  newRaw,
}: {
  oldRaw: any;
  newRaw: any;
}) {
  const items = computePersonDiff(oldRaw, newRaw);

  if (items.length === 0)
    return (
      <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", padding: 8 }}>
        Бодит өөрчлөлт алга
      </div>
    );

  const fmt = (v: any) =>
    v === null || v === undefined || v === ""
      ? "—"
      : typeof v === "boolean"
        ? v
          ? "Тийм"
          : "Үгүй"
        : typeof v === "object"
          ? JSON.stringify(v)
          : String(v);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => {
        if (item.type === "added") {
          return (
            <div
              key={idx}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(16,185,129,0.9)",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                + {personName(item.person)}
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 7px",
                    borderRadius: 20,
                    background: "rgba(16,185,129,0.15)",
                    color: "rgba(16,185,129,0.9)",
                  }}
                >
                  Шинээр нэмсэн
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "4px 12px",
                  fontSize: 11,
                }}
              >
                {Object.entries(item.person)
                  .filter(([, v]) => v != null && v !== "")
                  .map(([k, v]) => (
                    <Fragment key={k}>
                      <span style={{ color: "rgba(148,163,184,0.5)" }}>
                        {PERSON_FIELD_LABELS[k] ?? k}:
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.85)" }}>
                        {fmt(v)}
                      </span>
                    </Fragment>
                  ))}
              </div>
            </div>
          );
        }
        if (item.type === "removed") {
          return (
            <div
              key={idx}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(239,68,68,0.85)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                − {personName(item.person)}
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 7px",
                    borderRadius: 20,
                    background: "rgba(239,68,68,0.15)",
                    color: "rgba(239,68,68,0.9)",
                  }}
                >
                  Хасагдсан
                </span>
              </div>
            </div>
          );
        }
        // changed
        return (
          <div
            key={idx}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(96,165,250,0.9)",
                marginBottom: 8,
              }}
            >
              {item.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {item.changes.map((c) => (
                <div
                  key={c.field}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 10,
                    fontSize: 11,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(148,163,184,0.6)",
                      fontWeight: 500,
                    }}
                  >
                    {PERSON_FIELD_LABELS[c.field] ?? c.field}:
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 11,
                      }}
                    >
                      {fmt(c.old)}
                    </span>
                    <span style={{ color: "rgba(148,163,184,0.5)" }}>→</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        color: "rgba(255,255,255,0.9)",
                        fontWeight: 500,
                        fontSize: 11,
                      }}
                    >
                      {fmt(c.new)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  dirMap,
  onClose,
  onAction,
  showToast,
}: {
  edit: PendingEdit;
  dirMap: Map<number, string>;
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

  // No-op-уудыг шүүх (хуучин/шинэ форматласны дараа адил байвал)
  const allFields = Object.keys(edit.changed_fields || {});
  const fields = allFields.filter((key) => {
    if (PEOPLE_FIELDS.includes(key)) {
      // Per-person diff тооцоолоод бодит өөрчлөлт байгаа эсэхийг шалгана
      const diff = computePersonDiff(
        edit.old_values?.[key],
        edit.changed_fields?.[key],
      );
      return diff.length > 0;
    }
    const oldStr = fmtVal(edit.old_values?.[key], key, dirMap);
    const newStr = fmtVal(edit.changed_fields?.[key], key, dirMap);
    return oldStr !== newStr;
  });
  const files = Object.keys(edit.new_files || {});

  const hiddenCount = allFields.length - fields.length;

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
              {fields.length + files.length} талбар бодит өөрчлөгдсөн
              {hiddenCount > 0 && (
                <span
                  style={{
                    color: "rgba(148,163,184,0.4)",
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  ({hiddenCount} нь зөвхөн форматын зөрүү)
                </span>
              )}
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
            maxHeight: "60vh",
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
              Бодит өөрчлөлт байхгүй
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fields.map((key) => {
                const isPerson = PEOPLE_FIELDS.includes(key);
                const isDirection = DIRECTION_FIELDS.includes(key);

                return (
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
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {FIELD_LABELS[key] ?? key}
                      {isPerson && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "1px 7px",
                            borderRadius: 20,
                            background: "rgba(167,139,250,0.12)",
                            color: "rgba(167,139,250,0.9)",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          Дотоод өөрчлөлт
                        </span>
                      )}
                    </div>

                    {isPerson ? (
                      <PersonDiff
                        oldRaw={edit.old_values?.[key]}
                        newRaw={edit.changed_fields?.[key]}
                      />
                    ) : (
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
                              lineHeight: 1.5,
                            }}
                          >
                            {fmtVal(edit.old_values?.[key], key, dirMap)}
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
                              lineHeight: 1.5,
                            }}
                          >
                            {fmtVal(edit.changed_fields?.[key], key, dirMap)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

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
                      Шинэ файл харах
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
  const [dirMap, setDirMap] = useState<Map<number, string>>(new Map());

  // Чиглэлийн ID → нэр map
  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;
        const map = new Map<number, string>();
        const add = (arr: any[]) =>
          arr?.forEach((x: any) => {
            if (x && x.id != null) map.set(Number(x.id), x.label);
            if (Array.isArray(x.children)) add(x.children);
          });
        if (Array.isArray(d.flat)) add(d.flat);
        else add(d.directions ?? []);
        setDirMap(map);
      })
      .catch(() => {});
  }, []);

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
          dirMap={dirMap}
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
              Шинэчлэсэн хүсэлтүүд
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
                Шинэчлэсэн хүсэлтүүд байхгүй байна
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
                    <Eye size={12} /> Өөрчлөлт харах
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