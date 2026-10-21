"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { C } from "./styles";

export function IconButton({
  label,
  onClick,
  children,
  size = 34,
  disabled,
  active,
  style,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  size?: number;
  disabled?: boolean;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="bc-icon-btn"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: active ? C.blueSoft : "transparent",
        color: active ? C.blueText : C.muted,
        transition: "background .12s, color .12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  style,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  const palette =
    variant === "primary"
      ? { background: C.blue, color: "#fff", border: "1px solid transparent" }
      : variant === "danger"
        ? { background: C.redSoft, color: C.red, border: "1px solid rgba(239,68,68,0.25)" }
        : { background: "rgba(255,255,255,0.04)", color: C.text2, border: `1px solid ${C.border}` };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...palette,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "9px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled || loading ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {loading && <Loader2 size={14} className="bc-spin" />}
      {children}
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  width = 520,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "min(88vh, 760px)",
          display: "flex",
          flexDirection: "column",
          background: C.panel,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 18px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{title}</div>
          <IconButton label="Хаах" onClick={onClose} size={30}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="bc-scroll" style={{ padding: 18, overflowY: "auto", flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: "14px 18px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function useClickOutside(onOutside: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const h = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("touchstart", h);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("touchstart", h);
    };
  }, [onOutside, enabled]);
  return ref;
}

export function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className="bc-menu-item"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 12px",
        border: "none",
        background: "transparent",
        color: danger ? C.red : C.text2,
        fontSize: 13,
        textAlign: "left",
        borderRadius: 8,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export const menuBox: CSSProperties = {
  position: "absolute",
  zIndex: 50,
  minWidth: 190,
  padding: 5,
  background: C.raised,
  border: `1px solid ${C.borderStrong}`,
  borderRadius: 12,
  boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: "rgba(255,255,255,0.03)",
  color: C.text,
  fontSize: 13,
  outline: "none",
};

export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="bc-spin" style={{ color: C.muted }} />;
}
