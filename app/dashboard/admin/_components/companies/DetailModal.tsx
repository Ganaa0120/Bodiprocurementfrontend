"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Loader2,
  Trash2,
  Building2,
  User,
  CreditCard,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { API, STATUS_ACTIONS } from "./constants";
import { fmtDate, supply, gender, getStatus } from "./utils";
import { ClickableLogo } from "./LogoComponents";

// ── DocViewerModal ────────────────────────────────────────────
function DocViewerModal({
  url,
  label,
  onClose,
}: {
  url: string;
  label: string;
  onClose: () => void;
}) {
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.96)",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClose}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileText size={15} style={{ color: "rgba(148,163,184,0.5)" }} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {label}
          </span>
          {isPdf && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 99,
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                fontWeight: 700,
              }}
            >
              PDF
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 9,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60a5fa",
              fontSize: 12,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <Download size={12} /> Татах
          </a>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 9,
              padding: "7px 10px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isImg ? (
          <img
            src={url}
            alt={label}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        ) : isPdf ? (
          <object
            data={`${url}#toolbar=1&navpanes=0`}
            type="application/pdf"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              border: "none",
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                padding: 32,
              }}
            >
              <FileText
                size={48}
                style={{
                  margin: "0 auto 16px",
                  opacity: 0.3,
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: 14,
                  marginBottom: 20,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                PDF browser-т нээгдэхгүй байна
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 22px",
                  borderRadius: 12,
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  color: "#60a5fa",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Download size={15} /> Файлыг татаж үзэх
              </a>
            </div>
          </object>
        ) : (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              padding: 32,
            }}
          >
            <FileText
              size={48}
              style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }}
            />
            <p style={{ fontSize: 14, marginBottom: 20 }}>
              Энэ файлын төрлийг харуулах боломжгүй
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 12,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#60a5fa",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Download size={15} /> Татах
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

// ── DocCard — horizontal layout ───────────────────────────────
function DocCard({ url, label }: { url: string; label: string }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isPdf = /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes(".pdf");
  const isImg = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  return (
    <>
      {viewing && (
        <DocViewerModal
          url={url}
          label={label}
          onClose={() => setViewing(false)}
        />
      )}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setViewing(true);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 110,
          flexShrink: 0,
          cursor: "pointer",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${hovered ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
          background: "rgba(255,255,255,0.03)",
          transition: "all .15s",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        {/* Preview */}
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: isImg ? "transparent" : "rgba(255,255,255,0.02)",
          }}
        >
          {isImg ? (
            <img
              src={url}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(248,113,113,0.65)"
                strokeWidth={1.5}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <div
                style={{
                  fontSize: 9,
                  color: "#f87171",
                  marginTop: 4,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                PDF
              </div>
            </div>
          )}
          {/* Hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hovered ? 1 : 0,
              transition: "opacity .15s",
            }}
          >
            <Eye size={16} style={{ color: "white" }} />
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            padding: "5px 7px",
            background: "rgba(0,0,0,0.35)",
            fontSize: 9,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 600,
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
      </div>
    </>
  );
}

// ── Badge ─────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const c = getStatus(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: c.bg,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
        }}
      />
      {c.label}
    </span>
  );
}

// ── Row ───────────────────────────────────────────────────────
function Row({
  label,
  value,
}: {
  label: string;
  value?: string | boolean | null;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "7px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: "rgba(148,163,184,0.4)",
          width: 160,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 500,
        }}
      >
        {typeof value === "boolean" ? (value ? "Тийм" : "Үгүй") : value}
      </span>
    </div>
  );
}

// ── Sec ───────────────────────────────────────────────────────
function Sec({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 8,
        }}
      >
        <Icon size={13} style={{ color: "rgba(148,163,184,0.4)" }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "rgba(148,163,184,0.32)",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          borderRadius: 12,
          padding: "4px 14px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── DetailModal ───────────────────────────────────────────────
export function DetailModal({
  org,
  onClose,
  onStatusChange,
  onDeleted,
  showToast,
  canEditStatus = true,
  canDelete = true,
  dirs = [],
}: {
  org: any;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDeleted: (id: string) => void;
  showToast: (msg: string, ok?: boolean) => void;
  canEditStatus?: boolean;
  canDelete?: boolean;
  dirs?: { id: number; label: string }[];
}) {
  const [localStatus, setLocalStatus] = useState(org.status);
  const [returnReason, setReturnReason] = useState(org.return_reason ?? "");
  const [actLoad, setActLoad] = useState(false);
  const [delLoad, setDelLoad] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const docs = [
    { url: org.doc_state_registry_url, label: "Улсын бүртгэл" },
    { url: org.doc_vat_certificate_url, label: "НӨАТ гэрчилгээ" },
    { url: org.doc_special_permission_url, label: "Тусгай зөвшөөрөл" },
    { url: org.doc_contract_url, label: "Гэрээ" },
    { url: org.doc_company_intro_url, label: "Танилцуулга" },
  ].filter((d) => d.url) as { url: string; label: string }[];

  const doAction = async (newStatus: string) => {
    setActLoad(true);
    try {
      const token = localStorage.getItem("super_admin_token");
      const res = await fetch(`${API}/api/organizations/${org.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          return_reason: returnReason || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      setLocalStatus(newStatus);
      onStatusChange(org.id, newStatus);
      showToast(
        `${STATUS_ACTIONS.find((a) => a.status === newStatus)?.label ?? newStatus} ✓`,
      );
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setActLoad(false);
    }
  };

  const doDelete = async () => {
    setDelLoad(true);
    try {
      const token = localStorage.getItem("super_admin_token");
      const res = await fetch(`${API}/api/organizations/${org.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      onDeleted(org.id);
      showToast("Амжилттай устгагдлаа");
      onClose();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDelLoad(false);
    }
  };

  const content = (
    <>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .doc-scroll::-webkit-scrollbar{height:3px}
        .doc-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          overflowY: "auto",
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 660,
              background: "#0d1526",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              animation: "modalIn .25s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              style={{
                padding: "22px 26px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <ClickableLogo org={org} size={54} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.92)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {org.company_name}
                </div>
                {org.company_name_en && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(148,163,184,0.4)",
                      marginTop: 1,
                    }}
                  >
                    {org.company_name_en}
                  </div>
                )}
                {org.supplier_number && (
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: "rgba(148,163,184,0.35)",
                      marginTop: 1,
                    }}
                  >
                    {org.supplier_number}
                  </div>
                )}
                <div style={{ marginTop: 7 }}>
                  <Badge status={localStatus} />
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 9,
                  padding: 8,
                  cursor: "pointer",
                  color: "rgba(148,163,184,0.5)",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Body ── */}
            <div
              style={{
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Байгууллагын мэдээлэл */}
              <Sec icon={Building2} label="Байгууллагын мэдээлэл">
                <Row label="Регистрийн дугаар" value={org.register_number} />
                <Row
                  label="Улсын бүртгэл №"
                  value={org.state_registry_number}
                />
                <Row label="Байгууллагын төрөл" value={org.company_type} />
                <Row label="И-мэйл" value={org.email} />
                <Row label="Утас" value={org.phone} />
                <Row
                  label="Байгуулагдсан"
                  value={fmtDate(org.established_date)}
                />
                <Row label="Ажилчдын тоо" value={org.employee_count} />
                <Row label="НӨАТ" value={org.is_vat_payer} />
                <Row label="НӨАТ дугаар" value={org.vat_number} />
                <Row label="ISO баталгаа" value={org.is_iso_certified} />
                <Row
                  label="Тусгай зөвшөөрөл"
                  value={org.has_special_permission}
                />
                {org.has_special_permission && (
                  <>
                    <Row
                      label="Зөвшөөрлийн №"
                      value={org.special_permission_number}
                    />
                    <Row
                      label="Дуусах хугацаа"
                      value={fmtDate(org.special_permission_expiry)}
                    />
                  </>
                )}
                <Row label="Бүртгэгдсэн" value={fmtDate(org.created_at)} />
              </Sec>

              {/* Хаяг */}
              {(org.aimag_niislel || org.address) && (
                <Sec icon={MapPin} label="Хаяг">
                  <Row label="Аймаг/Нийслэл" value={org.aimag_niislel} />
                  <Row label="Сум/Дүүрэг" value={org.sum_duureg} />
                  <Row label="Баг/Хороо" value={org.bag_horoo} />
                  <Row label="Бүтэн хаяг" value={org.address} />
                </Sec>
              )}

              {/* Эзэмшигч - beneficial_owners */}
              {org.beneficial_owners?.length > 0 && (
                <Sec icon={User} label="Эзэмшигчийн мэдээлэл">
                  {org.beneficial_owners.map((o: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        paddingTop: i > 0 ? 8 : 0,
                        borderTop:
                          i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      }}
                    >
                      <Row
                        label="Овог / Нэр"
                        value={`${o.last_name || ""} ${o.first_name || ""}`.trim()}
                      />
                      <Row label="Ургийн овог" value={o.family_name} />
                      <Row label="Хүйс" value={gender(o.gender)} />
                      <Row label="Албан тушаал" value={o.position} />
                      <Row label="Утас" value={o.phone} />
                    </div>
                  ))}
                </Sec>
              )}

              {/* Хуучин owner (байгаа бол) */}
              {!org.beneficial_owners?.length &&
                (org.owner_first_name || org.owner_last_name) && (
                  <Sec icon={User} label="Эзэмшигч / Эрх бүхий этгээд">
                    <Row label="Овог" value={org.owner_last_name} />
                    <Row label="Нэр" value={org.owner_first_name} />
                    <Row label="Эцэг/эхийн нэр" value={org.owner_family_name} />
                    <Row label="Хүйс" value={gender(org.owner_gender)} />
                    <Row label="Албан тушаал" value={org.owner_position} />
                    <Row label="Утас" value={org.owner_phone} />
                    <Row label="И-мэйл" value={org.owner_email} />
                  </Sec>
                )}

              {/* Үйл ажиллагаа */}
              {(org.supply_direction ||
                org.activity_description ||
                org.activity_directions?.length > 0) && (
                <Sec icon={Briefcase} label="Үйл ажиллагаа">
                  <Row
                    label="Нийлүүлэх чиглэл"
                    value={supply(org.supply_direction)}
                  />
                  <Row label="Тайлбар" value={org.activity_description} />
                  {org.activity_directions?.length > 0 && (
                    <div style={{ padding: "7px 0" }}>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 5 }}
                      >
                        {org.activity_directions.map((d: any) => {
                          // ✅ ID байвал label хайна, label байвал шууд харуулна
                          const label =
                            dirs.find((x) => x.id === d || x.id === Number(d))
                              ?.label || String(d);
                          return (
                            <span
                              key={d}
                              style={{
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 99,
                                background: "rgba(59,130,246,0.12)",
                                color: "#60a5fa",
                                border: "1px solid rgba(59,130,246,0.2)",
                              }}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Sec>
              )}

              {/* Банк */}
              {(org.bank_name || org.bank_account_number) && (
                <Sec icon={CreditCard} label="Банкны мэдээлэл">
                  <Row label="Банк" value={org.bank_name} />
                  <Row label="Дансны дугаар" value={org.bank_account_number} />
                  <Row label="IBAN" value={org.iban} />
                  <Row label="SWIFT" value={org.swift_code} />
                  <Row label="Валют" value={org.currency} />
                </Sec>
              )}

              {/* ── Баримт бичиг — horizontal scroll ── */}
              {docs.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 10,
                    }}
                  >
                    <FileText
                      size={13}
                      style={{ color: "rgba(148,163,184,0.4)" }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                        color: "rgba(148,163,184,0.32)",
                      }}
                    >
                      Баримт бичиг
                    </span>
                    <span
                      style={{ fontSize: 10, color: "rgba(148,163,184,0.25)" }}
                    >
                      ({docs.length}) · дарж харна
                    </span>
                  </div>
                  <div
                    className="doc-scroll"
                    style={{
                      display: "flex",
                      gap: 10,
                      overflowX: "auto",
                      paddingBottom: 6,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {docs.map((d) => (
                      <DocCard key={d.label} url={d.url} label={d.label} />
                    ))}
                  </div>
                </div>
              )}

              {/* Буцаасан шалтгаан */}
              {org.return_reason && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.18)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(245,158,11,0.7)",
                      marginBottom: 4,
                    }}
                  >
                    БУЦААСАН ШАЛТГААН
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    {org.return_reason}
                  </div>
                </div>
              )}

              {/* Буцаах шалтгаан оруулах */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: "rgba(148,163,184,0.28)",
                    marginBottom: 7,
                  }}
                >
                  Буцаах шалтгаан (заавал биш)
                </div>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows={2}
                  placeholder="Жишээ: Баримт дутуу байна..."
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    outline: "none",
                    resize: "vertical" as const,
                    fontFamily: "inherit",
                    boxSizing: "border-box" as const,
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLElement).style.borderColor =
                      "rgba(59,130,246,0.3)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.07)")
                  }
                />
              </div>

              {/* Үйлдэл */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    color: "rgba(148,163,184,0.28)",
                    marginBottom: 10,
                  }}
                >
                  Үйлдэл
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {canEditStatus &&
                    STATUS_ACTIONS.filter((a) => a.status !== localStatus).map(
                      (a) => (
                        <button
                          key={a.status}
                          onClick={() => doAction(a.status)}
                          disabled={actLoad}
                          style={{
                            padding: "9px 18px",
                            borderRadius: 10,
                            background: a.bg,
                            border: `1px solid ${a.border}`,
                            color: a.color,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: actLoad ? 0.5 : 1,
                            transition: "all .15s",
                          }}
                        >
                          {actLoad ? (
                            <Loader2
                              size={13}
                              style={{ animation: "spin 0.8s linear infinite" }}
                            />
                          ) : a.status === "approved" ? (
                            <CheckCircle2 size={13} />
                          ) : a.status === "returned" ? (
                            <AlertCircle size={13} />
                          ) : null}
                          {a.label}
                        </button>
                      ),
                    )}
                </div>
              </div>

              {/* Устгах */}
              {canDelete && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: 16,
                  }}
                >
                  {!confirmDel ? (
                    <button
                      onClick={() => setConfirmDel(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 10,
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.16)",
                        color: "rgba(239,68,68,0.7)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <Trash2 size={13} /> Устгах
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "rgba(239,68,68,0.85)",
                          flex: 1,
                        }}
                      >
                        Итгэлтэй байна уу?
                      </span>
                      <button
                        onClick={() => setConfirmDel(false)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(148,163,184,0.6)",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Болих
                      </button>
                      <button
                        onClick={doDelete}
                        disabled={delLoad}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 8,
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#ef4444",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          opacity: delLoad ? 0.6 : 1,
                        }}
                      >
                        {delLoad ? (
                          <Loader2
                            size={12}
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Устгах
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
