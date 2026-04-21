"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  CreditCard,
  X,
  Check,
  Save,
  Plus,
  ChevronDown,
  Bell,
  Send,
  Search,
} from "lucide-react";
import {
  API,
  BLANK,
  BLANK_OWNER,
  BLANK_FINAL,
  AIMAG,
} from "./_components/constants";
import { HeroCard, Alert } from "./_components/HeroCard";
import { FInput, FSelect, RadioGroup } from "./_components/FormFields";
import { Section, DocUpload } from "./_components/Section";
import {
  OwnersSection,
  ExecutiveDirectorsSection,
} from "./_components/OwnersSection";
import {
  validateMongolianForm,
  isMongolian,
  validateOwnersMongolian,
} from "@/utils/mongolianValidation";
import { UB_DUUREG, AIMAG_SUM } from "@/constants/addressData";

const BLANK_EXEC = {
  position: "Гүйцэтгэх захирал",
  last_name: "",
  first_name: "",
  phone: "",
  email: "",
};
const BLANK_PERM = {
  _key: Date.now(),
  type_id: null,
  type_label: "",
  number: "",
  expiry: "",
};

const REQUIRED_FIELDS = [
  { key: "company_name", label: "Байгууллагын нэр" },
  { key: "register_number", label: "Регистрийн дугаар" },
  { key: "aimag_niislel", label: "Аймаг / Нийслэл" },
  { key: "sum_duureg", label: "Сум / Дүүрэг" },
  { key: "address", label: "Дэлгэрэнгүй хаяг" },
  { key: "bank_name", label: "Банкны нэр" },
  { key: "bank_account_number", label: "Дансны дугаар" },
];

type DirItem = {
  id: number;
  label: string;
  children: { id: number; label: string }[];
};
type SelDir = { main_id: number; sub_ids: number[] };

function useW() {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function buildForm(u: any) {
  return {
    register_number: u.register_number || "",
    state_registry_number: u.state_registry_number || "",
    company_name: u.company_name || "",
    company_name_en: u.company_name_en || "",
    company_type: u.company_type || "ХХК",
    established_date: u.established_date?.slice(0, 10) || "",
    is_vat_payer: u.is_vat_payer || false,
    is_iso_certified: u.is_iso_certified || false,
    employee_count: u.employee_count?.toString() || "",
    has_special_permission: u.has_special_permission || false,
    aimag_niislel: u.aimag_niislel || "",
    sum_duureg: u.sum_duureg || "",
    bag_horoo: u.bag_horoo || "",
    address: u.address || "",
    bank_name: u.bank_name || "",
    bank_account_number: u.bank_account_number || "",
    vat_number: u.vat_number || "",
    swift_code: u.swift_code || "",
    iban: u.iban || "",
    currency: u.currency || "MNT",
    phone: u.phone || "",
    activity_description: u.activity_description || "",
    supply_direction: u.supply_direction || "",
    notification_preference: u.notification_preference || "selected_dirs",
  };
}

// ── SubmitModal ───────────────────────────────────────────────
function SubmitModal({
  missing,
  onConfirm,
  onClose,
  saving,
}: {
  missing: { key: string; label: string }[];
  onConfirm: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const isComplete = missing.length === 0;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          padding: 28,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "fadeIn .2s ease",
        }}
      >
        {isComplete ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 8,
                }}
              >
                Мэдээлэл бүрэн бөглөгдсөн байна
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>
                Та мэдээлэлээ илгээхдээ итгэлтэй байна уу?
                <br />
                Илгээсний дараа хянагдах болно.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Болих
              </button>
              <button
                onClick={onConfirm}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
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
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Send size={14} />
                )}
                {saving ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 24 }}>⚠️</span> Дутуу мэдээлэл байна
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Илгээхийн өмнө дараах талбаруудыг бөглөнө үү:
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 20,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {missing.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 14px",
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}
                  >
                    ✕
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Буцаж бөглөх
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── DirectionPicker ───────────────────────────────────────────
function DirectionPicker({
  dirs,
  selDirs,
  editing,
  toggleMain,
  toggleSub,
}: {
  dirs: DirItem[];
  selDirs: SelDir[];
  editing: boolean;
  toggleMain: (id: number) => void;
  toggleSub: (mainId: number, subId: number) => void;
}) {
  const [activeMain, setActiveMain] = useState<number | null>(
    selDirs.length > 0 ? selDirs[0].main_id : null,
  );
  const [search, setSearch] = useState("");

  const activeDir = dirs.find((d) => d.id === activeMain);
  const filteredSubs =
    activeDir?.children.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  const activeSel = selDirs.find(
    (s) => Number(s.main_id) === Number(activeMain),
  );

  // ── Read-only ──────────────────────────────────────────────
  if (!editing) {
    if (selDirs.length === 0)
      return <div style={{ fontSize: 13, color: "#cbd5e1" }}>—</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selDirs.map((sel) => {
          const main = dirs.find((d) => Number(d.id) === Number(sel.main_id));
          if (!main) return null;
          return (
            <div
              key={sel.main_id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4f46e5",
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                  padding: "3px 10px",
                  borderRadius: 99,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {main.label}
              </span>
              {sel.sub_ids.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sel.sub_ids.map((sid) => {
                    const sub = main.children?.find(
                      (c: any) => Number(c.id) === Number(sid),
                    );
                    return sub ? (
                      <span
                        key={sid}
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          padding: "3px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {sub.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Edit mode — 2 хэсэгт хуваасан ─────────────────────────
  return (
    <div
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          minHeight: 360,
        }}
      >
        {/* Зүүн: Үндсэн чиглэлүүд */}
        <div
          style={{
            borderRight: "1px solid #f1f5f9",
            background: "#fafafa",
            overflowY: "auto",
            maxHeight: 400,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Үндсэн чиглэл
          </div>
          {dirs.length === 0 ? (
            <div
              style={{
                padding: 16,
                fontSize: 12,
                color: "#94a3b8",
                textAlign: "center" as const,
              }}
            >
              Ачаалж байна...
            </div>
          ) : (
            dirs.map((d) => {
              const isOn = selDirs.some(
                (s) => Number(s.main_id) === Number(d.id),
              );
              const isActive = activeMain === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveMain(d.id);
                    setSearch("");
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? "#eef2ff" : "transparent",
                    borderLeft: isActive
                      ? "3px solid #6366f1"
                      : "3px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all .12s",
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMain(d.id);
                      if (!isOn) setActiveMain(d.id);
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: isOn ? "2px solid #6366f1" : "2px solid #d1d5db",
                      background: isOn ? "#6366f1" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                    }}
                  >
                    {isOn && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isOn ? 600 : 400,
                        color: isActive
                          ? "#4f46e5"
                          : isOn
                            ? "#1e293b"
                            : "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {d.label}
                    </div>
                    {isOn &&
                      (selDirs.find((s) => Number(s.main_id) === Number(d.id))
                        ?.sub_ids.length ?? 0) > 0 && (
                        <div style={{ fontSize: 10, color: "#6366f1" }}>
                          {
                            selDirs.find(
                              (s) => Number(s.main_id) === Number(d.id),
                            )?.sub_ids.length
                          }{" "}
                          сонгосон
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Баруун: Дэд чиглэлүүд */}
        <div style={{ display: "flex", flexDirection: "column" as const }}>
          {activeMain === null ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column" as const,
                gap: 8,
                color: "#94a3b8",
              }}
            >
              <span style={{ fontSize: 28 }}>👈</span>
              <span style={{ fontSize: 13 }}>Үндсэн чиглэл сонгоно уу</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                  >
                    {activeDir?.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {activeDir?.children.length || 0} дэд чиглэл
                  </div>
                </div>
                {activeSel && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        activeDir?.children.forEach((c) => {
                          if (!activeSel.sub_ids.includes(c.id))
                            toggleSub(activeMain, c.id);
                        });
                      }}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        color: "#4f46e5",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Бүгдийг сонгох
                    </button>
                    {activeSel.sub_ids.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          activeSel.sub_ids
                            .slice()
                            .forEach((id) => toggleSub(activeMain, id))
                        }
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Цэвэрлэх
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search */}
              {(activeDir?.children.length || 0) > 5 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    position: "relative",
                  }}
                >
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 26,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Дэд чиглэл хайх..."
                    style={{
                      width: "100%",
                      padding: "7px 10px 7px 30px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      outline: "none",
                      background: "white",
                      boxSizing: "border-box" as const,
                    }}
                    onFocus={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#6366f1")
                    }
                    onBlur={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
                    }
                  />
                </div>
              )}

              {/* Sub-directions */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
                {!activeSel ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#f59e0b",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Эхлээд үндсэн чиглэлийг сонгоно уу (зүүн талын checkbox)
                  </div>
                ) : filteredSubs.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    {search ? `"${search}" олдсонгүй` : "Дэд чиглэл байхгүй"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {filteredSubs.map((sub) => {
                      const isSubOn = activeSel.sub_ids.some(
                        (id) => Number(id) === Number(sub.id),
                      );
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(activeMain, sub.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 500,
                            border: isSubOn
                              ? "1.5px solid #6366f1"
                              : "1.5px solid #e2e8f0",
                            background: isSubOn ? "#eef2ff" : "white",
                            color: isSubOn ? "#4f46e5" : "#64748b",
                            cursor: "pointer",
                            transition: "all .12s",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isSubOn && <Check size={10} strokeWidth={3} />}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {activeSel && activeSel.sub_ids.length > 0 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: 11,
                    color: "#6366f1",
                    fontWeight: 600,
                  }}
                >
                  ✓ {activeSel.sub_ids.length} дэд чиглэл сонгогдсон
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom summary */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap" as const,
        }}
      >
        {selDirs.length === 0 ? (
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>
            ⚠️ Нэг буюу хэд хэдэн чиглэл сонгоно уу
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
              ✓ {selDirs.length} үндсэн чиглэл сонгогдсон
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
              {selDirs.map((sel) => {
                const main = dirs.find(
                  (d) => Number(d.id) === Number(sel.main_id),
                );
                return main ? (
                  <span
                    key={sel.main_id}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      color: "#4f46e5",
                      fontWeight: 600,
                    }}
                  >
                    {main.label}
                  </span>
                ) : null;
              })}
            </div>
            <button
              type="button"
              onClick={() => selDirs.forEach((s) => toggleMain(s.main_id))}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Бүгдийг цэвэрлэх
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CompanyProfilePage() {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;

  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<DirItem[]>([]);
  const [permTypes, setPermTypes] = useState<{ id: number; label: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selDirs, setSelDirs] = useState<SelDir[]>([]);
  const [selDirSnap, setSelDirSnap] = useState<SelDir[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraFileUrls, setExtraFileUrls] = useState<string[]>([]);
  const [extraSnap, setExtraSnap] = useState<File[]>([]);
  const [extraUrlSnap, setExtraUrlSnap] = useState<string[]>([]);
  const [form, setForm] = useState<any>(BLANK);
  const [snapshot, setSnapshot] = useState<any>(BLANK);
  const [owners, setOwners] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [ownerSnap, setOwnerSnap] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [finalOwners, setFinalOwners] = useState<any[]>([{ ...BLANK_FINAL }]);
  const [finalOwnerSnap, setFinalOwnerSnap] = useState<any[]>([
    { ...BLANK_FINAL },
  ]);
  const [directors, setDirectors] = useState<any[]>([{ ...BLANK_EXEC }]);
  const [directorSnap, setDirectorSnap] = useState<any[]>([{ ...BLANK_EXEC }]);
  const [specPerms, setSpecPerms] = useState<any[]>([{ ...BLANK_PERM }]);
  const [specPermSnap, setSpecPermSnap] = useState<any[]>([{ ...BLANK_PERM }]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ownerFieldErrors, setOwnerFieldErrors] = useState<
    Record<string, string>
  >({});
  const [directorFieldErrors, setDirectorFieldErrors] = useState<
    Record<string, string>
  >({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const source = d.directions || d.flat || [];
          setDirs(
            source
              .filter((dir: any) => !dir.parent_id)
              .map((dir: any) => ({
                id: Number(dir.id),
                label: dir.label,
                children: (
                  dir.children ||
                  source.filter(
                    (c: any) => Number(c.parent_id) === Number(dir.id),
                  )
                ).map((c: any) => ({ id: Number(c.id), label: c.label })),
              })),
          );
        }
      })
      .catch(() => {});

    fetch(`${API}/api/special-permission-types`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPermTypes(d.types || []);
      })
      .catch(() => {});

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/organizations/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && (d.organization || d.user)) {
          const u = d.organization || d.user;
          setProfile(u);
          const f = buildForm(u);
          setForm(f);
          setSnapshot(f);

          const rawDirs = u.activity_directions || [];
          const parsedDirs: SelDir[] =
            Array.isArray(rawDirs) &&
            rawDirs.length > 0 &&
            typeof rawDirs[0] === "object"
              ? rawDirs.map((d: any) => ({
                  main_id: Number(d.main_id),
                  sub_ids: (d.sub_ids || []).map(Number),
                }))
              : rawDirs.map((id: number) => ({
                  main_id: Number(id),
                  sub_ids: [],
                }));
          setSelDirs(parsedDirs);
          setSelDirSnap(parsedDirs);

          setOwners(
            u.beneficial_owners?.length
              ? u.beneficial_owners
              : [{ ...BLANK_OWNER }],
          );
          setOwnerSnap(
            u.beneficial_owners?.length
              ? u.beneficial_owners
              : [{ ...BLANK_OWNER }],
          );
          setFinalOwners(
            u.final_beneficial_owners?.length
              ? u.final_beneficial_owners
              : [{ ...BLANK_FINAL }],
          );
          setFinalOwnerSnap(
            u.final_beneficial_owners?.length
              ? u.final_beneficial_owners
              : [{ ...BLANK_FINAL }],
          );
          setDirectors(
            u.executive_directors?.length
              ? u.executive_directors
              : [{ ...BLANK_EXEC }],
          );
          setDirectorSnap(
            u.executive_directors?.length
              ? u.executive_directors
              : [{ ...BLANK_EXEC }],
          );

          // ✅ updated → u болгосон
          setSpecPerms(
            u.special_permissions?.length
              ? u.special_permissions.map((p: any, i: number) => ({
                  ...p,
                  _key: i,
                  type_label: p.type_label || "", // permTypes useEffect-д нөхнө
                }))
              : [{ ...BLANK_PERM }],
          );
          setSpecPermSnap(
            u.special_permissions?.length
              ? u.special_permissions.map((p: any, i: number) => ({
                  ...p,
                  _key: i,
                  type_label: p.type_label || "",
                }))
              : [{ ...BLANK_PERM }],
          );

          const savedUrls = Array.isArray(u.extra_documents)
            ? u.extra_documents
            : [];
          setExtraFileUrls(savedUrls);
          setExtraUrlSnap(savedUrls);

          const p: Record<string, string> = {};
          if (u.company_logo_url) p.company_logo = u.company_logo_url;
          if (u.doc_state_registry_url)
            p.doc_state_registry = u.doc_state_registry_url;
          if (u.doc_vat_certificate_url)
            p.doc_vat_certificate = u.doc_vat_certificate_url;
          if (u.doc_special_permission_url)
            p.doc_special_permission = u.doc_special_permission_url;
          if (u.doc_contract_url) p.doc_contract = u.doc_contract_url;
          if (u.doc_company_intro_url)
            p.doc_company_intro = u.doc_company_intro_url;
          setPreviews(p);
          setEditing(!u.aimag_niislel && !u.address && !u.bank_name);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const refreshStatus = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/organizations/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && (d.organization || d.user)) {
            const fresh = d.organization || d.user;
            setProfile((p: any) =>
              p
                ? {
                    ...p,
                    status: fresh.status,
                    return_reason: fresh.return_reason,
                  }
                : p,
            );
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...stored,
                status: fresh.status,
                return_reason: fresh.return_reason,
              }),
            );
          }
        })
        .catch(() => {});
    };

    const interval = setInterval(refreshStatus, 12 * 60 * 60 * 1000);
    window.addEventListener("focus", refreshStatus);
    window.addEventListener("user-updated", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
      window.removeEventListener("user-updated", refreshStatus);
    };
  }, []);

  // ✅ permTypes ачаалагдсаны дараа type_label-г нөхнө
  useEffect(() => {
    if (permTypes.length === 0) return;
    setSpecPerms((prev) =>
      prev.map((perm) => ({
        ...perm,
        type_label:
          perm.type_label ||
          permTypes.find((t: any) => Number(t.id) === Number(perm.type_id))
            ?.label ||
          "",
      })),
    );
  }, [permTypes]); // ✅ permTypes өөрчлөгдөхөд л ажиллана

  const F = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const onFile = (field: string, file: File) => {
    setFiles((p) => ({ ...p, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const getMissingFields = () => {
    const missing = REQUIRED_FIELDS.filter((f) => !form[f.key]);
    if (selDirs.length === 0)
      missing.push({
        key: "activity_directions",
        label: "Үйл ажиллагааны чиглэл",
      });
    if (!previews.doc_state_registry)
      missing.push({
        key: "doc_state_registry",
        label: "Улсын бүртгэлийн гэрчилгээ",
      });
    if (!owners[0]?.last_name || !owners[0]?.first_name)
      missing.push({ key: "owners", label: "Эзэмшигчийн мэдээлэл" });
    return missing;
  };

  const toggleMain = (mainId: number) => {
    setSelDirs((p) => {
      const exists = p.find((d) => Number(d.main_id) === Number(mainId));
      if (exists) return p.filter((d) => Number(d.main_id) !== Number(mainId));
      const main = dirs.find((d) => Number(d.id) === Number(mainId));
      return [
        ...p,
        {
          main_id: Number(mainId),
          sub_ids: (main?.children || []).map((c) => Number(c.id)),
        },
      ];
    });
  };

  const toggleSub = (mainId: number, subId: number) => {
    setSelDirs((p) =>
      p.map((d) =>
        d.main_id !== mainId
          ? d
          : {
              ...d,
              sub_ids: d.sub_ids.some((id) => Number(id) === Number(subId))
                ? d.sub_ids.filter((id) => Number(id) !== Number(subId))
                : [...d.sub_ids, subId],
            },
      ),
    );
  };

  const startEdit = () => {
    setSnapshot({ ...form });
    setOwnerSnap(owners.map((o) => ({ ...o })));
    setFinalOwnerSnap(finalOwners.map((o) => ({ ...o })));
    setDirectorSnap(directors.map((o) => ({ ...o })));
    setSpecPermSnap(specPerms.map((o) => ({ ...o })));
    setSelDirSnap(selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setExtraSnap([...extraFiles]);
    setExtraUrlSnap([...extraFileUrls]);
    setEditing(true);
    setError("");
    setFieldErrors({});
  };

  const cancelEdit = () => {
    setForm({ ...snapshot });
    setOwners(ownerSnap.map((o) => ({ ...o })));
    setFinalOwners(finalOwnerSnap.map((o) => ({ ...o })));
    setDirectors(directorSnap.map((o) => ({ ...o })));
    setSpecPerms(specPermSnap.map((o) => ({ ...o })));
    setSelDirs(selDirSnap.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setExtraFiles([...extraSnap]);
    setExtraFileUrls([...extraUrlSnap]);
    setEditing(false);
    setError("");
    setFieldErrors({});
  };

  // ── API helper ───────────────────────────────────────────────
  const doSave = async (extraFormFields?: Record<string, string>) => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSaving(false);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
    fd.append("beneficial_owners", JSON.stringify(owners));
    fd.append("final_beneficial_owners", JSON.stringify(finalOwners));
    fd.append("executive_directors", JSON.stringify(directors));
    fd.append("special_permissions", JSON.stringify(specPerms));
    Object.entries(files).forEach(([k, f]) => fd.append(k, f as File));
    fd.append("existing_extra_docs", JSON.stringify(extraFileUrls));
    extraFiles.forEach((f, i) => fd.append(`extra_doc_${i}`, f as File));
    fd.append("extra_doc_count", String(extraFiles.length));
    if (extraFormFields)
      Object.entries(extraFormFields).forEach(([k, v]) => fd.append(k, v));

    try {
      const res = await fetch(`${API}/api/organizations/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");

      const updated = data.organization || data.user;
      setProfile((p: any) => ({ ...p, ...updated }));
      const f = buildForm(updated);
      setForm(f);
      setSnapshot(f);
      const withId = (arr: any[]) =>
        arr.map((p) => ({
          ...p,
          id: p.id || Math.random().toString(36).slice(2),
        }));

      const rawDirs = updated.activity_directions || [];
      const parsedDirs: SelDir[] =
        Array.isArray(rawDirs) &&
        rawDirs.length > 0 &&
        typeof rawDirs[0] === "object"
          ? rawDirs.map((d: any) => ({
              main_id: Number(d.main_id),
              sub_ids: (d.sub_ids || []).map(Number),
            }))
          : rawDirs.map((id: number) => ({ main_id: Number(id), sub_ids: [] }));
      setSelDirs(parsedDirs);
      setSelDirSnap(parsedDirs);

      setOwners(
        updated.beneficial_owners?.length
          ? updated.beneficial_owners
          : [{ ...BLANK_OWNER }],
      );
      setOwnerSnap(
        updated.beneficial_owners?.length
          ? updated.beneficial_owners
          : [{ ...BLANK_OWNER }],
      );
      setFinalOwners(
        updated.final_beneficial_owners?.length
          ? updated.final_beneficial_owners
          : [{ ...BLANK_FINAL }],
      );
      setFinalOwnerSnap(
        updated.final_beneficial_owners?.length
          ? updated.final_beneficial_owners
          : [{ ...BLANK_FINAL }],
      );
      setDirectors(
        updated.executive_directors?.length
          ? updated.executive_directors
          : [{ ...BLANK_EXEC }],
      );
      setDirectorSnap(
        updated.executive_directors?.length
          ? updated.executive_directors
          : [{ ...BLANK_EXEC }],
      );
      setSpecPerms(
        updated.special_permissions?.length
          ? withId(updated.special_permissions) // ✅
          : [{ ...BLANK_PERM, id: Math.random().toString(36).slice(2) }],
      );
      setSpecPermSnap(
        updated.special_permissions?.length
          ? withId(updated.special_permissions) // ✅
          : [{ ...BLANK_PERM, id: Math.random().toString(36).slice(2) }],
      );

      const newUrls = Array.isArray(updated.extra_documents)
        ? updated.extra_documents
        : extraFileUrls;
      setExtraFileUrls(newUrls);
      setExtraUrlSnap(newUrls);
      setExtraFiles([]);
      setExtraSnap([]);

      const p: Record<string, string> = { ...previews };
      if (updated.company_logo_url) p.company_logo = updated.company_logo_url;
      if (updated.doc_state_registry_url)
        p.doc_state_registry = updated.doc_state_registry_url;
      if (updated.doc_vat_certificate_url)
        p.doc_vat_certificate = updated.doc_vat_certificate_url;
      if (updated.doc_special_permission_url)
        p.doc_special_permission = updated.doc_special_permission_url;
      if (updated.doc_contract_url) p.doc_contract = updated.doc_contract_url;
      if (updated.doc_company_intro_url)
        p.doc_company_intro = updated.doc_company_intro_url;
      setPreviews(p);

      // ✅ localStorage + event
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
        window.dispatchEvent(new Event("user-updated"));
      } catch {}

      setSaved(true);
      setEditing(false);
      setShowSubmitModal(false);
      setFiles({});
      if (!profile?.company_name && !extraFormFields?.status)
        setShowSuccessModal(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Validation хийсэн хадгалах
  const handleSave = async () => {
    if (
      form.company_name !== snapshot.company_name &&
      !isMongolian(form.company_name)
    ) {
      setFieldErrors((p) => ({ ...p, company_name: "Крилл үсгээр бичнэ үү" }));
      setError("Байгууллагын нэр монгол үсгээр бичнэ үү");
      return;
    }
    if (form.register_number && form.register_number.length !== 7) {
      setFieldErrors((p) => ({
        ...p,
        register_number: "7 оронтой тоо оруулна уу",
      }));
      setError("Регистрийн дугаар 7 оронтой байх ёстой");
      return;
    }
    const errs = validateMongolianForm(form, [
      "sum_duureg",
      ...(form.aimag_niislel !== "Улаанбаатар" ? ["bag_horoo" as const] : []),
    ]);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError(Object.values(errs)[0]);
      return;
    }
    const ownerErrs = validateOwnersMongolian(owners);
    if (Object.keys(ownerErrs).length > 0) {
      setOwnerFieldErrors(ownerErrs);
      return;
    }
    const dirErrors: Record<string, string> = {};
    directors.forEach((d: any, idx: number) => {
      if (d.position && !/^[\u0400-\u04FF\s\-]+$/.test(d.position))
        dirErrors[`${idx}_position`] = "Крилл үсгээр бичнэ үү";
      if (d.last_name && !/^[\u0400-\u04FF\s\-]+$/.test(d.last_name))
        dirErrors[`${idx}_last_name`] = "Крилл үсгээр бичнэ үү";
      if (d.first_name && !/^[\u0400-\u04FF\s\-]+$/.test(d.first_name))
        dirErrors[`${idx}_first_name`] = "Крилл үсгээр бичнэ үү";
      if (d.phone && (!/^\d+$/.test(d.phone) || d.phone.length !== 8))
        dirErrors[`${idx}_phone`] = "8 оронтой тоо оруулна уу";
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
        dirErrors[`${idx}_email`] = "И-мэйл хаяг буруу байна";
    });
    if (Object.keys(dirErrors).length > 0) {
      setDirectorFieldErrors(dirErrors);
      setError("Гүйцэтгэх захирлын мэдээлэл буруу байна");
      return;
    }
    setOwnerFieldErrors({});
    setFieldErrors({});
    setDirectorFieldErrors({});
    setError("");
    await doSave();
  };

  // Draft хадгалах — validation хийхгүй
  const handleSaveDraft = () => doSave();
  // Илгээх товч
  const handleSubmitClick = () => setShowSubmitModal(true);
  // Modal-аас илгээх
  const handleConfirmSubmit = () => doSave({ status: "pending" });

  const isNewUser = !profile?.company_name;
  const pct = (() => {
    const fields = [
      form.company_name,
      form.register_number,
      form.company_type,
      form.established_date,
      form.aimag_niislel,
      form.sum_duureg,
      form.address,
      owners[0]?.last_name,
      owners[0]?.first_name,
      owners[0]?.phone,
      form.bank_name,
      form.bank_account_number,
    ];
    const extras = [selDirs.length > 0, !!previews.doc_state_registry].filter(
      Boolean,
    ).length;
    return Math.min(
      100,
      Math.round(
        ((fields.filter(Boolean).length + extras) / (fields.length + 2)) * 100,
      ),
    );
  })();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <Loader2
          size={22}
          style={{ color: "#6366f1", animation: "spin .8s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const g2 = isMobile ? "1fr" : "1fr 1fr";
  const g3 = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const g4 = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr";
  const gDoc = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";
  const gAddr = isMobile ? "1fr" : "1fr 2fr";
  const gPerm = isMobile ? "1fr" : "2fr 1fr 1fr auto";

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 32,
        paddingLeft: isMobile ? 8 : 0,
        paddingRight: isMobile ? 8 : 0,
      }}
    >
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#f1f5f9; border-radius:99px; }
  ::-webkit-scrollbar-thumb { background:#0072BC; border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:#005a96; }
      `}</style>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal
          missing={getMissingFields()}
          onConfirm={handleConfirmSubmit}
          onClose={() => setShowSubmitModal(false)}
          saving={saving}
        />
      )}

      {/* Sticky bar */}
      {editing && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            animation: "fadeIn .2s ease",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            border: "1px solid #e2e8f0",
            borderRadius: isMobile ? 10 : 14,
            padding: isMobile ? "10px 12px" : "12px 18px",
            display: "flex",
            flexDirection: isMobile ? "column" : ("row" as any),
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: 10,
            boxShadow: "0 4px 20px rgba(99,102,241,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {isNewUser ? "Мэдээлэл бөглөх" : "Засварлаж байна"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: isMobile ? "flex-end" : "flex-start",
            }}
          >
            {!isNewUser && (
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: isMobile ? "8px 12px" : "8px 16px",
                  borderRadius: 9,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <X size={13} /> Болих
              </button>
            )}
            {/* Хадгалах */}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: isMobile ? "8px 14px" : "8px 16px",
                borderRadius: 9,
                border: "1.5px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Save size={13} /> Хадгалах
            </button>
            {/* Илгээх */}
            <button
              onClick={handleSubmitClick}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: isMobile ? "8px 16px" : "8px 20px",
                borderRadius: 9,
                border: "none",
                background: "#0072BC",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                fontFamily: "inherit",
                flex: isMobile ? 1 : ("none" as any),
                justifyContent: "center",
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Send size={13} /> Илгээх
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <HeroCard
        profile={profile}
        previews={previews}
        editing={editing}
        onFile={onFile}
        startEdit={startEdit}
        pct={pct}
        isNewUser={isNewUser}
        extraButtons={
          !editing && !isNewUser ? (
            <button
              onClick={handleSubmitClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: "#0072BC",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              <Send size={13} /> Илгээх
            </button>
          ) : null
        }
      />

      {profile?.status === "returned" && (
        <div
          style={{
            borderRadius: 14,
            border: "1.5px solid #fecaca",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: profile?.return_reason
                ? "1px solid #fecaca"
                : "none",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                Бүртгэл буцаагдсан байна
              </div>
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 1 }}>
                Доорх шалтгааныг уншаад мэдээллээ засаад хадгална уу
              </div>
            </div>
          </div>
          {profile?.return_reason && (
            <div style={{ padding: "14px 16px", background: "#fff5f5" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "#dc2626",
                  marginBottom: 8,
                }}
              >
                Буцаасан шалтгаан
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#7f1d1d",
                  lineHeight: 1.7,
                  background: "white",
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: "1px solid #fecaca",
                  whiteSpace: "pre-wrap" as const,
                }}
              >
                {profile.return_reason}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#b91c1c",
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>→</span>
                <span>
                  Мэдээллээ засаад <strong>"Хадгалах"</strong> товчийг дарна уу
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <Alert type="error" msg={error} />}
      {saved && <Alert type="success" msg="Амжилттай хадгаллаа" />}

      {/* 1. Байгууллагын үндсэн мэдээлэл */}
      <Section icon={Building2} title="БАЙГУУЛЛАГЫН ҮНДСЭН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Байгууллагын нэр *"
            value={form.company_name}
            editing={editing}
            onChange={(v: string) => {
              F("company_name", v);
              setFieldErrors((p) => ({
                ...p,
                company_name:
                  v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
              }));
            }}
            fieldError={fieldErrors.company_name}
          />
          <FInput
            label="Байгууллагын нэр англи"
            value={form.company_name_en}
            editing={editing}
            onChange={(v: string) => F("company_name_en", v)}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Регистрийн дугаар *"
            value={form.register_number}
            editing={editing}
            onChange={(v: string) => {
              const digits = v.replace(/\D/g, "").slice(0, 7);
              F("register_number", digits);
              setFieldErrors((p) => ({
                ...p,
                register_number:
                  digits && digits.length < 7 ? "7 оронтой тоо оруулна уу" : "",
              }));
            }}
            fieldError={fieldErrors.register_number}
            mono
          />
          <FSelect
            label="Байгууллагын хэлбэр"
            value={form.company_type}
            editing={editing}
            onChange={(v: string) => F("company_type", v)}
            options={[
              "ХХК",
              "ХХК/ГХО",
              "ХК",
              "Холбоо",
              "Хоршоо",
              "ТББ",
              "Сан",
              "Нөхөрлөл",
            ]}
          />
          <RadioGroup
            label="НӨАТ төлөгч"
            value={form.is_vat_payer}
            editing={editing}
            onChange={(v: any) => F("is_vat_payer", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
          <FInput
            label="Үүсгэн байгуулагдсан огноо"
            value={form.established_date}
            editing={editing}
            onChange={(v: string) => F("established_date", v)}
            type="date"
          />
        </div>
      </Section>

      {/* 2. Гүйцэтгэх захирал */}
      <ExecutiveDirectorsSection
        directors={directors}
        setDirectors={setDirectors}
        editing={editing}
        fieldErrors={directorFieldErrors}
        setFieldErrors={setDirectorFieldErrors}
      />

      {/* 3. Үйл ажиллагаа */}
      <Section icon={Briefcase} title="ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ">
        

        <div
          style={{
            display: "grid",
            gridTemplateColumns: g3,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ marginBottom: 14 }}>
  <FSelect
    label="Нийлүүлэх төрөл *"
    value={form.supply_direction}
    editing={editing}
    onChange={(v: string) => F("supply_direction", v)}
    options={[
      { value: "goods",   label: "Бараа" },
      { value: "service", label: "Үйлчилгээ" },
      { value: "both",    label: "Хоёулаа" },
    ]}
    placeholder="Сонгоно уу"
  />
</div>
          <FInput
            label="Ажилчдын тоо"
            value={form.employee_count}
            editing={editing}
            onChange={(v: string) => F("employee_count", v)}
            placeholder="0"
          />
          <RadioGroup
            label="ISO сертификаттай эсэх"
            value={form.is_iso_certified}
            editing={editing}
            onChange={(v: any) => F("is_iso_certified", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              display: "block",
              marginBottom: 8,
            }}
          >
            Үйл ажиллагааны тайлбар
          </label>
          {editing ? (
            <textarea
              value={form.activity_description}
              onChange={(e) => F("activity_description", e.target.value)}
              rows={3}
              placeholder="Байгууллагын үйл ажиллагаа, чиглэл, туршлагыг товч тайлбарлана уу..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                resize: "vertical" as const,
                fontFamily: "inherit",
                lineHeight: 1.6,
                transition: "border-color .15s",
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#6366f1")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
              }
            />
          ) : (
            <div
              style={{
                fontSize: 13,
                color: form.activity_description ? "#1e293b" : "#cbd5e1",
                padding: "10px 0",
                lineHeight: 1.6,
                borderBottom: "1px solid #f1f5f9",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {form.activity_description || "—"}
            </div>
          )}
        </div>

        <div style={{ marginBottom: form.has_special_permission ? 12 : 0 }}>
          <RadioGroup
            label="Тусгай зөвшөөрөлтэй эсэх"
            value={form.has_special_permission}
            editing={editing}
            onChange={(v: any) => F("has_special_permission", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>

        {form.has_special_permission && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 14,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              marginTop: 8,
            }}
          >
            <div style={{ overflowX: isMobile ? "auto" : ("visible" as any) }}>
              <div style={{ minWidth: isMobile ? 480 : "auto" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: gPerm,
                    gap: 10,
                    paddingBottom: 6,
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {[
                    "Тусгай зөвшөөрлийн төрөл",
                    "Дугаар",
                    "Хүчинтэй хугацаа",
                    "",
                  ].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#94a3b8",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {specPerms.map((perm: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: gPerm,
                      gap: 10,
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "white",
                      border: "1px solid #e2e8f0",
                      marginTop: 8,
                    }}
                  >
                    {/* ✅ type_id-г value болгоно */}
                    <FSelect
                      label=""
                      value={
                        perm.type_id !== null && perm.type_id !== undefined
                          ? String(perm.type_id)
                          : ""
                      }
                      editing={editing}
                      onChange={(v: string) => {
                        const found = permTypes.find(
                          (t: any) => String(t.id) === v,
                        );
                        setSpecPerms((p) =>
                          p.map((x, i) =>
                            i !== idx
                              ? x
                              : {
                                  ...x,
                                  type_id: found ? found.id : null, // ✅ number хэлбэрээр хадгална
                                  type_label: found ? found.label : "",
                                },
                          ),
                        );
                      }}
                      options={permTypes.map((t: any) => ({
                        value: String(t.id),
                        label: t.label,
                      }))}
                      placeholder="Төрөл сонгох"
                    />

                    <FInput
                      label=""
                      value={perm.number || ""}
                      editing={editing}
                      onChange={(v: string) =>
                        setSpecPerms((p) =>
                          p.map((x, i) =>
                            i !== idx ? x : { ...x, number: v },
                          ),
                        )
                      }
                      placeholder="Дугаар"
                    />

                    <FInput
                      label=""
                      type="date"
                      value={perm.expiry || ""}
                      editing={editing}
                      onChange={(v: string) =>
                        setSpecPerms((p) =>
                          p.map((x, i) =>
                            i !== idx ? x : { ...x, expiry: v },
                          ),
                        )
                      }
                    />

                    {editing && specPerms.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSpecPerms((p) => p.filter((_, i) => i !== idx))
                        }
                        style={{
                          padding: "7px 12px",
                          borderRadius: 8,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#ef4444",
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        Устгах
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {editing && (
              <button
                type="button"
                onClick={() =>
                  setSpecPerms((p) => [
                    ...p,
                    {
                      _key: Date.now(),
                      type_id: null,
                      type_label: "",
                      number: "",
                      expiry: "",
                    },
                  ])
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1.5px dashed #0072BC",
                  background: "#0072BC1A",
                  color: "#0072BC",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "#e0e7ff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "#eef2ff")
                }
              >
                + Тусгай зөвшөөрлийн төрөл нэмэх
              </button>
            )}
          </div>
        )}
      </Section>

      {/* 4. Хаяг */}
      <Section icon={MapPin} title="ХАЯГИЙН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FSelect
            label="Аймаг / Нийслэл"
            value={form.aimag_niislel}
            editing={editing}
            onChange={(v: string) => {
              F("aimag_niislel", v);
              F("sum_duureg", "");
              F("bag_horoo", "");
              setFieldErrors((p) => ({ ...p, sum_duureg: "", bag_horoo: "" }));
            }}
            options={AIMAG}
            placeholder="Сонгох"
          />
          {form.aimag_niislel === "Улаанбаатар" ? (
            <FSelect
              label="Дүүрэг"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
              }}
              options={Object.keys(UB_DUUREG)}
              placeholder="Дүүрэг сонгох"
            />
          ) : (
            <FSelect
              label="Сум"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
              }}
              options={
                form.aimag_niislel && AIMAG_SUM[form.aimag_niislel]
                  ? AIMAG_SUM[form.aimag_niislel]
                  : []
              }
              placeholder={
                form.aimag_niislel ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"
              }
            />
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: gAddr, gap: 14 }}>
          {form.aimag_niislel === "Улаанбаатар" &&
          form.sum_duureg &&
          UB_DUUREG[form.sum_duureg] ? (
            <FSelect
              label="Хороо"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => F("bag_horoo", v)}
              options={UB_DUUREG[form.sum_duureg]}
              placeholder="Хороо сонгох"
            />
          ) : (
            <FInput
              label="Баг / Хороо"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => {
                F("bag_horoo", v);
                setFieldErrors((p) => ({
                  ...p,
                  bag_horoo:
                    v && !/^[\u0400-\u04FF\s\d\-\/\.]+$/.test(v)
                      ? "Крилл үсэг, тоо оруулна уу"
                      : "",
                }));
              }}
              fieldError={fieldErrors.bag_horoo}
            />
          )}
          <FInput
            label="Дэлгэрэнгүй хаяг"
            value={form.address}
            editing={editing}
            onChange={(v: string) => F("address", v)}
          />
        </div>
      </Section>

      {/* 5. Эзэмшигч */}
      <OwnersSection
        owners={owners}
        setOwners={setOwners}
        editing={editing}
        fieldErrors={ownerFieldErrors}
        setFieldErrors={setOwnerFieldErrors}
      />

      {/* 6. Баримт бичиг */}
      <Section icon={FileText} title="КОМПАНИЙН БАРИМТ БИЧГИЙН ХУУЛБАР">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gDoc,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <DocUpload
            label="Улсын бүртгэлийн гэрчилгээ"
            fieldKey="doc_state_registry"
            preview={previews.doc_state_registry}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
          <DocUpload
            label="НӨАТ-ын гэрчилгээ"
            fieldKey="doc_vat_certificate"
            preview={previews.doc_vat_certificate}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
          <DocUpload
            label="Тусгай зөвшөөрөл"
            fieldKey="doc_special_permission"
            preview={previews.doc_special_permission}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              display: "block",
              marginBottom: 10,
            }}
          >
            Нэмэлт баримт бичиг
          </label>
          {extraFileUrls.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {extraFileUrls.map((url, i) => {
                const name = decodeURIComponent(
                  url.split("/").pop()?.split("?")[0] || `Файл ${i + 1}`,
                );
                return (
                  <div
                    key={`url-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "#f0fdf4",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <FileText
                      size={14}
                      style={{ color: "#059669", flexShrink: 0 }}
                    />
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#059669",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {name}
                    </a>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#6ee7b7",
                        fontWeight: 600,
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      ✓ Хадгалагдсан
                    </span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() =>
                          setExtraFileUrls((p) => p.filter((_, j) => j !== i))
                        }
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 6,
                          padding: "3px 8px",
                          cursor: "pointer",
                          fontSize: 11,
                          color: "#ef4444",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        Хасах
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {extraFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {extraFiles.map((f, i) => (
                <div
                  key={`new-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <FileText
                    size={14}
                    style={{ color: "#f59e0b", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "#1e293b",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {f.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#f59e0b",
                      fontWeight: 600,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {(f.size / 1024).toFixed(0)} KB · Хадгалагдаагүй
                  </span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() =>
                        setExtraFiles((p) => p.filter((_, j) => j !== i))
                      }
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 6,
                        padding: "3px 8px",
                        cursor: "pointer",
                        fontSize: 11,
                        color: "#ef4444",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Хасах
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editing && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: "1.5px dashed #0072BC",
                background: "#0072BC1A",
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#e0e7ff")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#eef2ff")
              }
            >
              <Plus size={14} style={{ color: "#0072BC" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0072BC" }}>
                Файл нэмэх
              </span>
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  if (newFiles.some((f) => f.size > 10 * 1024 * 1024)) {
                    alert("10MB-аас хэтэрсэн файл байна");
                    return;
                  }
                  setExtraFiles((p) => [...p, ...newFiles]);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          {!editing &&
            extraFileUrls.length === 0 &&
            extraFiles.length === 0 && (
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>—</div>
            )}
        </div>
      </Section>

      {/* 7. Санхүүгийн мэдээлэл */}
      <Section icon={CreditCard} title="САНХҮҮГИЙН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: g2,
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Банкны нэр"
            value={form.bank_name}
            editing={editing}
            onChange={(v: string) => F("bank_name", v)}
          />
          <FInput
            label="Дансны дугаар"
            value={form.bank_account_number}
            editing={editing}
            onChange={(v: string) => F("bank_account_number", v)}
            mono
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g4, gap: 14 }}>
          <FInput
            label="НӨАТ дугаар"
            value={form.vat_number}
            editing={editing}
            onChange={(v: string) => F("vat_number", v)}
            mono
          />
          <FInput
            label="SWIFT код"
            value={form.swift_code}
            editing={editing}
            onChange={(v: string) => F("swift_code", v)}
            mono
          />
          <FInput
            label="IBAN"
            value={form.iban}
            editing={editing}
            onChange={(v: string) => F("iban", v)}
            mono
          />
          <FSelect
            label="Валют"
            value={form.currency}
            editing={editing}
            onChange={(v: string) => F("currency", v)}
            options={[
              { value: "MNT", label: "₮ Төгрөг" },
              { value: "USD", label: "$ Доллар" },
              { value: "EUR", label: "€ Евро" },
            ]}
          />
        </div>
      </Section>

      {/* 8. Мэдэгдлийн тохиргоо */}
      <Section icon={Bell} title="МЭДЭГДЭЛ ХҮЛЭЭН АВАХ ХЭЛБЭР">
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              display: "block",
              marginBottom: 12,
            }}
          >
            Худалдан авалтын зарын мэдэгдэл хүлээн авах
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                value: "all",
                icon: "🔔",
                label: "Бүх үйл ажиллагааны чиглэлээр хүлээн авах",
                desc: "Системд нийтлэгдсэн бүх зарын мэдэгдлийг хүлээн авна",
              },
              {
                value: "selected_dirs",
                icon: "🎯",
                label: "Сонгосон үйл ажиллагааны чиглэлээр хүлээн авах",
                desc: "Үйл ажиллагааны чиглэлтээс сонгосон зарын мэдэгдлийг л хүлээн авна",
              },
            ].map((opt) => {
              const isOn = form.notification_preference === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() =>
                    editing && F("notification_preference", opt.value)
                  }
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    cursor: editing ? "pointer" : "default",
                    border: isOn
                      ? "1.5px solid #0072BC"
                      : "1.5px solid #0072BC33",
                    background: isOn ? "#0072BC1A" : "white",
                    transition: "all .15s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      marginTop: 1,
                      border: isOn ? "2px solid #0072BC" : "2px solid #e2e8f0",
                      background: isOn ? "#0072BC" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isOn && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{opt.icon}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isOn ? "#0072BC" : "#0f172a",
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        lineHeight: 1.5,
                      }}
                    >
                      {opt.desc}
                    </div>
                    {opt.value === "selected_dirs" && isOn && (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 5,
                        }}
                      >
                        {selDirs.length === 0 ? (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#f59e0b",
                              fontWeight: 500,
                            }}
                          >
                            ⚠️ Үйл ажиллагааны чиглэл сонгоогүй байна
                          </span>
                        ) : (
                          selDirs.map((sel) => {
                            const main = dirs.find(
                              (d) => Number(d.id) === Number(sel.main_id),
                            );
                            return main ? (
                              <span
                                key={sel.main_id}
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#4f46e5",
                                  background: "#eef2ff",
                                  border: "1px solid #c7d2fe",
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                }}
                              >
                                {main.label}
                              </span>
                            ) : null;
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📧</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                И-мэйл мэдэгдэл
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                {profile?.email || "И-мэйл хаяг байхгүй"}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 99,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            Идэвхтэй
          </div>
        </div>
      </Section>

      {/* Bottom save bar */}
      {editing && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: isMobile ? "12px" : "16px 20px",
            background: "white",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            boxShadow: "0 -4px 20px rgba(99,102,241,0.08)",
            flexDirection: isMobile ? "column" : ("row" as any),
          }}
        >
          {!isNewUser && (
            <button
              onClick={cancelEdit}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <X size={14} /> Болих
            </button>
          )}
          {/* Хадгалах */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 24px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flex: isMobile ? 1 : ("none" as any),
            }}
          >
            <Save size={14} /> Хадгалах
          </button>
          {/* Илгээх */}
          <button
            onClick={handleSubmitClick}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#4f46e5,#6366f1)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              flex: isMobile ? 1 : ("none" as any),
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin .8s linear infinite" }}
                />{" "}
                Илгээж байна...
              </>
            ) : (
              <>
                <Send size={14} /> Илгээх
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? 0 : 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : 420,
              background: "white",
              borderRadius: isMobile ? "20px 20px 0 0" : 24,
              padding: isMobile ? "28px 20px 40px" : 36,
              textAlign: "center",
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              animation: "fadeIn .3s ease",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 32,
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 10px",
              }}
            >
              Бүртгэл амжилттай!
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#64748b",
                lineHeight: 1.7,
                margin: "0 0 24px",
              }}
            >
              Таны бүртгэл амжилттай дууслаа.
              <br />
              Администратор таны бүртгэлийг хянах болно.
              <br />
              Удахгүй буцаад хариу өгнө.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {["Бүртгэл", "Хянагдаж байна", "Баталгаажна"].map((step, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background:
                          i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      {i === 0 ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color:
                          i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 24,
                        height: 2,
                        borderRadius: 99,
                        marginBottom: 16,
                        background: i === 0 ? "#10b981" : "#e2e8f0",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              Ойлголоо
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
