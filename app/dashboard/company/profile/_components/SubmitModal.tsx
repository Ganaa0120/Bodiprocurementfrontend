"use client";
import { Loader2, Send } from "lucide-react";

interface Props {
  missing: { key: string; label: string }[];
  onConfirm: () => void;
  onClose: () => void;
  saving: boolean;
}

export function SubmitModal({ missing, onConfirm, onClose, saving }: Props) {
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
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
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
                  background: "linear-gradient(135deg,#0072BC,#3b9be0)",
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
                  <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} />
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
                  <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>✕</span>
                  <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>
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