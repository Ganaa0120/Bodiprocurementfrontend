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

// Strip non-Cyrillic chars and report to fieldErrors if anything was removed.
// Returns the cleaned value (always Cyrillic-only).
function filterCyrillic(
  raw: string,
  errKey: string,
  setFieldErrors: any,
): string {
  const cleaned = raw.replace(/[^\u0400-\u04FF\s\-]/g, "");
  if (raw !== cleaned) {
    // User typed/pasted non-Cyrillic chars — show warning
    setFieldErrors?.((p: any) => ({
      ...p,
      [errKey]: "Крилл үсгээр бичнэ үү",
    }));
  } else {
    // Clear any earlier "wrong char" warning
    setFieldErrors?.((p: any) => ({ ...p, [errKey]: "" }));
  }
  return cleaned;
}

// Same idea for digits-only fields (phone)
function filterDigits(
  raw: string,
  errKey: string,
  setFieldErrors: any,
  maxLen = 8,
): string {
  const cleaned = raw.replace(/\D/g, "").slice(0, maxLen);
  if (raw.replace(/\s/g, "") !== cleaned) {
    setFieldErrors?.((p: any) => ({
      ...p,
      [errKey]: "Зөвхөн тоо оруулна уу",
    }));
  } else if (cleaned && cleaned.length < maxLen) {
    setFieldErrors?.((p: any) => ({
      ...p,
      [errKey]: `${maxLen} оронтой тоо оруулна уу`,
    }));
  } else {
    setFieldErrors?.((p: any) => ({ ...p, [errKey]: "" }));
  }
  return cleaned;
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
        ((e.currentTarget as HTMLElement).style.background = "#cce4f4")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "#0072BC1A")
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

  // Required-only on first (primary) owner
  const star = isFirst ? " *" : "";

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
              label={`Овог${star}`}
              value={owner.last_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "last_name", v)}
              fieldError={fieldErrors?.[`${idx}_last_name`]}
            />
            <FInput
              label={`Нэр${star}`}
              value={owner.first_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "first_name", v)}
              fieldError={fieldErrors?.[`${idx}_first_name`]}
            />
            <FSelect
              label={`Хүйс${star}`}
              value={owner.gender}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "gender", v)}
              options={[
                { value: "male", label: "Эрэгтэй" },
                { value: "female", label: "Эмэгтэй" },
              ]}
              placeholder="Сонгох"
              fieldError={fieldErrors?.[`${idx}_gender`]}
            />
            <FInput
              label={`Албан тушаал${star}`}
              value={owner.position}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "position", v)}
              fieldError={fieldErrors?.[`${idx}_position`]}
            />
            <FInput
              label={`Утас${star}`}
              value={owner.phone}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "phone", v)}
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
              fieldError={fieldErrors?.[`${idx}_last_name`]}
            />
            <FInput
              label="Нэр"
              value={owner.first_name}
              editing={editing}
              onChange={(v: string) => onUpdate(idx, "first_name", v)}
              fieldError={fieldErrors?.[`${idx}_first_name`]}
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
  // Updater receives the RAW user input. We filter & warn here so the user
  // sees an immediate "Англиар биш, крилл үсгээр бичнэ үү" message when they
  // try to type a digit or Latin letter into a Cyrillic-only field.
  const update = (idx: number, key: string, raw: string) => {
    let value = raw;
    const errKey = `${idx}_${key}`;

    if (["last_name", "first_name", "position"].includes(key)) {
      value = filterCyrillic(raw, errKey, setFieldErrors);
    } else if (key === "phone") {
      value = filterDigits(raw, errKey, setFieldErrors, 8);
    } else if (key === "email") {
      value = raw;
      if (setFieldErrors) {
        const msg =
          raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
            ? "И-мэйл хаяг буруу байна"
            : "";
        setFieldErrors((p: any) => ({ ...p, [errKey]: msg }));
      }
    } else if (setFieldErrors) {
      // gender / other selects — clear any error
      setFieldErrors((p: any) => ({ ...p, [errKey]: "" }));
    }

    setOwners((p: any[]) =>
      p.map((o, i) => (i === idx ? { ...o, [key]: value } : o)),
    );
  };

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

  // Updater receives RAW input. Filter & warn happens centrally.
  const update = (idx: number, key: string, raw: string) => {
    let value = raw;
    const errKey = `${idx}_${key}`;

    if (["position", "last_name", "first_name"].includes(key)) {
      value = filterCyrillic(raw, errKey, setFieldErrors);
    } else if (key === "phone") {
      value = filterDigits(raw, errKey, setFieldErrors, 8);
    } else if (key === "email") {
      value = raw;
      const msg =
        raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
          ? "И-мэйл хаяг буруу байна"
          : "";
      setFieldErrors?.((p: any) => ({ ...p, [errKey]: msg }));
    }

    setDirectors((p: any[]) =>
      p.map((o, i) => (i === idx ? { ...o, [key]: value } : o)),
    );
  };

  return (
    <Section icon={User} title="ГҮЙЦЭТГЭХ ЗАХИРАЛ">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {directors.map((d: any, idx: number) => {
          const isFirst = idx === 0;
          const star = isFirst ? " *" : "";
          return (
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
                  {idx === 0 ? "Гүйцэтгэх захирал" : `${idx + 1}-р мөр`}
                </span>
                {directors.length > 1 && editing && (
                  <button
                    type="button"
                    onClick={() =>
                      setDirectors((p: any[]) =>
                        p.filter((_, i) => i !== idx),
                      )
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
                  label={`Албан тушаал${star}`}
                  value={d.position}
                  editing={editing}
                  onChange={(v: string) => update(idx, "position", v)}
                  fieldError={fieldErrors[`${idx}_position`]}
                  disabled={isFirst}
                />
                <FInput
                  label={`Овог${star}`}
                  value={d.last_name}
                  editing={editing}
                  onChange={(v: string) => update(idx, "last_name", v)}
                  fieldError={fieldErrors[`${idx}_last_name`]}
                />
                <FInput
                  label={`Нэр${star}`}
                  value={d.first_name}
                  editing={editing}
                  onChange={(v: string) => update(idx, "first_name", v)}
                  fieldError={fieldErrors[`${idx}_first_name`]}
                />
                <FInput
                  label={`Утас${star}`}
                  value={d.phone}
                  editing={editing}
                  onChange={(v: string) => update(idx, "phone", v)}
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
          );
        })}
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