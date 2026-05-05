"use client";
import { Loader2, X, Save, Send } from "lucide-react";
import { useBreakpoint } from "./useW";

interface Props {
  variant: "sticky" | "bottom";
  isNewUser: boolean;
  saving: boolean;
  savingMode?: "draft" | "submit" | null;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function SaveBar({
  variant,
  isNewUser,
  saving,
  savingMode,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Props) {
  const { isMobile } = useBreakpoint();

  const isDraftSaving = saving && savingMode === "draft";
  const isSubmitSaving = saving && savingMode === "submit";

  const Buttons = (
    <div
      style={{
        display: "flex",
        gap: variant === "sticky" ? 8 : 10,
        justifyContent:
          variant === "bottom"
            ? "flex-end"
            : isMobile
              ? "flex-end"
              : "flex-start",
        flexDirection:
          variant === "bottom" && isMobile ? ("column" as const) : ("row" as const),
        width: variant === "bottom" && isMobile ? "100%" : "auto",
      }}
    >
      {!isNewUser && (
        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: variant === "sticky" ? 5 : 6,
            padding:
              variant === "sticky"
                ? isMobile
                  ? "8px 12px"
                  : "8px 16px"
                : "10px 20px",
            borderRadius: variant === "sticky" ? 9 : 10,
            border: "1px solid #e2e8f0",
            background: "white",
            color: "#64748b",
            fontSize: 13,
            fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          <X size={variant === "sticky" ? 13 : 14} /> Болих
        </button>
      )}

      <button
        onClick={onSaveDraft}
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: variant === "sticky" ? 5 : 6,
          padding:
            variant === "sticky"
              ? isMobile
                ? "8px 14px"
                : "8px 16px"
              : "10px 24px",
          borderRadius: variant === "sticky" ? 9 : 10,
          border: "1.5px solid #e2e8f0",
          background: "white",
          color: "#0f172a",
          fontSize: 13,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving && !isDraftSaving ? 0.5 : 1,
          fontFamily: "inherit",
          flex: variant === "bottom" && isMobile ? 1 : ("none" as const),
        }}
      >
        {isDraftSaving ? (
          <>
            <Loader2
              size={variant === "sticky" ? 13 : 14}
              style={{ animation: "spin .8s linear infinite" }}
            />{" "}
            Хадгалж байна...
          </>
        ) : (
          <>
            <Save size={variant === "sticky" ? 13 : 14} /> Хадгалах
          </>
        )}
      </button>

      <button
        onClick={onSubmit}
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: variant === "sticky" ? 5 : 6,
          padding:
            variant === "sticky"
              ? isMobile
                ? "8px 16px"
                : "8px 20px"
              : "10px 28px",
          borderRadius: variant === "sticky" ? 9 : 10,
          border: "none",
          background:
            variant === "sticky"
              ? "#0072BC"
              : "linear-gradient(135deg,#0072BC,#3b9be0)",
          color: "white",
          fontSize: 13,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving && !isSubmitSaving ? 0.5 : saving ? 0.85 : 1,
          fontFamily: "inherit",
          boxShadow: variant === "bottom" ? "0 4px 14px rgba(0,114,188,0.35)" : "none",
          flex: isMobile ? 1 : ("none" as const),
        }}
      >
        {isSubmitSaving ? (
          <>
            <Loader2
              size={variant === "sticky" ? 13 : 14}
              style={{ animation: "spin .8s linear infinite" }}
            />{" "}
            Илгээж байна...
          </>
        ) : (
          <>
            <Send size={variant === "sticky" ? 13 : 14} /> Илгээх
          </>
        )}
      </button>
    </div>
  );

  // ── Sticky variant ──────────────────────────────────────────
  if (variant === "sticky") {
    return (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: isMobile ? "8px 12px" : "10px 16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          marginTop: -8,
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap" as const,
        }}
      >
        {!isMobile && (
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            Засварын горим идэвхтэй байна
          </div>
        )}
        {Buttons}
      </div>
    );
  }

  // ── Bottom variant ──────────────────────────────────────────
  return (
    <div
      style={{
        marginTop: 8,
        padding: isMobile ? 14 : "16px 20px",
        background: "white",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
      }}
    >
      {!isMobile && (
        <div style={{ fontSize: 12, color: "#64748b" }}>
          <strong style={{ color: "#0f172a" }}>Хадгалах</strong> — мэдээллийг
          хадгална, илгээгдэхгүй ·{" "}
          <strong style={{ color: "#0072BC" }}>Илгээх</strong> — Бодьд
          шалгуулахаар явуулна
        </div>
      )}
      {Buttons}
    </div>
  );
}