"use client";

import { useBreakpoint } from "./useW";


interface Props {
  onClose: () => void;
}

export function SuccessModal({ onClose }: Props) {
  const { isMobile } = useBreakpoint();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : 420,
          background: "white",
          borderRadius: isMobile ? "20px 20px 0 0" : 24,
          padding: isMobile ? "28px 20px 40px" : 36,
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          animation: "fadeIn .3s ease",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 32,
          }}
        >
          ✅
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
          Бүртгэл амжилттай!
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 24px" }}>
          Таны бүртгэл амжилттай дууслаа.
          <br />
          Администратор таны бүртгэлийг хянах болно.
          <br />
          Удахгүй буцаад хариу өгнө.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {["Бүртгэл", "Хянагдаж байна", "Баталгаажна"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {i === 0 ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: i === 0 ? "#10b981" : i === 1 ? "#f59e0b" : "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  {step}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: 24,
                    height: 2,
                    borderRadius: 99,
                    marginBottom: 16,
                    background: i === 0 ? "#10b981" : "#e2e8f0",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#0072BC,#3b9be0)",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(0,114,188,0.35)",
          }}
        >
          Ойлголоо
        </button>
      </div>
    </div>
  );
}