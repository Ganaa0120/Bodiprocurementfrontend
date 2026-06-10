"use client";
// ════════════════════════════════════════════════════════════════
//  Имэйл урилга — Тусгай зөвшөөрөл + хүлээн авагч ГАР АРГААР сонгох
//  (зөвхөн нээлттэй тендер дээр parent-аас рендерлэгдэнэ)
//
//  Логик:
//   • Permission / чиглэлээр жагсаалтыг ШҮҮНЭ (хоосон бол бүгд харагдана)
//   • Компани / хувь хүнийг checkbox-оор СОНГОНО
//   • Зөвхөн сонгосон хүнд урилга илгээгдэнэ (backend сонгосон ID-г унших ёстой)
// ════════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { X, Loader2, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { Field } from "./annModal.ui";
import { innerInputStyle } from "./annModal.config";
import type { AnnForm } from "./annModal.config";

export function InvitationSection({
  form,
  setForm,
  accentColor,
  permTypes,
  invCompanies,
  invPersons,
  invLoading,
}: {
  form: AnnForm;
  setForm: React.Dispatch<React.SetStateAction<AnnForm>>;
  accentColor: string;
  permTypes: any[];
  invCompanies: any[];
  invPersons: any[];
  invLoading: boolean;
}) {
  const [permSearch, setPermSearch] = useState("");

  // ── Тусгай зөвшөөрлийн filter ──
  const filteredPermTypes = permSearch.trim()
    ? permTypes.filter((t: any) =>
        t.label?.toLowerCase().includes(permSearch.toLowerCase()),
      )
    : permTypes;

  const togglePerm = (label: string) => {
    setForm((p: any) => ({
      ...p,
      invitation_permission_types: p.invitation_permission_types.includes(label)
        ? p.invitation_permission_types.filter((x: string) => x !== label)
        : [...p.invitation_permission_types, label],
    }));
  };

  // ── Харагдах pool — permission/direction-аар НАРИЙСГАНА (хоосон бол бүгд) ──
  const visibleInvCompanies = useMemo(() => {
    const invPerms = form.invitation_permission_types;
    const annDirIds = (form.activity_directions as any[]).map((d: any) =>
      Number(d.main_id),
    );
    return invCompanies.filter((c: any) => {
      let dirOK = true;
      if (annDirIds.length > 0) {
        const userDirs = Array.isArray(c.activity_directions)
          ? c.activity_directions.map((d: any) => Number(d?.main_id ?? d))
          : [];
        dirOK = annDirIds.some((ad) => userDirs.includes(ad));
      }
      let permOK = true;
      if (invPerms.length > 0) {
        permOK =
          Array.isArray(c.special_permissions) &&
          c.special_permissions.some(
            (sp: any) =>
              sp?.type_label?.trim() && invPerms.includes(sp.type_label.trim()),
          );
      }
      return dirOK && permOK;
    });
  }, [invCompanies, form.activity_directions, form.invitation_permission_types]);

  const visibleInvPersons = useMemo(() => {
    // Тусгай зөвшөөрлийн filter байвал хувь хүн харагдахгүй
    if (form.invitation_permission_types.length > 0) return [];
    const annDirIds = (form.activity_directions as any[]).map((d: any) =>
      Number(d.main_id),
    );
    return invPersons.filter((p: any) => {
      if (annDirIds.length === 0) return true;
      const userDirs = Array.isArray(p.activity_directions)
        ? p.activity_directions.map((d: any) => Number(d?.main_id ?? d))
        : [];
      return annDirIds.some((ad) => userDirs.includes(ad));
    });
  }, [invPersons, form.activity_directions, form.invitation_permission_types]);

  // ── Сонголтын toggle ──
  const toggleInvCompany = (id: string) =>
    setForm((p: any) => ({
      ...p,
      invitation_company_ids: p.invitation_company_ids.includes(id)
        ? p.invitation_company_ids.filter((x: string) => x !== id)
        : [...p.invitation_company_ids, id],
    }));

  const toggleInvPerson = (id: string) =>
    setForm((p: any) => ({
      ...p,
      invitation_person_ids: p.invitation_person_ids.includes(id)
        ? p.invitation_person_ids.filter((x: string) => x !== id)
        : [...p.invitation_person_ids, id],
    }));

  const allVisibleSelected =
    visibleInvCompanies.length + visibleInvPersons.length > 0 &&
    visibleInvCompanies.every((c: any) =>
      form.invitation_company_ids.includes(String(c.id)),
    ) &&
    visibleInvPersons.every((p: any) =>
      form.invitation_person_ids.includes(String(p.id)),
    );

  const toggleSelectAllVisible = () =>
    setForm((p: any) =>
      allVisibleSelected
        ? { ...p, invitation_company_ids: [], invitation_person_ids: [] }
        : {
            ...p,
            invitation_company_ids: visibleInvCompanies.map((c: any) =>
              String(c.id),
            ),
            invitation_person_ids: visibleInvPersons.map((x: any) =>
              String(x.id),
            ),
          },
    );

  // Жижиг checkbox
  const Check = ({ on }: { on: boolean }) => (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        flexShrink: 0,
        background: on ? accentColor : "rgba(255,255,255,0.05)",
        border: on
          ? `1px solid ${accentColor}`
          : "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {on && <CheckCircle2 size={12} color="white" />}
    </div>
  );

  // Сонгосон хүлээн авагчийн мөр
  const RecipientRow = ({
    icon,
    name,
    email,
    selected,
    onClick,
  }: {
    icon: string;
    name: string;
    email: string;
    selected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
        border: "none",
        background: selected ? `${accentColor}15` : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <Check on={selected} />
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: selected ? "white" : "#cbd5e1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#94a3b8",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          📧 {email || "имэйлгүй"}
        </div>
      </div>
    </button>
  );

  const totalVisible = visibleInvCompanies.length + visibleInvPersons.length;
  const totalSelected =
    form.invitation_company_ids.length + form.invitation_person_ids.length;

  return (
    <Field
      label="Имэйл урилга — хүлээн авагч сонгох"
      icon={ShieldCheck}
      hint="заавал биш — сонгосон компани/хувь хүнд урилга илгээнэ"
    >
      {/* Тайлбар */}
      <div
        style={{
          fontSize: 11,
          color: "#cbd5e1",
          lineHeight: 1.55,
          padding: "8px 12px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: 8,
          border: "1px solid rgba(99,102,241,0.2)",
          marginBottom: 10,
        }}
      >
        💡 Доороос урих <b>компани / хувь хүнээ сонгоно</b>. Тусгай зөвшөөрөл
        эсвэл чиглэлээр жагсаалтыг шүүж болно. Хэнийг ч сонгохгүй бол урилга
        илгээхгүй — зөвхөн ердийн нийтэлсэн зар явна.
      </div>

      {/* Сонгогдсон permission chips */}
      {form.invitation_permission_types.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 8,
            padding: "8px 10px",
            background: `${accentColor}10`,
            borderRadius: 8,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {form.invitation_permission_types.map((label: string) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 4px 3px 10px",
                borderRadius: 30,
                background: accentColor,
                color: "white",
                fontSize: 10,
                fontWeight: 600,
                maxWidth: 240,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
              <button
                type="button"
                onClick={() => togglePerm(label)}
                style={{
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  borderRadius: "50%",
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Permission хайлт */}
      <input
        value={permSearch}
        onChange={(e) => setPermSearch(e.target.value)}
        placeholder={
          permTypes.length > 0
            ? `🔍 ${permTypes.length} зөвшөөрлөөс шүүх...`
            : "🔍 Шүүх..."
        }
        style={innerInputStyle}
      />

      {/* Permission жагсаалт */}
      <div
        style={{
          marginTop: 8,
          maxHeight: 160,
          overflowY: "auto",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {permTypes.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Тусгай зөвшөөрлийн төрөл ачаалагдаагүй
          </div>
        ) : filteredPermTypes.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              fontSize: 11,
              color: "#64748b",
            }}
          >
            "{permSearch}" хайлтад тохирох олдсонгүй
          </div>
        ) : (
          filteredPermTypes.map((t: any) => {
            const selected = form.invitation_permission_types.includes(t.label);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => togglePerm(t.label)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: selected ? `${accentColor}15` : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  fontSize: 12,
                  color: selected ? accentColor : "#cbd5e1",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <Check on={selected} />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={t.label}
                >
                  {t.label}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* ── ХҮЛЭЭН АВАГЧ СОНГОХ ── */}
      <div
        style={{
          marginTop: 12,
          background: `${accentColor}08`,
          border: `1px solid ${accentColor}30`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Header — select all + count */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: `1px solid ${accentColor}20`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: `${accentColor}12`,
          }}
        >
          <Send size={14} style={{ color: accentColor, flexShrink: 0 }} />
          <div
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: 700,
              color: accentColor,
            }}
          >
            📨 Сонгосон: {form.invitation_company_ids.length} компани +{" "}
            {form.invitation_person_ids.length} хувь хүн
          </div>
          {totalVisible > 0 && !invLoading && (
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              style={{
                fontSize: 10,
                padding: "4px 12px",
                borderRadius: 30,
                background: allVisibleSelected
                  ? `${accentColor}25`
                  : "rgba(255,255,255,0.05)",
                border: allVisibleSelected
                  ? `1px solid ${accentColor}50`
                  : "1px solid rgba(255,255,255,0.1)",
                color: allVisibleSelected ? accentColor : "#94a3b8",
                cursor: "pointer",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {allVisibleSelected ? "Бүгдийг арилгах" : "Бүгдийг сонгох"}
            </button>
          )}
        </div>

        {/* Жагсаалт */}
        {invLoading ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            <Loader2
              size={14}
              style={{
                animation: "spin 0.8s linear infinite",
                display: "inline",
                verticalAlign: "middle",
                marginRight: 6,
              }}
            />
            Ачаалж байна...
          </div>
        ) : totalVisible === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            Тохирох хэрэглэгч олдсонгүй
          </div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: "auto", padding: "6px 10px" }}>
            {visibleInvCompanies.map((c: any) => (
              <RecipientRow
                key={`c-${c.id}`}
                icon="🏢"
                name={c.company_name || "—"}
                email={c.email}
                selected={form.invitation_company_ids.includes(String(c.id))}
                onClick={() => toggleInvCompany(String(c.id))}
              />
            ))}
            {visibleInvPersons.map((p: any) => {
              const name =
                `${p.last_name ?? ""} ${p.first_name ?? ""}`.trim() ||
                p.email ||
                "—";
              return (
                <RecipientRow
                  key={`p-${p.id}`}
                  icon="👤"
                  name={name}
                  email={p.email}
                  selected={form.invitation_person_ids.includes(String(p.id))}
                  onClick={() => toggleInvPerson(String(p.id))}
                />
              );
            })}
          </div>
        )}

        {/* Permission filter тайлбар */}
        {form.invitation_permission_types.length > 0 && (
          <div
            style={{
              padding: "6px 14px",
              fontSize: 10,
              color: "#94a3b8",
              borderTop: `1px solid ${accentColor}20`,
              background: "rgba(0,0,0,0.15)",
              fontStyle: "italic",
            }}
          >
            ⚠️ Тусгай зөвшөөрлийн filter сонгосон тул хувь хүмүүс жагсаалтад
            харагдахгүй
          </div>
        )}
      </div>
    </Field>
  );
}