"use client";
import { fmtDate } from "@/app/dashboard/admin/_components/individuals/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const lbl: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: 6,
};
const base = (editing: boolean): React.CSSProperties => ({
  width: "100%",
  paddingTop: 9,
  paddingBottom: 9,
  paddingLeft: editing ? 12 : 0,
  paddingRight: 12,
  borderRadius: 10,
  fontSize: 13,
  outline: "none",
  border: editing ? "1.5px solid #e2e8f0" : "1.5px solid transparent",
  background: editing ? "white" : "transparent",
  color: "#0f172a",
  boxSizing: "border-box" as const,
  transition: "all .15s",
});
const fo = (e: any) =>
  ((e.target as HTMLElement).style.borderColor = "#6366f1");
const bl = (e: any) =>
  ((e.target as HTMLElement).style.borderColor = "#e2e8f0");

const S = {
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#94a3b8",
    display: "block" as const,
    marginBottom: 6,
  } as React.CSSProperties,
};

// FormFields.tsx — FInput функц
export function FInput({
  label,
  value,
  onChange,
  editing,
  type = "text",
  placeholder,
  mono = false,
  fieldError,
}: any) {
  const [focused, setFocused] = useState(false);
  const display = type === "date" && !editing ? fmtDate(value) : value;

  return (
    <div>
      {label && <label style={S.label}>{label}</label>}
      {editing ? (
        <div>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || ""}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              color: "#1e293b",
              outline: "none",
              boxSizing: "border-box" as const,
              fontFamily: mono ? "monospace" : "inherit",
              transition: "border-color .15s",
              // ✅ Алдаа байвал улаан, байхгүй бол хэвийн
              border: fieldError
                ? "1.5px solid #ef4444"
                : focused
                  ? "1.5px solid #6366f1"
                  : "1.5px solid #e2e8f0",
              background: fieldError ? "#fff5f5" : "white",
            }}
          />
          {/* ✅ Алдааны текст — input-ийн доор */}
          {fieldError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
              <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 500 }}>
                {fieldError}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: display ? "#1e293b" : "#cbd5e1",
            padding: "10px 0",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: display ? 500 : 400,
            fontFamily: mono ? "monospace" : "inherit",
            wordBreak: "break-word",
          }}
        >
          {display || "—"}
        </div>
      )}
    </div>
  );
}

export function FSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  editing,
}: any) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    dropUp: false,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // ✅ нэмнэ

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropUp = r.bottom + 240 > window.innerHeight;
      setCoords({
        top: dropUp ? r.top - 4 : r.bottom + 4,
        left: r.left,
        width: r.width,
        dropUp,
      });
    }
    setOpen((p) => !p);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      // ✅ btnRef болон dropdownRef хоёуланг шалгана
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const getDisplayLabel = () => {
    if (!value && value !== 0) return placeholder ?? "Сонгох";
    if (options.length === 0) return value;
    const found = options.find(
      (o: any) => String(o.value ?? o) === String(value),
    );
    if (!found) return value;
    return found?.label ?? found;
  };
  const displayLabel = getDisplayLabel();

  return (
    <div data-fselect="true">
      {label && <label style={lbl}>{label}</label>}
      {editing ? (
        <>
          <button
            ref={btnRef}
            type="button"
            onClick={handleOpen}
            style={{
              width: "100%",
              padding: "9px 32px 9px 12px",
              borderRadius: 10,
              border: open ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
              background: "white",
              fontSize: 13,
              color: value ? "#0f172a" : "#94a3b8",
              textAlign: "left" as const,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box" as const,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
              }}
            >
              {displayLabel}
            </span>
            <ChevronDown
              size={13}
              style={{
                color: "#94a3b8",
                flexShrink: 0,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .2s",
              }}
            />
          </button>

          {open &&
            typeof window !== "undefined" &&
            createPortal(
              // ✅ ref нэмнэ
              <div
                ref={dropdownRef}
                style={{
                  position: "fixed",
                  top: coords.dropUp ? "auto" : coords.top,
                  bottom: coords.dropUp
                    ? window.innerHeight - coords.top
                    : "auto",
                  left: coords.left,
                  width: coords.width,
                  zIndex: 99999,
                  background: "white",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {placeholder && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "9px 14px",
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: "#94a3b8",
                      textAlign: "left" as const,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {placeholder}
                  </button>
                )}
                {options.map((o: any) => {
                  const v = o.value ?? o;
                  const l = o.label ?? o;
                  const isSel = String(v) === String(value);
                  return (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => {
                        onChange(v);
                        setOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 14px",
                        border: "none",
                        background: isSel ? "#eef2ff" : "transparent",
                        fontSize: 13,
                        color: isSel ? "#4f46e5" : "#0f172a",
                        textAlign: "left" as const,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: isSel ? 600 : 400,
                        borderBottom: "1px solid #f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSel)
                          (e.currentTarget as HTMLElement).style.background =
                            "#f8f9ff";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSel)
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                      }}
                    >
                      {l}
                      {isSel && (
                        <span style={{ fontSize: 12, color: "#6366f1" }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )}
        </>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: value ? "#0f172a" : "#cbd5e1",
            padding: "10px 0",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: value ? 500 : 400,
          }}
        >
          {displayLabel}
        </div>
      )}
    </div>
  );
}

export function RadioGroup({ label, options, value, onChange, editing }: any) {
  return (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((o: any) => (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => editing && onChange(o.value)}
            style={{
              flex: 1,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 500,
              border:
                value === o.value
                  ? "1.5px solid #6366f1"
                  : "1.5px solid #e2e8f0",
              background:
                value === o.value
                  ? "#eef2ff"
                  : editing
                    ? "white"
                    : "transparent",
              color: value === o.value ? "#4f46e5" : "#64748b",
              cursor: editing ? "pointer" : "default",
              transition: "all .15s",
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
