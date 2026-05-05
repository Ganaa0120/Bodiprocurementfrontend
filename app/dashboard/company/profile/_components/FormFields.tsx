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

const S = {
  label: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#475569",  // ✅ илүү тодорхой
    display: "block" as const,
    marginBottom: 6,
  } as React.CSSProperties,
};

// Field error pill
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div
      data-error="true"
      className="has-error"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginTop: 5,
        padding: "3px 8px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
        maxWidth: "100%",
      }}
    >
      <span style={{ fontSize: 10, color: "#ef4444", flexShrink: 0 }}>✕</span>
      <span
        style={{
          fontSize: 11,
          color: "#dc2626",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}
      >
        {msg}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FInput
// ─────────────────────────────────────────────────────────────
export function FInput({
  label,
  value,
  onChange,
  editing,
  type = "text",
  placeholder,
  mono = false,
  fieldError,
  disabled,
}: any) {
  const [focused, setFocused] = useState(false);
  const display = type === "date" && !editing ? fmtDate(value) : value;

  return (
    <div style={{ minWidth: 0 }}>
      {label && <label style={S.label}>{label}</label>}
      {editing ? (
        <div>
          <input
            type={type}
            value={value}
            onChange={(e) => !disabled && onChange(e.target.value)}
            placeholder={placeholder || ""}
            disabled={disabled}
            onFocus={() => {
              if (!disabled) setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box" as const,
              fontFamily: mono ? "monospace" : "inherit",
              transition: "border-color .15s, background .15s",
              color: disabled ? "#94a3b8" : "#0f172a",  // ✅ илүү тод
              background: disabled
                ? "#f8fafc"
                : fieldError
                  ? "#fff5f5"
                  : "white",
              cursor: disabled ? "not-allowed" : "text",
              border: fieldError
                ? "1.5px solid #ef4444"
                : disabled
                  ? "1.5px solid #e2e8f0"
                  : focused
                    ? "1.5px solid #4f46e5"  // ✅ indigo focus
                    : "1.5px solid #cbd5e1",  // ✅ илүү цайвар border
            }}
          />
          {/* ✅ Placeholder өнгө CSS-ээр */}
          <style>{`
            input::placeholder {
              color: #a0aec0 !important;
              font-size: 12px;
              font-weight: 400;
              opacity: 1;
            }
          `}</style>
          <FieldError msg={fieldError} />
          {disabled && (
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
              🔒 Өөрчлөх боломжгүй
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: display ? "#0f172a" : "#94a3b8",
            padding: "10px 0",
            borderBottom: "1px solid #e2e8f0",
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

// ─────────────────────────────────────────────────────────────
// FSelect
// ─────────────────────────────────────────────────────────────
export function FSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  editing,
  fieldError,
  disabled,
}: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    dropUp: false,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    if (disabled) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropUp = r.bottom + 280 > window.innerHeight;
      setCoords({
        top: dropUp ? r.top - 4 : r.bottom + 4,
        left: r.left,
        width: r.width,
        dropUp,
      });
    }
    setSearch("");
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
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

  const filtered = options.filter((o: any) => {
    const l = (o.label ?? o) as string;
    return l.toLowerCase().includes(search.toLowerCase());
  });

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
  const showSearch = options.length > 10;

  return (
    <div data-fselect="true" style={{ minWidth: 0 }}>
      {label && <label style={S.label}>{label}</label>}
      {editing ? (
        <>
          <button
            ref={btnRef}
            type="button"
            onClick={handleOpen}
            disabled={disabled}
            style={{
              width: "100%",
              padding: "9px 32px 9px 12px",
              borderRadius: 10,
              border: fieldError
                ? "1.5px solid #ef4444"
                : open
                  ? "1.5px solid #4f46e5"
                  : "1.5px solid #cbd5e1",  // ✅ илүү цайвар border
              background: fieldError
                ? "#fff5f5"
                : disabled
                  ? "#f8fafc"
                  : "white",
              fontSize: 13,
              color: value ? "#0f172a" : "#94a3b8",
              textAlign: "left" as const,
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box" as const,
              overflow: "hidden",
              transition: "border-color .15s, background .15s",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
                flex: 1,
                minWidth: 0,
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
          <FieldError msg={fieldError} />
          {disabled && (
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
              🔒 Өөрчлөх боломжгүй
            </div>
          )}

          {open &&
            !disabled &&
            typeof window !== "undefined" &&
            createPortal(
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
                  maxWidth: "min(90vw, 480px)",
                  zIndex: 99999,
                  background: "white",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: 300,
                }}
              >
                {showSearch && (
                  <div
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid #f1f5f9",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        style={{
                          position: "absolute",
                          left: 9,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        ref={searchRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Хайх..."
                        style={{
                          width: "100%",
                          padding: "7px 10px 7px 28px",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                          outline: "none",
                          background: "#fafafa",
                          boxSizing: "border-box" as const,
                          fontFamily: "inherit",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#4f46e5")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: 2,
                            display: "flex",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <style>{`
                      input::placeholder {
                        color: #a0aec0 !important;
                        font-size: 11px;
                      }
                    `}</style>
                  </div>
                )}

                <div style={{ overflowY: "auto", flex: 1 }}>
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

                  {filtered.length === 0 ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        color: "#94a3b8",
                        textAlign: "center" as const,
                      }}
                    >
                      "{search}" олдсонгүй
                    </div>
                  ) : (
                    filtered.map((o: any) => {
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
                          title={l}
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
                            if (!isSel) {
                              e.currentTarget.style.background = "#f8fafc";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSel) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap" as const,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {l}
                          </span>
                          {isSel && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "#4f46e5",
                                flexShrink: 0,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {showSearch && search && (
                  <div
                    style={{
                      padding: "6px 14px",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: 11,
                      color: "#94a3b8",
                      flexShrink: 0,
                    }}
                  >
                    {filtered.length} үр дүн
                  </div>
                )}
              </div>,
              document.body,
            )}
        </>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: value ? "#0f172a" : "#94a3b8",
            padding: "10px 0",
            borderBottom: "1px solid #e2e8f0",
            fontWeight: value ? 500 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}
          title={displayLabel}
        >
          {displayLabel}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RadioGroup
// ─────────────────────────────────────────────────────────────
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
                  ? "1.5px solid #4f46e5"
                  : "1.5px solid #cbd5e1",
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