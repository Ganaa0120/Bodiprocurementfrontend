"use client";
import { Section } from "./Section";
import { FInput, FSelect } from "./FormFields";
import { User } from "lucide-react";
import { BLANK_OWNER, BLANK_EXEC } from "./constants";
import { useEffect, useState } from "react";

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

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: 12,
        borderRadius: 12,
        border: "1.5px dashed #0072BC",
        background: "#0072BC1A",
        color: "#0072BC",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        width: "100%",
        transition: "all .15s",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "#e0e7ff")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "#eef2ff")
      }
    >
      + {label}
    </button>
  );
}

function OwnerCard({
  idx,
  label,
  editing,
  owner,
  fieldErrors,
  canRemove,
  onRemove,
  onUpdate,
}: any) {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;
  const isFirst = idx === 0;

  const gOwner = isFirst
    ? isMobile
      ? "1fr"
      : isTablet
        ? "1fr 1fr"
        : "1fr 1fr 1fr 1fr 1fr"
    : isMobile
      ? "1fr"
      : "1fr 1fr";

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: idx % 2 === 0 ? "#f8fafc" : "#f1f5f9",
        border: "1px solid #e2e8f0",
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
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#0072BC",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {idx === 0 ? "Үндсэн эзэмшигч" : `${idx + 1}-р ${label}`}
        </span>
        {canRemove && editing && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              fontSize: 11,
              color: "#ef4444",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Устгах
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: gOwner, gap: 14 }}>
        {isFirst ? (
          <>
            <FInput
              label="Овог"
              value={owner.last_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "last_name", v)}
              fieldError={fieldErrors?.[`${idx}_last_name`]}
            />
            <FInput
              label="Нэр"
              value={owner.first_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "first_name", v)}
              fieldError={fieldErrors?.[`${idx}_first_name`]}
            />
            <FSelect
              label="Хүйс"
              value={owner.gender}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "gender", v)}
              options={[
                { value: "male", label: "Эрэгтэй" },
                { value: "female", label: "Эмэгтэй" },
              ]}
              placeholder="Сонгох"
            />
            <FInput
              label="Албан тушаал"
              value={owner.position}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "position", v)}
            />
            <FInput
              label="Утас"
              value={owner.phone}
              editing={editing}
              onChange={(v: string) =>
                onUpdate(idx, "phone", v.replace(/\D/g, "").slice(0, 8))
              }
              fieldError={fieldErrors?.[`${idx}_phone`]}
            />
          </>
        ) : (
          <>
            <FInput
              label="Овог"
              value={owner.last_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "last_name", v)}
            />
            <FInput
              label="Нэр"
              value={owner.first_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "first_name", v)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function OwnersSection({
  owners,
  setOwners,
  editing,
  fieldErrors,
  setFieldErrors,
}: any) {
  const update = (idx: number, key: string, val: string) =>
    setOwners((p: any[]) =>
      p.map((o, i) => (i === idx ? { ...o, [key]: val } : o)),
    );

  return (
    <Section icon={User} title="ӨМЧЛӨГЧИЙН МЭДЭЭЛЭЛ">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {owners.map((owner: any, idx: number) => (
          <OwnerCard
            key={idx}
            idx={idx}
            label="эзэмшигч"
            editing={editing}
            owner={owner}
            fieldErrors={fieldErrors}
            canRemove={owners.length > 1}
            onRemove={() =>
              setOwners((p: any[]) => p.filter((_, i) => i !== idx))
            }
            onUpdate={update}
          />
        ))}
        {editing && (
          <AddBtn
            onClick={() => setOwners((p: any[]) => [...p, { ...BLANK_OWNER }])}
            label="Эзэмшигч нэмэх"
          />
        )}
      </div>
    </Section>
  );
}

export function ExecutiveDirectorsSection({
  directors,
  setDirectors,
  editing,
  fieldErrors = {},
  setFieldErrors,
}: any) {
  const w = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;
  const gDir = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr 1fr";

  const update = (idx: number, key: string, val: string) => {
    setDirectors((p: any[]) =>
      p.map((o, i) => (i === idx ? { ...o, [key]: val } : o)),
    );
    const k = `${idx}_${key}`;
    let msg = "";
    if (["position", "last_name", "first_name"].includes(key)) {
      if (val && !/^[\u0400-\u04FF\s\-]+$/.test(val))
        msg = "Крилл үсгээр бичнэ үү";
    }
    if (key === "phone") {
      if (val && (!/^\d+$/.test(val) || val.length !== 8))
        msg = "8 оронтой тоо оруулна уу";
    }
    if (key === "email") {
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        msg = "И-мэйл хаяг буруу байна";
    }
    setFieldErrors?.((p: any) => ({ ...p, [k]: msg }));
  };

  return (
    <Section icon={User} title="ГҮЙЦЭТГЭХ ЗАХИРАЛ">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {directors.map((d: any, idx: number) => (
          <div
            key={idx}
            style={{
              padding: 16,
              borderRadius: 12,
              background: idx % 2 === 0 ? "#f8fafc" : "#f1f5f9",
              border: "1px solid #e2e8f0",
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
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0072BC",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                }}
              >
                {idx === 0 ? "Гүйцэтгэх захирал" : ""}
              </span>
              {directors.length > 1 && editing && (
                <button
                  type="button"
                  onClick={() =>
                    setDirectors((p: any[]) => p.filter((_, i) => i !== idx))
                  }
                  style={{
                    fontSize: 11,
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 8,
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Устгах
                </button>
              )}
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: gDir, gap: 14 }}
            >
              <FInput
                label="Албан тушаал"
                value={d.position}
                editing={editing}
                onChange={(v: string) => update(idx, "position", v)}
                fieldError={fieldErrors[`${idx}_position`]}
                disabled={idx === 0}
              />
              <FInput
                label="Овог"
                value={d.last_name}
                editing={editing}
                onChange={(v: string) => update(idx, "last_name", v)}
                fieldError={fieldErrors[`${idx}_last_name`]}
              />
              <FInput
                label="Нэр"
                value={d.first_name}
                editing={editing}
                onChange={(v: string) => update(idx, "first_name", v)}
                fieldError={fieldErrors[`${idx}_first_name`]}
              />
              <FInput
                label="Утас"
                value={d.phone}
                editing={editing}
                onChange={(v: string) =>
                  update(idx, "phone", v.replace(/\D/g, "").slice(0, 8))
                }
                fieldError={fieldErrors[`${idx}_phone`]}
              />
              <FInput
                label="И-мэйл хаяг"
                value={d.email}
                editing={editing}
                onChange={(v: string) => update(idx, "email", v)}
                fieldError={fieldErrors[`${idx}_email`]}
              />
            </div>
          </div>
        ))}
        {editing && (
          <AddBtn
            onClick={() =>
              setDirectors((p: any[]) => [
                ...p,
                { ...BLANK_EXEC, position: "" },
              ])
            }
            label="Мөр нэмэх"
          />
        )}
      </div>
    </Section>
  );
}
