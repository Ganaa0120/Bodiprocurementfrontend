"use client";
import { Loader2, X, Save, Send } from "lucide-react";
import { useBreakpoint } from "./useW";

interface Props {
  variant: "sticky" | "bottom";
  isNewUser: boolean;
  saving: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function SaveBar({
  variant,
  isNewUser,
  saving,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Props) {
  const { isMobile } = useBreakpoint();

  // Buttons are shared between both variants — just differ slightly in padding
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
            cursor: "pointer",
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
          cursor: "pointer",
          fontFamily: "inherit",
          flex: variant === "bottom" && isMobile ? 1 : ("none" as const),
        }}
      >
        <Save size={variant === "sticky" ? 13 : 14} /> Хадгалах
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
          opacity: saving ? 0.7 : 1,
          fontFamily: "inherit",
          boxShadow: variant === "bottom" ? "0 4px 14px rgba(0,114,188,0.35)" : "none",
          flex: isMobile ? 1 : ("none" as const),
        }}
      >
        {saving ? (
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
          zIndex: 50,
          animation: "fadeIn .2s ease",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          border: "1px solid #e2e8f0",
          borderRadius: isMobile ? 10 : 14,
          padding: isMobile ? "10px 12px" : "12px 18px",
          display: "flex",
          flexDirection: isMobile ? "column" : ("row" as const),
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: 10,
          boxShadow: "0 4px 20px rgba(0,114,188,0.12)",
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
        {Buttons}
      </div>
    );
  }

  // ── Bottom variant ──────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        padding: isMobile ? "12px" : "16px 20px",
        background: "white",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 -4px 20px rgba(0,114,188,0.08)",
        flexDirection: isMobile ? "column" : ("row" as const),
      }}
    >
      {Buttons}
    </div>
  );
}