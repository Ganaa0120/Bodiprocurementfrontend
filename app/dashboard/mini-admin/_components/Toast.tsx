import { CheckCircle2, AlertCircle } from "lucide-react";

export function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 200,
      padding: "12px 20px", borderRadius: 16,
      fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      background: ok
        ? "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))"
        : "linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))",
      color: "white",
      backdropFilter: "blur(12px)",
      animation: "fadeInUp 0.3s ease",
    }}>
      {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}