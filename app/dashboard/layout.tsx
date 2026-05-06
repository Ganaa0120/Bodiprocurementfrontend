"use client";
import { useEffect, useState } from "react";
import { useAutoLogout } from "@/hooks/useAutoLogout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 30 минут идэвхгүй → автоматаар гарна, 1 минут өмнө сэрэмжлүүлэг
  useAutoLogout(30, 1);

  const [warning, setWarning] = useState<number | null>(null);

  // Сэрэмжлүүлэг toast харуулах
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setWarning(detail.remainingMinutes);

      // 60 секундийн дараа toast-ыг арилгана (logout болохоор автомат хаагдана)
      setTimeout(() => setWarning(null), 60_000);
    };
    window.addEventListener("auto-logout-warning", handler);
    return () => window.removeEventListener("auto-logout-warning", handler);
  }, []);

  return (
    <>
      {children}

      {/* Сэрэмжлүүлэг toast */}
      {warning !== null && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "linear-gradient(135deg,#dc2626,#ef4444)",
            color: "white",
            padding: "14px 20px",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(220,38,38,0.4)",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: 360,
            animation: "slideIn 0.3s ease",
          }}
        >
          <span style={{ fontSize: 20 }}>⏰</span>
          <div>
            <div style={{ marginBottom: 2 }}>
              {warning} минутын дараа автоматаар гарна
            </div>
            <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 400 }}>
              Үргэлжлүүлэхийн тулд хулгана хөдөлгөнө үү
            </div>
          </div>
          <button
            onClick={() => setWarning(null)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}