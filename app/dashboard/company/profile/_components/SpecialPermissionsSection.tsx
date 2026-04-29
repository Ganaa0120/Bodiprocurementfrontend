"use client";
import { Dispatch, SetStateAction } from "react";
import { FInput, FSelect } from "./FormFields";
import { PermType, useBreakpoint } from "./useW";

interface Props {
  specPerms: any[];
  setSpecPerms: Dispatch<SetStateAction<any[]>>;
  permTypes: PermType[];
  editing: boolean;
}

export function SpecialPermissionsSection({
  specPerms,
  setSpecPerms,
  permTypes,
  editing,
}: Props) {
  const { isMobile } = useBreakpoint();

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    marginBottom: 4,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: isMobile ? 10 : 14,
        borderRadius: 12,
        background: "#f8fafc",
        border: "1px solid #f1f5f9",
        marginTop: 8,
      }}
    >
      {specPerms.map((perm: any, idx: number) => {
        const handleTypeChange = (v: string) => {
          const found = permTypes.find((t) => String(t.id) === v);
          setSpecPerms((p) =>
            p.map((x, i) =>
              i !== idx
                ? x
                : {
                    ...x,
                    type_id: found ? found.id : null,
                    type_label: found ? found.label : "",
                  },
            ),
          );
        };
        const handleNumberChange = (v: string) =>
          setSpecPerms((p) => p.map((x, i) => (i !== idx ? x : { ...x, number: v })));
        const handleExpiryChange = (v: string) =>
          setSpecPerms((p) => p.map((x, i) => (i !== idx ? x : { ...x, expiry: v })));
        const handleRemove = () =>
          setSpecPerms((p) => p.filter((_, i) => i !== idx));

        // ═══════════════════════════════════════════════════
        // MOBILE: CARD LAYOUT
        // ═══════════════════════════════════════════════════
        if (isMobile) {
          return (
            <div
              key={idx}
              style={{
                padding: 14,
                borderRadius: 10,
                background: "white",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 10,
                  marginBottom: 12,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#0072BC",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  Зөвшөөрөл #{idx + 1}
                </span>
                {editing && specPerms.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#ef4444",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Устгах
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={labelStyle}>Тусгай зөвшөөрлийн төрөл</div>
                <FSelect
                  label=""
                  value={
                    perm.type_id !== null && perm.type_id !== undefined
                      ? String(perm.type_id)
                      : ""
                  }
                  editing={editing}
                  onChange={handleTypeChange}
                  options={permTypes.map((t) => ({
                    value: String(t.id),
                    label: t.label,
                  }))}
                  placeholder="Төрөл сонгох"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div style={labelStyle}>Дугаар</div>
                  <FInput
                    label=""
                    value={perm.number || ""}
                    editing={editing}
                    onChange={handleNumberChange}
                    placeholder="Дугаар"
                  />
                </div>
                <div>
                  <div style={labelStyle}>Хугацаа</div>
                  <FInput
                    label=""
                    type="date"
                    value={perm.expiry || ""}
                    editing={editing}
                    onChange={handleExpiryChange}
                  />
                </div>
              </div>
            </div>
          );
        }

        // ═══════════════════════════════════════════════════
        // DESKTOP / TABLET: ROW LAYOUT
        // ═══════════════════════════════════════════════════
        return (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 130px 160px auto",
              gap: 10,
              alignItems: "end",
              padding: 12,
              borderRadius: 10,
              background: "white",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={labelStyle}>Тусгай зөвшөөрлийн төрөл</div>
              <FSelect
                label=""
                value={
                  perm.type_id !== null && perm.type_id !== undefined
                    ? String(perm.type_id)
                    : ""
                }
                editing={editing}
                onChange={handleTypeChange}
                options={permTypes.map((t) => ({
                  value: String(t.id),
                  label: t.label,
                }))}
                placeholder="Төрөл сонгох"
              />
            </div>

            <div>
              <div style={labelStyle}>Дугаар</div>
              <FInput
                label=""
                value={perm.number || ""}
                editing={editing}
                onChange={handleNumberChange}
                placeholder="Дугаар"
              />
            </div>

            <div>
              <div style={labelStyle}>Хүчинтэй хугацаа</div>
              <FInput
                label=""
                type="date"
                value={perm.expiry || ""}
                editing={editing}
                onChange={handleExpiryChange}
              />
            </div>

            <div>
              {editing && specPerms.length > 1 ? (
                <button
                  type="button"
                  onClick={handleRemove}
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
          </div>
        );
      })}

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
            ((e.currentTarget as HTMLElement).style.background = "#cce4f4")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#0072BC1A")
          }
        >
          + Тусгай зөвшөөрлийн төрөл нэмэх
        </button>
      )}
    </div>
  );
}